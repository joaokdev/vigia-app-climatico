# Expanding Hover Menu

Pill-style dashboard navigation that expands each item on hover, with neon glow, SVG icons, and click selection state. Pure HTML, CSS, and vanilla JavaScript. No build step, no dependencies.

Thanks for downloading — hope this lands well in your project.

## What's inside

| Feature | What happens | Needs JS? |
|---------|--------------|-----------|
| Hover expand | Menu items widen to reveal labels | No — CSS hover |
| Neon glow | Active / hovered items bloom with cyan and pink light | No — CSS only |
| SVG icons | Inline dashboard, projects, messages, settings, and logout icons | No — static markup |
| Click selection | Clicked item keeps a selected state | Yes — class toggle |
| Code panel | Demo-only CSS snippet beside the menu | No — static markup |
| Ambient background | Soft cyan, pink, and purple glows | No — CSS only |

## Quick preview

Open `index.html` in your browser. Hover each menu item to expand it, then click an item to keep it selected.

## Use in your own project

1. **Copy the menu markup** from `index.html` into your own navigation area: the `<nav class="menu">`, `.menu-list`, `.menu-item` links, icons, and labels. You do not need the code panel, header spacer, or showcase wrapper unless you want the demo layout.
2. **Copy the menu CSS into your own stylesheet.** Bring over the `:root` variables you want to keep, `.menu`, `.menu-list`, `.menu-item`, `.menu-icon`, `.menu-label`, selected state, and responsive rules. Skip `.bg-glow`, `.showcase`, and `.code-panel` if your app already has its own page styling.
3. **Add JavaScript only if you want click selection.** Copy the small script from `script.js`; it prevents demo links from navigating and toggles `.selected` on the clicked `.menu-item`.
4. **Replace demo links.** Change each `href="#"` to your real route or URL. If you want normal navigation instead of selection-only behaviour, remove `e.preventDefault()` from the click handler or skip `script.js`.
5. **Keep labels accessible.** If you remove visible labels, add useful `aria-label` text to each link so icon-only navigation still works for screen readers.
6. **Adjust labels and colours** — change menu text, SVG icons, and CSS custom properties (`--cyan`, `--pink`, `--purple`, etc.) to match your brand.

If you want to run the whole demo unchanged, you can also copy `index.html`, `style.css`, and `script.js` together and link them as-is. For real projects, merging the nav markup, CSS blocks, and optional selection script into your existing layout is usually cleaner.

## File structure

```
index.html    Page markup, expanding menu, and demo code panel
style.css     Global styles + menu hover, selected state, and demo layout
script.js     Optional click selection handler
LICENSE.txt   Usage terms
```

## Customisation tips

- Expanded item width is controlled by the `.menu-item:hover` and `.menu-item.selected` width rules.
- Label reveal timing lives in `.menu-label` transitions.
- The ambient background glows are optional — remove the `.bg-glow` divs if you don't need them.
- The code panel is for presentation only and can be removed when embedding the menu in a real dashboard.

## Support

Questions or issues? Reach out via Payhip or email **contact@enquiryconnect.com**.
