# Loading Screens

Five loading animations — gym bro reps, burger stack, coffee brew, frog hop, and candy unwrap. Pure HTML, CSS, and vanilla JavaScript. No build step, no dependencies.

Thanks for downloading — hope these land well in your project.

## What's inside

| Loader | Button | Needs JS? |
|--------|--------|-----------|
| Gym Bro | Lift Load | Yes — rep sequencing + progress bar |
| Burger Stack | Stack Load | Yes — trigger + percent milestones |
| Coffee Brew | Brew Load | Yes — trigger + fill counter sync |
| Frog Hop | Hop Load | Yes — trigger + percent milestones |
| Candy Unwrap | Unwrap Load | Yes — trigger + percent milestones |

The burger, coffee, frog, and candy animations are CSS-driven. JavaScript handles the load button, live percentage updates, done state, and auto-replay reset. Gym Bro additionally sequences five barbell reps in sync with the progress bar.

## Quick preview

Open `index.html` in your browser. Click any load button to play that loader. Each row auto-resets after a short cooldown so you can replay it.

## Use in your own project

1. **Pick the loader you want.** Use `index.html` as a visual reference, then copy the loader markup into your own loading area. You usually want the `.loader-card`, loader-specific markup, button, and status text — not the code snippet or full showcase row unless you are recreating the demo.
2. **Copy the shared loader CSS** into your own stylesheet: `:root` variables you want to keep, `.loader-card`, `.loader-stage`, `.loader-controls`, `.load-btn`, and `.loader-status`.
3. **Copy that loader's numbered CSS section** from `style.css` (search for `.gymbro-loader`, `.burger-loader`, and so on). Skip the ambient background, grid overlay, and showcase layout unless you want the demo page styling too.
4. **Add the matching JavaScript.** The init block at the bottom of `script.js` attaches to every `.loader-row`. For one loader, copy the relevant play/reset helpers for that `data-loader` type plus the click handler that starts it.
5. **Keep the required attributes.** `data-loader`, `data-duration`, `data-default`, and `data-done` drive the timing and status text. If you rename classes or attributes, update the JS selectors to match.
6. **Adjust timing and labels** — change `data-duration`, status text, and constants such as `GYM_REPS`, `GYM_REP_MS`, and `REPLAY_DELAY` to suit your app.

If you want to run the whole showcase unchanged, you can also copy `index.html`, `style.css`, and `script.js` together and link them as-is. For real projects, copying the specific loader markup, CSS, and JS pieces you need is usually cleaner.

## File structure

```
index.html    Page markup and loader showcase
style.css     Global styles + one section per loader effect
script.js     Load triggers, progress sync, and replay resets
```

## Customisation tips

- Loader duration is set per row with `data-duration` (milliseconds).
- Gym Bro rep count and timing live in `script.js` (`GYM_REPS`, `GYM_REP_MS`).
- The ambient background (gradients + grid) is optional — remove the `.ambient` and `.grid-overlay` divs if you don't need them.
- Each loader is isolated. You don't have to include all five.

## Support

Questions or issues? Reach out via Payhip or email **contact@enquiryconnect.com**.
