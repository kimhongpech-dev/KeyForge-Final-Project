"""Renders the KeyForge key logo (public/logo.svg design) into PNG/ICO icon files."""

from pathlib import Path

from PIL import Image, ImageDraw

PUBLIC = Path(__file__).resolve().parents[1] / "public"

INK = (0x16, 0x18, 0x1D, 255)
ACCENT = (0x3D, 0x94, 0xFF, 255)

BOW_CENTER = (23.0, 25.0)
BOW_R = 10.5
BOW_W = 5.5
HOLE_CENTER = (23.0, 22.5)
HOLE_R = 2.4
SHAFT = ((32.0, 34.0), (46.0, 48.0))
SHAFT_W = 5.5
TEETH = [
    ((39.7, 41.7), (42.9, 38.5)),
    ((41.8, 43.8), (45.0, 40.6)),
    ((43.9, 45.9), (47.1, 42.7)),
]
TEETH_W = 4.5

MASKABLE_SAFE = 0.80


def _draw(draw, scale, offset, key_scale):
    ox, oy = offset
    s = scale * key_scale

    def pt(p):
        return (ox + p[0] * s, oy + p[1] * s)

    def rad(r):
        return r * s

    def wd(w):
        return max(1, int(w * s + 0.5))

    def cap(p1, p2, w):
        draw.line([pt(p1), pt(p2)], fill=ACCENT, width=wd(w))
        for p in (p1, p2):
            r = wd(w) / 2
            draw.ellipse(
                [pt(p)[0] - r, pt(p)[1] - r, pt(p)[0] + r, pt(p)[1] + r],
                fill=ACCENT,
            )

    c = pt(BOW_CENTER)
    r = rad(BOW_R)
    w = wd(BOW_W)
    draw.ellipse(
        [c[0] - r - w / 2, c[1] - r - w / 2, c[0] + r + w / 2, c[1] + r + w / 2],
        outline=ACCENT,
        width=w,
    )
    hc = pt(HOLE_CENTER)
    hr = rad(HOLE_R)
    draw.ellipse([hc[0] - hr, hc[1] - hr, hc[0] + hr, hc[1] + hr], fill=INK)
    cap(*SHAFT, SHAFT_W)
    for t in TEETH:
        cap(*t, TEETH_W)


def render(size, maskable=False):
    img = Image.new("RGBA", (size, size), INK)
    draw = ImageDraw.Draw(img)
    scale = size / 64.0
    if maskable:
        key_scale = (MASKABLE_SAFE * size) / (48.0 * scale)
        offset = ((size - 48.0 * scale * key_scale) / 2.0,) * 2
    else:
        key_scale = 1.0
        offset = (0.0, 0.0)
    _draw(draw, scale, offset, key_scale)
    return img


def main():
    icons = {
        "favicon-16x16.png": render(16),
        "favicon-32x32.png": render(32),
        "apple-touch-icon.png": render(180),
        "icon-192.png": render(192),
        "icon-512.png": render(512),
        "icon-maskable-512.png": render(512, maskable=True),
    }
    for name, img in icons.items():
        img.save(PUBLIC / name)
    favicon = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    favicon.paste(render(64), (0, 0))
    favicon.save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    for name in icons:
        print(f"wrote {name} ({icons[name].size[0]}px)")
    print("wrote favicon.ico")


if __name__ == "__main__":
    main()
