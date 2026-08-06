# Project overview

Jack industrial sewing equipment landing page. It is a responsive vanilla HTML/CSS/ES-module site with a secure PHP 8.1+ lead endpoint using PHPMailer 7. The canonical source for hosting is under public/. A generated static GitHub Pages copy is kept at the repository root and produced by scripts/build-pages.mjs.

Structure:
- public/index.html, privacy.html, consent.html: source pages.
- public/assets/css: token, base, layout, component, and responsive CSS layers.
- public/assets/js: focused ES modules for menu, video dialog, form, and cookies.
- public/api plus server/src: protected submission endpoint and PHP validation/security/mail classes.
- tests/e2e: Playwright functional, quality, legal, API, and visual snapshot tests.
- tests/js: Node tests for masks, Pages build, preview form, icons, manifest, headers.
- tests/php: direct PHP tests for validator, guard, limiter, and mail transport.
- assets and root HTML files: generated GitHub Pages output; do not hand-edit independently from public.

Deployment targets:
- PHP hosting uses public/ as DocumentRoot, with server/ and vendor/ outside the public root.
- GitHub Pages publishes the static root copy from main at https://rez1dennt.github.io/jack/.