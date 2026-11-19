# The Codebucket list

Website of CodeBucket OÜ — a small software studio in Tallinn, Estonia.

Plain static site, no build step: open `index.html` in a browser.

| File | Purpose |
|---|---|
| `index.html` | markup and copy |
| `styles.css` | styles, responsive layout, reduced-motion support |
| `main.js` | tick-off animation on scroll, expandable project cards, idea form |
| `assets/` | favicon, project screenshots |

## Settings
At the top of `main.js`:
- `CONTACT_EMAIL` — contact address used across the page
- `DECANTED_PLAY_URL` — Google Play link for Decanted (empty hides the button)

## Adding a project
Copy one `<li class="item" data-item>…</li>` block in `index.html`, then change the texts, the `aria-controls` / `id` pair, the links and the screenshot in `assets/`.
