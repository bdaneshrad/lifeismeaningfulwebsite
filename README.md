# Life is Meaningful

Website for lifeismeaningful.org — built in plain HTML/CSS/JS, hosted on GitHub Pages.

## Local development
```
npx serve .
```
Then open http://localhost:3000

## Assets needed
- `assets/images/hero-bg.jpg` — Central Park hero image (provided by Bennett)
- `assets/images/bennett-photo.jpg` — Candid photo of Bennett (provided by Bennett)
- `assets/images/logo.png` — LiM logo, transparent background (provided by Bennett)

## Third-party integrations
- **Beehiiv** — Email capture form (Section 5). Replace native HTML form with Beehiiv embed when Bennett provides code.
- **Behold.so** — Instagram feed (Section 3). Replace launch placeholder card when Bennett provides embed code.
- **Formspree** — Contact form (Section 7). Replace `YOUR_FORM_ID` in form action with actual Formspree endpoint.

## Notes
- Hero is built with `<img>` overlay. Swap to `<video>` after April 2026 filming by replacing the `<img>` tag — overlay and content structure unchanged.
- `MOMENTS_COUNT` variable at top of `scripts.js` controls the Section 4 counter. Update manually as the number grows.
