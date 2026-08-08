/* ============================= MOM APP =============================
   This file is only ever loaded by mom/index.html. It contains every
   function that mutates booking/price/guest data, and the only code in
   the whole project that writes to Google Drive. Granny's build never
   loads this file, so none of these functions exist in her copy of the
   app at all. */

/* ============================= GOOGLE DRIVE (write) ============================= */
let tokenClient = null;
let driveAccessToken = null;
let driveFileId = localStorage.getItem('momDriveFileId') || null;
let driveUserEmail = null;
let pendingSave = false;

function initGoogleAuth() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_OAUTH_CLIENT_ID,
    scope: MOM_DRIVE_SCOPE,
    callback: onTokenReceived
  });
  // Token requests need a real click to reliably avoid popup blockers, so
  // we wait for the "Connect Google Drive" button rather than attempting
  // a silent request on load.
}

function connectDrive() {
  if (!tokenClient) { showToast(STRINGS.gsiLoading); return; }
  setSyncStatus('pending', STRINGS.connecting);
  tokenClient.requestAccessToken({ prompt: 'consent' });
}

async function onTokenReceived(resp) {
  if (resp.error) {
    setSyncStatus(null, STRINGS.notConnected);
    return;
  }
  driveAccessToken = resp.access_token;
  try {
    driveUserEmail = await fetchUserEmail(driveAccessToken);
  } catch (e) { driveUserEmail = null; }

  document.getElementById('connectBtn').style.display = 'none';
  document.getElementById('shareRow').style.display = 'flex';

  try {
    if (!driveFileId) {
      driveFileId = await findOrCreateDriveFile(driveAccessToken);
      localStorage.setItem('momDriveFileId', driveFileId);
    }
    const remote = await loadFromDrive(driveFileId, driveAccessToken);
    if (remote) {
      DB = remote;
      cacheDataLocally(DB);
      renderAll();
    }
    setSyncStatus('ok', fmt(STRINGS.connectedAs, { email: driveUserEmail || '' }));
    if (pendingSave) { pendingSave = false; persist(); }
  } catch (e) {
    setSyncStatus('error', STRINGS.syncError);
  }
}

async function fetchUserEmail(token) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('userinfo failed');
  const info = await res.json();
  return info.email;
}

async function findOrCreateDriveFile(token) {
  const q = encodeURIComponent(`name='${DRIVE_FILE_NAME}' and trashed=false`);
  const listRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const listData = await listRes.json();
  if (listData.files && listData.files.length > 0) return listData.files[0].id;

  const metadata = { name: DRIVE_FILE_NAME, mimeType: 'application/json' };
  const boundary = 'villazawoja-boundary';
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(DB)}\r\n--${boundary}--`;

  const createRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
    body
  });
  const createData = await createRes.json();
  if (!createRes.ok) throw new Error('create failed');
  return createData.id;
}

async function loadFromDrive(fileId, token) {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('load failed');
  return res.json();
}

async function saveToDrive(fileId, token, data) {
  const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('save failed');
}

async function shareWithGranny() {
  const email = document.getElementById('shareEmail').value.trim();
  if (!email || !driveFileId || !driveAccessToken) return;
  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${driveFileId}/permissions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${driveAccessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'reader', type: 'user', emailAddress: email })
    });
    if (!res.ok) throw new Error('share failed');
    showToast(STRINGS.shareWithSuccess);
    document.getElementById('shareEmail').value = '';
  } catch (e) {
    showToast(STRINGS.shareWithError);
  }
}

function setSyncStatus(state, text) {
  const dot = document.getElementById('syncDot');
  const label = document.getElementById('syncStatusText');
  dot.className = 'sync-dot' + (state ? ' ' + state : '');
  label.textContent = text;
}

function persist() {
  cacheDataLocally(DB);
  if (driveAccessToken && driveFileId) {
    setSyncStatus('pending', STRINGS.savingToDrive);
    saveToDrive(driveFileId, driveAccessToken, DB)
      .then(() => setSyncStatus('ok', fmt(STRINGS.lastSynced, { time: new Date().toLocaleTimeString() })))
      .catch(() => setSyncStatus('error', STRINGS.syncError));
  } else {
    pendingSave = true;
    setSyncStatus(null, STRINGS.notConnected);
  }
}

/* ============================= MODAL / BOOKING CRUD ============================= */
let modalMode = 'new';

function openModal(mode, unit, dateStr, bookingId) {
  modalMode = mode;
  document.getElementById('errorBox').style.display = 'none';
  document.getElementById('turnoverWarning').style.display = 'none';
  document.getElementById('f_unit').value = unit;
  document.getElementById('f_editId').value = bookingId || '';

  if (mode === 'new') {
    document.getElementById('modalTitle').textContent = STRINGS.modalTitleNew;
    document.getElementById('modalSub').textContent = fmt(STRINGS.modalSubNew, { unit, date: dateStr });
    document.getElementById('f_start').value = dateStr;
    const endDefault = new Date(parseIso(dateStr)); endDefault.setDate(endDefault.getDate() + 3);
    const endDefaultIso = isoDate(endDefault.getFullYear(), endDefault.getMonth(), endDefault.getDate());
    document.getElementById('f_end').value = endDefaultIso;
    document.getElementById('f_surname').value = '';
    document.getElementById('f_phone').value = '';
    document.getElementById('f_note').value = '';
    document.getElementById('f_deposit').value = 0;
    document.getElementById('cancelBookingBtn').style.display = 'none';
    renderRateRows(unit, dateStr, endDefaultIso, null);
  } else {
    const b = DB.bookings.find(x => x.id === bookingId);
    if (!b) { document.getElementById('modalOverlay').style.display = 'none'; return; }
    unit = b.unit;
    document.getElementById('f_unit').value = unit;
    document.getElementById('modalTitle').textContent = STRINGS.modalTitleEdit;
    document.getElementById('modalSub').textContent = `${unit}`;
    document.getElementById('f_start').value = b.start;
    document.getElementById('f_end').value = b.end;
    document.getElementById('f_surname').value = b.surname;
    document.getElementById('f_phone').value = b.phone;
    document.getElementById('f_note').value = b.note || '';
    document.getElementById('f_deposit').value = b.paid;
    document.getElementById('cancelBookingBtn').style.display = 'inline-block';
    const existingRates = {};
    if (b.rates) {
      b.rates.forEach(r => existingRates[r.month] = r.price);
    } else if (b.price != null) {
      Object.keys(nightsByMonth(b.start, b.end)).forEach(ym => existingRates[ym] = b.price);
    }
    renderRateRows(unit, b.start, b.end, existingRates);
  }
  checkTurnoverWarning(unit, document.getElementById('f_start').value, bookingId || null);
  recalcBalance();
  document.getElementById('modalOverlay').style.display = 'flex';
}

function renderRateRows(unit, start, end, existingRates) {
  const nightsMap = nightsByMonth(start, end);
  const months = Object.keys(nightsMap).sort();
  const container = document.getElementById('ratesContainer');
  container.innerHTML = months.map(ym => {
    const [y, m] = ym.split('-').map(Number);
    const monthLabel = STRINGS.monthNames[m - 1];
    const nights = nightsMap[ym];
    const value = (existingRates && existingRates[ym] != null) ? existingRates[ym] : priceForUnitMonth(unit, y, m - 1);
    return `<div class="rate-row">
      <span class="rate-row-label">${monthLabel} ${y} <span class="rate-row-nights">(${formatNightsCount(nights)})</span></span>
      <input type="number" class="rate-input" data-month="${ym}" value="${value}" onchange="recalcBalance()">
    </div>`;
  }).join('');
}

function onDatesChanged() {
  const unit = document.getElementById('f_unit').value;
  const start = document.getElementById('f_start').value;
  const end = document.getElementById('f_end').value;
  if (!start || !end) return;
  const existing = {};
  document.querySelectorAll('.rate-input').forEach(inp => existing[inp.dataset.month] = parseFloat(inp.value) || 0);
  renderRateRows(unit, start, end, existing);
  checkTurnoverWarning(unit, start, document.getElementById('f_editId').value || null);
  recalcBalance();
}

function checkTurnoverWarning(unit, startDate, ignoreId) {
  const clashing = DB.bookings.find(b => b.id !== ignoreId && b.unit === unit && b.end === startDate);
  const box = document.getElementById('turnoverWarning');
  if (clashing) {
    box.style.display = 'block';
    box.textContent = fmt(STRINGS.warnTurnover, { surname: clashing.surname, unit });
  } else {
    box.style.display = 'none';
  }
}

function recalcBalance() {
  const deposit = parseFloat(document.getElementById('f_deposit').value) || 0;
  const start = document.getElementById('f_start').value;
  const end = document.getElementById('f_end').value;
  const nightsMap = (start && end && parseIso(end) > parseIso(start)) ? nightsByMonth(start, end) : {};

  let total = 0, nights = 0;
  document.querySelectorAll('.rate-input').forEach(inp => {
    const ym = inp.dataset.month;
    const rate = parseFloat(inp.value) || 0;
    const n = nightsMap[ym] || 0;
    total += rate * n;
    nights += n;
  });

  const balance = Math.max(0, total - deposit);
  document.getElementById('f_balance').textContent = formatBalanceLine(balance, total, nights);
}

function saveBooking() {
  const unit = document.getElementById('f_unit').value;
  const editId = document.getElementById('f_editId').value;
  const start = document.getElementById('f_start').value;
  const end = document.getElementById('f_end').value;
  const surname = document.getElementById('f_surname').value.trim();
  const phone = document.getElementById('f_phone').value.trim();
  const paid = parseFloat(document.getElementById('f_deposit').value) || 0;
  const note = document.getElementById('f_note').value.trim();
  const rates = Array.from(document.querySelectorAll('.rate-input')).map(inp => ({
    month: inp.dataset.month,
    price: parseFloat(inp.value) || 0
  }));

  const errBox = document.getElementById('errorBox');
  errBox.style.display = 'none';

  if (!start || !end || parseIso(end) <= parseIso(start)) {
    errBox.textContent = STRINGS.errDatesInvalid;
    errBox.style.display = 'block';
    return;
  }
  if (!surname) {
    errBox.textContent = STRINGS.errSurnameRequired;
    errBox.style.display = 'block';
    return;
  }

  const overlap = DB.bookings.find(b => {
    if (b.id === editId) return false;
    if (b.unit !== unit) return false;
    return (start < b.end) && (end > b.start);
  });
  if (overlap) {
    errBox.textContent = fmt(STRINGS.errOverlap, { unit, surname: overlap.surname, start: overlap.start, end: overlap.end });
    errBox.style.display = 'block';
    return;
  }

  if (editId) {
    const b = DB.bookings.find(x => x.id === editId);
    delete b.price; // upgrade legacy flat-price bookings to per-month rates on save
    Object.assign(b, { start, end, surname, phone, paid, note, rates });
  } else {
    DB.bookings.push({ id: uid(), unit, start, end, surname, phone, paid, note, rates });
  }

  if (!DB.guestProfiles[surname]) DB.guestProfiles[surname] = { transport: '', note: '' };

  persist();
  closeModal();
  renderAll();
  showToast(STRINGS.toastBookingSaved);
}

function cancelBooking() {
  const editId = document.getElementById('f_editId').value;
  if (!editId) return;
  if (!confirm(STRINGS.confirmClearBooking)) return;
  DB.bookings = DB.bookings.filter(b => b.id !== editId);
  persist();
  closeModal();
  renderAll();
  showToast(STRINGS.toastBookingCleared);
}

function closeModal() { document.getElementById('modalOverlay').style.display = 'none'; }

/* ============================= GUESTS (edit) ============================= */
function updateGuestField(name, field, value) {
  if (!DB.guestProfiles[name]) DB.guestProfiles[name] = { transport: '', note: '' };
  DB.guestProfiles[name][field] = value;
  persist();
  showToast(STRINGS.toastGuestUpdated);
}

function newBookingForGuest(name) {
  const s = guestSummary(name);
  if (!s.lastBooking) return;
  const lastStart = parseIso(s.lastBooking.start);
  const lastEnd = parseIso(s.lastBooking.end);
  const nights = Math.round((lastEnd - lastStart) / 86400000);
  const today = new Date();
  const newStart = new Date(today.getFullYear(), today.getMonth() < 5 ? 5 : today.getMonth(), today.getDate() + 7);
  const newEnd = new Date(newStart); newEnd.setDate(newEnd.getDate() + nights);

  showScreen('calendar', document.querySelectorAll('.tab')[0]);
  currentYear = newStart.getFullYear();
  renderCalendar();

  openModal('new', s.lastBooking.unit, isoDate(newStart.getFullYear(), newStart.getMonth(), newStart.getDate()), null);
  document.getElementById('modalTitle').textContent = fmt(STRINGS.modalTitleNewForGuest, { name });
  document.getElementById('modalSub').textContent = STRINGS.modalSubPrefilled;
  document.getElementById('f_end').value = isoDate(newEnd.getFullYear(), newEnd.getMonth(), newEnd.getDate());
  document.getElementById('f_surname').value = name;
  document.getElementById('f_phone').value = s.lastBooking.phone;
  document.getElementById('f_deposit').value = 0;
  onDatesChanged();
}

/* ============================= PRICES (save) ============================= */
function savePrices() {
  document.querySelectorAll('#priceTableWrap input').forEach(inp => {
    const unit = inp.dataset.unit, month = inp.dataset.month;
    if (!DB.prices[currentYear][unit]) DB.prices[currentYear][unit] = {};
    DB.prices[currentYear][unit][month] = parseFloat(inp.value) || 0;
  });
  persist();
  showToast(STRINGS.toastPricesSaved + currentYear);
}

/* ============================= INIT ============================= */
(function init() {
  applyStrings();
  updateLangToggleUI();
  const cached = loadCachedData();
  if (cached && cached.data) DB = cached.data;
  renderAll();
  // Google Identity Services loads asynchronously; wait for it before wiring the "Connect" button.
  const waitForGis = setInterval(() => {
    if (window.google && google.accounts && google.accounts.oauth2) {
      clearInterval(waitForGis);
      initGoogleAuth();
    }
  }, 100);
})();
