#!/usr/bin/env python3
"""Capture full-page and per-section screenshots of the landing page."""
import subprocess, sys, os, json

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "playwright"])
    subprocess.check_call([sys.executable, "-m", "playwright", "install", "chromium"])
    from playwright.sync_api import sync_playwright

OUTPUT_DIR = "/home/z/my-project/screenshots"
os.makedirs(OUTPUT_DIR, exist_ok=True)

SECTIONS = [
    ("inicio", "01_hero"),
    ("sobre-mi", "02_sobre_mi"),
    ("planes", "03_planes"),
    ("promociones", "04_promociones"),
    ("servicios", "05_servicios"),
    ("contacto", "06_contacto"),
]

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        
        page.goto("http://localhost:3000", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)  # Let animations settle
        
        # Full page screenshot
        full_path = os.path.join(OUTPUT_DIR, "00_full_page.png")
        page.screenshot(path=full_path, full_page=True, animations="disabled")
        print(f"✓ Full page: {full_path}")
        
        # Per-section screenshots
        for section_id, file_name in SECTIONS:
            el = page.locator(f"#{section_id}")
            if el.count() > 0:
                path = os.path.join(OUTPUT_DIR, f"{file_name}.png")
                el.screenshot(path=path, animations="disabled")
                print(f"✓ Section #{section_id}: {path}")
            else:
                print(f"✗ Section #{section_id} not found")
        
        browser.close()
        print("\nAll screenshots captured!")

if __name__ == "__main__":
    main()
