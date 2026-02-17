(function(){
  function setRingVisible(isRest, labelText) {
    const ring = document.getElementById('rest-ring');
    const lab = document.getElementById('rest-ring-label');
    if (!ring || !lab) return;
    ring.style.display = isRest ? 'flex' : 'none';
    lab.style.display = isRest ? 'block' : 'none';
    if (isRest) lab.textContent = labelText || 'REST';
  }

  function updateRingProgress() {
    const api = window.HASHIRA_APP_API;
    if (!api) return;
    const { state } = window.HASHIRA_STATE;
    const step = state.sessionSteps[state.currentStep];
    const isRest = !!(step && step.tag === 'REST');
    if (!isRest) return;

    const circle = document.getElementById('rest-ring-progress');
    if (!circle) return;

    const r = 48;
    const C = 2 * Math.PI * r;
    const total = Math.max(1, state.stepTotal || step.durationSec || 1);
    const left = Math.max(0, state.timeLeft);
    const done = (total - left) / total;
    const clamped = Math.min(1, Math.max(0, done));

    circle.style.strokeDasharray = `${C} ${C}`;
    circle.style.strokeDashoffset = `${C * clamped}`;
  }

  function updateTimerDisplay() {
    const { state } = window.HASHIRA_STATE;
    const m = Math.floor(state.timeLeft / 60);
    const s = state.timeLeft % 60;
    const timerText = document.getElementById('timer-text');
    if (timerText) timerText.innerText = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }

  function beep() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const audioCtx = new AudioCtx();
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.connect(g); g.connect(audioCtx.destination);
    osc.type = 'sine'; osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    g.gain.setValueAtTime(0.12, audioCtx.currentTime);
    osc.start(); osc.stop(audioCtx.currentTime + 0.18);
    osc.onended = () => { try { audioCtx.close(); } catch (_) {} };
  }

  function startTimer() {
    const api = window.HASHIRA_APP_API;
    const { state } = window.HASHIRA_STATE;
    if (!api || state.isRunning) return;

    state.isRunning = true;
    const btnStart = document.getElementById('btn-start');
    if (btnStart) {
      btnStart.innerText = 'Running...';
      btnStart.style.background = 'var(--accent)';
    }

    state.timer = setInterval(() => {
      state.timeLeft--;
      if (state.timeLeft <= 0) {
        if (document.getElementById('toggle-sound')?.checked) beep();
        if (document.getElementById('toggle-auto-next')?.checked) api.nextStep();
        else pauseTimer();
      }
      updateTimerDisplay();
      updateRingProgress();
    }, 1000);
  }

  function pauseTimer() {
    const { state } = window.HASHIRA_STATE;
    state.isRunning = false;
    clearInterval(state.timer);
    const btnStart = document.getElementById('btn-start');
    if (btnStart) {
      btnStart.innerText = 'Resume';
      btnStart.style.background = 'var(--primary-blue)';
    }
  }

  function toggleTimer() {
    const { state } = window.HASHIRA_STATE;
    state.isRunning ? pauseTimer() : startTimer();
  }

  window.HASHIRA_TIMER = {
    setRingVisible,
    updateRingProgress,
    updateTimerDisplay,
    beep,
    startTimer,
    pauseTimer,
    toggleTimer
  };

  window.toggleTimer = toggleTimer;
  window.pauseTimer = pauseTimer;
})();
