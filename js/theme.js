

(function () {
  const STORAGE_KEY = 'vhk-theme';
  const LIGHT = 'light';
  const DARK = 'dark';
  const ROOT = document.documentElement;
  const TRANSITION_CLASS = 'theme-changing';
  const TRANSITION_MS = 420;

  if (window.__vhkThemeInit) return;
  window.__vhkThemeInit = true;

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function currentTheme() {
    return ROOT.getAttribute('data-theme') === LIGHT ? LIGHT : DARK;
  }

  function setTheme(nextTheme) {
    if (nextTheme === LIGHT) ROOT.setAttribute('data-theme', LIGHT);
    else ROOT.removeAttribute('data-theme');
    localStorage.setItem(STORAGE_KEY, nextTheme);
  }

  function withTransition(fn) {
    if (prefersReducedMotion()) return fn();

    ROOT.classList.remove(TRANSITION_CLASS);

    ROOT.offsetHeight;
    ROOT.classList.add(TRANSITION_CLASS);

    try {
      fn();
    } finally {
      window.setTimeout(() => ROOT.classList.remove(TRANSITION_CLASS), TRANSITION_MS);
    }
  }

  document.addEventListener('click', function (e) {
    const btn = e.target && e.target.closest ? e.target.closest('#theme-toggle-btn') : null;
    if (!btn) return;

    const next = currentTheme() === LIGHT ? DARK : LIGHT;
    withTransition(() => setTheme(next));
  });
})();

