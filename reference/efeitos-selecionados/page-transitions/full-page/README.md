# Full-Screen Version

The same six transitions as the root preview demo, stretched across the entire browser window. **This is the version to copy into your own project.**

Open `index.html` in this folder. Use **Home** / **Gallery** in the site nav to trigger transitions, and the floating pills at the bottom to switch effects.

## Preview demo vs full-screen

| | Root `index.html` | This folder |
|--|-------------------|-------------|
| Layout | Compact preview window with code snippet | Full viewport — no demo chrome |
| Best for | Trying all six effects before you pick one | Dropping into a real site |
| Stylesheet | `../style.css` directly | `style.css` (imports `../style.css` + layout overrides) |
| Script | `../script.js` | `../script.js` (shared) |

Both versions run the same transitions from one `script.js` file.

## How it works

- `style.css` imports `../style.css` and adds full-viewport layout overrides (`.preview--full`, scaled-up demo content, floating effect picker).
- `index.html` uses the same page markup pattern as the root demo — `.page` blocks inside `#stage`, shared FX layers, no preview frame.
- `../script.js` detects `.preview--full` and adjusts portal size, particle count, and image preloading for large screens.

The mystic portal is intentionally smaller than the viewport (capped around 380px) so the zoom-in stays smooth on large screens. Tweak this in `setPortalSize()` inside `../script.js`.

## Use in your own project

1. **Start from the full-screen markup, not the root preview.** Copy the `#stage` wrapper, each `.page` block, the shared FX layers, and the navigation buttons you want from `full-page/index.html` into your own layout.
2. **Copy the transition CSS into your own stylesheet.** Bring over the effect rules from the parent `style.css` and the full-screen overrides from `full-page/style.css`. If you use only one transition, copy that effect's CSS block plus the shared `.preview--full`, `.page`, and FX-layer rules it depends on.
3. **Add the JavaScript hooks you need.** Copy the `PAGES` object, navigation helpers, selected-effect state, timing constants, and the effect function(s) you plan to use from `../script.js`.
4. **Register your own pages** in the `PAGES` object. Each key must match the destination name you pass to `navigateTo()` or `runTransition()`, and each page element should have a matching `id` / `data-page` value.
5. **Replace the Wanderly demo content** with your own markup inside each `.page__inner` block. Transition FX layers sit outside the page content and do not need changing unless you want to redesign an effect.

If you want to run the full-screen demo unchanged first, copy `full-page/` together with the parent `style.css` and `script.js`. For production, merging the stage markup, CSS blocks, and JS helpers into your existing app is usually cleaner.

The root `index.html` is only the preview showcase — you don't need it in production.

## Trigger transitions from any button

Transitions are just a function call. Pick an effect, pick a destination page — wire that to whatever button, link, or menu item you like.

**Effect names** (use these exact strings):

- `circle-portal` — Mystic Portal
- `glob-wipe` — Glob Wipe
- `cube-3d` — 3D Cube
- `glitch-swap` — Glitch Swap
- `flood` — Flood
- `flip` — Flip

**Page names** must match the keys in the `PAGES` object in `script.js` (the demo uses `"home"` and `"gallery"`).

### One effect for the whole site

Set the default at the top of `script.js`, then call `navigateTo()` from any button:

```js
let selectedEffect = "glob-wipe";
```

```html
<button type="button" onclick="navigateTo('gallery')">Gallery</button>
<a href="#" onclick="navigateTo('home'); return false;">Home</a>
```

Or use the built-in `data-nav` attribute — the script picks these up automatically:

```html
<button type="button" class="site-nav__btn" data-nav="gallery">Gallery</button>
```

Any element with `data-nav` and class `site-nav__btn` will trigger a transition to that page using whatever effect is currently selected.

### A different effect per button

Call `runTransition()` directly with both the effect and the page:

```html
<button type="button" onclick="runTransition('cube-3d', 'gallery')">Cube to Gallery</button>
<button type="button" onclick="runTransition('flood', 'home')">Flood to Home</button>
```

No effect picker needed — each button carries its own transition.

### Optional: effect picker

The floating `.tx-btns` bar at the bottom of the demo is only there for previewing all six effects. It calls `selectEffect()` to change `selectedEffect` without navigating. Remove it when you ship, or keep it while you're deciding.


## Support

Questions or issues? Reach out via Payhip or email **contact@enquiryconnect.com**.
