import { initLeadForm } from './form.js?v=brand-logo-menu-20260803-2';
import { initMenu } from './menu.js?v=brand-logo-menu-20260803-2';
import { initCookieBanner } from './cookies.js?v=brand-logo-menu-20260803-2';
import { initVideoDialog } from './video.js?v=brand-logo-menu-20260803-2';

initLeadForm(document.querySelector('#consultation-form'), {
  previewMode: document.documentElement.dataset.staticPreview === 'true'
});
initMenu(document.querySelector('[data-menu-root]'));
initCookieBanner(document.querySelector('[data-cookie-banner]'));
initVideoDialog(document.querySelector('[data-video-button]'), document.querySelector('[data-video-dialog]'));
