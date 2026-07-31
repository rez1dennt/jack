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

  let isOpen = false;
  let previousOverflow = '';
  let previousPaddingRight = '';
  let focusTimer;

  const unlockScroll = () => {
    restoreInlineStyle(document.body, 'overflow', previousOverflow);
    restoreInlineStyle(document.body, 'padding-right', previousPaddingRight);
  };

  const lockScroll = () => {
    previousOverflow = document.body.style.getPropertyValue('overflow');
    previousPaddingRight = document.body.style.getPropertyValue('padding-right');
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    const currentPadding = Number.parseFloat(getComputedStyle(document.body).paddingRight) || 0;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
  };

  const close = ({ returnFocus = true } = {}) => {
    if (!isOpen) return;
    isOpen = false;
    window.clearTimeout(focusTimer);
    root.removeAttribute('data-menu-open');
    panel.removeAttribute('data-open');
    button.setAttribute('aria-expanded', 'false');
    overlay.hidden = true;
    if (label) label.textContent = 'Открыть меню';
    unlockScroll();
    if (returnFocus) button.focus({ preventScroll: true });
  };

  const open = () => {
    if (isOpen) return;
    isOpen = true;
    lockScroll();
    root.setAttribute('data-menu-open', 'true');
    panel.setAttribute('data-open', 'true');
    button.setAttribute('aria-expanded', 'true');
    overlay.hidden = false;
    if (label) label.textContent = 'Закрыть меню';
    const focusFirstItem = () => {
      if (isOpen) panel.querySelector('a, button')?.focus({ preventScroll: true });
    };
    panel.addEventListener('transitionend', focusFirstItem, { once: true });
    focusTimer = window.setTimeout(focusFirstItem, 280);
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

    const focusable = [...panel.querySelectorAll('a[href], button:not([disabled])')];
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
    if (window.matchMedia('(min-width: 48rem)').matches) close({ returnFocus: false });
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
