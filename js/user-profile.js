(function () {
  const STORAGE_KEY = 'hashira_user_profile_v1';
  const LS = window.HASHIRA_LS || {
    getItem: function (k) { return localStorage.getItem(k); },
    setItem: function (k, v) { localStorage.setItem(k, v); },
    removeItem: function (k) { localStorage.removeItem(k); }
  };

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function load() {
    try {
      const raw = LS.getItem(STORAGE_KEY);
      if (!raw) return null;
      const o = JSON.parse(raw);
      if (!o || typeof o !== 'object') return null;
      return {
        name: String(o.name || '').trim(),
        goal: String(o.goal || '').trim(),
        discipline: String(o.discipline || '').trim()
      };
    } catch (_) {
      return null;
    }
  }

  function isComplete() {
    const p = load();
    if (!p || !p.name || !p.goal || !p.discipline) return false;
    const lib = window.HASHIRA_LIB;
    if (!lib || !lib.DISCIPLINES_ALL) return false;
    return lib.DISCIPLINES_ALL.some((d) => d.value === p.discipline);
  }

  function save(profile) {
    const payload = {
      v: 1,
      name: String(profile.name || '').trim().slice(0, 80),
      goal: String(profile.goal || '').trim().slice(0, 240),
      discipline: String(profile.discipline || '').trim(),
      savedAt: new Date().toISOString()
    };
    LS.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function applyDisciplineToApp(discipline) {
    const sel = document.getElementById('discipline-select');
    if (!sel) return;
    const lib = window.HASHIRA_LIB;
    const ok = lib && lib.DISCIPLINES_ALL.some((d) => d.value === discipline);
    if (ok) sel.value = discipline;
    LS.setItem('discipline', sel.value);
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function renderProfileSummary() {
    const host = document.getElementById('user-profile-summary-body');
    if (!host) return;
    const p = load();
    if (!isComplete()) {
      host.innerHTML =
        '<p class="hint">Your name, goal, and discipline are saved locally after you finish onboarding.</p>';
      return;
    }
    const discLabel =
      (window.HASHIRA_LIB &&
        window.HASHIRA_LIB.DISCIPLINES_ALL &&
        window.HASHIRA_LIB.DISCIPLINES_ALL.find((d) => d.value === p.discipline)) || null;
    const discText = discLabel ? discLabel.label : p.discipline;
    host.innerHTML = `
      <p style="margin:0 0 8px;font-weight:900">${escapeHtml(p.name)}</p>
      <p class="hint" style="margin:0 0 10px;line-height:1.45">${escapeHtml(p.goal)}</p>
      <p class="hint" style="margin:0">Primary discipline: <strong>${escapeHtml(discText)}</strong></p>
    `;
  }

  function initOnboardingUi() {
    const btn = document.getElementById('onboard-start-btn');
    const nameEl = document.getElementById('onboard-name');
    const goalEl = document.getElementById('onboard-goal');
    const discEl = document.getElementById('onboard-discipline');
    const errEl = document.getElementById('onboard-error');
    const lib = window.HASHIRA_LIB;
    if (!btn || !nameEl || !goalEl || !discEl || !lib || !lib.DISCIPLINES_ALL) return;

    discEl.innerHTML = '';
    lib.DISCIPLINES_ALL.forEach((item) => {
      const o = document.createElement('option');
      o.value = item.value;
      o.textContent = item.label;
      discEl.appendChild(o);
    });

    const existing = load();
    if (existing) {
      if (existing.name) nameEl.value = existing.name;
      if (existing.goal) goalEl.value = existing.goal;
      if (lib.DISCIPLINES_ALL.some((d) => d.value === existing.discipline)) discEl.value = existing.discipline;
    }

    btn.addEventListener('click', () => {
      if (errEl) {
        errEl.textContent = '';
        errEl.classList.add('hidden');
      }
      const name = nameEl.value.trim();
      const goal = goalEl.value.trim();
      const discipline = discEl.value;
      if (!name) {
        if (errEl) {
          errEl.textContent = 'Please enter your name.';
          errEl.classList.remove('hidden');
        }
        nameEl.focus();
        return;
      }
      if (!goal) {
        if (errEl) {
          errEl.textContent = 'Please enter your training goal.';
          errEl.classList.remove('hidden');
        }
        goalEl.focus();
        return;
      }
      if (!discipline || !lib.DISCIPLINES_ALL.some((d) => d.value === discipline)) {
        if (errEl) {
          errEl.textContent = 'Please choose a discipline.';
          errEl.classList.remove('hidden');
        }
        discEl.focus();
        return;
      }

      save({ name, goal, discipline });
      applyDisciplineToApp(discipline);
      renderProfileSummary();
      window.location.hash = '#home';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOnboardingUi);
  } else {
    initOnboardingUi();
  }

  window.HASHIRA_USER_PROFILE = {
    STORAGE_KEY,
    load,
    save,
    isComplete,
    applyDisciplineToApp,
    renderProfileSummary
  };
})();
