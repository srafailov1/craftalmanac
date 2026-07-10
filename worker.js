// worker.js — Craft Almanac
//
// The site is served as Cloudflare Workers static assets (see wrangler.jsonc).
// This Worker exists for ONE reason: to receive "Report an error" submissions
// from the site's report forms and deliver them to reports@craftalmanac.com via
// Cloudflare Email Sending, so a visitor can write from the site instead of
// being handed off to their mail app.
//
// Real static files are served by the assets layer BEFORE this Worker runs
// (run_worker_first defaults to false), so this fetch handler is only reached
// for paths with no matching asset. We handle POST /api/report and pass every
// other request straight to the static assets.
//
// Matching the site's "no account, no cookies, no tracking" stance, abuse
// control is a hidden honeypot field plus a server-side per-IP rate limit — no
// challenge script, no stored identifier, nothing that touches the visitor.

const REPORT_TO = "reports@craftalmanac.com";
const REPORT_FROM = { email: "noreply@craftalmanac.com", name: "Craft Almanac reports" };
const MAX_MESSAGE = 5000;
const MAX_FIELD = 300;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/report") {
      return handleReport(request, env, ctx);
    }
    // Not our endpoint — serve the static site exactly as before.
    // Beta only (wrangler.beta.jsonc sets BETA + run_worker_first): stamp
    // noindex so the workers.dev staging copy never competes with
    // craftalmanac.com in search. Production never sets BETA, and its asset
    // requests are served before this handler runs at all.
    if (env.BETA) {
      const response = await env.ASSETS.fetch(request);
      const headers = new Headers(response.headers);
      headers.set("x-robots-tag", "noindex");
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }
    return env.ASSETS.fetch(request);
  }
};

// The forms send a fetch()/JSON body when JS is on; a native form POST is the
// progressive-enhancement fallback when JS is off. Reply in kind: JSON for the
// scripted path, a small HTML page for the native submit.
function wantsJson(request, contentType) {
  return contentType.includes("application/json")
    || (request.headers.get("accept") || "").includes("application/json")
    || request.headers.get("x-requested-with") === "fetch";
}

async function handleReport(request, env, ctx) {
  const contentType = request.headers.get("content-type") || "";
  const asJson = wantsJson(request, contentType);

  if (request.method !== "POST") {
    return respond(asJson, 405, false, "Use POST to submit a report.");
  }

  let fields;
  try {
    if (contentType.includes("application/json")) {
      fields = await request.json();
    } else {
      const form = await request.formData();
      fields = Object.fromEntries(form.entries());
    }
  } catch {
    return respond(asJson, 400, false, "Could not read the submission.");
  }
  if (!fields || typeof fields !== "object") {
    return respond(asJson, 400, false, "Could not read the submission.");
  }

  const message = String(fields.message || "").trim();
  const email = String(fields.email || "").trim();
  const context = String(fields.context || "").trim().slice(0, MAX_FIELD);
  const page = String(fields.page || "").trim().slice(0, MAX_FIELD);
  const honeypot = String(fields.website || "").trim();

  // Honeypot: a person never sees or fills the hidden "website" field; bots that
  // auto-fill every input do. Pretend success so we don't teach them to adapt.
  if (honeypot) {
    return respond(asJson, 200, true, "Thank you, your report was sent.");
  }

  if (!message) {
    return respond(asJson, 400, false, "Please include a short message.");
  }
  if (message.length > MAX_MESSAGE) {
    return respond(asJson, 400, false, "That message is a little too long — please trim it.");
  }
  if (email && (email.length > MAX_FIELD || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))) {
    return respond(asJson, 400, false, "That email address doesn't look right.");
  }

  // Per-IP rate limit (best-effort; no cookie, no stored identifier). Fails open
  // if the binding is unavailable so a real report is never blocked by an outage.
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  if (env.REPORT_LIMITER) {
    try {
      const { success } = await env.REPORT_LIMITER.limit({ key: ip });
      if (!success) {
        return respond(asJson, 429, false, "That's a lot of reports at once — please wait a minute and try again.");
      }
    } catch { /* limiter unavailable: fall through rather than block a real report */ }
  }

  const country = request.headers.get("cf-ipcountry") || "";
  const subject = (context ? `Report: ${context}` : "Craft Almanac error report").slice(0, 200);
  const meta = [
    page ? `Page: ${page}` : "",
    context ? `Context: ${context}` : "",
    email ? `Reporter: ${email}` : "Reporter: (not provided)",
    country ? `Country: ${country}` : ""
  ].filter(Boolean).join("\n");
  const text = `${message}\n\n---\n${meta}`;
  const html = `<div style="font:15px/1.5 system-ui,-apple-system,sans-serif;color:#26302a">`
    + `<p style="white-space:pre-wrap;margin:0 0 1em">${escapeHtml(message)}</p>`
    + `<hr style="border:none;border-top:1px solid #d7ddce">`
    + `<p style="color:#6a7566;white-space:pre-wrap;font-size:13px;margin:1em 0 0">${escapeHtml(meta)}</p></div>`;

  // Hand the send to the runtime and reply immediately, so the visitor gets an
  // instant confirmation instead of waiting on the email service. The send keeps
  // running after the response; failures are logged (visible via `wrangler tail`)
  // rather than surfaced, since a report is best-effort.
  ctx.waitUntil(
    env.EMAIL.send({
      to: REPORT_TO,
      from: REPORT_FROM,
      ...(email ? { replyTo: email } : {}),
      subject,
      text,
      html
    }).catch((err) => {
      console.error("EMAIL.send failed:", (err && (err.stack || err.message)) || String(err));
    })
  );

  return respond(asJson, 200, true, "Thank you, your report was sent.");
}

function respond(asJson, status, ok, message) {
  if (asJson) {
    return new Response(JSON.stringify({ ok, message }), {
      status,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
    });
  }
  return new Response(htmlPage(ok, message), {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
  });
}

// No-JS fallback: a minimal confirmation page with a link back to the site.
function htmlPage(ok, message) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">`
    + `<meta name="viewport" content="width=device-width, initial-scale=1">`
    + `<title>${ok ? "Report sent" : "Report"} · Craft Almanac</title>`
    + `<style>body{font:16px/1.6 system-ui,-apple-system,sans-serif;max-width:34rem;`
    + `margin:12vh auto;padding:0 1.4rem;color:#26302a;background:#f1f5ec}`
    + `a{color:#4a6a2f}h1{font-size:1.3rem;font-weight:600}</style></head><body>`
    + `<h1>${ok ? "Thank you" : "Something went wrong"}</h1>`
    + `<p>${escapeHtml(message)}</p>`
    + `<p><a href="/">← Back to Craft Almanac</a></p></body></html>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}
