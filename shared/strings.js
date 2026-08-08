/* ============================= i18n =============================
   Every user-facing string lives in STRINGS_EN / STRINGS_PL below —
   nothing else in the app should have English (or Polish) text baked
   into it directly. To fix or improve the Polish wording, just edit
   STRINGS_PL; nothing needs rebuilding or redeploying beyond a normal
   git push, since this is a plain static file.

   The initial Polish translation was drafted by Claude, not a native
   speaker fluent in Polish hospitality terms — Mom should read through
   it once and correct anything that sounds off. */

const STRINGS_EN = {
  appName: "Villa Zawoja",
  appTagline: "Booking System",

  monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  dowNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

  tabCalendar: "Calendar",
  tabSummary: "Money Summary",
  tabPrices: "Season Prices",
  tabGuests: "Guests",

  searchPlaceholder: "Search guest surname…",
  searchNoResults: "No guests found",

  bookingsHeading: "Bookings",
  unitColumnHeader: "Unit",
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
  lastYearLabel: "Last year: ",
  depositsHeading: "Current Bookings — Deposits & Balances",
  depositsNote: "This season only",
  noBookingsYet: "No bookings yet for ",
  depositsColGuest: "Guest",
  depositsColUnit: "Unit",
  depositsColDates: "Dates",
  depositsColTotal: "Total price",
  depositsColPaid: "Paid",
  depositsColOutstanding: "Outstanding",

  pricesHeading: "Season Prices — ",
  savePricesBtn: "Save prices",
  priceCopiedForward: "Copied forward from {year} — edit any that have changed",
  priceNewTable: "New price table — please set prices for this season",

  guestsHeading: "Guests",
  guestsEmpty: "No guests yet — they'll appear here once a booking is made.",
  newBookingForGuest: "New booking for this guest",
  usualUnitLabel: "Usual / last unit",
  lastStayLabel: "Last stay",
  transportLabel: "Transport",
  noteLabel: "Note",
  transportOptionCar: "Car",
  transportOptionTrain: "Train",
  transportOptionOther: "Other",
  modalTitleNewForGuest: "New booking for {name}",
  modalSubPrefilled: "Pre-filled from guest profile — just update the dates and save",

  modalTitleNew: "New booking",
  modalTitleEdit: "Edit booking",
  modalSubNew: "{unit} · starting {date}",
  fieldStart: "Start date",
  fieldEnd: "End date (checkout day)",
  fieldSurname: "Guest surname",
  fieldPhone: "Phone number",
  fieldRates: "Nightly rate by month (zł)",
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
  gsiLoading: "Still loading Google Sign-In — try again in a moment",

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
  grannyViewBadge: "Granny · view only",

  landingIntro: "Booking calendar for Villa Zawoja, Władysławowo. Choose your link below.",
  landingMomTitle: "Mom",
  landingMomDesc: "Create, edit and cancel bookings. Set prices.",
  landingGrannyTitle: "Granny",
  landingGrannyDesc: "View the calendar and guests only.",
  landingWarning: "Bookmark the link you use directly instead of coming back to this page each time. Only share the Mom link with Mom — anyone who signs in on that page can create or change bookings."
};

const STRINGS_PL = {
  appName: "Villa Zawoja",
  appTagline: "System rezerwacji",

  monthNames: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"],
  dowNames: ["Nd", "Pon", "Wt", "Śr", "Czw", "Pt", "Sob"],

  tabCalendar: "Kalendarz",
  tabSummary: "Podsumowanie finansowe",
  tabPrices: "Ceny sezonowe",
  tabGuests: "Goście",

  searchPlaceholder: "Szukaj po nazwisku gościa…",
  searchNoResults: "Nie znaleziono gości",

  bookingsHeading: "Rezerwacje",
  unitColumnHeader: "Jednostka",
  legendAvailable: "Wolne",
  legendReserved: "Zarezerwowane, bez zadatku",
  legendDeposit: "Zadatek wpłacony",
  legendStaying: "Obecnie zakwaterowani",
  legendCheckInOut: "Dzień przyjazdu / wyjazdu",
  legendTurnover: "Zmiana gości tego samego dnia",
  calendarHint: "Kliknij wolny termin, aby dodać nową rezerwację. Kliknij istniejącą rezerwację, aby ją edytować. Kolory aktualizują się automatycznie każdego dnia — pobyt zmienia się na niebieski w dniu przyjazdu i znika dzień po wyjeździe.",
  calendarHintViewOnly: "Kolory aktualizują się automatycznie każdego dnia — pobyt zmienia się na niebieski w dniu przyjazdu i znika dzień po wyjeździe. Ten kalendarz jest tylko do podglądu — o zmiany poproś Mamę.",
  viewOnlyBanner: "Przeglądasz kalendarz w trybie tylko do odczytu. Aby wprowadzić zmiany, skorzystaj z aplikacji Mamy.",

  moneySummaryHeading: "Podsumowanie finansowe — ",
  lastYearLabel: "Zeszły rok: ",
  depositsHeading: "Aktualne rezerwacje — zadatki i salda",
  depositsNote: "Tylko bieżący sezon",
  noBookingsYet: "Brak rezerwacji na ",
  depositsColGuest: "Gość",
  depositsColUnit: "Jednostka",
  depositsColDates: "Terminy",
  depositsColTotal: "Cena całkowita",
  depositsColPaid: "Wpłacono",
  depositsColOutstanding: "Do zapłaty",

  pricesHeading: "Ceny sezonowe — ",
  savePricesBtn: "Zapisz ceny",
  priceCopiedForward: "Skopiowano z {year} — popraw te, które się zmieniły",
  priceNewTable: "Nowa tabela cen — ustaw ceny dla tego sezonu",

  guestsHeading: "Goście",
  guestsEmpty: "Brak gości — pojawią się tutaj po dodaniu rezerwacji.",
  newBookingForGuest: "Nowa rezerwacja dla tego gościa",
  usualUnitLabel: "Zwykle zajmowana jednostka",
  lastStayLabel: "Ostatni pobyt",
  transportLabel: "Transport",
  noteLabel: "Notatka",
  transportOptionCar: "Samochód",
  transportOptionTrain: "Pociąg",
  transportOptionOther: "Inne",
  modalTitleNewForGuest: "Nowa rezerwacja dla: {name}",
  modalSubPrefilled: "Wypełniono na podstawie profilu gościa — wystarczy zaktualizować daty i zapisać",

  modalTitleNew: "Nowa rezerwacja",
  modalTitleEdit: "Edytuj rezerwację",
  modalSubNew: "{unit} · od {date}",
  fieldStart: "Data przyjazdu",
  fieldEnd: "Data wyjazdu (dzień wymeldowania)",
  fieldSurname: "Nazwisko gościa",
  fieldPhone: "Numer telefonu",
  fieldRates: "Cena za noc wg miesiąca (zł)",
  fieldDeposit: "Zadatek / kwota wpłacona (zł)",
  fieldNote: "Notatka (opcjonalnie)",
  outstandingBalance: "Pozostało do zapłaty",
  clearBooking: "Usuń rezerwację",
  cancel: "Anuluj",
  saveBooking: "Zapisz rezerwację",
  confirmClearBooking: "Usunąć tę rezerwację i oznaczyć termin jako wolny?",

  errDatesInvalid: "Sprawdź daty — data wyjazdu musi być późniejsza niż data przyjazdu.",
  errSurnameRequired: "Podaj nazwisko gościa.",
  errOverlap: "{unit} jest już zarezerwowany w tym terminie ({surname}, {start} – {end}). Wybierz inne daty.",
  warnTurnover: "⚠ {surname} wymeldowuje się z {unit} tego samego dnia. Nadal możesz zapisać tę rezerwację.",

  toastBookingSaved: "Rezerwacja zapisana",
  toastBookingCleared: "Rezerwacja usunięta",
  toastGuestUpdated: "Dane gościa zaktualizowane",
  toastPricesSaved: "Ceny zapisane dla ",
  gsiLoading: "Logowanie Google się jeszcze ładuje — spróbuj za chwilę",

  connectDrive: "Połącz z Google Drive",
  connecting: "Łączenie…",
  connectedAs: "Połączono jako {email}",
  notConnected: "Brak połączenia — zmiany są zapisywane tylko na tym komputerze",
  lastSynced: "Ostatnia synchronizacja {time}",
  neverSynced: "Jeszcze nie zsynchronizowano",
  syncError: "Nie udało się połączyć z Google Drive — spróbuję ponownie",
  savingToDrive: "Zapisywanie w Google Drive…",
  shareWithLabel: "Udostępnij podgląd kontu Google Babci",
  shareWithPlaceholder: "babcia@example.com",
  shareWithBtn: "Udostępnij",
  shareWithSuccess: "Udostępniono — Babcia może teraz połączyć się ze swojego urządzenia",
  shareWithError: "Nie udało się udostępnić pliku — sprawdź adres e-mail i spróbuj ponownie",

  grannyChooseFile: "Znajdź udostępniony kalendarz",
  grannyChooseFileHint: "To jednorazowy krok — potem kalendarz aktualizuje się sam.",
  grannyFileFound: "Znaleziono kalendarz udostępniony przez Mamę",
  grannyFileNotFound: "Nie znaleziono jeszcze pliku „{name}” udostępnionego temu kontu. Poproś Mamę o jego udostępnienie i spróbuj ponownie.",
  grannyOffline: "Wyświetlana jest ostatnio zsynchronizowana wersja (brak połączenia lub jeszcze nie połączono)",
  grannyLastSynced: "Ostatnia aktualizacja {time}",

  momEditBadge: "Mama · pełny dostęp",
  grannyViewBadge: "Babcia · tylko podgląd",

  landingIntro: "Kalendarz rezerwacji dla Villa Zawoja, Władysławowo. Wybierz swój link poniżej.",
  landingMomTitle: "Mama",
  landingMomDesc: "Dodawaj, edytuj i anuluj rezerwacje. Ustawiaj ceny.",
  landingGrannyTitle: "Babcia",
  landingGrannyDesc: "Tylko podgląd kalendarza i gości.",
  landingWarning: "Zapisz sobie od razu właściwy link, zamiast wracać za każdym razem na tę stronę. Link Mamy udostępnij tylko Mamie — każdy, kto się na nim zaloguje, może tworzyć i zmieniać rezerwacje."
};

/* ============================= LANGUAGE STATE ============================= */
const LANG_KEY = 'villaZawojaLang';
let CURRENT_LANG = 'en';
let STRINGS = STRINGS_EN;

function getLanguage() {
  return localStorage.getItem(LANG_KEY) || 'en';
}
function initLanguage() {
  CURRENT_LANG = getLanguage();
  STRINGS = CURRENT_LANG === 'pl' ? STRINGS_PL : STRINGS_EN;
}
function setLanguage(lang) {
  localStorage.setItem(LANG_KEY, lang);
  CURRENT_LANG = lang;
  STRINGS = lang === 'pl' ? STRINGS_PL : STRINGS_EN;
  applyStrings();
  updateLangToggleUI();
  if (typeof renderAll === 'function') renderAll();
}
initLanguage();

function updateLangToggleUI() {
  document.querySelectorAll('#langToggle button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === CURRENT_LANG);
  });
}

function fmt(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, k) => (vars && k in vars) ? vars[k] : `{${k}}`);
}

/* Polish plural forms: 1 → forms[0], 2-4 (not 12-14) → forms[1], else → forms[2].
   English just needs singular/plural, forms[0] / forms[2] works for that too. */
function pluralize(n, formsEn, formsPl) {
  if (CURRENT_LANG === 'pl') {
    if (n === 1) return formsPl[0];
    const mod10 = n % 10, mod100 = n % 100;
    if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return formsPl[1];
    return formsPl[2];
  }
  return n === 1 ? formsEn[0] : formsEn[1];
}

function formatGuestBookingsCount(n) {
  return CURRENT_LANG === 'pl'
    ? `${n} ${pluralize(n, [], ['rezerwacja', 'rezerwacje', 'rezerwacji'])} na koncie`
    : `${n} ${pluralize(n, ['booking', 'bookings'], [])} on record`;
}

function formatNightsCount(n) {
  return `${n} ${pluralize(n, ['night', 'nights'], ['noc', 'noce', 'nocy'])}`;
}

function formatBalanceLine(balance, total, nights) {
  return CURRENT_LANG === 'pl'
    ? `${balance} zł  (razem ${total} zł za ${formatNightsCount(nights)})`
    : `${balance} zł  (total ${total} zł for ${formatNightsCount(nights)})`;
}

/* ============================= APPLY TO DOM ============================= */
function applyStrings() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (STRINGS[key] != null) el.textContent = STRINGS[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (STRINGS[key] != null) el.setAttribute('placeholder', STRINGS[key]);
  });
}
