(function () {
  const LEGACY_SCALAR = new Set([
    'xp',
    'doneDays',
    'discipline',
    'dayType',
    'athlete',
    'level',
    'equipGym',
    'equipCali',
    'equipBD',
    'equipPil',
    'joint',
    'autoLoad',
    'historyMode',
    'rounds',
    'work',
    'rest',
    'roundRest',
    'smartMode',
    'sound',
    'autoNext',
    'autoCheck',
    'verseOnOpen',
    'autoSync'
  ]);

  function isDynamicKeyed(logicalKey) {
    return (
      logicalKey.startsWith('history_') ||
      logicalKey.startsWith('weeklyPlan_') ||
      logicalKey.startsWith('check_')
    );
  }

  function shouldMigrateFromLegacy(logicalKey) {
    return LEGACY_SCALAR.has(logicalKey) || isDynamicKeyed(logicalKey);
  }

  function toPhysKey(logicalKey) {
    if (!logicalKey) return logicalKey;
    if (logicalKey.startsWith('hashira_')) return logicalKey;
    if (shouldMigrateFromLegacy(logicalKey)) return 'hashira_' + logicalKey;
    return logicalKey;
  }

  function getItem(logicalKey) {
    const phys = toPhysKey(logicalKey);
    let v = localStorage.getItem(phys);
    if (v !== null) return v;
    if (!shouldMigrateFromLegacy(logicalKey)) return null;
    v = localStorage.getItem(logicalKey);
    if (v !== null) {
      try {
        localStorage.setItem(phys, v);
      } catch (_) {}
    }
    return v;
  }

  function setItem(logicalKey, value) {
    localStorage.setItem(toPhysKey(logicalKey), value);
  }

  function removeItem(logicalKey) {
    localStorage.removeItem(toPhysKey(logicalKey));
    if (shouldMigrateFromLegacy(logicalKey)) {
      try {
        localStorage.removeItem(logicalKey);
      } catch (_) {}
    }
  }

  window.HASHIRA_LS = { getItem, setItem, removeItem };
})();
