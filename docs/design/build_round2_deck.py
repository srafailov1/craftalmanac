#!/usr/bin/env python3
"""Generate the Round 2 brand-directions deck (PDF) for Craft Almanac.

Round 2 responds to the owner's critique of Round 1 (three directions that
read as rooms of one house) with precedent research and three genuinely
different worlds. Vector-only; display typefaces are stand-ins with
recommended retail/free faces named on each type page.

Usage: python3 docs/design/build_round2_deck.py
Output: docs/design/round-2-directions.pdf
"""

import math
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "round-2-directions.pdf"

PW, PH = 792, 612  # US Letter landscape
M = 54

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


def C(h):
    return HexColor(h)


# ---------------------------------------------------------------- directions

D1 = dict(
    key="I",
    name="Night Survey",
    tagline="The map as a lantern.",
    ground="#121A16", panel="#1C2721", ink="#EDF3EA", sub="#9DB0A2",
    hair="#2E3B33", accent="#FFD166",
    display_font="Lora", display_tracking=4.0,
    text_font="Lato-Light", label_font="DejaVuMono", ui_font="Lato",
    display_rec="GT Alpina or Self Modern (luminous high-contrast serif)",
    text_rec="Inter or Sohne Leicht", ui_rec="Inter", label_rec="IBM Plex Mono",
    seasons=[("Spring", "#A8E063", "willow glow"), ("Summer", "#FFD166", "lantern gold"),
             ("Autumn", "#FF9447", "ember"), ("Winter", "#9BD4E4", "ice light")],
    safety=[("Allowed", "#5BE08A"), ("Permit", "#FFC94D"), ("Prohibited", "#FF6B5E"),
            ("Private", "#C99B7A"), ("Unknown", "#93A39A")],
    concept=("Foraging's most charged hours are dusk and dawn, and the most "
             "compelling maps of the last decade are dark ones: firefly "
             "cartography, earth.nullschool, lights-at-night. Night Survey "
             "inverts the almanac -- ink becomes the field, paper becomes "
             "the light. The basemap is a deep spruce-black wood; every "
             "occurrence is a small lamp. Data stops being dots on paper "
             "and becomes something glowing and precious you lean toward."),
    motifs=("Firefly points. Smoked-glass panels. Constellation lines between "
            "related species. Season = the temperature of the light."),
    voice=("Elderberry, riverbank colony. The umbels ripen this week; "
           "come at golden hour and take one gallon, no more. The light "
           "will show you which are ready."),
    season_note=("Seasons rotate the color temperature of every glow: pale "
                 "willow light in April, ember orange in October, ice blue "
                 "in January. One CSS variable set per season; the dark core "
                 "never changes."),
    risk=("Dark UI in a bright classroom. Mitigation: a 'daybreak' inverse "
          "theme keyed to local sunrise -- the almanac literally turns its "
          "lamp off in the morning. Both themes ship from one variable set."),
)

D2 = dict(
    key="II",
    name="Overprint",
    tagline="A community print shop, two inks at a time.",
    ground="#FCFBF6", panel="#FFFFFF", ink="#181512", sub="#52483E",
    hair="#E4DED2", accent="#FF48B0",
    display_font="Lato-Black", display_tracking=0.5,
    text_font="Poppins", label_font="DejaVuMono", ui_font="Poppins-Medium",
    display_rec="Archivo Black (free) or Manuka (Klim)",
    text_rec="Space Grotesk", ui_rec="Space Grotesk", label_rec="Space Mono",
    seasons=[("Spring", "#FF48B0", "#00A35C", "#8C3550", "fluoro pink x leaf"),
             ("Summer", "#FFB400", "#2456D6", "#2E8540", "sunflower x cobalt"),
             ("Autumn", "#FF5C1F", "#14563F", "#84321B", "fluoro orange x forest"),
             ("Winter", "#0E7C86", "#2B3FB5", "#14365C", "teal x ultramarine")],
    safety=[("Allowed", "#1E8A46"), ("Permit", "#D89B24"), ("Prohibited", "#C73A2E"),
            ("Private", "#7E6654"), ("Unknown", "#85897F")],
    concept=("The contemporary craft signal is not parchment -- it is the "
             "risograph studio: fluorescent ink, bold cuts, small batches, "
             "hands visible in the work. Overprint treats every season as a "
             "new two-ink edition. Two spot colors per season overprint to "
             "make a third; type runs at poster scale; illustration is "
             "stencil-cut with halftone shading. The site feels like a "
             "print shop that teaches -- because that is what it is."),
    motifs=("Two-ink overprints. Slight misregistration. Halftone shading. "
            "Numbered broadside steps. Poster-scale wood type."),
    voice=("INK FROM OAK GALLS -- A BROADSIDE IN SIX STEPS. Gather fallen "
           "galls only; the wasp has left when the hole shows. Step one is "
           "on the press now."),
    season_note=("Each season is a two-ink pair that overprints to a third "
                 "color -- four small palettes a year instead of one large "
                 "one. CSS: two accent variables plus mix-blend-mode: "
                 "multiply. The paper white and text ink never change."),
    risk=("Loud enough to drown safety messaging. Mitigation: status colors "
          "are a fixed neutral system that never joins the seasonal inks, "
          "always on white chips; rules text always set quiet."),
)

D3 = dict(
    key="III",
    name="Pigment Index",
    tagline="The interface is the color of the material.",
    ground="#F1F5EC", panel="#FFFFFF", ink="#1F2421", sub="#5A615B",
    hair="#D5DAD2", accent="#A63D2F",
    display_font="Lora", display_tracking=0,
    text_font="Lato", label_font="DejaVuMono", ui_font="Lato",
    display_rec="Fraunces Variable (SOFT/WONK axes tied to the season)",
    text_rec="Public Sans or Sohne", ui_rec="Public Sans", label_rec="IBM Plex Mono",
    pigments=[("Madder", "#A63D2F"), ("Weld", "#D9A521"), ("Indigo", "#2F4DA0"),
              ("Walnut", "#5C4632"), ("Oak gall", "#3A3F3D"), ("Buckthorn", "#6B7F2E"),
              ("Pokeberry", "#8E2D56")],
    seasons=[("Spring", "#F1F5EC", "#6B7F2E", "willow tint / buckthorn"),
             ("Summer", "#F8F3E7", "#D9A521", "straw tint / weld"),
             ("Autumn", "#F6EFE4", "#A63D2F", "ochre tint / madder"),
             ("Winter", "#EEF2F4", "#2F4DA0", "frost tint / indigo")],
    safety=[("Allowed", "#2F8F46"), ("Permit", "#D89B24"), ("Prohibited", "#C74437"),
            ("Private", "#7E6654"), ("Unknown", "#8B8F86")],
    concept=("Every material on the map is also a color you can make: ink, "
             "dye, pigment, finish. Pigment Index organizes the whole "
             "identity around that fact, the way the Mushroom Color Atlas "
             "lets its swatches do the navigating. Big fields of "
             "material-derived color carry the interface; an exposed index "
             "grid, mono specimen labels, and a variable display face whose "
             "softness turns with the season keep it precise but alive. "
             "Cool, contemporary, archival -- never cream, never antique."),
    motifs=("Pigment fields as navigation. Index numbers. Exposed hairline "
            "grid. Mono labels. A display face that softens in spring and "
            "sharpens in winter."),
    voice=("No. 047 -- Black walnut. Hull to ink in two days; wear gloves, "
           "stain is the point. Histogram shows October is your month. "
           "Occurrence is not permission -- check the parcel rule first."),
    season_note=("Two seasonal mechanisms, both one-variable cheap: the page "
                 "ground takes a faint seasonal tint, and the display face's "
                 "variable axes (SOFT/WONK) drift across the year -- soft "
                 "and open in April, sharp and upright in January."),
    risk=("Minimal can tip sterile, which the brief bans. Mitigation: "
          "material color at generous scale, literary margin notes in the "
          "voice, and the seasonal type drift -- warmth from the system, "
          "not from ornament."),
)

DIRECTIONS = [D1, D2, D3]

FOOTER = "CRAFT ALMANAC  /  BRAND DIRECTIONS  /  ROUND 2"


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


def page_start(c, ground, footer_color, num, label=FOOTER):
    c.setFillColor(C(ground))
    c.rect(0, 0, PW, PH, stroke=0, fill=1)
    c.setFont("DejaVuMono", 6.5)
    c.setFillColor(footer_color)
    c.drawString(M, 26, label)
    c.drawRightString(PW - M, 26, "%02d" % num)


def kicker(c, x, y, text, color, size=8):
    c.setFont("Lato-Bold", size)
    c.setFillColor(color)
    c.drawString(x, y, " ".join(list(text.upper())).replace("   ", "  "))


def tracked(c, x, y, text, font, size, tracking, color):
    c.setFillColor(color)
    c.setFont(font, size)
    xx = x
    for ch in text:
        c.drawString(xx, y, ch)
        xx += pdfmetrics.stringWidth(ch, font, size) + tracking
    return xx - tracking


def glow_dot(c, x, y, r, color, core="#FFFFFF"):
    col = C(color)
    for rr, a in [(r * 2.6, 0.06), (r * 1.9, 0.12), (r * 1.4, 0.25), (r, 0.85)]:
        c.setFillColor(col)
        c.setFillAlpha(a)
        c.circle(x, y, rr, stroke=0, fill=1)
    c.setFillAlpha(1)
    c.setFillColor(C(core))
    c.circle(x, y, r * 0.35, stroke=0, fill=1)


def halftone(c, x, y, w, h, color, step=7, rmax=2.4, slope=True):
    c.setFillColor(C(color))
    ny = int(h / step)
    nx = int(w / step)
    for j in range(ny):
        for i in range(nx):
            t = (i / max(nx - 1, 1)) if slope else 0.6
            r = rmax * (0.25 + 0.75 * t)
            c.circle(x + i * step + step / 2, y + j * step + step / 2, r, stroke=0, fill=1)


def hist(c, x, y, w, h, vals, color, base_color=None):
    n = len(vals)
    bw = w / n * 0.66
    gap = w / n
    if base_color:
        c.setStrokeColor(C(base_color))
        c.setLineWidth(0.6)
        c.line(x, y, x + w, y)
    c.setFillColor(C(color) if isinstance(color, str) else color)
    for i, v in enumerate(vals):
        c.rect(x + i * gap + (gap - bw) / 2, y, bw, h * v, stroke=0, fill=1)


MONTH_VALS = [0.08, 0.10, 0.18, 0.34, 0.55, 0.72, 0.86, 1.0, 0.92, 0.66, 0.30, 0.12]


def chip_row(c, x, y, pairs, ink, on_dark=False, chip_w=86, chip_h=22):
    for i, (label, col) in enumerate(pairs):
        cx = x + i * (chip_w + 10)
        if on_dark:
            c.setFillColor(C("#1C2721"))
            c.roundRect(cx, y, chip_w, chip_h, 4, stroke=0, fill=1)
        else:
            c.setFillColor(C("#FFFFFF"))
            c.setStrokeColor(C("#D8D3C6"))
            c.setLineWidth(0.7)
            c.roundRect(cx, y, chip_w, chip_h, 4, stroke=1, fill=1)
        c.setFillColor(C(col))
        c.circle(cx + 13, y + chip_h / 2, 5.5, stroke=0, fill=1)
        c.setFont("DejaVuMono", 6.6)
        c.setFillColor(ink)
        c.drawString(cx + 24, y + chip_h / 2 - 2.4, label.upper())


def swatch(c, x, y, w, h, col, label, sub, ink, subc, mono_size=6.5):
    c.setFillColor(C(col))
    c.rect(x, y, w, h, stroke=0, fill=1)
    c.setFont("Lato-Bold", 8)
    c.setFillColor(ink)
    c.drawString(x, y - 12, label)
    c.setFont("DejaVuMono", mono_size)
    c.setFillColor(subc)
    c.drawString(x, y - 22, sub)


# ------------------------------------------------------------------ vignettes

def leaf_line(c, x, y, s, color, lw=1.0):
    """Thin-line sprig used on dark + index pages."""
    c.setStrokeColor(C(color))
    c.setLineWidth(lw)
    c.line(x, y, x, y + s)
    for i in range(3):
        yy = y + s * (0.3 + 0.22 * i)
        dx = s * 0.22 * (1 - i * 0.18)
        c.bezier(x, yy, x - dx, yy + s * 0.05, x - dx, yy + s * 0.16, x - dx * 0.4, yy + s * 0.2)
        c.bezier(x, yy, x + dx, yy + s * 0.05, x + dx, yy + s * 0.16, x + dx * 0.4, yy + s * 0.2)
    c.circle(x, y + s, s * 0.045, stroke=1, fill=0)


def stencil_mushroom(c, x, y, s, cap_color, stem_color):
    """Chunky stencil-cut mushroom for Overprint."""
    c.setFillColor(C(cap_color))
    p = c.beginPath()
    p.moveTo(x - s * 0.5, y + s * 0.45)
    p.curveTo(x - s * 0.5, y + s * 1.05, x + s * 0.5, y + s * 1.05, x + s * 0.5, y + s * 0.45)
    p.lineTo(x - s * 0.5, y + s * 0.45)
    c.drawPath(p, stroke=0, fill=1)
    c.setFillColor(C(stem_color))
    c.rect(x - s * 0.13, y, s * 0.26, y * 0 + s * 0.46, stroke=0, fill=1)


def constellation(c, pts, color, dot_color):
    c.setStrokeColor(C(color))
    c.setLineWidth(0.5)
    c.setStrokeAlpha(0.5)
    for i in range(len(pts) - 1):
        c.line(*pts[i], *pts[i + 1])
    c.setStrokeAlpha(1)
    for (px, py) in pts:
        glow_dot(c, px, py, 2.4, dot_color)


# ================================================================== pages

def p_cover(c):
    """Tri-band cover: three worlds on one page."""
    bw = PW / 3.0
    # Band I: night
    c.setFillColor(C(D1["ground"]))
    c.rect(0, 0, bw, PH, stroke=0, fill=1)
    for (gx, gy, gr, gc) in [(70, 430, 3.4, "#FFD166"), (150, 470, 2.4, "#A8E063"),
                             (110, 360, 2.0, "#9BD4E4"), (190, 395, 2.8, "#FF9447"),
                             (90, 300, 1.8, "#FFD166"), (175, 320, 2.2, "#A8E063")]:
        glow_dot(c, gx, gy, gr, gc)
    tracked(c, 44, 200, "NIGHT", "Lora", 30, 3, C("#EDF3EA"))
    tracked(c, 44, 164, "SURVEY", "Lora", 30, 3, C("#EDF3EA"))
    c.setFont("DejaVuMono", 7)
    c.setFillColor(C("#9DB0A2"))
    c.drawString(44, 140, "DIRECTION I")
    # Band II: overprint
    c.setFillColor(C(D2["ground"]))
    c.rect(bw, 0, bw, PH, stroke=0, fill=1)
    c.setFillAlpha(0.85)
    c.setFillColor(C("#FF48B0"))
    c.circle(bw + 120, 420, 70, stroke=0, fill=1)
    c.setFillColor(C("#00A35C"))
    c.circle(bw + 175, 370, 70, stroke=0, fill=1)
    c.setFillAlpha(1)
    halftone(c, bw + 50, 270, 90, 40, "#181512", step=8, rmax=2.0)
    c.setFont("Lato-Black", 31)
    c.setFillColor(C("#181512"))
    c.drawString(bw + 44, 176, "OVER-")
    c.drawString(bw + 44, 142, "PRINT")
    c.setFont("DejaVuMono", 7)
    c.setFillColor(C("#52483E"))
    c.drawString(bw + 44, 118, "DIRECTION II")
    # Band III: pigment index
    c.setFillColor(C(D3["ground"]))
    c.rect(2 * bw, 0, bw, PH, stroke=0, fill=1)
    cols = ["#A63D2F", "#D9A521", "#2F4DA0", "#5C4632", "#6B7F2E", "#8E2D56"]
    sw = (bw - 88) / 3.0
    for i, col in enumerate(cols):
        r, q = divmod(i, 3)
        c.setFillColor(C(col))
        c.rect(2 * bw + 44 + q * sw, 400 - r * sw, sw - 6, sw - 6, stroke=0, fill=1)
    c.setFont("Lora", 30)
    c.setFillColor(C("#1F2421"))
    c.drawString(2 * bw + 44, 176, "Pigment")
    c.drawString(2 * bw + 44, 142, "Index")
    c.setFont("DejaVuMono", 7)
    c.setFillColor(C("#5A615B"))
    c.drawString(2 * bw + 44, 118, "DIRECTION III")
    # Title strip
    c.setFillColor(C("#181512"))
    c.rect(0, 500, PW, 64, stroke=0, fill=1)
    c.setFont("Lato-Black", 21)
    c.setFillColor(C("#FCFBF6"))
    c.drawString(M, 522, "Brand Directions -- Round 2")
    c.setFont("Lato", 9.5)
    c.setFillColor(C("#B9B2A4"))
    c.drawRightString(PW - M, 524, "Three different worlds, after precedent research.  June 2026")
    c.setFont("DejaVuMono", 6.5)
    c.setFillColor(C("#85897F"))
    c.drawString(M, 26, FOOTER)
    c.drawRightString(PW - M, 26, "01")


def p_reset(c, num):
    page_start(c, "#F4F2EC", C("#8A857A"), num)
    ink, sub = C("#1F1D18"), C("#5C574C")
    kicker(c, M, PH - 78, "ROUND 2 / THE RESET", C("#A8552F"))
    c.setFont("Lora", 27)
    c.setFillColor(ink)
    c.drawString(M, PH - 112, "What we heard, and what changes")
    y = block(c, M, PH - 148,
              "Round 1 presented three directions that were really three rooms "
              "of one house: the same cream paper, the same muted earth inks, "
              "the same almanac register at three volumes. All three also sat "
              "close to the site's current paper-and-green look. The owner asked "
              "for a real spread -- directions that disagree with each other.",
              "Lato", 10.5, 440, 15.5, sub)
    y = block(c, M, y - 14,
              "Round 2 starts from research instead of taste: a survey of the "
              "best-designed sites adjacent to this mission, of cartographic "
              "registers, of contemporary craft print culture, and of where "
              "identity design is moving in 2026. Each direction now stakes a "
              "different claim on every axis that matters.",
              "Lato", 10.5, 440, 15.5, sub)
    # Distinctness axes table (right column)
    tx = 540
    c.setFont("Lato-Bold", 9)
    c.setFillColor(ink)
    c.drawString(tx, PH - 112, "AXES FORCED APART THIS ROUND")
    rows = [
        ("Ground", "night spruce / press white / seasonal tint"),
        ("Type register", "luminous serif / wood-type poster / kinetic variable"),
        ("Imagery engine", "data-as-light / stencil overprint / pigment fields"),
        ("Map treatment", "firefly / spot-ink poster / pigment dots"),
        ("Season mechanism", "light temperature / two-ink edition / tint + type drift"),
    ]
    yy = PH - 134
    for label, val in rows:
        c.setFont("DejaVuMono", 7)
        c.setFillColor(C("#A8552F"))
        c.drawString(tx, yy, label.upper())
        yy = block(c, tx, yy - 11, val, "Lato", 8.8, 200, 11.5, sub) - 7
    # Bottom strip: what carries over from the brief
    c.setStrokeColor(C("#D8D3C6"))
    c.setLineWidth(0.8)
    c.line(M, 188, PW - M, 188)
    c.setFont("Lato-Bold", 9)
    c.setFillColor(ink)
    c.drawString(M, 168, "STILL GOVERNED BY THE BRIEF, IN ALL THREE")
    y = block(c, M, 150,
              "Expressive display + quiet text. Two owned imagery engines (SVG "
              "illustration, data-as-art). A seasonal living palette in CSS "
              "variables. Safety colors unmistakable and colorblind-"
              "distinguishable. Occurrence is never permission -- placed "
              "prominently, in every direction. No photography dependency. "
              "No twee, no institutional, no rustic kitsch.",
              "Lato", 9.5, PW - 2 * M, 14, sub)


PRECEDENTS_A = [
    ("Emergence Magazine", "Studio Airport; Webby & European Design Award work",
     "Literary ecology with radical but disciplined art direction. Full-bleed "
     "immersion always paired with a calm library index to come home to.",
     "Lesson: one expressive move per surface; immersion needs wayfinding."),
    ("Mushroom Color Atlas", "Julie Beeler, with Yuli Gates illustrations",
     "Dye swatches from fungi are the navigation itself -- click a color, "
     "reach the mushroom. Illustration and data are one system.",
     "Lesson: let the material's own output (its color) be the interface."),
    ("Falling Fruit / iNaturalist", "the data platforms this site draws on",
     "Deep, trusted data with thin visual identity. Credible, institutional, "
     "and emotionally flat -- the gap Craft Almanac can own.",
     "Lesson: data alone does not invite; identity must carry the warmth."),
    ("Native Land / Queering the Map", "counter-mapping projects",
     "Rendering choices read as values: what glows, what is withheld, what "
     "is named. Their maps argue; people feel it.",
     "Lesson: 'occurrence is not permission' can be a designed moment, "
     "not a disclaimer in small print."),
]

PRECEDENTS_B = [
    ("Firefly cartography", "John Nelson / Esri; earth.nullschool",
     "Dark, desaturated basemaps with glowing thematic data. The technique "
     "makes ordinary point data feel alive and precious -- leaned-in, not "
     "scanned. nullschool became beloved infrastructure on atmosphere alone.",
     "Lesson: the basemap is the brand. A custom map style is the single "
     "highest-leverage identity asset this site owns."),
    ("The paper survey register", "USGS quads, almanacs, the current site",
     "Warm, credible, familiar -- and so familiar it disappears. Round 1 "
     "lived here three times. Kept available as a register, not a default.",
     "Lesson: paper must be pushed (scale, color, type) or abandoned."),
    ("Color-field interfaces", "Mushroom Color Atlas; archive catalogs",
     "Large fields of meaningful color organize without chrome. Works "
     "because the color is data, not decoration.",
     "Lesson: material-derived palettes give us color no competitor can copy."),
]

PRECEDENTS_C = [
    ("Riso & print-studio culture", "RISOTTO, Risolve, People of Print's 51 studios",
     "Fluorescent two-ink overprints, visible misregistration, small-batch "
     "pride. This is what 'craft' looks like to contemporary makers -- "
     "joyful and hand-made without a single antique gesture.",
     "Lesson: hands visible, never rustic. Overprint logic is also cheap "
     "in CSS (mix-blend-mode)."),
    ("Craft schools on the web", "Penland, Haystack, North House",
     "Beloved institutions, conventional websites: photo grids and quiet "
     "type. The workshop warmth dies in translation.",
     "Lesson: an opening -- no one owns 'craft education' visually online."),
    ("2026 identity currents", "It's Nice That, Creative Bloq, Fontfabric, Branding Journal",
     "Type-as-hero and kinetic, stacked, poster-scale headlines. Adaptive "
     "identities that respond to context instead of staying fixed. Texture "
     "and tactile layering over flat sterility; serif resurgence in "
     "editorial. Warmth is the trend; polish for its own sake is not.",
     "Lesson: an almanac that knows the season is exactly an adaptive "
     "identity -- our premise is current, our round-1 execution was not."),
]


def p_precedents(c, num, title, subtitle, items, thumb):
    page_start(c, "#F4F2EC", C("#8A857A"), num)
    ink, sub = C("#1F1D18"), C("#5C574C")
    kicker(c, M, PH - 78, "PRECEDENT RESEARCH", C("#A8552F"))
    c.setFont("Lora", 24)
    c.setFillColor(ink)
    c.drawString(M, PH - 110, title)
    c.setFont("Lora-Italic", 11.5)
    c.setFillColor(sub)
    c.drawString(M, PH - 130, subtitle)
    y = PH - 168
    for i, (name, who, what, lesson) in enumerate(items):
        c.setFont("Lato-Bold", 11)
        c.setFillColor(ink)
        c.drawString(M, y, name)
        c.setFont("DejaVuMono", 6.8)
        c.setFillColor(C("#8A857A"))
        c.drawString(M + pdfmetrics.stringWidth(name, "Lato-Bold", 11) + 10, y, who.upper())
        y = block(c, M, y - 14, what, "Lato", 9.3, 470, 13, sub)
        y = block(c, M, y - 3, lesson, "Lato-Bold", 9.3, 470, 13, C("#A8552F")) - 14
    thumb(c)


def thumb_a(c):
    x, w = 580, PW - M - 580
    # Emergence: dark immersive block
    c.setFillColor(C("#22251F"))
    c.rect(x, 400, w, 90, stroke=0, fill=1)
    c.setFont("Lora-Italic", 12)
    c.setFillColor(C("#E8E4D8"))
    c.drawString(x + 14, 452, "the forest holds")
    c.drawString(x + 14, 436, "its breath")
    c.setStrokeColor(C("#8A857A"))
    c.setLineWidth(0.5)
    c.line(x + 14, 416, x + 60, 416)
    # MCA: swatch strip
    for i, col in enumerate(["#C2563B", "#D9A521", "#7C8B4D", "#4D6E8B", "#8E5E8A", "#6B4632"]):
        c.setFillColor(C(col))
        c.rect(x + i * (w / 6), 330, w / 6 - 3, 46, stroke=0, fill=1)
    # Falling fruit: flat dots
    c.setFillColor(C("#EDEAE0"))
    c.rect(x, 240, w, 70, stroke=0, fill=1)
    import random
    random.seed(7)
    c.setFillColor(C("#7A8B6F"))
    for _ in range(40):
        c.circle(x + 8 + random.random() * (w - 16), 248 + random.random() * 54, 1.6, stroke=0, fill=1)
    c.setFont("DejaVuMono", 6)
    c.setFillColor(C("#8A857A"))
    c.drawString(x, 224, "RICH DATA, THIN IDENTITY")


def thumb_b(c):
    x, w = 580, PW - M - 580
    # Firefly map
    c.setFillColor(C("#10141A"))
    c.rect(x, 330, w, 160, stroke=0, fill=1)
    c.setStrokeColor(C("#2A3340"))
    c.setLineWidth(0.7)
    c.bezier(x + 10, 350, x + 50, 400, x + 90, 380, x + w - 10, 460)
    for (px, py, col) in [(x + 40, 430, "#FFD166"), (x + 80, 390, "#FFD166"),
                          (x + 110, 440, "#A8E063"), (x + 60, 360, "#FF9447"),
                          (x + 130, 365, "#9BD4E4"), (x + 95, 415, "#FFD166")]:
        glow_dot(c, px, py, 2.6, col)
    c.setFont("DejaVuMono", 6)
    c.setFillColor(C("#8A857A"))
    c.drawString(x, 314, "FIREFLY: DATA AS LIGHT")
    # paper register
    c.setFillColor(C("#F6F3EA"))
    c.rect(x, 220, w, 70, stroke=0, fill=1)
    c.setStrokeColor(C("#CFC9B8"))
    c.setLineWidth(0.6)
    for i in range(4):
        c.line(x + 8, 232 + i * 14, x + w - 8, 232 + i * 14)
    c.setFont("DejaVuMono", 6)
    c.setFillColor(C("#8A857A"))
    c.drawString(x, 204, "PAPER: WARM, INVISIBLE")


def thumb_c(c):
    x, w = 580, PW - M - 580
    # riso overprint
    c.setFillColor(C("#FFFFFF"))
    c.rect(x, 360, w, 130, stroke=0, fill=1)
    c.setFillAlpha(0.8)
    c.setFillColor(C("#FF48B0"))
    c.rect(x + 14, 390, 70, 70, stroke=0, fill=1)
    c.setFillColor(C("#00A35C"))
    c.rect(x + 50, 376, 70, 70, stroke=0, fill=1)
    c.setFillAlpha(1)
    c.setFont("DejaVuMono", 6)
    c.setFillColor(C("#8A857A"))
    c.drawString(x, 344, "TWO INKS, THIRD COLOR FREE")
    # kinetic type
    c.setFillColor(C("#F1EFE8"))
    c.rect(x, 220, w, 100, stroke=0, fill=1)
    c.setFillColor(C("#181512"))
    c.setFont("Lato-Black", 22)
    c.drawString(x + 12, 286, "MAKE")
    c.setFont("Lora-Italic", 22)
    c.drawString(x + 12, 258, "make")
    c.setFont("Lora", 22)
    c.drawString(x + 12, 232, "Make")
    c.setFont("DejaVuMono", 6)
    c.setFillColor(C("#8A857A"))
    c.drawString(x, 204, "TYPE AS THE HERO IMAGE")


def p_principles(c, num):
    page_start(c, "#181512", C("#85897F"), num)
    kicker(c, M, PH - 78, "ANALYSIS / WHAT WE TAKE", C("#FFB400"))
    c.setFont("Lora", 26)
    c.setFillColor(C("#FCFBF6"))
    c.drawString(M, PH - 112, "Five principles for Round 2")
    prin = [
        ("01", "One expressive move per surface.",
         "Emergence's discipline: each page gets one radical gesture; everything else stays quiet and legible."),
        ("02", "The basemap is the brand.",
         "A custom Mapbox style is our highest-leverage asset. Each direction restyles the map first, the chrome second."),
        ("03", "Let materials supply the color.",
         "Madder, weld, walnut, oak gall: palettes no competitor can copy, and color that teaches while it decorates."),
        ("04", "Hands visible, never antique.",
         "Contemporary craft reads as riso ink and confident cuts, not parchment. Texture yes; distressing never."),
        ("05", "The identity should know the season.",
         "Adaptive identities are the current; an almanac that visibly turns with the year is ours by right."),
    ]
    y = PH - 150
    for n, head, body in prin:
        c.setFont("DejaVuMono", 9)
        c.setFillColor(C("#FFB400"))
        c.drawString(M, y, n)
        c.setFont("Lato-Bold", 11.5)
        c.setFillColor(C("#FCFBF6"))
        c.drawString(M + 30, y, head)
        y = block(c, M + 30, y - 14, body, "Lato", 9.3, 600, 13, C("#B9B2A4")) - 13
    block(c, M, y - 6,
          "And one contract: if two directions could share a page unnoticed, "
          "one of them is wrong. The matrix on page 23 holds them apart.",
          "Lora-Italic", 11, 600, 15, C("#FFB400"))


def p_overview(c, num):
    page_start(c, "#F4F2EC", C("#8A857A"), num)
    ink = C("#1F1D18")
    kicker(c, M, PH - 70, "THE THREE WORLDS", C("#A8552F"))
    c.setFont("Lora", 24)
    c.setFillColor(ink)
    c.drawString(M, PH - 100, "Three claims, side by side")
    pw3 = (PW - 2 * M - 40) / 3.0
    y0, hh = 150, 330
    # Panel I
    x = M
    c.setFillColor(C(D1["ground"]))
    c.rect(x, y0, pw3, hh, stroke=0, fill=1)
    for (gx, gy, col) in [(x + 40, y0 + 240, "#FFD166"), (x + 90, y0 + 270, "#A8E063"),
                          (x + 140, y0 + 230, "#FF9447"), (x + 70, y0 + 195, "#9BD4E4")]:
        glow_dot(c, gx, gy, 2.6, col)
    tracked(c, x + 18, y0 + 130, "NIGHT SURVEY", "Lora", 15, 1.6, C("#EDF3EA"))
    block(c, x + 18, y0 + 106, "The map as a lantern. Data becomes light; seasons change its temperature.",
          "Lato-Light", 8.8, pw3 - 36, 12, C("#9DB0A2"))
    c.setFont("DejaVuMono", 6.5)
    c.setFillColor(C("#FFD166"))
    c.drawString(x + 18, y0 + 16, "FEELS: NOCTURNAL / PRECIOUS")
    # Panel II
    x = M + pw3 + 20
    c.setFillColor(C("#FFFFFF"))
    c.setStrokeColor(C("#E4DED2"))
    c.rect(x, y0, pw3, hh, stroke=1, fill=1)
    c.setFillAlpha(0.82)
    c.setFillColor(C("#FF5C1F"))
    c.circle(x + pw3 * 0.42, y0 + 240, 44, stroke=0, fill=1)
    c.setFillColor(C("#14563F"))
    c.circle(x + pw3 * 0.62, y0 + 212, 44, stroke=0, fill=1)
    c.setFillAlpha(1)
    c.setFont("Lato-Black", 17)
    c.setFillColor(C("#181512"))
    c.drawString(x + 18, y0 + 130, "OVERPRINT")
    block(c, x + 18, y0 + 106, "A community print shop. Every season is a new two-ink edition.",
          "Poppins", 8.6, pw3 - 36, 12, C("#52483E"))
    c.setFont("DejaVuMono", 6.5)
    c.setFillColor(C("#C73A2E"))
    c.drawString(x + 18, y0 + 16, "FEELS: JOYFUL / HANDS-ON")
    # Panel III
    x = M + 2 * (pw3 + 20)
    c.setFillColor(C(D3["ground"]))
    c.rect(x, y0, pw3, hh, stroke=0, fill=1)
    cols = ["#A63D2F", "#D9A521", "#2F4DA0", "#6B7F2E"]
    for i, col in enumerate(cols):
        c.setFillColor(C(col))
        c.rect(x + 18 + i * ((pw3 - 36) / 4), y0 + 200, (pw3 - 36) / 4 - 4, 80, stroke=0, fill=1)
    c.setFont("Lora", 16)
    c.setFillColor(C("#1F2421"))
    c.drawString(x + 18, y0 + 130, "Pigment Index")
    block(c, x + 18, y0 + 106, "The interface is the color of the material. Archive precision, living type.",
          "Lato", 8.8, pw3 - 36, 12, C("#5A615B"))
    c.setFont("DejaVuMono", 6.5)
    c.setFillColor(C("#A63D2F"))
    c.drawString(x + 18, y0 + 16, "FEELS: PRECISE / CURIOUS")
    block(c, M, 118,
          "Each is presented in five pages: the world, type and wordmark, color and season "
          "system, the map, and a material page with voice. Safety chips and the ethics line "
          "appear in all three -- they are the constants being dressed three ways.",
          "Lato", 9, PW - 2 * M, 13, C("#5C574C"))


# ----------------------------------------------------------- Direction I pages

def p_d1_world(c, num):
    d = D1
    page_start(c, d["ground"], C("#6E7F73"), num)
    kicker(c, M, PH - 78, "DIRECTION I", C(d["accent"]))
    tracked(c, M, PH - 130, "Night Survey", "Lora", 40, 2.5, C(d["ink"]))
    c.setFont("Lora-Italic", 14)
    c.setFillColor(C(d["accent"]))
    c.drawString(M, PH - 156, d["tagline"])
    block(c, M, PH - 192, d["concept"], d["text_font"], 10.5, 420, 15.5, C("#C5D2C4"))
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C(d["accent"]))
    c.drawString(M, 240, "M O T I F S")
    block(c, M, 224, d["motifs"], d["text_font"], 9.5, 420, 13.5, C("#9DB0A2"))
    # right: constellation specimen
    pts = [(560, 420), (610, 470), (665, 440), (700, 480)]
    constellation(c, pts, "#5A6E60", "#FFD166")
    leaf_line(c, 600, 250, 80, "#A8E063", lw=0.9)
    leaf_line(c, 680, 230, 60, "#9BD4E4", lw=0.9)
    c.setFont("DejaVuMono", 6.5)
    c.setFillColor(C("#6E7F73"))
    c.drawString(560, 210, "ENGRAVED LIGHT-LINE SPECIMENS + FIREFLY DATA")
    block(c, M, 150, "Precedents working here: firefly cartography, earth.nullschool, "
          "Emergence's dark immersive features. No one in the foraging or craft "
          "space owns the night.", "Lora-Italic", 10, PW - 2 * M, 14, C("#9DB0A2"))


def p_d1_type(c, num):
    d = D1
    page_start(c, d["ground"], C("#6E7F73"), num)
    kicker(c, M, PH - 78, "DIRECTION I / WORDMARK + TYPE", C(d["accent"]))
    # wordmark study
    tracked(c, M, PH - 150, "CRAFT ALMANAC", "Lora", 34, 9, C(d["ink"]))
    glow_dot(c, M + 510, PH - 140, 4.5, d["accent"])
    c.setFont("DejaVuMono", 7)
    c.setFillColor(C("#9DB0A2"))
    c.drawString(M, PH - 172, "LETTERSPACED LUMINOUS SERIF; THE LANTERN DOT MARKS 'NOW' ON EVERY SURFACE")
    c.setStrokeColor(C(d["hair"]))
    c.setLineWidth(0.8)
    c.line(M, PH - 196, PW - M, PH - 196)
    # type stack
    rows = [
        ("DISPLAY", d["display_rec"], "Lora stand-in", "Lora", 21, "After dark, the riverbank"),
        ("TEXT", d["text_rec"], "Lato Light stand-in", "Lato-Light", 11.5,
         "Quiet, highly readable, set generously on the dark ground."),
        ("LABELS / DATA", d["label_rec"], "DejaVu Mono stand-in", "DejaVuMono", 9,
         "N 41.802  W 71.412 . SAMBUCUS . RIPE WK 24-28"),
    ]
    y = PH - 232
    for role, rec, standin, font, size, sample in rows:
        c.setFont("Lato-Bold", 7.5)
        c.setFillColor(C(d["accent"]))
        c.drawString(M, y, role)
        c.setFont("DejaVuMono", 6.8)
        c.setFillColor(C("#6E7F73"))
        c.drawString(M + 110, y, ("REC: " + rec + "  /  " + standin).upper())
        c.setFont(font, size)
        c.setFillColor(C(d["ink"]))
        c.drawString(M, y - size - 8, sample)
        y -= size + 44
    block(c, M, y + 8,
          "Type behavior: display serif appears only in light-on-dark identity moments "
          "(masthead, mode names, species headings) where its contrast glows. Body and UI "
          "stay matte. Mono carries coordinates, weeks, and rule citations -- the survey voice.",
          d["text_font"], 9.5, PW - 2 * M - 200, 13.5, C("#9DB0A2"))
    # small specimen right
    constellation(c, [(640, 200), (680, 240), (716, 215)], "#5A6E60", "#A8E063")


def p_d1_color(c, num):
    d = D1
    page_start(c, d["ground"], C("#6E7F73"), num)
    kicker(c, M, PH - 78, "DIRECTION I / COLOR + SEASON SYSTEM", C(d["accent"]))
    c.setFont("Lora", 22)
    c.setFillColor(C(d["ink"]))
    c.drawString(M, PH - 110, "A dark core; seasons change the temperature of the light")
    # core
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C("#9DB0A2"))
    c.drawString(M, PH - 140, "STABLE CORE")
    core = [("#121A16", "spruce field"), ("#1C2721", "panel"), ("#EDF3EA", "light text"),
            ("#9DB0A2", "muted"), ("#2E3B33", "hairline")]
    x = M
    for col, lab in core:
        c.setFillColor(C(col))
        c.setStrokeColor(C("#3A4A40"))
        c.setLineWidth(0.6)
        c.rect(x, PH - 210, 74, 56, stroke=1, fill=1)
        c.setFont("DejaVuMono", 6.3)
        c.setFillColor(C("#9DB0A2"))
        c.drawString(x, PH - 222, lab.upper())
        c.drawString(x, PH - 231, col.upper())
        x += 86
    # seasons as glows
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C("#9DB0A2"))
    c.drawString(M, PH - 262, "SEASONAL LIGHT (ONE VARIABLE SET PER SEASON)")
    x = M
    for name, col, lab in d["seasons"]:
        c.setFillColor(C("#1C2721"))
        c.rect(x, PH - 350, 150, 70, stroke=0, fill=1)
        glow_dot(c, x + 36, PH - 315, 5.5, col)
        hist(c, x + 62, PH - 340, 76, 44, MONTH_VALS[:8], col)
        c.setFont("DejaVuMono", 6.5)
        c.setFillColor(C(d["ink"]))
        c.drawString(x, PH - 362, (name + " . " + lab).upper())
        x += 166
    # safety chips
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C("#9DB0A2"))
    c.drawString(M, 198, "ACCESS STATUS ON THE DARK GROUND -- TUNED FOR LUMINANCE CONTRAST, CVD-CHECKED")
    chip_row(c, M, 168, d["safety"], C(d["ink"]), on_dark=True)
    block(c, M, 138, d["season_note"], d["text_font"], 9.3, PW - 2 * M, 13, C("#9DB0A2"))


def p_d1_map(c, num):
    d = D1
    page_start(c, d["ground"], C("#6E7F73"), num)
    kicker(c, M, PH - 78, "DIRECTION I / THE MAP", C(d["accent"]))
    # full-bleed-ish map vignette
    mx, my, mw, mh = M, 120, PW - 2 * M, PH - 230
    c.setFillColor(C("#0E1512"))
    c.rect(mx, my, mw, mh, stroke=0, fill=1)
    # terrain whispers
    c.setStrokeColor(C("#22302A"))
    c.setLineWidth(0.8)
    for i in range(5):
        yy = my + 40 + i * 55
        c.bezier(mx + 20, yy, mx + mw * 0.3, yy + 40, mx + mw * 0.6, yy - 35, mx + mw - 20, yy + 18)
    # water
    c.setStrokeColor(C("#27414B"))
    c.setLineWidth(2.2)
    c.bezier(mx + 60, my + 20, mx + mw * 0.35, my + mh * 0.5, mx + mw * 0.55, my + mh * 0.35, mx + mw - 80, my + mh - 30)
    # glow data
    import random
    random.seed(3)
    season_cols = ["#FFD166", "#A8E063", "#FF9447", "#9BD4E4"]
    for i in range(26):
        px = mx + 40 + random.random() * (mw - 300)
        py = my + 25 + random.random() * (mh - 50)
        glow_dot(c, px, py, 1.6 + random.random() * 2.0, season_cols[i % 4 if i % 5 else 0])
    # smoked glass popup
    px, py, pw_, ph_ = mx + mw - 250, my + mh - 170, 220, 140
    c.setFillColor(C("#1C2721"))
    c.setFillAlpha(0.93)
    c.roundRect(px, py, pw_, ph_, 6, stroke=0, fill=1)
    c.setFillAlpha(1)
    glow_dot(c, px + 18, py + ph_ - 22, 3, "#FFD166")
    c.setFont("Lora", 13)
    c.setFillColor(C(d["ink"]))
    c.drawString(px + 32, py + ph_ - 27, "Elderberry")
    c.setFont("DejaVuMono", 6.6)
    c.setFillColor(C("#9DB0A2"))
    c.drawString(px + 16, py + ph_ - 44, "SAMBUCUS CANADENSIS . RIPE WK 24-28")
    hist(c, px + 16, py + 52, pw_ - 32, 26, MONTH_VALS, "#FFD166")
    c.setFillColor(C("#5BE08A"))
    c.circle(px + 21, py + 36, 4, stroke=0, fill=1)
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C(d["ink"]))
    c.drawString(px + 30, py + 33, "Allowed here -- 1 gal/person/day")
    c.setFont("DejaVuMono", 6.2)
    c.setFillColor(C("#FFC94D"))
    c.drawString(px + 16, py + 14, "OCCURRENCE IS NOT PERMISSION")
    c.setFont("DejaVuMono", 6.5)
    c.setFillColor(C("#6E7F73"))
    c.drawString(M, 100, "CUSTOM MAPBOX DARK STYLE . FIREFLY POINTS . SMOKED-GLASS PANELS . ETHICS LINE LIVES INSIDE EVERY POPUP")


def p_d1_page(c, num):
    d = D1
    page_start(c, d["ground"], C("#6E7F73"), num)
    kicker(c, M, PH - 78, "DIRECTION I / A MATERIAL PAGE + VOICE", C(d["accent"]))
    # left: item page vignette
    vx, vy, vw, vh = M, 130, 330, PH - 240
    c.setFillColor(C("#1C2721"))
    c.roundRect(vx, vy, vw, vh, 8, stroke=0, fill=1)
    tracked(c, vx + 24, vy + vh - 50, "ELDERBERRY", "Lora", 19, 2.5, C(d["ink"]))
    c.setFont("DejaVuMono", 6.5)
    c.setFillColor(C("#9DB0A2"))
    c.drawString(vx + 24, vy + vh - 68, "NO. 012 . FOOD + INK . RIPE WK 24-28")
    leaf_line(c, vx + 70, vy + vh - 210, 110, "#A8E063", lw=1.0)
    constellation(c, [(vx + 180, vy + vh - 150), (vx + 230, vy + vh - 120), (vx + 270, vy + vh - 160)],
                  "#5A6E60", "#FFD166")
    hist(c, vx + 24, vy + 70, vw - 48, 36, MONTH_VALS, "#FFD166")
    c.setFont("DejaVuMono", 6.2)
    c.setFillColor(C("#9DB0A2"))
    c.drawString(vx + 24, vy + 54, "SEASON HISTOGRAM -- DATA AS THE HERO IMAGE")
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C("#5BE08A"))
    c.drawString(vx + 24, vy + 28, "GATHER GENTLY: ABUNDANT . LEAVE STEMS FOR BIRDS")
    # right: voice
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C(d["accent"]))
    c.drawString(430, PH - 120, "V O I C E")
    block(c, 430, PH - 142, d["voice"], "Lora-Italic", 12.5, 300, 18, C(d["ink"]))
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C(d["accent"]))
    c.drawString(430, PH - 260, "H O W   I T   T E A C H E S")
    block(c, 430, PH - 280,
          "Projector-friendly 'daybreak' theme for classrooms; the dark theme "
          "returns after sunset. Survey-grade mono data keeps research "
          "credibility; the glow keeps the wonder.",
          d["text_font"], 9.5, 300, 13.5, C("#9DB0A2"))
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C(d["accent"]))
    c.drawString(430, PH - 360, "R I S K")
    block(c, 430, PH - 380, d["risk"], d["text_font"], 9.5, 300, 13.5, C("#9DB0A2"))


# ---------------------------------------------------------- Direction II pages

def p_d2_world(c, num):
    d = D2
    page_start(c, d["ground"], C("#8A857A"), num)
    kicker(c, M, PH - 78, "DIRECTION II", C("#C73A2E"))
    c.setFont("Lato-Black", 44)
    c.setFillColor(C(d["ink"]))
    c.drawString(M, PH - 132, "OVERPRINT")
    c.setFont("Lora-Italic", 14)
    c.setFillColor(C("#C73A2E"))
    c.drawString(M, PH - 156, d["tagline"])
    block(c, M, PH - 192, d["concept"], d["text_font"], 10.5, 420, 15.5, C(d["sub"]))
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C("#C73A2E"))
    c.drawString(M, 240, "M O T I F S")
    block(c, M, 224, d["motifs"], d["text_font"], 9.5, 420, 13.5, C(d["sub"]))
    # right: overprint study + stencil
    c.setFillAlpha(0.82)
    c.setFillColor(C("#FF5C1F"))
    c.circle(610, 420, 58, stroke=0, fill=1)
    c.setFillColor(C("#14563F"))
    c.circle(665, 385, 58, stroke=0, fill=1)
    c.setFillAlpha(1)
    stencil_mushroom(c, 600, 240, 60, "#FF5C1F", "#14563F")
    halftone(c, 650, 240, 80, 40, "#181512", step=7, rmax=1.9)
    c.setFont("DejaVuMono", 6.5)
    c.setFillColor(C("#8A857A"))
    c.drawString(560, 214, "STENCIL CUTS + HALFTONE + OVERPRINT")
    block(c, M, 150, "Precedents working here: RISOTTO and the riso-studio wave, broadside "
          "poster culture, 2026's poster-scale type. The closest world to the craft "
          "processes the site teaches.", "Lora-Italic", 10, PW - 2 * M, 14, C(d["sub"]))


def p_d2_type(c, num):
    d = D2
    page_start(c, d["ground"], C("#8A857A"), num)
    kicker(c, M, PH - 78, "DIRECTION II / WORDMARK + TYPE", C("#C73A2E"))
    # stacked overprint wordmark
    c.setFillAlpha(0.84)
    c.setFont("Lato-Black", 46)
    c.setFillColor(C("#FF5C1F"))
    c.drawString(M + 3, PH - 150, "CRAFT")
    c.setFillColor(C("#14563F"))
    c.drawString(M, PH - 153, "CRAFT")
    c.setFillColor(C("#FF5C1F"))
    c.drawString(M + 3, PH - 196, "ALMANAC")
    c.setFillColor(C("#14563F"))
    c.drawString(M, PH - 199, "ALMANAC")
    c.setFillAlpha(1)
    c.setFont("DejaVuMono", 7)
    c.setFillColor(C(d["sub"]))
    c.drawString(M, PH - 220, "STACKED WOOD TYPE, TWO SEASONAL INKS, MISREGISTERED ON PURPOSE; RE-INKED FOUR TIMES A YEAR")
    c.setStrokeColor(C(d["hair"]))
    c.line(M, PH - 240, PW - M, PH - 240)
    rows = [
        ("DISPLAY", d["display_rec"], "Lato Black stand-in", "Lato-Black", 19, "TAKE A LITTLE. LEAVE THE REST."),
        ("TEXT / UI", d["text_rec"], "Poppins stand-in", "Poppins", 11,
         "Friendly geometric body that stays out of the ink's way."),
        ("LABELS", d["label_rec"], "DejaVu Mono stand-in", "DejaVuMono", 9,
         "EDITION 26-SUMMER . SUNFLOWER x COBALT"),
    ]
    y = PH - 276
    for role, rec, standin, font, size, sample in rows:
        c.setFont("Lato-Bold", 7.5)
        c.setFillColor(C("#C73A2E"))
        c.drawString(M, y, role)
        c.setFont("DejaVuMono", 6.8)
        c.setFillColor(C("#8A857A"))
        c.drawString(M + 110, y, ("REC: " + rec + "  /  " + standin).upper())
        c.setFont(font, size)
        c.setFillColor(C(d["ink"]))
        c.drawString(M, y - size - 8, sample)
        y -= size + 42
    block(c, M, y + 4,
          "Type behavior: headlines earn poster scale only on identity surfaces and project "
          "broadsides; rules, access statuses, and species data are always set quiet and plain. "
          "The contrast between shout and whisper is the brand.",
          d["text_font"], 9.5, PW - 2 * M, 13.5, C(d["sub"]))


def p_d2_color(c, num):
    d = D2
    page_start(c, d["ground"], C("#8A857A"), num)
    kicker(c, M, PH - 78, "DIRECTION II / COLOR + SEASON SYSTEM", C("#C73A2E"))
    c.setFont("Lato-Black", 20)
    c.setFillColor(C(d["ink"]))
    c.drawString(M, PH - 110, "FOUR EDITIONS A YEAR, TWO INKS EACH")
    x = M
    for name, a, b, ov, lab in d["seasons"]:
        # overprint demo
        c.setFillAlpha(0.85)
        c.setFillColor(C(a))
        c.circle(x + 42, PH - 190, 34, stroke=0, fill=1)
        c.setFillColor(C(b))
        c.circle(x + 76, PH - 210, 34, stroke=0, fill=1)
        c.setFillAlpha(1)
        c.setFillColor(C(ov))
        c.rect(x, PH - 290, 118, 26, stroke=0, fill=1)
        c.setFont("DejaVuMono", 6.4)
        c.setFillColor(C(d["ink"]))
        c.drawString(x, PH - 304, name.upper() + " . " + lab.upper())
        c.setFillColor(C(d["sub"]))
        c.drawString(x, PH - 314, "OVERLAP " + ov.upper())
        x += 166
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C(d["sub"]))
    c.drawString(M, PH - 350, "PRESS CONSTANTS")
    x = M
    for col, lab in [("#FCFBF6", "press white"), ("#181512", "text ink"), ("#E4DED2", "hairline")]:
        c.setFillColor(C(col))
        c.setStrokeColor(C(d["hair"]))
        c.rect(x, PH - 412, 74, 48, stroke=1, fill=1)
        c.setFont("DejaVuMono", 6.3)
        c.setFillColor(C(d["sub"]))
        c.drawString(x, PH - 424, lab.upper())
        x += 86
    hist(c, 380, PH - 412, 180, 48, MONTH_VALS, "#FF5C1F")
    c.setFont("DejaVuMono", 6.3)
    c.setFillColor(C(d["sub"]))
    c.drawString(380, PH - 424, "DATA PRINTS IN THE SEASON'S INK")
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C(d["ink"]))
    c.drawString(M, 168, "ACCESS STATUS -- A FIXED NEUTRAL SYSTEM, NEVER SEASONAL, ALWAYS ON WHITE CHIPS")
    chip_row(c, M, 138, d["safety"], C(d["ink"]))
    block(c, M, 110, d["season_note"], d["text_font"], 9.3, PW - 2 * M, 13, C(d["sub"]))


def p_d2_map(c, num):
    d = D2
    page_start(c, d["ground"], C("#8A857A"), num)
    kicker(c, M, PH - 78, "DIRECTION II / THE MAP", C("#C73A2E"))
    mx, my, mw, mh = M, 120, PW - 2 * M, PH - 230
    c.setFillColor(C("#F7F4EC"))
    c.setStrokeColor(C(d["ink"]))
    c.setLineWidth(2.0)
    c.rect(mx, my, mw, mh, stroke=1, fill=1)
    # bold park shapes in season inks
    c.setFillAlpha(0.8)
    c.setFillColor(C("#FFB400"))
    c.roundRect(mx + 40, my + 60, 180, 130, 18, stroke=0, fill=1)
    c.setFillColor(C("#2456D6"))
    c.roundRect(mx + 150, my + 140, 200, 120, 18, stroke=0, fill=1)
    c.setFillAlpha(1)
    halftone(c, mx + 380, my + 60, 110, 70, "#2456D6", step=8, rmax=2.2)
    # road
    c.setStrokeColor(C(d["ink"]))
    c.setLineWidth(3)
    c.bezier(mx + 20, my + mh - 40, mx + mw * 0.4, my + mh - 90, mx + mw * 0.55, my + 60, mx + mw - 30, my + 90)
    # data points: bold ringed dots
    for (px, py) in [(mx + 110, my + 130), (mx + 250, my + 200), (mx + 420, my + 100),
                     (mx + 320, my + 230), (mx + 180, my + 90)]:
        c.setFillColor(C("#FF48B0") if px % 2 else C("#FFB400"))
        c.setFillColor(C("#FFB400"))
        c.circle(px, py, 7, stroke=0, fill=1)
        c.setStrokeColor(C(d["ink"]))
        c.setLineWidth(1.6)
        c.circle(px, py, 7, stroke=1, fill=0)
    # print-label popup
    px, py, pw_, ph_ = mx + mw - 260, my + mh - 165, 230, 135
    c.setFillColor(C("#FFFFFF"))
    c.setStrokeColor(C(d["ink"]))
    c.setLineWidth(2.2)
    c.rect(px, py, pw_, ph_, stroke=1, fill=1)
    c.setFillColor(C("#FFB400"))
    c.rect(px, py + ph_ - 26, pw_, 26, stroke=0, fill=1)
    c.setFont("Lato-Black", 12)
    c.setFillColor(C(d["ink"]))
    c.drawString(px + 12, py + ph_ - 19, "ELDERBERRY")
    c.setFont("DejaVuMono", 6.6)
    c.drawString(px + 12, py + ph_ - 42, "EDITION 26-SUMMER . RIPE WK 24-28")
    hist(c, px + 12, py + 50, pw_ - 24, 24, MONTH_VALS, "#2456D6")
    c.setFillColor(C("#1E8A46"))
    c.circle(px + 17, py + 34, 4, stroke=0, fill=1)
    c.setFont("Poppins-Medium", 8)
    c.setFillColor(C(d["ink"]))
    c.drawString(px + 26, py + 31, "Allowed here -- 1 gal/person/day")
    c.setFont("DejaVuMono", 6.2)
    c.setFillColor(C("#C73A2E"))
    c.drawString(px + 12, py + 12, "OCCURRENCE IS NOT PERMISSION")
    c.setFont("DejaVuMono", 6.5)
    c.setFillColor(C(d["sub"]))
    c.drawString(M, 100, "PAPER BASEMAP PUSHED TO POSTER: SPOT-INK LAND SHAPES, HALFTONE WATER, RINGED DATA, LABEL POPUPS")


def p_d2_page(c, num):
    d = D2
    page_start(c, d["ground"], C("#8A857A"), num)
    kicker(c, M, PH - 78, "DIRECTION II / A PROJECT BROADSIDE + VOICE", C("#C73A2E"))
    # left: broadside vignette
    vx, vy, vw, vh = M, 130, 330, PH - 240
    c.setFillColor(C("#FFFFFF"))
    c.setStrokeColor(C(d["ink"]))
    c.setLineWidth(2)
    c.rect(vx, vy, vw, vh, stroke=1, fill=1)
    c.setFillAlpha(0.84)
    c.setFont("Lato-Black", 21)
    c.setFillColor(C("#FF5C1F"))
    c.drawString(vx + 20 + 2, vy + vh - 42, "OAK GALL INK")
    c.setFillColor(C("#14563F"))
    c.drawString(vx + 20, vy + vh - 44, "OAK GALL INK")
    c.setFillAlpha(1)
    c.setFont("DejaVuMono", 6.5)
    c.setFillColor(C(d["sub"]))
    c.drawString(vx + 20, vy + vh - 62, "A BROADSIDE IN SIX STEPS . EDITION 26-AUTUMN")
    steps = ["GATHER fallen galls -- hole means the wasp has left",
             "CRUSH and soak, three days",
             "ADD iron water; watch it turn",
             "STRAIN through cloth",
             "BIND with gum arabic",
             "WRITE something worth keeping"]
    y = vy + vh - 96
    for i, s in enumerate(steps):
        c.setFont("Lato-Black", 13)
        c.setFillColor(C("#FF5C1F") if i % 2 == 0 else C("#14563F"))
        c.drawString(vx + 20, y, "%02d" % (i + 1))
        block(c, vx + 52, y, s, "Poppins", 8.2, vw - 76, 11, C(d["ink"]))
        y -= 34
    stencil_mushroom(c, vx + vw - 60, vy + 20, 38, "#FF5C1F", "#14563F")
    # right: voice etc
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C("#C73A2E"))
    c.drawString(430, PH - 120, "V O I C E")
    block(c, 430, PH - 142, d["voice"], "Lato-Black", 11.5, 300, 16, C(d["ink"]))
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C("#C73A2E"))
    c.drawString(430, PH - 250, "H O W   I T   T E A C H E S")
    block(c, 430, PH - 270,
          "Project guides are literal broadsides -- printable, pin-up-able, "
          "classroom-native. Steps at poster scale read across a room. The "
          "quiet text layer holds the rigor and the rules.",
          d["text_font"], 9.5, 300, 13.5, C(d["sub"]))
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C("#C73A2E"))
    c.drawString(430, PH - 356, "R I S K")
    block(c, 430, PH - 376, d["risk"], d["text_font"], 9.5, 300, 13.5, C(d["sub"]))


# --------------------------------------------------------- Direction III pages

def p_d3_world(c, num):
    d = D3
    page_start(c, d["ground"], C("#8A9088"), num)
    kicker(c, M, PH - 78, "DIRECTION III", C(d["accent"]))
    c.setFont("Lora", 42)
    c.setFillColor(C(d["ink"]))
    c.drawString(M, PH - 130, "Pigment Index")
    c.setFont("Lora-Italic", 14)
    c.setFillColor(C(d["accent"]))
    c.drawString(M, PH - 156, d["tagline"])
    block(c, M, PH - 192, d["concept"], d["text_font"], 10.5, 420, 15.5, C("#3F4540"))
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C(d["accent"]))
    c.drawString(M, 240, "M O T I F S")
    block(c, M, 224, d["motifs"], d["text_font"], 9.5, 420, 13.5, C(d["sub"]))
    # right: pigment column with index labels
    x, w = 560, 180
    y = 200
    for i, (name, col) in enumerate(d["pigments"][:5]):
        c.setFillColor(C(col))
        c.rect(x, y + i * 56, w, 50, stroke=0, fill=1)
        c.setFont("DejaVuMono", 6.5)
        c.setFillColor(C("#FFFFFF"))
        c.drawString(x + 8, y + i * 56 + 8, ("NO. %03d  " % (47 - i * 9)) + name.upper())
    c.setFont("DejaVuMono", 6.5)
    c.setFillColor(C(d["sub"]))
    c.drawString(x, y - 16, "PIGMENT FIELDS AS NAVIGATION")
    block(c, M, 150, "Precedents working here: the Mushroom Color Atlas's swatch-first "
          "navigation, archive catalogs, 2026's adaptive identities. The research-grade "
          "direction -- and the craft is in the color itself.",
          "Lora-Italic", 10, PW - 2 * M, 14, C(d["sub"]))


def p_d3_type(c, num):
    d = D3
    page_start(c, d["ground"], C("#8A9088"), num)
    kicker(c, M, PH - 78, "DIRECTION III / WORDMARK + TYPE", C(d["accent"]))
    c.setFont("Lora", 36)
    c.setFillColor(C(d["ink"]))
    c.drawString(M, PH - 134, "Craft Almanac")
    c.setFont("DejaVuMono", 8.5)
    c.setFillColor(C(d["accent"]))
    c.drawString(M + 290, PH - 134, "CA--026")
    c.setFont("DejaVuMono", 7)
    c.setFillColor(C(d["sub"]))
    c.drawString(M, PH - 156, "WORDMARK + RUNNING INDEX NUMBER; THE MARK IS A CATALOG ENTRY THAT UPDATES WITH THE YEAR")
    # seasonal variable axis demo
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C(d["accent"]))
    c.drawString(M, PH - 190, "ONE VARIABLE FACE, FOUR SEASONS (FRAUNCES SOFT/WONK AXES -- STAND-INS SHOWN)")
    demos = [("Spring", "Lora-Italic", "soft, open"), ("Summer", "Lora", "full, easy"),
             ("Autumn", "Lora-Italic", "wonky, ripe"), ("Winter", "Lora", "sharp, upright")]
    x = M
    for name, font, qual in demos:
        c.setFont(font, 26)
        c.setFillColor(C(d["ink"]))
        c.drawString(x, PH - 232, "Almanac")
        c.setFont("DejaVuMono", 6.4)
        c.setFillColor(C(d["sub"]))
        c.drawString(x, PH - 248, (name + " . " + qual).upper())
        x += 168
    c.setStrokeColor(C(d["hair"]))
    c.setLineWidth(0.8)
    c.line(M, PH - 268, PW - M, PH - 268)
    rows = [
        ("TEXT / UI", d["text_rec"], "Lato stand-in", "Lato", 11,
         "Plain, legible, friendly -- the archive's quiet librarian."),
        ("LABELS / DATA", d["label_rec"], "DejaVu Mono stand-in", "DejaVuMono", 9,
         "NO. 047 . JUGLANS NIGRA . HULLS . WK 40-44 . LIGHTFAST 7/8"),
    ]
    y = PH - 300
    for role, rec, standin, font, size, sample in rows:
        c.setFont("Lato-Bold", 7.5)
        c.setFillColor(C(d["accent"]))
        c.drawString(M, y, role)
        c.setFont("DejaVuMono", 6.8)
        c.setFillColor(C("#8A9088"))
        c.drawString(M + 110, y, ("REC: " + rec + "  /  " + standin).upper())
        c.setFont(font, size)
        c.setFillColor(C(d["ink"]))
        c.drawString(M, y - size - 8, sample)
        y -= size + 40
    block(c, M, y + 2,
          "Type behavior: the display face is the one living thing in a disciplined system -- "
          "its softness drifts with the season via CSS font-variation-settings, the almanac "
          "premise expressed in the letterforms themselves. Everything else holds still.",
          d["text_font"], 9.5, PW - 2 * M, 13.5, C(d["sub"]))


def p_d3_color(c, num):
    d = D3
    page_start(c, d["ground"], C("#8A9088"), num)
    kicker(c, M, PH - 78, "DIRECTION III / COLOR + SEASON SYSTEM", C(d["accent"]))
    c.setFont("Lora", 22)
    c.setFillColor(C(d["ink"]))
    c.drawString(M, PH - 110, "Material-derived pigments; the ground turns with the year")
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C(d["sub"]))
    c.drawString(M, PH - 140, "THE PIGMENT SHELF -- EVERY COLOR IS A RECIPE A USER CAN MAKE")
    x = M
    for name, col in d["pigments"]:
        c.setFillColor(C(col))
        c.rect(x, PH - 222, 86, 64, stroke=0, fill=1)
        c.setFont("DejaVuMono", 6.3)
        c.setFillColor(C(d["sub"]))
        c.drawString(x, PH - 234, name.upper())
        c.drawString(x, PH - 243, col.upper())
        x += 96
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C(d["sub"]))
    c.drawString(M, PH - 274, "SEASONAL GROUND TINTS + LEAD PIGMENT (ONE VARIABLE EACH)")
    x = M
    for name, ground, accent, lab in d["seasons"]:
        c.setFillColor(C(ground))
        c.setStrokeColor(C(d["hair"]))
        c.setLineWidth(0.8)
        c.rect(x, PH - 356, 150, 64, stroke=1, fill=1)
        c.setFillColor(C(accent))
        c.rect(x + 12, PH - 344, 36, 40, stroke=0, fill=1)
        hist(c, x + 60, PH - 344, 78, 40, MONTH_VALS[:8], accent)
        c.setFont("DejaVuMono", 6.4)
        c.setFillColor(C(d["sub"]))
        c.drawString(x, PH - 368, (name + " . " + lab).upper())
        x += 166
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C(d["ink"]))
    c.drawString(M, 192, "ACCESS STATUS -- THE ONE PALETTE PIGMENTS NEVER TOUCH; SEMANTIC, FIXED, CVD-CHECKED")
    chip_row(c, M, 162, d["safety"], C(d["ink"]))
    block(c, M, 132, d["season_note"], d["text_font"], 9.3, PW - 2 * M, 13, C(d["sub"]))


def p_d3_map(c, num):
    d = D3
    page_start(c, d["ground"], C("#8A9088"), num)
    kicker(c, M, PH - 78, "DIRECTION III / THE MAP", C(d["accent"]))
    mx, my, mw, mh = M, 120, PW - 2 * M, PH - 230
    c.setFillColor(C("#E9EEE5"))
    c.rect(mx, my, mw, mh, stroke=0, fill=1)
    # quiet land/water
    c.setFillColor(C("#DDE5D8"))
    c.roundRect(mx + 60, my + 50, 240, 160, 30, stroke=0, fill=1)
    c.setStrokeColor(C("#B9C8CF"))
    c.setLineWidth(2)
    c.bezier(mx + 20, my + 30, mx + mw * 0.4, my + mh * 0.55, mx + mw * 0.6, my + mh * 0.3, mx + mw - 60, my + mh - 40)
    # pigment dots (each material in its own color)
    pts = [(mx + 120, my + 130, "#A63D2F"), (mx + 200, my + 170, "#5C4632"),
           (mx + 320, my + 110, "#2F4DA0"), (mx + 410, my + 200, "#D9A521"),
           (mx + 470, my + 120, "#6B7F2E"), (mx + 260, my + 90, "#8E2D56"),
           (mx + 380, my + 160, "#A63D2F"), (mx + 160, my + 210, "#3A3F3D")]
    for px, py, col in pts:
        c.setFillColor(C(col))
        c.circle(px, py, 5.5, stroke=0, fill=1)
    # index strip popup
    px, py, pw_, ph_ = mx + mw - 252, my + mh - 158, 224, 130
    c.setFillColor(C("#FFFFFF"))
    c.setStrokeColor(C(d["hair"]))
    c.setLineWidth(0.9)
    c.rect(px, py, pw_, ph_, stroke=1, fill=1)
    c.setFillColor(C("#5C4632"))
    c.rect(px, py, 16, ph_, stroke=0, fill=1)
    c.setFont("Lora", 13)
    c.setFillColor(C(d["ink"]))
    c.drawString(px + 28, py + ph_ - 24, "Black walnut")
    c.setFont("DejaVuMono", 6.5)
    c.setFillColor(C(d["sub"]))
    c.drawString(px + 28, py + ph_ - 40, "NO. 047 . INK + DYE . WK 40-44")
    hist(c, px + 28, py + 48, pw_ - 44, 24, MONTH_VALS, "#5C4632")
    c.setFillColor(C("#2F8F46"))
    c.circle(px + 33, py + 32, 4, stroke=0, fill=1)
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C(d["ink"]))
    c.drawString(px + 42, py + 29, "Allowed here -- fallen hulls only")
    c.setFont("DejaVuMono", 6.2)
    c.setFillColor(C("#C74437"))
    c.drawString(px + 28, py + 12, "OCCURRENCE IS NOT PERMISSION")
    c.setFont("DejaVuMono", 6.5)
    c.setFillColor(C(d["sub"]))
    c.drawString(M, 100, "DESATURATED GREY-GREEN BASEMAP; EVERY OCCURRENCE RENDERED IN ITS MATERIAL'S OWN PIGMENT; SPINE-TAB POPUPS")


def p_d3_page(c, num):
    d = D3
    page_start(c, d["ground"], C("#8A9088"), num)
    kicker(c, M, PH - 78, "DIRECTION III / A MATERIAL PAGE + VOICE", C(d["accent"]))
    # left: item page vignette
    vx, vy, vw, vh = M, 130, 330, PH - 240
    c.setFillColor(C("#FFFFFF"))
    c.setStrokeColor(C(d["hair"]))
    c.setLineWidth(0.9)
    c.rect(vx, vy, vw, vh, stroke=1, fill=1)
    # pigment field header
    c.setFillColor(C("#5C4632"))
    c.rect(vx, vy + vh - 90, vw, 90, stroke=0, fill=1)
    c.setFont("Lora", 19)
    c.setFillColor(C("#FFFFFF"))
    c.drawString(vx + 20, vy + vh - 46, "Black walnut")
    c.setFont("DejaVuMono", 6.5)
    c.drawString(vx + 20, vy + vh - 64, "NO. 047 . JUGLANS NIGRA . INK + DYE")
    # exposed grid
    c.setStrokeColor(C(d["hair"]))
    c.setLineWidth(0.6)
    c.line(vx + 20, vy + vh - 110, vx + vw - 20, vy + vh - 110)
    c.line(vx + vw * 0.55, vy + 40, vx + vw * 0.55, vy + vh - 110)
    # dye results mini-table
    fibers = [("WOOL", "#6E523B"), ("SILK", "#7A5C42"), ("COTTON", "#8A7055"), ("LINEN", "#94795D")]
    y = vy + vh - 140
    for fib, col in fibers:
        c.setFillColor(C(col))
        c.rect(vx + 20, y, 40, 18, stroke=0, fill=1)
        c.setFont("DejaVuMono", 6.4)
        c.setFillColor(C(d["sub"]))
        c.drawString(vx + 68, y + 5, fib + " . IRON SHIFTS DARKER")
        y -= 26
    hist(c, vx + vw * 0.55 + 14, vy + vh - 220, vw * 0.45 - 36, 60, MONTH_VALS, "#5C4632")
    c.setFont("DejaVuMono", 6.2)
    c.setFillColor(C(d["sub"]))
    c.drawString(vx + vw * 0.55 + 14, vy + vh - 234, "OCT IS YOUR MONTH")
    block(c, vx + 20, vy + 64, "Margin note: the year's first hard frost drops the hulls "
          "for you. Gloves on; the stain is the lesson.", "Lora-Italic", 8.8, vw - 40, 12.5,
          C(d["accent"]))
    c.setFont("Lato-Bold", 7.5)
    c.setFillColor(C("#2F8F46"))
    c.drawString(vx + 20, vy + 20, "GATHER GENTLY: FALLEN HULLS ONLY . ABUNDANT")
    # right: voice etc
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C(d["accent"]))
    c.drawString(430, PH - 120, "V O I C E")
    block(c, 430, PH - 142, d["voice"], "Lora-Italic", 12, 300, 17, C(d["ink"]))
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C(d["accent"]))
    c.drawString(430, PH - 262, "H O W   I T   T E A C H E S")
    block(c, 430, PH - 282,
          "Reads like a lab reference: index numbers cite cleanly, dye tables "
          "print cleanly, and the pigment shelf doubles as a curriculum -- "
          "each color is an assignment.",
          d["text_font"], 9.5, 300, 13.5, C(d["sub"]))
    c.setFont("Lato-Bold", 8)
    c.setFillColor(C(d["accent"]))
    c.drawString(430, PH - 366, "R I S K")
    block(c, 430, PH - 386, d["risk"], d["text_font"], 9.5, 300, 13.5, C(d["sub"]))


# ----------------------------------------------------------------- comparison

def p_matrix(c, num):
    page_start(c, "#F4F2EC", C("#8A857A"), num)
    ink, sub = C("#1F1D18"), C("#5C574C")
    kicker(c, M, PH - 70, "SIDE BY SIDE", C("#A8552F"))
    c.setFont("Lora", 24)
    c.setFillColor(ink)
    c.drawString(M, PH - 100, "The distinctness contract, checked")
    rows = [
        ("Ground", "spruce-black night", "press white + fluoro ink", "seasonal pale tints"),
        ("Display type", "luminous serif, letterspaced", "wood-type black, stacked", "variable serif that drifts"),
        ("Imagery lead", "data as light", "stencil cuts + halftone", "pigment fields + tables"),
        ("Map", "firefly on custom dark style", "poster paper, spot-ink shapes", "grey-green, pigment dots"),
        ("Season turn", "temperature of the light", "new two-ink edition", "ground tint + type softness"),
        ("Wordmark", "letterspaced + lantern dot", "stacked overprint", "catalog entry CA--026"),
        ("Feels like", "dusk walk with a lamp", "print shop open night", "an archive you can touch"),
        ("Nearest precedent", "firefly / nullschool", "RISOTTO / broadsides", "Mushroom Color Atlas"),
        ("Biggest risk", "dark UI by day", "loudness vs. safety", "minimal tips sterile"),
    ]
    col_x = [M, 250, 430, 610]
    heads = ["", "I . NIGHT SURVEY", "II . OVERPRINT", "III . PIGMENT INDEX"]
    head_cols = ["#1F1D18", "#3E5E5A", "#C73A2E", "#A63D2F"]
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
          "Constants in all three: safety chip semantics, the ethics line inside every popup, "
          "CSS-variable implementation, no photography, both imagery engines owned.",
          "Lora-Italic", 9.5, PW - 2 * M, 13, C("#A8552F"))


def p_decisions(c, num):
    page_start(c, "#181512", C("#85897F"), num)
    kicker(c, M, PH - 78, "ROUND 2 / DECISIONS WE NEED", C("#FFB400"))
    c.setFont("Lora", 26)
    c.setFillColor(C("#FCFBF6"))
    c.drawString(M, PH - 112, "Five asks")
    asks = [
        ("01", "Which world?",
         "Pick a lead direction -- or rule one out. Round 3 prototypes the survivor(s) live on the design branch."),
        ("02", "How far from daylight paper?",
         "Night Survey is the boldest break. Is a dark-first site viable for your teaching, given the daybreak theme?"),
        ("03", "Loudness budget.",
         "Overprint at full volume, or Overprint's ink logic at editorial volume? Both are buildable; they feel different."),
        ("04", "Seasonal mechanics.",
         "Light temperature, two-ink editions, or tint + type drift -- which seasonal turn should the site lead with? (They can be mixed, carefully.)"),
        ("05", "Cross-borrows.",
         "Anything a direction owns that you want regardless (firefly map, broadside guides, pigment shelf, variable-type seasons)? Name it and Round 3 carries it."),
    ]
    y = PH - 150
    for n, head, body in asks:
        c.setFont("DejaVuMono", 9)
        c.setFillColor(C("#FFB400"))
        c.drawString(M, y, n)
        c.setFont("Lato-Bold", 11.5)
        c.setFillColor(C("#FCFBF6"))
        c.drawString(M + 30, y, head)
        y = block(c, M + 30, y - 14, body, "Lato", 9.3, 620, 13, C("#B9B2A4")) - 14
    block(c, M, y - 2,
          "Process per the brief: converge on a direction in deck form, then build it as a "
          "live prototype on design/relaunch before anything touches main.",
          "Lora-Italic", 10.5, 640, 15, C("#FFB400"))


def p_risks(c, num):
    page_start(c, "#F4F2EC", C("#8A857A"), num)
    ink, sub = C("#1F1D18"), C("#5C574C")
    kicker(c, M, PH - 70, "RISKS + MITIGATIONS", C("#A8552F"))
    c.setFont("Lora", 24)
    c.setFillColor(ink)
    c.drawString(M, PH - 100, "Where each world can fail, and the guard rails")
    cols = [(D1, "#3E5E5A"), (D2, "#C73A2E"), (D3, "#A63D2F")]
    cw = (PW - 2 * M - 48) / 3.0
    for i, (d, hc) in enumerate(cols):
        x = M + i * (cw + 24)
        c.setFont("Lato-Bold", 10)
        c.setFillColor(C(hc))
        c.drawString(x, PH - 140, ("%s . %s" % (d["key"], d["name"])).upper())
        block(c, x, PH - 160, d["risk"], "Lato", 9, cw, 13, sub)
        extra = {
            "I": "Also: glow effects must stay performant -- pure CSS shadows and "
                 "pre-tinted SVG, no canvas filters. Accessibility audit on every "
                 "season's dark palette.",
            "II": "Also: misregistration is an identity gesture, never applied to "
                  "maps, charts, or safety UI. Print styles ship with the broadsides.",
            "III": "Also: variable-font loading is the one new asset weight; "
                   "subset aggressively and fall back to the static face.",
        }[d["key"]]
        block(c, x, PH - 250, extra, "Lato", 9, cw, 13, sub)
    block(c, M, 170,
          "Shared guard rail: all three keep the current information architecture (modes, "
          "filters, popups, rules). This is a reskin of meaning, not a rebuild of behavior -- "
          "CSS variables, fonts, SVG, and one Mapbox style each.",
          "Lora-Italic", 10, PW - 2 * M, 14, C("#A8552F"))


# -------------------------------------------------------------------- build

def main():
    c = canvas.Canvas(str(OUT), pagesize=(PW, PH))
    n = 1
    p_cover(c); c.showPage(); n += 1
    p_reset(c, n); c.showPage(); n += 1
    p_precedents(c, n, "Sites that share our mission",
                 "What the best-designed neighbors get right -- and the gap they leave.",
                 PRECEDENTS_A, thumb_a); c.showPage(); n += 1
    p_precedents(c, n, "Cartographic registers",
                 "Three ways a map can carry a brand.",
                 PRECEDENTS_B, thumb_b); c.showPage(); n += 1
    p_precedents(c, n, "Craft culture + 2026 currents",
                 "What contemporary craft looks like, and where identity design is moving.",
                 PRECEDENTS_C, thumb_c); c.showPage(); n += 1
    p_principles(c, n); c.showPage(); n += 1
    p_overview(c, n); c.showPage(); n += 1
    for fn in (p_d1_world, p_d1_type, p_d1_color, p_d1_map, p_d1_page,
               p_d2_world, p_d2_type, p_d2_color, p_d2_map, p_d2_page,
               p_d3_world, p_d3_type, p_d3_color, p_d3_map, p_d3_page):
        fn(c, n); c.showPage(); n += 1
    p_matrix(c, n); c.showPage(); n += 1
    p_risks(c, n); c.showPage(); n += 1
    p_decisions(c, n); c.showPage(); n += 1
    c.save()
    print("Wrote %s (%d pages)" % (OUT, n))


if __name__ == "__main__":
    main()
