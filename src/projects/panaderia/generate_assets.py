#!/usr/bin/env python3
import urllib.request
import os

target_dir = os.path.dirname(os.path.abspath(__file__))
qr_url = "https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=https%3A%2F%2Friosisraelg.dev%2Fprojects%2Fpanaderia%2F&margin=10&color=17-24-39"
svg_url = "https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=https%3A%2F%2Friosisraelg.dev%2Fprojects%2Fpanaderia%2F&margin=10&format=svg&color=17-24-39"

try:
    png_path = os.path.join(target_dir, "qr_panaderia.png")
    svg_path = os.path.join(target_dir, "qr_panaderia.svg")
    
    urllib.request.urlretrieve(qr_url, png_path)
    urllib.request.urlretrieve(svg_url, svg_path)
    print(f"Generated QR PNG: {png_path}")
    print(f"Generated QR SVG: {svg_path}")
except Exception as e:
    print(f"Notice: {e}")
