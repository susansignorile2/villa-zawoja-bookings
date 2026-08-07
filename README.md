# Villa Zawoja Booking System

Two static web apps sharing one Google Drive file as the database:

- **`/mom/`** — full booking editor. Writes to Google Drive.
- **`/granny/`** — read-only calendar. Reads the file Mom shares with her. Contains no editing code at all (not a hidden toggle — the file `granny/granny-app.js` and `granny/index.html` simply have no booking/price/guest-edit functions or form in them).
- **`/shared/`** — calendar rendering, styles, and text used by both.

There is no server anywhere — both apps talk to the Google Drive API directly from the browser. GitHub Pages just hosts static files.

---

## Part 1 — One-time Google Cloud setup (you do this)

You already have an OAuth Client ID (`721073895427-...apps.googleusercontent.com`) baked into [`shared/config.js`](shared/config.js). A few more steps are needed for it to actually work on a live URL:

1. Go to **[console.cloud.google.com](https://console.cloud.google.com)**, select the project that Client ID belongs to (or ask me and I can help you find it once you're logged in).
2. **APIs & Services → Library** → enable **Google Drive API** (search for it, click Enable). That's the only API needed — both Mom's and Granny's apps use it.
3. **APIs & Services → OAuth consent screen**:
   - User type: **External**.
   - App name: `Villa Zawoja Bookings`, support email: your email.
   - Scopes: add `.../auth/drive.file` and `.../auth/drive.readonly` (click "Add or remove scopes", search "Drive API", tick both).
   - **Test users**: add Mom's Gmail address and Granny's Gmail address (and your own). Leave publishing status as **Testing** — you don't need Google's app review for a private family app used by a handful of people.
   - ⚠️ Because the app is in Testing, anyone signing in will see an "unverified app" warning screen. That's expected — click **Advanced → Go to Villa Zawoja Bookings (unsafe)** to continue. It's safe; it just means Google hasn't reviewed it (their review process is for public-facing apps, not this).
4. **APIs & Services → Credentials** → open the existing OAuth Client ID → under **Authorized JavaScript origins**, add:
   - `https://<your-github-username>.github.io` (once you know your Pages URL — see Part 2)
   - `http://localhost:8000` (optional, only if you want to test locally first)
   - Save.

That's it for Google Cloud — no API key is needed, since Granny's app authenticates with her own Google account rather than a public link.

---

## Part 2 — Put this on GitHub Pages (you do this)

From your terminal, in this folder:

```bash
git init
git add .
git commit -m "Villa Zawoja booking system"
```

Then on **github.com**:
1. Click **+ → New repository**. Name it e.g. `villa-zawoja-bookings`. Keep it **Public** (GitHub Pages is free for public repos; no booking data is stored in this code — it all lives in Google Drive).
2. Don't initialize it with a README (you already have one) — create it empty.
3. Copy the repo URL it shows you (something like `https://github.com/susansignorile/villa-zawoja-bookings.git`).

Back in the terminal:

```bash
git remote add origin <paste the URL here>
git branch -M main
git push -u origin main
```

Then on GitHub: **Settings → Pages** → under "Build and deployment", Source = **Deploy from a branch**, Branch = **main**, folder = **/(root)** → **Save**. Wait about a minute, then refresh — GitHub shows your live URL at the top, something like:

```
https://susansignorile.github.io/villa-zawoja-bookings/
```

Go back to **Google Cloud Console → Credentials** (Part 1, step 4) and make sure that exact origin (just the `https://username.github.io` part, no path) is in **Authorized JavaScript origins** — this step has to happen after you know the real URL.

Tell me your GitHub username and repo name once it's live and I can double check everything's wired correctly.

---

## Part 3 — First-time setup inside the app (Mom, then Granny)

1. **Mom** opens `https://.../mom/`, clicks **Connect Google Drive**, signs in with her own Google account, clicks through the "unverified app" warning, and approves access. This creates `villa-zawoja-data.json` in **Mom's own Drive** the first time.
2. Still on Mom's screen, a **"Share view access with Granny's Google account"** box appears — type Granny's Gmail address and click **Share**. This runs once.
3. **Granny** opens `https://.../granny/` on the Dell, clicks **Connect Google Drive**, signs in with the Google account Mom just shared with — it should find the file automatically and start showing the calendar. From then on it refreshes automatically every couple of minutes and whenever she switches back to the tab.
4. If Granny's Dell is offline, it keeps showing whatever it last successfully loaded, with a small note of when that was — this matches the functional spec's requirement (section 11).

Both Mom and Granny will occasionally need to click "Connect" again (roughly once per browsing session) — there's no server to keep a login alive indefinitely, so the browser holds a short-lived Google access token instead. For how infrequently this app gets opened, that's a minor click, not a real burden.

---

## Testing before you show Mom

You can test the calendar UI without any of the Google setup — open `mom/index.html` directly in a browser (or `granny/index.html`) and it'll work using a local cache, just without Drive sync. To test the *real* Drive sync locally before pushing to GitHub, run a local server from this folder:

```bash
python3 -m http.server 8000
```

and open `http://localhost:8000/mom/` — as long as `http://localhost:8000` is in your Authorized JavaScript origins (Part 1, step 4), sign-in will work there too.

---

## Design notes / honest limitations

- **Permission split**: Granny's build ships with zero code that can create, edit, or delete a booking, set a price, or edit a guest note — there is no such function anywhere in `granny/index.html` or `granny/granny-app.js`. This is what the handoff doc asked for instead of a runtime "viewing as" toggle. It is not, however, a server-enforced security boundary — this is a client-only app with no backend, so a technically determined person could still open the browser console on Granny's machine and hand-write API calls. For a private family tool that's the correct trade-off; if it ever needs to resist a deliberate attacker rather than just prevent accidental edits, that would call for adding a real backend later.
- **Backup**: since the data file lives in Google Drive, Drive's own versioning/backup applies automatically — no extra backup step needed, matching functional spec section 14.
- **Language**: all user-facing text generated by JavaScript is centralized in `shared/strings.js`; a Polish translation later means editing that one file rather than hunting through the code, per section 13.
- **Cross-platform**: everything here is plain HTML/CSS/JS with no build step, so it runs identically in any modern browser on macOS or Windows — nothing extra to install on Granny's Dell besides a browser.
