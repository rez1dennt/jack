# Task completion checklist

1. Use TDD for behavior changes: add the smallest Playwright/Node/PHP test, confirm RED, implement minimal change, confirm GREEN.
2. Run relevant targeted tests and then npm test.
3. Run PHP tests if server code changed.
4. Run UX token/taste linters for CSS/UI changes.
5. Update visual snapshots only after inspecting intentional diffs at desktop/tablet/mobile.
6. Build Pages with a new cache-busting version and copy the validated .pages-dist output to the repository root.
7. Confirm no malformed /jack/ URLs, no missing SVGs, and no horizontal overflow at 280/320/390 px.
8. Stage tracked files only (git add -u); keep debug.log untracked.
9. Commit and push HEAD:main when the user requested direct publication.
10. Verify the live GitHub Pages CSS version and target geometry after CDN refresh.