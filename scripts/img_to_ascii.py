import sys
import os
from PIL import Image

def rgb_to_hex(r, g, b):
    return f"#{r:02x}{g:02x}{b:02x}"

def main():
    if len(sys.argv) < 3:
        print("Usage: python img_to_ascii.py <image.png> <output.ts> <name>")
        sys.exit(1)

    img_path = sys.argv[1]
    out_path = sys.argv[2]
    name = sys.argv[3]

    img = Image.open(img_path).convert("RGBA")
    
    # Resize to max 38x50
    img.thumbnail((38, 50), Image.Resampling.NEAREST)
    width, height = img.size

    # Identify background colors from corners
    corners = [(0,0), (width-1,0), (0,height-1), (width-1,height-1)]
    bg_colors = []
    for cx, cy in corners:
        r, g, b, a = img.getpixel((cx, cy))
        if a > 128:
            hx = rgb_to_hex(r, g, b)
            if hx not in bg_colors:
                bg_colors.append(hx)

    # Collect unique colors, ignoring transparent and background
    colors = {}
    for y in range(height):
        for x in range(width):
            r, g, b, a = img.getpixel((x, y))
            if a > 128:
                hx = rgb_to_hex(r, g, b)
                # Check distance to any bg_color
                is_bg = False
                for bg in bg_colors:
                    br, bg_, bb = int(bg[1:3], 16), int(bg[3:5], 16), int(bg[5:7], 16)
                    if (r-br)**2 + (g-bg_)**2 + (b-bb)**2 < 800: # tolerance
                        is_bg = True
                        break
                if not is_bg:
                    if hx not in colors:
                        colors[hx] = 1
                    else:
                        colors[hx] += 1

    # Sort colors by frequency and limit to 26
    sorted_colors = sorted(colors.items(), key=lambda item: item[1], reverse=True)
    if not sorted_colors:
        print(f"Warning: No foreground colors found for {img_path}")
        # fallback if everything matched background
        sorted_colors = [(rgb_to_hex(0,0,0), 1)]
    
    top_colors = [c[0] for c in sorted_colors[:26]]
    
    # Map hex to A-Z
    char_map = {hx: chr(65 + i) for i, hx in enumerate(top_colors)}

    def get_nearest_color(hx):
        if hx in char_map: return hx
        r1, g1, b1 = int(hx[1:3], 16), int(hx[3:5], 16), int(hx[5:7], 16)
        best_hx = top_colors[0]
        min_dist = 999999
        for tc in top_colors:
            r2, g2, b2 = int(tc[1:3], 16), int(tc[3:5], 16), int(tc[5:7], 16)
            dist = (r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2
            if dist < min_dist:
                min_dist = dist
                best_hx = tc
        return best_hx

    rows = []
    for y in range(height):
        row = ""
        for x in range(width):
            r, g, b, a = img.getpixel((x, y))
            if a <= 128:
                row += "."
            else:
                hx = rgb_to_hex(r, g, b)
                is_bg = False
                for bg in bg_colors:
                    br, bg_, bb = int(bg[1:3], 16), int(bg[3:5], 16), int(bg[5:7], 16)
                    if (r-br)**2 + (g-bg_)**2 + (b-bb)**2 < 800:
                        is_bg = True
                        break
                if is_bg:
                    row += "."
                else:
                    best_hx = get_nearest_color(hx)
                    row += char_map[best_hx]
        rows.append(row)

    # Pad lines so they are all same length if needed (thumbnail keeps aspect ratio)
    # usually width is consistent
    
    # Write TS
    ts_code = f'import type {{ SpriteDef }} from "../../engine/sprite";\n\n'
    ts_code += f'export const {name}: SpriteDef = {{\n'
    ts_code += f'  palette: {{\n'
    for hx, ch in char_map.items():
        ts_code += f'    {ch}: "{hx}",\n'
    ts_code += f'  }},\n'
    ts_code += f'  rows: [\n'
    for r in rows:
        ts_code += f'    "{r}",\n'
    ts_code += f'  ],\n'
    ts_code += f'}};\n'

    with open(out_path, 'w') as f:
        f.write(ts_code)
        
    print(f"Generated {out_path} for {name}")

if __name__ == "__main__":
    main()
