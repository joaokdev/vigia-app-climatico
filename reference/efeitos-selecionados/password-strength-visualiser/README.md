# Vault

An animated password strength visualizer that turns entropy into a mechanical security progression: open door → bent paperclip → padlock → deadbolt → bank vault. Pure HTML, CSS, and vanilla JavaScript, plus [GSAP](https://greensock.com/gsap/) for a single scrubbable master timeline. No build step.

Thanks for downloading — hope this lands well in your project.

## What's inside

| Feature | What happens | Needs JS? |
|---------|--------------|-----------|
| Entropy scoring | Approximate bits from `length × log2(pool)` by character categories | Yes — `js/entropy.js` |
| Tiered feedback | Five strength states with colour, title, and crack-time copy | Yes — `js/tiers.js` |
| Crack-time estimate | Brute-force seconds from `2^bits / 1e9` guesses per second | Yes — `js/crackTime.js` |
| SVG lock scene | Custom vector progression — not icon swaps | Yes — GSAP timeline |
| Master timeline | One GSAP timeline scrubbed with `tweenTo` as strength rises or falls | Yes — `js/visualizer.js` |
| Suggest strong | Generates a mixed passphrase and drives the visualizer to vault | Yes — `js/suggest.js` |
| Visibility toggle | Eye control switches password / plain text | Yes — input wiring |
| Reduced motion | Seeks timeline labels instantly when preferred | Yes — media query gate |

**External dependency:** GSAP 3 (CDN in `index.html`). Everything else is self-contained under `js/`.

## Quick preview

Open `index.html` in your browser. Type in the password field, try **Suggest strong**, and watch the lock assemble. That's it — no install required (GSAP loads from the CDN).

## Use in your own project

1. **Copy the Vault markup** from `index.html`: the `.app` / `.password-section` block including `#vault-svg` and the strength card. Copy `.page` / `.page-glow` only if you want the demo page atmosphere.
2. **Keep required IDs or update the JS.** The scripts read `#password-input`, `#password-field`, `#suggest-btn`, `#visibility-btn`, `#strength-card`, `#vault-svg`, and the feedback elements — keep those IDs or update the selectors in `script.js` / `js/visualizer.js`.
3. **Copy the CSS sections into your own stylesheet.** Start with the `:root` tokens you want to keep, then password field, strength card, and SVG layout rules. Skip `.page` / `.page-glow` if your app already has page styling.
4. **Add GSAP, then the modular scripts in order.** Load GSAP first, then `js/entropy.js`, `js/crackTime.js`, `js/tiers.js`, `js/suggest.js`, `js/visualizer.js`, and finally `script.js` (the app shell).
5. **Wire your own form if needed.** `script.js` evaluates on `input` and drives `Vault.visualizer`. Call `Vault.visualizer.createVisualizer(svgEl)` and `visualizer.setTier(n)` if you drive strength from elsewhere.
6. **Adjust copy and colours** — edit tier titles / colours in `js/tiers.js`, and CSS custom properties in `:root` (`--purple`, `--surface`, `--content-w`, etc.) to match your brand.

If you want to run the whole demo unchanged, you can also copy `index.html`, `style.css`, `script.js`, and the `js/` folder together and link them as-is. For real projects, embedding the password field, SVG scene, CSS blocks, and modules into your existing form flow is usually cleaner.

## File structure

```
index.html        Password UI, strength panel, and SVG lock scene
style.css         Dark layout, input glow, strength card, and reduced motion
script.js         App shell — input wiring, feedback, visualizer control
js/entropy.js     Pool detection and entropy calculation
js/crackTime.js   Combination → readable crack-time strings
js/tiers.js       Tier thresholds, titles, and colours
js/suggest.js     Strong passphrase generator
js/visualizer.js  SVG refs + GSAP master timeline scrubbing
LICENSE.txt       Usage terms
```

## Customisation tips

- Tier thresholds and copy: edit `js/tiers.js` (`minBits` / `maxBits`, titles, colours).
- Guess rate: change `GUESSES_PER_SECOND` in `js/crackTime.js`.
- Pool sizes: adjust `POOL` in `js/entropy.js`.
- Timeline feel: durations and eases live in `js/visualizer.js` (`tweenTo` options and label positions).
- Suggest words: extend the `WORDS` list in `js/suggest.js`.
- Accent / surfaces: `--purple`, `--surface`, `--content-w` in `:root` in `style.css`.
- Fonts are loaded from Google Fonts (`Outfit`). Swap the `<link>` in `index.html` or update `--font-sans` in `style.css`.
- Host GSAP locally if you need offline use — keep load order the same.

## Support

Questions or issues? Reach out via Payhip or email **contact@enquiryconnect.com**.
