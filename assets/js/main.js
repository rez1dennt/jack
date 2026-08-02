import { initLeadForm } from './form.js?v=icons-20260802-1';
import { initMenu } from './menu.js?v=icons-20260802-1';
import { initCookieBanner } from './cookies.js?v=icons-20260802-1';
import { initVideoDialog } from './video.js?v=icons-20260802-1';

initLeadForm(document.querySelector('#consultation-form'), {
  previewMode: document.documentElement.dataset.staticPreview === 'true'
});
initMenu(document.querySelector('[data-menu-root]'));
initCookieBanner(document.querySelector('[data-cookie-banner]'));
initVideoDialog(document.querySelector('[data-video-button]'), document.querySelector('[data-video-dialog]'));
