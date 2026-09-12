# Day Night Window Toggle

A window-as-toggle for light and dark appearance — sun sets, moon rises, clouds drift, birds fly by day, and stars twinkle with occasional shooting stars at night. Pure HTML, CSS, and vanilla JavaScript. No build step, no dependencies.

Thanks for downloading — hope this lands well in your project.

## What's inside

| Feature | What happens | Needs JS? |
|---------|--------------|-----------|
| Window toggle | Click / tap / Space / Enter switches day ↔ night | Yes — class + ARIA update |
| Scene transition | Sky, sun, moon, glass, and page theme cross-fade | No — CSS on `.is-night` |
| Star field | Stars generate and twinkle at night | Yes — star builder |
| Bird flocks | Occasional flocks cross the daytime sky | Yes — timed spawn |
| Shooting stars | Occasional streaks at night | Yes — timed spawn |
| Proximity wind | Clouds / twinkles speed up near the pointer | Yes — playbackRate boost |
| Preference memory | Saves day / night in `localStorage` | Yes — storage read/write |
| Reduced motion | Ambient loops pause when preferred | Yes — media query gate |

## Quick preview

Open `index.html` in your browser. Tap the window (or press Space / Enter while focused) to switch between light and dark. That's it — no install required.

## Use in your own project

1. **Copy the widget markup** from `index.html`: `.appearance-widget` with `.window-toggle`, sky layers, sun / moon, clouds, and the bird / star / shooting-star mounts. Copy `.page-backdrop` only if you want the demo page atmosphere.
2. **Keep required IDs or update the JS.** The script reads `#windowToggle`, `#starsLayer`, `#birdsLayer`, `#shootingStarsLayer`, and the mode status elements — keep those IDs or update the selectors in `script.js`.
3. **Copy the CSS sections into your own stylesheet.** Start with the `:root` tokens you want to keep, then the window toggle, sky, celestial, clouds, birds, stars, shooting stars, and glass blocks. Skip `.page-backdrop` and showcase chrome if your app already has page styling.
4. **Add the JavaScript behaviour.** Copy `script.js` as-is, or keep `CONFIG` / `MODE_COPY` and the toggle helpers. Hook `setNightMode` into your own theme system if you already manage light / dark elsewhere.
5. **Wire real theme application** — the demo toggles `body.is-night` and a `theme-color` meta tag. Mirror that onto your app shell, or replace with your design-token switch.
6. **Adjust copy and colours** — change footer labels in `MODE_COPY`, and CSS custom properties (`--day-sky-*`, `--night-sky-*`, `--frame-*`, etc.) to match your brand.

If you want to run the whole demo unchanged, you can also copy `index.html`, `style.css`, and `script.js` together and link them as-is. For real projects, embedding the window control and its CSS / JS into your settings or appearance UI is usually cleaner.

## File structure

```
index.html    Appearance widget — window toggle and status footer
style.css     Global styles + sky, celestials, clouds, glass, and page theme
script.js     Toggle state, stars, flocks, shooting stars, and preference
LICENSE.txt   Usage terms
```

## Customisation tips

- Window size is `--window-width` / `--window-height` in `:root`.
- Scene timing is `--transition-scene` (1.15s) — keep related CSS transitions in sync.
- Star density and flock / shooting-star cadence live in `CONFIG` at the top of `script.js`.
- Preference key is `CONFIG.storageKey` — change it if you ship multiple themes on one origin.
- The ambient page backdrop (washes, glows, grain) is optional — remove `.page-backdrop` if you don't need it.
- Birds and shooting stars respect `prefers-reduced-motion` and will not schedule when it matches.

## Support

Questions or issues? Reach out via Payhip or email **contact@enquiryconnect.com**.
