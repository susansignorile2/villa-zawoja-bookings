/* ============================= SHARED CONFIG =============================
   Loaded by both mom/index.html and granny/index.html.
   These values are meant to be public in client-side code (they are not
   secrets) but the OAuth client and API key should still be restricted in
   Google Cloud Console to the domains this app is actually hosted on. */

const GOOGLE_OAUTH_CLIENT_ID = "721073895427-ksmmr528mqs9e8bb2vm7vo8mec31vo2n.apps.googleusercontent.com";

/* The single JSON file, in Google Drive, that holds all booking data.
   Mom's app creates this file the first time she connects. Granny's app
   finds it by this exact name among files shared with her. */
const DRIVE_FILE_NAME = "villa-zawoja-data.json";

/* Mom's app only ever requests access to files it created itself. */
const MOM_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

/* Granny's app only ever reads — it requests read-only access so it can
   see the file Mom shares with her (drive.file would not be enough here,
   since Granny's app didn't create that file). No write calls exist
   anywhere in granny/granny-app.js. */
const GRANNY_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly";
