#!/usr/bin/env python
"""
SportON 3D ikonkalarini tayyorlash.

Nima qiladi:
  1. Rasmdagi fonni (shaxmat katakli "soxta shaffof" fon yoki och kulrang fon) olib tashlaydi
  2. Ikonkani chetlari bo'yicha kesadi, kvadrat shaklga keltiradi (6% bo'sh joy bilan)
  3. 512x512 sifatli, haqiqiy shaffof PNG qilib assets/icons/ ga saqlaydi
  4. src/data/icons.js faylini yangilaydi — ilova ikonkalarni avtomatik ishlata boshlaydi
  5. Tekshirish uchun assets/icons/_preview.png yaratadi

O'rnatish (bir marta):
  pip install pillow "rembg[cpu]"      # eng yuqori sifat (AI orqali fonni olib tashlash)
  pip install pillow                    # minimal variant (oddiy algoritm)

Ishlatish:
  python scripts/make_icons.py [manba_papka]

Manba rasmlar quyidagicha nomlangan bo'lishi kerak (jpg/png/webp):
  assets/icons/source/trophy.jpg, calendar.jpg, dumbbell.jpg, stadium.jpg, megaphone.jpg
"""
import os
import sys
from collections import deque
from pathlib import Path

try:
    from PIL import Image, ImageFilter
except ImportError:
    sys.exit("Pillow o'rnatilmagan. Buyruq: pip install pillow")

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "icons"
SRC = OUT / "source"
ICONS_JS = ROOT / "src" / "data" / "icons.js"

NAMES = ["stadium", "dumbbell", "trophy", "calendar", "megaphone"]
# Claude Code suhbatiga yuklangan rasmlar (3.jpg ... 7.jpg) uchun moslik
NUMERIC = {"3": "trophy", "4": "calendar", "5": "dumbbell", "6": "stadium", "7": "megaphone"}
CHAT_DIR = (
    Path(os.environ.get("LOCALAPPDATA", ""))
    / "Temp/claude/c--Users-User-Desktop-sporton/720eea37-3367-4c0c-9ac4-853ebf096cf1/images"
)
EXTS = {".jpg", ".jpeg", ".png", ".webp"}
SIZE = 512
MARGIN = 0.06


def find_sources(extra_dir=None):
    found = {}
    dirs = [Path(extra_dir)] if extra_dir else []
    dirs += [SRC, CHAT_DIR]
    for d in dirs:
        if not d.is_dir():
            continue
        for f in sorted(d.iterdir()):
            if f.suffix.lower() not in EXTS:
                continue
            name = f.stem.lower() if f.stem.lower() in NAMES else NUMERIC.get(f.stem)
            if name and name not in found:
                found[name] = f
    return found


# ---------------------------------------------------------------- fonni olib tashlash
_session = None


def remove_bg_ai(img):
    """rembg (AI) — eng toza chetlar. O'rnatilmagan bo'lsa None qaytaradi."""
    global _session
    try:
        from rembg import new_session, remove
    except ImportError:
        return None
    if _session is None:
        try:
            _session = new_session("isnet-general-use")
        except Exception:
            _session = new_session()
    try:
        return remove(
            img,
            session=_session,
            alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=12,
            alpha_matting_erode_size=8,
        ).convert("RGBA")
    except Exception:
        return remove(img, session=_session).convert("RGBA")


def remove_bg_simple(img):
    """Chetlardan boshlab och, rangsiz (kulrang/oq) piksellarni fon deb belgilaydi."""
    rgb = img.convert("RGB")
    w, h = rgb.size
    px = rgb.load()

    def is_bg(c):
        mx, mn = max(c), min(c)
        return mn >= 180 and (mx - mn) <= 22

    bg = bytearray(w * h)
    q = deque()
    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        i = y * w + x
        if bg[i] or not is_bg(px[x, y]):
            continue
        bg[i] = 1
        if x > 0:
            q.append((x - 1, y))
        if x < w - 1:
            q.append((x + 1, y))
        if y > 0:
            q.append((x, y - 1))
        if y < h - 1:
            q.append((x, y + 1))

    alpha = Image.frombytes("L", (w, h), bytes(0 if b else 255 for b in bg))
    # Och "halo"ni yo'qotish va chetlarni yumshatish
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.9))
    out = rgb.convert("RGBA")
    out.putalpha(alpha)
    return out


# ---------------------------------------------------------------- yakuniy ishlov
def finalize(rgba):
    alpha = rgba.getchannel("A").point(lambda v: 0 if v < 14 else v)
    rgba.putalpha(alpha)
    bbox = alpha.getbbox()
    if not bbox:
        raise ValueError("Ikonka topilmadi (rasm butunlay fon deb aniqlandi)")
    rgba = rgba.crop(bbox)

    w, h = rgba.size
    side = int(max(w, h) * (1 + 2 * MARGIN))
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.alpha_composite(rgba, ((side - w) // 2, (side - h) // 2))
    canvas = canvas.resize((SIZE, SIZE), Image.LANCZOS)

    r, g, b, a = canvas.split()
    rgb = Image.merge("RGB", (r, g, b)).filter(ImageFilter.UnsharpMask(radius=1.4, percent=70, threshold=2))
    out = Image.merge("RGBA", (*rgb.split(), a))
    # To'liq shaffof piksellarning rangini tozalaymiz (fayl hajmi kichrayadi, chetda "kir" chiqmaydi)
    clean = Image.new("RGBA", out.size, (0, 0, 0, 0))
    clean.paste(out, mask=a.point(lambda v: 255 if v > 0 else 0))
    return clean


def write_icons_js(names):
    lines = [
        "// Avtomatik yaratilgan fayl — scripts/make_icons.py. Qo'lda tahrirlamang.",
        "export const ICONS = {",
    ]
    for n in names:
        lines.append(f"  {n}: require('../../assets/icons/{n}.png'),")
    lines.append("};")
    ICONS_JS.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_preview(names):
    tile = 220
    sheet = Image.new("RGBA", (tile * len(names), tile), (0, 0, 0, 0))
    for i, n in enumerate(names):
        bg = Image.new("RGBA", (tile, tile), (255, 106, 0, 255) if i % 2 else (245, 246, 248, 255))
        icon = Image.open(OUT / f"{n}.png").resize((tile - 40, tile - 40), Image.LANCZOS)
        bg.alpha_composite(icon, (20, 20))
        sheet.paste(bg, (i * tile, 0))
    sheet.save(OUT / "_preview.png")


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # Windows konsolida ✓ belgisi uchun
    except Exception:
        pass
    sources = find_sources(sys.argv[1] if len(sys.argv) > 1 else None)
    if not sources:
        sys.exit(
            "Manba rasmlar topilmadi.\n"
            f"Rasmlarni shu papkaga qo'ying: {SRC}\n"
            "Nomlari: " + ", ".join(f"{n}.jpg" for n in NAMES)
        )

    OUT.mkdir(parents=True, exist_ok=True)
    ai_used = None
    for name in NAMES:
        src = sources.get(name)
        if not src:
            print(f"  ! {name}: manba topilmadi, o'tkazib yuborildi")
            continue
        img = Image.open(src).convert("RGBA")
        cut = remove_bg_ai(img)
        if cut is None:
            if ai_used is None:
                print("  (rembg o'rnatilmagan — oddiy algoritm ishlatilmoqda. Yuqori sifat uchun: pip install \"rembg[cpu]\")")
            ai_used = False
            cut = remove_bg_simple(img)
        else:
            ai_used = True
        result = finalize(cut)
        dest = OUT / f"{name}.png"
        result.save(dest, optimize=True)
        print(f"  ✓ {name:<10} {src.name} -> {dest.relative_to(ROOT)} ({dest.stat().st_size // 1024} KB)")

    ready = [n for n in NAMES if (OUT / f"{n}.png").exists()]
    write_icons_js(ready)
    write_preview(ready)
    print(f"\nTayyor: {len(ready)} ta ikonka. src/data/icons.js yangilandi.")
    print(f"Natijani tekshiring: {(OUT / '_preview.png').relative_to(ROOT)}")


if __name__ == "__main__":
    main()
