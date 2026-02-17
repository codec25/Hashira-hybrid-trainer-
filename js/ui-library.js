(function(){
  function renderLibraryScreen() {
    const listWrap = document.getElementById('library-list');
    const summary = document.getElementById('library-summary');
    if (!listWrap || !summary || !window.HASHIRA_APP_API) return;

    const { pickLib, currentEquipMode, applyEquipmentToList } = window.HASHIRA_APP_API;
    const ath = document.getElementById('athlete-select')?.value;
    const discipline = document.getElementById('discipline-select')?.value;
    const lvl = document.getElementById('level-select')?.value;
    const day = document.getElementById('day-type-select')?.value;
    if (!ath || !discipline || !lvl || !day) return;

    const equipMode = currentEquipMode(discipline);
    const base = pickLib(ath, discipline, lvl, day);
    const filtered = applyEquipmentToList(base.slice(), discipline, equipMode);

    summary.textContent = `Athlete: ${ath} | Discipline: ${discipline} | Level: ${lvl} | Day Type: ${day} | Equipment mode: ${equipMode}`;
    listWrap.innerHTML = '';

    if (!filtered.length) {
      listWrap.innerHTML = '<div class="hint">No entries found for this combination.</div>';
      return;
    }

    filtered.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'checklist-item';
      const tutorialUrl = item.url || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${discipline} ${item.name} tutorial`)}`;
      row.innerHTML = `
        <div>
          <div style="font-weight:900"><a href="${tutorialUrl}" target="_blank" rel="noopener noreferrer" class="move-link">${item.name}</a></div>
          <div style="font-size:.76rem; color:var(--text-dim)">${item.note || '-'} </div>
          <div style="font-size:.7rem; color:var(--text-dim)">Category: ${item.cat || 'Skill'} | Equip: ${(item.equip || ['n/a']).join(', ')}</div>
        </div>
        <span class="tag ${item.tag === 'WORK' ? 'tag-work' : item.tag === 'SKILL' ? 'tag-skill' : item.tag === 'SHOULDER' ? 'tag-shoulder' : 'tag-rest'}">${item.tag || 'SKILL'}</span>
      `;
      listWrap.appendChild(row);
    });
  }

  window.renderLibraryScreen = renderLibraryScreen;
})();
