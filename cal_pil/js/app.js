(function(){
  const { RANKS, VERSES, DISCIPLINES_MOISE, DISCIPLINES_HER, DAY_TYPES, CAT, LIB } = window.HASHIRA_LIB;
  const { state, getTodayKey, yesterdayKey } = window.HASHIRA_STATE;
  const Timer = window.HASHIRA_TIMER;

  let lastManualTimingEditAt = 0;
  let generationNonce = 0;
  function markManualTimingEdit(){ lastManualTimingEditAt = Date.now(); }
  function shouldAutoApplyTimings(){ return (Date.now() - lastManualTimingEditAt) > 8000; }

  function tutorialLink(step, discipline) {
    if (step?.url) return step.url;
    const name = step?.name || 'exercise';
    const query = `${discipline || 'training'} ${name} tutorial`;
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  }

  function fillSelect(selectEl, items, selectedValue) {
    selectEl.innerHTML = '';
    items.forEach((it) => {
      const opt = document.createElement('option');
      opt.value = it.value;
      opt.textContent = it.label;
      if (selectedValue && selectedValue === it.value) opt.selected = true;
      selectEl.appendChild(opt);
    });
  }

  function getSVG(key) {
    const wrap = (inner) => `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="200" height="140" rx="14" fill="#ffffff"/>${inner}</svg>`;
    const b64 = (s) => `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(s)))}`;
    const txt = (t) => `<text x="14" y="22" font-size="12" font-family="system-ui" fill="#111827">${t}</text>`;
    const ground = '<line x1="16" y1="115" x2="184" y2="115" stroke="#111827" stroke-width="3" opacity="0.25"/>';
    const head = (x,y) => `<circle cx="${x}" cy="${y}" r="8" fill="#111827"/>`;
    const line = (x1,y1,x2,y2,w=5,op=1) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#111827" stroke-width="${w}" stroke-linecap="round" opacity="${op}"/>`;

    const DIAG = {
      rest: wrap(`${txt('REST')}${ground}<circle cx="100" cy="70" r="34" stroke="#111827" stroke-width="4" fill="none" opacity="0.25"/>${line(100,70,100,52,4,0.6)}${line(100,70,118,70,4,0.6)}`),
      warm: wrap(`${txt('WARMUP')}${ground}${head(100,40)}${line(100,48,100,86,5)}${line(100,60,68,72,5)}${line(100,60,132,72,5)}${line(100,86,78,112,5)}${line(100,86,122,112,5)}`),
      p_std: wrap(`${txt('PUSH / PRESS')}${ground}${head(55,64)}${line(63,68,110,78,5)}${line(110,78,155,86,5)}${line(112,80,96,108,5)}${line(96,108,86,112,5)}${line(140,84,132,112,5)}`),
      p_up: wrap(`${txt('PULL')}${line(40,30,160,30,8,0.25)}${head(100,52)}${line(100,60,100,92,5)}${line(100,64,78,38,5)}${line(100,64,122,38,5)}${line(100,92,86,114,5)}${line(100,92,114,114,5)}`),
      sq_std: wrap(`${txt('LOWER')}${ground}${head(100,36)}${line(100,44,100,76,5)}${line(100,56,78,64,5)}${line(100,56,122,64,5)}${line(100,76,82,108,5)}${line(100,76,118,108,5)}`),
      plnk: wrap(`${txt('CORE')}${ground}${head(55,64)}${line(63,68,110,78,5)}${line(110,78,155,86,5)}${line(112,80,96,108,5)}${line(96,108,86,112,5)}`)
    };

    const fallback = wrap(`${txt('EXERCISE')}${ground}${head(100,45)}${line(100,53,100,92,5)}${line(100,62,78,74,5)}${line(100,62,122,74,5)}${line(100,92,84,112,5)}${line(100,92,116,112,5)}`);
    return b64(DIAG[key] || fallback);
  }

  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function() {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^= (h >>> 16)) >>> 0;
    };
  }

  function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seededShuffle(arr, seedStr) {
    const seed = xmur3(seedStr)();
    const rand = mulberry32(seed);
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function suggestedRestSeconds(discipline, level, category) {
    const base = {
      calisthenics: { beginner: 50, intermediate: 65, advanced: 80 },
      gym: { beginner: 80, intermediate: 95, advanced: 125 },
      breakdance: { beginner: 45, intermediate: 60, advanced: 75 },
      parkour: { beginner: 60, intermediate: 75, advanced: 90 },
      pilates: { beginner: 30, intermediate: 35, advanced: 40 }
    };
    let v = base[discipline] ? base[discipline][level] : 60;
    if (category === CAT.PREHAB) v = Math.max(20, v - 15);
    if (category === CAT.SKILL) v = Math.max(20, v - 10);
    if (category === CAT.POWER) v = v + 25;
    if (category === CAT.STRENGTH && discipline === 'gym') v = v + 35;
    if (discipline === 'pilates') v = Math.min(55, Math.max(20, v));
    return v;
  }

  function applySuggestedTimings(force = false) {
    if (!force && !shouldAutoApplyTimings()) return;

    const discipline = document.getElementById('discipline-select').value;
    const level = document.getElementById('level-select').value;
    const joint = document.getElementById('joint-status').value;
    const autoLoad = document.getElementById('auto-load').value;
    if (autoLoad !== 'on') return;

    let work;
    let rest;
    let rr;

    if (discipline === 'pilates') {
      work = (level === 'beginner' ? 45 : level === 'intermediate' ? 50 : 55);
      rest = suggestedRestSeconds(discipline, level, CAT.SKILL);
      rr = (level === 'beginner' ? 70 : level === 'intermediate' ? 80 : 90);
    } else if (discipline === 'gym') {
      work = (level === 'beginner' ? 75 : level === 'intermediate' ? 85 : 95);
      rest = suggestedRestSeconds(discipline, level, CAT.HYPER);
      rr = (level === 'beginner' ? 130 : level === 'intermediate' ? 160 : 190);
    } else if (discipline === 'breakdance') {
      work = (level === 'beginner' ? 50 : level === 'intermediate' ? 55 : 60);
      rest = suggestedRestSeconds(discipline, level, CAT.HYPER);
      rr = (level === 'beginner' ? 95 : level === 'intermediate' ? 110 : 130);
    } else if (discipline === 'parkour') {
      work = (level === 'beginner' ? 55 : level === 'intermediate' ? 60 : 65);
      rest = suggestedRestSeconds(discipline, level, CAT.SKILL);
      rr = (level === 'beginner' ? 110 : level === 'intermediate' ? 130 : 150);
    } else {
      work = (level === 'beginner' ? 45 : level === 'intermediate' ? 50 : 55);
      rest = suggestedRestSeconds(discipline, level, CAT.HYPER);
      rr = (level === 'beginner' ? 95 : level === 'intermediate' ? 110 : 130);
    }

    if (joint === 'mod') { work = Math.max(30, work - 6); rest = rest + 8; rr = rr + 10; }
    if (joint === 'high') { work = Math.max(25, work - 10); rest = rest + 15; rr = rr + 20; }

    document.getElementById('work-input').value = work;
    document.getElementById('rest-input').value = rest;
    document.getElementById('round-rest-input').value = rr;
  }

  function currentEquipMode(discipline) {
    if (discipline === 'gym') return document.getElementById('equip-gym').value;
    if (discipline === 'calisthenics') return document.getElementById('equip-cali').value;
    if (discipline === 'breakdance') return document.getElementById('equip-bd').value;
    if (discipline === 'pilates') return document.getElementById('equip-pil').value;
    return 'full';
  }

  function showEquipUI() {
    const discipline = document.getElementById('discipline-select').value;
    document.getElementById('equip-gym-wrap').classList.toggle('hidden', discipline !== 'gym');
    document.getElementById('equip-cali-wrap').classList.toggle('hidden', discipline !== 'calisthenics');
    document.getElementById('equip-bd-wrap').classList.toggle('hidden', discipline !== 'breakdance');
    document.getElementById('equip-pil-wrap').classList.toggle('hidden', discipline !== 'pilates');
  }

  function canDoExercise(step, discipline, equipMode) {
    if (discipline === 'pilates') {
      if (!step.equip || !step.equip.length) return true;
      if (equipMode === 'mat') return step.equip.every((t) => t === 'mat');
      if (equipMode === 'props') return step.equip.every((t) => t === 'mat' || t === 'props');
      return true;
    }

    if (discipline === 'breakdance' && equipMode === 'wristsafe') {
      const n = (step.name || '').toLowerCase();
      const risky = ['freeze', 'airchair', 'hollowback', 'planche', 'power', 'explosive', 'plyo', 'wrist'];
      if (risky.some((x) => n.includes(x))) return false;
    }

    if (discipline === 'calisthenics') {
      const req = step.equip || [];
      if (!req.length) return true;
      if (equipMode === 'none') return req.every((t) => t === 'bw');
      if (equipMode === 'bar') return req.every((t) => t === 'bw' || t === 'bar');
      if (equipMode === 'rings') return req.every((t) => t === 'bw' || t === 'rings');
    }

    if (discipline === 'gym') {
      const req = step.equip || [];
      if (!req.length) return true;
      if (equipMode === 'full') return true;
      if (equipMode === 'db' || equipMode === 'minimal') return req.every((t) => t === 'db' || t === 'bw');
      if (equipMode === 'machines') return req.every((t) => t === 'machine' || t === 'bw');
    }

    return true;
  }

  function swapExercise(step, discipline, equipMode) {
    if (!step) return step;
    if (canDoExercise(step, discipline, equipMode)) return step;
    if (step.swaps && step.swaps[equipMode]) return step.swaps[equipMode];

    if (discipline === 'gym') {
      if (equipMode === 'db' || equipMode === 'minimal') return { key:'p_std', name:'Dumbbell Variation (fallback)', note:'3-4 x 8-12', tag:step.tag, cat:step.cat, equip:['db'] };
      if (equipMode === 'machines') return { key:'p_std', name:'Machine Variation (fallback)', note:'3-4 x 10-15', tag:step.tag, cat:step.cat, equip:['machine'] };
    }
    if (discipline === 'calisthenics') return { key:'plnk', name:'Bodyweight Alternative', note:'3-4 clean sets', tag:step.tag, cat:step.cat, equip:['bw'] };
    if (discipline === 'breakdance') return { key:'plnk', name:'Footwork / Groove Alternative', note:'30-45s quality', tag:step.tag, cat:CAT.SKILL };
    if (discipline === 'pilates') return { key:'plnk', name:'Pilates Core Control (fallback)', note:'30-45s clean control', tag:step.tag, cat:CAT.SKILL, equip:['mat'] };
    return step;
  }

  function applyEquipmentToList(list, discipline, equipMode) {
    const out = [];
    for (const step of list) {
      const replaced = swapExercise(step, discipline, equipMode);
      if (canDoExercise(replaced, discipline, equipMode)) out.push(replaced);
    }
    if (!out.length && list.length) out.push(list[0]);
    return out;
  }

  function pickLib(ath, discipline, lvl, day) {
    return LIB?.[ath]?.[discipline]?.[lvl]?.[day] || LIB?.moise?.[discipline]?.[lvl]?.[day] || [];
  }

  function smartPick(base, discipline, lvl, day, seedKey) {
    if (!base || base.length === 0) return [];

    const desired = (discipline === 'gym')
      ? (lvl === 'beginner' ? 3 : 4)
      : (discipline === 'breakdance')
        ? 3
        : (discipline === 'parkour')
          ? 4
        : (discipline === 'pilates')
          ? 4
          : (lvl === 'beginner' ? 3 : lvl === 'intermediate' ? 4 : 3);

    const equipMode = currentEquipMode(discipline);
    const safeBase = applyEquipmentToList(base.slice(), discipline, equipMode);

    const histMode = document.getElementById('history-mode').value;
    const histKey = `history_${discipline}_${lvl}_${day}_${equipMode}`;
    const yKey = yesterdayKey();
    const hist = JSON.parse(localStorage.getItem(histKey) || '{}');
    const yesterdayKeys = hist?.[yKey] || [];

    let filtered = safeBase.slice();
    if (histMode === 'on' && yesterdayKeys.length) {
      filtered = filtered.filter((s) => !yesterdayKeys.includes(s.key + '|' + s.name));
      if (filtered.length < Math.min(desired, safeBase.length)) filtered = safeBase.slice();
    }

    const shuffled = seededShuffle(filtered, seedKey);
    const pick = shuffled.slice(0, Math.min(desired, shuffled.length));

    const tKey = getTodayKey();
    hist[tKey] = pick.map((s) => (s.key + '|' + s.name));
    const keys = Object.keys(hist).sort();
    while (keys.length > 10) {
      const k = keys.shift();
      delete hist[k];
    }
    localStorage.setItem(histKey, JSON.stringify(hist));
    return pick;
  }

  function cuePack(step) {
    const cat = step?.cat || CAT.SKILL;
    const base = {
      cues: ['Move with control', 'Own your range', 'Stop if sharp pain'],
      mistakes: ['Rushing', 'Half reps', 'Holding breath'],
      breath: 'Steady breathing',
      tempo: 'Controlled'
    };

    if (cat === CAT.STRENGTH) {
      base.cues = ['Brace hard', 'Explode up (clean)', 'Full control down'];
      base.mistakes = ['Loose brace', 'Bouncing', 'Cheating depth'];
      base.breath = 'Brace + strong exhale';
      base.tempo = '2-3 down, strong up';
    } else if (cat === CAT.POWER) {
      base.cues = ['High quality reps', 'Rest enough', 'Soft landings'];
      base.mistakes = ['Slamming joints', 'Too tired = sloppy', 'No rest'];
      base.breath = 'Short exhale on burst';
      base.tempo = 'Explosive, then reset';
    } else if (cat === CAT.PREHAB) {
      base.cues = ['Slow tempo', 'Perfect form', 'Light resistance'];
      base.mistakes = ['Too heavy', 'Pain chasing', 'Rushing'];
      base.breath = 'Slow nasal';
      base.tempo = '3 down, 1 up';
    } else if (document.getElementById('discipline-select').value === 'pilates') {
      base.cues = ['Long spine', 'Ribs down', 'Pelvis neutral (unless exercise says otherwise)'];
      base.mistakes = ['Neck tension', 'Rushing reps', 'Holding breath'];
      base.breath = 'Inhale prepare, exhale exert';
      base.tempo = 'Smooth + precise';
    }

    return { title: step?.name || 'Form', cat, ...base };
  }

  function renderCoach(step) {
    const lvl = document.getElementById('level-select').value;
    const discipline = document.getElementById('discipline-select').value;
    const equipMode = currentEquipMode(discipline);
    const tag = step?.tag || '-';
    const pack = cuePack(step);

    document.getElementById('coach-title').innerText = pack.title;
    document.getElementById('coach-tag').innerText = `${discipline.toUpperCase()} • ${tag} • ${lvl.toUpperCase()} • ${equipMode}`;
    document.getElementById('coach-cat').innerText = pack.cat;
    document.getElementById('coach-breath').innerText = pack.breath;
    document.getElementById('coach-tempo').innerText = pack.tempo;

    document.getElementById('coach-cues').innerHTML = pack.cues.map((x) => `<li>${x}</li>`).join('');
    document.getElementById('coach-mistakes').innerHTML = pack.mistakes.map((x) => `<li>${x}</li>`).join('');
  }

  function updateDisciplineOptions() {
    const athlete = document.getElementById('athlete-select').value;
    const discSel = document.getElementById('discipline-select');

    const prev = localStorage.getItem('discipline') || discSel.value;
    const list = (athlete === 'her') ? DISCIPLINES_HER : DISCIPLINES_MOISE;

    let next = prev;
    if (!list.some((x) => x.value === prev)) next = list[0].value;

    fillSelect(discSel, list, next);
    localStorage.setItem('discipline', discSel.value);

    showEquipUI();
    updateDayTypeOptions();
    renderPlanBuilder();
    generateChecklist();
    saveSettings();
  }

  function toggleAthleteTheme() {
    const val = document.getElementById('athlete-select').value;
    if (val === 'her') document.body.classList.add('theme-her');
    else document.body.classList.remove('theme-her');
    updateDisciplineOptions();
  }

  function updateDayTypeOptions() {
    const discipline = document.getElementById('discipline-select').value;
    const daySel = document.getElementById('day-type-select');
    const current = localStorage.getItem('dayType') || daySel.value;

    const list = DAY_TYPES[discipline] || DAY_TYPES.calisthenics;
    const exists = list.some((x) => x.value === current);
    fillSelect(daySel, list, exists ? current : list[0].value);

    localStorage.setItem('dayType', daySel.value);
  }

  function planKey() {
    const discipline = document.getElementById('discipline-select').value;
    return `weeklyPlan_${discipline}`;
  }

  function defaultPlanForDiscipline(discipline) {
    if (discipline === 'pilates') return ['core','mobility','glutes','full','lower'];
    if (discipline === 'breakdance') return ['toprock','footwork','freezes','power','conditioning'];
    if (discipline === 'parkour') return ['landing','vaults','jumps','flow','mobility'];
    if (discipline === 'gym') return ['upper','lower','push','pull','conditioning'];
    return ['push','pull','legs','skill','conditioning'];
  }

  function renderPlanBuilder() {
    const container = document.getElementById('plan-builder-ui');
    const discipline = document.getElementById('discipline-select').value;
    const dayOptions = DAY_TYPES[discipline] || DAY_TYPES.calisthenics;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const saved = JSON.parse(localStorage.getItem(planKey()) || 'null') || defaultPlanForDiscipline(discipline);

    container.innerHTML = '';
    days.forEach((d, i) => {
      const selectId = `plan-day-${i}`;
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';
      row.style.marginBottom = '6px';
      row.style.gap = '10px';

      const label = document.createElement('span');
      label.style.fontSize = '.82rem';
      label.textContent = d;

      const sel = document.createElement('select');
      sel.id = selectId;
      sel.style.width = '160px';
      sel.style.fontSize = '.82rem';

      dayOptions.forEach((opt) => {
        const o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.label;
        if (saved[i] === opt.value) o.selected = true;
        sel.appendChild(o);
      });

      row.appendChild(label);
      row.appendChild(sel);
      container.appendChild(row);
    });

    const auto = (localStorage.getItem('autoSync') === 'true');
    document.getElementById('auto-sync-day').checked = auto;
    if (auto) {
      const todayIdx = (new Date().getDay() + 6) % 7;
      if (todayIdx < 5) {
        const sel = document.getElementById(`plan-day-${todayIdx}`);
        if (sel) document.getElementById('day-type-select').value = sel.value;
      }
    }
  }

  function useTodaysPlan() {
    const todayIdx = (new Date().getDay() + 6) % 7;
    if (todayIdx > 4) { alert('Weekend: pick Day Type manually.'); return; }
    const sel = document.getElementById(`plan-day-${todayIdx}`);
    if (!sel) return;
    document.getElementById('day-type-select').value = sel.value;
    localStorage.setItem('dayType', sel.value);
    generateChecklist();
  }

  function resetPlan() {
    localStorage.removeItem(planKey());
    renderPlanBuilder();
    saveSettings();
  }

  function updateStats() {
    document.getElementById('xp-val').innerText = state.xp;
    let rank = RANKS[0].name;
    for (const r of RANKS) if (state.xp >= r.min) rank = r.name;
    document.getElementById('rank-val').innerText = rank;

    const today = getTodayKey();
    const yes = state.doneDays[today] ? 'Yes' : 'No';
    document.getElementById('today-status').innerText = yes;
    document.getElementById('today-status').style.color = state.doneDays[today] ? 'var(--accent)' : 'var(--danger)';

    const dash = document.getElementById('today-dashboard-status');
    if (dash) {
      dash.innerText = state.doneDays[today] ? 'Done' : 'Not Done';
      dash.style.color = state.doneDays[today] ? 'var(--accent)' : 'var(--danger)';
    }
  }

  function calculateStreak() {
    let count = 0;
    const curr = new Date();
    while (true) {
      const key = curr.toISOString().split('T')[0];
      if (state.doneDays[key]) { count++; curr.setDate(curr.getDate() - 1); }
      else {
        if (key === getTodayKey()) { curr.setDate(curr.getDate() - 1); continue; }
        break;
      }
    }
    state.streak = count;
    document.getElementById('streak-val').innerText = count;
  }

  function updateQuests() {
    const quests = [
      {name:'Strength Path', target:5200, note:'Load + reps + recovery'},
      {name:'Skill Path', target:6500, note:'Control + balance + line'},
      {name:'Conditioning Path', target:4200, note:'Work capacity + speed'}
    ];
    const container = document.getElementById('skill-quests-list');
    container.innerHTML = '';
    quests.forEach((q) => {
      const perc = Math.min(100, Math.floor((state.xp / q.target) * 100));
      container.innerHTML += `<div style="margin-bottom:12px; font-size:.85rem"><div style="display:flex; justify-content:space-between; margin-bottom:4px"><strong>${q.name}</strong> <span>${perc}%</span></div><div style="height:6px; background:#30363d; border-radius:3px; overflow:hidden"><div style="height:100%; width:${perc}%; background:var(--primary-blue)"></div></div><div style="font-size:0.75rem; color:var(--text-dim); margin-top:4px">${q.note}</div></div>`;
    });
  }

  function renderCalendarInto(gridId, labelId) {
    const grid = document.getElementById(gridId);
    const label = document.getElementById(labelId);
    if (!grid) return;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayIdx = (new Date().getDay() + 6) % 7;
    grid.innerHTML = '';

    days.forEach((d, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (todayIdx - i));
      const key = date.toISOString().split('T')[0];
      const isDone = state.doneDays[key];
      const tile = document.createElement('div');
      tile.className = `day-tile ${i === todayIdx ? 'today' : ''} ${isDone ? 'done' : ''}`;
      tile.innerHTML = `<div>${d}</div><div style="font-size:1rem">${isDone ? '✅' : '-'}</div><div style="font-size:0.6rem">${date.getDate()}</div>`;
      tile.onclick = () => {
        if (state.doneDays[key]) delete state.doneDays[key];
        else state.doneDays[key] = true;
        localStorage.setItem('doneDays', JSON.stringify(state.doneDays));
        renderCalendar();
        updateStats();
        calculateStreak();
      };
      grid.appendChild(tile);
    });

    if (label) label.innerText = `Week of ${new Date().toLocaleDateString()}`;
  }

  function renderCalendar() {
    renderCalendarInto('calendar-grid', 'week-label');
    renderCalendarInto('calendar-grid-plan', 'week-label-plan');
  }

  function generateChecklist(forceNew = false) {
    const ath = document.getElementById('athlete-select').value;
    const discipline = document.getElementById('discipline-select').value;
    const lvl = document.getElementById('level-select').value;
    const day = document.getElementById('day-type-select').value;

    showEquipUI();
    applySuggestedTimings();

    const equipMode = currentEquipMode(discipline);
    const smart = document.getElementById('smart-select').value === 'on';
    const rounds = parseInt(document.getElementById('rounds-input').value, 10);
    const workCap = parseInt(document.getElementById('work-input').value, 10);
    const roundRest = parseInt(document.getElementById('round-rest-input').value, 10);

    let base = pickLib(ath, discipline, lvl, day);
    base = applyEquipmentToList(base.slice(), discipline, equipMode);

    if (forceNew) generationNonce++;
    const seedKey = `${getTodayKey()}|${ath}|${discipline}|${lvl}|${day}|${equipMode}|${generationNonce}`;
    const picked = smart ? smartPick(base, discipline, lvl, day, seedKey) : base.slice();

    const warmupText =
      discipline === 'pilates' ? '2-4 min: breathing + spine articulation + gentle activation' :
      discipline === 'breakdance' ? '2-4 min: wrists + shoulders + ankles + groove' :
      discipline === 'parkour' ? '4-6 min: ankle + wrist prep + landing mechanics + low hops' :
      discipline === 'gym' ? '3-6 min: joint prep + 1-2 light warm-up sets' :
      '2-4 min: joints + scap + core wake-up';

    const sessionSteps = [
      { key:'warm', name:'Warmup', note:warmupText, tag:'SKILL', cat:CAT.PREHAB, durationSec: Math.max(120, Math.min(360, workCap * 2)) }
    ];

    for (let r = 1; r <= rounds; r++) {
      picked.forEach((s) => {
        const restSuggestion = suggestedRestSeconds(discipline, lvl, s.cat || CAT.HYPER);
        sessionSteps.push({ ...s, durationSec: workCap, note: `${s.note} • Rest ~${restSuggestion}s` });
        sessionSteps.push({ key:'rest', name:'Rest', note:`Breathe + reset • ${restSuggestion}s`, tag:'REST', cat:CAT.PREHAB, durationSec:restSuggestion });
      });
      if (r < rounds) sessionSteps.push({ key:'rest', name:'Round Rest', note:`Longer reset • ${roundRest}s`, tag:'REST', cat:CAT.PREHAB, durationSec:roundRest });
    }

    const finisher = (discipline === 'pilates')
      ? {key:'plnk', name:'Finisher (optional)', note:'Breathwork + gentle core • 30-45s', tag:'SKILL', cat:CAT.SKILL, durationSec:40}
      : (discipline === 'gym')
        ? {key:'plnk', name:'Finisher (optional)', note:'Row/Bike/Sled • 20-45s hard', tag:'WORK', cat:CAT.COND, durationSec:45}
        : (discipline === 'breakdance')
          ? {key:'plnk', name:'Finisher (optional)', note:'Footwork endurance • 30-45s', tag:'WORK', cat:CAT.COND, durationSec:40}
          : (discipline === 'parkour')
            ? {key:'plnk', name:'Finisher (optional)', note:'Precision jump density set • 20-40s', tag:'WORK', cat:CAT.COND, durationSec:40}
          : {key:'plnk', name:'Finisher (optional)', note:'Climbers/Burpees • 30-45s', tag:'WORK', cat:CAT.COND, durationSec:40};

    sessionSteps.push(finisher);
    sessionSteps.push({ key:'rest', name:'Cooldown', note: discipline === 'pilates' ? 'Breathing + spinal decompression 60-90s' : 'Breathing 60-90s • loosen hips/shoulders', tag:'REST', cat:CAT.PREHAB, durationSec:75 });

    const container = document.getElementById('checklist-container');
    container.innerHTML = '<div style="font-size:0.9rem; font-weight:900; margin-bottom:10px">Workout Checklist</div>';

    const persistKey = `check_${ath}_${discipline}_${lvl}_${day}_${equipMode}_${getTodayKey()}`;
    const saved = JSON.parse(localStorage.getItem(persistKey) || '{}');

    sessionSteps.forEach((s, idx) => {
      const div = document.createElement('div');
      div.className = 'checklist-item';
      const tagClass = s.tag === 'WORK' ? 'tag-work' : s.tag === 'SKILL' ? 'tag-skill' : s.tag === 'SHOULDER' ? 'tag-shoulder' : 'tag-rest';

      const moveUrl = tutorialLink(s, discipline);
      div.innerHTML = `<div style="display:flex; align-items:flex-start"><input type="checkbox" id="step-chk-${idx}" ${saved[idx] ? 'checked' : ''} style="transform: translateY(2px);" class="checklist-check"><div style="margin-left:10px"><div style="font-weight:900"><a href="${moveUrl}" target="_blank" rel="noopener noreferrer" class="move-link">${s.name}</a></div><div style="font-size:0.74rem; color:var(--text-dim)">${s.note}</div><div style="font-size:0.70rem; color:var(--text-dim); margin-top:3px">Category: <span style="color:#fff">${s.cat || CAT.SKILL}</span></div></div></div><span class="tag ${tagClass}">${s.tag}</span>`;

      div.onclick = (e) => {
        if (e.target.tagName === 'A') return;
        if (e.target.tagName !== 'INPUT') {
          const chk = div.querySelector('input');
          chk.checked = !chk.checked;
        }
        saved[idx] = div.querySelector('input').checked;
        localStorage.setItem(persistKey, JSON.stringify(saved));
      };
      container.appendChild(div);
    });

    state.sessionSteps = sessionSteps;
    state.currentStep = 0;
    state.currentRound = 1;
    refreshStepUI();
    if (window.renderLibraryScreen) window.renderLibraryScreen();
  }

  function refreshStepUI() {
    const step = state.sessionSteps[state.currentStep];
    if (!step) return;
    const discipline = document.getElementById('discipline-select').value;

    document.getElementById('exercise-name').innerHTML = `<a href="${tutorialLink(step, discipline)}" target="_blank" rel="noopener noreferrer" class="move-link">${step.name}</a>`;
    document.getElementById('exercise-note').innerText = step.note;
    document.getElementById('step-count').innerText = `Step ${state.currentStep + 1}/${state.sessionSteps.length}`;

    const roundCount = parseInt(document.getElementById('rounds-input').value, 10) || 1;
    const passedRoundRests = state.sessionSteps.slice(0, state.currentStep).filter((s) => s.name === 'Round Rest').length;
    state.currentRound = Math.min(roundCount, Math.max(state.currentRound, passedRoundRests + 1));
    document.getElementById('round-count').innerText = `Round ${state.currentRound}/${roundCount}`;

    state.timeLeft = step.durationSec || parseInt(document.getElementById('work-input').value, 10);
    state.stepTotal = state.timeLeft;
    Timer.updateTimerDisplay();

    const isRest = step.tag === 'REST';
    Timer.setRingVisible(isRest, step.name.toUpperCase());
    if (isRest) Timer.updateRingProgress();

    document.getElementById('diagram-container').innerHTML = `<img src="${getSVG(step.key)}" alt="Guide">`;
    const total = state.sessionSteps.length;
    document.getElementById('session-progress').style.width = `${(state.currentStep / total) * 100}%`;

    renderCoach(step);

    if (!state.isRunning) {
      const btn = document.getElementById('btn-start');
      if (state.currentStep === 0) btn.innerText = 'Start';
    }
  }

  function nextStep() {
    const current = state.sessionSteps[state.currentStep];

    if (current && current.tag === 'REST' && current.name === 'Round Rest') {
      const roundCount = parseInt(document.getElementById('rounds-input').value, 10) || 1;
      state.currentRound = Math.min(roundCount, state.currentRound + 1);
    }

    if (document.getElementById('toggle-auto-check').checked) {
      const ath = document.getElementById('athlete-select').value;
      const discipline = document.getElementById('discipline-select').value;
      const lvl = document.getElementById('level-select').value;
      const day = document.getElementById('day-type-select').value;
      const equipMode = currentEquipMode(discipline);
      const persistKey = `check_${ath}_${discipline}_${lvl}_${day}_${equipMode}_${getTodayKey()}`;
      const saved = JSON.parse(localStorage.getItem(persistKey) || '{}');
      saved[state.currentStep] = true;
      localStorage.setItem(persistKey, JSON.stringify(saved));
      const chk = document.getElementById(`step-chk-${state.currentStep}`);
      if (chk) chk.checked = true;
    }

    let gain = 2;
    if (current.tag === 'WORK') gain = 12;
    if (current.tag === 'SKILL') gain = 10;
    if (current.tag === 'SHOULDER') gain = 8;
    state.xp += gain;
    localStorage.setItem('xp', state.xp);
    updateStats();
    updateQuests();

    state.currentStep++;
    if (state.currentStep >= state.sessionSteps.length) {
      state.currentStep = 0;
      state.currentRound = 1;
      Timer.pauseTimer();
      alert('Session Complete!');
    }
    refreshStepUI();

    if (state.isRunning) {
      clearInterval(state.timer);
      state.isRunning = false;
      Timer.startTimer();
    }
  }

  function exportData() {
    const discipline = document.getElementById('discipline-select').value;
    const equipMode = currentEquipMode(discipline);
    const data = { xp: state.xp, doneDays: state.doneDays, discipline, equipMode };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hashira_backup.json';
    a.click();
  }

  function markTodayDone() {
    state.doneDays[getTodayKey()] = true;
    localStorage.setItem('doneDays', JSON.stringify(state.doneDays));
    renderCalendar();
    updateStats();
    calculateStreak();
  }

  function resetToday() {
    Timer.pauseTimer();

    const today = getTodayKey();
    delete state.doneDays[today];
    localStorage.setItem('doneDays', JSON.stringify(state.doneDays));

    const ath = document.getElementById('athlete-select').value;
    const discipline = document.getElementById('discipline-select').value;
    const lvl = document.getElementById('level-select').value;
    const day = document.getElementById('day-type-select').value;
    const equipMode = currentEquipMode(discipline);
    const persistKey = `check_${ath}_${discipline}_${lvl}_${day}_${equipMode}_${today}`;
    localStorage.removeItem(persistKey);

    state.currentStep = 0;
    state.currentRound = 1;
    state.timeLeft = parseInt(document.getElementById('work-input').value, 10) || 50;
    state.stepTotal = state.timeLeft;

    generateChecklist();
    renderCalendar();
    updateStats();
    calculateStreak();

    const btn = document.getElementById('btn-start');
    btn.innerText = 'Start';
    btn.style.background = 'var(--primary-blue)';
  }

  function generateNewSet() {
    Timer.pauseTimer();
    state.currentStep = 0;
    state.currentRound = 1;
    state.isRunning = false;
    generateChecklist(true);
  }

  function maybeShowVerseOnOpen() {
    const enabled = localStorage.getItem('verseOnOpen');
    const shouldShow = (enabled === null) ? true : (enabled === 'true');
    document.getElementById('toggle-verse-on-open').checked = shouldShow;
    if (shouldShow) setTimeout(() => showVerse(), 150);
  }

  function showVerse() {
    const picked = VERSES[Math.floor(Math.random() * VERSES.length)];
    document.getElementById('verse-text').innerText = `"${picked.text}"`;
    document.getElementById('verse-ref').innerText = picked.ref;
    document.getElementById('verse-modal').style.display = 'flex';
  }

  function closeVerse() { document.getElementById('verse-modal').style.display = 'none'; }

  function turnVerseOff() {
    localStorage.setItem('verseOnOpen', 'false');
    document.getElementById('toggle-verse-on-open').checked = false;
    closeVerse();
    alert('Bible verse on open: OFF');
  }

  function updateSleep() {
    const wake = document.getElementById('sleep-wake').value;
    const cycles = parseInt(document.getElementById('sleep-cycles').value, 10);
    const buffer = parseInt(document.getElementById('sleep-buffer').value, 10);
    const container = document.getElementById('bedtime-chips');
    container.innerHTML = '';

    [cycles - 1, cycles, cycles + 1].forEach((c) => {
      if (c < 3 || c > 8) return;
      const [h, m] = wake.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m - (c * 90) - buffer);
      const timeStr = d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.innerText = `${timeStr} (${c}c)`;
      chip.onclick = async () => {
        try { await navigator.clipboard.writeText(timeStr); alert('Copied Bedtime!'); }
        catch (_) { alert('Copy not supported here.'); }
      };
      container.appendChild(chip);
    });
  }

  function setupPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }

    let deferredPrompt = null;
    const installBtn = document.getElementById('pwa-install');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      installBtn.style.display = 'inline-block';
    });

    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.style.display = 'none';
    });

    window.addEventListener('appinstalled', () => {
      installBtn.style.display = 'none';
    });
  }

  function saveSettings() {
    localStorage.setItem('athlete', document.getElementById('athlete-select').value);
    localStorage.setItem('discipline', document.getElementById('discipline-select').value);
    localStorage.setItem('level', document.getElementById('level-select').value);
    localStorage.setItem('dayType', document.getElementById('day-type-select').value);

    localStorage.setItem('equipGym', document.getElementById('equip-gym').value);
    localStorage.setItem('equipCali', document.getElementById('equip-cali').value);
    localStorage.setItem('equipBD', document.getElementById('equip-bd').value);
    localStorage.setItem('equipPil', document.getElementById('equip-pil').value);

    localStorage.setItem('joint', document.getElementById('joint-status').value);
    localStorage.setItem('autoLoad', document.getElementById('auto-load').value);
    localStorage.setItem('historyMode', document.getElementById('history-mode').value);

    localStorage.setItem('rounds', document.getElementById('rounds-input').value);
    localStorage.setItem('work', document.getElementById('work-input').value);
    localStorage.setItem('rest', document.getElementById('rest-input').value);
    localStorage.setItem('roundRest', document.getElementById('round-rest-input').value);

    localStorage.setItem('smartMode', document.getElementById('smart-select').value);

    localStorage.setItem('sound', document.getElementById('toggle-sound').checked ? 'true' : 'false');
    localStorage.setItem('autoNext', document.getElementById('toggle-auto-next').checked ? 'true' : 'false');
    localStorage.setItem('autoCheck', document.getElementById('toggle-auto-check').checked ? 'true' : 'false');
    localStorage.setItem('verseOnOpen', document.getElementById('toggle-verse-on-open').checked ? 'true' : 'false');

    const plan = [];
    for (let i = 0; i < 5; i++) {
      const el = document.getElementById(`plan-day-${i}`);
      if (el) plan.push(el.value);
    }
    localStorage.setItem(planKey(), JSON.stringify(plan));
  }

  function loadSettings() {
    const get = (k) => localStorage.getItem(k);

    document.getElementById('athlete-select').value = get('athlete') || 'moise';

    const athlete = document.getElementById('athlete-select').value;
    const savedDisc = get('discipline') || 'calisthenics';
    const list = (athlete === 'her') ? DISCIPLINES_HER : DISCIPLINES_MOISE;
    const disc = list.some((x) => x.value === savedDisc) ? savedDisc : list[0].value;
    fillSelect(document.getElementById('discipline-select'), list, disc);

    showEquipUI();

    document.getElementById('level-select').value = get('level') || 'intermediate';

    document.getElementById('equip-gym').value = get('equipGym') || 'full';
    document.getElementById('equip-cali').value = get('equipCali') || 'bar';
    document.getElementById('equip-bd').value = get('equipBD') || 'normal';
    document.getElementById('equip-pil').value = get('equipPil') || 'mat';

    updateDayTypeOptions();
    const savedDay = get('dayType');
    if (savedDay) {
      const list2 = DAY_TYPES[document.getElementById('discipline-select').value] || [];
      if (list2.some((x) => x.value === savedDay)) document.getElementById('day-type-select').value = savedDay;
    }

    if (get('rounds')) document.getElementById('rounds-input').value = get('rounds');
    if (get('work')) document.getElementById('work-input').value = get('work');
    if (get('rest')) document.getElementById('rest-input').value = get('rest');
    if (get('roundRest')) document.getElementById('round-rest-input').value = get('roundRest');

    document.getElementById('joint-status').value = get('joint') || 'none';
    document.getElementById('auto-load').value = get('autoLoad') || 'on';
    document.getElementById('history-mode').value = get('historyMode') || 'on';
    document.getElementById('smart-select').value = get('smartMode') || 'on';

    document.getElementById('toggle-sound').checked = (get('sound') === null) ? true : (get('sound') === 'true');
    document.getElementById('toggle-auto-next').checked = (get('autoNext') === null) ? true : (get('autoNext') === 'true');
    document.getElementById('toggle-auto-check').checked = (get('autoCheck') === null) ? true : (get('autoCheck') === 'true');
    document.getElementById('toggle-verse-on-open').checked = (get('verseOnOpen') === null) ? true : (get('verseOnOpen') === 'true');

    const auto = get('autoSync');
    document.getElementById('auto-sync-day').checked = (auto === 'true');
  }

  function init() {
    window.HASHIRA_APP_API = {
      pickLib,
      currentEquipMode,
      applyEquipmentToList,
      nextStep
    };

    loadSettings();

    const ath = document.getElementById('athlete-select').value;
    if (ath === 'her') document.body.classList.add('theme-her');

    ['rounds-input','work-input','rest-input','round-rest-input'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', markManualTimingEdit);
    });

    applySuggestedTimings(true);
    updateStats();
    calculateStreak();
    renderCalendar();
    renderPlanBuilder();
    updateQuests();
    updateSleep();
    generateChecklist();
    setupPWA();
    maybeShowVerseOnOpen();

    document.getElementById('athlete-select').addEventListener('change', () => {
      toggleAthleteTheme();
      saveSettings();
    });

    document.getElementById('discipline-select').addEventListener('change', () => {
      showEquipUI();
      applySuggestedTimings();
      updateDayTypeOptions();
      renderPlanBuilder();
      generateChecklist();
      saveSettings();
    });

    document.getElementById('day-type-select').addEventListener('change', () => {
      localStorage.setItem('dayType', document.getElementById('day-type-select').value);
      applySuggestedTimings();
      generateChecklist();
      saveSettings();
    });

    document.getElementById('level-select').addEventListener('change', () => {
      applySuggestedTimings();
      generateChecklist();
      saveSettings();
    });

    const contextIds = new Set(['equip-gym','equip-cali','equip-bd','equip-pil','joint-status','auto-load','history-mode','smart-select']);

    ['equip-gym','equip-cali','equip-bd','equip-pil','joint-status','auto-load','history-mode','rounds-input','work-input','rest-input','round-rest-input','smart-select',
      'toggle-sound','toggle-auto-next','toggle-auto-check','toggle-verse-on-open'
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('change', () => {
        if (contextIds.has(id)) applySuggestedTimings();
        generateChecklist();
        saveSettings();
      });
    });

    document.getElementById('auto-sync-day').addEventListener('change', (e) => {
      localStorage.setItem('autoSync', e.target.checked ? 'true' : 'false');
      saveSettings();
      renderPlanBuilder();
      generateChecklist();
    });

    document.getElementById('sleep-wake').addEventListener('change', updateSleep);
    document.getElementById('sleep-cycles').addEventListener('change', updateSleep);
    document.getElementById('sleep-buffer').addEventListener('change', updateSleep);

    document.getElementById('verse-modal').addEventListener('click', (e) => {
      if (e.target.id === 'verse-modal') closeVerse();
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') { e.preventDefault(); Timer.toggleTimer(); }
      if (e.code === 'KeyN') nextStep();
    });

    window.addEventListener('hashchange', window.HASHIRA_ROUTER.handleRoute);
    window.HASHIRA_ROUTER.handleRoute();
  }

  window.nextStep = nextStep;
  window.exportData = exportData;
  window.markTodayDone = markTodayDone;
  window.resetToday = resetToday;
  window.showVerse = showVerse;
  window.closeVerse = closeVerse;
  window.turnVerseOff = turnVerseOff;
  window.updateSleep = updateSleep;
  window.toggleAthleteTheme = toggleAthleteTheme;
  window.useTodaysPlan = useTodaysPlan;
  window.resetPlan = resetPlan;
  window.generateNewSet = generateNewSet;

  init();
})();
