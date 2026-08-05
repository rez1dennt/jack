# Model Speed Synchronization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Синхронизировать подпись скорости в карточке преимуществ с выбранной моделью JACK J6 или JACK M9.

**Architecture:** Кнопки вкладок остаются единым источником данных для модели: рядом с данными изображения каждая кнопка получает `data-speed-copy`. Существующий `initSpecTabs` при выборе вкладки обновляет изображение, панель и один текстовый узел `data-model-speed`.

**Tech Stack:** Семантический HTML, нативные ES-модули, Playwright, Node.js, генератор GitHub Pages `scripts/build-pages.mjs`.

## Global Constraints

- JACK J6: «До 3 000 ст/мин (JACK J6)».
- JACK M9: «До 3 600 ст/мин (JACK M9)».
- Переключение мышью и клавиатурой даёт одинаковый результат.
- Начальный HTML без JavaScript показывает значение JACK J6.
- Канонические изменения выполняются только в `public/`; корневая Pages-копия генерируется сборкой.

---

### Task 1: Синхронизация подписи скорости

**Files:**
- Modify: `tests/e2e/client-remediation.spec.mjs:107-131`
- Modify: `public/index.html:266-267,325`
- Modify: `public/assets/js/spec-tabs.js:1-58`

**Interfaces:**
- Consumes: `initSpecTabs(tablist: HTMLElement): () => void`, существующие `data-image-*` и `aria-controls`.
- Produces: `data-speed-copy` на вкладках и обновляемый узел `[data-model-speed]`.

- [ ] **Step 1: Write the failing test**

```js
const modelSpeed = page.locator('[data-model-speed]');
await expect(modelSpeed).toHaveText('До 3 000 ст/мин (JACK J6)');

await m9Tab.click();
await expect(modelSpeed).toHaveText('До 3 600 ст/мин (JACK M9)');

await m9Tab.focus();
await page.keyboard.press('ArrowLeft');
await expect(j6Tab).toBeFocused();
await expect(modelSpeed).toHaveText('До 3 000 ст/мин (JACK J6)');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/client-remediation.spec.mjs --grep "machine specifications" --project=desktop --workers=1 --reporter=dot`

Expected: FAIL because `[data-model-speed]` does not exist and the initial card still contains the M9 value.

- [ ] **Step 3: Add model data and correct initial copy**

```html
<button id="tab-j6" ... data-speed-copy="До 3 000 ст/мин (JACK J6)">JACK J6</button>
<button id="tab-m9" ... data-speed-copy="До 3 600 ст/мин (JACK M9)">JACK M9</button>
<p data-model-speed>До 3 000 ст/мин (JACK J6)</p>
```

- [ ] **Step 4: Update the selected model presentation**

```js
const specifications = tablist.closest('.specifications');
const modelImage = specifications?.querySelector('[data-model-image]');
const modelSpeed = specifications?.querySelector('[data-model-speed]');

const updateModelSpeed = (tab) => {
  if (!modelSpeed || !tab.dataset.speedCopy) return;
  modelSpeed.textContent = tab.dataset.speedCopy;
};

// Inside selectTab after updateModelImage(tab):
updateModelSpeed(tab);
```

- [ ] **Step 5: Run the targeted and full relevant tests**

Run: `npx playwright test tests/e2e/client-remediation.spec.mjs --grep "machine specifications" --project=desktop --workers=1 --reporter=dot`

Expected: PASS.

Run: `npm run test:js`

Expected: all Node tests pass.

### Task 2: Build and publish Pages copy

**Files:**
- Modify (generated): `index.html`
- Modify (generated): `assets/js/spec-tabs.js`
- Modify (generated cache-busted assets): files reported by `scripts/build-pages.mjs`

**Interfaces:**
- Consumes: canonical files from Task 1.
- Produces: static `/jack/` Pages copy with version `model-speed-sync-20260805-1`.

- [ ] **Step 1: Build the Pages artifact**

Run: `npm run build:pages -- --asset-version model-speed-sync-20260805-1`

Expected: exit code 0 and `.pages-dist/index.html` containing the two `data-speed-copy` values.

- [ ] **Step 2: Copy the generated artifact to the repository root**

```powershell
Get-ChildItem -LiteralPath .pages-dist -Force | Copy-Item -Destination . -Recurse -Force
```

- [ ] **Step 3: Verify generated paths and diff**

Run: `git diff --check`

Expected: exit code 0.

Run: `rg -n "data-speed-copy|data-model-speed|model-speed-sync-20260805-1" public/index.html index.html public/assets/js/spec-tabs.js assets/js/spec-tabs.js`

Expected: both models and both canonical/generated copies are present.

- [ ] **Step 4: Commit and publish**

```bash
git add -- public/index.html public/assets/js/spec-tabs.js tests/e2e/client-remediation.spec.mjs index.html assets/js/spec-tabs.js assets/css assets/js/main.js consent.html privacy.html requisites.html site.webmanifest docs/superpowers/plans/2026-08-05-model-speed-sync.md
git commit -m "fix: synchronize model speed copy"
git push origin HEAD:main
```

- [ ] **Step 5: Confirm the remote branch**

Run: `git ls-remote origin refs/heads/main`

Expected: remote `main` hash equals local `HEAD`.
