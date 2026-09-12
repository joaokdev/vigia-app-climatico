# OTP Verification

A premium four-digit OTP card — visual slots, circuit formation and collapse on a correct code, error shake on a wrong one, and a verified success state. Pure HTML, CSS, and vanilla JavaScript. No build step, no dependencies.

Thanks for downloading — hope this lands well in your project.

## What's inside

| Feature | What happens | Needs JS? |
|---------|--------------|-----------|
| Digit slots | Four visual nodes mirror a single hidden OTP input | Yes — sync + caret |
| Auto-submit | Filling all four digits starts verification | Yes — input handler |
| Correct code | Slots form a square, wires connect, circuit spins, then collapses | Yes — Web Animations + rAF |
| Wrong code | Error styling, shake, then clears for another try | Yes — reject flow |
| Resend timer | Countdown then a tappable resend control (demo) | Yes — interval |
| Success state | Checkmark, trust badge, and Continue CTA | Yes — reveal helpers |
| Keyboard | Digits type without clicking a slot; Escape skips the hero run | Yes — keydown |
| Reduced motion | Skips the circuit choreography and shows success instantly | Yes — media query gate |

## Quick preview

Open `index.html` in your browser. Enter demo code **8402** to see the full verification animation. Try any other four digits for the error state. That's it — no install required.

## Use in your own project

1. **Copy the card markup** from `index.html`: `.app-shell` / `.verification-card`, the OTP form (hidden `#otp-input` + four `.otp-node` slots + wires), and `#success-view`. Keep the live region (`#status-live`) for screen-reader updates.
2. **Keep required IDs or update the JS.** The script reads `#verification-card`, `#otp-form`, `#otp-input`, `#otp-scene`, `#circuit-plane`, `#collapse-core`, feedback / resend / success IDs, and `.otp-node` / `.wire` / `.digit`. Rename carefully in both places.
3. **Copy the CSS sections into your own stylesheet.** Start with the `:root` tokens, then foundation, card chrome, slots, wires, processing / success states, keyframes, and the responsive / reduced-motion blocks. Skip unused ambient helpers if your page already has a background.
4. **Add the JavaScript behaviour.** Copy `script.js` as-is for the demo, or keep the constants (`DEMO_CODE`, geometry helpers) and wire `runVerification` / `revealSuccess` into your real OTP API — call success only when the server confirms.
5. **Swap the demo code.** Change `DEMO_CODE` (and the visible `.demo-code` hint) or remove the demo note once you validate against your backend.
6. **Adjust copy and colours** — phone mask, titles, and CSS custom properties (`--purple`, `--cyan`, `--green`, `--slot-size`, `--card-radius`, etc.) to match your brand.

If you want to run the whole demo unchanged, you can also copy `index.html`, `style.css`, and `script.js` together and link them as-is. For real projects, embedding the card markup, CSS, and verification logic into your auth flow is usually cleaner.

## File structure

```
index.html    Verification card — OTP form and success view
style.css     Global styles, slots, circuit, success, and motion
script.js     Input sync, circuit choreography, resend, and reset
LICENSE.txt   Usage terms
```

## Customisation tips

- Slot size is `--slot-size` in `:root` (also clamped in the mobile media queries).
- Accent colours live on `--purple` / `--cyan` / `--green` and their `-bright` variants.
- Demo accept code is `DEMO_CODE` in `script.js` (default `"8402"`) — keep the on-page hint in sync.
- Resend countdown starts at `resendSeconds` (24) — change that value and the initial `#resend-time` text.
- Escape during the hero run jumps to success; remove that keydown branch if you do not want a skip.
- Continue dispatches `code-candy:continue` — listen for it in your app, or replace the click handler with real navigation.
- Fonts use system UI (`Segoe UI` / system-ui). Point `font-family` at your brand face if needed.

## Support

Questions or issues? Reach out via Payhip or email **contact@enquiryconnect.com**.
