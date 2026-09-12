# Hover Buttons — Part 5

Six hover-driven button effects — water ripple, scratch card, grass, thermal, paper lantern, and DNA twist. Pure HTML, CSS, and vanilla JavaScript. No build step, no dependencies.

Thanks for downloading — hope these land well in your project.

## What's inside

| Button | Label | Needs JS? |
|--------|-------|-----------|
| Water Ripple | Ripple | Yes — wave simulation, cursor drags a wake across the surface |
| Scratch Card | Win! | Yes — foil scrubs away under the cursor, heals on leave |
| Grass | Grass | Yes — blades sway in the breeze, cursor parts them like a hand |
| Thermal | Heat | Yes — heat blooms through an infrared palette and cools off |
| Paper Lantern | Lantern | Yes — lantern paper glows and the inner light follows the cursor |
| DNA Twist | Helix | Yes — twin strands animate and open wider around the cursor |

## Quick preview

Open `index.html` in your browser. That's it — no install required.

## Use in your own project

1. **Pick the button effect you want.** Use `index.html` as a visual reference, then copy only that button's `<button>` markup and required child elements (`<canvas>`, `<span>`, etc.) into your own HTML. You usually do not need the full showcase `<article>` or code snippet.
2. **Copy the shared button CSS** into your own stylesheet: `:root` variables you want to keep, `.btn`, `.btn__text`, and `.btn:focus-visible`.
3. **Copy that effect's numbered CSS section** from `style.css` (search for `.btn-ripple`, `.btn-scratch`, and so on). Skip the ambient background, grid overlay, and showcase layout unless you want the demo page styling too.
4. **Add the matching JavaScript class.** All six effects use JS. Copy the class you need from `script.js`, the shared helpers at the top (`spring`, `createSurface`, `blit`, `trackPointer`), plus the init lines at the bottom that create it.
5. **Match selectors if you rename classes.** The CSS and JS look for the class names used in the demo, so update both places if you change them.
6. **Adjust labels and colours** — change button text, the scratch card prize inside `.btn-scratch__under`, and CSS custom properties (`--accent`, `--radius`, etc.) to match your brand.

If you want to run the whole showcase unchanged, you can also copy `index.html`, `style.css`, and `script.js` together and link them as-is. For real projects, copying the specific markup, CSS, and JS pieces you need is usually cleaner.

## File structure

```
index.html    Page markup and button showcase
style.css     Global styles + one section per button effect
script.js     Canvas and pointer interaction classes
```

## Customisation tips

- Button size is controlled by `--btn-width` and `--btn-height` in `:root`.
- Scratch card reveals the label inside `.btn-scratch__under` — change "Win!" to anything.
- Grass density comes from `count` in `GrassButton._build` — more blades, thicker field.
- The ambient background (gradients + grid) is optional — remove the `.ambient` and `.grid-overlay` divs if you don't need them.
- Each effect is isolated. You don't have to include all six.

## Support

Questions or issues? Reach out via Payhip or email **contact@enquiryconnect.com**.
