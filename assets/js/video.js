function restoreInlineStyle(element, property, value) {
  if (value) element.style.setProperty(property, value);
  else element.style.removeProperty(property);
}

export function initVideoDialog(button, dialog) {
  if (!button || !(dialog instanceof HTMLDialogElement)) return () => {};

  const closeControls = [...dialog.querySelectorAll('[data-video-close]')];

  let isScrollLocked = false;
  let previousRootOverflow = '';
  let previousPaddingRight = '';
  let lockedScrollY = 0;
  let scrollRestoreFrame = 0;

  const restoreScrollPosition = () => {
    if (window.scrollY !== lockedScrollY) window.scrollTo(0, lockedScrollY);
  };

  const lockScroll = () => {
    if (isScrollLocked) return;
    window.cancelAnimationFrame(scrollRestoreFrame);
    scrollRestoreFrame = 0;

    const rootElement = document.documentElement;
    previousRootOverflow = rootElement.style.getPropertyValue('overflow');
    previousPaddingRight = document.body.style.getPropertyValue('padding-right');
    lockedScrollY = window.scrollY;
    const scrollbarWidth = Math.max(0, window.innerWidth - rootElement.clientWidth);
    const currentPadding = Number.parseFloat(getComputedStyle(document.body).paddingRight) || 0;

    rootElement.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    isScrollLocked = true;
  };

  const unlockScroll = () => {
    if (!isScrollLocked) return false;
    restoreInlineStyle(document.documentElement, 'overflow', previousRootOverflow);
    restoreInlineStyle(document.body, 'padding-right', previousPaddingRight);
    isScrollLocked = false;
    return true;
  };

  const finishClose = ({ returnFocus = true } = {}) => {
    if (!unlockScroll()) return;
    if (returnFocus) button.focus({ preventScroll: true });
    restoreScrollPosition();
    scrollRestoreFrame = window.requestAnimationFrame(() => {
      restoreScrollPosition();
      scrollRestoreFrame = 0;
    });
  };

  const open = () => {
    if (dialog.open) return;
    lockScroll();
    try {
      dialog.showModal();
    } catch (error) {
      finishClose({ returnFocus: false });
      throw error;
    }
  };
  const close = () => {
    if (dialog.open) dialog.close();
  };
  const closeFromBackdrop = (event) => {
    if (event.target === dialog) close();
  };
  const handleClose = () => finishClose();

  button.addEventListener('click', open);
  for (const control of closeControls) control.addEventListener('click', close);
  dialog.addEventListener('click', closeFromBackdrop);
  dialog.addEventListener('close', handleClose);

  return () => {
    close();
    finishClose({ returnFocus: false });
    window.cancelAnimationFrame(scrollRestoreFrame);
    button.removeEventListener('click', open);
    for (const control of closeControls) control.removeEventListener('click', close);
    dialog.removeEventListener('click', closeFromBackdrop);
    dialog.removeEventListener('close', handleClose);
  };
}
