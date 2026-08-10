(function(){
  const ROUTES = ['home','train','circles','chat','adventure','coach','plan','presets','library','profile'];

  /** Old bookmarks / links still resolve to the new screens. */
  const LEGACY_ROUTE_MAP = {
    dashboard: 'home',
    session: 'train',
    checklist: 'home',
    tools: 'profile',
    about: 'profile'
  };

  function getRouteFromHash() {
    const raw = (location.hash || '#home').replace('#','').trim().toLowerCase();
    const mapped = LEGACY_ROUTE_MAP[raw] || raw;
    if (mapped === 'onboarding') return 'onboarding';
    return ROUTES.includes(mapped) ? mapped : 'home';
  }

  let screenEnterTimer = 0;

  function setActiveRoute(route) {
    clearTimeout(screenEnterTimer);
    document.body.classList.toggle('route-onboarding', route === 'onboarding');
    document.body.dataset.activeRoute = route;
    document.querySelectorAll('[data-screen]').forEach((el) => {
      const on = el.dataset.screen === route;
      el.classList.toggle('active', on);
      if (on) {
        el.classList.remove('screen--enter');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.classList.add('screen--enter');
            screenEnterTimer = setTimeout(() => {
              el.classList.remove('screen--enter');
            }, 420);
          });
        });
      }
    });

    document.querySelectorAll('[data-route]').forEach((el) => {
      el.classList.toggle('active', el.dataset.route === route);
    });
  }

  function handleRoute() {
    const profileApi = window.HASHIRA_USER_PROFILE;
    try {
      if (new URLSearchParams(location.search).get('account') === '1') {
        localStorage.setItem('hashira_account_session_hint', '1');
        history.replaceState(null, '', location.pathname + location.hash);
      }
    } catch (_) {}
    let accountHint = false;
    try { accountHint = localStorage.getItem('hashira_account_session_hint') === '1'; } catch (_) {}
    const done = accountHint || (profileApi && typeof profileApi.isComplete === 'function' && profileApi.isComplete());
    let route = getRouteFromHash();

    if (!done) {
      if (route !== 'onboarding') {
        location.replace(location.pathname + location.search + '#onboarding');
        return;
      }
    } else if (route === 'onboarding') {
      location.replace(location.pathname + location.search + '#home');
      return;
    }

    setActiveRoute(route);
    if (route === 'home' && typeof window.refreshHomePresetHint === 'function') {
      window.refreshHomePresetHint();
    }
    if (route === 'presets' && window.HASHIRA_PRESETS && typeof window.HASHIRA_PRESETS.mountPresetsUI === 'function') {
      const root = document.getElementById('presets-root');
      if (root) window.HASHIRA_PRESETS.mountPresetsUI(root);
    }
    if ((route === 'adventure' || route === 'coach') && window.HASHIRA_EXPEDITIONS) {
      window.HASHIRA_EXPEDITIONS.refresh(route);
    }
    if ((route === 'circles' || route === 'chat' || route === 'profile') && window.HASHIRA_COMMUNITY) {
      window.HASHIRA_COMMUNITY.refresh(route);
    }
    if (window.renderLibraryScreen) window.renderLibraryScreen();
    if (window.HASHIRA_PROGRESSION && typeof window.HASHIRA_PROGRESSION.refreshSnapshots === 'function') {
      window.HASHIRA_PROGRESSION.refreshSnapshots();
    }
    if (
      route === 'profile' &&
      window.HASHIRA_USER_PROFILE &&
      typeof window.HASHIRA_USER_PROFILE.renderProfileSummary === 'function'
    ) {
      window.HASHIRA_USER_PROFILE.renderProfileSummary();
    }
  }

  window.HASHIRA_ROUTER = { handleRoute, getRouteFromHash, ROUTES, LEGACY_ROUTE_MAP };
})();
