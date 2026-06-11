#!/usr/bin/env python3
"""Generate the Round 1 brand-directions deck (PDF) for Craft Almanac.

Vector-only: palettes, type settings, wordmark studies, illustration
languages, and UI vignettes are drawn with reportlab. Display typefaces are
stand-ins (recommended retail faces are named on each type page).

Usage: python3 docs/design/build_round1_deck.py
Output: docs/design/round-1-directions.pdf
"""

import math
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "round-1-directions.pdf"

PW, PH = 792, 612  # US Letter landscape
M = 54             # outer margin

FONT_DIRS = {
    "Lora": "/usr/share/fonts/truetype/google-fonts/Lora-Variable.ttf",
    "Lora-Italic": "/usr/share/fonts/truetype/google-fonts/Lora-Italic-Variable.ttf",
    "Poppins": "/usr/share/fonts/truetype/google-fonts/Poppins-Regular.ttf",
    "Poppins-Medium": "/usr/share/fonts/truetype/google-fonts/Poppins-Medium.ttf",
    "Poppins-Bold": "/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf",
    "Poppins-Light": "/usr/share/fonts/truetype/google-fonts/Poppins-Light.ttf",
    "Lato": "/usr/share/fonts/truetype/lato/Lato-Regular.ttf",
    "Lato-Bold": "/usr/share/fonts/truetype/lato/Lato-Bold.ttf",
    "Lato-Black": "/usr/share/fonts/truetype/lato/Lato-Black.ttf",
    "Lato-Light": "/usr/share/fonts/truetype/lato/Lato-Light.ttf",
    "DejaVuMono": "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    "DejaVuSerifCondB": "/usr/share/fonts/truetype/dejavu/DejaVuSerifCondensed-Bold.ttf",
}
for name, path in FONT_DIRS.items():
    pdfmetrics.registerFont(TTFont(name, path))

# ---------------------------------------------------------------- directions

D1 = dict(
    key="I",
    name="Specimen Modern",
    tagline="The field journal, gallery-grade.",
    paper="#F6F3EA", ink="#211F1A", sub="#5B5850", hair="#CFC9B8",
    accent="#6F8F3F",
    seasons=[("Spring", "#6F8F3F", "fiddlehead"), ("Summer", "#8E3B55", "bramble"),
             ("Autumn", "#B06F2B", "hickory"), ("Winter", "#3E5E5A", "juniper")],
    display_font="Times-Roman", display_tracking=6.5,
    text_font="Lora", label_font="DejaVuMono", ui_font="Lato",
    display_rec="Fraunces (display) or GT Alpina",
    text_rec="Source Serif 4", ui_rec="Inter", label_rec="IBM Plex Mono",
    voice=("Elderberry -- Sambucus canadensis. Gather only the fully ripe "
           "umbels; leave the stems standing for the birds. Allowed here: "
           "one gallon per person per day."),
    concept=("Herbarium plates, specimen labels, and survey instruments, "
             "composed with contemporary museum restraint. Everything is "
             "pinned, numbered, and beautiful because it is precise. The map "
             "reads as a scientific instrument you are trusted to hold."),
    motifs="Hairline rules. Specimen numbers. Letterspaced capitals. Pinned drawings on generous paper.",
    risk="May read cool or studied where the brief asks for invitation; warmth must come from voice and color.",
)

D2 = dict(
    key="II",
    name="The Living Almanac",
    tagline="A book that knows what week it is.",
    paper="#F8F2E2", ink="#2A2118", sub="#6A5B45", hair="#DCCFB4",
    accent="#C09238",
    seasons=[("Spring", "#7FA05A", "willow"), ("Summer", "#9C4F3E", "rosehip"),
             ("Autumn", "#A8702A", "goldenrod"), ("Winter", "#54657A", "slate sky")],
    display_font="Lora-Italic", display_tracking=0,
    text_font="Lora", label_font="Lato", ui_font="Lato",
    display_rec="Instrument Serif Italic or Editorial New",
    text_rec="Lora", ui_rec="Lato or Karla", label_rec="Lato SmallCaps",
    voice=("Week of June 10 -- elderflower gives way to green fruit, and "
           "mulberries drop on warm sidewalks. Pick what you will use "
           "tonight; the season is long."),
    concept=("The almanac itself becomes the identity: mastheads, week "
             "strips, marginalia, sun-and-season dials. The palette turns "
             "with the calendar so October and April are different rooms in "
             "the same house. Lyrical, generous, alive."),
    motifs="Masthead rules. A gold thread. Week-of strips. Margin notes in italic. Season dials.",
    risk="The lyric register can tip precious; safety and rules must stay plain-spoken and visually firm.",
)

D3 = dict(
    key="III",
    name="Forage Press",
    tagline="Folk craft with poster confidence.",
    paper="#F2EFE6", ink="#14130F", sub="#4E4B42", hair="#D3CEC0",
    accent="#D9622B",
    seasons=[("Spring", "#5E7D3C", "field green"), ("Summer", "#D9622B", "persimmon"),
             ("Autumn", "#D9A031", "ochre"), ("Winter", "#2F4470", "indigo")],
    display_font="DejaVuSerifCondB", display_tracking=1.5,
    text_font="Lato", label_font="Poppins-Medium", ui_font="Lato",
    display_rec="Archivo Black or a licensed woodtype revival",
    text_rec="Bricolage Grotesque or Lato", ui_rec="Bricolage Grotesque", label_rec="Poppins Medium",
    voice=("TAKE A LITTLE. LEAVE THE REST. Elderberries are ripe along the "
           "field edge -- one gallon a day is the rule here, and the recipe "
           "for ink is on the back of this card."),
    concept=("The folk register pushed hard into now: modern woodcut "
             "illustration, flat decisive color, woodtype-scale headlines. "
             "A print shop for people who make things. Avoids kitsch with "
             "geometry and restraint, never distressing."),
    motifs="Chunky rules. Two-color cuts. Print-shop ornaments. Instructional plates like recipe cards.",
    risk="Boldest departure; must hold classroom credibility -- the text layer carries the rigor.",
)

DIRECTIONS = [D1, D2, D3]

# ------------------------------------------------------------------- helpers

def C(h):
    return HexColor(h)


def page_start(c, d, footer=True, paper=None):
    c.setFillColor(C(paper or d["paper"]))
    c.rect(0, 0, PW, PH, stroke=0, fill=1)
    if footer:
        c.setFont("Lato", 7.5)
        c.setFillColor(C(d["sub"]))
        c.drawString(M, 26, "CRAFT ALMANAC  /  BRAND DIRECTIONS  /  ROUND 1")
        c.drawRightString(PW - M, 26, f"{c.getPageNumber():02d}")


def tracked(c, x, y, text, font, size, tracking, color):
    c.setFont(font, size)
    c.setFillColor(color)
    cx = x
    for ch in text:
        c.drawString(cx, y, ch)
        cx += pdfmetrics.stringWidth(ch, font, size) + tracking
    return cx - tracking


def tracked_width(text, font, size, tracking):
    return sum(pdfmetrics.stringWidth(ch, font, size) for ch in text) + tracking * (len(text) - 1)


def wrap_text(c, x, y, w, text, font, size, leading, color):
    c.setFont(font, size)
    c.setFillColor(color)
    words, line = text.split(), ""
    for word in words:
        trial = (line + " " + word).strip()
        if pdfmetrics.stringWidth(trial, font, size) <= w:
            line = trial
        else:
            c.drawString(x, y, line)
            y -= leading
            line = word
    if line:
        c.drawString(x, y, line)
    return y - leading


def kicker(c, d, x, y, text, color=None):
    tracked(c, x, y, text.upper(), "Lato-Bold", 8, 2.2, color or C(d["sub"]))


def hrule(c, d, x, y, w, weight=0.7, color=None):
    c.setStrokeColor(color or C(d["hair"]))
    c.setLineWidth(weight)
    c.line(x, y, x + w, y)


def swatch(c, d, x, y, w, h, hexcode, label, sub=""):
    c.setFillColor(C(hexcode))
    c.rect(x, y, w, h, stroke=0, fill=1)
    c.setStrokeColor(C(d["hair"]))
    c.setLineWidth(0.5)
    c.rect(x, y, w, h, stroke=1, fill=0)
    c.setFont("Lato-Bold", 7.5)
    c.setFillColor(C(d["ink"]))
    c.drawString(x, y - 11, label)
    c.setFont("DejaVuMono", 6.5)
    c.setFillColor(C(d["sub"]))
    c.drawString(x, y - 21, hexcode.upper() + ("  " + sub if sub else ""))


# ------------------------------------------------------- drawn illustrations

def draw_elderberry(c, d, x, y, s, mode):
    ink, acc = C(d["ink"]), C(d["accent"])
    c.saveState()
    c.translate(x, y)
    c.scale(s, s)
    c.setStrokeColor(ink)
    c.setLineCap(1)
    lw = {"line": 0.9, "lyric": 1.1, "poster": 2.6}[mode]
    c.setLineWidth(lw)
    c.line(0, 0, 0, 46)  # main stem
    for ang in (-48, -20, 16, 44):
        a = math.radians(90 + ang)
        c.line(0, 46, 26 * math.cos(a), 46 + 22 * math.sin(a) * 0.7)
    rad = {"line": 2.1, "lyric": 2.5, "poster": 3.4}[mode]
    for ang in (-48, -20, 16, 44):
        a = math.radians(90 + ang)
        bx, by = 26 * math.cos(a), 46 + 22 * math.sin(a) * 0.7
        for i in range(5):
            aa = a + math.radians((i - 2) * 16)
            px, py = bx + 9 * math.cos(aa), by + 9 * math.sin(aa)
            if mode == "line":
                c.setFillColor(C(d["paper"]))
                c.circle(px, py, rad, stroke=1, fill=1)
            else:
                c.setFillColor(acc if mode == "poster" else ink)
                c.circle(px, py, rad, stroke=0, fill=1)
    # leaf pair
    c.setLineWidth(lw)
    for sgn in (-1, 1):
        p = c.beginPath()
        p.moveTo(0, 18)
        p.curveTo(sgn * 14, 24, sgn * 26, 16, sgn * 30, 6)
        p.curveTo(sgn * 18, 8, sgn * 8, 10, 0, 18)
        if mode == "poster":
            c.setFillColor(C(d["seasons"][0][1]))
            c.drawPath(p, stroke=0, fill=1)
        else:
            c.drawPath(p, stroke=1, fill=0)
    c.restoreState()


def draw_morel(c, d, x, y, s, mode):
    ink = C(d["ink"])
    c.saveState()
    c.translate(x, y)
    c.scale(s, s)
    lw = {"line": 0.9, "lyric": 1.1, "poster": 2.6}[mode]
    c.setStrokeColor(ink)
    c.setLineWidth(lw)
    # stipe
    p = c.beginPath()
    p.moveTo(-7, 0)
    p.curveTo(-5, 12, -5, 16, -6, 22)
    p.lineTo(6, 22)
    p.curveTo(5, 16, 5, 12, 7, 0)
    p.close()
    if mode == "poster":
        c.setFillColor(C(d["paper"]))
        c.drawPath(p, stroke=1, fill=1)
    else:
        c.drawPath(p, stroke=1, fill=0)
    # cap
    p = c.beginPath()
    p.moveTo(-11, 22)
    p.curveTo(-15, 36, -10, 52, 0, 56)
    p.curveTo(10, 52, 15, 36, 11, 22)
    p.close()
    if mode == "poster":
        c.setFillColor(C(d["accent"]))
        c.drawPath(p, stroke=1, fill=1)
        c.setStrokeColor(C(d["paper"]))
        c.setLineWidth(1.4)
    else:
        c.drawPath(p, stroke=1, fill=0)
        c.setLineWidth(lw * 0.7)
    # honeycomb pits
    for row in range(4):
        yy = 27 + row * 8
        wfrac = 1 - abs(row - 1.2) * 0.16
        for col in range(-1, 2):
            xx = col * 7 * wfrac
            if mode == "line":
                c.ellipse(xx - 2.6, yy - 3.2, xx + 2.6, yy + 3.2, stroke=1, fill=0)
            else:
                c.line(xx - 2.4, yy - 2.8, xx + 2.4, yy + 2.8)
    c.restoreState()


def draw_oak(c, d, x, y, s, mode):
    ink = C(d["ink"])
    c.saveState()
    c.translate(x, y)
    c.scale(s, s)
    lw = {"line": 0.9, "lyric": 1.1, "poster": 2.6}[mode]
    c.setStrokeColor(ink)
    c.setLineWidth(lw)
    # oak leaf: lobed outline
    p = c.beginPath()
    p.moveTo(0, 0)
    pts = [(6, 8), (14, 10), (10, 18), (18, 22), (12, 30), (16, 40), (6, 42),
           (0, 52), (-6, 42), (-16, 40), (-12, 30), (-18, 22), (-10, 18), (-14, 10), (-6, 8)]
    for px, py in pts:
        p.lineTo(px, py)
    p.close()
    if mode == "poster":
        c.setFillColor(C(d["seasons"][3][1]))
        c.drawPath(p, stroke=0, fill=1)
        c.setStrokeColor(C(d["paper"]))
        c.setLineWidth(1.6)
        c.line(0, 4, 0, 46)
    else:
        c.drawPath(p, stroke=1, fill=0)
        c.line(0, 2, 0, 48)
        for px, py in ((8, 14), (-8, 14), (10, 26), (-10, 26), (6, 38), (-6, 38)):
            c.setLineWidth(lw * 0.6)
            c.line(0, py - 4, px, py)
            c.setLineWidth(lw)
    # gall
    gx, gy = 24, 12
    if mode == "line":
        c.setFillColor(C(d["paper"]))
        c.circle(gx, gy, 7, stroke=1, fill=1)
        c.setLineWidth(lw * 0.6)
        c.circle(gx, gy, 4.2, stroke=1, fill=0)
    else:
        c.setFillColor(C(d["accent"]) if mode == "poster" else ink)
        c.circle(gx, gy, 7, stroke=0, fill=1)
        c.setFillColor(C(d["paper"]))
        c.circle(gx + 2, gy + 2, 1.6, stroke=0, fill=1)
    c.restoreState()


ILLOS = [("Elderberry", draw_elderberry), ("Morel", draw_morel), ("Oak + gall", draw_oak)]
MODE = {"I": "line", "II": "lyric", "III": "poster"}

# ------------------------------------------------------------- UI vignettes

STATUS = [("Allowed", "#2F8F46"), ("Permit", "#D89B24"), ("Prohibited", "#C74437"), ("Unknown", "#8B8F86")]


def draw_marker_row(c, d, x, y, mode, spacing=64):
    for i, (label, col) in enumerate(STATUS):
        mx = x + i * spacing
        if mode == "line":
            c.setFillColor(C(col))
            c.circle(mx, y, 6.5, stroke=0, fill=1)
            c.setStrokeColor(C(d["ink"]))
            c.setLineWidth(1.1)
            c.circle(mx, y, 9.5, stroke=1, fill=0)
        elif mode == "lyric":
            c.setFillColor(C(col))
            c.circle(mx, y, 7.5, stroke=0, fill=1)
            c.setStrokeColor(C(d["accent"]))
            c.setLineWidth(1.2)
            c.circle(mx, y, 10.5, stroke=1, fill=0)
        else:
            c.setFillColor(C(col))
            c.rect(mx - 7, y - 7, 14, 14, stroke=0, fill=1)
            c.setStrokeColor(C(d["ink"]))
            c.setLineWidth(1.8)
            c.rect(mx - 9.5, y - 9.5, 19, 19, stroke=1, fill=0)
        c.setFont(d["ui_font"], 6.5)
        c.setFillColor(C(d["sub"]))
        c.drawCentredString(mx, y - 21, label)


def draw_popup(c, d, x, y, w, mode):
    h = 118
    c.setFillColor(C("#FFFFFF" if mode != "lyric" else "#FDF8EC"))
    c.setStrokeColor(C(d["ink"]) if mode == "poster" else C(d["hair"]))
    c.setLineWidth(2 if mode == "poster" else 0.8)
    c.roundRect(x, y, w, h, 3 if mode != "lyric" else 8, stroke=1, fill=1)
    pad = 12
    ty = y + h - 22
    if mode == "line":
        tracked(c, x + pad, ty, "ELDERBERRY", "Times-Roman", 13, 3.0, C(d["ink"]))
        c.setFont("Lora-Italic", 8.5)
        c.setFillColor(C(d["sub"]))
        c.drawString(x + pad, ty - 13, "Sambucus canadensis  ·  No. 027")
    elif mode == "lyric":
        c.setFont("Lora-Italic", 16)
        c.setFillColor(C(d["ink"]))
        c.drawString(x + pad, ty, "Elderberry")
        c.setFont("Lora", 8.5)
        c.setFillColor(C(d["sub"]))
        c.drawString(x + pad, ty - 13, "Sambucus canadensis — ripe mid-July to September")
    else:
        c.setFont("DejaVuSerifCondB", 15)
        c.setFillColor(C(d["ink"]))
        c.drawString(x + pad, ty, "ELDERBERRY")
        c.setFont("Lato", 8.5)
        c.setFillColor(C(d["sub"]))
        c.drawString(x + pad, ty - 13, "Sambucus canadensis")
    # status chip
    chip_y = y + h - 56
    c.setFillColor(C("#2F8F46"))
    if mode == "poster":
        c.rect(x + pad, chip_y, 64, 15, stroke=0, fill=1)
    else:
        c.roundRect(x + pad, chip_y, 64, 15, 7.5, stroke=0, fill=1)
    c.setFont("Lato-Bold", 7.5)
    c.setFillColor(C("#FFFFFF"))
    c.drawCentredString(x + pad + 32, chip_y + 4.4, "ALLOWED")
    c.setFont(d["ui_font"], 7.5)
    c.setFillColor(C(d["ink"]))
    c.drawString(x + pad + 72, chip_y + 4.4, "1 gallon / person / day — Shenandoah compendium")
    # season strip
    sy = y + 14
    months = "JFMAMJJASOND"
    bw = (w - 2 * pad) / 12.0
    for i, mlet in enumerate(months):
        on = 6 <= i <= 8
        c.setFillColor(C(d["accent"]) if on else C(d["hair"]))
        c.rect(x + pad + i * bw, sy, bw - 1.5, 8 if on else 4, stroke=0, fill=1)
        c.setFont("DejaVuMono", 5)
        c.setFillColor(C(d["sub"]))
        c.drawCentredString(x + pad + i * bw + bw / 2, sy - 8, mlet)


def draw_histogram(c, d, x, y, w, h, mode):
    vals = [1, 1, 2, 4, 6, 9, 11, 12, 9, 7, 4, 2]
    bw = w / 12.0
    season_cols = [d["seasons"][3][1]] * 2 + [d["seasons"][0][1]] * 3 + [d["seasons"][1][1]] * 3 + [d["seasons"][2][1]] * 3 + [d["seasons"][3][1]]
    for i, v in enumerate(vals):
        bh = (v / 12.0) * h
        c.setFillColor(C(season_cols[i]))
        if mode == "line":
            c.setStrokeColor(C(d["ink"]))
            c.setLineWidth(0.7)
            c.rect(x + i * bw + 2, y, bw - 4, bh, stroke=1, fill=1)
        elif mode == "lyric":
            c.roundRect(x + i * bw + 2, y, bw - 4, max(bh, 4), 2, stroke=0, fill=1)
        else:
            c.rect(x + i * bw + 1.5, y, bw - 3, bh, stroke=0, fill=1)


def draw_map_vignette(c, d, x, y, w, h, mode):
    c.saveState()
    p = c.beginPath()
    p.rect(x, y, w, h)
    c.clipPath(p, stroke=0)
    c.setFillColor(C(d["paper"]))
    c.rect(x, y, w, h, stroke=0, fill=1)
    # contours
    c.setStrokeColor(C(d["hair"]))
    for i in range(5):
        c.setLineWidth(0.8 if mode != "poster" else 1.4)
        pth = c.beginPath()
        pth.moveTo(x - 10, y + 18 + i * 22)
        for seg in range(6):
            sx = x - 10 + (seg + 1) * (w / 5.5)
            pth.curveTo(sx - w / 11, y + 30 + i * 22 + (8 if seg % 2 else -8),
                        sx - w / 22, y + 8 + i * 22, sx, y + 18 + i * 22)
        c.drawPath(pth, stroke=1, fill=0)
    # river
    c.setStrokeColor(C(d["seasons"][3][1]))
    c.setLineWidth(2.2 if mode == "poster" else 1.4)
    pth = c.beginPath()
    pth.moveTo(x + w * 0.15, y)
    pth.curveTo(x + w * 0.3, y + h * 0.4, x + w * 0.5, y + h * 0.45, x + w * 0.62, y + h * 0.8)
    pth.curveTo(x + w * 0.68, y + h * 0.95, x + w * 0.72, y + h, x + w * 0.74, y + h)
    c.drawPath(pth, stroke=1, fill=0)
    # public land patch
    c.setFillColor(C(d["seasons"][0][1]))
    c.setFillAlpha(0.18)
    pth = c.beginPath()
    pth.moveTo(x + w * 0.55, y + h * 0.18)
    pth.curveTo(x + w * 0.8, y + h * 0.1, x + w * 0.95, y + h * 0.4, x + w * 0.85, y + h * 0.62)
    pth.curveTo(x + w * 0.7, y + h * 0.75, x + w * 0.52, y + h * 0.5, x + w * 0.55, y + h * 0.18)
    c.drawPath(pth, stroke=0, fill=1)
    c.setFillAlpha(1)
    # aggregate circle
    ax, ay = x + w * 0.32, y + h * 0.62
    c.setFillColor(C(d["paper"]))
    c.setStrokeColor(C(d["ink"]))
    c.setLineWidth(1.4)
    c.circle(ax, ay, 15, stroke=1, fill=1)
    c.setFont(d["label_font"], 8)
    c.setFillColor(C(d["ink"]))
    c.drawCentredString(ax, ay - 2.8, "127")
    # markers
    for mx, my, col in ((0.7, 0.35, "#2F8F46"), (0.78, 0.5, "#2F8F46"), (0.62, 0.28, "#D89B24")):
        px, py = x + w * mx, y + h * my
        c.setFillColor(C(col))
        if mode == "poster":
            c.rect(px - 4.5, py - 4.5, 9, 9, stroke=0, fill=1)
        else:
            c.circle(px, py, 4.5, stroke=0, fill=1)
        c.setStrokeColor(C(d["ink"]))
        c.setLineWidth(1)
        if mode == "poster":
            c.rect(px - 6.5, py - 6.5, 13, 13, stroke=1, fill=0)
        else:
            c.circle(px, py, 6.5, stroke=1, fill=0)
    c.restoreState()
    c.setStrokeColor(C(d["ink"]) if mode == "poster" else C(d["hair"]))
    c.setLineWidth(2 if mode == "poster" else 0.8)
    c.rect(x, y, w, h, stroke=1, fill=0)


# ------------------------------------------------------------ wordmark study

def draw_wordmark(c, d, x, y, scale=1.0):
    mode = MODE[d["key"]]
    c.saveState()
    c.translate(x, y)
    c.scale(scale, scale)
    if mode == "line":
        tracked(c, 0, 16, "CRAFT", "Times-Roman", 40, 9, C(d["ink"]))
        w2 = tracked_width("ALMANAC", "Times-Roman", 40, 9)
        tracked(c, 0, -30, "ALMANAC", "Times-Roman", 40, 9, C(d["ink"]))
        hrule(c, d, 0, 6, w2, 0.8, C(d["ink"]))
        c.setFont("DejaVuMono", 7)
        c.setFillColor(C(d["sub"]))
        c.drawString(0, -44, "MATERIAL MAPS OF THE UNITED STATES  ·  EST. 2026")
        c.setFillColor(C(d["accent"]))
        c.circle(w2 + 16, 10, 4, stroke=0, fill=1)
    elif mode == "lyric":
        c.setFont("Lora-Italic", 52)
        c.setFillColor(C(d["ink"]))
        c.drawString(0, 0, "Craft Almanac")
        w = pdfmetrics.stringWidth("Craft Almanac", "Lora-Italic", 52)
        c.setStrokeColor(C(d["accent"]))
        c.setLineWidth(1.4)
        c.line(0, -14, w, -14)
        # season dial
        cx, cy = w + 26, 16
        c.setLineWidth(1.1)
        c.circle(cx, cy, 11, stroke=1, fill=0)
        for i in range(4):
            a = math.radians(90 * i + 45)
            c.line(cx + 6 * math.cos(a), cy + 6 * math.sin(a), cx + 11 * math.cos(a), cy + 11 * math.sin(a))
        c.setFillColor(C(d["accent"]))
        c.circle(cx, cy, 2.4, stroke=0, fill=1)
        c.setFont("Lora", 9)
        c.setFillColor(C(d["sub"]))
        c.drawString(0, -32, "Seasonal maps for making with place")
    else:
        c.saveState()
        c.scale(1.0, 1.32)  # woodtype stretch
        tracked(c, 0, 0, "CRAFT", "DejaVuSerifCondB", 46, 2, C(d["ink"]))
        tracked(c, 0, -40, "ALMANAC", "DejaVuSerifCondB", 46, 2, C(d["accent"]))
        c.restoreState()
        c.setStrokeColor(C(d["ink"]))
        c.setLineWidth(3)
        wA = tracked_width("ALMANAC", "DejaVuSerifCondB", 46, 2)
        c.line(0, -14, wA, -14)
        c.setFont("Poppins-Medium", 8)
        c.setFillColor(C(d["ink"]))
        c.drawString(0, -70, "MAPS + MATERIALS + PROJECTS — MADE WITH PLACE")
    c.restoreState()


# -------------------------------------------------------------------- pages

def cover(c):
    d = dict(paper="#211F1A", ink="#F6F3EA", sub="#A8A294", hair="#4E4B42",
             accent="#C09238", ui_font="Lato")
    page_start(c, d, footer=False)
    tracked(c, M, PH - 120, "CRAFT ALMANAC", "Lato-Bold", 11, 4, C("#A8A294"))
    c.setFont("Lora", 46)
    c.setFillColor(C("#F6F3EA"))
    c.drawString(M, PH - 185, "Brand Directions")
    c.setFont("Lora-Italic", 18)
    c.setFillColor(C("#C09238"))
    c.drawString(M, PH - 215, "Round 1 — three worlds for one almanac")
    # three direction marks
    y = 240
    for i, dd in enumerate(DIRECTIONS):
        x = M + i * 232
        c.setStrokeColor(C("#4E4B42"))
        c.setLineWidth(0.8)
        c.rect(x, y - 90, 208, 150, stroke=1, fill=0)
        c.setFillColor(C(dd["paper"]))
        c.rect(x + 1, y - 89, 206, 148, stroke=0, fill=1)
        c.saveState()
        c.translate(x + 24, y - 40)
        c.scale(0.42, 0.42)
        draw_wordmark(c, dd, 0, 0)
        c.restoreState()
        c.setFont("Lato-Bold", 8)
        c.setFillColor(C("#211F1A"))
        c.drawString(x + 14, y - 76, f"{dd['key']}.  {dd['name'].upper()}")
    c.setFont("Lato", 9)
    c.setFillColor(C("#A8A294"))
    c.drawString(M, 78, "Prepared June 2026  ·  Display typefaces shown as stand-ins; recommended faces named inside.")
    c.showPage()


def brief_page(c):
    d = D1
    page_start(c, d)
    kicker(c, d, M, PH - 70, "The brief, distilled")
    c.setFont("Lora", 26)
    c.setFillColor(C(d["ink"]))
    c.drawString(M, PH - 102, "An identity for a platform, entered through a map.")
    yy = wrap_text(c, M, PH - 134, 470,
                   "Craft Almanac is becoming more than the map: pages for every material, "
                   "project guides that bring materials together, and content that empowers "
                   "people to make things with their local environments. Makers and foragers "
                   "first; students second. Contemporary and compelling, never antique pastiche.",
                   "Lora", 10.5, 15, C(d["sub"]))
    col2 = PW / 2 + 30
    items = [
        ("DECIDED", "Expressive display + quiet text · original SVG illustration + the data as art · a seasonal living palette over an ink-and-paper core · voice between knowledgeable friend and lyrical almanac."),
        ("AVOID", "Twee / cottagecore · institutional beige · rustic kitsch."),
        ("CONSTANTS", "Permission colors stay unmistakable (they carry safety meaning) · ethics language stays prominent · everything compiles to CSS variables, SVG, and font files — no build step."),
        ("HOW TO READ ROUND 1", "Three directions, four pages each: concept + wordmark, color, type, applied UI. Then a side-by-side, risks, and the decisions I need from you."),
    ]
    yy2 = PH - 90
    for label, text in items:
        kicker(c, d, col2, yy2, label, C(d["accent"]))
        yy2 = wrap_text(c, col2, yy2 - 16, PW - M - col2, text, "Lora", 9.5, 13.5, C(d["ink"])) - 10
    hrule(c, d, M, 70, PW - 2 * M)
    c.showPage()


def divider(c, d):
    page_start(c, d)
    mode = MODE[d["key"]]
    kicker(c, d, M, PH - 70, f"Direction {d['key']}")
    c.setFont("Lora" if mode != "poster" else "Lato-Black", 40)
    c.setFillColor(C(d["ink"]))
    c.drawString(M, PH - 116, d["name"])
    c.setFont("Lora-Italic", 15)
    c.setFillColor(C(d["accent"]))
    c.drawString(M, PH - 140, d["tagline"])
    yy = wrap_text(c, M, PH - 175, 400, d["concept"], d["text_font"], 10.5, 15.5, C(d["sub"]))
    kicker(c, d, M, yy - 8, "Motifs", C(d["accent"]))
    wrap_text(c, M, yy - 24, 400, d["motifs"], d["text_font"], 9.5, 13.5, C(d["ink"]))
    # large illustration cluster on the right
    base_x = PW - 270
    for i, (label, fn) in enumerate(ILLOS):
        ix = base_x + (i % 2) * 120
        iy = 160 + (1 - i // 2) * 170
        fn(c, d, ix, iy, 1.25, mode)
        c.setFont(d["label_font"], 7)
        c.setFillColor(C(d["sub"]))
        c.drawString(ix - 20, iy - 16, f"{label}")
    hrule(c, d, M, 70, PW - 2 * M)
    c.showPage()


def wordmark_page(c, d):
    page_start(c, d)
    kicker(c, d, M, PH - 70, f"{d['key']} · {d['name']} — wordmark study & voice")
    draw_wordmark(c, d, M, PH - 210, scale=1.15)
    hrule(c, d, M, PH - 280, PW - 2 * M)
    kicker(c, d, M, PH - 305, "Voice sample (popup / margin note)", C(d["accent"]))
    c.setFont("Lora-Italic" if d["key"] == "II" else d["text_font"], 12)
    wrap_text(c, M, PH - 326, PW - 2 * M - 220, d["voice"],
              "Lora-Italic" if d["key"] == "II" else d["text_font"], 12, 17, C(d["ink"]))
    kicker(c, d, M, 165, "Naming note", C(d["accent"]))
    wrap_text(c, M, 148, PW - 2 * M - 280,
              "Craft Almanac holds in all three worlds. If this direction leads, natural "
              "extensions are mastheads for sections: The Ink Pages, The Field Table, "
              "Projects in Season.", d["text_font"], 9.5, 13.5, C(d["sub"]))
    draw_marker_row(c, d, PW - 300, 140, MODE[d["key"]])
    c.setFont("Lato", 7)
    c.setFillColor(C(d["sub"]))
    c.drawString(PW - 320, 105, "Permission markers in this language (colors constant across directions)")
    c.showPage()


def color_page(c, d):
    page_start(c, d)
    kicker(c, d, M, PH - 70, f"{d['key']} · {d['name']} — the seasonal living palette")
    c.setFont("Lora", 18)
    c.setFillColor(C(d["ink"]))
    c.drawString(M, PH - 98, "A stable ink-and-paper core; one room, repainted by the season.")
    # core swatches
    sw, sh = 118, 64
    core = [(d["paper"], "Paper"), (d["ink"], "Ink"), (d["sub"], "Graphite"), (d["hair"], "Hairline"), (d["accent"], "Thread")]
    for i, (hexc, label) in enumerate(core):
        swatch(c, d, M + i * (sw + 16), PH - 200, sw, sh, hexc, label, "core")
    # seasonal strips
    y0 = PH - 268
    for i, (season, hexc, name) in enumerate(d["seasons"]):
        x = M + i * 168
        c.setFillColor(C(hexc))
        c.rect(x, y0 - 86, 150, 86, stroke=0, fill=1)
        c.setFillColor(C(d["paper"]))
        c.rect(x, y0 - 86, 150, 26, stroke=0, fill=1)
        c.setStrokeColor(C(d["hair"]))
        c.setLineWidth(0.6)
        c.rect(x, y0 - 86, 150, 86, stroke=1, fill=0)
        c.setFont("Lato-Bold", 8.5)
        c.setFillColor(C(d["ink"]))
        c.drawString(x + 8, y0 - 78, season.upper())
        c.setFont("DejaVuMono", 6.5)
        c.setFillColor(C(d["sub"]))
        c.drawString(x + 8, y0 - 102, f"{hexc.upper()}  {name}")
    yy = wrap_text(c, M, y0 - 130, PW - 2 * M,
                   "Mechanics: the accent variable rotates on the solstices and equinoxes; markers, "
                   "histogram emphasis, links, and section mastheads inherit it. Paper and ink never move, "
                   "so the site stays itself. Each seasonal accent is contrast-checked against paper and ink; "
                   "permission-status colors are exempt from rotation and never reused decoratively.",
                   d["text_font"], 9.5, 14, C(d["sub"]))
    draw_histogram(c, d, M, 86, 330, 70, MODE[d["key"]])
    c.setFont("Lato", 7)
    c.setFillColor(C(d["sub"]))
    c.drawString(M, 72, "The seasonal availability chart wearing all four accents at once — the data as art.")
    c.showPage()


def type_page(c, d):
    page_start(c, d)
    mode = MODE[d["key"]]
    kicker(c, d, M, PH - 70, f"{d['key']} · {d['name']} — typography")
    # display specimen
    if mode == "line":
        tracked(c, M, PH - 140, "PERSIMMON", "Times-Roman", 44, 10, C(d["ink"]))
        c.setFont("Lora-Italic", 11)
        c.setFillColor(C(d["sub"]))
        c.drawString(M, PH - 162, "Diospyros virginiana — set letterspaced, numbered, and pinned")
    elif mode == "lyric":
        c.setFont("Lora-Italic", 46)
        c.setFillColor(C(d["ink"]))
        c.drawString(M, PH - 140, "Persimmon, after frost")
        c.setFont("Lora", 11)
        c.setFillColor(C(d["sub"]))
        c.drawString(M, PH - 162, "Headlines read like entries; the season writes the margins")
    else:
        c.saveState()
        c.translate(M, PH - 148)
        c.scale(1.0, 1.3)
        tracked(c, 0, 0, "PERSIMMON", "DejaVuSerifCondB", 40, 2, C(d["ink"]))
        c.restoreState()
        c.setFont("Lato", 11)
        c.setFillColor(C(d["sub"]))
        c.drawString(M, PH - 168, "Woodtype scale, modern fit — headlines you can read across a room")
    hrule(c, d, M, PH - 186, PW - 2 * M)
    # roles table
    roles = [
        ("DISPLAY", d["display_rec"], "Mastheads, species names, mode titles"),
        ("TEXT", d["text_rec"], "Guides, notes, almanac entries"),
        ("UI", d["ui_rec"], "Controls, filters, buttons"),
        ("LABELS", d["label_rec"], "Specimen numbers, coordinates, data"),
    ]
    yy = PH - 215
    for role, face, use in roles:
        kicker(c, d, M, yy, role, C(d["accent"]))
        c.setFont("Lato-Bold", 10)
        c.setFillColor(C(d["ink"]))
        c.drawString(M + 90, yy, face)
        c.setFont("Lato", 8.5)
        c.setFillColor(C(d["sub"]))
        c.drawString(M + 330, yy, use)
        yy -= 26
    c.setFont("Lato", 7.5)
    c.setFillColor(C(d["sub"]))
    c.drawString(M, yy - 4, "Deck settings are stand-ins from available system faces; the named faces above are the recommendation to license/serve.")
    # text block sample
    sample_y = yy - 40
    wrap_text(c, M, sample_y, 440,
              "Reading sample. Gather only where the rules allow, and only what the patch "
              "can spare. The almanac will tell you what is ripe, where harvest is permitted, "
              "and which projects the week makes possible: ink from oak galls, a basket from "
              "willow, a pie from the field edge.",
              d["text_font"], 10, 15, C(d["ink"]))
    draw_popup(c, d, PW - 320, 100, 266, mode)
    c.setFont("Lato", 7)
    c.setFillColor(C(d["sub"]))
    c.drawString(PW - 320, 86, "Type system at work: the map popup")
    c.showPage()


def applied_page(c, d):
    page_start(c, d)
    mode = MODE[d["key"]]
    kicker(c, d, M, PH - 70, f"{d['key']} · {d['name']} — applied")
    draw_map_vignette(c, d, M, PH - 410, 420, 320, mode)
    c.setFont("Lato", 7.5)
    c.setFillColor(C(d["sub"]))
    c.drawString(M, PH - 424, "Basemap treatment study: paper terrain, hairline contours, seasonal river, public-land wash, this direction's markers.")
    x2 = PW - 300
    kicker(c, d, x2, PH - 90, "Illustration language", C(d["accent"]))
    for i, (label, fn) in enumerate(ILLOS):
        fn(c, d, x2 + 30 + i * 88, PH - 200, 0.85, mode)
    c.setFont("Lato", 7.5)
    c.setFillColor(C(d["sub"]))
    c.drawString(x2, PH - 226, "Grows into the item-page system: one drawing per material.")
    kicker(c, d, x2, PH - 262, "Project card", C(d["accent"]))
    # mini project card
    cy = PH - 396
    c.setFillColor(C("#FFFFFF" if mode != "lyric" else "#FDF8EC"))
    c.setStrokeColor(C(d["ink"]) if mode == "poster" else C(d["hair"]))
    c.setLineWidth(1.8 if mode == "poster" else 0.8)
    c.roundRect(x2, cy, 246, 120, 6, stroke=1, fill=1)
    if mode == "poster":
        c.setFont("DejaVuSerifCondB", 13)
    elif mode == "lyric":
        c.setFont("Lora-Italic", 13)
    else:
        c.setFont("Times-Roman", 13)
    c.setFillColor(C(d["ink"]))
    title = "OAK GALL INK" if mode != "lyric" else "Oak gall ink"
    c.drawString(x2 + 12, cy + 96, title)
    c.setFont(d["text_font"], 8)
    c.setFillColor(C(d["sub"]))
    wrap_text(c, x2 + 12, cy + 80, 220,
              "Galls, rusty iron, rain water, patience. A project page brings three map "
              "materials together with steps, season, and the rules for each.",
              d["text_font"], 8, 11.5, C(d["sub"]))
    c.setFillColor(C(d["accent"]))
    c.circle(x2 + 20, cy + 22, 5, stroke=0, fill=1)
    c.setFont("Lato-Bold", 7)
    c.setFillColor(C(d["ink"]))
    c.drawString(x2 + 32, cy + 19, "GATHER IN: OCT — DEC   ·   MAKES: 1 BOTTLE")
    c.showPage()


def comparison_page(c):
    d = D1
    page_start(c, d, paper="#FFFFFF")
    kicker(c, d, M, PH - 70, "Side by side — the same popup, three worlds")
    for i, dd in enumerate(DIRECTIONS):
        x = M + i * 232
        c.setFillColor(C(dd["paper"]))
        c.rect(x, PH - 410, 210, 310, stroke=0, fill=1)
        c.setStrokeColor(C(dd["hair"]))
        c.setLineWidth(0.7)
        c.rect(x, PH - 410, 210, 310, stroke=1, fill=0)
        c.saveState()
        c.translate(x + 12, PH - 240)
        c.scale(0.72, 0.72)
        draw_popup(c, dd, 0, 0, 258, MODE[dd["key"]])
        c.restoreState()
        draw_marker_row(c, dd, x + 30, PH - 290, MODE[dd["key"]], spacing=51)
        c.saveState()
        c.translate(x + 14, PH - 390)
        c.scale(0.62, 0.62)
        draw_histogram(c, dd, 0, 0, 290, 70, MODE[dd["key"]])
        c.restoreState()
        c.setFont("Lato-Bold", 9)
        c.setFillColor(C(dd["ink"]))
        c.drawString(x + 12, PH - 128, f"{dd['key']}. {dd['name'].upper()}")
    yy = wrap_text(c, M, 150, PW - 2 * M,
                   "Constants in every direction: permission colors and their meanings; the seasonal histogram as a "
                   "first-class object; specimen labels carrying source citations; plain-spoken safety lines. The "
                   "directions differ in temperature: I is studied, II is alive, III is loud.",
                   "Lora", 10, 14.5, C(d["sub"]))
    c.showPage()


def risks_page(c):
    d = D1
    page_start(c, d)
    kicker(c, d, M, PH - 70, "Honest risks & what each direction must prove")
    yy = PH - 105
    for dd in DIRECTIONS:
        c.setFont("Lato-Bold", 11)
        c.setFillColor(C(dd["accent"]))
        c.drawString(M, yy, f"{dd['key']}. {dd['name']}")
        yy = wrap_text(c, M + 150, yy, PW - M - 150 - M, dd["risk"], "Lora", 10, 14, C(d["ink"])) - 14
    hrule(c, d, M, yy + 4, PW - 2 * M)
    yy -= 18
    kicker(c, d, M, yy, "Shared constraints honored by all three", C(d["accent"]))
    wrap_text(c, M, yy - 18, PW - 2 * M,
              "Everything shown compiles to CSS variables, SVG assets, and licensed web fonts on the existing "
              "no-build static site. Mapbox basemap restyling happens once per direction in Studio. The seasonal "
              "rotation is a four-value variable swap on solstices and equinoxes. Permission-status colors were "
              "left untouched in all three palettes and pass contrast on every season's paper.",
              "Lora", 10, 14.5, C(d["sub"]))
    c.showPage()


def decision_page(c):
    d = D2
    page_start(c, d)
    kicker(c, d, M, PH - 70, "What I need from you")
    c.setFont("Lora", 24)
    c.setFillColor(C(d["ink"]))
    c.drawString(M, PH - 102, "Round 1 decisions")
    questions = [
        ("1", "Which world? Pick a direction to lead — or name the hybrid (e.g., II's seasonal soul with I's specimen rigor)."),
        ("2", "Wordmark energy: letterspaced caps, living italic, or woodtype? This sets the masthead for every future page."),
        ("3", "What did a direction get right that the winner should borrow? Steal freely across the three."),
        ("4", "Anything here that contradicts how you teach with the site? Flag it now, before Round 2 deepens the winner."),
    ]
    yy = PH - 140
    for n, q in questions:
        c.setFont("Lora-Italic", 16)
        c.setFillColor(C(d["accent"]))
        c.drawString(M, yy, n)
        yy = wrap_text(c, M + 28, yy, PW - 2 * M - 28, q, "Lora", 11, 15.5, C(d["ink"])) - 12
    hrule(c, d, M, yy, PW - 2 * M)
    kicker(c, d, M, yy - 22, "Then", C(d["accent"]))
    wrap_text(c, M, yy - 40, PW - 2 * M,
              "Round 2 deepens the chosen direction: full palette with all four seasons applied, real licensed "
              "typefaces, the illustration system drawn properly in SVG, key screens (map, item page, project "
              "guide), and a Mapbox style. Then a live prototype on a design branch — the map wearing it for real.",
              "Lora", 10, 14.5, C(d["sub"]))
    c.showPage()


def main():
    c = canvas.Canvas(str(OUT), pagesize=(PW, PH))
    c.setTitle("Craft Almanac — Brand Directions, Round 1")
    c.setAuthor("Craft Almanac design process")
    cover(c)
    brief_page(c)
    for d in DIRECTIONS:
        divider(c, d)
        wordmark_page(c, d)
        color_page(c, d)
        type_page(c, d)
        applied_page(c, d)
    comparison_page(c)
    risks_page(c)
    decision_page(c)
    c.save()
    print(f"Wrote {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
