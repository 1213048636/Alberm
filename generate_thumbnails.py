"""
Generate 256×256 thumbnails for all album cover images.
Input:  album-covers/{style}/*.png  (1024×1024 source)
Output: website/thumbnails/{style}/*.png  (256×256)
"""
from PIL import Image
import os

SOURCE_DIR = "D:/Documents/GitHub/Alberm/album-covers"
OUTPUT_DIR = "D:/Documents/GitHub/Alberm/website/thumbnails"
THUMB_SIZE = 256

styles = [
    "lofi", "minimal", "collage", "psychedelic", "sketch",
    "gothic", "nature", "glitch", "ugly-design", "zen"
]

for style in styles:
    in_dir = os.path.join(SOURCE_DIR, style)
    out_dir = os.path.join(OUTPUT_DIR, style)
    os.makedirs(out_dir, exist_ok=True)

    files = sorted([f for f in os.listdir(in_dir) if f.lower().endswith(".png")])
    count = 0

    for filename in files:
        src_path = os.path.join(in_dir, filename)
        dst_path = os.path.join(out_dir, filename)

        # Skip if thumb already exists (idempotent)
        if os.path.exists(dst_path):
            print(f"[{style}] Already exists: {filename}")
            count += 1
            continue

        try:
            img = Image.open(src_path)
            img_thumb = img.resize(
                (THUMB_SIZE, THUMB_SIZE),
                Image.Resampling.LANCZOS
            )
            # Convert palette/RGBA to RGB to ensure JPEG compatibility later
            if img_thumb.mode in ("RGBA", "P", "LA"):
                img_thumb = img_thumb.convert("RGBA")
            img_thumb.save(dst_path, "PNG")
            print(f"[{style}] Generated: {filename}")
            count += 1
        except Exception as e:
            print(f"[{style}] ERROR {filename}: {e}")

    print(f"[{style}] Done: {count} thumbnails")

print("\nAll thumbnails generated.")
print(f"Output: {OUTPUT_DIR}")