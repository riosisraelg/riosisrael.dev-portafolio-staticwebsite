#!/usr/bin/env python3
"""
Generador de Letrero Imprimible en PDF e Imagen PNG para Mostrador de Panadería.
Diseño enfocado 100% en el código QR para escaneo rápido en mostrador.
Salida en: /Users/riosisraelg/Downloads/
"""

import os
import zlib
import urllib.request
import urllib.parse
import subprocess

DOWNLOADS_DIR = "/Users/riosisraelg/Downloads"
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

PDF_OUT = os.path.join(DOWNLOADS_DIR, "letrero-mostrador-panaderia.pdf")
PNG_OUT = os.path.join(DOWNLOADS_DIR, "letrero-mostrador-panaderia.png")
SVG_OUT = os.path.join(DOWNLOADS_DIR, "letrero-mostrador-panaderia.svg")

# 1. Download crisp high-resolution QR
target_url = "https://riosisraelg.dev/projects/panaderia/"
qr_jpg_path = os.path.join(PROJECT_DIR, "qr_panaderia.jpg")
qr_png_path = os.path.join(PROJECT_DIR, "qr_panaderia.png")

qr_api_jpg = f"https://api.qrserver.com/v1/create-qr-code/?size=800x800&data={urllib.parse.quote(target_url)}&margin=10&format=jpg&color=17-24-39"
qr_api_png = f"https://api.qrserver.com/v1/create-qr-code/?size=800x800&data={urllib.parse.quote(target_url)}&margin=10&format=png&color=17-24-39"

urllib.request.urlretrieve(qr_api_jpg, qr_jpg_path)
urllib.request.urlretrieve(qr_api_png, qr_png_path)

with open(qr_jpg_path, 'rb') as f:
    jpg_bytes = f.read()

# ══════════════════════════════════════════════════════════
# 2. BUILD PDF (FOCUSED ON LARGE QR CODE)
# ══════════════════════════════════════════════════════════
def build_pdf():
    pw, ph = 380, 550
    
    stream_parts = []
    
    # Page background (Pure Clean White / Light Warm Ivory)
    stream_parts.append(f"q\n0.99 0.985 0.97 rg\n0 0 {pw} {ph} re f\nQ\n")
    
    # Main Card Box
    margin = 16
    cw = pw - 2*margin
    ch = ph - 2*margin
    stream_parts.append(f"q\n1 1 1 rg\n{margin} {margin} {cw} {ch} re f\nQ\n")
    
    # Outer Golden Border #d99b26
    stream_parts.append(f"q\n0.85 0.61 0.15 RG 2.5 w\n{margin} {margin} {cw} {ch} re S\nQ\n")
    
    # Inner Dashed Border
    im = margin + 6
    iw = cw - 12
    ih = ch - 12
    stream_parts.append(f"q\n0.85 0.61 0.15 RG 0.75 w [4 4] 0 d\n{im} {im} {iw} {ih} re S\nQ\n")
    
    # Header: "Panaderia"
    stream_parts.append("BT\n/F2 30 Tf\n0.10 0.08 0.05 rg\n")
    stream_parts.append(f"{pw/2 - 70:.1f} {ph - 58:.1f} Td\n(Panaderia) Tj\nET\n")
    
    # Primary Action Call: "ESCANEA PARA PAGAR"
    stream_parts.append("BT\n/F1 13 Tf\n0.58 0.36 0.09 rg\n")
    stream_parts.append(f"{pw/2 - 82:.1f} {ph - 80:.1f} Td\n(ESCANEA PARA PAGAR) Tj\nET\n")
    
    # LARGE QR Frame Box #111827 (Super focused!)
    qr_box_size = 260
    qr_bx = (pw - qr_box_size) / 2
    qr_by = ph - 360
    stream_parts.append(f"q\n0.07 0.09 0.15 RG 2.5 w\n{qr_bx} {qr_by} {qr_box_size} {qr_box_size} re S\nQ\n")
    
    # Large QR Image inside Box
    qr_img_size = 244
    qr_ix = (pw - qr_img_size) / 2
    qr_iy = qr_by + 8
    stream_parts.append(f"q\n{qr_img_size} 0 0 {qr_img_size} {qr_ix} {qr_iy} cm\n/Im1 Do\nQ\n")
    
    # Instruction below QR
    stream_parts.append("BT\n/F1 11 Tf\n0.07 0.09 0.15 rg\n")
    stream_parts.append(f"{pw/2 - 110:.1f} {qr_by - 24:.1f} Td\n(Abre los datos y copia la CLABE en tu celular) Tj\nET\n")
    
    # Minimalist Clean Footer Box with Bank Support Details
    ft_y = margin + 14
    ft_h = 70
    stream_parts.append(f"q\n0.97 0.96 0.94 rg\n{margin + 12} {ft_y} {cw - 24} {ft_h} re f\nQ\n")
    stream_parts.append(f"q\n0.88 0.82 0.73 RG 1 w\n{margin + 12} {ft_y} {cw - 24} {ft_h} re S\nQ\n")
    
    # Footer Lines
    stream_parts.append("BT\n/F1 9 Tf\n0.47 0.13 1.00 rg\n")
    stream_parts.append(f"{pw/2 - 76:.1f} {ft_y + 48:.1f} Td\n(Spin by OXXO  |  Guillermo Bala) Tj\nET\n")
    
    stream_parts.append("BT\n/F3 12 Tf\n0.00 0.00 0.00 rg\n")
    stream_parts.append(f"{pw/2 - 105:.1f} {ft_y + 28:.1f} Td\n(CLABE: 7289 6900 0086 7660 79) Tj\nET\n")
    
    stream_parts.append("BT\n/F1 8.5 Tf\n0.35 0.38 0.42 rg\n")
    stream_parts.append(f"{pw/2 - 82:.1f} {ft_y + 10:.1f} Td\n(Celular Spin: 442 545 1092) Tj\nET\n")
    
    content_stream = "".join(stream_parts).encode('latin1')
    deflated_content = zlib.compress(content_stream)
    
    objects = []
    def add_obj(body):
        objects.append(body)
        return len(objects)
    
    add_obj(b"<< /Type /Catalog /Pages 2 0 R >>")
    add_obj(b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
    add_obj(f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {pw} {ph}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> /XObject << /Im1 8 0 R >> >> >>".encode('ascii'))
    add_obj(f"<< /Length {len(deflated_content)} /Filter /FlateDecode >>\nstream\n".encode('ascii') + deflated_content + b"\nendstream")
    add_obj(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
    add_obj(b"<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold >>")
    add_obj(b"<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>")
    add_obj(f"<< /Type /XObject /Subtype /Image /Width 800 /Height 800 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length {len(jpg_bytes)} >>\nstream\n".encode('ascii') + jpg_bytes + b"\nendstream")
    
    out = [b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"]
    offsets = []
    pos = len(out[0])
    
    for i, obj in enumerate(objects):
        offsets.append(pos)
        header = f"{i+1} 0 obj\n".encode('ascii')
        footer = b"\nendobj\n"
        out.extend([header, obj, footer])
        pos += len(header) + len(obj) + len(footer)
        
    xref_pos = pos
    out.append(f"xref\n0 {len(objects)+1}\n0000000000 65535 f \n".encode('ascii'))
    for off in offsets:
        out.append(f"{off:010d} 00000 n \n".encode('ascii'))
        
    out.append(f"trailer\n<< /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode('ascii'))
    
    with open(PDF_OUT, 'wb') as f:
        f.write(b"".join(out))
    print(f"✓ PDF enfocado en QR guardado en: {PDF_OUT}")

# ══════════════════════════════════════════════════════════
# 3. BUILD HIGH-RES SVG & PNG (QR FOCUSED)
# ══════════════════════════════════════════════════════════
def build_svg_and_png():
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 620" width="840" height="1240" style="font-family:'Plus Jakarta Sans',-apple-system,sans-serif;">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&amp;family=Playfair+Display:wght@700;800&amp;family=JetBrains+Mono:wght@700&amp;display=swap');
      .title {{ font-family: 'Playfair Display', Georgia, serif; font-size: 34px; font-weight: 700; fill: #1a140e; }}
      .sub {{ font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 800; fill: #935d17; letter-spacing: 2px; text-transform: uppercase; }}
      .inst {{ font-size: 12.5px; font-weight: 700; fill: #111827; }}
      .foot-inst {{ font-size: 11px; font-weight: 800; fill: #7920ff; }}
      .foot-clabe {{ font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; fill: #000000; letter-spacing: 0.5px; }}
      .foot-sub {{ font-size: 10.5px; font-weight: 600; fill: #6b7280; }}
    </style>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="#fbf8f2"/>

  <!-- Main Card -->
  <rect x="18" y="18" width="384" height="584" rx="28" fill="#ffffff" stroke="#e5dccb" stroke-width="2"/>
  <rect x="26" y="26" width="368" height="568" rx="20" fill="none" stroke="#d99b26" stroke-width="1.2" stroke-dasharray="5 5" opacity="0.6"/>

  <!-- Header -->
  <text x="210" y="66" text-anchor="middle" class="title">Panadería</text>
  <text x="210" y="90" text-anchor="middle" class="sub">ESCANEA PARA PAGAR</text>

  <!-- HUGE QR Frame -->
  <rect x="65" y="112" width="290" height="290" rx="20" fill="#ffffff" stroke="#111827" stroke-width="2.5"/>
  
  <!-- Embedded High-Res QR Code -->
  <image href="{qr_png_path}" x="77" y="124" width="266" height="266"/>

  <!-- Scan Instruction -->
  <text x="210" y="428" text-anchor="middle" class="inst">📱 Abre los datos y copia la CLABE en tu celular</text>

  <!-- Minimalist Clean Footer Box -->
  <rect x="36" y="450" width="348" height="92" rx="14" fill="#fdfbf7" stroke="#ebdcc5" stroke-width="1.2"/>
  
  <text x="210" y="476" text-anchor="middle" class="foot-inst">Spin by OXXO  •  Guillermo Bala</text>
  <text x="210" y="502" text-anchor="middle" class="foot-clabe">CLABE: 7289 6900 0086 7660 79</text>
  <text x="210" y="524" text-anchor="middle" class="foot-sub">Celular Spin: 442 545 1092</text>
</svg>'''

    with open(SVG_OUT, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print(f"✓ SVG enfocado en QR guardado en: {SVG_OUT}")

    # Render high-res PNG via macOS QuickLook
    try:
        cmd = f"qlmanage -t -s 1400 -o /Users/riosisraelg/Downloads/ {SVG_OUT} && mv /Users/riosisraelg/Downloads/letrero-mostrador-panaderia.svg.png {PNG_OUT}"
        subprocess.run(cmd, shell=True, check=True)
        print(f"✓ PNG enfocado en QR generado en: {PNG_OUT}")
    except Exception as e:
        print(f"Notice: {e}")

if __name__ == "__main__":
    build_pdf()
    build_svg_and_png()
