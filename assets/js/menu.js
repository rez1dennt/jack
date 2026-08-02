function restoreInlineStyle(element, property, value) {
  if (value) element.style.setProperty(property, value);
  else element.style.removeProperty(property);
}

export function initMenu(root) {
  if (!root) return () => {};

  const button = root.querySelector('[data-menu-button]');
  const panel = root.querySelector('[data-menu-panel]');
  const overlay = root.querySelector('[data-menu-overlay]');
  const label = button?.querySelector('.sr-only');
  if (!button || !panel || !overlay) return () => {};

  const backgroundTargets = [
    document.querySelector('.skip-link'),
    document.querySelector('main'),
    document.querySelector('footer'),
    document.querySelector('[data-cookie-banner]'),
    root.querySelector('.site-header__contact'),
    root.querySelector('.header-cta')
  ].filter((element) => element instanceof HTMLElement);
  const backgroundState = new Map();

  let isOpen = false;
  let previousRootOverflow = '';
  let previousPaddingRight = '';
  let lockedScrollY = 0;
  let focusFrame = 0;
  let scrollRestoreFrame = 0;

  const setBackgroundInert = (inert) => {
    for (const element of backgroundTargets) {
      if (inert) {
        backgroundState.set(element, {
          inert: element.inert,
          ariaHidden: element.getAttribute('aria-hidden')
        });
        element.inert = true;
        element.setAttribute('aria-hidden', 'true');
        continue;
      }

      const previous = backgroundState.get(element);
      element.inert = previous?.inert ?? false;
      if (previous?.ariaHidden === null || previous?.ariaHidden === undefined) element.removeAttribute('aria-hidden');
      else element.setAttribute('aria-hidden', previous.ariaHidden);
    }
    if (!inert) backgroundState.clear();
  };

  const unlockScroll = () => {
    restoreInlineStyle(document.documentElement, 'overflow', previousRootOverflow);
    restoreInlineStyle(document.body, 'padding-right', previousPaddingRight);
  };

  const restoreScrollPosition = () => {
    if (window.scrollY !== lockedScrollY) window.scrollTo(0, lockedScrollY);
  };

  const lockScroll = () => {
    const rootElement = document.documentElement;
    previousRootOverflow = rootElement.style.getPropertyValue('overflow');
    previousPaddingRight = document.body.style.getPropertyValue('padding-right');
    lockedScrollY = window.scrollY;
    const scrollbarWidth = Math.max(0, window.innerWidth - rootElement.clientWidth);
    const currentPadding = Number.parseFloat(getComputedStyle(document.body).paddingRight) || 0;
    rootElement.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
  };

  const close = ({ returnFocus = true } = {}) => {
    if (!isOpen) return;
    isOpen = false;
    window.cancelAnimationFrame(focusFrame);
    window.cancelAnimationFrame(scrollRestoreFrame);
    root.removeAttribute('data-menu-open');
    panel.removeAttribute('data-open');
    button.setAttribute('aria-expanded', 'false');
    overlay.hidden = true;
    if (label) label.textContent = 'Открыть меню';
    unlockScroll();
    setBackgroundInert(false);
    if (returnFocus) button.focus({ preventScroll: true });
    restoreScrollPosition();
    scrollRestoreFrame = window.requestAnimationFrame(() => {
      restoreScrollPosition();
      scrollRestoreFrame = 0;
    });
  };

  const open = () => {
    if (isOpen) return;
    isOpen = true;
    window.cancelAnimationFrame(scrollRestoreFrame);
    lockScroll();
    setBackgroundInert(true);
    root.setAttribute('data-menu-open', 'true');
    panel.setAttribute('data-open', 'true');
    button.setAttribute('aria-expanded', 'true');
    overlay.hidden = false;
    if (label) label.textContent = 'Закрыть меню';
    focusFrame = window.requestAnimationFrame(() => {
      if (isOpen) panel.querySelector('a, button')?.focus({ preventScroll: true });
    });
  };

  const handleButton = () => {
    if (isOpen) close();
    else open();
  };

  const handleDocumentKeydown = (event) => {
    if (!isOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = [button, ...panel.querySelectorAll('a[href], button:not([disabled])')];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handlePanelClick = (event) => {
    if (event.target.closest('a[href]')) close({ returnFocus: false });
  };

  const handleResize = () => {
    if (window.matchMedia('(min-width: 48.0625rem)').matches) close({ returnFocus: false });
  };

  button.addEventListener('click', handleButton);
  overlay.addEventListener('click', close);
  panel.addEventListener('click', handlePanelClick);
  document.addEventListener('keydown', handleDocumentKeydown);
  window.addEventListener('resize', handleResize);

  return () => {
    close({ returnFocus: false });
    button.removeEventListener('click', handleButton);
    overlay.removeEventListener('click', close);
    panel.removeEventListener('click', handlePanelClick);
    document.removeEventListener('keydown', handleDocumentKeydown);
    window.removeEventListener('resize', handleResize);
  };
}
