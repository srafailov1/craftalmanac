// One-time verification of the Phase 6 wind-canvas power/data heuristics.
// Slices fxStaticDisabled/fxBatterySaving/fxStart/fxStop/refreshWindCanvasPower
// out of app.js and runs them in a vm with stubbed globals (the migration's
// node-harness pattern). Not part of check.sh — scratch verification.
import { readFileSync } from "node:fs";
import vm from "node:vm";

const src = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const start = src.indexOf("function fxStaticDisabled(");
const end = src.indexOf("function initWindCanvas(");
if (start < 0 || end < 0 || end <= start) throw new Error("could not slice power fns");
const slice = src.slice(start, end);

function mm(map) {
  return (q) => ({ matches: !!(map && map[q]) });
}

function makeCtx(opts = {}) {
  const sandbox = {
    fxRafId: 0,
    fxBattery: opts.battery || null,
    fxLastTs: 0,
    fxCanvas: { width: 100, height: 100 },
    state: {},
    __cleared: 0,
    __rafCount: 0,
    fxFrame: () => {},
    requestAnimationFrame: () => { sandbox.__rafCount++; return 777; },
    cancelAnimationFrame: () => {},
    document: { hidden: !!opts.hidden },
    navigator: opts.navigator || {},
    window: { matchMedia: mm(opts.media) }
  };
  sandbox.fxCtx = { clearRect: () => { sandbox.__cleared++; } };
  vm.createContext(sandbox);
  vm.runInContext(slice, sandbox);
  return sandbox;
}

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log("PASS  " + name); }
  else { fail++; console.error("FAIL  " + name); }
}

// fxStaticDisabled — clean desktop
let c = makeCtx({ navigator: { hardwareConcurrency: 8, deviceMemory: 8 } });
check("clean desktop: not statically disabled", vm.runInContext("fxStaticDisabled()", c) === false);

check("reduced-motion -> disabled",
  vm.runInContext("fxStaticDisabled()", makeCtx({ media: { "(prefers-reduced-motion: reduce)": true }, navigator: { hardwareConcurrency: 8 } })) === true);
check("reduced-data -> disabled",
  vm.runInContext("fxStaticDisabled()", makeCtx({ media: { "(prefers-reduced-data: reduce)": true }, navigator: { hardwareConcurrency: 8 } })) === true);
check("Data Saver (saveData) -> disabled",
  vm.runInContext("fxStaticDisabled()", makeCtx({ navigator: { hardwareConcurrency: 8, connection: { saveData: true } } })) === true);
check("2 cores -> disabled",
  vm.runInContext("fxStaticDisabled()", makeCtx({ navigator: { hardwareConcurrency: 2, deviceMemory: 8 } })) === true);
check("1 GB deviceMemory -> disabled",
  vm.runInContext("fxStaticDisabled()", makeCtx({ navigator: { hardwareConcurrency: 8, deviceMemory: 1 } })) === true);
check("unknown hardware (no cores/mem) -> NOT disabled",
  vm.runInContext("fxStaticDisabled()", makeCtx({ navigator: {} })) === false);

// fxBatterySaving
check("battery low + unplugged -> saving",
  vm.runInContext("fxBatterySaving()", makeCtx({ battery: { charging: false, level: 0.15 } })) === true);
check("battery low but charging -> not saving",
  vm.runInContext("fxBatterySaving()", makeCtx({ battery: { charging: true, level: 0.15 } })) === false);
check("battery high unplugged -> not saving",
  vm.runInContext("fxBatterySaving()", makeCtx({ battery: { charging: false, level: 0.9 } })) === false);
check("no battery info -> not saving",
  vm.runInContext("fxBatterySaving()", makeCtx({})) === false);

// refreshWindCanvasPower start/stop behaviour
c = makeCtx({ navigator: { hardwareConcurrency: 8, deviceMemory: 8 } });
vm.runInContext("refreshWindCanvasPower()", c);
check("clean+visible: fxOn true and loop started", c.state.fxOn === true && c.fxRafId === 777 && c.__rafCount === 1);

c = makeCtx({ navigator: { hardwareConcurrency: 8 }, hidden: true });
vm.runInContext("refreshWindCanvasPower()", c);
check("hidden tab: loop not started, canvas cleared", c.fxRafId === 0 && c.__rafCount === 0 && c.__cleared >= 1);

c = makeCtx({ navigator: { hardwareConcurrency: 8, connection: { saveData: true } } });
vm.runInContext("refreshWindCanvasPower()", c);
check("Data Saver: fxOn false, loop stopped", c.state.fxOn === false && c.fxRafId === 0);

// battery drains while running -> stop
c = makeCtx({ navigator: { hardwareConcurrency: 8 } });
vm.runInContext("refreshWindCanvasPower()", c); // running
const wasRunning = c.fxRafId === 777;
c.fxBattery = { charging: false, level: 0.1 };
vm.runInContext("refreshWindCanvasPower()", c);
check("battery drains -> running loop stops", wasRunning && c.fxRafId === 0 && c.state.fxOn === false);

// double-start guard: calling refresh twice while clean doesn't stack rAFs
c = makeCtx({ navigator: { hardwareConcurrency: 8 } });
vm.runInContext("refreshWindCanvasPower(); refreshWindCanvasPower();", c);
check("idempotent start: only one rAF scheduled", c.__rafCount === 1 && c.fxRafId === 777);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
