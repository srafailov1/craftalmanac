#!/usr/bin/env python3
"""Generate the Round 3 deck: three site versions from contemporary web/UX
paradigms (not mission-filtered precedent research).

Round 3 widens the lens per the owner: research the sites the web-design
field itself celebrates, then design three versions of Craft Almanac --
map, plant cards, project recipes -- each on a different contemporary UX
paradigm. Graphic identity is deliberately decoupled from Round 2 worlds.

Usage: python3 docs/design/build_round3_deck.py
Output: docs/design/round-3-site-versions.pdf
"""

from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "round-3-site-versions.pdf"

PW, PH = 792, 612
M = 54

FONT_DIRS = {
    "Lora": "/usr/share/fonts/truetype/google-fonts/Lora-Variable.ttf",
    "Lora-Italic": "/usr/share/fonts/truetype/google-fonts/Lora-Italic-Variable.ttf",
    "Poppins": "/usr/share/fonts/truetype/google-fonts/Poppins-Regular.ttf",
    "Poppins-Medium": "/usr/share/fonts/truetype/google-fonts/Poppins-Medium.ttf",
    "Poppins-Bold": "/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf",
    "Lato": "/usr/share/fonts/truetype/lato/Lato-Regular.ttf",
    "Lato-Bold": "/usr/share/fonts/truetype/lato/Lato-Bold.ttf",
    "Lato-Black": "/usr/share/fonts/truetype/lato/Lato-Black.ttf",
    "Lato-Light": "/usr/share/fonts/truetype/lato/Lato-Light.ttf",
    "DejaVuMono": "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
}
for name, path in FONT_DIRS.items():
    pdfmetrics.registerFont(TTFont(name, path))


def C(h):
    return HexColor(h)


FOOTER = "CRAFT ALMANAC  /  SITE VERSIONS  /  ROUND 3"

# Version flavors (decoupled from Round 2 brand worlds on purpose)
VA = dict(key="A", name="Field Desk", para="THE INSTRUMENT",
          tagline="The map is the app. Everything else floats.",
          bg="#171B20", panel="#21262E", glass="#262C35", ink="#E8ECF1",
          sub="#97A1AD", hair="#323A45", accent="#5BD9A1", accent2="#7FB2F0")
VB = dict(key="B", name="The Long Season", para="THE STORY",
          tagline="You arrive mid-story. The scroll carries you.",
          bg="#FAF8F4", panel="#FFFFFF", ink="#23211C", sub="#6B655A",
          hair="#E3DED2", accent="#B4552D", accent2="#41633E")
VC = dict(key="C", name="Card Table", para="THE COLLECTION",
          tagline="Everything is a card you can pick up.",
          bg="#F2F1ED", panel="#FFFFFF", ink="#1F211F", sub="#62665F",
          hair="#DCDAD2", accent="#3E7C5B", accent2="#D9A521", accent3="#4C5FAF")


# ------------------------------------------------------------------- helpers

def wrap(c, text, font, size, width):
    words = text.split()
    lines, line = [], ""
    for w in words:
        t = (line + " " + w).strip()
        if pdfmetrics.stringWidth(t, font, size) <= width:
            line = t
        else:
            lines.append(line)
            line = w
    if line:
        lines.append(line)
    return lines


def block(c, x, y, text, font, size, width, leading, color):
    c.setFont(font, size)
    c.setFillColor(color)
    yy = y
    for ln in wrap(c, text, font, size, width):
        c.drawString(x, yy, ln)
        yy -= leading
    return yy


def page_start(c, ground, footer_color, num):
    c.setFillColor(C(ground))
    c.rect(0, 0, PW, PH, stroke=0, fill=1)
    c.setFont("DejaVuMono", 6.5)
    c.setFillColor(footer_color)
    c.drawString(M, 26, FOOTER)
    c.drawRightString(PW - M, 26, "%02d" % num)


def kicker(c, x, y, text, color, size=8):
    c.setFont("Lato-Bold", size)
    c.setFillColor(color)
    c.drawString(x, y, " ".join(list(text.upper())).replace("   ", "  "))


def hist(c, x, y, w, h, vals, color):
    n = len(vals)
    gap = w / n
    bw = gap * 0.66
    c.setFillColor(C(color) if isinstance(color, str) else color)
    for i, v in enumerate(vals):
        c.rect(x + i * gap + (gap - bw) / 2, y, bw, h * v, stroke=0, fill=1)


MONTH_VALS = [0.08, 0.10, 0.18, 0.34, 0.55, 0.72, 0.86, 1.0, 0.92, 0.66, 0.30, 0.12]


def glow_dot(c, x, y, r, color):
    col = C(color)
    for rr, a in [(r * 2.4, 0.08), (r * 1.6, 0.22), (r, 0.9)]:
        c.setFillColor(col)
        c.setFillAlpha(a)
        c.circle(x, y, rr, stroke=0, fill=1)
    c.setFillAlpha(1)


def browser(c, x, y, w, h, bg, hair, dark=False):
    """Browser window frame; returns content rect (cx, cy, cw, ch)."""
    bar_h = 22
    c.setFillColor(C(bg))
    c.setStrokeColor(C(hair))
    c.setLineWidth(0.9)
    c.roundRect(x, y, w, h, 8, stroke=1, fill=1)
    c.setFillColor(C("#2A2F37") if dark else C("#EFECE4"))
    c.roundRect(x, y + h - bar_h, w, bar_h, 8, stroke=0, fill=1)
    c.rect(x, y + h - bar_h, w, bar_h / 2, stroke=0, fill=1)
    for i, col in enumerate(["#E0604F", "#E3B341", "#58A065"]):
        c.setFillColor(C(col))
        c.circle(x + 14 + i * 13, y + h - bar_h / 2, 3.4, stroke=0, fill=1)
    c.setFillColor(C("#383F49") if dark else C("#FFFFFF"))
    c.roundRect(x + 60, y + h - bar_h + 4.5, w - 120, bar_h - 9, 4, stroke=0, fill=1)
    c.setFont("DejaVuMono", 5.8)
    c.setFillColor(C("#97A1AD") if dark else C("#9A958A"))
    c.drawCentredString(x + w / 2, y + h - bar_h + 9, "craftalmanac.org")
    return (x + 1, y + 1, w - 2, h - bar_h - 1)


def mini_map(c, x, y, w, h, dark=False, water=True):
    c.setFillColor(C("#10151A") if dark else C("#E9EDE4"))
    c.rect(x, y, w, h, stroke=0, fill=1)
    c.setStrokeColor(C("#1F2933") if dark else C("#D6DCCE"))
    c.setLineWidth(0.7)
    for i in range(3):
        yy = y + h * (0.25 + 0.25 * i)
        c.bezier(x + 8, yy, x + w * 0.35, yy + 14, x + w * 0.6, yy - 12, x + w - 8, yy + 6)
    if water:
        c.setStrokeColor(C("#27414B") if dark else C("#BBD0D6"))
        c.setLineWidth(1.6)
        c.bezier(x + w * 0.1, y + 6, x + w * 0.4, y + h * 0.5, x + w * 0.6, y + h * 0.3, x + w * 0.92, y + h - 8)


def chip(c, x, y, label, fg, bg, font="DejaVuMono", size=5.6, pad=5):
    tw = pdfmetrics.stringWidth(label, font, size)
    c.setFillColor(C(bg) if isinstance(bg, str) else bg)
    c.roundRect(x, y, tw + 2 * pad, size + 7, 3.5, stroke=0, fill=1)
    c.setFont(font, size)
    c.setFillColor(C(fg) if isinstance(fg, str) else fg)
    c.drawString(x + pad, y + 3.6, label)
    return tw + 2 * pad


def sprig(c, x, y, s, color, lw=1.0):
    c.setStrokeColor(C(color))
    c.setLineWidth(lw)
    c.line(x, y, x, y + s)
    for i in range(3):
        yy = y + s * (0.3 + 0.22 * i)
        dx = s * 0.22 * (1 - i * 0.18)
        c.bezier(x, yy, x - dx, yy + s * 0.05, x - dx, yy + s * 0.16, x - dx * 0.4, yy + s * 0.2)
        c.bezier(x, yy, x + dx, yy + s * 0.05, x + dx, yy + s * 0.16, x + dx * 0.4, yy + s * 0.2)
    c.circle(x, y + s, s * 0.05, stroke=1, fill=0)


# ================================================================== research

def p_cover(c):
    page_start(c, "#14171B", C("#6E7680"), 1)
    kicker(c, M, PH - 70, "CRAFT ALMANAC / DESIGN STUDY", C("#5BD9A1"))
    c.setFont("Lora", 30)
    c.setFillColor(C("#E8ECF1"))
    c.drawString(M, PH - 108, "Round 3 -- Three versions of the site")
    block(c, M, PH - 134,
          "A broad pass through contemporary web design -- the sites the field "
          "celebrates, regardless of subject -- applied to what this site must "
          "do: an interactive map, plant cards, and project recipes. Identity "
          "deliberately decoupled from Round 2; these are UX worlds.",
          "Lato-Light", 10.5, 520, 15, C("#97A1AD"))
    # three browser thumbs
    tw = (PW - 2 * M - 48) / 3.0
    th = 200
    y0 = 150
    # A
    cx, cy, cw, ch = browser(c, M, y0, tw, th, VA["bg"], "#3A424D", dark=True)
    mini_map(c, cx, cy, cw, ch, dark=True)
    glow_dot(c, cx + cw * 0.4, cy + ch * 0.55, 3, VA["accent"])
    c.setFillColor(C(VA["glass"]))
    c.setFillAlpha(0.92)
    c.roundRect(cx + cw * 0.28, cy + ch - 30, cw * 0.44, 16, 4, stroke=0, fill=1)
    c.setFillAlpha(1)
    c.setFont("DejaVuMono", 5.4)
    c.setFillColor(C(VA["sub"]))
    c.drawCentredString(cx + cw / 2, cy + ch - 25, "SEARCH . CMD-K")
    # B
    cx, cy, cw, ch = browser(c, M + tw + 24, y0, tw, th, VB["bg"], VB["hair"])
    c.setFont("Lora", 14)
    c.setFillColor(C(VB["ink"]))
    c.drawString(cx + 14, cy + ch - 34, "Week 24.")
    c.setFont("Lora-Italic", 9)
    c.setFillColor(C(VB["accent"]))
    c.drawString(cx + 14, cy + ch - 50, "The elder is in flower.")
    mini_map(c, cx + 12, cy + 14, cw - 24, ch * 0.42)
    c.setFillColor(C(VB["accent"]))
    c.rect(cx, cy, 3, ch * 0.8, stroke=0, fill=1)
    # C
    cx, cy, cw, ch = browser(c, M + 2 * (tw + 24), y0, tw, th, VC["bg"], VC["hair"])
    gx, gy = cx + 10, cy + 10
    gw = (cw - 30) / 2
    gh = (ch - 30) / 2
    for i, col in enumerate([VC["panel"], VC["panel"], VC["panel"], VC["panel"]]):
        r, q = divmod(i, 2)
        c.setFillColor(C(col))
        c.setStrokeColor(C(VC["hair"]))
        c.roundRect(gx + q * (gw + 10), gy + r * (gh + 10), gw, gh, 5, stroke=1, fill=1)
    mini_map(c, gx + 4, gy + gh + 14, gw - 8, gh - 8)
    c.setFillColor(C(VC["accent2"]))
    c.roundRect(gx + gw + 14, gy + 6, gw * 0.5, gh * 0.55, 4, stroke=0, fill=1)
    labels = [("A . FIELD DESK", VA["accent"]), ("B . THE LONG SEASON", VB["accent"]),
              ("C . CARD TABLE", VC["accent"])]
    for i, (lab, col) in enumerate(labels):
        c.setFont("Lato-Bold", 9)
        c.setFillColor(C(col))
        c.drawString(M + i * (tw + 24), y0 - 22, lab)
    c.setFont("Lora-Italic", 10.5)
    c.setFillColor(C("#97A1AD"))
    c.drawString(M, 86, "June 2026 . follows round-2-directions.pdf . wireframe fidelity, flavor only hinted")


def p_lens(c, num):
    page_start(c, "#F4F2EC", C("#8A857A"), num)
    ink, sub = C("#1F1D18"), C("#5C574C")
    kicker(c, M, PH - 78, "ROUND 3 / THE LENS", C("#B4552D"))
    c.setFont("Lora", 26)
    c.setFillColor(ink)
    c.drawString(M, PH - 112, "What the site must do, before any style")
    needs = [
        ("The map", "Lazy-loading occurrence data, three modes, access-status overlays, "
         "popups with rules. Must feel alive at first touch and stay fast at zoom 8+."),
        ("Plant cards", "One page per material: ID traits, season histogram, safety tags, "
         "harvest ethics, rules. Must cite cleanly in class and read well on a phone in the field."),
        ("Project recipes", "Step-by-step craft guides that bring materials together -- "
         "gather, prepare, make. Need a hands-busy mode: big steps, progress, no hunting."),
        ("Teaching + ethics constants", "Projector-friendly, printable, occurrence-is-not-"
         "permission placed prominently, safety colors semantic and fixed in every version."),
    ]
    y = PH - 148
    for head, body in needs:
        c.setFont("Lato-Bold", 11)
        c.setFillColor(ink)
        c.drawString(M, y, head)
        y = block(c, M, y - 14, body, "Lato", 9.4, 430, 13, sub) - 16
    tx = 540
    c.setFont("Lato-Bold", 9)
    c.setFillColor(ink)
    c.drawString(tx, PH - 148, "THIS ROUND'S RULES")
    rules = [
        "Research the genre, not the mission: sites famous for design, any subject.",
        "Three versions = three UX paradigms, not three palettes.",
        "Identity from Rounds 1-2 deliberately set aside; any world can re-skin these bones.",
        "Everything proposed must be buildable static: vanilla JS, CSS, Mapbox GL.",
    ]
    yy = PH - 168
    for rtext in rules:
        c.setFillColor(C("#B4552D"))
        c.circle(tx + 3, yy + 3, 1.8, stroke=0, fill=1)
        yy = block(c, tx + 12, yy, rtext, "Lato", 8.8, 186, 12, sub) - 9
    c.setStrokeColor(C("#D8D3C6"))
    c.line(M, 158, PW - M, 158)
    block(c, M, 140,
          "Method: three research families below (the award tier, the product-UX school, the "
          "editorial school), distilled to patterns, then three versions that commit to one "
          "paradigm each -- the same forced-apart discipline as Round 2, applied to UX.",
          "Lora-Italic", 10, PW - 2 * M, 14, C("#B4552D"))


RES_A = [
    ("Lando Norris -- OFF+BRAND", "Awwwards Site of the Year 2025",
     "Every pixel moves at race pace, yet it loads fast: lazy assets, lean code, "
     "motion budgeted to the subject. Spectacle that is the content, not on it.",
     "Take: motion earns its place only when it expresses the data underneath."),
    ("Messenger", "Awwwards SOTY 2025 -- a WebGL planet in the browser",
     "Console-game physics and lighting in a web page. Proof of appetite for "
     "worlds, not pages -- visitors will explore if you give them terrain.",
     "Take: our terrain already exists; the map can carry world-feel without WebGL."),
    ("Bruno Simon portfolio", "Site of the Month, Jan 2026 -- drivable 3D world",
     "Navigation as play. People remember the toy car years later. Joy is a "
     "retention strategy the field keeps underrating.",
     "Take: one playable element (a season scrubber, a tilt card) beats ten animations."),
]

RES_B = [
    ("Linear / Vercel", "the product-UX gold standard",
     "Dark calm surfaces, glowing borders, bento feature grids, obsessive "
     "micro-interaction quality. Influenced thousands of products because it "
     "reads as competence.",
     "Take: calm + precise = trust. Good frame for safety-critical content."),
    ("Felt 2.0", "collaborative maps as product",
     "Toolbar slimmed so the map gets the room; tools appear when relevant. "
     "A map app that feels like a design tool, not GIS.",
     "Take: chrome recedes, map breathes -- our current sidebar does the opposite."),
    ("Raycast / cmd-K culture", "Linear, GitHub, Notion, Vercel",
     "The command palette became the universal power-user door: one keystroke, "
     "fuzzy search, every noun and verb of the app.",
     "Take: 'find chanterelle / jump to park / open ink recipe' is one ~100-line palette away."),
    ("Airbnb maps", "the consumer map benchmark",
     "Cards and map in conversation: hover a card, the pin lifts; pan the map, "
     "cards refilter. The list IS the map.",
     "Take: bind plant cards to viewport -- the almanac rewrites itself as you pan."),
]

RES_C = [
    ("NYT Snow Fall + The Pudding", "the scrollytelling canon",
     "Pulitzer-grade narrative where scroll position drives scenes. The Pudding "
     "turned 145 years of records into a scroll you feel. Step-based libraries "
     "(Scrollama) made the pattern cheap.",
     "Take: a season is already a narrative; 'what is happening this week' wants this form."),
    ("Stripe / Apple product pages", "commercial scrollytelling",
     "Sticky panes, scroll-driven reveals, type that responds. The technique "
     "sells phones; it can teach foraging.",
     "Take: recipes as stepped scenes with a progress thread, print button at the end."),
    ("2026 currents", "calm UI, functional micro-interactions",
     "The field is correcting: away from visual theatrics toward calm "
     "interfaces; micro-interactions that reassure (45% engagement lift when "
     "functional, not decorative); scroll-driven CSS animations now native; "
     "variable fonts as living type; View Transitions for free page morphs.",
     "Take: every flourish we ship must do work -- and most now cost zero JS."),
]


def p_research(c, num, title, subtitle, items, accent):
    page_start(c, "#F4F2EC", C("#8A857A"), num)
    ink, sub = C("#1F1D18"), C("#5C574C")
    kicker(c, M, PH - 78, "GENRE RESEARCH", C(accent))
    c.setFont("Lora", 24)
    c.setFillColor(ink)
    c.drawString(M, PH - 110, title)
    c.setFont("Lora-Italic", 11.5)
    c.setFillColor(sub)
    c.drawString(M, PH - 130, subtitle)
    y = PH - 166
    for name, who, what, take in items:
        c.setFont("Lato-Bold", 11)
        c.setFillColor(ink)
        c.drawString(M, y, name)
        c.setFont("DejaVuMono", 6.8)
        c.setFillColor(C("#8A857A"))
        c.drawString(M + pdfmetrics.stringWidth(name, "Lato-Bold", 11) + 10, y, who.upper())
        y = block(c, M, y - 14, what, "Lato", 9.3, 640, 13, sub)
        y = block(c, M, y - 3, take, "Lato-Bold", 9.3, 640, 13, C(accent)) - 15
    return y


def p_synthesis(c, num):
    page_start(c, "#14171B", C("#6E7680"), num)
    kicker(c, M, PH - 78, "SYNTHESIS / THE PATTERN KIT", C("#5BD9A1"))
    c.setFont("Lora", 26)
    c.setFillColor(C("#E8ECF1"))
    c.drawString(M, PH - 112, "Six patterns worth owning -- all static-buildable")
    pats = [
        ("CMD-K PALETTE", "one keystroke to any plant, park, or recipe; ~100 lines of vanilla JS",
         VA["accent"]),
        ("MAP-CARD BINDING", "Airbnb's conversation: pan the map, the cards refilter; hover a card, the pin lifts",
         VA["accent2"]),
        ("SCROLL SCENES", "native CSS scroll-driven animation; the season tells itself; reduced-motion safe",
         VB["accent"]),
        ("STICKY SPREADS", "editorial plant pages: specimen pane holds while text scrolls past it",
         "#C98A2B"),
        ("BENTO SURFACES", "Apple/Linear grids let six things be glanceable without a long scroll",
         VC["accent"]),
        ("CARD OBJECTS + VIEW TRANSITIONS", "tiles morph into pages for free; cards tilt, flip, and carry status",
         VC["accent3"]),
    ]
    y = PH - 152
    for i, (head, body, col) in enumerate(pats):
        x = M + (i % 2) * 340
        if i % 2 == 0 and i > 0:
            y -= 64
        c.setFillColor(C(col))
        c.rect(x, y - 38, 3, 44, stroke=0, fill=1)
        c.setFont("Lato-Bold", 10)
        c.setFillColor(C("#E8ECF1"))
        c.drawString(x + 12, y, head)
        block(c, x + 12, y - 14, body, "Lato-Light", 8.8, 300, 12, C("#97A1AD"))
    y -= 96
    block(c, M, y,
          "Each version below leads with two of these and declines the rest. The discipline "
          "from Round 2 holds: if two versions could share a screenshot, one is wrong.",
          "Lora-Italic", 10.5, 640, 15, C("#5BD9A1"))


# ============================================================ version pages

def v_header(c, num, v, label):
    dark = v["key"] == "A"
    page_start(c, v["bg"], C(v["sub"]), num)
    kicker(c, M, PH - 70, "VERSION %s / %s" % (v["key"], label), C(v["accent"]))


def p_v_world(c, num, v, concept, leads, declines, precs):
    v_header(c, num, v, v["para"])
    c.setFont("Lora" if v["key"] != "A" else "Lato-Light", 38)
    c.setFillColor(C(v["ink"]))
    c.drawString(M, PH - 118, v["name"])
    c.setFont("Lora-Italic", 13.5)
    c.setFillColor(C(v["accent"]))
    c.drawString(M, PH - 142, v["tagline"])
    block(c, M, PH - 176, concept, "Lato" if v["key"] != "A" else "Lato-Light",
          10.3, 430, 15, C(v["sub"]))
    tx = 540
    c.setFont("Lato-Bold", 8.5)
    c.setFillColor(C(v["accent"]))
    c.drawString(tx, PH - 118, "LEADS WITH")
    y = block(c, tx, PH - 134, leads, "Lato", 9, 200, 12.5, C(v["ink"]))
    c.setFont("Lato-Bold", 8.5)
    c.setFillColor(C(v["accent"]))
    c.drawString(tx, y - 14, "DECLINES")
    y = block(c, tx, y - 30, declines, "Lato", 9, 200, 12.5, C(v["sub"]))
    c.setFont("Lato-Bold", 8.5)
    c.setFillColor(C(v["accent"]))
    c.drawString(tx, y - 14, "PRECEDENTS")
    block(c, tx, y - 30, precs, "Lato", 9, 200, 12.5, C(v["sub"]))


# ---------------------------------------------------------------- Version A

def p_va_map(c, num):
    v = VA
    v_header(c, num, v, "THE MAP IS THE HOME PAGE")
    bx, by, bw, bh = M, 96, PW - 2 * M, PH - 196
    cx, cy, cw, ch = browser(c, bx, by, bw, bh, v["bg"], "#3A424D", dark=True)
    mini_map(c, cx, cy, cw, ch, dark=True)
    # glow data
    for (px, py, col) in [(0.18, 0.62, v["accent"]), (0.27, 0.4, v["accent"]),
                          (0.38, 0.7, "#E3B341"), (0.46, 0.5, v["accent"]),
                          (0.58, 0.34, "#E3B341"), (0.52, 0.66, v["accent2"])]:
        glow_dot(c, cx + cw * px, cy + ch * py, 2.6, col)
    # cmd-k bar
    pbw = cw * 0.4
    c.setFillColor(C(v["glass"]))
    c.setFillAlpha(0.95)
    c.roundRect(cx + (cw - pbw) / 2, cy + ch - 36, pbw, 24, 6, stroke=0, fill=1)
    c.setFillAlpha(1)
    c.setFont("DejaVuMono", 6.6)
    c.setFillColor(C(v["sub"]))
    c.drawString(cx + (cw - pbw) / 2 + 10, cy + ch - 28, "Search plants, places, recipes...")
    c.setFillColor(C("#323A45"))
    c.roundRect(cx + (cw + pbw) / 2 - 34, cy + ch - 32, 26, 16, 3, stroke=0, fill=1)
    c.setFillColor(C(v["ink"]))
    c.drawString(cx + (cw + pbw) / 2 - 29, cy + ch - 27, "^K")
    # left rail
    c.setFillColor(C(v["glass"]))
    c.setFillAlpha(0.95)
    c.roundRect(cx + 12, cy + ch / 2 - 70, 30, 140, 8, stroke=0, fill=1)
    c.setFillAlpha(1)
    for i, col in enumerate([v["accent"], "#8E6FD8", "#C98A2B", v["sub"]]):
        c.setFillColor(C(col))
        c.circle(cx + 27, cy + ch / 2 + 48 - i * 32, 5, stroke=0, fill=1)
    # season scrubber
    sw = cw * 0.56
    c.setFillColor(C(v["glass"]))
    c.setFillAlpha(0.95)
    c.roundRect(cx + (cw - sw) / 2, cy + 14, sw, 30, 8, stroke=0, fill=1)
    c.setFillAlpha(1)
    months = "JFMAMJJASOND"
    for i, mch in enumerate(months):
        c.setFont("DejaVuMono", 5.6)
        c.setFillColor(C(v["ink"]) if i == 5 else C(v["sub"]))
        c.drawString(cx + (cw - sw) / 2 + 14 + i * (sw - 28) / 11, cy + 32, mch)
    c.setFillColor(C(v["accent"]))
    c.circle(cx + (cw - sw) / 2 + 14 + 5 * (sw - 28) / 11 + 2, cy + 24, 3.2, stroke=0, fill=1)
    c.setFont("DejaVuMono", 5.4)
    c.setFillColor(C(v["sub"]))
    c.drawString(cx + (cw - sw) / 2 + 14, cy + 19, "WEEK 24 . SCRUB TO TIME-TRAVEL THE SEASON")
    # peek card
    pkw, pkh = 190, 120
    pkx, pky = cx + cw - pkw - 16, cy + ch / 2 - 20
    c.setFillColor(C(v["glass"]))
    c.setFillAlpha(0.97)
    c.roundRect(pkx, pky, pkw, pkh, 8, stroke=0, fill=1)
    c.setFillAlpha(1)
    c.setFont("Lato-Bold", 10)
    c.setFillColor(C(v["ink"]))
    c.drawString(pkx + 12, pky + pkh - 20, "Elderberry")
    c.setFont("DejaVuMono", 5.8)
    c.setFillColor(C(v["sub"]))
    c.drawString(pkx + 12, pky + pkh - 32, "SAMBUCUS . RIPE WK 24-28")
    hist(c, pkx + 12, pky + 44, pkw - 24, 22, MONTH_VALS, v["accent"])
    chip(c, pkx + 12, pky + 24, "ALLOWED . 1 GAL/DAY", "#0E1512", v["accent"])
    c.setFont("DejaVuMono", 5.2)
    c.setFillColor(C("#E3B341"))
    c.drawString(pkx + 12, pky + 10, "OCCURRENCE IS NOT PERMISSION")
    block(c, M, by - 14,
          "No landing page: the URL opens the instrument, state lives in the URL, and the "
          "palette is the navigation. Hover a glow, get the peek card; pan, and the (collapsed) "
          "card list refilters Airbnb-style. The scrubber replays the year.",
          "Lato-Light", 9, PW - 2 * M, 12.5, C(v["sub"]))


def p_va_card(c, num):
    v = VA
    v_header(c, num, v, "PLANT CARD = SIDE SHEET OVER THE MAP")
    bx, by, bw, bh = M, 96, PW - 2 * M, PH - 196
    cx, cy, cw, ch = browser(c, bx, by, bw, bh, v["bg"], "#3A424D", dark=True)
    mini_map(c, cx, cy, cw * 0.55, ch, dark=True)
    glow_dot(c, cx + cw * 0.3, cy + ch * 0.5, 4, v["accent"])
    c.setStrokeColor(C(v["accent"]))
    c.setLineWidth(0.8)
    c.setStrokeAlpha(0.6)
    c.circle(cx + cw * 0.3, cy + ch * 0.5, 14, stroke=1, fill=0)
    c.setStrokeAlpha(1)
    # sheet
    sx = cx + cw * 0.55
    c.setFillColor(C(v["panel"]))
    c.rect(sx, cy, cw * 0.45, ch, stroke=0, fill=1)
    c.setFont("Lato-Light", 19)
    c.setFillColor(C(v["ink"]))
    c.drawString(sx + 22, cy + ch - 38, "Elderberry")
    c.setFont("DejaVuMono", 6.2)
    c.setFillColor(C(v["sub"]))
    c.drawString(sx + 22, cy + ch - 52, "SAMBUCUS CANADENSIS . FOOD + INK")
    # tabs
    for i, (tab, on) in enumerate([("OVERVIEW", 1), ("USES", 0), ("RULES", 0), ("SEASON", 0)]):
        tx = sx + 22 + i * 62
        c.setFont("Lato-Bold", 7)
        c.setFillColor(C(v["accent"]) if on else C(v["sub"]))
        c.drawString(tx, cy + ch - 76, tab)
        if on:
            c.setFillColor(C(v["accent"]))
            c.rect(tx, cy + ch - 82, 40, 1.6, stroke=0, fill=1)
    sprig(c, sx + 60, cy + ch - 200, 90, v["accent"], lw=1.1)
    hist(c, sx + 120, cy + ch - 196, 140, 40, MONTH_VALS, v["accent"])
    c.setFont("DejaVuMono", 5.6)
    c.setFillColor(C(v["sub"]))
    c.drawString(sx + 120, cy + ch - 208, "PEAK WEEKS 24-28 . NOW")
    chip(c, sx + 22, cy + ch - 240, "ALLOWED HERE . 1 GAL/PERSON/DAY", "#0E1512", v["accent"])
    chip(c, sx + 22, cy + ch - 262, "SAFETY: COOK BEFORE EATING", "#14171B", "#E3B341")
    block(c, sx + 22, cy + ch - 286,
          "Gather gently: abundant; leave stems for the birds. Rules cited from the "
          "park compendium, linked.",
          "Lato-Light", 8.4, cw * 0.45 - 44, 11.5, C(v["sub"]))
    c.setFont("DejaVuMono", 5.4)
    c.setFillColor(C("#E3B341"))
    c.drawString(sx + 22, cy + 12, "OCCURRENCE IS NOT PERMISSION . FULL ETHICS NOTE")
    block(c, M, by - 14,
          "The point stays lit on the map while its sheet is open -- place and plant in one "
          "view. Esc closes; a View Transition morphs sheet to full page for print/cite. "
          "On mobile the sheet becomes a bottom drawer, the app-standard gesture.",
          "Lato-Light", 9, PW - 2 * M, 12.5, C(v["sub"]))


def p_va_recipe(c, num):
    v = VA
    v_header(c, num, v, "RECIPE = COOK MODE")
    bx, by, bw, bh = M, 96, PW - 2 * M, PH - 196
    cx, cy, cw, ch = browser(c, bx, by, bw, bh, v["bg"], "#3A424D", dark=True)
    c.setFillColor(C("#14171B"))
    c.rect(cx, cy, cw, ch, stroke=0, fill=1)
    # left steps rail
    rx, rw = cx + 18, 170
    c.setFont("Lato-Bold", 9)
    c.setFillColor(C(v["ink"]))
    c.drawString(rx, cy + ch - 30, "OAK GALL INK")
    c.setFont("DejaVuMono", 5.8)
    c.setFillColor(C(v["sub"]))
    c.drawString(rx, cy + ch - 42, "6 STEPS . 2 DAYS . EASY")
    steps = [("Gather galls", 1), ("Crush + soak", 1), ("Add iron water", 2),
             ("Strain", 0), ("Bind", 0), ("Write", 0)]
    yy = cy + ch - 70
    for i, (s, st) in enumerate(steps):
        col = v["accent"] if st == 1 else (v["accent2"] if st == 2 else v["sub"])
        c.setFillColor(C(col))
        if st == 1:
            c.circle(rx + 6, yy + 3, 4, stroke=0, fill=1)
        else:
            c.setStrokeColor(C(col))
            c.setLineWidth(1.2)
            c.circle(rx + 6, yy + 3, 4, stroke=1, fill=0)
        c.setFont("Lato" if st != 2 else "Lato-Bold", 8.5)
        c.setFillColor(C(v["ink"]) if st == 2 else C(v["sub"]))
        c.drawString(rx + 18, yy, "%d. %s" % (i + 1, s))
        if i < len(steps) - 1:
            c.setStrokeColor(C("#323A45"))
            c.setLineWidth(1)
            c.line(rx + 6, yy - 3, rx + 6, yy - 16)
        yy -= 24
    # current step center
    sx = cx + rw + 60
    c.setFont("DejaVuMono", 7)
    c.setFillColor(C(v["accent2"]))
    c.drawString(sx, cy + ch - 60, "STEP 3 OF 6")
    c.setFont("Lato-Light", 24)
    c.setFillColor(C(v["ink"]))
    c.drawString(sx, cy + ch - 94, "Add iron water; watch it turn.")
    block(c, sx, cy + ch - 122,
          "Pour the iron liquor in slowly. The tannin bath shifts from tea-brown "
          "to blue-black in seconds -- this is the reaction that wrote Europe's "
          "archives for a thousand years.",
          "Lato-Light", 10, cw - rw - 260, 14.5, C(v["sub"]))
    chip(c, sx, cy + ch - 196, "TIMER . SOAK 72 H REMAINING 14 H", v["ink"], v["glass"], size=6.2)
    chip(c, sx + 180, cy + ch - 196, "SAFETY: IRON STAINS . GLOVES", "#14171B", "#E3B341", size=6.2)
    # materials drawer bottom
    c.setFillColor(C(v["glass"]))
    c.roundRect(cx + 16, cy + 12, cw - 32, 34, 8, stroke=0, fill=1)
    c.setFont("DejaVuMono", 6)
    c.setFillColor(C(v["sub"]))
    c.drawString(cx + 30, cy + 24, "MATERIALS: GALLS 20 . RAINWATER 500ML . IRON LIQUOR . GUM ARABIC -- TAP ANY TO SEE IT ON THE MAP")
    # mini-map corner
    mini_map(c, cx + cw - 130, cy + ch - 110, 112, 72, dark=True)
    glow_dot(c, cx + cw - 80, cy + ch - 72, 2.4, v["accent"])
    c.setFont("DejaVuMono", 5.2)
    c.setFillColor(C(v["sub"]))
    c.drawString(cx + cw - 130, cy + ch - 122, "WHERE TO GATHER")
    block(c, M, by - 14,
          "Hands-busy UX: arrow keys or space advance steps; the rail shows progress; "
          "timers persist in the tab title. Materials link back to the map -- the recipe "
          "and the territory stay one object.",
          "Lato-Light", 9, PW - 2 * M, 12.5, C(v["sub"]))


def p_va_motion(c, num):
    v = VA
    v_header(c, num, v, "MOTION, TECH + RISK")
    rows = [
        ("Palette opens", "scale 0.98-1, fade, 140ms -- Raycast timing", "vanilla JS, ~100 lines"),
        ("Peek card", "slides 8px up, spring-out; pin glow pulses once", "CSS transition + keyframe"),
        ("Season scrub", "data crossfades per month bucket; URL updates", "existing chunk loader"),
        ("Sheet to page", "card morphs to full plant page", "View Transitions API, free"),
        ("Glass panels", "smoked translucency over the map", "backdrop-filter, 1 line"),
        ("Keyboard map", "/, k, esc, arrows -- full keyboard path", "keydown router"),
    ]
    y = PH - 116
    c.setFont("Lato-Bold", 8.5)
    c.setFillColor(C(v["accent"]))
    c.drawString(M, y, "INTERACTION")
    c.drawString(M + 170, y, "BEHAVIOR")
    c.drawString(M + 470, y, "COST")
    y -= 20
    for a, b, d in rows:
        c.setFont("Lato-Bold", 9)
        c.setFillColor(C(v["ink"]))
        c.drawString(M, y, a)
        c.setFont("Lato-Light", 9)
        c.setFillColor(C(v["sub"]))
        c.drawString(M + 170, y, b)
        c.setFont("DejaVuMono", 7)
        c.drawString(M + 470, y, d)
        c.setStrokeColor(C(v["hair"]))
        c.setLineWidth(0.5)
        c.line(M, y - 8, PW - M, y - 8)
        y -= 26
    c.setFont("Lato-Bold", 8.5)
    c.setFillColor(C(v["accent"]))
    c.drawString(M, y - 8, "RISKS")
    block(c, M, y - 26,
          "Reads as a power tool: first-time visitors may not discover the palette or "
          "scrubber. Mitigation: an opening hint sequence (three quiet tooltips, once), "
          "and the peek cards carry the warmth -- voice and illustration live there. "
          "Dark-only chrome inherits Round 2's daylight-classroom concern; same daybreak "
          "answer applies.",
          "Lato-Light", 9.5, 620, 13.5, C(v["sub"]))


# ---------------------------------------------------------------- Version B

def p_vb_map(c, num):
    v = VB
    v_header(c, num, v, "HOME = THE WEEK'S STORY")
    bx, by, bw, bh = M, 96, PW - 2 * M, PH - 196
    cx, cy, cw, ch = browser(c, bx, by, bw, bh, v["bg"], v["hair"])
    # progress thread
    c.setFillColor(C(v["accent"]))
    c.rect(cx, cy, 3, ch * 0.62, stroke=0, fill=1)
    # hero
    c.setFont("Lora", 26)
    c.setFillColor(C(v["ink"]))
    c.drawString(cx + 28, cy + ch - 48, "Week 24. The elder is in flower.")
    c.setFont("Lora-Italic", 10.5)
    c.setFillColor(C(v["accent"]))
    c.drawString(cx + 28, cy + ch - 66, "Mulberries drop on warm sidewalks; the galls are filling on the oaks.")
    # scroll scene: pinned map + step text
    mx, my, mw, mh = cx + 28, cy + 56, cw * 0.52, ch * 0.5
    mini_map(c, mx, my, mw, mh)
    for (px, py, col) in [(0.3, 0.6, v["accent2"]), (0.5, 0.4, v["accent"]), (0.7, 0.65, v["accent2"])]:
        c.setFillColor(C(col))
        c.circle(mx + mw * px, my + mh * py, 4, stroke=0, fill=1)
    c.setFont("DejaVuMono", 5.6)
    c.setFillColor(C(v["sub"]))
    c.drawString(mx, my - 10, "THE MAP IS PINNED; SCROLL ADVANCES THE SCENES")
    # step cards right
    sx = mx + mw + 24
    scenes = [("01", "Riverbanks", "elder colonies at peak -- three parks allow picking", 1),
              ("02", "Oak edges", "galls forming; ink season opens in October", 0),
              ("03", "Your block", "mulberry, serviceberry on the street trees", 0)]
    yy = my + mh - 16
    for n, head, body, on in scenes:
        c.setFillColor(C(v["panel"]) if on else C("#F4F1EA"))
        c.setStrokeColor(C(v["accent"]) if on else C(v["hair"]))
        c.setLineWidth(1.1 if on else 0.7)
        c.roundRect(sx, yy - 44, cw - (sx - cx) - 24, 52, 5, stroke=1, fill=1)
        c.setFont("DejaVuMono", 6.5)
        c.setFillColor(C(v["accent"]))
        c.drawString(sx + 10, yy - 8, n)
        c.setFont("Lora", 10.5)
        c.setFillColor(C(v["ink"]))
        c.drawString(sx + 28, yy - 8, head)
        block(c, sx + 28, yy - 21, body, "Lato", 7.6, cw - (sx - cx) - 66, 9.5, C(v["sub"]))
        yy -= 62
    # persistent map pill
    c.setFillColor(C(v["ink"]))
    c.roundRect(cx + cw - 120, cy + 14, 100, 24, 12, stroke=0, fill=1)
    c.setFont("Lato-Bold", 7.5)
    c.setFillColor(C(v["bg"]))
    c.drawCentredString(cx + cw - 70, cy + 22, "OPEN THE MAP")
    block(c, M, by - 14,
          "You arrive mid-story: the homepage is this week's almanac entry, written by the data. "
          "Scroll pins the map and walks it through the week's scenes (Snow Fall pattern, native "
          "CSS). The full instrument is always one tap away via the pill -- returning users skip "
          "straight there, and the site remembers.",
          "Lato", 9, PW - 2 * M, 12.5, C(v["sub"]))


def p_vb_card(c, num):
    v = VB
    v_header(c, num, v, "PLANT CARD = EDITORIAL SPREAD")
    bx, by, bw, bh = M, 96, PW - 2 * M, PH - 196
    cx, cy, cw, ch = browser(c, bx, by, bw, bh, v["bg"], v["hair"])
    # sticky left pane
    px, pw_ = cx + 24, cw * 0.34
    c.setFillColor(C(v["panel"]))
    c.setStrokeColor(C(v["hair"]))
    c.roundRect(px, cy + 18, pw_, ch - 36, 6, stroke=1, fill=1)
    sprig(c, px + pw_ / 2, cy + ch - 180, 100, v["accent2"], lw=1.2)
    c.setFont("Lora", 16)
    c.setFillColor(C(v["ink"]))
    c.drawString(px + 18, cy + ch - 220, "Elderberry")
    c.setFont("DejaVuMono", 6)
    c.setFillColor(C(v["sub"]))
    c.drawString(px + 18, cy + ch - 234, "SAMBUCUS CANADENSIS")
    hist(c, px + 18, cy + ch - 280, pw_ - 36, 30, MONTH_VALS, v["accent"])
    chip(c, px + 18, cy + 58, "ALLOWED IN 3 NEARBY PARKS", v["bg"], v["accent2"])
    c.setFont("DejaVuMono", 5.4)
    c.setFillColor(C(v["accent"]))
    c.drawString(px + 18, cy + 40, "OCCURRENCE IS NOT PERMISSION")
    c.setFont("DejaVuMono", 5.6)
    c.setFillColor(C(v["sub"]))
    c.drawString(px + 18, cy + 26, "STICKY: HOLDS WHILE TEXT SCROLLS")
    # scrolling right column
    tx = px + pw_ + 30
    tw_ = cw - (tx - cx) - 30
    c.setFont("Lora", 13)
    c.setFillColor(C(v["ink"]))
    c.drawString(tx, cy + ch - 44, "The hedge pharmacy, the ink bottle, the pie.")
    y = block(c, tx, cy + ch - 64,
              "Identification first: opposite leaves, five to nine leaflets, flat cream "
              "umbels the size of your palm. The lookalikes and how to rule them out, "
              "said plainly before anything else.",
              "Lato", 9, tw_, 13, C(v["sub"]))
    # pull quote
    c.setFillColor(C(v["accent"]))
    c.rect(tx, y - 50, 2.5, 40, stroke=0, fill=1)
    block(c, tx + 14, y - 22, "Pick what you will use tonight; the season is long.",
          "Lora-Italic", 11.5, tw_ - 20, 15, C(v["accent"]))
    y = block(c, tx, y - 74,
              "Margin notes carry the lyric register; the body stays practical. Uses "
              "unfold as chapters: food, ink, dye -- each ending at the recipe it feeds.",
              "Lato", 9, tw_, 13, C(v["sub"]))
    # inline map vignette
    mini_map(c, tx, y - 76, tw_, 64)
    c.setFillColor(C(v["accent2"]))
    c.circle(tx + tw_ * 0.4, y - 44, 3.5, stroke=0, fill=1)
    c.setFont("DejaVuMono", 5.4)
    c.setFillColor(C(v["sub"]))
    c.drawString(tx, y - 88, "INLINE MAP SCENE: WHERE IT GROWS NEAR YOU . TAP TO OPEN FULL MAP")
    block(c, M, by - 14,
          "The Stripe/Apple sticky-spread, spent on a plant: specimen pane holds (with histogram "
          "and live rule status) while the article scrolls past. Reads beautifully on phones as a "
          "simple stack; prints as a clean one-pager for class.",
          "Lato", 9, PW - 2 * M, 12.5, C(v["sub"]))


def p_vb_recipe(c, num):
    v = VB
    v_header(c, num, v, "RECIPE = A STEPPED STORY")
    bx, by, bw, bh = M, 96, PW - 2 * M, PH - 196
    cx, cy, cw, ch = browser(c, bx, by, bw, bh, v["bg"], v["hair"])
    # progress thread with knots
    c.setFillColor(C(v["accent"]))
    c.rect(cx + 22, cy + 16, 2.5, ch - 32, stroke=0, fill=1)
    for i in range(6):
        yy = cy + ch - 30 - i * (ch - 60) / 5
        on = i < 3
        c.setFillColor(C(v["accent"]) if on else C(v["bg"]))
        c.setStrokeColor(C(v["accent"]))
        c.setLineWidth(1.2)
        c.circle(cx + 23, yy, 4.5, stroke=1, fill=1)
    c.setFont("Lora", 22)
    c.setFillColor(C(v["ink"]))
    c.drawString(cx + 50, cy + ch - 46, "Ink from oak galls")
    c.setFont("Lora-Italic", 10)
    c.setFillColor(C(v["accent"]))
    c.drawString(cx + 50, cy + ch - 64, "Six steps, two days, a thousand years of archives.")
    # current scene
    c.setFont("DejaVuMono", 7)
    c.setFillColor(C(v["accent2"]))
    c.drawString(cx + 50, cy + ch - 100, "III OF VI")
    c.setFont("Lora", 16)
    c.setFillColor(C(v["ink"]))
    c.drawString(cx + 50, cy + ch - 122, "Add iron water; watch it turn.")
    y = block(c, cx + 50, cy + ch - 142,
              "The bath shifts from tea-brown to blue-black in seconds. This is the "
              "chemistry monks trusted with scripture; your jar is part of that line. "
              "Iron stains -- gloves on, said plainly.",
              "Lato", 9.5, cw * 0.5, 13.5, C(v["sub"]))
    # materials sticky bar
    c.setFillColor(C("#F4F1EA"))
    c.roundRect(cx + 50, cy + 18, cw * 0.5, 30, 6, stroke=0, fill=1)
    c.setFont("DejaVuMono", 5.8)
    c.setFillColor(C(v["sub"]))
    c.drawString(cx + 62, cy + 29, "STICKY MATERIALS: GALLS . RAINWATER . IRON . GUM -- EACH LINKS TO ITS CARD")
    # right rail: gather scene + print
    rx = cx + cw * 0.62
    mini_map(c, rx, cy + ch - 200, cw * 0.32, 90)
    c.setFillColor(C(v["accent2"]))
    c.circle(rx + cw * 0.13, cy + ch - 158, 3.5, stroke=0, fill=1)
    c.setFont("DejaVuMono", 5.4)
    c.setFillColor(C(v["sub"]))
    c.drawString(rx, cy + ch - 212, "STEP I OPENS AS A MAP SCENE: WHERE THE GALLS ARE")
    c.setFillColor(C(v["ink"]))
    c.roundRect(rx, cy + 60, 120, 26, 13, stroke=0, fill=1)
    c.setFont("Lato-Bold", 7.5)
    c.setFillColor(C(v["bg"]))
    c.drawCentredString(rx + 60, cy + 69, "PRINT THE BROADSIDE")
    block(c, M, by - 14,
          "Each step is a scroll scene with one job; the thread shows where you are. Hands-busy "
          "mode is just bigger type and space-to-advance -- same page, same scroll. Ends with the "
          "printable one-sheet, because finished things leave the screen.",
          "Lato", 9, PW - 2 * M, 12.5, C(v["sub"]))


def p_vb_motion(c, num):
    v = VB
    v_header(c, num, v, "MOTION, TECH + RISK")
    rows = [
        ("Scroll scenes", "map pans/zooms keyed to scroll position", "CSS scroll-timeline + Mapbox flyTo"),
        ("Sticky spreads", "specimen pane holds, text scrolls", "position: sticky, zero JS"),
        ("Headline life", "display weight breathes on scroll", "variable font axis, CSS only"),
        ("Scene steps", "IntersectionObserver advances scenes", "Scrollama pattern, ~60 lines"),
        ("Reduced motion", "every scene readable as static stack", "prefers-reduced-motion"),
        ("Return visits", "remembers you; opens map pill prominent", "localStorage flag"),
    ]
    y = PH - 116
    c.setFont("Lato-Bold", 8.5)
    c.setFillColor(C(v["accent"]))
    c.drawString(M, y, "INTERACTION")
    c.drawString(M + 170, y, "BEHAVIOR")
    c.drawString(M + 470, y, "COST")
    y -= 20
    for a, b, d in rows:
        c.setFont("Lato-Bold", 9)
        c.setFillColor(C(v["ink"]))
        c.drawString(M, y, a)
        c.setFont("Lato", 9)
        c.setFillColor(C(v["sub"]))
        c.drawString(M + 170, y, b)
        c.setFont("DejaVuMono", 7)
        c.drawString(M + 470, y, d)
        c.setStrokeColor(C(v["hair"]))
        c.setLineWidth(0.5)
        c.line(M, y - 8, PW - M, y - 8)
        y -= 26
    c.setFont("Lato-Bold", 8.5)
    c.setFillColor(C(v["accent"]))
    c.drawString(M, y - 8, "RISKS")
    block(c, M, y - 26,
          "Narrative front door can slow task-driven users ('is the elderberry ripe?'). "
          "Mitigations: the pill is always visible, search is in the header, and the story "
          "honors deep links -- every scene is a URL. Editorial demands fresh writing; the "
          "weekly entry must assemble itself from data (week, mode, region) with an owner "
          "override, or it will rot.",
          "Lato", 9.5, 620, 13.5, C(v["sub"]))


# ---------------------------------------------------------------- Version C

def p_vc_map(c, num):
    v = VC
    v_header(c, num, v, "HOME = THE BENTO TABLE")
    bx, by, bw, bh = M, 96, PW - 2 * M, PH - 196
    cx, cy, cw, ch = browser(c, bx, by, bw, bh, v["bg"], v["hair"])
    g = 10
    # big map tile (left, 2x2)
    mw, mh = cw * 0.46, ch - 2 * g
    mini_map(c, cx + g, cy + g, mw, mh)
    for (px, py, col) in [(0.3, 0.6, v["accent"]), (0.55, 0.4, v["accent2"]), (0.7, 0.7, v["accent3"])]:
        c.setFillColor(C(col))
        c.circle(cx + g + mw * px, cy + g + mh * py, 4, stroke=0, fill=1)
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C(v["ink"]))
    c.drawString(cx + g + 10, cy + g + mh - 18, "THE MAP -- LIVE TILE, TAP TO ENTER")
    # right tiles
    tx = cx + g + mw + g
    tw_ = cw - mw - 3 * g
    # ripening now stack
    th1 = ch * 0.42
    c.setFillColor(C(v["panel"]))
    c.setStrokeColor(C(v["hair"]))
    c.roundRect(tx, cy + ch - g - th1, tw_ * 0.55, th1, 7, stroke=1, fill=1)
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C(v["ink"]))
    c.drawString(tx + 10, cy + ch - g - 16, "RIPENING THIS WEEK")
    for i, (nm, col) in enumerate([("Elderberry", v["accent"]), ("Mulberry", v["accent3"]),
                                   ("Serviceberry", v["accent2"])]):
        yy = cy + ch - g - 36 - i * 26
        c.setFillColor(C("#F7F6F2"))
        c.roundRect(tx + 8, yy - 8, tw_ * 0.55 - 16, 22, 4, stroke=0, fill=1)
        c.setFillColor(C(col))
        c.circle(tx + 18, yy + 3, 4, stroke=0, fill=1)
        c.setFont("Lato", 8)
        c.setFillColor(C(v["ink"]))
        c.drawString(tx + 28, yy, nm)
    # season dial tile
    dw = tw_ * 0.4
    c.setFillColor(C(v["panel"]))
    c.roundRect(tx + tw_ * 0.6, cy + ch - g - th1, dw, th1, 7, stroke=1, fill=1)
    import math as _m
    dcx, dcy = tx + tw_ * 0.6 + dw / 2, cy + ch - g - th1 / 2
    c.setStrokeColor(C(v["hair"]))
    c.setLineWidth(5)
    c.circle(dcx, dcy, 26, stroke=1, fill=0)
    c.setStrokeColor(C(v["accent2"]))
    c.arc(dcx - 26, dcy - 26, dcx + 26, dcy + 26, 90, -160)
    c.setFont("DejaVuMono", 6)
    c.setFillColor(C(v["ink"]))
    c.drawCentredString(dcx, dcy - 2, "WK 24")
    c.setFont("DejaVuMono", 5.2)
    c.setFillColor(C(v["sub"]))
    c.drawCentredString(dcx, dcy - 12, "SUMMER")
    # recipe tile
    th2 = ch - 3 * g - th1
    c.setFillColor(C(v["accent"]))
    c.roundRect(tx, cy + g, tw_ * 0.55, th2, 7, stroke=0, fill=1)
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C("#FFFFFF"))
    c.drawString(tx + 10, cy + g + th2 - 16, "PROJECT OF THE WEEK")
    c.setFont("Lora-Italic", 11)
    c.drawString(tx + 10, cy + g + th2 / 2 - 4, "Elderberry ink")
    c.setFont("DejaVuMono", 5.6)
    c.drawString(tx + 10, cy + g + 10, "6 STEPS . OPEN THE DECK")
    # ethics tile (constant)
    c.setFillColor(C(v["ink"]))
    c.roundRect(tx + tw_ * 0.6, cy + g, dw, th2, 7, stroke=0, fill=1)
    c.setFont("DejaVuMono", 5.6)
    c.setFillColor(C("#F2F1ED"))
    c.drawString(tx + tw_ * 0.6 + 8, cy + g + th2 - 16, "THE RULES")
    block(c, tx + tw_ * 0.6 + 8, cy + g + th2 - 30, "Occurrence is not permission. Check the parcel, then gather gently.",
          "Lato", 6.8, dw - 16, 8.5, C("#CFCDC6"))
    block(c, M, by - 14,
          "Apple/Vercel bento spent on an almanac: six glanceable surfaces, no scroll, every tile "
          "alive (the map pans slowly, the dial turns, the stack reshuffles weekly). Tiles morph "
          "into their full pages via View Transitions. The ethics tile is permanent furniture.",
          "Lato", 9, PW - 2 * M, 12.5, C(v["sub"]))


def p_vc_card(c, num):
    v = VC
    v_header(c, num, v, "PLANT CARD = A CARD, LITERALLY")
    bx, by, bw, bh = M, 96, PW - 2 * M, PH - 196
    cx, cy, cw, ch = browser(c, bx, by, bw, bh, v["bg"], v["hair"])
    # collection grid behind (faded)
    c.setFillAlpha(0.4)
    for i in range(4):
        c.setFillColor(C(v["panel"]))
        c.setStrokeColor(C(v["hair"]))
        c.roundRect(cx + 20 + i * 90, cy + ch - 90, 80, 70, 6, stroke=1, fill=1)
    c.setFillAlpha(1)
    c.setFont("DejaVuMono", 5.6)
    c.setFillColor(C(v["sub"]))
    c.drawString(cx + 20, cy + ch - 104, "THE COLLECTION GRID . FILTER BY MODE, SEASON, STATUS")
    # card front
    cwd, chh = 180, 240
    fx, fy = cx + cw * 0.18, cy + 30
    c.saveState()
    c.translate(fx + cwd / 2, fy + chh / 2)
    c.rotate(-3)
    c.setFillColor(C(v["panel"]))
    c.setStrokeColor(C(v["accent"]))
    c.setLineWidth(1.4)
    c.roundRect(-cwd / 2, -chh / 2, cwd, chh, 10, stroke=1, fill=1)
    c.setFillColor(C(v["accent"]))
    c.roundRect(-cwd / 2, chh / 2 - 30, cwd, 30, 10, stroke=0, fill=1)
    c.rect(-cwd / 2, chh / 2 - 22, cwd, 22, stroke=0, fill=1)
    c.setFont("Lato-Bold", 11)
    c.setFillColor(C("#FFFFFF"))
    c.drawCentredString(0, chh / 2 - 20, "ELDERBERRY")
    sprig(c, 0, -55, 85, v["accent"], lw=1.2)
    hist(c, -cwd / 2 + 16, -chh / 2 + 38, cwd - 32, 22, MONTH_VALS, v["accent2"])
    c.setFont("DejaVuMono", 5.6)
    c.setFillColor(C(v["sub"]))
    c.drawCentredString(0, -chh / 2 + 26, "RIPE WK 24-28")
    c.setFillColor(C(v["accent"]))
    c.setFont("DejaVuMono", 5.8)
    c.drawCentredString(0, -chh / 2 + 12, "ALLOWED NEARBY . NO. 012")
    c.restoreState()
    # card back
    bx2, by2 = cx + cw * 0.52, cy + 30
    c.saveState()
    c.translate(bx2 + cwd / 2, by2 + chh / 2)
    c.rotate(2.5)
    c.setFillColor(C(v["panel"]))
    c.setStrokeColor(C(v["hair"]))
    c.setLineWidth(1)
    c.roundRect(-cwd / 2, -chh / 2, cwd, chh, 10, stroke=1, fill=1)
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C(v["ink"]))
    c.drawString(-cwd / 2 + 14, chh / 2 - 24, "THE BACK: DATA")
    rows = [("ID", "opposite leaves, 5-9 leaflets"), ("LOOKALIKE", "water hemlock -- rule out"),
            ("USES", "food . ink . dye"), ("ETHIC", "abundant; leave stems"),
            ("RULES", "varies by parcel -- check map"), ("SAFETY", "cook before eating")]
    yy = chh / 2 - 44
    for k, val in rows:
        c.setFont("DejaVuMono", 5.6)
        c.setFillColor(C(v["accent3"]))
        c.drawString(-cwd / 2 + 14, yy, k)
        c.setFont("Lato", 7)
        c.setFillColor(C(v["sub"]))
        c.drawString(-cwd / 2 + 62, yy, val)
        yy -= 22
    c.setFont("DejaVuMono", 5.2)
    c.setFillColor(C(v["accent"]))
    c.drawString(-cwd / 2 + 14, -chh / 2 + 12, "OCCURRENCE IS NOT PERMISSION")
    c.restoreState()
    c.setFont("Lato-Bold", 9)
    c.setFillColor(C(v["sub"]))
    c.drawString(cx + cw * 0.40, cy + 150, "FLIP >")
    block(c, M, by - 14,
          "Cards tilt to the cursor and flip for data -- the one playable element, per Bruno "
          "Simon's lesson. Front teaches recognition; back is the citation layer. A card "
          "expands to the full page (View Transition) for print. Field cards, not collectibles: "
          "you log 'observed', never 'harvested' -- play must not gamify extraction.",
          "Lato", 9, PW - 2 * M, 12.5, C(v["sub"]))


def p_vc_recipe(c, num):
    v = VC
    v_header(c, num, v, "RECIPE = A DECK OF STEPS")
    bx, by, bw, bh = M, 96, PW - 2 * M, PH - 196
    cx, cy, cw, ch = browser(c, bx, by, bw, bh, v["bg"], v["hair"])
    # done stack left
    for i in range(2):
        c.saveState()
        c.translate(cx + 90 + i * 6, cy + ch / 2 + i * 4)
        c.rotate(-6 + i * 3)
        c.setFillColor(C("#E8E6DF"))
        c.setStrokeColor(C(v["hair"]))
        c.roundRect(-60, -80, 120, 160, 8, stroke=1, fill=1)
        c.restoreState()
    c.setFont("DejaVuMono", 5.6)
    c.setFillColor(C(v["sub"]))
    c.drawCentredString(cx + 95, cy + ch / 2 - 100, "DONE: I, II")
    # current card center
    ccw, cch = 200, 260
    ccx, ccy = cx + cw / 2 - ccw / 2, cy + ch / 2 - cch / 2
    c.setFillColor(C(v["panel"]))
    c.setStrokeColor(C(v["accent3"]))
    c.setLineWidth(1.6)
    c.roundRect(ccx, ccy, ccw, cch, 12, stroke=1, fill=1)
    c.setFont("DejaVuMono", 7)
    c.setFillColor(C(v["accent3"]))
    c.drawString(ccx + 16, ccy + cch - 24, "STEP III OF VI")
    c.setFont("Lora", 14)
    c.setFillColor(C(v["ink"]))
    c.drawString(ccx + 16, ccy + cch - 48, "Add iron water;")
    c.drawString(ccx + 16, ccy + cch - 66, "watch it turn.")
    block(c, ccx + 16, ccy + cch - 88,
          "Tea-brown to blue-black in seconds. The archive reaction.",
          "Lato", 8.2, ccw - 32, 11, C(v["sub"]))
    chip(c, ccx + 16, ccy + 64, "GLOVES -- IRON STAINS", "#FFFFFF", "#B3593A", size=5.8)
    chip(c, ccx + 16, ccy + 42, "TIMER 72H", v["ink"], "#E8E6DF", size=5.8)
    c.setFont("DejaVuMono", 5.6)
    c.setFillColor(C(v["sub"]))
    c.drawCentredString(ccx + ccw / 2, ccy + 16, "SPACE / SWIPE TO ADVANCE")
    # upcoming fan right
    for i in range(3):
        c.saveState()
        c.translate(cx + cw - 120 + i * 8, cy + ch / 2 - i * 3)
        c.rotate(5 + i * 4)
        c.setFillColor(C(v["panel"]))
        c.setStrokeColor(C(v["hair"]))
        c.roundRect(-55, -75, 110, 150, 8, stroke=1, fill=1)
        c.restoreState()
    c.setFont("DejaVuMono", 5.6)
    c.setFillColor(C(v["sub"]))
    c.drawCentredString(cx + cw - 110, cy + ch / 2 - 96, "UP NEXT: IV, V, VI")
    # materials row
    for i, mat in enumerate(["GALLS", "RAINWATER", "IRON", "GUM"]):
        chip(c, cx + 30 + i * 100, cy + 18, mat + " .", v["ink"], "#E8E6DF", size=5.8)
    block(c, M, by - 14,
          "The recipe is a deck you work through; finished cards stack with a flick. One card, "
          "one action -- the strongest hands-busy format on a phone propped by the sink. "
          "Materials are cards too, linking to their plants and map spots. The whole deck prints "
          "as a sheet of actual cards to cut out for the classroom.",
          "Lato", 9, PW - 2 * M, 12.5, C(v["sub"]))


def p_vc_motion(c, num):
    v = VC
    v_header(c, num, v, "MOTION, TECH + RISK")
    rows = [
        ("Tile hover", "lifts 4px, shadow deepens; map tile pans slowly always", "CSS transform/transition"),
        ("Card tilt", "3D tilt toward cursor, max 6 degrees", "CSS perspective + pointermove"),
        ("Card flip", "front/back rotate on tap", "CSS 3D rotate, backface-visibility"),
        ("Tile to page", "bento tile morphs to full page", "View Transitions API"),
        ("Deck advance", "card slides off, next springs in; swipe on touch", "~80 lines vanilla"),
        ("Layout", "tiles reflow by container size, not viewport", "container queries"),
    ]
    y = PH - 116
    c.setFont("Lato-Bold", 8.5)
    c.setFillColor(C(v["accent"]))
    c.drawString(M, y, "INTERACTION")
    c.drawString(M + 170, y, "BEHAVIOR")
    c.drawString(M + 470, y, "COST")
    y -= 20
    for a, b, d in rows:
        c.setFont("Lato-Bold", 9)
        c.setFillColor(C(v["ink"]))
        c.drawString(M, y, a)
        c.setFont("Lato", 9)
        c.setFillColor(C(v["sub"]))
        c.drawString(M + 170, y, b)
        c.setFont("DejaVuMono", 7)
        c.drawString(M + 470, y, d)
        c.setStrokeColor(C(v["hair"]))
        c.setLineWidth(0.5)
        c.line(M, y - 8, PW - M, y - 8)
        y -= 26
    c.setFont("Lato-Bold", 8.5)
    c.setFillColor(C(v["accent"]))
    c.drawString(M, y - 8, "RISKS")
    block(c, M, y - 26,
          "Two real ones. Playfulness vs. safety: status banners and the ethics tile never "
          "play -- fixed styles, no tilt, no flip. Gamified collecting could imply harvest "
          "bingo: the language is 'observed' and 'made', never completion percentages over "
          "living things. And bento homes can fragment focus -- the map tile must clearly "
          "dominate the hierarchy.",
          "Lato", 9.5, 620, 13.5, C(v["sub"]))


# ----------------------------------------------------------------- close

def p_matrix(c, num):
    page_start(c, "#F4F2EC", C("#8A857A"), num)
    ink, sub = C("#1F1D18"), C("#5C574C")
    kicker(c, M, PH - 70, "SIDE BY SIDE", C("#B4552D"))
    c.setFont("Lora", 24)
    c.setFillColor(ink)
    c.drawString(M, PH - 100, "Three versions against the needs")
    rows = [
        ("First minute", "drops you into the instrument", "tells you the week's story", "lays the table, you choose"),
        ("Map's role", "is the site", "a recurring character", "the biggest card"),
        ("Plant card", "side sheet over the map", "sticky editorial spread", "a literal card, front/back"),
        ("Recipe", "cook mode with rail + timers", "stepped story with thread", "deck of step cards"),
        ("Returning user", "fastest: URL + palette", "pill skips to map", "table is the dashboard"),
        ("Teaching", "daybreak theme, mono rigor", "prints one-pagers; reads aloud", "cut-out card sheets"),
        ("Mobile", "bottom drawers, app-native", "simple stack, scroll-native", "swipe decks, touch-native"),
        ("Signature tech", "cmd-K, View Transitions", "CSS scroll scenes, sticky", "tilt/flip, container queries"),
        ("Biggest risk", "cold power-tool feel", "story slows tasks; needs auto-text", "play vs. safety tone"),
    ]
    col_x = [M, 250, 430, 610]
    heads = ["", "A . FIELD DESK", "B . LONG SEASON", "C . CARD TABLE"]
    head_cols = ["#1F1D18", "#2E6B4F", "#B4552D", "#4C5FAF"]
    for i, h in enumerate(heads):
        c.setFont("Lato-Bold", 8.5)
        c.setFillColor(C(head_cols[i]))
        c.drawString(col_x[i], PH - 132, h)
    y = PH - 156
    for row in rows:
        c.setStrokeColor(C("#DDD8CB"))
        c.setLineWidth(0.5)
        c.line(M, y + 12, PW - M, y + 12)
        for i, cell in enumerate(row):
            font = "Lato-Bold" if i == 0 else "Lato"
            c.setFont(font, 8.4)
            c.setFillColor(ink if i == 0 else sub)
            for j, ln in enumerate(wrap(c, cell, font, 8.4, (col_x[i + 1] - col_x[i] - 14) if i < 3 else 130)):
                c.drawString(col_x[i], y - j * 10, ln)
        y -= 34
    block(c, M, y + 6,
          "All three keep: safety semantics, the ethics line in every popup and card, printability, "
          "reduced-motion fallbacks, and the no-build constraint. Any Round 2 world can skin any of "
          "these skeletons -- identity and UX are now separate decisions.",
          "Lora-Italic", 9.5, PW - 2 * M, 13, C("#B4552D"))


def p_asks(c, num):
    page_start(c, "#14171B", C("#6E7680"), num)
    kicker(c, M, PH - 78, "ROUND 3 / DECISIONS WE NEED", C("#5BD9A1"))
    c.setFont("Lora", 26)
    c.setFillColor(C("#E8ECF1"))
    c.drawString(M, PH - 112, "Four asks")
    asks = [
        ("01", "Which skeleton?",
         "Pick a lead UX version (or a hybrid: e.g., B's story home opening into A's instrument). "
         "This is separable from the Round 2 identity pick."),
        ("02", "Pair it with a world.",
         "Any Round 2 world fits any skeleton -- Night Survey on Field Desk is the natural pair; "
         "Overprint on Card Table is the boldest; Pigment Index on Long Season the most literary. Name a pairing to prototype."),
        ("03", "The first playable.",
         "Each version has one signature interactive (season scrubber / pinned map scenes / tilt-flip cards). "
         "Which earns a build-first prototype on design/relaunch?"),
        ("04", "Recipe priority.",
         "Recipes are new surface area. Confirm the first three projects (oak-gall ink? elderberry ink? a dye?) "
         "so card and recipe templates are designed against real content."),
    ]
    y = PH - 150
    for n, head, body in asks:
        c.setFont("DejaVuMono", 9)
        c.setFillColor(C("#5BD9A1"))
        c.drawString(M, y, n)
        c.setFont("Lato-Bold", 11.5)
        c.setFillColor(C("#E8ECF1"))
        c.drawString(M + 30, y, head)
        y = block(c, M + 30, y - 14, body, "Lato-Light", 9.3, 620, 13, C("#97A1AD")) - 16
    block(c, M, y - 2,
          "Suggested next step: a one-page HTML prototype of the chosen skeleton's signature "
          "interaction, with real map data, before any visual identity is applied.",
          "Lora-Italic", 10.5, 640, 15, C("#5BD9A1"))


def main():
    c = canvas.Canvas(str(OUT), pagesize=(PW, PH))
    n = 1
    p_cover(c); c.showPage(); n += 1
    p_lens(c, n); c.showPage(); n += 1
    p_research(c, n, "The award tier",
               "What the field celebrates when nothing is at stake but wonder.",
               RES_A, "#B4552D"); c.showPage(); n += 1
    p_research(c, n, "The product-UX school",
               "Calm, keyboard-fast, map-literate -- the tools people live in.",
               RES_B, "#2E6B4F"); c.showPage(); n += 1
    p_research(c, n, "The editorial school + 2026 currents",
               "Scroll as narrative, and the field's turn toward calm.",
               RES_C, "#4C5FAF"); c.showPage(); n += 1
    p_synthesis(c, n); c.showPage(); n += 1
    p_v_world(c, n, VA,
              "Craft Almanac as an instrument you open, not a site you visit. The map fills "
              "the viewport from the first frame; search, cards, recipes, and the season "
              "itself are layers floating above it. Built on the Linear/Felt school: calm "
              "dark chrome, keyboard-first, every micro-interaction doing reassurance work. "
              "The current app's bones (panel + map) evolved into a true tool.",
              "Cmd-K palette; map-card binding. Glass layers, season scrubber, URL state.",
              "Scroll scenes; bento. The instrument never scrolls.",
              "Linear, Felt 2.0, Raycast, Airbnb maps, Vercel."); c.showPage(); n += 1
    p_va_map(c, n); c.showPage(); n += 1
    p_va_card(c, n); c.showPage(); n += 1
    p_va_recipe(c, n); c.showPage(); n += 1
    p_va_motion(c, n); c.showPage(); n += 1
    p_v_world(c, n, VB,
              "Craft Almanac as a publication that happens to contain an instrument. You "
              "arrive mid-story -- the week's entry, written from live data -- and scroll "
              "through what the season is doing near you; the map enters pinned, like a "
              "character. Plant pages are sticky editorial spreads; recipes are stepped "
              "stories. The scrollytelling canon (Snow Fall, The Pudding, Stripe) spent on "
              "a living calendar instead of a one-off feature.",
              "Scroll scenes; sticky spreads. Variable type, progress threads, print endings.",
              "Cmd-K as primary nav; bento. One thread at a time.",
              "NYT Snow Fall, The Pudding, Stripe, Apple product pages."); c.showPage(); n += 1
    p_vb_map(c, n); c.showPage(); n += 1
    p_vb_card(c, n); c.showPage(); n += 1
    p_vb_recipe(c, n); c.showPage(); n += 1
    p_vb_motion(c, n); c.showPage(); n += 1
    p_v_world(c, n, VC,
              "Craft Almanac as a table of beautiful objects. Home is a bento of live tiles; "
              "every plant is a literal card that tilts and flips; every recipe is a deck of "
              "step cards you work through with one hand. The most touchable and most "
              "classroom-portable version -- cards print and cut out. Joy is the strategy, "
              "with hard guardrails where play meets safety.",
              "Bento surfaces; card objects + View Transitions. Tilt, flip, swipe, morph.",
              "Full-bleed map home; long scrolls. Everything is glanceable.",
              "Apple/Vercel bento, Linear grids, Bruno Simon's playability, trading-card UI."); c.showPage(); n += 1
    p_vc_map(c, n); c.showPage(); n += 1
    p_vc_card(c, n); c.showPage(); n += 1
    p_vc_recipe(c, n); c.showPage(); n += 1
    p_vc_motion(c, n); c.showPage(); n += 1
    p_matrix(c, n); c.showPage(); n += 1
    p_asks(c, n); c.showPage(); n += 1
    c.save()
    print("Wrote %s (%d pages)" % (OUT, n - 1))


if __name__ == "__main__":
    main()
