(function () {
  async function loadInto(id, file, after) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
      const res = await fetch(file);
      if (!res.ok) return;
      el.innerHTML = await res.text();
      if (after) after();
    } catch (_) {}
  }

  function initNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const page = path.replace('.html', '');
    document.querySelectorAll('.nav-links a[data-page="' + page + '"], .nav-drawer-links a[data-page="' + page + '"]').forEach(function (link) {
      link.classList.add('active');
    });

    const hamburger = document.getElementById('nav-hamburger');
    const drawerClose = document.getElementById('nav-drawer-close');
    const overlay = document.getElementById('nav-overlay');
    if (hamburger) hamburger.addEventListener('click', openNavDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeNavDrawer);
    if (overlay) overlay.addEventListener('click', closeNavDrawer);

    if (!window.__vhkNavResize) {
      window.__vhkNavResize = true;
      window.addEventListener('resize', function () {
        if (window.innerWidth > 768) closeNavDrawer();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          closeNavDrawer();
          const ov = document.getElementById('search-overlay');
          if (ov && ov.classList.contains('open')) toggleSearch();
        }
      });
    }
  }

  function initFooter() {
    const year = document.getElementById('foot-year');
    if (year) year.textContent = new Date().getFullYear();
  }

  function openNavDrawer() {
    if (window.innerWidth > 768) return;
    document.getElementById('nav-drawer')?.classList.add('open');
    document.getElementById('nav-overlay')?.classList.add('open');
    document.getElementById('nav-hamburger')?.setAttribute('aria-expanded', 'true');
    document.getElementById('nav-drawer')?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeNavDrawer() {
    document.getElementById('nav-drawer')?.classList.remove('open');
    document.getElementById('nav-overlay')?.classList.remove('open');
    document.getElementById('nav-hamburger')?.setAttribute('aria-expanded', 'false');
    document.getElementById('nav-drawer')?.setAttribute('aria-hidden', 'true');
    if (!document.getElementById('search-overlay')?.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  function toggleSearch() {
    const ov = document.getElementById('search-overlay');
    if (!ov) return;
    const open = ov.classList.contains('open');
    ov.classList.toggle('open', !open);
    ov.setAttribute('aria-hidden', open ? 'true' : 'false');
    if (!open) {
      document.getElementById('overlay-search-input')?.focus();
      document.body.style.overflow = 'hidden';
    } else if (!document.getElementById('nav-drawer')?.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  function doOverlaySearch() {
    const q = document.getElementById('overlay-search-input')?.value.trim();
    if (!q) return;
    window.location = 'listings.html?q=' + encodeURIComponent(q);
  }

  window.openNavDrawer = openNavDrawer;
  window.closeNavDrawer = closeNavDrawer;
  window.toggleSearch = toggleSearch;
  window.doOverlaySearch = doOverlaySearch;

  window.vhkLoadLayout = async function () {
    await Promise.all([
      loadInto('nav-placeholder', 'components/nav.html', initNav),
      loadInto('footer-placeholder', 'components/footer.html', initFooter),
    ]);
  };

  if (document.getElementById('nav-placeholder') || document.getElementById('footer-placeholder')) {
    window.vhkLoadLayout();
  }
})();
