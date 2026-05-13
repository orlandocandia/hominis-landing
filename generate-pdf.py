#!/usr/bin/env python3
"""Generate a professional PDF with all landing page section screenshots."""
import subprocess, sys, os

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

try:
    import pypdf
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
    import pypdf

SCREENSHOTS_DIR = "/home/z/my-project/screenshots"
OUTPUT_DIR = "/home/z/my-project"
LOGO_PATH = "/home/z/my-project/public/logo_hominis.png"

SECTIONS = [
    ("01_hero.png", "Inicio — Hero", "Sección principal de bienvenida"),
    ("02_sobre_mi.png", "Sobre Mí", "Presentación y trayectoria profesional"),
    ("03_planes.png", "Planes — Vita Más / Aqua Más", "Comparativa de planes de salud"),
    ("04_promociones.png", "Promociones", "Promo 1 Año — Beneficios para nuevos socios"),
    ("05_servicios.png", "Servicios Digitales", "Médico Virtual, Farmacia Virtual, App Hominis"),
    ("06_contacto.png", "Contacto", "Formulario y canales de comunicación"),
    ("00_full_page.png", "Vista Completa", "Página completa sin interrupciones"),
]

def img_to_base64(path):
    import base64
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

def create_section_html(img_path, num, title, subtitle, total_pages):
    b64 = img_to_base64(img_path)
    return f"""
    <div class="section-page">
      <div class="section-header">
        <div class="section-number">{num}</div>
        <h2 class="section-title">{title}</h2>
        <span class="section-subtitle">{subtitle}</span>
      </div>
      <div class="screenshot-container">
        <img src="data:image/png;base64,{b64}" alt="{title}" />
      </div>
      <div class="page-footer">
        <span>Hominis — Agustina C. Candia</span>
        <span>Pág. {num} de {total_pages}</span>
      </div>
    </div>
    """

def main():
    # Get image dimensions to determine best orientation
    img_info = {}
    for fname, _, _ in SECTIONS:
        path = os.path.join(SCREENSHOTS_DIR, fname)
        if os.path.exists(path):
            im = Image.open(path)
            img_info[fname] = im.size  # (width, height)
            im.close()

    logo_b64 = img_to_base64(LOGO_PATH) if os.path.exists(LOGO_PATH) else ""

    total_content_pages = len(SECTIONS)
    total_pages = total_content_pages + 1  # +1 for cover

    # Build HTML
    sections_html = ""
    for i, (fname, title, subtitle) in enumerate(SECTIONS):
        path = os.path.join(SCREENSHOTS_DIR, fname)
        if os.path.exists(path):
            page_num = i + 1
            sections_html += create_section_html(path, page_num, title, subtitle, total_content_pages)

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
    padding: 12mm 14mm 10mm 14mm;
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
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 2px solid #4a148c;
    flex-shrink: 0;
  }}
  .section-number {{
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #1a237e, #6a1b9a);
    color: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 14pt;
    flex-shrink: 0;
  }}
  .section-title {{
    font-size: 14pt;
    font-weight: 700;
    color: #1a237e;
    margin: 0;
  }}
  .section-subtitle {{
    font-size: 8pt;
    color: #888;
    margin-left: auto;
  }}

  .screenshot-container {{
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    overflow: hidden;
    padding: 6px;
    min-height: 0;
  }}
  .screenshot-container img {{
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 3px;
  }}

  .page-footer {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 6px;
    padding-top: 4px;
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

    html_path = os.path.join(OUTPUT_DIR, "pdf-screens-final.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"HTML written to {html_path}")

    # Generate PDF with Playwright
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(f"file://{html_path}", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(1000)

        pdf_path = os.path.join(OUTPUT_DIR, "pantallas-sistema.pdf")
        page.pdf(
            path=pdf_path,
            width="297mm",
            height="210mm",
            print_background=True,
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
        )
        print(f"\n✅ PDF generated: {pdf_path}")
        browser.close()

    # Check file size
    size = os.path.getsize(pdf_path)
    print(f"   Size: {size / 1024 / 1024:.1f} MB")

if __name__ == "__main__":
    main()
