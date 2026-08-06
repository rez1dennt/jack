# Suggested commands (Windows PowerShell)

Run from the linked worktree root.

- Install Node packages: npm ci
- Install PHP packages: composer install
- Install Chromium: npx playwright install chromium
- Local server: php -S 127.0.0.1:8080 -t public
- Unit tests: npm run test:js
- E2E and visual tests: npm run test:e2e
- Full Node/E2E suite: npm test
- PHP tests: Get-ChildItem tests/php/*.test.php | ForEach-Object { php -d zend.assertions=1 -d assert.exception=1 $_.FullName }
- Build GitHub Pages: npm run build:pages -- --asset-version <version>
- Search files: rg --files
- Search text: rg -n "pattern" path
- Git status: git -c safe.directory='C:/Users/bahti/Documents/Швейные дела заказ/.worktrees/jack-landing' status --short
- Check whitespace: git -c safe.directory='C:/Users/bahti/Documents/Швейные дела заказ/.worktrees/jack-landing' diff --check