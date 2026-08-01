export const COOKIE_PREFERENCE_KEY = 'jack_cookie_preference_v1';

function readPreference(storage) {
  try {
    return storage.getItem(COOKIE_PREFERENCE_KEY);
  } catch {
    return null;
  }
}

function savePreference(storage, value) {
  try {
    storage.setItem(COOKIE_PREFERENCE_KEY, value);
  } catch {
    // The choice still applies for the current page when storage is unavailable.
  }
}

export function initCookieBanner(banner, { storage = globalThis.localStorage } = {}) {
  if (!banner) return () => {};

  const accept = banner.querySelector('[data-cookie-accept]');
  const necessary = banner.querySelector('[data-cookie-necessary]');
  const stored = storage ? readPreference(storage) : null;
  banner.hidden = stored === 'all' || stored === 'necessary';

  const choose = (value) => {
    if (storage) savePreference(storage, value);
    banner.hidden = true;
    document.dispatchEvent(new CustomEvent('cookie-preference-change', { detail: { value } }));
  };
  const acceptAll = () => choose('all');
  const acceptNecessary = () => choose('necessary');

  accept?.addEventListener('click', acceptAll);
  necessary?.addEventListener('click', acceptNecessary);

  return () => {
    accept?.removeEventListener('click', acceptAll);
    necessary?.removeEventListener('click', acceptNecessary);
  };
}
