export function initSpecTabs(tablist) {
  if (!tablist) return () => {};

  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  if (!tabs.length) return () => {};

  const selectTab = (tab, { focus = false } = {}) => {
    for (const current of tabs) {
      const selected = current === tab;
      current.setAttribute('aria-selected', String(selected));
      current.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(current.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    }
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
