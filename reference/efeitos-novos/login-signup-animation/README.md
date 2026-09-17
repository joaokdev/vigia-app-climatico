# Split Panel Auth

Animated sign-in and register UI — a sliding gradient overlay reveals one form while the other fades out, with a light sweep on every switch. Pure HTML, CSS, and vanilla JavaScript. No build step, no dependencies.

Thanks for downloading — hope this lands well in your project.

## What's inside

| Feature | What happens | Needs JS? |
|---------|--------------|-----------|
| Panel switch | Gradient overlay slides; login and register cross-fade | Yes — toggles `.active` on the container |
| Light sweep | Horizontal shine races across during the transition | Yes — retriggers CSS animation |
| Field stagger | Register fields fade and rise in sequence | No — CSS only |
| Submit success | Primary button swaps label for a checkmark | Yes — demo handler |
| Ambient background | Floating orbs and film grain behind the card | No — CSS only |
| Responsive layout | Single-column stack below 760px | No — CSS only |

## Quick preview

Open `index.html` in your browser. Click **Create account** or **Sign in** on the gradient panel to switch between forms.

## Use in your own project

1. **Copy the auth component markup** from `index.html` into your own page: `.auth-container`, both `.form-panel` sections, and the `.overlay-panel` aside. Copy the ambient background only if you want the demo page atmosphere.
2. **Keep required IDs or update the JS.** The script reads the container, switch buttons, forms, and submit buttons by selector, so keep the demo IDs/classes or update the selectors in `script.js`.
3. **Copy the CSS sections into your own stylesheet.** Start with the `:root` custom properties you want to keep and the shared field/button rules. Then copy the panel, overlay, switch animation, form success, and responsive blocks.
4. **Add the JavaScript behaviour.** Copy the panel switch, light sweep, and form submit helpers from `script.js`. If you already have auth logic, keep the switch animation and replace only the demo submit handler.
5. **Wire up real auth** — form submit currently plays a success animation only. Replace `handleFormSubmit` with your own login/register logic and call `showButtonSuccess` when credentials validate.
6. **Adjust copy and colours** — change form labels, overlay text, and CSS custom properties in `:root` (`--c-violet`, `--c-pink`, `--c-blue`, etc.) to match your brand.

If you want to run the whole demo unchanged, you can also copy `index.html`, `style.css`, and `script.js` together and link them as-is. For real projects, merging the auth markup, CSS blocks, and JS handlers into your existing auth flow is usually cleaner.

## File structure

```
index.html    Auth markup — login form, register form, gradient overlay panel
style.css     Global styles + panel switch, fields, overlay, and responsive layout
script.js     Panel switch, light sweep trigger, and demo form handlers
```

## Customisation tips

- Container size is controlled by `--container-w` and `--container-h` in `:root`.
- Switch animation duration is `--dur-switch` (900ms) in CSS and `SWITCH_DURATION` at the top of `script.js` — keep them in sync.
- The ambient background (orbs + grain) is optional — remove the `.bg-ambient` div if you don't need it.
- Social sign-in buttons are visual placeholders. Hook them up in `script.js` or remove the `.social-row` block.
- Fonts are loaded from Google Fonts (`Outfit`). Swap the `<link>` in `index.html` or update `font-family` in `style.css`.

## Support

Questions or issues? Reach out via Payhip or email **contact@enquiryconnect.com**.
