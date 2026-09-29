#!/usr/bin/env python
"""
SportON logotipini vektor (SVG) ko'rinishida yaratish va undan 4K PNG chiqarish.

Nima qiladi:
  - Montserrat ExtraBold harflari va MaterialCommunityIcons «run-fast» belgisini
    konturlarga (path) aylantiradi — SVG hech qanday shriftga bog'liq emas
  - assets/logo/ ga quyidagilarni yozadi:
      sporton-logo.svg / .png            — oq yozuv, shaffof fon (ko'k fon ustiga)
      sporton-logo-color.svg / .png      — ko'k yozuv, shaffof fon (oq fon ustiga)
      sporton-logo-square.svg / .png     — ko'k kvadrat fon (asl logo ko'rinishi), 4096x4096
  - assets/icon.png, adaptive-icon.png, splash.png, favicon.png

O'rnatish (bir marta):
  pip install fonttools skia-pathops resvg-py pillow

Ishlatish:
  python scripts/make_logo.py
"""
import io
import sys
import urllib.request
from pathlib import Path

try:
    from fontTools.ttLib import TTFont
    from fontTools.varLib.instancer import instantiateVariableFont
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.transformPen import TransformPen
    from fontTools.pens.boundsPen import BoundsPen
    import pathops
    import resvg_py
    from PIL import Image
except ImportError as e:
    sys.exit(f"Kutubxona yetishmaydi ({e.name}). Buyruq: pip install fonttools skia-pathops resvg-py pillow")

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "logo"
FONT_CACHE = ROOT / "scripts" / ".cache" / "Montserrat.ttf"
FONT_URL = "https://github.com/google/fonts/raw/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf"
MDI_TTF = ROOT / "node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf"
RUN_FAST = 984174  # MaterialCommunityIcons glyphmap: "run-fast"

# Brend ranglari (src/theme/index.js bilan bir xil)
BLUE = "#0078FF"
GREEN = "#8CD80B"
WHITE = "#FFFFFF"


def load_montserrat(weight=800):
    if not FONT_CACHE.exists():
        FONT_CACHE.parent.mkdir(parents=True, exist_ok=True)
        print("Montserrat yuklab olinmoqda...")
        urllib.request.urlretrieve(FONT_URL, FONT_CACHE)
    return instantiateVariableFont(TTFont(FONT_CACHE), {"wght": weight})


def glyph_path(font, char_code, scale, dx, dy):
    """Glif konturini SVG path qatoriga aylantiradi (y o'qi pastga), ustma-ust qismlar birlashtiriladi."""
    gs = font.getGlyphSet()
    name = font.getBestCmap()[char_code]
    p = pathops.Path()
    gs[name].draw(TransformPen(p.getPen(), (scale, 0, 0, -scale, dx, dy)))
    p.simplify()
    pen = SVGPathPen(None, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
    p.draw(pen)
    return pen.getCommands(), gs[name].width * scale


def glyph_bounds(font, char_code):
    gs = font.getGlyphSet()
    name = font.getBestCmap()[char_code]
    bp = BoundsPen(gs)
    gs[name].draw(bp)
    return bp.bounds  # xMin, yMin, xMax, yMax (font birliklarida)


def text_paths(font, text, cap_px, x, baseline, tracking=0.0):
    """Matnni konturlarga aylantiradi. cap_px — bosh harf balandligi pikselda."""
    cap_units = font["OS/2"].sCapHeight
    s = cap_px / cap_units
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    parts = []
    start = x
    for ch in text:
        d, adv = glyph_path(font, ord(ch), s, x, baseline)
        parts.append(d)
        x += adv + tracking * cap_px
    # oxirgi harfning o'ng tomonidagi yon bo'shliqni hisobga olmaymiz
    last = cmap[ord(text[-1])]
    adv_w, lsb = hmtx[last]
    xmax = glyph_bounds(font, ord(text[-1]))[2]
    right = x - tracking * cap_px - (adv_w - xmax) * s
    first_lsb = glyph_bounds(font, ord(text[0]))[0] * s
    return " ".join(parts), start + first_lsb, right


def runner_path(mdi, height, x, y_top):
    """MDI «run-fast» belgisi: berilgan balandlikka moslab, (x, y_top) dan chiziladi."""
    xmin, ymin, xmax, ymax = glyph_bounds(mdi, RUN_FAST)
    s = height / (ymax - ymin)
    d, _ = glyph_path(mdi, RUN_FAST, s, x - xmin * s, y_top + ymax * s)
    return d, (xmax - xmin) * s


def build_mark(mont, mdi, ink, runner_ink, on_bg, on_ink):
    """Gorizontal logo: [yuguruvchi] SPORT [ON]. Qaytaradi: (svg_ichki, kenglik, balandlik)."""
    cap = 100.0
    box_h = cap * 1.9
    run_h = cap * 1.75
    gap = cap * 0.22
    top = 0.0
    mid = top + box_h / 2
    baseline = mid + cap / 2

    run_d, run_w = runner_path(mdi, run_h, 0, mid - run_h / 2)
    x = run_w + gap
    sport_d, sport_l, sport_r = text_paths(mont, "SPORT", cap, x, baseline, tracking=0.01)
    shift = x - sport_l
    sport_d, sport_l, sport_r = text_paths(mont, "SPORT", cap, x + shift, baseline, tracking=0.01)

    box_x = sport_r + cap * 0.38
    pad = cap * 0.34
    on_d, on_l, on_r = text_paths(mont, "ON", cap, box_x + pad, baseline, tracking=0.02)
    on_shift = box_x + pad - on_l
    on_d, on_l, on_r = text_paths(mont, "ON", cap, box_x + pad + on_shift, baseline, tracking=0.02)
    box_w = (on_r - (box_x + pad)) + 2 * pad
    width = box_x + box_w

    inner = (
        f'<path fill="{runner_ink}" d="{run_d}"/>'
        f'<path fill="{ink}" d="{sport_d}"/>'
        f'<rect x="{box_x:.2f}" y="{top:.2f}" width="{box_w:.2f}" height="{box_h:.2f}" rx="{cap * 0.12:.2f}" fill="{on_bg}"/>'
        f'<path fill="{on_ink}" d="{on_d}"/>'
    )
    return inner, width, box_h


def svg_doc(inner, w, h, pad_x, pad_y, bg=None, title="SportON"):
    W, H = w + 2 * pad_x, h + 2 * pad_y
    bg_el = f'<rect width="{W:.2f}" height="{H:.2f}" fill="{bg}"/>' if bg else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.2f} {H:.2f}" width="{W:.0f}" height="{H:.0f}">'
        f"<title>{title}</title>{bg_el}"
        f'<g transform="translate({pad_x:.2f} {pad_y:.2f})">{inner}</g></svg>'
    ), W, H


def square_doc(mdi, inner, w, h, size=1000, bg=BLUE, content_w=0.82, ghost=True):
    """Kvadrat logo: ko'k fon, orqada xira katta yuguruvchi, markazda gorizontal logo."""
    s = size * content_w / w
    tx = (size - w * s) / 2
    ty = (size - h * s) / 2
    ghost_el = ""
    if ghost:
        gh = size * 0.62
        gd, gw = runner_path(mdi, gh, 0, 0)
        gx = (size - gw) / 2 + size * 0.02
        gy = (size - gh) / 2
        ghost_el = f'<path fill="{WHITE}" fill-opacity="0.09" transform="translate({gx:.2f} {gy:.2f})" d="{gd}"/>'
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}">'
        f'<title>SportON</title><rect width="{size}" height="{size}" fill="{bg}"/>{ghost_el}'
        f'<g transform="translate({tx:.2f} {ty:.2f}) scale({s:.5f})">{inner}</g></svg>'
    )


def render(svg, width, out_png):
    data = resvg_py.svg_to_bytes(svg_string=svg, width=int(width))
    img = Image.open(io.BytesIO(bytes(data)))
    img.save(out_png, optimize=True)
    return img.size


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    mont = load_montserrat(800)
    mdi = TTFont(MDI_TTF)

    variants = {
        "sporton-logo": dict(ink=WHITE, runner_ink=WHITE, on_bg=GREEN, on_ink=WHITE),
        "sporton-logo-color": dict(ink=BLUE, runner_ink=BLUE, on_bg=GREEN, on_ink=WHITE),
    }
    for name, kw in variants.items():
        inner, w, h = build_mark(mont, mdi, **kw)
        svg, W, H = svg_doc(inner, w, h, pad_x=8, pad_y=8)
        (OUT / f"{name}.svg").write_text(svg, encoding="utf-8")
        print(name, render(svg, 3840, OUT / f"{name}.png"))
        if name == "sporton-logo":
            white_inner, ww, wh = inner, w, h

    sq = square_doc(mdi, white_inner, ww, wh)
    (OUT / "sporton-logo-square.svg").write_text(sq, encoding="utf-8")
    print("square", render(sq, 4096, OUT / "sporton-logo-square.png"))

    # Expo ilova ikonkalari
    assets = ROOT / "assets"
    render(sq, 1024, assets / "icon.png")
    render(square_doc(mdi, white_inner, ww, wh, content_w=0.6, ghost=False), 1024, assets / "adaptive-icon.png")
    render(square_doc(mdi, white_inner, ww, wh, content_w=0.7, ghost=False), 2048, assets / "splash.png")
    render(sq, 196, assets / "favicon.png")
    print("Tayyor:", OUT)


if __name__ == "__main__":
    main()
