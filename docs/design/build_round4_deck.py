#!/usr/bin/env python3
"""Generate the Round 4 deck: The Living Map.

Synthesis round per the owner's picks: Field Desk skeleton (map dominant,
floating cards) + Pigment Index color/text in light mode + Night Survey as
the night register of a time-of-day light system + live almanac conditions
(weather, solar/lunar, tide) modeled on the map + three card-boldness
options borrowing Overprint's language.

Usage: python3 docs/design/build_round4_deck.py
Output: docs/design/round-4-living-map.pdf
"""

import math
import random
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "round-4-living-map.pdf"

PW, PH = 792, 612
M = 54

FONT_DIRS = {
    "Lora": "/usr/share/fonts/truetype/google-fonts/Lora-Variable.ttf",
    "Lora-Italic": "/usr/share/fonts/truetype/google-fonts/Lora-Italic-Variable.ttf",
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


FOOTER = "CRAFT ALMANAC  /  THE LIVING MAP  /  ROUND 4"

# Light registers
DAY = dict(name="DAY", ground="#F1F5EC", panel="#FFFFFF", ink="#1F2421",
           sub="#5A615B", hair="#D5DAD2", land="#E9EEE5", land2="#DDE5D8",
           water="#B9C8CF", accent="#6B7F2E")
DUSK = dict(name="DUSK", ground="#453E4A", panel="#544C5A", ink="#F2E9DC",
            sub="#BCAFA5", hair="#5E5664", land="#3E3844", land2="#4A4350",
            water="#6E5F70", accent="#FF9447")
NIGHT = dict(name="NIGHT", ground="#121A16", panel="#1C2721", ink="#EDF3EA",
             sub="#9DB0A2", hair="#2E3B33", land="#0E1512", land2="#16201A",
             water="#27414B", accent="#FFD166")
DAWN = dict(name="DAWN", ground="#E9EEF2", panel="#F7F9FB", ink="#2A3138",
            sub="#6A7580", hair="#D3DBE1", land="#E2E9EE", land2="#D8E1E7",
            water="#BCCEDA", accent="#D98A6A")

PIGMENTS = [("Madder", "#A63D2F"), ("Weld", "#D9A521"), ("Indigo", "#2F4DA0"),
            ("Walnut", "#5C4632"), ("Oak gall", "#3A3F3D"), ("Buckthorn", "#6B7F2E"),
            ("Pokeberry", "#8E2D56")]

SAFETY = [("Allowed", "#2F8F46"), ("Permit", "#D89B24"), ("Prohibited", "#C74437"),
          ("Private", "#7E6654"), ("Unknown", "#8B8F86")]
SAFETY_NIGHT = [("Allowed", "#5BE08A"), ("Permit", "#FFC94D"), ("Prohibited", "#FF6B5E"),
                ("Private", "#C99B7A"), ("Unknown", "#93A39A")]


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


def glow_dot(c, x, y, r, color):
    col = C(color)
    for rr, a in [(r * 2.4, 0.08), (r * 1.6, 0.22), (r, 0.9)]:
        c.setFillColor(col)
        c.setFillAlpha(a)
        c.circle(x, y, rr, stroke=0, fill=1)
    c.setFillAlpha(1)


def hist(c, x, y, w, h, vals, color):
    n = len(vals)
    gap = w / n
    bw = gap * 0.66
    c.setFillColor(C(color) if isinstance(color, str) else color)
    for i, v in enumerate(vals):
        c.rect(x + i * gap + (gap - bw) / 2, y, bw, h * v, stroke=0, fill=1)


MONTH_VALS = [0.08, 0.10, 0.18, 0.34, 0.55, 0.72, 0.86, 1.0, 0.92, 0.66, 0.30, 0.12]


def chip(c, x, y, label, fg, bg, font="DejaVuMono", size=5.8, pad=5):
    tw = pdfmetrics.stringWidth(label, font, size)
    c.setFillColor(C(bg) if isinstance(bg, str) else bg)
    c.roundRect(x, y, tw + 2 * pad, size + 7, 3.5, stroke=0, fill=1)
    c.setFont(font, size)
    c.setFillColor(C(fg) if isinstance(fg, str) else fg)
    c.drawString(x + pad, y + 3.6, label)
    return tw + 2 * pad


def base_map(c, x, y, w, h, R, coast=False, seed=5):
    """Terrain in a register R; optional coastline along the right."""
    c.saveState()
    p = c.beginPath()
    p.rect(x, y, w, h)
    c.clipPath(p, stroke=0, fill=0)
    c.setFillColor(C(R["land"]))
    c.rect(x, y, w, h, stroke=0, fill=1)
    rnd = random.Random(seed)
    c.setFillColor(C(R["land2"]))
    for _ in range(4):
        bx = x + rnd.random() * w * 0.7
        bby = y + rnd.random() * h * 0.7
        c.roundRect(bx, bby, w * (0.15 + rnd.random() * 0.2), h * (0.15 + rnd.random() * 0.2),
                    16, stroke=0, fill=1)
    # contours
    c.setStrokeColor(C(R["hair"]))
    c.setLineWidth(0.6)
    for i in range(4):
        yy = y + h * (0.18 + 0.2 * i)
        c.bezier(x, yy, x + w * 0.3, yy + 16, x + w * 0.6, yy - 14, x + w, yy + 8)
    if coast:
        # sea on the right third
        c.setFillColor(C(R["water"]))
        p2 = c.beginPath()
        p2.moveTo(x + w * 0.72, y)
        p2.curveTo(x + w * 0.66, y + h * 0.3, x + w * 0.8, y + h * 0.6, x + w * 0.7, y + h)
        p2.lineTo(x + w, y + h)
        p2.lineTo(x + w, y)
        p2.close()
        c.drawPath(p2, stroke=0, fill=1)
    else:
        c.setStrokeColor(C(R["water"]))
        c.setLineWidth(2.0)
        c.bezier(x + w * 0.08, y + 6, x + w * 0.35, y + h * 0.5, x + w * 0.6, y + h * 0.3,
                 x + w * 0.92, y + h - 8)
    c.restoreState()


def occ_dots(c, x, y, w, h, night, seed=11, n=10):
    rnd = random.Random(seed)
    cols_d = ["#6B7F2E", "#A63D2F", "#5C4632", "#2F4DA0"]
    cols_n = ["#FFD166", "#A8E063", "#FF9447", "#9BD4E4"]
    for i in range(n):
        px = x + 14 + rnd.random() * (w - 28)
        py = y + 14 + rnd.random() * (h - 28)
        if night:
            glow_dot(c, px, py, 2.2, cols_n[i % 4])
        else:
            c.setFillColor(C(cols_d[i % 4]))
            c.circle(px, py, 3.4, stroke=0, fill=1)


def rain_wash(c, x, y, w, h, night):
    col = C("#9BD4E4") if night else C("#2F4DA0")
    rnd = random.Random(3)
    c.setFillColor(col)
    for _ in range(4):
        bx = x + w * 0.06 + rnd.random() * w * 0.3
        bby = y + h * 0.5 + rnd.random() * h * 0.3
        rw = w * (0.1 + rnd.random() * 0.12)
        rh = h * (0.07 + rnd.random() * 0.09)
        c.setFillAlpha(0.10 if night else 0.07)
        c.roundRect(bx, bby, rw, rh, min(rw, rh) / 2, stroke=0, fill=1)
    c.setFillAlpha(1)


def wind_streaks(c, x, y, w, h, night, n=16):
    col = C("#D7E8DC") if night else C("#5A615B")
    rnd = random.Random(8)
    for _ in range(n):
        sx = x + rnd.random() * w * 0.9
        sy = y + rnd.random() * h * 0.9
        ln = 16 + rnd.random() * 22
        c.setStrokeColor(col)
        c.setStrokeAlpha(0.55 if night else 0.30)
        c.setLineWidth(0.9)
        c.bezier(sx, sy, sx + ln * 0.4, sy + 4, sx + ln * 0.7, sy + 5, sx + ln, sy + 8)
        if night:
            c.setFillColor(col)
            c.setFillAlpha(0.9)
            c.circle(sx + ln, sy + 8, 1.1, stroke=0, fill=1)
    c.setStrokeAlpha(1)
    c.setFillAlpha(1)


def frost_line(c, x, y, w, h, night):
    col = C("#BFE3EE") if night else C("#7FA8B8")
    c.setStrokeColor(col)
    c.setLineWidth(1.1)
    c.setDash(3, 4)
    c.bezier(x + 6, y + h * 0.72, x + w * 0.3, y + h * 0.6, x + w * 0.6, y + h * 0.82, x + w - 6, y + h * 0.68)
    c.setDash()
    for t in (0.2, 0.5, 0.8):
        px = x + 6 + (w - 12) * t
        py = y + h * (0.72 - 0.04 * math.sin(t * 6))
        c.setFont("DejaVuMono", 6)
        c.setFillColor(col)
        c.drawString(px, py + 4, "*")


def moon_disc(c, x, y, r, phase_color, bg_color, ink):
    c.setFillColor(C(phase_color))
    c.circle(x, y, r, stroke=0, fill=1)
    c.setFillColor(C(bg_color))
    c.circle(x - r * 0.42, y, r * 0.86, stroke=0, fill=1)
    c.setStrokeColor(ink if not isinstance(ink, str) else C(ink))
    c.setLineWidth(0.7)
    c.circle(x, y, r, stroke=1, fill=0)


def tide_bands(c, x, y, w, h, R, night, level=0.6):
    """Intertidal stepped bands along a coast occupying right third."""
    base = C("#9BD4E4") if night else C("#4D7E91")
    for i in range(4):
        t = i / 4.0
        c.setFillColor(base)
        c.setFillAlpha((0.30 if night else 0.20) * (1 - t) + 0.05)
        p = c.beginPath()
        off = 10 + i * 9
        p.moveTo(x + w * 0.72 - off, y)
        p.curveTo(x + w * 0.66 - off, y + h * 0.3, x + w * 0.8 - off, y + h * 0.6, x + w * 0.7 - off, y + h)
        p.lineTo(x + w * 0.7, y + h)
        p.curveTo(x + w * 0.8, y + h * 0.6, x + w * 0.66, y + h * 0.3, x + w * 0.72, y)
        p.close()
        c.drawPath(p, stroke=0, fill=1)
    c.setFillAlpha(1)


def tide_clock(c, x, y, r, R, rising=True, frac=0.62):
    c.setFillColor(C(R["panel"]))
    c.setStrokeColor(C(R["hair"]))
    c.setLineWidth(0.8)
    c.circle(x, y, r, stroke=1, fill=1)
    c.setStrokeColor(C("#4D7E91") if R is DAY else C("#9BD4E4"))
    c.setLineWidth(2.4)
    c.arc(x - r + 3, y - r + 3, x + r - 3, y + r - 3, 90, -(360 * frac))
    ang = math.radians(90 - 360 * frac)
    c.setFillColor(C(R["ink"]))
    c.circle(x + (r - 3) * math.cos(ang), y + (r - 3) * math.sin(ang), 2.2, stroke=0, fill=1)
    c.setFont("DejaVuMono", 5.4)
    c.setFillColor(C(R["sub"]))
    c.drawCentredString(x, y - 2, "RISING" if rising else "FALLING")


def sun_arc(c, x, y, w, R, t=0.42):
    """Sun-path arc widget; t = fraction of daylight elapsed."""
    c.setStrokeColor(C(R["hair"]))
    c.setLineWidth(1)
    c.arc(x, y - w * 0.18, x + w, y + w * 0.46, 0, 180)
    ang = math.radians(180 - 180 * t)
    cx0, cy0 = x + w / 2, y + w * 0.14
    rx, ry = w / 2, w * 0.32
    sx, sy = cx0 + rx * math.cos(ang), cy0 + ry * math.sin(ang)
    glow_dot(c, sx, sy, 3.2, "#FFD166" if R is NIGHT else "#D9A521")
    c.setStrokeColor(C(R["sub"]))
    c.setLineWidth(0.7)
    c.line(x - 4, y + w * 0.14, x + w + 4, y + w * 0.14)


def card_shell(c, x, y, w, h, R):
    c.setFillColor(C(R["panel"]))
    c.setFillAlpha(0.96)
    c.setStrokeColor(C(R["hair"]))
    c.setLineWidth(0.8)
    c.roundRect(x, y, w, h, 7, stroke=1, fill=1)
    c.setFillAlpha(1)


# ================================================================== pages

def p_cover(c):
    # split: day left, night right
    c.setFillColor(C(DAY["ground"]))
    c.rect(0, 0, PW / 2, PH, stroke=0, fill=1)
    c.setFillColor(C(NIGHT["ground"]))
    c.rect(PW / 2, 0, PW / 2, PH, stroke=0, fill=1)
    base_map(c, 0, 120, PW / 2, PH - 260, DAY, seed=5)
    base_map(c, PW / 2, 120, PW / 2, PH - 260, NIGHT, seed=5)
    occ_dots(c, 20, 140, PW / 2 - 40, PH - 300, night=False, seed=11)
    occ_dots(c, PW / 2 + 20, 140, PW / 2 - 40, PH - 300, night=True, seed=11)
    rain_wash(c, 30, 140, PW / 2 - 60, PH - 300, night=False)
    rain_wash(c, PW / 2 + 30, 140, PW / 2 - 60, PH - 300, night=True)
    wind_streaks(c, PW / 2 + 40, 160, PW / 2 - 80, PH - 320, night=True, n=10)
    moon_disc(c, PW - 90, PH - 180, 11, "#EDF3EA", NIGHT["ground"], NIGHT["sub"])
    # title strip
    c.setFillColor(C("#1F2421"))
    c.rect(0, PH - 116, PW, 70, stroke=0, fill=1)
    c.setFont("Lora", 24)
    c.setFillColor(C("#F1F5EC"))
    c.drawString(M, PH - 92, "The Living Map -- Round 4")
    c.setFont("Lato-Light", 9.5)
    c.setFillColor(C("#B9C4BB"))
    c.drawString(M, PH - 108, "Field Desk bones . Pigment Index skin . Night Survey after dark . the almanac's conditions, live")
    c.setFont("DejaVuMono", 7)
    c.setFillColor(C("#5A615B"))
    c.drawString(M, 96, "SAME PLACE, 2 PM")
    c.setFillColor(C("#9DB0A2"))
    c.drawRightString(PW - M, 96, "SAME PLACE, 11 PM")
    c.setFont("DejaVuMono", 6.5)
    c.setFillColor(C("#8B8F86"))
    c.drawString(M, 26, FOOTER)
    c.drawRightString(PW - M, 26, "01")


def p_synthesis(c, num):
    page_start(c, DAY["ground"], C("#8A9088"), num)
    ink, sub = C(DAY["ink"]), C(DAY["sub"])
    kicker(c, M, PH - 78, "ROUND 4 / WHAT YOU CHOSE, RESOLVED", C("#A63D2F"))
    c.setFont("Lora", 26)
    c.setFillColor(ink)
    c.drawString(M, PH - 112, "One site from three rounds of parts")
    picks = [
        ("UX skeleton", "Field Desk (R3-A)", "map dominant; search, cards, recipes float above it"),
        ("Light-mode skin", "Pigment Index (R2-III)", "material-derived color, mono labels, one fixed display face -- no seasonal type changes"),
        ("Dark register", "Night Survey (R2-I)", "not a permanent mode: the night state of a time-of-day system"),
        ("Boldness dial", "Overprint (R2-II)", "its poster energy offered at three volumes for the floating cards"),
        ("New layer", "Living conditions", "weather, sun and moon, tide -- the almanac's own subjects, drawn on the map"),
    ]
    y = PH - 146
    for a, b, d in picks:
        c.setFont("Lato-Bold", 9)
        c.setFillColor(C("#A63D2F"))
        c.drawString(M, y, a.upper())
        c.setFont("Lato-Bold", 10)
        c.setFillColor(ink)
        c.drawString(M + 128, y, b)
        block(c, M + 290, y, d, "Lato", 9, 390, 12, sub)
        c.setStrokeColor(C(DAY["hair"]))
        c.setLineWidth(0.5)
        c.line(M, y - 10, PW - M, y - 10)
        y -= 34
    block(c, M, y - 4,
          "The argument of this round: an almanac is a book of conditions -- weather, "
          "daylight, tides, the moon -- consulted because it knows what today is. A map "
          "that shows where things grow but not what the sky is doing is only half an "
          "almanac. The conditions layer closes that gap, gives the map its life, and "
          "gives night mode a reason to exist beyond taste.",
          "Lora-Italic", 11, PW - 2 * M, 15.5, C("#A63D2F"))
    block(c, M, y - 88,
          "Constants, as always: occurrence is not permission, in every popup. Safety colors "
          "fixed and CVD-safe in every register. Conditions inform; they never promise. Any new "
          "data source lands in ATTRIBUTION.md with license notes before it ships.",
          "Lato", 9, PW - 2 * M, 13, sub)


def p_sources(c, num):
    page_start(c, DAY["ground"], C("#8A9088"), num)
    ink, sub = C(DAY["ink"]), C(DAY["sub"])
    kicker(c, M, PH - 78, "RESEARCH / THE DATA IS FREE", C("#2F4DA0"))
    c.setFont("Lora", 24)
    c.setFillColor(ink)
    c.drawString(M, PH - 110, "Every condition has a public, key-less source")
    rows = [
        ("Weather now + forecast", "NWS api.weather.gov", "free, no key, no account; alerts, observations, forecasts",
         "fetch per viewport center, cache 30 min"),
        ("Radar-style precipitation", "Open-Meteo", "open-source, free non-commercial, no key; 15+ national models",
         "hourly precip grid; cache 30 min"),
        ("Recent rain (fungi logic)", "Open-Meteo historical", "past-72h precipitation by point",
         "drives 'flush likely' pulses; cache 6 h"),
        ("Tides + water level", "NOAA CO-OPS API", "public, free, no enforced limits; predictions + live levels",
         "nearest station per viewport; cache 1 h"),
        ("Sun + moon", "computed client-side", "solar position, twilight times, moon phase -- SunCalc-style math, ~2 KB",
         "zero network, exact for user's location"),
        ("Map light itself", "Mapbox Standard lightPreset", "dawn / day / dusk / night presets, one setConfigProperty call",
         "or two custom styles if we stay on classic"),
        ("Shellfish biotoxin closures", "state health depts", "hand-encoded like NPS compendiums; permission-required labeling",
         "updated by the 4am research loop"),
    ]
    y = PH - 144
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C("#2F4DA0"))
    c.drawString(M, y, "CONDITION")
    c.drawString(M + 165, y, "SOURCE")
    c.drawString(M + 330, y, "TERMS")
    c.drawString(M + 575, y, "STRATEGY")
    y -= 16
    for a, b, d, e in rows:
        c.setFont("Lato-Bold", 8.6)
        c.setFillColor(ink)
        for j, ln in enumerate(wrap(c, a, "Lato-Bold", 8.6, 150)):
            c.drawString(M, y - j * 10, ln)
        c.setFont("Lato", 8.6)
        c.setFillColor(C("#2F4DA0"))
        c.drawString(M + 165, y, b)
        c.setFillColor(sub)
        for j, ln in enumerate(wrap(c, d, "Lato", 8.2, 230)):
            c.drawString(M + 330, y - j * 10, ln)
        c.setFont("DejaVuMono", 6.4)
        for j, ln in enumerate(wrap(c, e, "DejaVuMono", 6.4, 120)):
            c.drawString(M + 575, y - j * 9, ln)
        c.setStrokeColor(C(DAY["hair"]))
        c.setLineWidth(0.5)
        c.line(M, y - 26, PW - M, y - 26)
        y -= 38
    block(c, M, y - 2,
          "Graceful degradation is the contract: if every API is down, the site is exactly "
          "today's site -- conditions are an enhancement layer, never a dependency. All "
          "sources enter ATTRIBUTION.md with license notes before launch.",
          "Lora-Italic", 10, PW - 2 * M, 14, C("#2F4DA0"))


def p_why(c, num):
    page_start(c, DAY["ground"], C("#8A9088"), num)
    ink, sub = C(DAY["ink"]), C(DAY["sub"])
    kicker(c, M, PH - 78, "WHY CONDITIONS BELONG", C("#A63D2F"))
    c.setFont("Lora", 24)
    c.setFillColor(ink)
    c.drawString(M, PH - 110, "Conditions gate the gathering -- they are not decoration")
    rows = [
        ("Rain, last 72 h", "fungi flush 2-3 days after; inky caps overnight; lichens rehydrate",
         "slippery banks; swollen creeks", "#2F4DA0"),
        ("First frost", "walnut hulls drop; persimmons sweeten; sap lines wake in late winter",
         "ice underfoot; season's hard stop", "#7FA8B8"),
        ("Wind", "seed and fiber gathering windows; drying days for harvested material",
         "widow-makers in the canopy -- stay out of old stands", "#5A615B"),
        ("Sun + twilight", "golden hour for color-true berry picking; UV and heat windows",
         "legal gathering hours in many parks end at dusk", "#D9A521"),
        ("Tide", "intertidal seaweed and shellfish access opens twice a day",
         "biotoxin closures override everything; turning tides strand", "#4D7E91"),
        ("Moon", "night walks for evening primrose, moths, low-tide nights",
         "headlamp ethics; private-land lines invisible after dark", "#8E2D56"),
    ]
    y = PH - 144
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C("#A63D2F"))
    c.drawString(M, y, "CONDITION")
    c.drawString(M + 130, y, "WHAT IT MEANS FOR CRAFT + FORAGING")
    c.drawString(M + 460, y, "WHAT IT MEANS FOR SAFETY")
    y -= 16
    for a, b, d, col in rows:
        c.setFillColor(C(col))
        c.circle(M + 4, y + 2, 3, stroke=0, fill=1)
        c.setFont("Lato-Bold", 9)
        c.setFillColor(ink)
        c.drawString(M + 14, y, a)
        c.setFont("Lato", 8.6)
        c.setFillColor(sub)
        for j, ln in enumerate(wrap(c, b, "Lato", 8.6, 310)):
            c.drawString(M + 130, y - j * 10.5, ln)
        for j, ln in enumerate(wrap(c, d, "Lato", 8.6, 220)):
            c.drawString(M + 460, y - j * 10.5, ln)
        c.setStrokeColor(C(DAY["hair"]))
        c.setLineWidth(0.5)
        c.line(M, y - 24, PW - M, y - 24)
        y -= 36
    block(c, M, y - 2,
          "Design rule that follows: every condition drawn on the map must answer 'so what "
          "should I do?' -- a rain wash without the fungi pulse is weather TV; with it, it is "
          "an almanac. And conditions never promise: 'flush likely' is a likelihood, said so.",
          "Lora-Italic", 10, PW - 2 * M, 14, C("#A63D2F"))


def p_registers(c, num):
    page_start(c, "#23282B", C("#7C8589"), num)
    kicker(c, M, PH - 78, "THE FOUR LIGHT REGISTERS", C("#FFD166"))
    c.setFont("Lora", 24)
    c.setFillColor(C("#F1F5EC"))
    c.drawString(M, PH - 110, "The site keeps the sun's hours")
    regs = [DAWN, DAY, DUSK, NIGHT]
    notes = ["civil dawn to sunrise +1h", "the working register", "golden hour to civil dusk", "dusk to dawn"]
    pwd = (PW - 2 * M - 54) / 4.0
    y0, hh = 226, 220
    for i, R in enumerate(regs):
        x = M + i * (pwd + 18)
        c.setFillColor(C(R["ground"]))
        c.roundRect(x, y0, pwd, hh, 8, stroke=0, fill=1)
        base_map(c, x + 10, y0 + 96, pwd - 20, hh - 130, R, seed=5)
        occ_dots(c, x + 10, y0 + 96, pwd - 20, hh - 130, night=(R is NIGHT), seed=11, n=5)
        # card sliver
        card_shell(c, x + 18, y0 + 40, pwd - 36, 44, R)
        c.setFont("Lora", 9.5)
        c.setFillColor(C(R["ink"]))
        c.drawString(x + 26, y0 + 66, "Elderberry")
        c.setFont("DejaVuMono", 5.2)
        c.setFillColor(C(R["sub"]))
        c.drawString(x + 26, y0 + 55, "RIPE WK 24-28")
        c.setFillColor(C("#2F8F46") if R in (DAY, DAWN) else C("#5BE08A"))
        c.circle(x + 30, y0 + 48, 2.6, stroke=0, fill=1)
        c.setFont("DejaVuMono", 5.0)
        c.setFillColor(C(R["sub"]))
        c.drawString(x + 37, y0 + 46, "ALLOWED HERE")
        c.setFont("Lato-Bold", 9)
        c.setFillColor(C(R["ink"]))
        c.drawString(x + 18, y0 + hh - 18, R["name"])
        c.setFont("DejaVuMono", 5.4)
        c.setFillColor(C(R["sub"]))
        c.drawString(x + 18, y0 + hh - 30, notes[i].upper())
    y = 196
    y = block(c, M, y,
              "Mechanics: solar position is computed client-side, so the register follows the "
              "user's actual sky -- sunset in Maine is not sunset in Texas. Each register is one "
              "CSS variable set plus one Mapbox lightPreset call; transitions crossfade over a "
              "minute, never mid-task. A manual override (sun/moon toggle) always wins and is "
              "remembered.",
              "Lato-Light", 9.5, PW - 2 * M, 13.5, C("#B9C4C0"))
    block(c, M, y - 8,
          "Safety palettes are tuned per register (luminance-shifted, hue-stable) and checked "
          "for CVD in all four. Dusk and dawn are brief, atmospheric, and optional -- "
          "classrooms can pin DAY; the projector never surprises anyone.",
          "Lato-Light", 9.5, PW - 2 * M, 13.5, C("#B9C4C0"))


def split_layer_page(c, num, title, sub_t, draw_day, draw_night, ann_day, ann_night, closing):
    page_start(c, DAY["ground"], C("#8A9088"), num)
    ink = C(DAY["ink"])
    kicker(c, M, PH - 70, "CONDITION LAYER", C("#2F4DA0"))
    c.setFont("Lora", 22)
    c.setFillColor(ink)
    c.drawString(M, PH - 98, title)
    c.setFont("Lora-Italic", 10.5)
    c.setFillColor(C(DAY["sub"]))
    c.drawString(M, PH - 116, sub_t)
    pwd = (PW - 2 * M - 20) / 2.0
    y0, hh = 200, 270
    # day panel
    base_map(c, M, y0, pwd, hh, DAY, coast=(title.startswith("Tide")), seed=5)
    draw_day(c, M, y0, pwd, hh)
    c.setFont("DejaVuMono", 6.2)
    c.setFillColor(C(DAY["sub"]))
    c.drawString(M, y0 - 12, "DAY REGISTER")
    # night panel
    c.setFillColor(C(NIGHT["ground"]))
    c.rect(M + pwd + 20, y0 - 0, pwd, hh, stroke=0, fill=1)
    base_map(c, M + pwd + 20, y0, pwd, hh, NIGHT, coast=(title.startswith("Tide")), seed=5)
    draw_night(c, M + pwd + 20, y0, pwd, hh)
    c.setFont("DejaVuMono", 6.2)
    c.setFillColor(C(DAY["sub"]))
    c.drawString(M + pwd + 20, y0 - 12, "NIGHT REGISTER")
    yA = block(c, M, y0 - 30, ann_day, "Lato", 8.8, pwd, 12, C(DAY["sub"]))
    yB = block(c, M + pwd + 20, y0 - 30, ann_night, "Lato", 8.8, pwd, 12, C(DAY["sub"]))
    block(c, M, min(yA, yB) - 8, closing, "Lora-Italic", 9.5, PW - 2 * M, 13, C("#2F4DA0"))


def p_weather(c, num):
    def day(c, x, y, w, h):
        rain_wash(c, x, y, w, h, night=False)
        wind_streaks(c, x, y, w, h, night=False)
        frost_line(c, x, y, w, h, night=False)
        occ_dots(c, x, y, w, h, night=False, n=6)
        # fungi pulse
        c.setStrokeColor(C("#5C4632"))
        for r in (6, 10):
            c.setStrokeAlpha(0.5 - r * 0.03)
            c.setLineWidth(1)
            c.circle(x + w * 0.32, y + h * 0.5, r, stroke=1, fill=0)
        c.setStrokeAlpha(1)
        chip(c, x + 10, y + h - 22, "RAIN 31MM / 48H . FLUSH LIKELY", "#FFFFFF", "#2F4DA0")
        chip(c, x + 10, y + 10, "FIRST FROST FORECAST: OCT 14", DAY["ink"], "#DCE9EE")

    def night(c, x, y, w, h):
        rain_wash(c, x, y, w, h, night=True)
        wind_streaks(c, x, y, w, h, night=True)
        occ_dots(c, x, y, w, h, night=True, n=6)
        glow_dot(c, x + w * 0.32, y + h * 0.5, 3, "#A8E063")
        c.setStrokeColor(C("#A8E063"))
        c.setStrokeAlpha(0.5)
        c.circle(x + w * 0.32, y + h * 0.5, 11, stroke=1, fill=0)
        c.setStrokeAlpha(1)
        chip(c, x + 10, y + h - 22, "RAIN 31MM / 48H . FLUSH LIKELY", "#0E1512", "#9BD4E4")

    split_layer_page(
        c, num, "Weather: rain remembered, wind drawn, frost foretold",
        "Open-Meteo + NWS; the map recalls the last three days because mushrooms do.",
        day, night,
        "Day: precipitation as quiet pigment-indigo washes; wind as faint drifting strokes; "
        "the first-frost forecast is a dotted isoline with a date. Rain memory rings pulse "
        "around fungal records when the past-72h total crosses a species' flush threshold.",
        "Night: the same data becomes light -- washes luminesce faintly, wind streaks carry "
        "glowing heads (the firefly grammar), pulses brighten. Nothing new is added; the "
        "register only re-voices it.",
        "The almanac move: weather is not a forecast widget in a corner -- it is drawn where "
        "it falls, and it answers 'so what': flush pulses, frost dates, drying days.")


def p_solar(c, num):
    def day(c, x, y, w, h):
        occ_dots(c, x, y, w, h, night=False, n=6)
        # golden hour band on west edge
        c.setFillColor(C("#D9A521"))
        c.setFillAlpha(0.18)
        c.rect(x, y, w * 0.2, h, stroke=0, fill=1)
        c.setFillAlpha(1)
        sun_arc(c, x + w * 0.3, y + h - 64, w * 0.4, DAY, t=0.78)
        c.setFont("DejaVuMono", 5.6)
        c.setFillColor(C(DAY["sub"]))
        c.drawString(x + w * 0.3, y + h - 76, "RISE 05:21 . SET 20:24 . GOLDEN 19:30")
        chip(c, x + 10, y + 10, "PARK GATHERING HOURS END AT DUSK", "#FFFFFF", "#C74437")

    def night(c, x, y, w, h):
        occ_dots(c, x, y, w, h, night=True, n=6)
        # terminator gradient: layered translucent ink from east
        for i in range(5):
            c.setFillColor(C("#0A0F0C"))
            c.setFillAlpha(0.12)
            c.rect(x + w * (0.55 + i * 0.09), y, w * 0.5, h, stroke=0, fill=1)
        c.setFillAlpha(1)
        moon_disc(c, x + w - 36, y + h - 30, 10, "#EDF3EA", NIGHT["land"], NIGHT["sub"])
        c.setFont("DejaVuMono", 5.4)
        c.setFillColor(C(NIGHT["sub"]))
        c.drawString(x + w - 110, y + h - 56, "WAXING 64% . UP TIL 01:40")
        chip(c, x + 10, y + 10, "TONIGHT: LOW-TIDE WALK . MOONLIT", "#0E1512", "#FFD166")

    split_layer_page(
        c, num, "Sun + moon: the day's edges, kept by the site",
        "Computed client-side -- zero network. The scrubber gains the sun's arc.",
        day, night,
        "Day: a sun-path arc rides the season scrubber with rise/set/golden-hour ticks; the "
        "golden band tints the map's west edge as it approaches. Where park rules end at "
        "dusk, the countdown chip says so plainly -- a rule, not a mood.",
        "Night: the terminator becomes visible geography -- the dark drawn as deepening ink "
        "across the map. The moon chip carries phase, illumination, and set time: the "
        "almanac's oldest data, doing modern wayfinding.",
        "Time-of-day registers and this layer are one system: the map's light preset follows "
        "the same solar math the widgets display. The site does not have a dark mode; it has "
        "a sky.")


def p_tide(c, num):
    def day(c, x, y, w, h):
        tide_bands(c, x, y, w, h, DAY, night=False)
        occ_dots(c, x, y, w * 0.6, h, night=False, n=4)
        tide_clock(c, x + 44, y + h - 44, 24, DAY, rising=True, frac=0.62)
        chip(c, x + 10, y + 10, "LOW 14:12 . WINDOW 90 MIN", DAY["ink"], "#DCE9EE")
        # closure hatch
        c.setStrokeColor(C("#C74437"))
        c.setLineWidth(1.2)
        for i in range(7):
            c.line(x + w * 0.68 + i * 7, y + h * 0.62, x + w * 0.74 + i * 7, y + h * 0.78)
        chip(c, x + w * 0.5, y + h - 22, "BIOTOXIN CLOSURE . NO SHELLFISH", "#FFFFFF", "#C74437")

    def night(c, x, y, w, h):
        tide_bands(c, x, y, w, h, NIGHT, night=True)
        occ_dots(c, x, y, w * 0.6, h, night=True, n=4)
        tide_clock(c, x + 44, y + h - 44, 24, NIGHT, rising=False, frac=0.31)
        c.setStrokeColor(C("#FF6B5E"))
        c.setLineWidth(1.2)
        for i in range(7):
            c.line(x + w * 0.68 + i * 7, y + h * 0.62, x + w * 0.74 + i * 7, y + h * 0.78)
        chip(c, x + w * 0.5, y + h - 22, "BIOTOXIN CLOSURE . NO SHELLFISH", "#0E1512", "#FF6B5E")

    split_layer_page(
        c, num, "Tide: the intertidal breathes twice a day",
        "NOAA CO-OPS predictions; the shore is the only map edge that moves.",
        day, night,
        "Day: stepped bands show the zone the falling tide is opening; the tide clock is a "
        "12.4-hour dial, rising or falling. The low-tide window -- the almanac's gift to "
        "seaweed and clam gatherers -- is a chip with minutes, not poetry.",
        "Night: bands carry moonlit luminance (low-tide nights are real gathering events); "
        "the dial inverts. Biotoxin closures are the one mark that never changes register "
        "logic: maximum-contrast hatch + chip, day or night.",
        "Closures override everything, everywhere, always -- the layer exists as much to say "
        "'not this week' as 'now'. Inland users simply never see this layer; it mounts only "
        "when the viewport touches a coast.")


def p_rail(c, num):
    page_start(c, DAY["ground"], C("#8A9088"), num)
    ink, sub = C(DAY["ink"]), C(DAY["sub"])
    kicker(c, M, PH - 70, "THE CONDITIONS RAIL", C("#2F4DA0"))
    c.setFont("Lora", 22)
    c.setFillColor(ink)
    c.drawString(M, PH - 98, "One floating strip holds the sky")
    # the rail mock (horizontal, as it docks on the map's top edge)
    rx, ry, rw, rh = M, PH - 210, PW - 2 * M, 64
    c.setFillColor(C("#FFFFFF"))
    c.setFillAlpha(0.96)
    c.setStrokeColor(C(DAY["hair"]))
    c.roundRect(rx, ry, rw, rh, 10, stroke=1, fill=1)
    c.setFillAlpha(1)
    seg = rw / 5.0
    # weather seg
    c.setFillColor(C("#2F4DA0"))
    c.circle(rx + 24, ry + rh / 2 + 8, 7, stroke=0, fill=1)
    c.setFont("Lato-Bold", 8.5)
    c.setFillColor(ink)
    c.drawString(rx + 40, ry + rh / 2 + 10, "Rain, 31 mm / 48 h")
    c.setFont("DejaVuMono", 5.8)
    c.setFillColor(sub)
    c.drawString(rx + 40, ry + rh / 2 - 2, "FLUSH LIKELY . 4 SPECIES")
    # sun seg
    sun_arc(c, rx + seg + 14, ry + 14, 56, DAY, t=0.78)
    c.setFont("DejaVuMono", 5.8)
    c.setFillColor(sub)
    c.drawString(rx + seg + 80, ry + rh / 2 + 6, "SET 20:24")
    c.drawString(rx + seg + 80, ry + rh / 2 - 5, "GOLDEN 19:30")
    # moon seg
    moon_disc(c, rx + 2 * seg + 26, ry + rh / 2 + 4, 9, "#3A3F3D", "#FFFFFF", sub)
    c.setFont("DejaVuMono", 5.8)
    c.setFillColor(sub)
    c.drawString(rx + 2 * seg + 44, ry + rh / 2 + 6, "WAXING 64%")
    c.drawString(rx + 2 * seg + 44, ry + rh / 2 - 5, "UP TIL 01:40")
    # tide seg
    tide_clock(c, rx + 3 * seg + 26, ry + rh / 2 + 4, 16, DAY, rising=True, frac=0.62)
    c.setFont("DejaVuMono", 5.8)
    c.setFillColor(sub)
    c.drawString(rx + 3 * seg + 50, ry + rh / 2 + 6, "LOW 14:12")
    c.drawString(rx + 3 * seg + 50, ry + rh / 2 - 5, "WINDOW 90 MIN")
    # frost seg
    c.setFont("DejaVuMono", 7.5)
    c.setFillColor(C("#7FA8B8"))
    c.drawString(rx + 4 * seg + 14, ry + rh / 2 + 8, "* FIRST FROST")
    c.setFont("DejaVuMono", 5.8)
    c.setFillColor(sub)
    c.drawString(rx + 4 * seg + 14, ry + rh / 2 - 4, "FORECAST OCT 14")
    for i in range(1, 5):
        c.setStrokeColor(C(DAY["hair"]))
        c.setLineWidth(0.6)
        c.line(rx + i * seg, ry + 10, rx + i * seg, ry + rh - 10)
    c.setFont("DejaVuMono", 6)
    c.setFillColor(sub)
    c.drawString(rx, ry - 14, "DOCKS TO THE MAP'S TOP EDGE . EACH SEGMENT EXPANDS TO ITS LAYER . COASTAL SEGMENT MOUNTS ONLY NEAR SHORE")
    y = block(c, M, ry - 44,
              "Tap a segment and its layer wakes on the map (the others rest -- one condition "
              "at a time keeps the map readable). The rail is also where conditions talk to "
              "data: 'flush likely . 4 species' is a filter -- tap it and the map shows exactly "
              "those four, pulsing where the rain fell.",
              "Lato", 9.5, PW - 2 * M, 13.5, sub)
    y = block(c, M, y - 10,
              "On phones the rail collapses to a single 'sky chip' (icon + the one most "
              "decision-relevant fact); it expands to the full strip on tap. In class, the rail "
              "is a lesson plan: today's entry, generated from the same numbers.",
              "Lato", 9.5, PW - 2 * M, 13.5, sub)
    block(c, M, y - 12,
          "Restraint contract: at most one ambient layer animating by default (wind OR rain "
          "wash), pulses decay after a minute of stillness, and prefers-reduced-motion stills "
          "everything. The map must remain a tool first, weather a voice second.",
          "Lora-Italic", 10, PW - 2 * M, 14, C("#2F4DA0"))


def full_mock(c, num, R, title_note):
    night = R is NIGHT
    page_start(c, R["ground"], C(R["sub"]), num)
    kicker(c, M, PH - 70, "THE LIVING MAP / FULL VIEW -- %s" % R["name"], C(R["accent"]))
    mx, my, mw, mh = M, 96, PW - 2 * M, PH - 196
    base_map(c, mx, my, mw, mh, R, seed=5)
    occ_dots(c, mx, my, mw, mh, night=night, n=12)
    rain_wash(c, mx, my, mw * 0.8, mh, night=night)
    if night:
        wind_streaks(c, mx, my, mw, mh, night=True, n=12)
    # conditions rail top (right of the search pill)
    rw, rh = mw * 0.56, 34
    rx, ry = mx + mw - rw - 16, my + mh - rh - 10
    card_shell(c, rx, ry, rw, rh, R)
    c.setFont("DejaVuMono", 5.6)
    c.setFillColor(C(R["sub"]))
    c.drawString(rx + 12, ry + rh / 2 - 2, "RAIN 31MM . FLUSH LIKELY 4 SP")
    sun_arc(c, rx + rw * 0.36, ry + 7, 34, R, t=0.9 if night else 0.78)
    c.drawString(rx + rw * 0.5, ry + rh / 2 - 2, "SET 20:24" if not night else "MOON 64% TIL 01:40")
    moon_disc(c, rx + rw * 0.82, ry + rh / 2, 6, R["ink"] if not isinstance(R["ink"], str) else R["ink"], R["panel"], R["sub"]) if night else None
    c.drawString(rx + rw * 0.66, ry + rh / 2 - 2, "* FROST OCT 14")
    # search pill
    spw = mw * 0.3
    card_shell(c, mx + 16, ry, spw, rh, R)
    c.setFont("DejaVuMono", 6)
    c.setFillColor(C(R["sub"]))
    c.drawString(mx + 28, ry + rh / 2 - 2, "Search...   ^K")
    # season scrubber bottom
    sw = mw * 0.5
    card_shell(c, mx + (mw - sw) / 2, my + 12, sw, 30, R)
    months = "JFMAMJJASOND"
    for i, mch in enumerate(months):
        c.setFont("DejaVuMono", 5.4)
        c.setFillColor(C(R["ink"]) if i == 5 else C(R["sub"]))
        c.drawString(mx + (mw - sw) / 2 + 14 + i * (sw - 28) / 11, my + 28, mch)
    c.setFillColor(C(R["accent"]))
    c.circle(mx + (mw - sw) / 2 + 14 + 5 * (sw - 28) / 11 + 2, my + 21, 3, stroke=0, fill=1)
    # peek card
    pkw, pkh = 196, 128
    pkx, pky = mx + mw - pkw - 18, my + mh * 0.32
    card_shell(c, pkx, pky, pkw, pkh, R)
    c.setFillColor(C("#5C4632"))
    c.rect(pkx, pky, 5, pkh, stroke=0, fill=1)
    c.setFont("Lora", 11.5)
    c.setFillColor(C(R["ink"]))
    c.drawString(pkx + 16, pky + pkh - 22, "Elderberry")
    c.setFont("DejaVuMono", 5.6)
    c.setFillColor(C(R["sub"]))
    c.drawString(pkx + 16, pky + pkh - 34, "NO. 012 . RIPE WK 24-28 . FLUSH N/A")
    hist(c, pkx + 16, pky + 52, pkw - 32, 24, MONTH_VALS, "#6B7F2E" if not night else "#A8E063")
    sa = SAFETY if not night else SAFETY_NIGHT
    chip(c, pkx + 16, pky + 28, "ALLOWED . 1 GAL/DAY", "#FFFFFF" if not night else "#0E1512", sa[0][1])
    c.setFont("DejaVuMono", 5.2)
    c.setFillColor(C("#D89B24") if not night else C("#FFC94D"))
    c.drawString(pkx + 16, pky + 12, "OCCURRENCE IS NOT PERMISSION")
    block(c, M, my - 14, title_note, "Lato", 9, PW - 2 * M, 12.5, C(R["sub"]))


def boldness_page(c, num, level, name, desc, drawer, verdict):
    page_start(c, DAY["ground"], C("#8A9088"), num)
    ink, sub = C(DAY["ink"]), C(DAY["sub"])
    kicker(c, M, PH - 70, "CARD BOLDNESS / OPTION %s" % level, C("#A63D2F"))
    c.setFont("Lora", 24)
    c.setFillColor(ink)
    c.drawString(M, PH - 100, name)
    block(c, M, PH - 124, desc, "Lato", 9.6, 420, 13.5, sub)
    # light panel
    pwd = (PW - 2 * M - 20) / 2.0
    y0, hh = 170, 250
    base_map(c, M, y0, pwd, hh, DAY, seed=5)
    occ_dots(c, M, y0, pwd, hh, night=False, n=5)
    drawer(c, M + pwd * 0.18, y0 + 36, DAY, False)
    c.setFont("DejaVuMono", 6.2)
    c.setFillColor(sub)
    c.drawString(M, y0 - 12, "ON THE DAY MAP")
    c.setFillColor(C(NIGHT["ground"]))
    c.rect(M + pwd + 20, y0, pwd, hh, stroke=0, fill=1)
    base_map(c, M + pwd + 20, y0, pwd, hh, NIGHT, seed=5)
    occ_dots(c, M + pwd + 20, y0, pwd, hh, night=True, n=5)
    drawer(c, M + pwd + 20 + pwd * 0.18, y0 + 36, NIGHT, True)
    c.setFont("DejaVuMono", 6.2)
    c.setFillColor(sub)
    c.drawString(M + pwd + 20, y0 - 12, "ON THE NIGHT MAP")
    block(c, M, y0 - 34, verdict, "Lora-Italic", 9.8, PW - 2 * M, 13.5, C("#A63D2F"))


def card_quiet(c, x, y, R, night):
    w, h = 188, 150
    card_shell(c, x, y, w, h, R)
    c.setFillColor(C("#5C4632"))
    c.rect(x, y, 4, h, stroke=0, fill=1)
    c.setFont("Lora", 12)
    c.setFillColor(C(R["ink"]))
    c.drawString(x + 16, y + h - 24, "Elderberry")
    c.setFont("DejaVuMono", 5.6)
    c.setFillColor(C(R["sub"]))
    c.drawString(x + 16, y + h - 36, "NO. 012 . SAMBUCUS . WK 24-28")
    hist(c, x + 16, y + 62, w - 32, 26, MONTH_VALS, "#6B7F2E" if not night else "#A8E063")
    sa = SAFETY if not night else SAFETY_NIGHT
    c.setFillColor(C(sa[0][1]))
    c.circle(x + 21, y + 44, 3.4, stroke=0, fill=1)
    c.setFont("Lato", 8)
    c.setFillColor(C(R["ink"]))
    c.drawString(x + 30, y + 41, "Allowed here -- 1 gal/day")
    c.setFont("DejaVuMono", 5.2)
    c.setFillColor(C("#D89B24") if not night else C("#FFC94D"))
    c.drawString(x + 16, y + 12, "OCCURRENCE IS NOT PERMISSION")


def card_bold(c, x, y, R, night):
    w, h = 188, 150
    c.setFillColor(C(R["panel"]))
    c.setStrokeColor(C(R["ink"]))
    c.setLineWidth(1.8)
    c.roundRect(x, y, w, h, 6, stroke=1, fill=1)
    c.setFillColor(C("#5C4632"))
    c.roundRect(x, y + h - 34, w, 34, 6, stroke=0, fill=1)
    c.rect(x, y + h - 28, w, 28, stroke=0, fill=1)
    c.setFont("Lato-Black", 12)
    c.setFillColor(C("#FFFFFF"))
    c.drawString(x + 14, y + h - 23, "ELDERBERRY")
    c.setFont("DejaVuMono", 5.6)
    c.setFillColor(C(R["sub"]))
    c.drawString(x + 14, y + h - 48, "NO. 012 . SAMBUCUS . WK 24-28")
    hist(c, x + 14, y + 58, w - 28, 26, MONTH_VALS, "#6B7F2E" if not night else "#A8E063")
    sa = SAFETY if not night else SAFETY_NIGHT
    chip(c, x + 14, y + 32, "ALLOWED . 1 GAL/DAY", "#FFFFFF" if not night else "#0E1512", sa[0][1],
         font="Lato-Bold", size=6.4)
    c.setFont("DejaVuMono", 5.2)
    c.setFillColor(C("#D89B24") if not night else C("#FFC94D"))
    c.drawString(x + 14, y + 12, "OCCURRENCE IS NOT PERMISSION")


def card_poster(c, x, y, R, night):
    w, h = 188, 150
    # offset duotone shadow
    c.setFillColor(C("#A63D2F"))
    c.roundRect(x + 4, y - 4, w, h, 6, stroke=0, fill=1)
    c.setFillColor(C(R["panel"]))
    c.setStrokeColor(C(R["ink"]))
    c.setLineWidth(2.6)
    c.roundRect(x, y, w, h, 6, stroke=1, fill=1)
    c.setFillAlpha(0.85)
    c.setFont("Lato-Black", 15)
    c.setFillColor(C("#A63D2F"))
    c.drawString(x + 14 + 1.5, y + h - 26, "ELDER-")
    c.drawString(x + 14 + 1.5, y + h - 43, "BERRY")
    c.setFillColor(C("#2F4DA0"))
    c.drawString(x + 14, y + h - 27.5, "ELDER-")
    c.drawString(x + 14, y + h - 44.5, "BERRY")
    c.setFillAlpha(1)
    # halftone corner
    c.setFillColor(C(R["ink"]))
    for j in range(4):
        for i in range(6):
            c.circle(x + w - 52 + i * 8, y + h - 12 - j * 8, 0.8 + 0.16 * i, stroke=0, fill=1)
    c.setFont("DejaVuMono", 5.6)
    c.setFillColor(C(R["sub"]))
    c.drawString(x + 14, y + h - 58, "NO. 012 . SAMBUCUS . WK 24-28")
    hist(c, x + 14, y + 52, w - 28, 24, MONTH_VALS, "#A63D2F" if not night else "#FF9447")
    sa = SAFETY if not night else SAFETY_NIGHT
    chip(c, x + 14, y + 28, "ALLOWED . 1 GAL/DAY", "#FFFFFF" if not night else "#0E1512", sa[0][1],
         font="Lato-Black", size=6.6)
    c.setFont("DejaVuMono", 5.2)
    c.setFillColor(C("#D89B24") if not night else C("#FFC94D"))
    c.drawString(x + 14, y + 10, "OCCURRENCE IS NOT PERMISSION")


def p_dial(c, num):
    page_start(c, DAY["ground"], C("#8A9088"), num)
    ink, sub = C(DAY["ink"]), C(DAY["sub"])
    kicker(c, M, PH - 70, "CARD BOLDNESS / RECOMMENDATION", C("#A63D2F"))
    c.setFont("Lora", 24)
    c.setFillColor(ink)
    c.drawString(M, PH - 100, "A dial per surface, not one volume for the site")
    rows = [
        ("Floating peek cards + popups", "2 . BOLD EDITION",
         "the living map is busy; cards need ink-edged authority to float over weather without shouting"),
        ("Plant pages, rules, citations", "1 . QUIET PIGMENT",
         "reading surfaces; the spine-tab and pigment fields carry identity, type stays calm"),
        ("Recipe broadsides + posters", "3 . POSTER OVERPRINT",
         "the print-shop register earns its volume where instructions want to be pinned to a wall"),
        ("Safety chips + closures", "FIXED",
         "identical at every volume, every register -- boldness never applies to meaning"),
        ("The conditions rail", "2 . BOLD EDITION",
         "matches the cards it lives among; its data stays mono and quiet"),
    ]
    y = PH - 140
    for a, b, d in rows:
        c.setFont("Lato-Bold", 10)
        c.setFillColor(ink)
        c.drawString(M, y, a)
        c.setFont("Lato-Black", 9)
        c.setFillColor(C("#A63D2F"))
        c.drawString(M + 250, y, b)
        block(c, M + 405, y + 4, d, "Lato", 8.6, 285, 11, sub)
        c.setStrokeColor(C(DAY["hair"]))
        c.setLineWidth(0.5)
        c.line(M, y - 14, PW - M, y - 14)
        y -= 44
    block(c, M, y - 4,
          "If you want one answer: Bold Edition is the default voice of the floating UI -- "
          "Pigment Index's materials with Overprint's spine. Quiet and Poster are its inside "
          "voice and outside voice. All three share one geometry, so the dial is a CSS class, "
          "not a redesign.",
          "Lora-Italic", 10.5, PW - 2 * M, 15, C("#A63D2F"))


def p_tech(c, num):
    page_start(c, "#23282B", C("#7C8589"), num)
    kicker(c, M, PH - 78, "TECH, PERFORMANCE + RISK", C("#FFD166"))
    c.setFont("Lora", 24)
    c.setFillColor(C("#F1F5EC"))
    c.drawString(M, PH - 110, "Living, within the no-build constraint")
    rows = [
        ("Registers", "4 CSS variable sets + Mapbox lightPreset; solar-keyed, crossfade 60 s, manual override persists"),
        ("Rain wash", "SVG blobs from Open-Meteo grid, CSS opacity; redraw on pan-end only"),
        ("Wind", "<= 120 streak particles, one canvas layer, requestAnimationFrame; killed off-screen and on reduced-motion"),
        ("Pulses", "CSS keyframe rings on existing point layer; decay after 60 s idle"),
        ("Tide", "two shoreline polygons interpolated by CO-OPS prediction; 1 fetch/hour"),
        ("Caching", "all condition fetches cached in localStorage with TTL; offline = last known + timestamp"),
        ("Budget", "conditions layer <= 60 KB JS total, zero new fonts, zero build steps"),
    ]
    y = PH - 144
    for a, b in rows:
        c.setFont("Lato-Bold", 9.5)
        c.setFillColor(C("#FFD166"))
        c.drawString(M, y, a.upper())
        y = block(c, M + 110, y, b, "Lato-Light", 9.2, 560, 12.5, C("#C9D2CC")) - 14
    c.setFont("Lato-Bold", 8.5)
    c.setFillColor(C("#FFD166"))
    c.drawString(M, y - 6, "RISKS")
    block(c, M, y - 24,
          "API drift or outage (degrade to today's site, show data age); motion distracting "
          "from the tool (one ambient layer max, idle decay, reduced-motion); battery on "
          "phones in the field (particles off on battery-saver); register changing mid-"
          "demo in class (pin DAY, remembered per device); condition data implying promises "
          "('likely' language audited the way rules language already is).",
          "Lato-Light", 9.5, 640, 13.5, C("#C9D2CC"))


def p_asks(c, num):
    page_start(c, "#1F2421", C("#7C8589"), num)
    kicker(c, M, PH - 78, "ROUND 4 / DECISIONS WE NEED", C("#FFD166"))
    c.setFont("Lora", 26)
    c.setFillColor(C("#F1F5EC"))
    c.drawString(M, PH - 112, "Five asks")
    asks = [
        ("01", "Confirm the spine.",
         "Field Desk + Pigment Index day + Night Survey night + conditions layer. If yes, this becomes the brief's "
         "'decided foundations' update and Round 5 is a live prototype."),
        ("02", "Pick the card volume.",
         "Quiet / Bold Edition / Poster for the floating UI -- or accept the per-surface dial as recommended."),
        ("03", "Scope the first conditions.",
         "Suggested build order: sun/moon (free, offline, powers registers) -> rain memory + flush pulses -> "
         "wind -> tide (coastal viewports only). Trim or reorder freely."),
        ("04", "Registers: four or two?",
         "Dawn and dusk are atmosphere; day and night are function. Shipping two first is simpler; "
         "four is more almanac. Your call on ambition."),
        ("05", "Name the prototype place.",
         "A real viewport (your teaching region?) for the prototype so tide/weather demos use true data."),
    ]
    y = PH - 150
    for n, head, body in asks:
        c.setFont("DejaVuMono", 9)
        c.setFillColor(C("#FFD166"))
        c.drawString(M, y, n)
        c.setFont("Lato-Bold", 11.5)
        c.setFillColor(C("#F1F5EC"))
        c.drawString(M + 30, y, head)
        y = block(c, M + 30, y - 14, body, "Lato-Light", 9.3, 620, 13, C("#C9D2CC")) - 15
    block(c, M, y - 2,
          "Round 5 proposal: a one-page live prototype on design/relaunch -- real map, real "
          "sun math, one condition (rain memory), Bold Edition cards, day/night registers.",
          "Lora-Italic", 10.5, 640, 15, C("#FFD166"))


def main():
    c = canvas.Canvas(str(OUT), pagesize=(PW, PH))
    n = 1
    p_cover(c); c.showPage(); n += 1
    p_synthesis(c, n); c.showPage(); n += 1
    p_sources(c, n); c.showPage(); n += 1
    p_why(c, n); c.showPage(); n += 1
    p_registers(c, n); c.showPage(); n += 1
    p_weather(c, n); c.showPage(); n += 1
    p_solar(c, n); c.showPage(); n += 1
    p_tide(c, n); c.showPage(); n += 1
    p_rail(c, n); c.showPage(); n += 1
    full_mock(c, n, DAY,
              "Everything chosen, together, at 2 pm: Pigment Index ground and cards, walnut spine-tabs, "
              "the conditions rail docked above, rain washes where it rained, the scrubber keeping the "
              "season. The map dominates; the UI floats; nothing scrolls.")
    c.showPage(); n += 1
    full_mock(c, n, NIGHT,
              "The same view at 11 pm, untouched by hand: the register followed the sun. Data becomes "
              "light (Night Survey's grammar), wind carries glowing heads, the moon takes the rail. "
              "Safety chips hold their meaning at night luminance.")
    c.showPage(); n += 1
    boldness_page(c, n, "1", "Quiet Pigment",
                  "Round 2-III untouched: hairline shell, pigment spine-tab, serif name, mono data. "
                  "The most archival voice; identity carried by material color alone.",
                  card_quiet,
                  "Strong on reading surfaces; on the living map it can recede -- over weather washes "
                  "the hairline shell asks the eye to work.")
    c.showPage(); n += 1
    boldness_page(c, n, "2", "Bold Edition",
                  "Pigment Index materials with Overprint's spine: 2 pt ink border, pigment header "
                  "band with reversed wood-type name, solid chips. No misregistration -- "
                  "confidence without costume.",
                  card_bold,
                  "The recommended floating-UI voice: holds its edge over rain, wind, and night glow "
                  "in both registers, and the pigment band still does the teaching.")
    c.showPage(); n += 1
    boldness_page(c, n, "3", "Poster Overprint",
                  "The full print-shop: thick border, offset two-ink shadow, stacked overprint title, "
                  "halftone corner. Round 2-II's energy, contained to a card.",
                  card_poster,
                  "Joyful and unmistakable -- and a lot, multiplied across a busy map. Earns its keep "
                  "on recipe broadsides and posters; as the default card it fights the weather for "
                  "attention.")
    c.showPage(); n += 1
    p_dial(c, n); c.showPage(); n += 1
    p_tech(c, n); c.showPage(); n += 1
    p_asks(c, n); c.showPage(); n += 1
    c.save()
    print("Wrote %s (%d pages)" % (OUT, n - 1))


if __name__ == "__main__":
    main()
