"""Generate the Indian Brewing Calculator app icon and launch splash.

Brand: "Copperline Rayfin" palette already used by the app itself
(ink #2b3137, header blue #36597f, copper accent #e08b2d/#a35f1c,
light page bg #f6f7f9). The icon is a copper kettle mark on a diagonal
ink->blue gradient; the splash reuses the same mark as a badge on the
app's own light background so the launch screen doesn't flash-transition
into a different color when the webview mounts.
"""
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

# ---- brand palette ----
INK = (43, 49, 55)
HEADER_BLUE = (54, 89, 127)
COPPER_LIGHT = (224, 139, 45)
COPPER_DARK = (163, 95, 28)
COPPER_HOVER = (198, 119, 34)
PAGE_BG = (246, 247, 249)
CREAM = (255, 250, 240)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def diagonal_gradient(size, c0, c1):
    w, h = size, size
    xx, yy = np.meshgrid(np.linspace(0, 1, w), np.linspace(0, 1, h))
    t = (xx + yy) / 2.0
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    for i in range(3):
        arr[..., i] = (c0[i] + (c1[i] - c0[i]) * t).astype(np.uint8)
    return Image.fromarray(arr, "RGB")


def vertical_gradient(size_w, size_h, c0, c1):
    xx, yy = np.meshgrid(np.linspace(0, 1, size_w), np.linspace(0, 1, size_h))
    arr = np.zeros((size_h, size_w, 3), dtype=np.uint8)
    for i in range(3):
        arr[..., i] = (c0[i] + (c1[i] - c0[i]) * yy).astype(np.uint8)
    return Image.fromarray(arr, "RGB")


def radial_vignette(size, strength=0.35):
    """Subtle darkening toward the edges for depth."""
    w = h = size
    yy, xx = np.mgrid[0:h, 0:w]
    cx, cy = w / 2, h / 2
    d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / (math.hypot(cx, cy))
    mask = 1 - strength * np.clip(d - 0.55, 0, 1) / 0.45
    return np.clip(mask, 0, 1)


def draw_kettle(draw, cx, cy, scale, copper_top, copper_bottom, rim_color, lid=True):
    """A round-bottomed brew kettle: dome lid, wide body, two handles, a tap."""
    s = scale
    body_w = 0.62 * s
    body_h = 0.50 * s
    body_top = cy - 0.02 * s
    body_bottom = body_top + body_h

    # Body (rounded pot) — layered horizontal bands for a simple gradient fill.
    bands = 40
    for i in range(bands):
        t0 = i / bands
        t1 = (i + 1) / bands
        y0 = body_top + t0 * body_h
        y1 = body_top + t1 * body_h
        # taper: narrower at the very top (neck) and bottom (base)
        taper = 1 - 0.14 * abs(0.5 - (t0 + t1) / 2) * 2
        w0 = body_w * taper
        color = lerp(copper_top, copper_bottom, t0)
        draw.rectangle(
            [cx - w0 / 2, y0 - 1, cx + w0 / 2, y1 + 1], fill=color
        )
    # Round the body's bottom and shoulders by masking with an ellipse overlay
    # (approximate by drawing rounded end-caps).
    draw.ellipse(
        [cx - body_w / 2, body_bottom - body_w * 0.16, cx + body_w / 2, body_bottom + body_w * 0.16],
        fill=copper_bottom,
    )
    draw.ellipse(
        [cx - body_w / 2, body_top - body_w * 0.10, cx + body_w / 2, body_top + body_w * 0.10],
        fill=copper_top,
    )

    # Domed lid
    if lid:
        lid_w = body_w * 0.86
        lid_h = 0.16 * s
        lid_top = body_top - lid_h
        draw.pieslice(
            [cx - lid_w / 2, lid_top - lid_h * 0.15, cx + lid_w / 2, lid_top + lid_h * 1.6],
            180, 360,
            fill=lerp(copper_top, (255, 255, 255), 0.06),
        )
        # lid rim
        rim_h = 0.045 * s
        draw.rounded_rectangle(
            [cx - lid_w / 2 - 0.02 * s, body_top - rim_h * 0.6, cx + lid_w / 2 + 0.02 * s, body_top + rim_h * 0.6],
            radius=rim_h * 0.5,
            fill=rim_color,
        )
        # knob
        knob_r = 0.028 * s
        draw.ellipse(
            [cx - knob_r, lid_top - lid_h * 0.15 - knob_r * 1.6, cx + knob_r, lid_top - lid_h * 0.15 + knob_r * 0.4],
            fill=rim_color,
        )

    # Handles (two side arcs)
    handle_r = body_w * 0.20
    handle_w = int(0.035 * s)
    for side in (-1, 1):
        hx = cx + side * (body_w / 2 - handle_r * 0.35)
        hy = body_top + body_h * 0.36
        bbox = [hx - handle_r, hy - handle_r, hx + handle_r, hy + handle_r]
        start, end = (110, 250) if side < 0 else (-70, 70)
        draw.arc(bbox, start, end, fill=rim_color, width=handle_w)

    # Base band
    band_h = 0.045 * s
    draw.rectangle(
        [cx - body_w * 0.42, body_bottom - band_h * 0.5, cx + body_w * 0.42, body_bottom + band_h * 0.5],
        fill=rim_color,
    )
    # Tripod feet
    foot_w = 0.02 * s
    foot_h = 0.05 * s
    for fx in (-0.30, 0.0, 0.30):
        x = cx + fx * body_w
        y0 = body_bottom + band_h * 0.4
        draw.rectangle([x - foot_w / 2, y0, x + foot_w / 2, y0 + foot_h], fill=rim_color)

    return body_top - 0.16 * s  # top of lid, for steam placement


def draw_steam(img, cx, top_y, scale, color, opacity=180):
    """Three soft rising steam curls, drawn on an RGBA overlay then blurred."""
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    s = scale
    curls = [
        (-0.16, 1.00, 0.55),
        (0.0, 1.15, 0.70),
        (0.16, 1.00, 0.55),
    ]
    for dx, h, wdt in curls:
        x0 = cx + dx * s
        pts = []
        n = 24
        amp = 0.055 * s
        for i in range(n + 1):
            t = i / n
            y = top_y - t * h * 0.30 * s
            x = x0 + math.sin(t * math.pi * 2.1) * amp * (1 - t * 0.3)
            pts.append((x, y))
        width = max(2, int(0.028 * s * wdt))
        od.line(pts, fill=(*color, opacity), width=width, joint="curve")
        # round the line ends
        r = width / 2
        od.ellipse([pts[0][0] - r, pts[0][1] - r, pts[0][0] + r, pts[0][1] + r], fill=(*color, opacity))
        od.ellipse([pts[-1][0] - r, pts[-1][1] - r, pts[-1][0] + r, pts[-1][1] + r], fill=(*color, opacity))
    overlay = overlay.filter(ImageFilter.GaussianBlur(scale * 0.006))
    img.alpha_composite(overlay) if img.mode == "RGBA" else img.paste(
        Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"), (0, 0)
    )
    return img


def build_icon(path, size=1024):
    img = diagonal_gradient(size, INK, HEADER_BLUE)
    vin = radial_vignette(size, strength=0.30)
    arr = np.array(img).astype(np.float32)
    arr *= vin[..., None]
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB")

    draw = ImageDraw.Draw(img, "RGBA")
    cx, cy = size * 0.5, size * 0.52
    scale = size * 0.56
    rim = lerp(COPPER_DARK, (20, 20, 20), 0.15)
    top_y = draw_kettle(draw, cx, cy, scale, COPPER_LIGHT, COPPER_DARK, rim)

    img = draw_steam(img, cx, top_y, scale, (255, 236, 214), opacity=150)

    # small, soft specular highlight in the upper-left only (no hard wedge)
    sheen = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(sheen)
    sr = size * 0.32
    sd.ellipse([size * 0.06 - sr, size * 0.02 - sr, size * 0.06 + sr, size * 0.02 + sr], fill=(255, 255, 255, 20))
    sheen = sheen.filter(ImageFilter.GaussianBlur(size * 0.06))
    img = Image.alpha_composite(img.convert("RGBA"), sheen).convert("RGB")

    img.save(path, "PNG")
    print("wrote", path, img.size, img.mode)


def build_splash_canvas(w, h):
    """Shared badge+wordmark splash artwork, laid out for an arbitrary
    width/height (used as-is for iOS's square canvas, and reused per
    Android density/orientation bucket)."""
    img = Image.new("RGB", (w, h), PAGE_BG)
    unit = min(w, h)  # scale relative to the shorter side so portrait and
                       # landscape both keep sensible proportions
    cx, cy = w / 2, h * 0.42

    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gr = unit * 0.42
    gd.ellipse([cx - gr, cy - gr, cx + gr, cy + gr], fill=(224, 139, 45, 28))
    glow = glow.filter(ImageFilter.GaussianBlur(unit * 0.05))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")

    badge = unit * 0.44
    bx0, by0 = cx - badge / 2, cy - badge / 2
    by1 = cy + badge / 2
    badge_img = diagonal_gradient(int(badge), INK, HEADER_BLUE)
    mask = Image.new("L", (int(badge), int(badge)), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([0, 0, badge, badge], radius=badge * 0.22, fill=255)
    img.paste(badge_img, (int(bx0), int(by0)), mask)

    bd = ImageDraw.Draw(img, "RGBA")
    kcx, kcy = cx, by0 + badge * 0.58
    kscale = badge * 0.62
    rim = lerp(COPPER_DARK, (20, 20, 20), 0.15)
    top_y = draw_kettle(bd, kcx, kcy, kscale, COPPER_LIGHT, COPPER_DARK, rim)
    img = draw_steam(img, kcx, top_y, kscale, (255, 236, 214), opacity=140)

    draw = ImageDraw.Draw(img, "RGBA")
    title = "INDIAN BREWING"
    subtitle = "CALCULATOR"
    font_path_candidates = [
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/SFNSDisplay-Bold.otf",
    ]
    font_big = font_small = None
    for fp in font_path_candidates:
        try:
            font_big = ImageFont.truetype(fp, int(unit * 0.058))
            font_small = ImageFont.truetype(fp, int(unit * 0.040))
            break
        except Exception:
            continue
    if font_big is None:
        font_big = ImageFont.load_default()
        font_small = font_big

    def centered_text(y, text, font, fill, tracking=0.0):
        if tracking:
            widths = [draw.textbbox((0, 0), ch, font=font)[2] for ch in text]
            total = sum(widths) + tracking * (len(text) - 1)
            x = cx - total / 2
            for ch, wch in zip(text, widths):
                draw.text((x, y), ch, font=font, fill=fill)
                x += wch + tracking
        else:
            bbox = draw.textbbox((0, 0), text, font=font)
            tw = bbox[2] - bbox[0]
            draw.text((cx - tw / 2, y), text, font=font, fill=fill)

    text_y0 = by1 + unit * 0.06
    centered_text(text_y0, title, font_big, (43, 49, 55, 255), tracking=unit * 0.007)
    centered_text(text_y0 + unit * 0.068, subtitle, font_small, (224, 139, 45, 255), tracking=unit * 0.016)

    line_y = text_y0 + unit * 0.068 + unit * 0.058
    line_w = unit * 0.11
    draw.rectangle([cx - line_w / 2, line_y, cx + line_w / 2, line_y + unit * 0.0045], fill=(224, 139, 45, 255))

    return img


def build_splash(path, size=2732):
    img = build_splash_canvas(size, size)
    img.save(path, "PNG")
    print("wrote", path, img.size, img.mode)


def build_adaptive_foreground(path, size=432):
    """Android adaptive icon foreground layer: kettle mark only, transparent
    background, confined to the inner ~66/108 safe zone so it survives
    circle/squircle/rounded-square launcher masks."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    cx, cy = size * 0.5, size * 0.52
    scale = size * 0.40  # smaller than the app icon's 0.56 to fit the safe zone
    rim = lerp(COPPER_DARK, (20, 20, 20), 0.15)
    top_y = draw_kettle(draw, cx, cy, scale, COPPER_LIGHT, COPPER_DARK, rim)
    img_rgb_for_steam = img  # draw_steam handles RGBA input directly
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    s = scale
    curls = [(-0.16, 1.00, 0.55), (0.0, 1.15, 0.70), (0.16, 1.00, 0.55)]
    for dx, h, wdt in curls:
        x0 = cx + dx * s
        pts = []
        n = 24
        amp = 0.055 * s
        for i in range(n + 1):
            t = i / n
            y = top_y - t * h * 0.30 * s
            x = x0 + math.sin(t * math.pi * 2.1) * amp * (1 - t * 0.3)
            pts.append((x, y))
        width = max(2, int(0.028 * s * wdt))
        color = (255, 236, 214)
        od.line(pts, fill=(*color, 170), width=width, joint="curve")
        r = width / 2
        od.ellipse([pts[0][0] - r, pts[0][1] - r, pts[0][0] + r, pts[0][1] + r], fill=(*color, 170))
        od.ellipse([pts[-1][0] - r, pts[-1][1] - r, pts[-1][0] + r, pts[-1][1] + r], fill=(*color, 170))
    overlay = overlay.filter(ImageFilter.GaussianBlur(scale * 0.006))
    img = Image.alpha_composite(img, overlay)

    img.save(path, "PNG")
    print("wrote", path, img.size, img.mode)


def build_legacy_launcher(path, size, round_mask=False):
    """Pre-Android-8 launcher icon: the full icon artwork (bg + mark),
    downsampled from the 1024 master. Optionally pre-clipped to a circle
    for ic_launcher_round, since older launchers expect that file to
    already be masked."""
    master = diagonal_gradient(1024, INK, HEADER_BLUE)
    vin = radial_vignette(1024, strength=0.30)
    arr = np.array(master).astype(np.float32)
    arr *= vin[..., None]
    master = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB").convert("RGBA")
    draw = ImageDraw.Draw(master, "RGBA")
    cx, cy = 1024 * 0.5, 1024 * 0.52
    scale = 1024 * 0.56
    rim = lerp(COPPER_DARK, (20, 20, 20), 0.15)
    top_y = draw_kettle(draw, cx, cy, scale, COPPER_LIGHT, COPPER_DARK, rim)
    master = draw_steam(master, cx, top_y, scale, (255, 236, 214), opacity=150).convert("RGBA")

    img = master.resize((size, size), Image.LANCZOS)
    if round_mask:
        mask = Image.new("L", (size, size), 0)
        md = ImageDraw.Draw(mask)
        md.ellipse([0, 0, size, size], fill=255)
        out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        out.paste(img, (0, 0), mask)
        img = out
    img.convert("RGBA").save(path, "PNG")
    print("wrote", path, img.size, img.mode)


ANDROID_DENSITIES = {
    "mdpi": 1.0,
    "hdpi": 1.5,
    "xhdpi": 2.0,
    "xxhdpi": 3.0,
    "xxxhdpi": 4.0,
}

# Exact portrait splash pixel sizes Capacitor's `cap add android` template
# ships per density (these are device-resolution buckets, not a uniform
# multiple of the mdpi base, so they're listed explicitly rather than
# computed from ANDROID_DENSITIES). Landscape is the transpose.
SPLASH_PORTRAIT_SIZES = {
    "mdpi": (320, 480),
    "hdpi": (480, 800),
    "xhdpi": (720, 1280),
    "xxhdpi": (960, 1600),
    "xxxhdpi": (1280, 1920),
}


if __name__ == "__main__":
    import sys
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "."

    build_icon(f"{out_dir}/icon-1024.png", 1024)
    build_splash(f"{out_dir}/splash-2732.png", 2732)

    for density, mult in ANDROID_DENSITIES.items():
        fg_size = round(108 * mult)
        build_adaptive_foreground(f"{out_dir}/android-foreground-{density}.png", fg_size)

        legacy_size = round(48 * mult)
        build_legacy_launcher(f"{out_dir}/android-launcher-{density}.png", legacy_size)
        build_legacy_launcher(f"{out_dir}/android-launcher-round-{density}.png", legacy_size, round_mask=True)

        sw, sh = SPLASH_PORTRAIT_SIZES[density]
        build_splash_canvas(sw, sh).save(f"{out_dir}/android-splash-port-{density}.png", "PNG")
        build_splash_canvas(sh, sw).save(f"{out_dir}/android-splash-land-{density}.png", "PNG")
        print("wrote android splash", density, sw, sh)

    # drawable/splash.png fallback — matches the template's landscape-mdpi size
    build_splash_canvas(480, 320).save(f"{out_dir}/android-splash-default.png", "PNG")
