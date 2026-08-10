(function () {
  'use strict';

  const LS = window.HASHIRA_LS || localStorage;
  const STORE_KEY = 'hashira_field_mode_v1';
  const WORLD_LABELS = {
    beach: 'Tide Temple',
    park: 'Iron Grove',
    stairs: 'Sky Path',
    home: 'Hidden Chamber'
  };

  const MOVES = {
    beach: [
      ['Shoreline sprint', 'Run to the marker and return with quiet feet.', 'Land softly; stay tall.'],
      ['Sand bear crawl', 'Travel forward and backward through the sand.', 'Hips low; hands active.'],
      ['Tide push-up', 'Controlled push-ups facing the water.', 'Body moves as one unit.'],
      ['Driftwood squat', 'Slow squats with a two-second bottom pause.', 'Knees follow toes.'],
      ['Crab escape', 'Crab-walk to a marker, turn, and return.', 'Press the ground away.'],
      ['Wave line hops', 'Hop side-to-side over a line in the sand.', 'Quiet landing; fast rebound.']
    ],
    park: [
      ['Branch rows', 'Use a low bar for controlled body rows.', 'Chest leads; shoulders stay down.'],
      ['Bench step-ups', 'Alternate legs on a stable bench.', 'Own the top position.'],
      ['Pathway lunges', 'Traveling lunges between two landmarks.', 'Front heel stays grounded.'],
      ['Bar hang', 'Active or assisted hang from the bar.', 'Long neck; ribs controlled.'],
      ['Tree-line shuttle', 'Quick run between two chosen trees.', 'Turn low and accelerate smoothly.'],
      ['Playground crawl', 'Bear crawl around one safe landmark.', 'Opposite hand and foot move.']
    ],
    stairs: [
      ['Summit climb', 'Climb steadily, walk down under control.', 'Whole foot on each step.'],
      ['Step drive', 'Drive one knee up from the first step.', 'Stand tall on the supporting leg.'],
      ['Incline push-up', 'Push-ups with hands on a stable step.', 'Chest reaches the step.'],
      ['Hill march', 'Power-march uphill with active arms.', 'Push the ground behind you.'],
      ['Stair squat', 'Tap the step, then stand with control.', 'Sit back without collapsing.'],
      ['Summit hold', 'Wall sit or squat hold at the top.', 'Breathe behind the brace.']
    ],
    home: [
      ['Shadow crawl', 'Bear crawl forward and back in a short lane.', 'Slow enough to stay quiet.'],
      ['Temple push-up', 'Choose wall, incline, knee, or floor push-ups.', 'Use the level you can own.'],
      ['Silent squat', 'Squat without making floor noise.', 'Control every landing.'],
      ['Hollow shield', 'Dead bug or hollow hold.', 'Lower back stays connected.'],
      ['Doorway balance', 'Single-leg balance with slow reaches.', 'Keep the standing foot alive.'],
      ['Floor flow', 'Move squat → plank → squat with control.', 'Quality before speed.']
    ]
  };

  const GAMES = [
    {
      icon: '骰', name: 'Technique Dice', group: 'Solo or group',
      text: 'Roll 1–6. The number is your reps; the suit decides push, pull, legs, core, locomotion, or mobility.'
    },
    {
      icon: '影', name: 'Shadow Sensei', group: 'Pairs',
      text: 'Leader moves for 20 seconds. Partner mirrors perfectly. Switch leaders; award one point for control.'
    },
    {
      icon: '王', name: 'Boss Battle', group: 'Any size',
      text: 'The group earns damage only from clean reps. Sloppy form heals the boss. Defeat 100 HP together.'
    },
    {
      icon: '旗', name: 'Capture the Marker', group: 'Outdoors',
      text: 'Place two markers. Win one movement challenge to advance; reach the far marker before time expires.'
    },
    {
      icon: '静', name: 'Silent Ninja', group: 'Solo or group',
      text: 'Squat, crawl, hop, and land without sound. Lose a life for every noisy landing. Start with three lives.'
    },
    {
      icon: '連', name: 'Combo Forge', group: 'Creative',
      text: 'Each person adds one safe move. Repeat the growing sequence from memory until it becomes a flow.'
    }
  ];

  const COACH_POOLS = {
    foundations: [
      ['Breathing squat', '6 slow reps', 'Tripod foot • knees track toes', 'Use a chair target if depth changes control.'],
      ['Incline push-up', '6–10 reps', 'Ribs down • chest between hands', 'Raise the hands until the body stays in one line.'],
      ['Bear hover', '3 × 15–25 sec', 'Push floor away • knees low', 'Put knees down between short holds.'],
      ['Dead bug', '6 per side', 'Exhale • low back connected', 'Move only one limb at a time.']
    ],
    upper: [
      ['Scapular push-up', '8–12 reps', 'Straight arms • move shoulder blades', 'Use a wall or bench.'],
      ['Push-up progression', '5–10 reps', 'Whole body descends together', 'Raise the incline before form bends.'],
      ['Body row / towel row', '6–10 reps', 'Elbows toward pockets', 'Use slower negatives when equipment is limited.'],
      ['Active hang / wall slide', '15–30 sec', 'Long neck • active shoulders', 'Keep feet supported when needed.']
    ],
    lower: [
      ['Snap-down landing', '5 reps', 'Quiet feet • hips back', 'Rise onto toes, then catch without jumping.'],
      ['Split squat', '6 per side', 'Front heel heavy • tall torso', 'Hold support for balance.'],
      ['Broad jump or fast step', '4–6 reps', 'Load • explode • freeze landing', 'Replace jump with powerful calf raise.'],
      ['Lateral bound / step', '5 per side', 'Own one leg before returning', 'Shorten the distance.']
    ],
    core: [
      ['Dead bug', '6 per side', 'Exhale fully • ribs down', 'Heel taps only.'],
      ['Side plank', '15–30 sec / side', 'Long line • floor pushed away', 'Bottom knee stays down.'],
      ['Bear shoulder tap', '6 per side', 'Hips stay quiet', 'Widen feet or hold the hover.'],
      ['Hollow hold', '15–30 sec', 'Only lower as far as you control', 'Tuck knees.']
    ],
    conditioning: [
      ['Shadow Sensei', '4 × 20 sec', 'Match shape before speed', 'Use low-impact movements.'],
      ['Marker shuttle', '4–6 trips', 'Smooth turn • tall acceleration', 'Power-walk the route.'],
      ['Squat–crawl relay', '3 rounds', 'Quiet feet • quality transitions', 'Remove speed and shorten distance.'],
      ['Boss Battle', '2 minutes', 'Only clean reps damage the boss', 'Choose one mastered movement.']
    ],
    mobility: [
      ['Joint circles', '45 sec', 'Small pain-free range', 'Slow down near sticky angles.'],
      ['World’s greatest stretch', '4 per side', 'Long spine • easy breath', 'Keep back knee down.'],
      ['90/90 switches', '6–10 reps', 'Rotate from the hips', 'Use hands behind you.'],
      ['Child’s pose reach', '5 breaths / side', 'Expand the back ribs', 'Reduce the reach.']
    ]
  };

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function randomItem(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function shuffled(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function saveState(patch) {
    let current = {};
    try { current = JSON.parse(LS.getItem(STORE_KEY) || '{}'); } catch (_) {}
    LS.setItem(STORE_KEY, JSON.stringify(Object.assign(current, patch)));
  }

  function loadState() {
    try { return JSON.parse(LS.getItem(STORE_KEY) || '{}'); } catch (_) { return {}; }
  }

  function paintGames() {
    const host = document.getElementById('game-vault');
    if (!host || host.dataset.ready) return;
    host.dataset.ready = '1';
    host.innerHTML = GAMES.map((game) => `
      <article class="game-card">
        <span class="game-card-icon">${game.icon}</span>
        <span class="game-card-group">${esc(game.group)}</span>
        <h3>${esc(game.name)}</h3>
        <p>${esc(game.text)}</p>
      </article>
    `).join('');
  }

  function createPreset(name, moves, rounds, workSec, restSec, tags) {
    return {
      id: 'field_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      description: 'Generated by Hashira Field Mode',
      rounds,
      restBetweenExercisesSec: restSec,
      restBetweenRoundsSec: Math.max(45, restSec * 2),
      assignedDays: [],
      tags,
      exercises: moves.map((move) => ({
        key: 'plnk',
        name: move[0],
        note: move[1],
        tag: 'WORK',
        durationSec: workSec,
        category: 'conditioning'
      }))
    };
  }

  function launchPreset(preset) {
    const P = window.HASHIRA_PRESETS;
    if (!P || typeof P.saveUserPreset !== 'function' || typeof window.loadHashiraPresetById !== 'function') {
      alert('The training engine is still loading. Try again in a moment.');
      return;
    }
    P.saveUserPreset(preset);
    window.loadHashiraPresetById(preset.id);
  }

  function buildAdventure() {
    const worldEl = document.getElementById('adventure-world');
    const timeEl = document.getElementById('adventure-time');
    const energyEl = document.getElementById('adventure-energy');
    const partyEl = document.getElementById('adventure-party');
    const host = document.getElementById('adventure-result');
    if (!worldEl || !host) return;

    let world = worldEl.value;
    if (world === 'surprise') world = randomItem(Object.keys(MOVES));
    const minutes = Number(timeEl.value) || 20;
    const energy = energyEl.value;
    const party = partyEl.value;
    const moveCount = minutes <= 12 ? 3 : minutes <= 20 ? 4 : 5;
    const moves = shuffled(MOVES[world]).slice(0, moveCount);
    const rounds = minutes <= 12 ? 2 : minutes <= 30 ? 3 : 4;
    const work = energy === 'restore' ? 35 : energy === 'fire' ? 50 : 42;
    const rest = energy === 'restore' ? 30 : energy === 'fire' ? 20 : 25;
    const titleBits = {
      restore: ['Quiet Current', 'Restoration Path', 'Breath of Water'],
      steady: ['Wayfinder Trial', 'Road of Discipline', 'Guardian Route'],
      fire: ['Flame Trial', 'Storm Chapter', 'Warrior’s Ascent']
    };
    const title = `${WORLD_LABELS[world]}: ${randomItem(titleBits[energy])}`;
    const partyRule = {
      solo: 'Complete the path with clean form. Your opponent is yesterday.',
      duo: 'Alternate leader each movement. The partner mirrors and gives one useful cue.',
      squad: 'Move as a team. Nobody starts the next station until everyone arrives.'
    }[party];
    const boss = randomItem([
      'Boss: hold perfect form for a combined 60 seconds.',
      'Boss: earn 30 clean team reps before the final minute ends.',
      'Boss: complete one silent round—no noisy landings.',
      'Boss: repeat the cleanest station and improve its quality.'
    ]);
    const preset = createPreset(title, moves, rounds, work, rest, ['adventure', world, party]);

    host.innerHTML = `
      <article class="mission-scroll">
        <div class="mission-scroll-head">
          <div><span class="eyebrow">${esc(WORLD_LABELS[world])} · ${minutes} MIN · ${esc(party.toUpperCase())}</span><h2>${esc(title)}</h2></div>
          <span class="mission-rank">${energy === 'fire' ? 'S' : energy === 'steady' ? 'A' : 'B'}</span>
        </div>
        <p class="mission-party-rule">${esc(partyRule)}</p>
        <div class="mission-stages">
          ${moves.map((move, index) => `
            <div class="mission-stage">
              <span class="mission-stage-num">${String(index + 1).padStart(2, '0')}</span>
              <div><strong>${esc(move[0])}</strong><p>${esc(move[1])}</p><small>Sensei cue: ${esc(move[2])}</small></div>
            </div>
          `).join('')}
        </div>
        <div class="boss-card"><span>BOSS ENCOUNTER</span><strong>${esc(boss)}</strong></div>
        <div class="mission-scroll-actions">
          <button class="btn-cta btn-cta-primary" type="button" id="launch-adventure">Launch in timer</button>
          <button class="btn-cta btn-cta-secondary" type="button" id="reroll-adventure">Reroll mission</button>
        </div>
      </article>
    `;
    host.querySelector('#launch-adventure').onclick = () => launchPreset(preset);
    host.querySelector('#reroll-adventure').onclick = buildAdventure;
    saveState({ lastAdventure: { world, minutes, energy, party } });
  }

  function adjustForReadiness(pool, readiness) {
    if (readiness === 'green') return pool;
    if (readiness === 'amber') {
      return pool.map((x) => [x[0], x[1], x[2], `${x[3]} Keep two reps in reserve today.`]);
    }
    return COACH_POOLS.mobility.map((x) => [x[0], x[1], x[2], `${x[3]} Stop if symptoms increase.`]);
  }

  function buildCoachSession() {
    const student = document.getElementById('coach-student').value.trim() || 'Today’s athlete';
    const focus = document.getElementById('coach-focus').value;
    const level = document.getElementById('coach-level').value;
    const duration = Number(document.getElementById('coach-duration').value) || 30;
    const space = document.getElementById('coach-space').value;
    const readiness = document.querySelector('[name="coach-readiness"]:checked')?.value || 'green';
    const host = document.getElementById('coach-result');
    const pool = adjustForReadiness(COACH_POOLS[focus] || COACH_POOLS.foundations, readiness);
    const rounds = duration <= 20 ? 2 : duration <= 45 ? 3 : 4;
    const work = level === 'beginner' ? 35 : 45;
    const presetMoves = pool.map((x) => [x[0], `${x[1]} — ${x[2]}`, x[2]]);
    const preset = createPreset(`Coaching: ${student}`, presetMoves, rounds, work, 30, ['coach', focus, space]);
    const color = readiness === 'green' ? 'Ready to build' : readiness === 'amber' ? 'Reduce volume 20%' : 'Recovery session';

    host.innerHTML = `
      <article class="coach-board">
        <div class="coach-board-head">
          <div><span class="eyebrow">${esc(student)} · ${duration} MIN · ${esc(space.toUpperCase())}</span><h2>${esc(color)}</h2></div>
          <span class="readiness-orb readiness-orb--${esc(readiness)}">${readiness === 'green' ? 'GO' : readiness === 'amber' ? 'ADJUST' : 'CARE'}</span>
        </div>
        <div class="coach-arc">
          <div><span>01</span><strong>Arrive</strong><small>2-minute check-in + pulse raiser</small></div>
          <div><span>02</span><strong>Learn</strong><small>Demonstrate the session’s key shape</small></div>
          <div><span>03</span><strong>Build</strong><small>${rounds} quality rounds</small></div>
          <div><span>04</span><strong>Win</strong><small>Finish with one clean proof of progress</small></div>
        </div>
        <div class="coach-move-list">
          ${pool.map((move, index) => `
            <article class="coach-move">
              <div class="coach-move-title"><span>${index + 1}</span><h3>${esc(move[0])}</h3><b>${esc(move[1])}</b></div>
              <div class="coach-move-columns">
                <p><small>SAY</small>${esc(move[2])}</p>
                <p><small>REGRESS</small>${esc(move[3])}</p>
              </div>
              <div class="coach-score" data-score="${index}">
                <span>Control:</span>
                <button type="button" data-value="learning">Learning</button>
                <button type="button" data-value="solid">Solid</button>
                <button type="button" data-value="owned">Owned</button>
              </div>
            </article>
          `).join('')}
        </div>
        <div class="coach-finish-note">
          <label class="field-label" for="coach-note">One victory to remember</label>
          <textarea id="coach-note" rows="2" placeholder="Example: controlled every incline push-up with ribs down."></textarea>
        </div>
        <div class="mission-scroll-actions">
          <button class="btn-cta btn-cta-primary" type="button" id="launch-coach-session">Run with full-screen timer</button>
          <button class="btn-cta btn-cta-secondary" type="button" id="copy-coach-brief">Copy session brief</button>
        </div>
      </article>
    `;
    host.querySelectorAll('.coach-score button').forEach((button) => {
      button.onclick = () => {
        button.parentElement.querySelectorAll('button').forEach((x) => x.classList.remove('active'));
        button.classList.add('active');
      };
    });
    host.querySelector('#launch-coach-session').onclick = () => launchPreset(preset);
    host.querySelector('#copy-coach-brief').onclick = async () => {
      const lines = [
        `HASHIRA COACHING SESSION — ${student}`,
        `${duration} min · ${space} · ${color}`,
        '',
        ...pool.map((x, i) => `${i + 1}. ${x[0]} — ${x[1]}\nCue: ${x[2]}\nOption: ${x[3]}`),
        '',
        'Method: Explain → Demonstrate → Observe → Adjust'
      ];
      try {
        await navigator.clipboard.writeText(lines.join('\n'));
        const button = host.querySelector('#copy-coach-brief');
        button.textContent = 'Brief copied';
        setTimeout(() => { button.textContent = 'Copy session brief'; }, 1600);
      } catch (_) {
        alert(lines.join('\n'));
      }
    };
    saveState({ lastCoach: { student, focus, level, duration, space, readiness } });
  }

  let cameraStream = null;
  let mirrored = true;

  async function toggleCamera() {
    const video = document.getElementById('coach-camera');
    const placeholder = document.getElementById('camera-placeholder');
    const button = document.getElementById('camera-toggle');
    const status = document.getElementById('camera-status');
    if (!video) return;
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      cameraStream = null;
      video.srcObject = null;
      video.classList.remove('active');
      placeholder.classList.remove('hidden');
      button.textContent = 'Start camera';
      status.textContent = 'Camera off';
      status.classList.remove('active');
      return;
    }
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      video.srcObject = cameraStream;
      await video.play();
      video.classList.add('active');
      placeholder.classList.add('hidden');
      button.textContent = 'Stop camera';
      status.textContent = 'Live mirror';
      status.classList.add('active');
    } catch (_) {
      alert('Camera access was not available. Check browser permission and make sure the page uses HTTPS.');
    }
  }

  function restoreControls() {
    const saved = loadState();
    const adventure = saved.lastAdventure;
    if (adventure) {
      ['world', 'time', 'energy', 'party'].forEach((key) => {
        const el = document.getElementById(`adventure-${key}`);
        if (el && adventure[key] != null && [...el.options].some((x) => x.value === String(adventure[key]))) {
          el.value = String(adventure[key]);
        }
      });
    }
    const coach = saved.lastCoach;
    if (coach) {
      ['student', 'focus', 'level', 'duration', 'space'].forEach((key) => {
        const el = document.getElementById(`coach-${key}`);
        if (el && coach[key] != null) el.value = String(coach[key]);
      });
      const ready = document.querySelector(`[name="coach-readiness"][value="${coach.readiness}"]`);
      if (ready) ready.checked = true;
    }
  }

  function wireUi() {
    paintGames();
    restoreControls();
    document.getElementById('adventure-generate')?.addEventListener('click', buildAdventure);
    document.getElementById('coach-build')?.addEventListener('click', buildCoachSession);
    document.getElementById('camera-toggle')?.addEventListener('click', toggleCamera);
    document.getElementById('camera-flip')?.addEventListener('click', (event) => {
      mirrored = !mirrored;
      const video = document.getElementById('coach-camera');
      if (video) video.classList.toggle('camera-unmirrored', !mirrored);
      event.currentTarget.textContent = `Mirror: ${mirrored ? 'on' : 'off'}`;
    });
    document.getElementById('open-video-room')?.addEventListener('click', () => {
      const input = document.getElementById('video-room-link');
      const value = input?.value.trim();
      if (!value) {
        input?.focus();
        return;
      }
      let url;
      try { url = new URL(value); } catch (_) {
        alert('Paste a complete link beginning with https://');
        return;
      }
      if (url.protocol !== 'https:') {
        alert('For safety, use an HTTPS video-room link.');
        return;
      }
      window.open(url.href, 'hashira_video_room', 'popup,width=900,height=720');
    });
  }

  function refresh(route) {
    paintGames();
    if (route === 'adventure' && !document.getElementById('adventure-result')?.children.length) buildAdventure();
  }

  window.HASHIRA_EXPEDITIONS = { refresh, buildAdventure, buildCoachSession };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireUi);
  else wireUi();
})();
