# GitHub Pages customer preview

## Goal

Publish the existing landing page as a normal public website for customer review at the repository GitHub Pages URL.

## Design

- Deploy automatically after every push to `main`.
- Build from `public/` into a separate disposable artifact, preserving the production/Host-0 files unchanged.
- Rewrite root-relative links to the repository base path (`/jack/`) so styles, scripts, images, legal pages, and downloads work on GitHub Pages.
- Exclude PHP endpoints and Apache configuration from the static artifact. The public preview demonstrates the interface; live form delivery remains a Host-0 feature.
- Use the official GitHub Pages Actions workflow and permissions.

## Acceptance criteria

- The generated artifact contains `index.html` at its root.
- Internal assets and legal links resolve below `/jack/`.
- No `.php` or `.htaccess` files are published.
- A push to `main` triggers a Pages deployment.
