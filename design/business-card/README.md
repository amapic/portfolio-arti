# Business card (recto/verso) – Inspired template

Files:
- `recto.svg` – front side. Minimal logo, name, role.
- `verso.svg` – back side. Left wedge (for marble), left texts, QR placeholder on the right.

Sizes:
- Canvas: 91 × 60 mm (includes 3 mm bleed on all sides)
- Trim: 85 × 54 mm (finished card)
- Safe zone: 4 mm inside the trim (optional guides are present, hidden by default)

## Edit texts
Open the SVGs in your editor (Inkscape, Illustrator, Affinity Designer, Figma).
- Replace `NOM PRÉNOM`, `Votre métier`, the handle, email, site and phone.
- Fonts used in CSS are safe fallbacks; your tool can swap to your brand fonts. If you want, we can outline the texts for print later.

## Colors
- Background: `#c9d7d7`
- Text (ink): `#2f3a40`
- Logo stroke (front): `#a6bcbc`
You can change these in the `<style>` block at the top of each SVG.

## Logo mark (recto)
Two overlapping circles sit at the top center. You can adjust radius/offset by changing the `transform` group or the `cx` values.

## Marble wedge (verso)
A clip path named `wedge-clip` defines the diagonal shape on the left.
- To use an image, un-comment the `<image>` element inside the clipped group and set `xlink:href` to your file (e.g., `marble.jpg`).
- Keep `preserveAspectRatio="xMidYMid slice"` so the image fills the wedge without distortion.
- Alternatively, keep it as a flat color (`#f6f6f6`).

## QR code (verso)
- Replace the placeholder rectangle with your QR image:
  ```svg
  <image xlink:href="qr.png" x="0" y="0" width="16" height="16"/>
  ```
  Place it inside the right-side group already positioned with margins.

## Crop marks and guides
- Crop marks are included around the bleed. Safe/trim guides exist but are hidden (`class="hide"`). Remove `hide` to preview on screen; re-hide them before export.

## Export for print
- Preferred: PDF/X-1a or PDF/X-4, 300 dpi rasterization, units in mm. Fonts embedded or texts outlined.
- In Inkscape: `File → Save a Copy… → PDF` (select PDF/A-1 or PDF/X-4), disable downsampling if possible.
- In Illustrator/Affinity: export PDF with bleed (3 mm) and crop marks enabled; vector content stays sharp.

---
If you want me to inject your real texts/colors and your QR code now, just send them. I can also deliver outlined-font PDFs ready for your printer.
