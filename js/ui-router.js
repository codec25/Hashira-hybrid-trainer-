(function(){
  const ROUTES = ['dashboard','session','checklist','plan','library','tools','about'];

  function getRouteFromHash() {
    const route = (location.hash || '#dashboard').replace('#','').trim().toLowerCase();
    return ROUTES.includes(route) ? route : 'dashboard';
  }

  function setActiveRoute(route) {
    document.querySelectorAll('[data-screen]').forEach((el) => {
      el.classList.toggle('active', el.dataset.screen === route);
    });

    document.querySelectorAll('[data-route]').forEach((el) => {
      el.classList.toggle('active', el.dataset.route === route);
    });
  }

  function handleRoute() {
    const route = getRouteFromHash();
    setActiveRoute(route);
    if (window.renderLibraryScreen) window.renderLibraryScreen();
  }

  window.HASHIRA_ROUTER = { handleRoute, getRouteFromHash };
})();
