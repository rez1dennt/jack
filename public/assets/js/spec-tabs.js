export function initSpecTabs(tablist) {
  if (!tablist) return () => {};

  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  if (!tabs.length) return () => {};
  const specifications = tablist.closest('.specifications');
  const modelImage = specifications?.querySelector('[data-model-image]');
  const modelSpeed = specifications?.querySelector('[data-model-speed]');

  const updateModelImage = (tab) => {
    if (!modelImage || !tab.dataset.imageSrc) return;

    modelImage.src = tab.dataset.imageSrc;
    modelImage.alt = tab.dataset.imageAlt || tab.textContent.trim();

    const width = Number.parseInt(tab.dataset.imageWidth, 10);
    const height = Number.parseInt(tab.dataset.imageHeight, 10);
    if (Number.isFinite(width)) modelImage.width = width;
    if (Number.isFinite(height)) modelImage.height = height;
  };

  const updateModelSpeed = (tab) => {
    if (!modelSpeed || !tab.dataset.speedCopy) return;
    modelSpeed.textContent = tab.dataset.speedCopy;
  };

  const selectTab = (tab, { focus = false } = {}) => {
    for (const current of tabs) {
      const selected = current === tab;
      current.setAttribute('aria-selected', String(selected));
      current.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(current.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    }
    updateModelImage(tab);
    updateModelSpeed(tab);
    if (focus) tab.focus();
  };

  const handleClick = (event) => selectTab(event.currentTarget);
  const handleKeydown = (event) => {
    const currentIndex = tabs.indexOf(event.currentTarget);
    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    selectTab(tabs[nextIndex], { focus: true });
  };

  for (const tab of tabs) {
    tab.addEventListener('click', handleClick);
    tab.addEventListener('keydown', handleKeydown);
  }

  return () => {
    for (const tab of tabs) {
      tab.removeEventListener('click', handleClick);
      tab.removeEventListener('keydown', handleKeydown);
    }
  };
}
