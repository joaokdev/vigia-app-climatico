# Page Transitions

Six cinematic page transitions — mystic portal, glob wipe, 3D cube, glitch swap, liquid flood, and flat flip. Pure HTML, CSS, and vanilla JavaScript. No build step, no dependencies.

Thanks for downloading — hope these land well in your project.

## Two versions included

This pack ships with **two entry points**:

- **Preview demo** (`index.html`) — compact showcase window with a code snippet panel. Try all six effects side by side before you commit to one.
- **Full-screen** (`full-page/index.html`) — real full-viewport layout, ready to copy into your own site. No demo chrome — just your pages and a floating effect picker.

Both versions share the same `style.css` and `script.js`. The full-screen folder only adds layout overrides.

**Building a real project?** Start from `full-page/` — that's the version meant to drop into your app.

## What's inside

| Transition | Label | Needs JS? |
|------------|-------|-----------|
| Mystic Portal | Circle portal with spark ring and camera pass-through | Yes — keyframes + layer swap |
| Glob Wipe | Organic colour blob sweeps across the screen | No — CSS animation |
| 3D Cube | True perspective cube rotation between pages | Partial — depth calc in JS |
| Glitch Swap | RGB split, scanlines, and horizontal tear bars | No — CSS animation |
| Flood | Canvas liquid fill rises and drains | Yes — canvas animation |
| Flip | Flat back-to-back page turn | Partial — class toggle in JS |

## Quick preview

1. Open **`index.html`** to browse all six transitions in the compact demo.
2. Open **`full-page/index.html`** to see them across the entire browser window.
3. Pick a transition, then click **Home** or **Gallery** to play it.

For integration into your own site, see **`full-page/README.md`**. That guide explains how to copy the page-stage markup, transition layers, CSS blocks, and JS hooks into your existing layout instead of shipping the compact preview demo.

## File structure

```
index.html              Preview demo (compact window + code snippet)
full-page/
  index.html            Full-screen version — use this in real projects
  style.css             Full-viewport layout overrides (imports ../style.css)
  README.md             Full-screen setup notes
style.css               All transition effect styles
script.js               Navigation, timing, portal keyframes, and flood canvas
```

## Customisation tips

- Transition speed lives in the `TIMING` object in `script.js`.
- Portal timing lives in `PORTAL_PHASES` — keyframes are built from those values automatically.
- On full-screen, the mystic portal stays compact (not viewport-sized) so the zoom stays smooth. Size is set in `setPortalSize()` when `.preview--full` is present.
- Cube depth is calculated from stage width so the 3D spin doesn't zoom in awkwardly.
- Each effect is isolated. Copy only the CSS block you need.

## Support

Questions or issues? Reach out via Payhip or email **contact@enquiryconnect.com**.
