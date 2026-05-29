// ═══════════════════════════════════════════
// VISION HOMES KENYA — Supabase Client Init
// ═══════════════════════════════════════════
// This file loads the Supabase SDK from CDN and
// exposes a shared `db` instance used across all JS files.

(function () {
  // The CDN script exposes window.supabase — we wrap it here
  // so every other module can call `getDB()` safely.
  window._vhkDB = null;

  window.getDB = function () {
    if (window._vhkDB) return window._vhkDB;
    if (typeof supabase === 'undefined') {
      console.warn('Supabase SDK not loaded yet.');
      return null;
    }
    window._vhkDB = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return window._vhkDB;
  };
})();