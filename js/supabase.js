

(function () {

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