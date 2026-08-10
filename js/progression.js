(function(){
  const STORAGE_KEY = 'hashira_progression_v1';
  const LS = window.HASHIRA_LS || {
    getItem: function (k) { return localStorage.getItem(k); },
    setItem: function (k, v) { localStorage.setItem(k, v); },
    removeItem: function (k) { localStorage.removeItem(k); }
  };

  function defaultData() {
    return {
      version: 1,
      sessions: {},
      personalBests: {},
      summaries: {
        totalSessions: 0,
        totalReps: 0,
        totalHoldSeconds: 0,
        longestStreak: 0,
        lastXpEarned: 0,
        lastPbMessage: ''
      }
    };
  }

  function loadRaw() {
    try {
      const raw = LS.getItem(STORAGE_KEY);
      if (!raw) return defaultData();
      const p = JSON.parse(raw);
      if (!p || typeof p !== 'object') return defaultData();
      return migrate(p);
    } catch (_) {
      return defaultData();
    }
  }

  function migrate(p) {
    const sessions = (p.sessions && typeof p.sessions === 'object') ? p.sessions : {};
    const personalBests = (p.personalBests && typeof p.personalBests === 'object')
      ? p.personalBests
      : (p.progressPBs && typeof p.progressPBs === 'object' ? p.progressPBs : {});
    const s0 = (p.summaries && typeof p.summaries === 'object') ? p.summaries : {};
    const summaries = {
      totalSessions: Number(s0.totalSessions) || 0,
      totalReps: Number(s0.totalReps) || 0,
      totalHoldSeconds: Number(s0.totalHoldSeconds) || 0,
      longestStreak: Number(s0.longestStreak) || 0,
      lastXpEarned: Number(s0.lastXpEarned) || 0,
      lastPbMessage: typeof s0.lastPbMessage === 'string' ? s0.lastPbMessage : ''
    };
    return { version: 1, sessions, personalBests, summaries };
  }

  function persist(data) {
    try {
      LS.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  function getInt(id, fallback = 0) {
    const v = parseInt(getVal(id), 10);
    return Number.isFinite(v) ? v : fallback;
  }

  function countChecklistChecked() {
    const root = document.getElementById('checklist-container');
    if (!root) return 0;
    let n = 0;
    root.querySelectorAll('.checklist-check').forEach((c) => {
      if (c.checked) n++;
    });
    return n;
  }

  function qualityXp(q) {
    if (q === 'rough') return 4;
    if (q === 'sharp') return 16;
    return 10;
  }

  function readQualityFromDom() {
    const el = document.querySelector('input[name="prog-quality"]:checked');
    const v = el && el.value ? String(el.value).toLowerCase() : 'solid';
    if (v === 'rough' || v === 'sharp' || v === 'solid') return v;
    return 'solid';
  }

  /**
   * XP for one saved session log (does not include per-step timer XP).
   */
  function computeSessionXp(opts) {
    const completed = !!opts.completed;
    const checklistCount = Math.max(0, Math.floor(Number(opts.checklistCount) || 0));
    const roundsCompleted = Math.max(0, Math.floor(Number(opts.roundsCompleted) || 0));
    const quality = opts.quality || 'solid';
    const effort = Math.min(5, Math.max(1, Math.floor(Number(opts.effort) || 3)));
    const totalReps = Math.max(0, Math.floor(Number(opts.totalReps) || 0));
    const totalHoldSeconds = Math.max(0, Math.floor(Number(opts.totalHoldSeconds) || 0));
    const streak = Math.max(0, Math.floor(Number(opts.streak) || 0));

    let xp = completed ? 40 : 10;
    xp += checklistCount * 3;
    xp += roundsCompleted * 5;
    xp += qualityXp(quality);
    xp += effort * 2;
    xp += Math.floor(totalReps / 12);
    xp += Math.floor(totalHoldSeconds / 20);
    xp += Math.min(20, streak * 2);
    return Math.max(0, Math.floor(xp));
  }

  function pbKey(discipline, dayType) {
    return `${discipline || 'na'}:${dayType || 'na'}`;
  }

  /**
   * @returns {{ hit: boolean, messages: string[] }}
   */
  function updatePersonalBests(data, discipline, dayType, entry) {
    const key = pbKey(discipline, dayType);
    const prev = data.personalBests[key] || {};
    const messages = [];
    let hit = false;

    const reps = Math.max(0, Math.floor(Number(entry.totalReps) || 0));
    const hold = Math.max(0, Math.floor(Number(entry.totalHoldSeconds) || 0));
    const rounds = Math.max(0, Math.floor(Number(entry.roundsCompleted) || 0));
    const day = entry.savedAt || entry.dateKey || '';

    if (!entry.completed) {
      return { hit: false, messages: [] };
    }

    const next = {
      bestReps: Math.max(Number(prev.bestReps) || 0, reps),
      bestHoldSeconds: Math.max(Number(prev.bestHoldSeconds) || 0, hold),
      bestRoundsCompleted: Math.max(Number(prev.bestRoundsCompleted) || 0, rounds),
      bestDate: prev.bestDate || ''
    };

    if (reps > (Number(prev.bestReps) || 0)) {
      hit = true;
      messages.push(`New PB — reps (${reps})`);
      next.bestDate = day;
    }
    if (hold > (Number(prev.bestHoldSeconds) || 0)) {
      hit = true;
      messages.push(`New PB — hold (${hold}s)`);
      next.bestDate = day;
    }
    if (rounds > (Number(prev.bestRoundsCompleted) || 0)) {
      hit = true;
      messages.push(`New PB — rounds done (${rounds})`);
      next.bestDate = day;
    }

    data.personalBests[key] = {
      bestReps: next.bestReps,
      bestHoldSeconds: next.bestHoldSeconds,
      bestRoundsCompleted: next.bestRoundsCompleted,
      bestDate: next.bestDate || day
    };

    return { hit, messages };
  }

  function rebuildSummaries(data) {
    const sessions = data.sessions;
    let totalReps = 0;
    let totalHold = 0;
    let n = 0;
    Object.keys(sessions).forEach((k) => {
      const e = sessions[k];
      if (!e || typeof e !== 'object') return;
      n++;
      totalReps += Math.max(0, Math.floor(Number(e.totalReps) || 0));
      totalHold += Math.max(0, Math.floor(Number(e.totalHoldSeconds) || 0));
    });
    data.summaries.totalSessions = n;
    data.summaries.totalReps = totalReps;
    data.summaries.totalHoldSeconds = totalHold;
  }

  function mondayKey(d) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() - day);
    return x.toISOString().split('T')[0];
  }

  /** Monday ISO date string → Set of 7 day keys Mon–Sun (local). */
  function weekRangeKeys(anchor) {
    const start = new Date(anchor + 'T12:00:00');
    const out = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      out.push(d.toISOString().split('T')[0]);
    }
    return new Set(out);
  }

  function weekStats(data, now = new Date()) {
    const mon = mondayKey(now);
    const keys = weekRangeKeys(mon);
    let completed = 0;
    let reps = 0;
    let hold = 0;
    Object.keys(data.sessions).forEach((k) => {
      if (!keys.has(k)) return;
      const e = data.sessions[k];
      if (e && e.completed) completed++;
      if (e) {
        reps += Math.max(0, Math.floor(Number(e.totalReps) || 0));
        hold += Math.max(0, Math.floor(Number(e.totalHoldSeconds) || 0));
      }
    });
    return { completed, reps, hold };
  }

  function renderHomeSnapshot() {
    const host = document.getElementById('progress-home-body');
    if (!host) return;
    const data = loadRaw();
    const w = weekStats(data);
    const s = data.summaries;
    const lastXp = Number(s.lastXpEarned) || 0;
    const pbLine = (s.lastPbMessage && String(s.lastPbMessage).trim())
      ? `<div class="progress-snapshot-pb">${escapeHtml(s.lastPbMessage)}</div>`
      : '<div class="progress-snapshot-pb text-dim">Beat a prior best on a completed log to show the latest PB line here.</div>';

    host.innerHTML = `
      <div class="progress-snapshot-grid-inner">
        <div class="progress-snapshot-item"><span class="text-dim">Sessions (week)</span><strong>${w.completed}</strong></div>
        <div class="progress-snapshot-item"><span class="text-dim">Reps (week)</span><strong>${w.reps}</strong></div>
        <div class="progress-snapshot-item"><span class="text-dim">Hold (week)</span><strong>${w.hold}s</strong></div>
        <div class="progress-snapshot-item"><span class="text-dim">Last log XP</span><strong>${lastXp >= 0 ? (lastXp > 0 ? '+' + lastXp : String(lastXp)) : '0'}</strong></div>
      </div>
      ${pbLine}
    `;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function computeTotalsFromSessions(data) {
    const sessions = data.sessions;
    let totalReps = 0;
    let totalHold = 0;
    let n = 0;
    Object.keys(sessions).forEach((k) => {
      const e = sessions[k];
      if (!e || typeof e !== 'object') return;
      n++;
      totalReps += Math.max(0, Math.floor(Number(e.totalReps) || 0));
      totalHold += Math.max(0, Math.floor(Number(e.totalHoldSeconds) || 0));
    });
    return { totalSessions: n, totalReps, totalHoldSeconds: totalHold };
  }

  function renderProfileSection() {
    const host = document.getElementById('progress-profile-body');
    if (!host) return;
    const data = loadRaw();
    const totals = computeTotalsFromSessions(data);
    const s = data.summaries;
    const sessionsSorted = Object.keys(data.sessions).sort().reverse().slice(0, 7);

    const recent = sessionsSorted.map((k) => {
      const e = data.sessions[k] || {};
      const done = e.completed ? 'Done' : 'Partial';
      return `<div class="progress-recent-row"><span class="progress-recent-date">${escapeHtml(k)}</span><span class="progress-recent-main">${escapeHtml(e.discipline || '')} · ${escapeHtml(e.dayType || '')}</span><span class="progress-recent-xp">${done} · +${Number(e.xpEarned) || 0} XP</span></div>`;
    }).join('') || '<div class="hint">No saved sessions yet.</div>';

    const pbs = Object.keys(data.personalBests).sort().map((k) => {
      const p = data.personalBests[k];
      return `<div class="progress-pb-row"><strong>${escapeHtml(k)}</strong><span class="text-dim">reps ${p.bestReps || 0} · hold ${p.bestHoldSeconds || 0}s · rounds ${p.bestRoundsCompleted || 0} · ${escapeHtml(p.bestDate || '—')}</span></div>`;
    }).join('') || '<div class="hint">No PBs yet.</div>';

    host.innerHTML = `
      <div class="progress-profile-stats field-grid">
        <div><span class="text-dim">Total sessions</span><div class="progress-stat-num">${totals.totalSessions}</div></div>
        <div><span class="text-dim">Total reps</span><div class="progress-stat-num">${totals.totalReps}</div></div>
        <div><span class="text-dim">Total hold</span><div class="progress-stat-num">${totals.totalHoldSeconds}s</div></div>
        <div><span class="text-dim">Longest streak</span><div class="progress-stat-num">${Number(s.longestStreak) || 0}</div></div>
      </div>
      <div class="card-title" style="margin-top:14px">Recent sessions</div>
      <div class="progress-recent-list">${recent}</div>
      <div class="card-title" style="margin-top:14px">Personal bests</div>
      <div class="progress-pb-list">${pbs}</div>
    `;
  }

  function refreshSnapshots() {
    try {
      if (window.HASHIRA_ROUTER && typeof window.HASHIRA_ROUTER.getRouteFromHash === 'function') {
        if (window.HASHIRA_ROUTER.getRouteFromHash() === 'train') prefillRoundsCompleted();
      }
    } catch (_) {}
    renderHomeSnapshot();
    renderProfileSection();
  }

  function showSaveFeedback(payload) {
    const backdrop = document.getElementById('session-result-modal');
    const body = document.getElementById('session-result-modal-body');
    if (!backdrop || !body) return;
    const net = Number(payload.netXp);
    const netStr = (net >= 0 ? '+' : '') + net;
    body.innerHTML = `
      <div class="modal-result-xp"><span class="modal-result-xp-num">${escapeHtml(netStr)}</span><span class="modal-result-xp-label">XP this save</span></div>
      <div class="modal-result-sub">Day log total: <strong>${escapeHtml(String(payload.xpEarned))}</strong> XP</div>
      <div class="modal-result-row modal-result-row--streak">${escapeHtml(payload.streakLine)}</div>
      <div class="modal-result-row modal-result-row--pb">${escapeHtml(payload.pbLine)}</div>
    `;
    backdrop.style.display = 'flex';
    backdrop.classList.remove('modal-result--open');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        backdrop.classList.add('modal-result--open');
      });
    });
  }

  function hideSaveFeedback() {
    const backdrop = document.getElementById('session-result-modal');
    if (!backdrop) return;
    backdrop.classList.remove('modal-result--open');
    backdrop.style.display = 'none';
  }

  function saveSessionLog() {
    const stateApi = window.HASHIRA_STATE;
    if (!stateApi || !stateApi.state) {
      alert('App not ready.');
      return;
    }
    const state = stateApi.state;
    const getTodayKey = stateApi.getTodayKey;
    const dayKey = getTodayKey();

    const athleteEl = document.getElementById('athlete-select');
    const discEl = document.getElementById('discipline-select');
    const lvlEl = document.getElementById('level-select');
    const dayTypeEl = document.getElementById('day-type-select');
    const roundsPlannedEl = document.getElementById('rounds-input');

    const athlete = athleteEl ? athleteEl.value : '';
    const discipline = discEl ? discEl.value : '';
    const level = lvlEl ? lvlEl.value : '';
    const dayType = dayTypeEl ? dayTypeEl.value : '';
    const roundsPlanned = roundsPlannedEl ? (parseInt(roundsPlannedEl.value, 10) || 0) : 0;

    const completed = getVal('prog-completed') === '1';
    const effort = Math.min(5, Math.max(1, getInt('prog-effort', 3)));
    const quality = readQualityFromDom();
    const totalReps = Math.max(0, getInt('prog-reps', 0));
    const totalHoldSeconds = Math.max(0, getInt('prog-hold', 0));
    const roundsCompleted = Math.max(0, getInt('prog-rounds-done', 0));
    let notes = '';
    const notesEl = document.getElementById('prog-notes');
    if (notesEl && notesEl.value) notes = String(notesEl.value).trim().slice(0, 500);

    const totalChecklistChecked = countChecklistChecked();
    const streakBefore = Math.max(0, Math.floor(Number(state.streak) || 0));

    const data = loadRaw();
    const prev = data.sessions[dayKey];
    const oldXp = prev && Number.isFinite(Number(prev.xpEarned)) ? Math.max(0, Math.floor(prev.xpEarned)) : 0;

    state.xp = Math.max(0, Math.floor(Number(state.xp) || 0) - oldXp);

    const newXp = computeSessionXp({
      completed,
      checklistCount: totalChecklistChecked,
      roundsCompleted,
      quality,
      effort,
      totalReps,
      totalHoldSeconds,
      streak: streakBefore
    });

    state.xp += newXp;
    try {
      LS.setItem('xp', String(state.xp));
    } catch (_) {}

    const entry = {
      dateKey: dayKey,
      savedAt: dayKey,
      athlete,
      discipline,
      level,
      dayType,
      completed,
      effort,
      quality,
      roundsPlanned,
      roundsCompleted,
      totalReps,
      totalHoldSeconds,
      totalChecklistChecked,
      xpEarned: newXp,
      notes
    };

    data.sessions[dayKey] = entry;

    const pbResult = updatePersonalBests(data, discipline, dayType, entry);
    rebuildSummaries(data);

    data.summaries.longestStreak = Math.max(
      Number(data.summaries.longestStreak) || 0,
      streakBefore
    );

    const netXp = newXp - oldXp;
    data.summaries.lastXpEarned = netXp;
    data.summaries.lastPbMessage = pbResult.messages.length ? pbResult.messages.join(' · ') : '';

    persist(data);

    if (typeof window.updateStats === 'function') window.updateStats();
    if (typeof window.updateQuests === 'function') window.updateQuests();

    const streakLine = completed
      ? `Streak at save: ${streakBefore} day(s). Mark Today Done on Home still controls the calendar streak.`
      : `Partial session — calendar streak is unchanged by this log alone.`;

    const pbLine = pbResult.messages.length ? pbResult.messages.join(' · ') : 'No new PB this save.';

    showSaveFeedback({
      xpEarned: newXp,
      netXp,
      streakLine,
      pbLine
    });

    refreshSnapshots();
  }

  function getExportPayload() {
    return loadRaw();
  }

  function prefillRoundsCompleted() {
    const out = document.getElementById('prog-rounds-done');
    const src = document.getElementById('round-count');
    if (!out || !src) return;
    if (String(out.value).trim() !== '') return;
    const m = (src.textContent || '').match(/Round\s+(\d+)/i);
    if (m) out.value = m[1];
  }

  window.HASHIRA_PROGRESSION = {
    STORAGE_KEY,
    loadRaw,
    computeSessionXp,
    saveSessionLog,
    refreshSnapshots,
    renderHomeSnapshot,
    renderProfileSection,
    getExportPayload,
    prefillRoundsCompleted,
    hideSaveFeedback
  };

  window.saveHashiraProgressLog = saveSessionLog;

  const sessionResultModal = document.getElementById('session-result-modal');
  if (sessionResultModal) {
    sessionResultModal.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'session-result-modal') hideSaveFeedback();
    });
  }
})();
