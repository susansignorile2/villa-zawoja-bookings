/* ============================= UI STRINGS =============================
   All user-facing text used by JS-generated markup lives here, in English,
   so a future Polish translation only means editing this one file (per the
   functional spec, section 13). Static HTML labels are tagged with
   data-i18n="key" attributes and are filled in from here on page load via
   applyStrings() in app-core.js — so translating the app means editing
   this file only, not hunting through HTML/JS. */

const STRINGS = {
  appName: "Villa Zawoja",
  appTagline: "Booking System",

  tabCalendar: "Calendar",
  tabSummary: "Money Summary",
  tabPrices: "Season Prices",
  tabGuests: "Guests",

  searchPlaceholder: "Search guest surname…",
  searchNoResults: "No guests found",

  bookingsHeading: "Bookings",
  legendAvailable: "Available",
  legendReserved: "Reserved, no deposit",
  legendDeposit: "Deposit received",
  legendStaying: "Staying now",
  legendCheckInOut: "Check-in / checkout day",
  legendTurnover: "Same-day turnover",
  calendarHint: "Click an empty date to start a new booking. Click an existing booking to edit it. Colours update automatically each day — a stay turns blue on arrival and clears the day after checkout.",
  calendarHintViewOnly: "Colours update automatically each day — a stay turns blue on arrival and clears the day after checkout. This calendar is view-only; ask Mom to make changes.",
  viewOnlyBanner: "You're viewing the read-only calendar. To make changes, use Mom's booking app.",

  moneySummaryHeading: "Money Summary — ",
  depositsHeading: "Current Bookings — Deposits & Balances",
  depositsNote: "This season only",
  noBookingsYet: "No bookings yet for ",

  pricesHeading: "Season Prices — ",
  savePricesBtn: "Save prices",
  priceCopiedForward: "Copied forward from {year} — edit any that have changed",
  priceNewTable: "New price table — please set prices for this season",

  guestsHeading: "Guests",
  guestsEmpty: "No guests yet — they'll appear here once a booking is made.",
  newBookingForGuest: "New booking for this guest",

  modalTitleNew: "New booking",
  modalTitleEdit: "Edit booking",
  fieldStart: "Start date",
  fieldEnd: "End date (checkout day)",
  fieldSurname: "Guest surname",
  fieldPhone: "Phone number",
  fieldPrice: "Price per night (zł)",
  fieldDeposit: "Deposit / amount paid (zł)",
  fieldNote: "Note (optional)",
  outstandingBalance: "Outstanding balance",
  clearBooking: "Clear booking",
  cancel: "Cancel",
  saveBooking: "Save booking",
  confirmClearBooking: "Clear this booking and return the unit to Available?",

  errDatesInvalid: "Please check the dates — the end date must be after the start date.",
  errSurnameRequired: "Please enter the guest surname.",
  errOverlap: "{unit} is already booked for these dates ({surname}, {start} to {end}). Please choose different dates.",
  warnTurnover: "⚠ {surname} checks out of {unit} on this same day. You can still save this booking.",

  toastBookingSaved: "Booking saved",
  toastBookingCleared: "Booking cleared",
  toastGuestUpdated: "Guest details updated",
  toastPricesSaved: "Prices saved for ",

  connectDrive: "Connect Google Drive",
  connecting: "Connecting…",
  connectedAs: "Connected as {email}",
  notConnected: "Not connected — changes are only saved on this computer",
  lastSynced: "Last synced {time}",
  neverSynced: "Not yet synced",
  syncError: "Couldn't reach Google Drive — will try again",
  savingToDrive: "Saving to Google Drive…",
  shareWithLabel: "Share view access with Granny's Google account",
  shareWithPlaceholder: "granny@example.com",
  shareWithBtn: "Share",
  shareWithSuccess: "Shared — Granny can now connect from her device",
  shareWithError: "Couldn't share the file — check the email address and try again",

  grannyChooseFile: "Find the shared calendar",
  grannyChooseFileHint: "This is a one-time step — after this, the calendar updates automatically.",
  grannyFileFound: "Found the calendar Mom shared with you",
  grannyFileNotFound: "Couldn't find a file called \"{name}\" shared with this account yet. Ask Mom to share it, then try again.",
  grannyOffline: "Showing the last-synced version (offline or not yet connected)",
  grannyLastSynced: "Last updated {time}",

  momEditBadge: "Mom · full access",
  grannyViewBadge: "Granny · view only"
};

function fmt(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, k) => (vars && k in vars) ? vars[k] : `{${k}}`);
}
