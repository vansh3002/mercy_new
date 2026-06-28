# brand/ ,Logo assets

The site header renders the logo as an **image**, never as text.

| File                  | Required | Used for |
|-----------------------|----------|----------|
| `womania-logo.jpg`    | ✅       | Primary logo (header, footer) |
| `womania-logo.png`    | optional | Higher-fidelity fallback with transparency |
| `womania-logo.svg`    | optional | Best ,crisp at any size |
| `favicon.ico`         | optional | Browser tab icon |

To replace the logo: overwrite `womania-logo.jpg` (or add an `.svg` and update the `<BoutiqueHeader>` source list).
