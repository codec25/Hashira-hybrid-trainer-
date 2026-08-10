/**
 * HASHIRA — workout presets (localStorage-first, DB-migration-friendly).
 */
(function () {
  var SCHEMA_VERSION = 1;
  var LS_KEY = 'hashira_presets_store_v1';

  var LS = window.HASHIRA_LS || {
    getItem: function (k) { return localStorage.getItem(k); },
    setItem: function (k, v) { return localStorage.setItem(k, v); },
    removeItem: function (k) { return localStorage.removeItem(k); }
  };

  var ORDERED_GET_DAYS = [1, 2, 3, 4, 5, 6, 0];
  var DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  function nowIso() { return new Date().toISOString(); }

  function uid(prefix) {
    return (prefix || 'p') + '_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now().toString(36);
  }

  function defaultPresets() {
    return [
      {
        schemaVersion: SCHEMA_VERSION,
        id: 'default-quick-mobility',
        source: 'default',
        name: 'Quick mobility reset',
        category: 'General',
        tags: ['mobility', 'starter'],
        notes: 'Light movement — use between harder days.',
        rounds: 1,
        restBetweenExercisesSec: 25,
        roundRestSec: 60,
        warmup: { name: 'Easy march + arm circles', key: 'warm', note: '2 min easy', durationSec: 120 },
        cooldown: { name: 'Breathing + neck rolls', key: 'rest', note: '60s easy', durationSec: 60 },
        assignedDays: [],
        exercises: [
          { id: 'e1', name: 'Cat-cow flow', key: 'plnk', note: 'Slow spine', tag: 'SKILL', cat: 'Prehab', durationSec: 45, reps: null },
          { id: 'e2', name: 'Hip circles + reach', key: 'sq_std', note: 'Quality over range', tag: 'SKILL', cat: 'Skill', durationSec: 40, reps: null },
          { id: 'e3', name: 'World\'s greatest stretch', key: 'sq_std', note: '2–3 each side', tag: 'SKILL', cat: 'Prehab', durationSec: 50, reps: null }
        ],
        createdAt: nowIso(),
        updatedAt: nowIso()
      },
      {
        schemaVersion: SCHEMA_VERSION,
        id: 'default-density-ladder',
        source: 'default',
        name: 'Density ladder (3 rounds)',
        category: 'Conditioning',
        tags: ['conditioning', 'rounds'],
        notes: 'Work hard, rest honest. Blank per-move duration uses Profile work time.',
        rounds: 3,
        restBetweenExercisesSec: 35,
        roundRestSec: 90,
        warmup: { name: 'Pulse warmup', key: 'warm', note: 'Joints + easy pace', durationSec: 90 },
        cooldown: { name: 'Walk + breathe', key: 'rest', note: 'Downshift', durationSec: 75 },
        assignedDays: [],
        exercises: [
          { id: 'e1', name: 'Mountain climbers', key: 'plnk', note: 'Sustain pace', tag: 'WORK', cat: 'Conditioning', durationSec: 40, reps: null },
          { id: 'e2', name: 'Squat to reach', key: 'sq_std', note: 'Smooth tempo', tag: 'WORK', cat: 'Hypertrophy', durationSec: 40, reps: null },
          { id: 'e3', name: 'Plank shoulder taps', key: 'plnk', note: 'Hips quiet', tag: 'WORK', cat: 'Strength', durationSec: 35, reps: null }
        ],
        createdAt: nowIso(),
        updatedAt: nowIso()
      }
    ];
  }

  function readStore() {
    try {
      var raw = LS.getItem(LS_KEY);
      if (!raw) return { schemaVersion: SCHEMA_VERSION, userPresets: [] };
      var o = JSON.parse(raw);
      if (!o || typeof o !== 'object') return { schemaVersion: SCHEMA_VERSION, userPresets: [] };
      if (!Array.isArray(o.userPresets)) o.userPresets = [];
      return o;
    } catch (e) {
      return { schemaVersion: SCHEMA_VERSION, userPresets: [] };
    }
  }

  function writeStore(store) {
    LS.setItem(LS_KEY, JSON.stringify(store));
  }

  function listUserPresets() {
    return readStore().userPresets.slice();
  }

  function saveUserPreset(preset) {
    var store = readStore();
    var p = normalizePreset(preset);
    p.updatedAt = nowIso();
    if (!p.createdAt) p.createdAt = p.updatedAt;
    var idx = store.userPresets.findIndex(function (x) { return x.id === p.id; });
    if (idx >= 0) store.userPresets[idx] = p;
    else store.userPresets.push(p);
    writeStore(store);
    return p;
  }

  function deleteUserPreset(id) {
    var store = readStore();
    store.userPresets = store.userPresets.filter(function (p) { return p.id !== id; });
    writeStore(store);
  }

  function normalizePreset(p) {
    var out = Object.assign({}, p);
    out.schemaVersion = SCHEMA_VERSION;
    out.source = 'user';
    out.exercises = Array.isArray(out.exercises) ? out.exercises.map(function (ex, i) {
      var e = Object.assign({}, ex);
      if (!e.id) e.id = 'ex_' + i + '_' + Math.random().toString(36).slice(2, 6);
      if (e.durationSec == null) e.durationSec = null;
      e.name = String(e.name || 'Exercise').trim() || 'Exercise';
      e.key = e.key || 'plnk';
      e.tag = e.tag || 'WORK';
      e.cat = e.cat || 'Skill';
      return e;
    }) : [];
    out.rounds = Math.max(1, Math.min(12, parseInt(out.rounds, 10) || 1));
    out.restBetweenExercisesSec = Math.max(0, Math.min(300, parseInt(out.restBetweenExercisesSec, 10) || 30));
    out.roundRestSec = Math.max(0, Math.min(600, parseInt(out.roundRestSec, 10) || 90));
    out.category = String(out.category || 'Custom').trim() || 'Custom';
    out.name = String(out.name || 'Untitled').trim() || 'Untitled';
    out.tags = Array.isArray(out.tags) ? out.tags.map(String).slice(0, 12) : [];
    out.assignedDays = Array.isArray(out.assignedDays)
      ? out.assignedDays.map(function (d) { return parseInt(d, 10); }).filter(function (d) { return d >= 0 && d <= 6; })
      : [];
    if (!out.id) out.id = uid('user');
    return out;
  }

  function duplicateUserPreset(id) {
    var all = listUserPresets().concat(defaultPresets());
    var src = all.find(function (p) { return p.id === id; });
    if (!src) return null;
    var copy = JSON.parse(JSON.stringify(src));
    copy.id = uid('user');
    copy.source = 'user';
    copy.name = (copy.name || 'Preset') + ' (copy)';
    copy.createdAt = nowIso();
    copy.updatedAt = copy.createdAt;
    saveUserPreset(copy);
    return copy;
  }

  function presetToSessionSteps(preset, opts) {
    var CAT = (opts && opts.CAT) || {};
    var workDefault = Math.max(15, parseInt(opts && opts.workCap, 10) || 50);
    var session = [];

    function pushRest(sec, label, note) {
      var s = Math.max(5, parseInt(sec, 10) || 30);
      session.push({
        key: 'rest',
        name: label || 'Rest',
        note: note || (s + 's'),
        tag: 'REST',
        cat: CAT.PREHAB || 'Prehab',
        durationSec: s
      });
    }

    if (preset.warmup && preset.warmup.durationSec > 0) {
      session.push({
        key: preset.warmup.key || 'warm',
        name: preset.warmup.name || 'Warmup',
        note: preset.warmup.note || '',
        tag: 'SKILL',
        cat: CAT.PREHAB || 'Prehab',
        durationSec: Math.max(30, parseInt(preset.warmup.durationSec, 10) || 90)
      });
    }

    var rounds = Math.max(1, parseInt(preset.rounds, 10) || 1);
    var rb = Math.max(0, parseInt(preset.restBetweenExercisesSec, 10) || 30);
    var rr = Math.max(0, parseInt(preset.roundRestSec, 10) || 60);
    var exercises = preset.exercises || [];

    for (var r = 0; r < rounds; r++) {
      for (var i = 0; i < exercises.length; i++) {
        var ex = exercises[i];
        var dur = ex.durationSec != null ? parseInt(ex.durationSec, 10) : workDefault;
        if (!dur || dur < 5) dur = workDefault;
        session.push({
          key: ex.key || 'plnk',
          name: ex.name,
          note: ex.note || (ex.reps ? ex.reps + ' reps target · ' + dur + 's timer' : ''),
          tag: ex.tag || 'WORK',
          cat: ex.cat || CAT.SKILL || 'Skill',
          durationSec: dur
        });
        var restAfter = ex.restAfterSec != null ? parseInt(ex.restAfterSec, 10) : rb;
        if (i < exercises.length - 1 && restAfter > 0) {
          pushRest(restAfter, 'Rest', 'Between moves');
        }
      }
      if (r < rounds - 1 && rr > 0) {
        pushRest(rr, 'Round Rest', 'Between rounds');
      }
    }

    if (preset.cooldown && preset.cooldown.durationSec > 0) {
      session.push({
        key: preset.cooldown.key || 'rest',
        name: preset.cooldown.name || 'Cooldown',
        note: preset.cooldown.note || '',
        tag: 'REST',
        cat: CAT.PREHAB || 'Prehab',
        durationSec: Math.max(30, parseInt(preset.cooldown.durationSec, 10) || 60)
      });
    }

    if (!session.length) {
      session.push({
        key: 'plnk',
        name: 'Placeholder',
        note: 'Add exercises in Builder',
        tag: 'SKILL',
        cat: CAT.SKILL || 'Skill',
        durationSec: workDefault
      });
    }
    return session;
  }

  function getTodaysAssignedPreset() {
    var d = new Date().getDay();
    var candidates = listUserPresets().concat(defaultPresets());
    for (var i = 0; i < candidates.length; i++) {
      var p = candidates[i];
      if (!p.assignedDays || !p.assignedDays.length) continue;
      if (p.assignedDays.indexOf(d) >= 0) return p;
    }
    return null;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function mountPresetsUI(root) {
    if (!root) return;

    if (!root.querySelector('#preset-browse-mount')) {
      root.innerHTML =
        '<div id="preset-browse-mount"></div>' +
        '<div id="preset-builder-mount"></div>';
    }

    var browseEl = root.querySelector('#preset-browse-mount');
    var builderEl = root.querySelector('#preset-builder-mount');
    if (!browseEl || !builderEl) return;

    var draftEx = [];

    function notifyHomePresetHint() {
      if (typeof window.refreshHomePresetHint === 'function') window.refreshHomePresetHint();
    }

    function renderBrowse() {
      var today = getTodaysAssignedPreset();
      var defaults = defaultPresets();
      var mine = listUserPresets();
      var html = '';
      html += '<section class="card card--presets card--presets-hero">';
      html += '<div class="card-title card-title--soft">Today\'s workout</div>';
      if (today) {
        html += '<p class="section-lede section-lede--tight">Matched weekday assignment (Sun=0 … Sat=6).</p>';
        html += '<div class="preset-today-banner">';
        html += '<div class="preset-today-name">' + esc(today.name) + '</div>';
        html += '<div class="preset-today-meta text-dim">' + esc(today.category) + '</div>';
        html += '<div class="preset-actions">';
        html += '<button type="button" class="btn-cta btn-cta-primary" data-action="use" data-id="' + esc(today.id) + '">Load session</button>';
        html += '<button type="button" class="btn-cta btn-cta-secondary" onclick="location.hash=\'#train\'">Open Train</button>';
        html += '</div></div>';
      } else {
        html += '<p class="section-lede section-lede--tight">No preset assigned to <strong>today</strong>. Pick weekdays in Builder when saving, or load a preset below.</p>';
      }
      html += '</section>';

      html += '<section class="card card--presets">';
      html += '<div class="card-title card-title--soft">Default presets</div>';
      html += '<p class="section-lede section-lede--tight">Built-in — duplicate to customize under My presets.</p>';
      html += '<div class="preset-grid">';
      defaults.forEach(function (p) {
        html += '<article class="preset-card preset-card--default">';
        html += '<div class="preset-card-kicker">Built-in</div>';
        html += '<h3 class="preset-card-title">' + esc(p.name) + '</h3>';
        html += '<div class="preset-card-cat text-dim">' + esc(p.category) + '</div>';
        html += '<div class="preset-card-stats">' + (p.exercises || []).length + ' moves · ' + (p.rounds || 1) + ' rounds</div>';
        html += '<div class="preset-actions">';
        html += '<button type="button" class="btn-header" data-action="use" data-id="' + esc(p.id) + '">Use</button>';
        html += '<button type="button" class="btn-header btn-ghost" data-action="dup" data-id="' + esc(p.id) + '">Duplicate</button>';
        html += '</div></article>';
      });
      html += '</div></section>';

      html += '<section class="card card--presets">';
      html += '<div class="card-title card-title--soft">My presets</div>';
      if (!mine.length) {
        html += '<p class="hint">No custom presets yet. Duplicate a default or use Builder below.</p>';
      } else {
        html += '<div class="preset-grid">';
        mine.forEach(function (p) {
          html += '<article class="preset-card">';
          html += '<div class="preset-card-kicker">Yours</div>';
          html += '<h3 class="preset-card-title">' + esc(p.name) + '</h3>';
          html += '<div class="preset-card-cat text-dim">' + esc(p.category) + '</div>';
          html += '<div class="preset-card-stats">' + (p.exercises || []).length + ' moves · ' + (p.rounds || 1) + ' rnd · ' + (p.restBetweenExercisesSec || 0) + 's between</div>';
          html += '<div class="preset-actions">';
          html += '<button type="button" class="btn-header" data-action="use" data-id="' + esc(p.id) + '">Use</button>';
          html += '<button type="button" class="btn-header btn-ghost" data-action="edit" data-id="' + esc(p.id) + '">Edit</button>';
          html += '<button type="button" class="btn-header btn-ghost" data-action="dup" data-id="' + esc(p.id) + '">Duplicate</button>';
          html += '<button type="button" class="btn-header danger" data-action="del" data-id="' + esc(p.id) + '">Delete</button>';
          html += '</div></article>';
        });
        html += '</div>';
      }
      html += '</section>';
      browseEl.innerHTML = html;
    }

    function exRowHtml(ex, idx) {
      var h = '<div class="preset-ex-row" data-ex-idx="' + idx + '">';
      h += '<div class="preset-ex-row-head"><span class="text-dim">#' + (idx + 1) + '</span>';
      h += '<button type="button" class="btn-header btn-ghost preset-ex-up" data-idx="' + idx + '">↑</button>';
      h += '<button type="button" class="btn-header btn-ghost preset-ex-down" data-idx="' + idx + '">↓</button>';
      h += '<button type="button" class="btn-header danger preset-ex-remove" data-idx="' + idx + '">×</button></div>';
      h += '<div class="field-grid">';
      h += '<div class="field-span-2"><label class="field-label">Name</label><input type="text" class="preset-ex-name" data-idx="' + idx + '" value="' + esc(ex.name) + '"></div>';
      h += '<div><label class="field-label">Duration (sec)</label><input type="number" class="preset-ex-dur" data-idx="' + idx + '" min="0" max="600" placeholder="blank = profile work" value="' + (ex.durationSec != null ? esc(ex.durationSec) : '') + '"></div>';
      h += '<div><label class="field-label">Reps (optional)</label><input type="number" class="preset-ex-reps" data-idx="' + idx + '" min="0" max="999" placeholder="—" value="' + (ex.reps != null ? esc(ex.reps) : '') + '"></div>';
      h += '<div class="field-span-2"><label class="field-label">Note</label><input type="text" class="preset-ex-note" data-idx="' + idx + '" value="' + esc(ex.note || '') + '"></div>';
      h += '<div><label class="field-label">Diagram key</label><select class="preset-ex-key" data-idx="' + idx + '">';
      ['plnk', 'warm', 'p_std', 'p_up', 'sq_std', 'rest'].forEach(function (k) {
        h += '<option value="' + k + '"' + ((ex.key || 'plnk') === k ? ' selected' : '') + '>' + k + '</option>';
      });
      h += '</select></div>';
      h += '<div><label class="field-label">Tag</label><select class="preset-ex-tag" data-idx="' + idx + '">';
      ['WORK', 'SKILL', 'SHOULDER', 'REST'].forEach(function (t) {
        h += '<option value="' + t + '"' + ((ex.tag || 'WORK') === t ? ' selected' : '') + '>' + t + '</option>';
      });
      h += '</select></div></div></div>';
      return h;
    }

    function paintExList() {
      var box = builderEl.querySelector('#preset-ex-list');
      if (!box) return;
      box.innerHTML = draftEx.map(function (ex, i) { return exRowHtml(ex, i); }).join('');
      box.querySelectorAll('.preset-ex-up').forEach(function (btn) {
        btn.onclick = function () {
          var i = parseInt(btn.getAttribute('data-idx'), 10);
          if (i > 0) {
            var t = draftEx[i - 1]; draftEx[i - 1] = draftEx[i]; draftEx[i] = t;
            paintExList();
          }
        };
      });
      box.querySelectorAll('.preset-ex-down').forEach(function (btn) {
        btn.onclick = function () {
          var i = parseInt(btn.getAttribute('data-idx'), 10);
          if (i < draftEx.length - 1) {
            var t = draftEx[i + 1]; draftEx[i + 1] = draftEx[i]; draftEx[i] = t;
            paintExList();
          }
        };
      });
      box.querySelectorAll('.preset-ex-remove').forEach(function (btn) {
        btn.onclick = function () {
          var i = parseInt(btn.getAttribute('data-idx'), 10);
          draftEx.splice(i, 1);
          if (!draftEx.length) draftEx.push({ id: uid('ex'), name: 'New move', key: 'plnk', tag: 'WORK', note: '', durationSec: null, reps: null });
          paintExList();
        };
      });
    }

    function readFormIntoPreset() {
      var assigned = [];
      builderEl.querySelectorAll('.preset-day-cb:checked').forEach(function (cb) {
        assigned.push(parseInt(cb.value, 10));
      });
      var wuSec = parseInt(builderEl.querySelector('#preset-wu-sec').value, 10) || 0;
      var cdSec = parseInt(builderEl.querySelector('#preset-cd-sec').value, 10) || 0;
      var wuName = builderEl.querySelector('#preset-wu-name').value.trim();
      var cdName = builderEl.querySelector('#preset-cd-name').value.trim();
      var exercises = [];
      var rows = builderEl.querySelectorAll('.preset-ex-row');
      for (var r = 0; r < rows.length; r++) {
        var row = rows[r];
        var idx = parseInt(row.getAttribute('data-ex-idx'), 10);
        var name = row.querySelector('.preset-ex-name').value.trim() || 'Exercise';
        var durRaw = row.querySelector('.preset-ex-dur').value.trim();
        var dur = durRaw === '' ? null : Math.max(5, parseInt(durRaw, 10) || 0);
        var repsRaw = row.querySelector('.preset-ex-reps').value.trim();
        var reps = repsRaw === '' ? null : Math.max(0, parseInt(repsRaw, 10) || 0);
        exercises.push({
          id: (draftEx[idx] && draftEx[idx].id) ? draftEx[idx].id : uid('ex'),
          name: name,
          key: row.querySelector('.preset-ex-key').value,
          note: row.querySelector('.preset-ex-note').value.trim(),
          tag: row.querySelector('.preset-ex-tag').value,
          cat: 'Skill',
          durationSec: dur,
          reps: reps
        });
      }
      var editId = builderEl.querySelector('#preset-edit-id').value.trim();
      return normalizePreset({
        id: editId || undefined,
        name: builderEl.querySelector('#preset-name').value,
        category: builderEl.querySelector('#preset-category').value,
        rounds: builderEl.querySelector('#preset-rounds').value,
        restBetweenExercisesSec: builderEl.querySelector('#preset-rest-between').value,
        roundRestSec: builderEl.querySelector('#preset-round-rest').value,
        notes: builderEl.querySelector('#preset-notes').value.trim(),
        tags: builderEl.querySelector('#preset-tags').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean),
        warmup: wuSec > 0 ? { name: wuName || 'Warmup', durationSec: wuSec, key: 'warm' } : null,
        cooldown: cdSec > 0 ? { name: cdName || 'Cooldown', durationSec: cdSec, key: 'rest' } : null,
        assignedDays: assigned,
        exercises: exercises
      });
    }

    function loadDraftFromPreset(p) {
      builderEl.querySelector('#preset-edit-id').value = p.source === 'user' ? p.id : '';
      builderEl.querySelector('#preset-name').value = p.name || '';
      builderEl.querySelector('#preset-category').value = p.category || '';
      builderEl.querySelector('#preset-rounds').value = p.rounds || 1;
      builderEl.querySelector('#preset-rest-between').value = p.restBetweenExercisesSec != null ? p.restBetweenExercisesSec : 40;
      builderEl.querySelector('#preset-round-rest').value = p.roundRestSec != null ? p.roundRestSec : 90;
      builderEl.querySelector('#preset-notes').value = p.notes || '';
      builderEl.querySelector('#preset-tags').value = (p.tags || []).join(', ');
      builderEl.querySelector('#preset-wu-name').value = (p.warmup && p.warmup.name) || '';
      builderEl.querySelector('#preset-wu-sec').value = (p.warmup && p.warmup.durationSec) || 0;
      builderEl.querySelector('#preset-cd-name').value = (p.cooldown && p.cooldown.name) || '';
      builderEl.querySelector('#preset-cd-sec').value = (p.cooldown && p.cooldown.durationSec) || 0;
      builderEl.querySelectorAll('.preset-day-cb').forEach(function (cb) {
        cb.checked = (p.assignedDays || []).indexOf(parseInt(cb.value, 10)) >= 0;
      });
      draftEx = (p.exercises || []).map(function (x) { return Object.assign({}, x); });
      if (!draftEx.length) draftEx.push({ id: uid('ex'), name: 'New move', key: 'plnk', tag: 'WORK', note: '', durationSec: null, reps: null });
      paintExList();
    }

    function renderBuilderShell() {
      var html = '';
      html += '<section class="card card--presets card--presets-builder">';
      html += '<div class="card-title card-title--soft">Builder</div>';
      html += '<p class="section-lede section-lede--tight">Create moves, set rounds/rest, assign weekdays (optional). Blank duration uses Profile work time.</p>';
      html += '<div class="field-grid">';
      html += '<div class="field-span-2 hidden"><input type="text" id="preset-edit-id" readonly aria-hidden="true"></div>';
      html += '<div class="field-span-2"><label class="field-label" for="preset-name">Name</label><input type="text" id="preset-name" maxlength="80" placeholder="e.g. Pull power"></div>';
      html += '<div><label class="field-label" for="preset-category">Category</label><input type="text" id="preset-category" maxlength="40" placeholder="e.g. Gym"></div>';
      html += '<div><label class="field-label" for="preset-rounds">Rounds</label><input type="number" id="preset-rounds" min="1" max="12" value="3"></div>';
      html += '<div><label class="field-label" for="preset-rest-between">Rest between moves (sec)</label><input type="number" id="preset-rest-between" min="0" max="300" value="40"></div>';
      html += '<div><label class="field-label" for="preset-round-rest">Round rest (sec)</label><input type="number" id="preset-round-rest" min="0" max="600" value="90"></div>';
      html += '<div class="field-span-2"><label class="field-label" for="preset-notes">Notes (optional)</label><textarea id="preset-notes" rows="2" maxlength="400"></textarea></div>';
      html += '<div class="field-span-2"><label class="field-label" for="preset-tags">Tags (comma)</label><input type="text" id="preset-tags" maxlength="120" placeholder="strength, home"></div>';
      html += '<div><label class="field-label" for="preset-wu-name">Warmup name</label><input type="text" id="preset-wu-name" placeholder="Optional"></div>';
      html += '<div><label class="field-label" for="preset-wu-sec">Warmup (sec)</label><input type="number" id="preset-wu-sec" min="0" max="600" value="120"></div>';
      html += '<div><label class="field-label" for="preset-cd-name">Cooldown name</label><input type="text" id="preset-cd-name" placeholder="Optional"></div>';
      html += '<div><label class="field-label" for="preset-cd-sec">Cooldown (sec)</label><input type="number" id="preset-cd-sec" min="0" max="600" value="75"></div>';
      html += '</div>';
      html += '<div class="preset-weekday-row"><span class="field-label">Assign days (optional)</span>';
      ORDERED_GET_DAYS.forEach(function (gd, idx) {
        html += '<label class="preset-day-chip"><input type="checkbox" class="preset-day-cb" value="' + gd + '"> ' + DAY_LABELS[idx] + '</label>';
      });
      html += '</div>';
      html += '<div class="preset-builder-toolbar">';
      html += '<button type="button" class="btn-header" id="preset-add-ex">+ Add exercise</button>';
      html += '<button type="button" class="btn-cta btn-cta-primary" id="preset-save-btn">Save preset</button>';
      html += '<button type="button" class="btn-header btn-ghost" id="preset-new-btn">New blank</button>';
      html += '</div>';
      html += '<div id="preset-ex-list" class="preset-ex-list"></div>';
      html += '</section>';
      builderEl.innerHTML = html;

      builderEl.querySelector('#preset-add-ex').onclick = function () {
        draftEx.push({ id: uid('ex'), name: 'New move', key: 'plnk', tag: 'WORK', note: '', durationSec: null, reps: null });
        paintExList();
      };
      builderEl.querySelector('#preset-save-btn').onclick = function () {
        var pr = readFormIntoPreset();
        if (!pr.exercises.length) {
          alert('Add at least one exercise.');
          return;
        }
        saveUserPreset(pr);
        builderEl.querySelector('#preset-edit-id').value = pr.id;
        alert('Saved: ' + pr.name);
        renderBrowse();
        notifyHomePresetHint();
        loadDraftFromPreset(listUserPresets().find(function (p) { return p.id === pr.id; }) || pr);
      };
      builderEl.querySelector('#preset-new-btn').onclick = function () {
        draftEx = [{ id: uid('ex'), name: 'New move', key: 'plnk', tag: 'WORK', note: '', durationSec: null, reps: null }];
        builderEl.querySelector('#preset-edit-id').value = '';
        builderEl.querySelector('#preset-name').value = 'New workout';
        builderEl.querySelector('#preset-category').value = 'Custom';
        builderEl.querySelector('#preset-notes').value = '';
        builderEl.querySelector('#preset-tags').value = '';
        builderEl.querySelectorAll('.preset-day-cb').forEach(function (cb) { cb.checked = false; });
        paintExList();
      };
    }

    if (!root.dataset.presetsBuilderInit) {
      root.dataset.presetsBuilderInit = '1';
      renderBuilderShell();
      draftEx = [
        { id: uid('ex'), name: 'Push-ups', key: 'p_std', tag: 'WORK', note: 'Quality reps', durationSec: 40, reps: null }
      ];
      paintExList();
    }

    renderBrowse();
    notifyHomePresetHint();

    if (!root.dataset.presetsClickBound) {
      root.dataset.presetsClickBound = '1';
      root.addEventListener('click', function (ev) {
        var t = ev.target;
        if (!t || !t.closest) return;
        var btn = t.closest('[data-action]');
        if (!btn || !browseEl.contains(btn)) return;
        var act = btn.getAttribute('data-action');
        var id = btn.getAttribute('data-id');
        if (act === 'use' && id && window.loadHashiraPresetById) {
          window.loadHashiraPresetById(id);
        } else if (act === 'dup' && id) {
          duplicateUserPreset(id);
          renderBrowse();
          notifyHomePresetHint();
        } else if (act === 'del' && id) {
          if (confirm('Delete this preset?')) {
            deleteUserPreset(id);
            renderBrowse();
            notifyHomePresetHint();
          }
        } else if (act === 'edit' && id) {
          var found = listUserPresets().find(function (p) { return p.id === id; });
          if (found) {
            loadDraftFromPreset(found);
            builderEl.querySelector('.card--presets-builder').scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    }
  }

  /**
   * Replace user preset library from backup (schemaVersion + userPresets[]).
   * Invalid entries are skipped; empty array clears custom presets only.
   */
  function importStore(raw) {
    if (!raw || typeof raw !== 'object') return false;
    var ups = raw.userPresets;
    if (!Array.isArray(ups)) return false;
    if (ups.length > 200) return false;
    var cleaned = [];
    for (var i = 0; i < ups.length; i++) {
      try {
        cleaned.push(normalizePreset(ups[i]));
      } catch (e) {}
    }
    writeStore({ schemaVersion: SCHEMA_VERSION, userPresets: cleaned });
    return true;
  }

  window.HASHIRA_PRESETS = {
    SCHEMA_VERSION: SCHEMA_VERSION,
    LS_KEY: LS_KEY,
    defaultPresets: defaultPresets,
    readStore: readStore,
    importStore: importStore,
    listUserPresets: listUserPresets,
    saveUserPreset: saveUserPreset,
    deleteUserPreset: deleteUserPreset,
    duplicateUserPreset: duplicateUserPreset,
    normalizePreset: normalizePreset,
    presetToSessionSteps: presetToSessionSteps,
    getTodaysAssignedPreset: getTodaysAssignedPreset,
    mountPresetsUI: mountPresetsUI,
    ORDERED_GET_DAYS: ORDERED_GET_DAYS,
    DAY_LABELS: DAY_LABELS
  };
})();
