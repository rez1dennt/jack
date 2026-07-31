export function initVideoDialog(button, dialog) {
  if (!button || !(dialog instanceof HTMLDialogElement)) return () => {};

  const closeControls = [...dialog.querySelectorAll('[data-video-close]')];

  const open = () => {
    if (!dialog.open) dialog.showModal();
  };
  const close = () => {
    if (dialog.open) dialog.close();
  };
  const closeFromBackdrop = (event) => {
    if (event.target === dialog) close();
  };
  const returnFocus = () => button.focus({ preventScroll: true });

  button.addEventListener('click', open);
  for (const control of closeControls) control.addEventListener('click', close);
  dialog.addEventListener('click', closeFromBackdrop);
  dialog.addEventListener('close', returnFocus);

  return () => {
    close();
    button.removeEventListener('click', open);
    for (const control of closeControls) control.removeEventListener('click', close);
    dialog.removeEventListener('click', closeFromBackdrop);
    dialog.removeEventListener('close', returnFocus);
  };
}
