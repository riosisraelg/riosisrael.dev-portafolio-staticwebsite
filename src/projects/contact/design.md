# Welcome Party & Contact Hub Design System

A minimalist, modern, mobile-first design system inspired by Apple iOS and modern web glassmorphism, supporting automatic system Dark/Light mode.

---

## 1. Typography & Hierarchy
- **Font Family:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Icon Font:** `'Material Symbols Outlined'`
- **Headings:**
  - Hero Title: `font-size: clamp(2rem, 5vw, 2.75rem); font-weight: 800; letter-spacing: -0.03em;`
  - Modal Title: `font-size: 1.1rem; font-weight: 700; letter-spacing: -0.02em;`
  - Labels & Badges: `font-size: 0.6rem - 0.75rem; font-weight: 600; letter-spacing: 0.12em - 0.18em; text-transform: uppercase;`
  - Body / Field Values: `font-size: 0.9rem - 1rem; font-weight: 600;`

---

## 2. Color Palette & Dark/Light System Tokens

### Light Theme (Default)
```css
:root {
    --bg: #ffffff;
    --fg: #000000;
    --gray-50: #fafafa;
    --gray-100: #f5f5f5;
    --gray-200: #e5e5e5;
    --gray-300: #d4d4d4;
    --gray-400: #a3a3a3;
    --gray-500: #737373;
    --gray-600: #525252;
    --gray-700: #404040;
    --gray-800: #262626;
    --gray-900: #171717;
    --border: #e5e5e5;
    --surface: #fafafa;
    --success: #16a34a;
    --transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Dark Theme (System Preference)
```css
@media (prefers-color-scheme: dark) {
    :root {
        --bg: #0a0a0a;
        --fg: #fafafa;
        --gray-50: #171717;
        --gray-100: #1c1c1c;
        --gray-200: #262626;
        --gray-300: #404040;
        --gray-400: #737373;
        --gray-500: #a3a3a3;
        --gray-600: #d4d4d4;
        --gray-700: #e5e5e5;
        --gray-800: #f5f5f5;
        --gray-900: #fafafa;
        --border: #262626;
        --surface: #141414;
        --success: #22c55e;
    }
}
```

---

## 3. Glassmorphism & Liquid Surfaces
- **Ambient Background Orbs:** Floating blurred gradient spheres with blend modes (`filter: blur(80px)`).
- **Hero Card:**
  - Light: `background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.6); box-shadow: 0 24px 64px rgba(0, 0, 0, 0.08);`
  - Dark: `background: rgba(20, 20, 20, 0.6); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);`
- **Liquid Physics & Drag:** Elastic deformation based on cursor/touch velocity (`scale`, `skew`, spring transition on release).

---

## 4. Modal Modules
- **Overlay:** `position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(8px);`
- **Modal Sheet Container:**
  - Bottom sheet on mobile (`border-radius: 24px 24px 0 0; max-height: 85vh; transform: translateY(100%) -> translateY(0)`).
  - Centered dialog on desktop (`border-radius: 24px; max-width: 440px;`).
- **Interactive Bank Row:**
  - Tap row to copy target value.
  - Value transitions to `¡COPIADO!` in green (`--success`) with haptic pulse (`navigator.vibrate(50)`).
- **Fare / Concept Editor:**
  - Real-time uppercase concept synthesis (`PREFIX [COUNT] FIRSTNAME LASTNAME`).
  - Dynamic 40-character remaining counter with warning state.

---

## 5. Contact & Share Specifications
- **vCard (.vcf 3.0):** Formatted with UTF-8 character encoding, universal support across Apple iOS Contacts, Google Contacts, and Windows People / Outlook.
- **Web Share API:** Direct trigger of native OS share sheet (`navigator.share`) with automatic clipboard fallback.
- **Deep Linking:** Hash-based state management (`#transferencia`, `#codi`, `#dimo`, `#contacto`, `#share`).
