#!/usr/bin/env python3
"""Capture section screenshots in viewport-sized chunks for readable PDF pages."""
import subprocess, sys, os, base64

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "playwright"])
    subprocess.check_call([sys.executable, "-m", "playwright", "install", "chromium"])
    from playwright.sync_api import sync_playwright

try:
    from PIL import Image
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

OUTPUT_DIR = "/home/z/my-project/screenshots_v2"
os.makedirs(OUTPUT_DIR, exist_ok=True)

VIEWPORT_HEIGHT = 900  # match browser viewport
VIEWPORT_WIDTH = 1440

SECTIONS = [
    ("inicio", "Inicio — Hero"),
    ("sobre-mi", "Sobre Mí"),
    ("planes", "Planes — Vita Más / Aqua Más"),
    ("promociones", "Promociones"),
    ("servicios", "Servicios Digitales"),
    ("contacto", "Contacto"),
]

def main():
    all_chunks = []  # list of (filepath, section_title, chunk_num)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": VIEWPORT_WIDTH, "height": VIEWPORT_HEIGHT})

        page.goto("http://localhost:3000", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)

        for section_id, section_title in SECTIONS:
            el = page.locator(f"#{section_id}")
            if el.count() == 0:
                print(f"✗ Section #{section_id} not found")
                continue

            # Get section dimensions and position
            box = el.bounding_box()
            if not box:
                print(f"✗ No bounding box for #{section_id}")
                continue

            section_height = box["height"]
            section_top = box["y"]

            print(f"\n→ {section_title} (h={section_height:.0f}px, top={section_top:.0f}px)")

            # Calculate how many chunks we need
            num_chunks = max(1, int(section_height / VIEWPORT_HEIGHT) + (1 if section_height % VIEWPORT_HEIGHT > 100 else 0))

            for chunk_idx in range(num_chunks):
                scroll_y = section_top + (chunk_idx * VIEWPORT_HEIGHT)
                # Don't scroll past the section
                max_scroll = section_top + section_height - VIEWPORT_HEIGHT
                scroll_y = min(scroll_y, max(0, max_scroll))

                page.evaluate(f"window.scrollTo(0, {scroll_y})")
                page.wait_for_timeout(300)

                # Capture viewport
                safe_name = section_id.replace("-", "_")
                filename = f"{safe_name}_chunk_{chunk_idx}.png"
                filepath = os.path.join(OUTPUT_DIR, filename)
                page.screenshot(path=filepath, animations="disabled")

                im = Image.open(filepath)
                # Crop only the section part visible in viewport
                visible_top = max(0, section_top - scroll_y)
                visible_bottom = min(VIEWPORT_HEIGHT, section_top + section_height - scroll_y)
                if visible_bottom > visible_top and visible_top >= 0:
                    cropped = im.crop((0, int(visible_top), VIEWPORT_WIDTH, int(visible_bottom)))
                    cropped.save(filepath)
                    cropped.close()
                im.close()

                all_chunks.append((filepath, section_title, chunk_idx + 1))
                print(f"  ✓ Chunk {chunk_idx + 1}: {filepath}")

        browser.close()

    print(f"\n✅ Total chunks captured: {len(all_chunks)}")

    # Now generate PDF
    generate_pdf(all_chunks)

def generate_pdf(chunks):
    logo_path = "/home/z/my-project/public/logo_hominis.png"
    logo_b64 = ""
    if os.path.exists(logo_path):
        with open(logo_path, "rb") as f:
            logo_b64 = base64.b64encode(f.read()).decode()

    total_content_pages = len(chunks)
    total_pages = total_content_pages + 1  # +1 cover

    sections_html = ""
    for i, (filepath, section_title, chunk_num) in enumerate(chunks):
        with open(filepath, "rb") as f:
            img_b64 = base64.b64encode(f.read()).decode()

        page_num = i + 1
        # If multi-chunk, add part indicator
        # Count how many chunks for this section
        section_chunks = [c for c in chunks if c[1] == section_title]
        part_label = f" ({chunk_num}/{len(section_chunks)})" if len(section_chunks) > 1 else ""

        sections_html += f"""
    <div class="section-page">
      <div class="section-header">
        <div class="section-number">{page_num}</div>
        <h2 class="section-title">{section_title}{part_label}</h2>
      </div>
      <div class="screenshot-container">
        <img src="data:image/png;base64,{img_b64}" alt="{section_title}" />
      </div>
      <div class="page-footer">
        <span>Hominis — Agustina C. Candia</span>
        <span>Pág. {page_num} de {total_content_pages}</span>
      </div>
    </div>
    """

    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Hominis - Pantallas del Sistema</title>
<style>
  @page {{
    size: A4 landscape;
    margin: 0;
  }}
  html, body {{
    margin: 0;
    padding: 0;
    background: #ffffff;
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  }}

  .cover {{
    width: 297mm;
    height: 210mm;
    background: linear-gradient(135deg, #1a237e 0%, #4a148c 50%, #6a1b9a 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    position: relative;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
  }}
  .cover::before {{
    content: '';
    position: absolute;
    top: -50%;
    right: -30%;
    width: 600px;
    height: 600px;
    background: rgba(255,255,255,0.05);
    border-radius: 50%;
  }}
  .cover::after {{
    content: '';
    position: absolute;
    bottom: -30%;
    left: -20%;
    width: 500px;
    height: 500px;
    background: rgba(255,255,255,0.03);
    border-radius: 50%;
  }}
  .cover-logo {{
    width: 160px;
    height: auto;
    border-radius: 20px;
    margin-bottom: 24px;
  }}
  .cover h1 {{
    font-size: 32pt;
    font-weight: 800;
    margin: 0 0 8px 0;
    letter-spacing: 1px;
  }}
  .cover h2 {{
    font-size: 16pt;
    font-weight: 400;
    margin: 0 0 24px 0;
    color: rgba(255,255,255,0.8);
  }}
  .cover-line {{
    width: 100px;
    height: 3px;
    background: #d4af37;
    margin-bottom: 24px;
    border-radius: 2px;
  }}
  .cover-sub {{
    font-size: 11pt;
    color: rgba(255,255,255,0.6);
    margin-top: 8px;
  }}
  .cover-info {{
    margin-top: 36px;
    display: flex;
    gap: 36px;
    font-size: 9pt;
    color: rgba(255,255,255,0.5);
  }}

  .section-page {{
    width: 297mm;
    height: 210mm;
    padding: 10mm 12mm 8mm 12mm;
    background: #ffffff;
    page-break-after: always;
    break-after: page;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }}

  .section-header {{
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
    padding-bottom: 5px;
    border-bottom: 2px solid #4a148c;
    flex-shrink: 0;
  }}
  .section-number {{
    width: 30px;
    height: 30px;
    background: linear-gradient(135deg, #1a237e, #6a1b9a);
    color: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 13pt;
    flex-shrink: 0;
  }}
  .section-title {{
    font-size: 14pt;
    font-weight: 700;
    color: #1a237e;
    margin: 0;
  }}

  .screenshot-container {{
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f8f8;
    border: 1px solid #ddd;
    border-radius: 6px;
    overflow: hidden;
    padding: 4px;
    min-height: 0;
  }}
  .screenshot-container img {{
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }}

  .page-footer {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 5px;
    padding-top: 3px;
    border-top: 1px solid #e0e0e0;
    font-size: 7pt;
    color: #aaa;
    flex-shrink: 0;
  }}
</style>
</head>
<body>

<div class="cover">
  <img src="data:image/png;base64,{logo_b64}" alt="Hominis" class="cover-logo" />
  <h1>Pantallas del Sistema</h1>
  <div class="cover-line"></div>
  <h2>Landing Page — Agustina C. Candia</h2>
  <p class="cover-sub">Asesora Comercial Hominis</p>
  <div class="cover-info">
    <span>&#9742; 11-6555-5534</span>
    <span>&#9993; acandia@mphominis.com.ar</span>
    <span>@hominisok</span>
  </div>
</div>

{sections_html}

</body>
</html>"""

    html_path = "/home/z/my-project/pdf-screens-v2.html"
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        pg = browser.new_page()
        pg.goto(f"file://{html_path}", wait_until="networkidle", timeout=60000)
        pg.wait_for_timeout(1000)

        pdf_path = "/home/z/my-project/public/pantallas-sistema.pdf"
        pg.pdf(
            path=pdf_path,
            width="297mm",
            height="210mm",
            print_background=True,
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
        )
        browser.close()

    size = os.path.getsize(pdf_path)
    print(f"\n✅ PDF generated: {pdf_path}")
    print(f"   Size: {size / 1024 / 1024:.1f} MB")

if __name__ == "__main__":
    main()
