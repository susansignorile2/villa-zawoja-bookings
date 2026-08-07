/* ============================= GRANNY APP =============================
   This file is only ever loaded by granny/index.html. It contains no
   function anywhere that writes a booking, a price, or a guest note —
   there is no code path in this file (or in shared/app-core.js, when
   CAN_EDIT is false) that calls a Drive write endpoint. The OAuth scope
   requested below is read-only, and is only ever used with GET requests. */

let tokenClient = null;
let driveAccessToken = null;
let driveFileId = localStorage.getItem('grannyDriveFileId') || null;
const POLL_INTERVAL_MS = 120000;

function initGoogleAuth() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_OAUTH_CLIENT_ID,
    scope: GRANNY_DRIVE_SCOPE,
    callback: onTokenReceived
  });
  // Token requests need a real click to reliably avoid popup blockers, so
  // we wait for the "Connect Google Drive" button rather than attempting
  // a silent request on load.
}

function connectDrive() {
  if (!tokenClient) { showToast('Still loading Google Sign-In — try again in a moment'); return; }
  setSyncStatus(null, STRINGS.connecting);
  tokenClient.requestAccessToken({ prompt: 'consent' });
}

async function onTokenReceived(resp) {
  if (resp.error) {
    showGrannyOfflineState();
    return;
  }
  driveAccessToken = resp.access_token;
  document.getElementById('connectBtn').textContent = STRINGS.grannyChooseFile;

  try {
    if (!driveFileId) {
      driveFileId = await findSharedDriveFile(driveAccessToken);
      localStorage.setItem('grannyDriveFileId', driveFileId);
      showToast(STRINGS.grannyFileFound);
    }
    await refreshFromDrive();
    document.getElementById('connectBtn').style.display = 'none';
    startPolling();
  } catch (e) {
    showGrannyOfflineState();
  }
}

async function findSharedDriveFile(token) {
  const q = encodeURIComponent(`name='${DRIVE_FILE_NAME}' and trashed=false`);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.files || data.files.length === 0) {
    throw new Error(fmt(STRINGS.grannyFileNotFound, { name: DRIVE_FILE_NAME }));
  }
  return data.files[0].id;
}

async function loadFromDrive(fileId, token) {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('load failed');
  return res.json();
}

async function refreshFromDrive() {
  if (!driveFileId || !driveAccessToken) return;
  try {
    const remote = await loadFromDrive(driveFileId, driveAccessToken);
    DB = remote;
    const now = new Date();
    cacheDataLocally(DB, now.toISOString());
    renderAll();
    setSyncStatus('ok', fmt(STRINGS.grannyLastSynced, { time: now.toLocaleTimeString() }));
  } catch (e) {
    // Token likely expired. Show the last-known data and let the person
    // click "Connect Google Drive" again rather than retrying silently —
    // an unprompted popup here would just get blocked by the browser.
    document.getElementById('connectBtn').style.display = 'inline-block';
    document.getElementById('connectBtn').textContent = STRINGS.connectDrive;
    showGrannyOfflineState();
  }
}

function startPolling() {
  setInterval(refreshFromDrive, POLL_INTERVAL_MS);
  window.addEventListener('focus', refreshFromDrive);
}

function showGrannyOfflineState() {
  const cached = loadCachedData();
  if (cached && cached.data) {
    DB = cached.data;
    renderAll();
    setSyncStatus('error', fmt(STRINGS.grannyLastSynced, { time: new Date(cached.syncedAt).toLocaleTimeString() }) + ' — ' + STRINGS.grannyOffline);
  } else {
    setSyncStatus('error', STRINGS.grannyOffline);
  }
}

function setSyncStatus(state, text) {
  const dot = document.getElementById('syncDot');
  const label = document.getElementById('syncStatusText');
  dot.className = 'sync-dot' + (state ? ' ' + state : '');
  label.textContent = text;
}

/* ============================= INIT ============================= */
(function init() {
  applyStrings();
  const cached = loadCachedData();
  if (cached && cached.data) {
    DB = cached.data;
    setSyncStatus(null, fmt(STRINGS.grannyLastSynced, { time: new Date(cached.syncedAt).toLocaleTimeString() }));
  }
  renderAll();
  const waitForGis = setInterval(() => {
    if (window.google && google.accounts && google.accounts.oauth2) {
      clearInterval(waitForGis);
      initGoogleAuth();
    }
  }, 100);
})();
