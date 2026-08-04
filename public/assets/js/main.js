import { initLeadForm } from './form.js';
import { initMenu } from './menu.js';
import { initCookieBanner } from './cookies.js';
import { initVideoDialog } from './video.js';
import { initSpecTabs } from './spec-tabs.js';

initLeadForm(document.querySelector('#consultation-form'), {
  previewMode: document.documentElement.dataset.staticPreview === 'true'
});
initMenu(document.querySelector('[data-menu-root]'));
initCookieBanner(document.querySelector('[data-cookie-banner]'));
initVideoDialog(document.querySelector('[data-video-button]'), document.querySelector('[data-video-dialog]'));
initSpecTabs(document.querySelector('.model-tabs'));
