(function(){
  function isoKey(d){ return d.toISOString().split('T')[0]; }
  function getTodayKey(){ return isoKey(new Date()); }
  function yesterdayKey(){ const d = new Date(); d.setDate(d.getDate()-1); return isoKey(d); }

  const LS = window.HASHIRA_LS || {
    getItem: function (k) { return localStorage.getItem(k); },
    setItem: function (k, v) { localStorage.setItem(k, v); },
    removeItem: function (k) { localStorage.removeItem(k); }
  };

  const state = {
    xp: parseInt(LS.getItem('xp'), 10) || 0,
    doneDays: JSON.parse(LS.getItem('doneDays') || '{}') || {},
    streak: 0,
    timer: null,
    timeLeft: 50,
    stepTotal: 50,
    currentStep: 0,
    currentRound: 1,
    isRunning: false,
    sessionSteps: []
  };

  window.HASHIRA_STATE = { state, isoKey, getTodayKey, yesterdayKey };
})();
