# GitHub Pages customer preview from `main`

## Goal

Publish the existing landing page as a normal public website for customer review at the repository GitHub Pages URL.

## Design

- Publish the checked-in static preview directly from the root of `main`, matching the repository's existing Pages source.
- Build from `public/` into a disposable local artifact, then copy the generated static files to the repository root while preserving the production/Host-0 files unchanged.
- Rewrite root-relative links to the repository base path (`/jack/`) so styles, scripts, images, legal pages, and downloads work on GitHub Pages.
- Exclude PHP endpoints and Apache configuration from the static artifact. The public preview demonstrates the interface; live form delivery remains a Host-0 feature.
- Include `.nojekyll` so GitHub Pages serves the checked-in files without transforming the site.

## Acceptance criteria

- The generated artifact contains `index.html` at its root.
- Internal assets and legal links resolve below `/jack/`.
- No `.php` or `.htaccess` files are published.
- The root of `main` contains `index.html`, legal pages, and the complete `assets/` tree.
- No custom GitHub Actions workflow is required.
