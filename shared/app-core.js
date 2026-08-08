/* ============================= SHARED APP CORE =============================
   Loaded by BOTH mom/index.html and granny/index.html.

   This file only ever READS the DB global and renders it. It contains no
   function that writes a booking, price, or guest note. Those mutating
   functions (openModal, saveBooking, cancelBooking, savePrices,
   updateGuestField, newBookingForGuest) live exclusively in
   mom/mom-app.js, which granny/index.html never loads — so there is no
   editing code path present at all in Granny's copy of the app, not just
   a hidden button.

   The one flag this file reads is CAN_EDIT, a boolean set by the page
   before app-core.js runs. It only controls passive rendering (whether
   a cell looks clickable, whether an input is disabled) — it never
   gates access to a mutating function, because for Granny's build those
   functions simply don't exist. */

const UNIT_GROUPS = [
  { group: "Bungalow", names: ["Bungalow 1", "Bungalow 2", "Bungalow 3", "Bungalow 4", "Bungalow 5"] },
  { group: "House", names: ["House 1", "House 2", "House 3", "House 4", "House Private"] }
];
const ALL_UNITS = UNIT_GROUPS.flatMap(g => g.names);
const SEASON_MONTHS = [5, 6, 7, 8]; // June(5) - Sept(8), zero-indexed

let currentYear = new Date().getFullYear() >= 2020 ? new Date().getFullYear() : 2026;
let DB = { bookings: [], prices: {}, guestProfiles: {} };
let selectedGuest = null;

/* ============================= DATE HELPERS ============================= */
function pad(n) { return String(n).padStart(2, '0'); }
function isoDate(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }
function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function todayIso() { const t = new Date(); return isoDate(t.getFullYear(), t.getMonth(), t.getDate()); }
function parseIso(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function uid() { return 'b_' + Math.random().toString(36).slice(2, 10); }

/* ============================= LOCAL CACHE (offline fallback only) =============================
   This is NOT the source of truth — Google Drive is. It's a fallback so the
   app still shows something useful if Drive is unreachable, per the
   functional spec's offline requirement for Granny's device. */
const LOCAL_CACHE_KEY = 'villaZawojaCache';
function cacheDataLocally(data, syncedAt) {
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify({ data, syncedAt: syncedAt || new Date().toISOString() }));
  } catch (e) { /* storage unavailable — nothing we can do, Drive is still the source of truth */ }
}
function loadCachedData() {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { return null; }
}

/* status for a given booking on a given date */
function statusForBookingOnDate(b, dateStr) {
  const today = todayIso();
  if (dateStr < b.start || dateStr > b.end) return null;
  if (today < b.start) return b.paid > 0 ? 'deposit' : 'reserved';
  if (today >= b.start && today < b.end) return 'staying';
  if (today === b.end) return 'staying';
  return 'available';
}

/* ============================= RENDER: CALENDAR ============================= */
function renderCalendar() {
  document.getElementById('yearLabel').textContent = currentYear;
  document.getElementById('prevYearBtn').disabled = currentYear <= 2020;
  document.getElementById('nextYearBtn').disabled = currentYear >= 2035;

  const banner = document.getElementById('viewOnlyBanner');
  if (banner) banner.style.display = CAN_EDIT ? 'none' : 'block';

  const hint = document.getElementById('calendarHint');
  if (hint) hint.textContent = CAN_EDIT ? STRINGS.calendarHint : STRINGS.calendarHintViewOnly;

  const wrap = document.getElementById('monthGrids');
  wrap.innerHTML = '';
  SEASON_MONTHS.forEach(m => {
    const shell = document.createElement('div');
    shell.className = 'grid-shell';
    shell.style.marginBottom = '18px';
    const strip = document.createElement('div');
    strip.className = 'month-strip';
    strip.innerHTML = `<span>${STRINGS.monthNames[m]} ${currentYear}</span>`;
    const table = document.createElement('table');
    shell.appendChild(strip);
    shell.appendChild(table);
    wrap.appendChild(shell);
    buildMonthGrid(table, currentYear, m);
  });
}

function buildMonthGrid(table, year, monthIndex) {
  const numDays = daysInMonth(year, monthIndex);
  const today = todayIso();

  let html = "<colgroup><col class='unit-col'>";
  for (let d = 1; d <= numDays; d++) html += "<col>";
  html += `</colgroup><thead><tr class='grid-header'><th>${STRINGS.unitColumnHeader}</th>`;
  for (let d = 1; d <= numDays; d++) {
    const dateStr = isoDate(year, monthIndex, d);
    const dObj = new Date(year, monthIndex, d);
    const dw = dObj.getDay();
    const isWeekend = (dw === 0 || dw === 6);
    const isToday = dateStr === today;
    html += `<th class="${isWeekend ? 'weekend' : ''} ${isToday ? 'today-col' : ''}"><span class="dow">${STRINGS.dowNames[dw]}</span><span class="dnum">${d}</span></th>`;
  }
  html += "</tr></thead><tbody>";

  const turnovers = {};
  DB.bookings.forEach(b1 => {
    DB.bookings.forEach(b2 => {
      if (b1.id !== b2.id && b1.unit === b2.unit && b1.end === b2.start) {
        turnovers[`${b1.unit}_${b1.end}`] = { out: b1, in: b2 };
      }
    });
  });

  function bookingCoveringDate(unit, dateStr) {
    return DB.bookings.find(b => b.unit === unit && dateStr >= b.start && dateStr <= b.end &&
      !(dateStr === b.end && turnovers[`${unit}_${dateStr}`]) &&
      !(dateStr === b.start && turnovers[`${unit}_${dateStr}`] && turnovers[`${unit}_${dateStr}`].in.id === b.id));
  }

  UNIT_GROUPS.forEach(group => {
    html += `<tr class="unit-group-label"><td colspan="${numDays + 1}">${group.group}</td></tr>`;
    group.names.forEach((unitName) => {
      html += `<tr><td class="unit-label-cell">${unitName}</td>`;
      let d = 1;
      while (d <= numDays) {
        const dateStr = isoDate(year, monthIndex, d);
        const turnover = turnovers[`${unitName}_${dateStr}`];

        if (turnover) {
          const outSt = statusForBookingOnDate(turnover.out, turnover.out.end);
          const inSt = statusForBookingOnDate(turnover.in, turnover.in.start);
          const colorVar = { reserved: "var(--status-reserved)", deposit: "var(--status-deposit)", staying: "var(--status-staying)" };
          const bg = `linear-gradient(135deg, ${colorVar[outSt] || '#fff'} 0%, ${colorVar[outSt] || '#fff'} 49%, ${colorVar[inSt] || '#fff'} 51%, ${colorVar[inSt] || '#fff'} 100%)`;
          html += `<td class="split-cell" style="background:${bg}" data-edit-id="${turnover.out.id}"><span class="out-name">${turnover.out.surname}</span><span class="in-name">${turnover.in.surname}</span></td>`;
          d += 1;
          continue;
        }

        const booking = bookingCoveringDate(unitName, dateStr);
        if (booking) {
          const runStart = d;
          let runEnd = d;
          while (runEnd + 1 <= numDays) {
            const nextDateStr = isoDate(year, monthIndex, runEnd + 1);
            const nextTurnover = turnovers[`${unitName}_${nextDateStr}`];
            if (nextTurnover) break;
            const nextBooking = bookingCoveringDate(unitName, nextDateStr);
            if (!nextBooking || nextBooking.id !== booking.id) break;
            runEnd += 1;
          }
          const span = runEnd - runStart + 1;
          const st = statusForBookingOnDate(booking, dateStr);
          const runStartDate = isoDate(year, monthIndex, runStart);
          const runEndDate = isoDate(year, monthIndex, runEnd);
          const dashIn = (runStartDate === booking.start) ? 'dash-in' : '';
          const dashOut = (runEndDate === booking.end) ? 'dash-out' : '';
          html += `<td colspan="${span}" class="status-${st} ${dashIn} ${dashOut}" data-edit-id="${booking.id}"><span class="surname-label-inline">${booking.surname}</span></td>`;
          d = runEnd + 1;
          continue;
        }

        const dObj = new Date(year, monthIndex, d);
        const isWeekend = (dObj.getDay() === 0 || dObj.getDay() === 6);
        const isToday = dateStr === today;
        const lockedClass = CAN_EDIT ? '' : 'locked';
        html += `<td class="status-available ${lockedClass} ${isWeekend ? 'weekend' : ''} ${isToday ? 'today-col' : ''}" data-unit="${unitName}" data-date="${dateStr}"></td>`;
        d += 1;
      }
      html += "</tr>";
    });
  });
  html += "</tbody>";
  table.innerHTML = html;

  if (CAN_EDIT) {
    table.querySelectorAll('td[data-edit-id]').forEach(cell => {
      cell.onclick = () => openModal('edit', null, null, cell.dataset.editId);
    });
    table.querySelectorAll('td.status-available').forEach(cell => {
      cell.onclick = () => openModal('new', cell.dataset.unit, cell.dataset.date, null);
    });
  }
}

function changeYear(delta) {
  currentYear += delta;
  renderCalendar();
  renderSummary();
  renderPrices();
}

/* ============================= SEARCH ============================= */
function handleSearch(query) {
  const box = document.getElementById('searchResults');
  const q = query.trim().toLowerCase();
  if (!q) { box.style.display = 'none'; return; }
  const surnames = Object.keys(DB.guestProfiles).concat(DB.bookings.map(b => b.surname));
  const unique = [...new Set(surnames)].filter(s => s.toLowerCase().includes(q));
  if (unique.length === 0) {
    box.innerHTML = `<div style="color:var(--timber);">${STRINGS.searchNoResults}</div>`;
  } else {
    box.innerHTML = unique.map(s => `<div onclick="goToGuest('${s.replace(/'/g, "\\'")}')">${s}</div>`).join('');
  }
  box.style.display = 'block';
}
function goToGuest(surname) {
  document.getElementById('searchResults').style.display = 'none';
  document.getElementById('searchInput').value = '';
  showScreen('guests', document.querySelectorAll('.tab')[3]);
  selectGuestByName(surname);
}
document.addEventListener('click', (e) => {
  const box = document.getElementById('searchResults');
  if (box && !e.target.closest('.search-wrap')) box.style.display = 'none';
});

/* ============================= GUESTS ============================= */
function allGuestNames() {
  const fromProfiles = Object.keys(DB.guestProfiles);
  const fromBookings = DB.bookings.map(b => b.surname);
  return [...new Set([...fromProfiles, ...fromBookings])].sort();
}

function guestSummary(surname) {
  const stays = DB.bookings.filter(b => b.surname === surname).sort((a, b) => a.start < b.start ? 1 : -1);
  const profile = DB.guestProfiles[surname] || { transport: '', note: '' };
  return {
    stays: stays.length,
    lastUnit: stays[0] ? stays[0].unit : '—',
    lastDates: stays[0] ? `${stays[0].start} to ${stays[0].end}` : '—',
    transport: profile.transport || '',
    note: profile.note || '',
    lastBooking: stays[0] || null
  };
}

function renderGuests() {
  const names = allGuestNames();
  const list = document.getElementById('guestList');
  if (names.length === 0) {
    list.innerHTML = `<div class="empty-note" style="padding:16px;">${STRINGS.guestsEmpty}</div>`;
    document.getElementById('profileCard').innerHTML = '';
    return;
  }
  if (!selectedGuest || !names.includes(selectedGuest)) selectedGuest = names[0];
  list.innerHTML = names.map(n => `<div class="guest-list-item ${n === selectedGuest ? 'active' : ''}" onclick="selectGuestByName('${n.replace(/'/g, "\\'")}')">${n}</div>`).join('');
  renderProfile(selectedGuest);
}
function selectGuestByName(name) {
  selectedGuest = name;
  renderGuests();
}
function transportLabelFor(value) {
  if (value === 'Car') return STRINGS.transportOptionCar;
  if (value === 'Train') return STRINGS.transportOptionTrain;
  if (value === 'Other') return STRINGS.transportOptionOther;
  return '—';
}

function renderProfile(name) {
  const s = guestSummary(name);
  const card = document.getElementById('profileCard');
  const editableBlock = CAN_EDIT ? `
    <div class="profile-edit-field">
      <label>${STRINGS.transportLabel}</label>
      <select id="pf_transport" onchange="updateGuestField('${name.replace(/'/g, "\\'")}','transport',this.value)">
        <option value="" ${s.transport === '' ? 'selected' : ''}>—</option>
        <option value="Car" ${s.transport === 'Car' ? 'selected' : ''}>${STRINGS.transportOptionCar}</option>
        <option value="Train" ${s.transport === 'Train' ? 'selected' : ''}>${STRINGS.transportOptionTrain}</option>
        <option value="Other" ${s.transport === 'Other' ? 'selected' : ''}>${STRINGS.transportOptionOther}</option>
      </select>
    </div>
    <div class="profile-edit-field">
      <label>${STRINGS.noteLabel}</label>
      <input type="text" id="pf_note" value="${(s.note || '').replace(/"/g, '&quot;')}" onchange="updateGuestField('${name.replace(/'/g, "\\'")}','note',this.value)">
    </div>
  ` : `
    <div class="profile-row"><span>${STRINGS.transportLabel}</span><span>${transportLabelFor(s.transport)}</span></div>
    <div class="profile-row"><span>${STRINGS.noteLabel}</span><span>${s.note || '—'}</span></div>
  `;

  card.innerHTML = `
    <h2>${name}</h2>
    <div class="meta">${formatGuestBookingsCount(s.stays)}</div>
    <div class="profile-row"><span>${STRINGS.usualUnitLabel}</span><span>${s.lastUnit}</span></div>
    <div class="profile-row"><span>${STRINGS.lastStayLabel}</span><span>${s.lastDates}</span></div>
    ${editableBlock}
    ${CAN_EDIT ? `<div style="margin-top:20px;"><button class="btn-primary" ${s.lastBooking ? '' : 'disabled'} onclick="newBookingForGuest('${name.replace(/'/g, "\\'")}')">${STRINGS.newBookingForGuest}</button></div>` : ''}
  `;
}

/* ============================= PRICES (view) ============================= */
function priceForUnitMonth(unit, year, monthIndex) {
  const yearPrices = DB.prices[year];
  if (yearPrices && yearPrices[unit] && yearPrices[unit][monthIndex] != null) return yearPrices[unit][monthIndex];
  return '';
}

function renderPrices() {
  document.getElementById('priceYearLabel').textContent = currentYear;
  const noteEl = document.getElementById('priceCopyNote');
  if (!DB.prices[currentYear]) {
    const prevYear = DB.prices[currentYear - 1];
    if (prevYear) {
      DB.prices[currentYear] = JSON.parse(JSON.stringify(prevYear));
      if (noteEl) noteEl.textContent = fmt(STRINGS.priceCopiedForward, { year: currentYear - 1 });
    } else {
      DB.prices[currentYear] = {};
      ALL_UNITS.forEach(u => DB.prices[currentYear][u] = { 5: 0, 6: 0, 7: 0, 8: 0 });
      if (noteEl) noteEl.textContent = STRINGS.priceNewTable;
    }
    if (CAN_EDIT && typeof persist === 'function') persist();
  } else if (noteEl) {
    noteEl.textContent = '';
  }

  const table = document.createElement('table');
  table.className = 'price-table';
  let html = `<tr><th>${STRINGS.unitColumnHeader}</th><th>${STRINGS.monthNames[5]}</th><th>${STRINGS.monthNames[6]}</th><th>${STRINGS.monthNames[7]}</th><th>${STRINGS.monthNames[8]}</th></tr>`;
  ALL_UNITS.forEach(u => {
    const p = DB.prices[currentYear][u] || { 5: 0, 6: 0, 7: 0, 8: 0 };
    html += `<tr><td>${u}</td>`;
    SEASON_MONTHS.forEach(m => {
      html += `<td><input type="number" data-unit="${u}" data-month="${m}" value="${p[m] || 0}" ${CAN_EDIT ? '' : 'disabled'}></td>`;
    });
    html += '</tr>';
  });
  table.innerHTML = html;
  const wrap = document.getElementById('priceTableWrap');
  wrap.innerHTML = '';
  wrap.appendChild(table);
  const saveBtn = document.getElementById('savePricesBtn');
  if (saveBtn) saveBtn.style.display = CAN_EDIT ? 'inline-block' : 'none';
}

/* ============================= MONEY SUMMARY ============================= */
function monthTotal(year, monthIndex) {
  return DB.bookings.filter(b => {
    const s = parseIso(b.start);
    return s.getFullYear() === year && s.getMonth() === monthIndex;
  }).reduce((sum, b) => {
    const nights = Math.round((parseIso(b.end) - parseIso(b.start)) / 86400000);
    return sum + (b.price * nights);
  }, 0);
}
function renderSummary() {
  document.getElementById('summaryYearLabel').textContent = currentYear;
  const grid = document.getElementById('summaryGrid');
  grid.innerHTML = '';
  SEASON_MONTHS.forEach(m => {
    const thisYearTotal = monthTotal(currentYear, m);
    const lastYearTotal = monthTotal(currentYear - 1, m);
    let compareHtml = `${STRINGS.lastYearLabel}${lastYearTotal.toLocaleString()} zł`;
    if (lastYearTotal > 0) {
      const pct = Math.round(((thisYearTotal - lastYearTotal) / lastYearTotal) * 100);
      if (pct > 0) compareHtml += ` <span class="up">▲ ${pct}%</span>`;
      else if (pct < 0) compareHtml += ` <span class="down">▼ ${Math.abs(pct)}%</span>`;
    }
    const card = document.createElement('div');
    card.className = 'summary-card';
    card.innerHTML = `<div class="month">${STRINGS.monthNames[m]}</div><div class="amount">${thisYearTotal.toLocaleString()} zł</div><div class="compare">${compareHtml}</div>`;
    grid.appendChild(card);
  });

  const seasonBookings = DB.bookings.filter(b => parseIso(b.start).getFullYear() === currentYear).sort((a, b) => a.start < b.start ? -1 : 1);
  const wrap = document.getElementById('depositsTableWrap');
  if (seasonBookings.length === 0) {
    wrap.innerHTML = `<div class="empty-note">${STRINGS.noBookingsYet}${currentYear}.</div>`;
    return;
  }
  let html = `<table class="deposits-table"><tr><th>${STRINGS.depositsColGuest}</th><th>${STRINGS.depositsColUnit}</th><th>${STRINGS.depositsColDates}</th><th>${STRINGS.depositsColTotal}</th><th>${STRINGS.depositsColPaid}</th><th>${STRINGS.depositsColOutstanding}</th></tr>`;
  seasonBookings.forEach(b => {
    const nights = Math.round((parseIso(b.end) - parseIso(b.start)) / 86400000);
    const total = b.price * nights;
    const owed = Math.max(0, total - b.paid);
    html += `<tr><td>${b.surname}</td><td>${b.unit}</td><td>${b.start} – ${b.end}</td><td>${total} zł</td><td class="paid">${b.paid} zł</td><td class="owed ${owed === 0 ? 'zero' : ''}">${owed} zł</td></tr>`;
  });
  html += '</table>';
  wrap.innerHTML = html;
}

/* ============================= NAVIGATION ============================= */
function showScreen(name, btn) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
}
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}
function renderAll() {
  renderCalendar();
  renderSummary();
  renderPrices();
  renderGuests();
}
