import { initLeadForm } from './form.js?v=model-images-order-20260804-1';
import { initMenu } from './menu.js?v=model-images-order-20260804-1';
import { initCookieBanner } from './cookies.js?v=model-images-order-20260804-1';
import { initVideoDialog } from './video.js?v=model-images-order-20260804-1';
import { initSpecTabs } from './spec-tabs.js?v=model-images-order-20260804-1';

initLeadForm(document.querySelector('#consultation-form'), {
  previewMode: document.documentElement.dataset.staticPreview === 'true'
});
initMenu(document.querySelector('[data-menu-root]'));
initCookieBanner(document.querySelector('[data-cookie-banner]'));
initVideoDialog(document.querySelector('[data-video-button]'), document.querySelector('[data-video-dialog]'));
initSpecTabs(document.querySelector('.model-tabs'));
