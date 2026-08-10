(function () {
  'use strict';

  const LS = window.HASHIRA_LS || localStorage;
  const STORE_KEY = 'hashira_community_v1';
  const PROFILE_KEY = 'hashira_movement_profile_v1';
  let activeTab = 'mine';
  let activeThreadId = '';
  let remoteProfile = null;
  let remoteState = {
    checked: false,
    backendReady: false,
    authenticated: false,
    csrf: '',
    user: null,
    loginUrl: 'auth/login.php?next=%23circles',
    registerUrl: 'auth/register.php?next=%23circles',
    logoutUrl: 'auth/logout.php'
  };
  let chatSyncTimer = 0;

  function apiUrl(path) {
    return new URL('api/' + String(path).replace(/^\/+/, ''), document.baseURI).href;
  }

  async function apiRequest(path, options) {
    const init = Object.assign({ credentials: 'same-origin' }, options || {});
    init.headers = Object.assign({ Accept: 'application/json' }, init.headers || {});
    if (remoteState.csrf) init.headers['X-Hashira-CSRF'] = remoteState.csrf;
    if (init.body && typeof init.body !== 'string') {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(init.body);
    }
    const response = await fetch(apiUrl(path), init);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.error || 'request_failed');
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  async function syncRemote(options) {
    try {
      const payload = await apiRequest('bootstrap.php');
      remoteState.checked = true;
      remoteState.backendReady = Boolean(payload.backend_ready);
      remoteState.authenticated = Boolean(payload.authenticated);
      remoteState.csrf = payload.csrf || '';
      remoteState.user = payload.user || null;
      remoteState.loginUrl = payload.login_url || remoteState.loginUrl;
      remoteState.registerUrl = payload.register_url || remoteState.registerUrl;
      remoteState.logoutUrl = payload.logout_url || remoteState.logoutUrl;
      if (remoteState.authenticated && payload.store) {
        try { localStorage.setItem('hashira_account_session_hint', '1'); } catch (_) {}
        writeStore(payload.store);
        remoteProfile = payload.profile || null;
        if (!activeThreadId || !payload.store.threads.some((item) => String(item.id) === String(activeThreadId))) {
          activeThreadId = payload.store.activeThreadId || payload.store.threads[0]?.id || '';
        }
      } else {
        try { localStorage.removeItem('hashira_account_session_hint'); } catch (_) {}
        remoteProfile = null;
      }
      renderAccountAccess();
      if (!options?.quiet) refresh(window.HASHIRA_ROUTER?.getRouteFromHash?.() || 'home');
      return payload;
    } catch (_) {
      remoteState.checked = true;
      remoteState.backendReady = false;
      remoteState.authenticated = false;
      renderAccountAccess();
      return null;
    }
  }

  function requireAccount() {
    if (remoteState.authenticated) return true;
    location.href = remoteState.backendReady ? remoteState.registerUrl : 'setup.php';
    return false;
  }

  function renderAccountAccess() {
    const actions = document.querySelector('.app-header-actions');
    if (!actions) return;
    let host = document.getElementById('hashira-account-access');
    if (!host) {
      host = document.createElement('div');
      host.id = 'hashira-account-access';
      host.className = 'hashira-account-access';
      actions.prepend(host);
    }
    if (remoteState.authenticated) {
      host.innerHTML = `
        <button type="button" class="hashira-account-chip" data-account-profile>
          <span>${esc(initials(remoteState.user?.name || 'H'))}</span>
          <b>${esc(remoteState.user?.name || 'Account')}</b>
        </button>
        <a class="hashira-account-logout" href="${esc(remoteState.logoutUrl)}">Sign out</a>
      `;
      host.querySelector('[data-account-profile]')?.addEventListener('click', () => { location.hash = '#profile'; });
    } else {
      host.innerHTML = `
        <a class="hashira-account-signin" href="${esc(remoteState.loginUrl)}">Sign in</a>
        <a class="hashira-account-create" href="${esc(remoteState.registerUrl)}">Join</a>
      `;
    }
  }

  const DEMO_CIRCLES = [
    {
      id: 'freedom-circle',
      name: 'Freedom Movement Circle',
      focus: 'Hybrid movement',
      area: 'Aylmer',
      rhythm: 'Saturday · 10:00 AM',
      privacy: 'discoverable',
      coach: 'Moise',
      coachRole: 'Hybrid movement coach',
      color: 'lime',
      members: 8,
      joined: true,
      description: 'Calisthenics foundations, movement freedom, parkour-inspired play, and conditioning without the gym atmosphere.',
      nextMission: 'Beach Expedition · Saturday',
      meetingNote: 'Accepted members receive the exact meeting point.',
      tags: ['Beginner friendly', 'Outdoors', 'English + Français']
    },
    {
      id: 'foundation-lab',
      name: 'Foundation Lab',
      focus: 'Calisthenics foundations',
      area: 'Gatineau',
      rhythm: 'Tuesday · 6:30 PM',
      privacy: 'private',
      coach: 'Coach Amara',
      coachRole: 'Personal trainer',
      color: 'sky',
      members: 12,
      joined: false,
      description: 'A supportive strength circle for people learning push-ups, pull-ups, squats, core control, and confident technique.',
      nextMission: 'Push + Core Foundations',
      meetingNote: 'Request access to see session details.',
      tags: ['Structured', 'Technique', 'All levels']
    },
    {
      id: 'sunset-engine',
      name: 'Sunset Engine',
      focus: 'Outdoor conditioning',
      area: 'Ottawa',
      rhythm: 'Thursday · 7:00 PM',
      privacy: 'discoverable',
      coach: 'Coach Malik',
      coachRole: 'Conditioning coach',
      color: 'coral',
      members: 19,
      joined: false,
      description: 'Short, playful conditioning sessions built around relays, partner challenges, and team boss battles.',
      nextMission: '100 HP Team Boss',
      meetingNote: 'General area is public. Details unlock after joining.',
      tags: ['Social', 'High energy', 'Outdoor']
    }
  ];

  const DEMO_COACHES = [
    {
      id: 'moise',
      name: 'Moise',
      monogram: 'M',
      title: 'Hybrid movement coach',
      area: 'Ottawa–Gatineau',
      specialties: ['Calisthenics', 'Dance movement', 'Body control'],
      bio: 'Movement quality, freedom, rhythm, and foundations that help people feel capable in their bodies.',
      color: 'lime',
      verified: false,
      circleId: 'freedom-circle'
    },
    {
      id: 'amara',
      name: 'Coach Amara',
      monogram: 'A',
      title: 'Personal trainer · Demo profile',
      area: 'Gatineau',
      specialties: ['Strength', 'Beginners', 'Technique'],
      bio: 'A sample trainer profile showing how a professional could present their coaching approach and local circle.',
      color: 'sky',
      verified: true,
      circleId: 'foundation-lab'
    },
    {
      id: 'malik',
      name: 'Coach Malik',
      monogram: 'K',
      title: 'Conditioning coach · Demo profile',
      area: 'Ottawa',
      specialties: ['Conditioning', 'Groups', 'Outdoor fitness'],
      bio: 'A sample trainer profile focused on welcoming group sessions, teamwork, and energetic outdoor challenges.',
      color: 'coral',
      verified: true,
      circleId: 'sunset-engine'
    }
  ];

  function seedStore() {
    return {
      v: 1,
      circles: DEMO_CIRCLES,
      coaches: DEMO_COACHES,
      threads: [
        {
          id: 'freedom-circle',
          circleId: 'freedom-circle',
          name: 'Freedom Movement Circle',
          color: 'lime',
          unread: 2,
          messages: [
            { id: 'm1', from: 'Moise', own: false, body: 'Saturday’s mission is ready. We’ll build control first, then finish with a team boss battle.', time: 'Yesterday · 8:42 PM' },
            { id: 'm2', from: 'Jordan', own: false, body: 'I’m in 🙌 Is it beginner friendly?', time: '9:05 AM' },
            { id: 'm3', from: 'Moise', own: false, body: 'Yes. Every station has a foundation level and a stronger progression.', time: '9:12 AM' }
          ]
        }
      ],
      activeThreadId: 'freedom-circle',
      savedAt: new Date().toISOString()
    };
  }

  function readStore() {
    try {
      const parsed = JSON.parse(LS.getItem(STORE_KEY) || 'null');
      if (parsed && Array.isArray(parsed.circles) && Array.isArray(parsed.threads)) return parsed;
    } catch (_) {}
    const seeded = seedStore();
    writeStore(seeded);
    return seeded;
  }

  function writeStore(store) {
    store.savedAt = new Date().toISOString();
    LS.setItem(STORE_KEY, JSON.stringify(store));
  }

  function getBaseProfile() {
    const base = window.HASHIRA_USER_PROFILE?.load?.() || {};
    return {
      name: String(base.name || 'Moise'),
      goal: String(base.goal || 'Build strength and move freely.'),
      discipline: String(base.discipline || 'calisthenics')
    };
  }

  function readMovementProfile() {
    const base = getBaseProfile();
    if (remoteState.authenticated && remoteProfile) {
      return Object.assign({}, base, remoteProfile, {
        name: remoteState.user?.name || remoteProfile.name || base.name
      });
    }
    try {
      const stored = JSON.parse(LS.getItem(PROFILE_KEY) || 'null');
      if (stored && typeof stored === 'object') {
        return {
          name: base.name,
          goal: base.goal,
          discipline: base.discipline,
          role: String(stored.role || 'both'),
          area: String(stored.area || 'Ottawa–Gatineau'),
          bio: String(stored.bio || ''),
          times: String(stored.times || ''),
          partners: Boolean(stored.partners)
        };
      }
    } catch (_) {}
    return {
      name: base.name,
      goal: base.goal,
      discipline: base.discipline,
      role: 'both',
      area: 'Ottawa–Gatineau',
      bio: 'Hybrid movement, calisthenics foundations, rhythm, freedom, and body control.',
      times: 'Saturday mornings · weekday evenings',
      partners: true
    };
  }

  function saveMovementProfile(profile) {
    LS.setItem(PROFILE_KEY, JSON.stringify({
      v: 1,
      role: profile.role,
      area: profile.area,
      bio: profile.bio,
      times: profile.times,
      partners: profile.partners,
      savedAt: new Date().toISOString()
    }));
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function initials(name) {
    return String(name || 'H').split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0]).join('').toUpperCase();
  }

  function roleLabel(role) {
    return role === 'coach' ? 'Coach / trainer' : role === 'both' ? 'Athlete + coach' : 'Athlete / learner';
  }

  function circleCard(circle) {
    return `
      <article class="circle-card circle-card--${esc(circle.color)}" data-circle-id="${esc(circle.id)}">
        <div class="circle-card-art" aria-hidden="true">
          <span>${esc(initials(circle.name))}</span>
          <i></i><i></i><i></i>
        </div>
        <div class="circle-card-content">
          <div class="circle-card-topline">
            <span>${esc(circle.area)} · ${circle.privacy === 'private' ? 'Private' : 'Discoverable'}</span>
            ${circle.joined ? '<b>Joined</b>' : circle.requested ? '<b>Requested</b>' : ''}
          </div>
          <h2>${esc(circle.name)}</h2>
          <p>${esc(circle.description)}</p>
          <div class="circle-card-coach">
            <span>${esc(initials(circle.coach))}</span>
            <div><strong>${esc(circle.coach)}</strong><small>${esc(circle.coachRole)}</small></div>
          </div>
          <div class="circle-card-foot">
            <span><b>${circle.members}</b> people</span>
            <span>${esc(circle.rhythm)}</span>
            <button type="button" data-open-circle="${esc(circle.id)}">Open circle <i>→</i></button>
          </div>
        </div>
      </article>
    `;
  }

  function coachCard(coach) {
    return `
      <article class="coach-identity coach-identity--${esc(coach.color)}">
        <div class="coach-identity-photo">
          <span>${esc(coach.monogram)}</span>
          ${coach.verified ? '<b title="Profile information reviewed">✓</b>' : ''}
        </div>
        <div class="coach-identity-content">
          <small>${esc(coach.area)}</small>
          <h2>${esc(coach.name)}</h2>
          <strong>${esc(coach.title)}</strong>
          <p>${esc(coach.bio)}</p>
          <div class="coach-specialties">${coach.specialties.map((x) => `<span>${esc(x)}</span>`).join('')}</div>
          ${coach.circleId
            ? `<button type="button" data-open-circle="${esc(coach.circleId)}">View their circle <span>→</span></button>`
            : '<span class="coach-no-circle">No public circle yet</span>'}
        </div>
      </article>
    `;
  }

  function renderCircles() {
    const store = readStore();
    const circlesHost = document.getElementById('community-circles-view');
    const coachesHost = document.getElementById('community-coaches-view');
    if (!circlesHost || !coachesHost) return;

    document.querySelectorAll('[data-community-tab]').forEach((button) => {
      button.classList.toggle('active', button.dataset.communityTab === activeTab);
    });

    if (activeTab === 'coaches') {
      circlesHost.classList.add('hidden');
      coachesHost.classList.remove('hidden');
      coachesHost.innerHTML = `
        <div class="community-section-head">
          <div><span class="community-kicker">PEOPLE WHO CAN LEAD</span><h2>Find a coaching style that feels right.</h2></div>
          <p>Demo profiles are clearly labeled until real trainers add and review their information.</p>
        </div>
        <div class="coach-identity-grid">${store.coaches.map(coachCard).join('')}</div>
      `;
      return;
    }

    circlesHost.classList.remove('hidden');
    coachesHost.classList.add('hidden');
    const filtered = activeTab === 'mine' ? store.circles.filter((x) => x.joined) : store.circles;
    circlesHost.innerHTML = `
      <div class="community-section-head">
        <div>
          <span class="community-kicker">${activeTab === 'mine' ? 'YOUR PEOPLE' : 'NEARBY ENERGY'}</span>
          <h2>${activeTab === 'mine' ? 'Continue where your circle left off.' : 'A real session is closer than another scroll.'}</h2>
        </div>
        <p>${activeTab === 'mine' ? 'Missions, messages, and plans from circles you belong to.' : 'Only general areas appear publicly. Exact locations unlock after acceptance.'}</p>
      </div>
      ${remoteState.checked && !remoteState.authenticated ? `
        <aside class="community-account-banner">
          <div><span>✦</span><p><strong>${remoteState.backendReady ? 'Turn this preview into a real community.' : 'Account setup is ready to connect.'}</strong><small>${remoteState.backendReady ? 'Sign in to create circles and message across devices.' : 'Connect Hashira’s separate database to activate accounts.'}</small></p></div>
          <a href="${esc(remoteState.backendReady ? remoteState.registerUrl : 'setup.php')}">${remoteState.backendReady ? 'Create account' : 'Open setup'}</a>
        </aside>
      ` : ''}
      <div class="circle-card-grid">
        ${filtered.length ? filtered.map(circleCard).join('') : `
          <div class="community-empty">
            <span>⌁</span><h3>No circles yet</h3><p>Discover a nearby circle or create one for people you already know.</p>
            <button type="button" data-switch-community="discover">Discover circles</button>
          </div>
        `}
      </div>
    `;
  }

  function renderCircleSheet(circleId) {
    const store = readStore();
    const circle = store.circles.find((x) => x.id === circleId);
    const dialog = document.getElementById('circle-sheet');
    const host = document.getElementById('circle-sheet-body');
    if (!circle || !dialog || !host) return;
    host.innerHTML = `
      <section class="circle-sheet-hero circle-sheet-hero--${esc(circle.color)}">
        <span>${esc(initials(circle.name))}</span>
        <div><small>${esc(circle.area)} · ${esc(circle.focus)}</small><h2>${esc(circle.name)}</h2><p>${esc(circle.description)}</p></div>
      </section>
      <section class="circle-sheet-stats">
        <div><strong>${circle.members}</strong><span>People</span></div>
        <div><strong>${esc(circle.rhythm.split('·')[0].trim())}</strong><span>Usual day</span></div>
        <div><strong>${circle.privacy === 'private' ? 'Invite' : 'Request'}</strong><span>Access</span></div>
      </section>
      <section class="circle-sheet-mission">
        <span class="community-kicker">NEXT SHARED MISSION</span>
        <h3>${esc(circle.nextMission)}</h3>
        <p>${esc(circle.meetingNote)}</p>
        <div>${circle.tags.map((x) => `<span>${esc(x)}</span>`).join('')}</div>
      </section>
      <details class="circle-sheet-fold" open>
        <summary><span><b>About the coach</b><small>${esc(circle.coachRole)}</small></span><i>⌄</i></summary>
        <div><span class="circle-sheet-coach-avatar">${esc(initials(circle.coach))}</span><p><strong>${esc(circle.coach)}</strong> leads this circle. Professional credentials should only receive a verified mark after review.</p></div>
      </details>
      <details class="circle-sheet-fold">
        <summary><span><b>Community agreements</b><small>How this circle stays healthy</small></span><i>⌄</i></summary>
        <ul><li>Encourage progress without comparing bodies.</li><li>Ask before filming or posting another person.</li><li>Exact locations are shared only with accepted members.</li><li>Minors participate through guardian-approved arrangements.</li></ul>
      </details>
      ${Array.isArray(circle.requests) && circle.requests.length ? `
        <details class="circle-sheet-fold" open>
          <summary><span><b>Membership requests</b><small>${circle.requests.length} waiting</small></span><i>⌄</i></summary>
          <div class="circle-request-list">
            ${circle.requests.map((request) => `
              <article>
                <span>${esc(initials(request.name))}</span>
                <p><strong>${esc(request.name)}</strong><small>@${esc(request.username)} · ${esc(roleLabel(request.role))}</small></p>
                <div>
                  <button type="button" data-member-decision="decline" data-circle-id="${esc(circle.id)}" data-user-id="${esc(request.userId)}">Decline</button>
                  <button type="button" class="primary" data-member-decision="accept" data-circle-id="${esc(circle.id)}" data-user-id="${esc(request.userId)}">Accept</button>
                </div>
              </article>
            `).join('')}
          </div>
        </details>
      ` : ''}
      <div class="circle-sheet-actions">
        ${circle.joined
          ? `<button type="button" class="primary" data-open-chat="${esc(circle.id)}">Open circle chat</button>
             <button type="button" data-circle-mission="${esc(circle.id)}">View mission</button>`
          : circle.requested
            ? '<button type="button" disabled>Request pending</button>'
            : `<button type="button" class="primary" data-join-circle="${esc(circle.id)}">${circle.privacy === 'private' ? 'Request access' : 'Join circle'}</button>`
        }
      </div>
    `;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function ensureThread(circle) {
    const store = readStore();
    let thread = store.threads.find((x) => x.circleId === circle.id);
    if (!thread) {
      thread = {
        id: circle.id,
        circleId: circle.id,
        name: circle.name,
        color: circle.color,
        unread: 0,
        messages: [{
          id: 'welcome-' + Date.now(),
          from: circle.coach,
          own: false,
          body: `Welcome to ${circle.name}. Introduce yourself and share what you want to build.`,
          time: 'Now'
        }]
      };
      store.threads.unshift(thread);
      writeStore(store);
    }
    return thread;
  }

  async function joinCircle(circleId) {
    if (remoteState.checked && !remoteState.authenticated) {
      requireAccount();
      return;
    }
    if (remoteState.authenticated) {
      try {
        await apiRequest('circles.php', { method: 'POST', body: { action: 'join', circle_id: circleId } });
        document.getElementById('circle-sheet')?.close?.();
        activeTab = 'mine';
        await syncRemote();
      } catch (error) {
        alert(error.message === 'circle_not_found' ? 'That circle is no longer available.' : 'Hashira could not update the circle yet.');
      }
      return;
    }
    const store = readStore();
    const circle = store.circles.find((x) => x.id === circleId);
    if (!circle) return;
    circle.joined = true;
    circle.members += 1;
    writeStore(store);
    ensureThread(circle);
    document.getElementById('circle-sheet')?.close?.();
    activeTab = 'mine';
    renderCircles();
  }

  function renderThreadList() {
    const store = readStore();
    const host = document.getElementById('chat-thread-list');
    if (!host) return;
    if (!activeThreadId) activeThreadId = store.activeThreadId || store.threads[0]?.id || '';
    host.innerHTML = store.threads.length ? store.threads.map((thread) => {
      const last = thread.messages[thread.messages.length - 1];
      return `
        <button type="button" class="chat-thread ${thread.id === activeThreadId ? 'active' : ''}" data-thread-id="${esc(thread.id)}">
          <span class="chat-thread-avatar chat-thread-avatar--${esc(thread.color)}">${esc(initials(thread.name))}</span>
          <span class="chat-thread-copy"><b>${esc(thread.name)}</b><small>${esc(last?.body || 'Start the conversation')}</small></span>
          ${thread.unread ? `<i>${thread.unread}</i>` : '<time>Now</time>'}
        </button>
      `;
    }).join('') : '<div class="community-empty compact"><p>Join a circle to begin a conversation.</p></div>';
  }

  function renderActiveThread() {
    const store = readStore();
    const thread = store.threads.find((x) => x.id === activeThreadId) || store.threads[0];
    const head = document.getElementById('chat-stage-head');
    const messages = document.getElementById('chat-messages');
    const input = document.getElementById('chat-message-input');
    if (!head || !messages) return;
    if (!thread) {
      head.innerHTML = '<div><h3>No conversation selected</h3><p>Join a circle to start.</p></div>';
      messages.innerHTML = '<div class="chat-empty-stage"><span>✦</span><h3>Movement begins with an invitation.</h3><button type="button" onclick="location.hash=\'#circles\'">Find a circle</button></div>';
      if (input) input.disabled = true;
      return;
    }
    activeThreadId = thread.id;
    thread.unread = 0;
    store.activeThreadId = thread.id;
    writeStore(store);
    if (input) input.disabled = false;
    head.innerHTML = `
      <span class="chat-stage-avatar chat-thread-avatar--${esc(thread.color)}">${esc(initials(thread.name))}</span>
      <div><h3>${esc(thread.name)}</h3><p>${thread.messages.length} messages · Circle conversation</p></div>
      <button type="button" data-chat-circle="${esc(thread.circleId)}" aria-label="Circle details">•••</button>
    `;
    let previousFrom = '';
    messages.innerHTML = thread.messages.map((message) => {
      const grouped = previousFrom === message.from;
      previousFrom = message.from;
      return `
        <article class="chat-bubble-row ${message.own ? 'own' : ''} ${grouped ? 'grouped' : ''}">
          ${!message.own && !grouped ? `<span class="chat-message-avatar">${esc(initials(message.from))}</span>` : '<span></span>'}
          <div>
            ${!message.own && !grouped ? `<small>${esc(message.from)}</small>` : ''}
            <p>${esc(message.body).replace(/\n/g, '<br>')}</p>
            <time>${esc(message.time)}</time>
          </div>
        </article>
      `;
    }).join('');
    requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });
  }

  function renderChat() {
    renderThreadList();
    renderActiveThread();
  }

  async function sendMessage(body, messageType) {
    const clean = String(body || '').trim().slice(0, 1000);
    if (!clean || !activeThreadId) return;
    if (remoteState.checked && !remoteState.authenticated) {
      requireAccount();
      return;
    }
    if (remoteState.authenticated) {
      try {
        await apiRequest('messages.php', {
          method: 'POST',
          body: {
            circle_id: activeThreadId,
            content: clean,
            message_type: messageType === 'mission' ? 'mission' : 'text'
          }
        });
        await syncRemote({ quiet: true });
        renderChat();
      } catch (error) {
        alert(error.message === 'circle_membership_required' ? 'Circle membership is required.' : 'Message not sent. Try again.');
      }
      return;
    }
    const store = readStore();
    const thread = store.threads.find((x) => x.id === activeThreadId);
    if (!thread) return;
    thread.messages.push({
      id: 'message-' + Date.now().toString(36),
      from: getBaseProfile().name,
      own: true,
      body: clean,
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    });
    writeStore(store);
    renderChat();
  }

  function renderMovementProfile() {
    const profile = readMovementProfile();
    const body = document.getElementById('movement-profile-body');
    const monogram = document.getElementById('movement-profile-monogram');
    const avatarButton = document.getElementById('community-avatar-btn');
    if (monogram) monogram.textContent = initials(profile.name);
    if (avatarButton) avatarButton.textContent = initials(profile.name);
    if (body) {
      body.innerHTML = `
        <span class="community-kicker">${esc(roleLabel(profile.role).toUpperCase())}</span>
        <h2>${esc(profile.name)}</h2>
        <p>${esc(profile.bio || profile.goal)}</p>
        <div class="movement-profile-meta">
          <span>⌖ ${esc(profile.area || 'Area private')}</span>
          <span>◷ ${esc(profile.times || 'Schedule not shared')}</span>
        </div>
        <div class="movement-profile-status ${profile.partners ? 'open' : ''}">
          <i></i>${profile.partners ? 'Open to training-partner requests' : 'Not accepting partner requests'}
        </div>
      `;
    }
    const form = document.getElementById('movement-profile-form');
    if (form) {
      form.elements.role.value = profile.role;
      form.elements.area.value = profile.area;
      form.elements.bio.value = profile.bio;
      form.elements.times.value = profile.times;
      form.elements.partners.checked = profile.partners;
    }
  }

  async function createCircle(form) {
    const data = new FormData(form);
    if (remoteState.checked && !remoteState.authenticated) {
      requireAccount();
      return;
    }
    if (remoteState.authenticated) {
      try {
        const result = await apiRequest('circles.php', {
          method: 'POST',
          body: {
            action: 'create',
            name: data.get('name'),
            focus: data.get('focus'),
            area: data.get('area'),
            rhythm: data.get('rhythm'),
            privacy: data.get('privacy')
          }
        });
        form.reset();
        document.getElementById('create-circle-fold')?.removeAttribute('open');
        activeTab = 'mine';
        await syncRemote({ quiet: true });
        renderCircles();
        renderCircleSheet(String(result.circle_id));
      } catch (_) {
        alert('Hashira could not create the circle yet.');
      }
      return;
    }
    const store = readStore();
    const base = getBaseProfile();
    const circle = {
      id: 'circle-' + Date.now().toString(36),
      name: String(data.get('name') || 'New movement circle').trim().slice(0, 60),
      focus: String(data.get('focus') || 'Hybrid movement'),
      area: String(data.get('area') || 'Area private').trim().slice(0, 50),
      rhythm: String(data.get('rhythm') || 'Schedule together').trim().slice(0, 50),
      privacy: String(data.get('privacy') || 'private'),
      coach: base.name,
      coachRole: 'Circle creator',
      color: ['lime', 'sky', 'coral'][store.circles.length % 3],
      members: 1,
      joined: true,
      description: `A new ${String(data.get('focus') || 'movement').toLowerCase()} circle. Open the circle to add the first mission and welcome your people.`,
      nextMission: 'Choose the first mission',
      meetingNote: 'Exact meeting details belong in the private circle chat.',
      tags: ['New circle', String(data.get('focus') || 'Movement'), 'Community-led']
    };
    store.circles.unshift(circle);
    writeStore(store);
    ensureThread(circle);
    form.reset();
    document.getElementById('create-circle-fold')?.removeAttribute('open');
    activeTab = 'mine';
    renderCircles();
    renderCircleSheet(circle.id);
  }

  function wireUi() {
    document.querySelectorAll('[data-community-tab]').forEach((button) => {
      button.addEventListener('click', () => {
        activeTab = button.dataset.communityTab;
        renderCircles();
      });
    });
    document.getElementById('open-create-circle')?.addEventListener('click', () => {
      const fold = document.getElementById('create-circle-fold');
      if (fold) {
        fold.open = true;
        fold.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    document.getElementById('create-circle-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      createCircle(event.currentTarget);
    });
    document.getElementById('community-circles-view')?.addEventListener('click', communityClick);
    document.getElementById('community-coaches-view')?.addEventListener('click', communityClick);
    document.getElementById('circle-sheet-body')?.addEventListener('click', communityClick);
    document.getElementById('circle-sheet-close')?.addEventListener('click', () => document.getElementById('circle-sheet')?.close?.());
    document.getElementById('circle-sheet')?.addEventListener('click', (event) => {
      if (event.target === event.currentTarget) event.currentTarget.close();
    });
    document.getElementById('chat-thread-list')?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-thread-id]');
      if (!button) return;
      activeThreadId = button.dataset.threadId;
      renderChat();
      document.querySelector('.chat-stage')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    document.getElementById('chat-stage-head')?.addEventListener('click', communityClick);
    document.getElementById('chat-composer')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = document.getElementById('chat-message-input');
      sendMessage(input?.value);
      if (input) input.value = '';
    });
    document.getElementById('chat-mission-button')?.addEventListener('click', () => {
      sendMessage('New mission invitation: open Hashira Explore and choose our next adventure. ✦', 'mission');
    });
    document.getElementById('movement-profile-edit')?.addEventListener('click', () => {
      const fold = document.getElementById('movement-profile-fold');
      if (fold) {
        fold.open = true;
        fold.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    document.getElementById('movement-profile-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const payload = {
        role: form.elements.role.value,
        area: form.elements.area.value.trim().slice(0, 50),
        bio: form.elements.bio.value.trim().slice(0, 240),
        times: form.elements.times.value.trim().slice(0, 100),
        partners: form.elements.partners.checked
      };
      saveMovementProfile(payload);
      if (remoteState.authenticated) {
        try {
          await apiRequest('profile.php', { method: 'POST', body: payload });
          await syncRemote({ quiet: true });
        } catch (_) {
          alert('Saved on this device, but the account could not sync yet.');
        }
      }
      renderMovementProfile();
      document.getElementById('movement-profile-fold')?.removeAttribute('open');
    });
    renderMovementProfile();
  }

  function communityClick(event) {
    const open = event.target.closest('[data-open-circle]');
    if (open) return renderCircleSheet(open.dataset.openCircle);
    const detail = event.target.closest('[data-chat-circle]');
    if (detail) return renderCircleSheet(detail.dataset.chatCircle);
    const join = event.target.closest('[data-join-circle]');
    if (join) return joinCircle(join.dataset.joinCircle);
    const decision = event.target.closest('[data-member-decision]');
    if (decision) {
      handleMembershipDecision(
        decision.dataset.circleId,
        decision.dataset.userId,
        decision.dataset.memberDecision
      );
      return;
    }
    const chat = event.target.closest('[data-open-chat]');
    if (chat) {
      activeThreadId = chat.dataset.openChat;
      document.getElementById('circle-sheet')?.close?.();
      location.hash = '#chat';
      return;
    }
    const mission = event.target.closest('[data-circle-mission]');
    if (mission) {
      document.getElementById('circle-sheet')?.close?.();
      location.hash = '#adventure';
      return;
    }
    const switcher = event.target.closest('[data-switch-community]');
    if (switcher) {
      activeTab = switcher.dataset.switchCommunity;
      renderCircles();
    }
  }

  async function handleMembershipDecision(circleId, userId, decision) {
    if (!remoteState.authenticated) return;
    try {
      await apiRequest('circles.php', {
        method: 'POST',
        body: {
          action: 'membership_decision',
          circle_id: circleId,
          user_id: userId,
          decision
        }
      });
      await syncRemote({ quiet: true });
      renderCircles();
      renderCircleSheet(String(circleId));
    } catch (_) {
      alert('Hashira could not update that request yet.');
    }
  }

  function refresh(route) {
    if (route === 'circles') renderCircles();
    if (route === 'chat') {
      renderChat();
      clearInterval(chatSyncTimer);
      if (remoteState.authenticated) {
        chatSyncTimer = window.setInterval(async () => {
          if (window.HASHIRA_ROUTER?.getRouteFromHash?.() !== 'chat') return;
          await syncRemote({ quiet: true });
          renderChat();
        }, 8000);
      }
    } else {
      clearInterval(chatSyncTimer);
    }
    if (route === 'profile') renderMovementProfile();
  }

  window.HASHIRA_COMMUNITY = {
    refresh,
    readStore,
    readMovementProfile,
    renderCircleSheet
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireUi);
  else wireUi();
  syncRemote();
})();
