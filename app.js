/* ==========================================================================
   Elite TripPlay — app.js
   Logique de l'app shell. Pas de framework : DOM natif, léger, offline-friendly.
   ========================================================================== */

const STORAGE_KEY = "elite-tripplay:lang";

/* ---------------------------------------------------------------------- */
/* Ecran langue                                                            */
/* ---------------------------------------------------------------------- */

const langGrid = document.getElementById("langGrid");
const continueBtn = document.getElementById("continueBtn");
const langSubtitle = document.getElementById("langSubtitle");

let selectedLang = localStorage.getItem(STORAGE_KEY) || null;

function renderLangGrid() {
  langGrid.innerHTML = "";
  LANGUAGES.forEach((lang) => {
    const btn = document.createElement("button");
    btn.className = "lang-btn" + (lang.code === selectedLang ? " selected" : "");
    btn.textContent = lang.label;
    btn.dataset.code = lang.code;
    btn.addEventListener("click", () => selectLang(lang.code));
    langGrid.appendChild(btn);
  });
  continueBtn.disabled = !selectedLang;
  if (selectedLang) applyStrings(selectedLang);
}

function selectLang(code) {
  selectedLang = code;
  localStorage.setItem(STORAGE_KEY, code);
  [...langGrid.children].forEach((b) => b.classList.toggle("selected", b.dataset.code === code));
  continueBtn.disabled = false;
  applyStrings(code);
}

function applyStrings(code) {
  const s = STRINGS[code] || STRINGS.en;
  langSubtitle.textContent = s.subtitle;
  document.getElementById("tripStatusLabel").textContent = s.tripStatus;
  document.getElementById("tripTimeLeft").textContent = s.timeLeft;
  document.getElementById("offlineBanner").textContent = s.offline;

  document.getElementById("trip2Title").textContent = s.myTrip;
  document.getElementById("trip2RemainingLabel").textContent = s.remaining;
  document.getElementById("trip2DepartureLabel").textContent = s.departure;
  document.getElementById("trip2ArrivalLabel").textContent = s.arrival;
  document.getElementById("trip2DurationLabel").childNodes[0].textContent = s.duration + " ";
  document.getElementById("trip2DistanceLabel").childNodes[0].textContent = s.distance + " ";
}

continueBtn.addEventListener("click", () => {
  if (!selectedLang) return;
  goToScreen("home");
});

renderLangGrid();

// Si une langue est déjà mémorisée, on peut sauter direct au dashboard
// au prochain lancement — décommente si tu veux ce comportement :
// if (selectedLang) goToScreen("home");

/* ---------------------------------------------------------------------- */
/* Navigation entre écrans                                                 */
/* ---------------------------------------------------------------------- */

function goToScreen(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.getElementById("screen-" + name)?.classList.add("active");
}

/* ---------------------------------------------------------------------- */
/* Sidebar dashboard                                                       */
/* ---------------------------------------------------------------------- */

// Ecrans déjà intégrés, mappés depuis data-target de la sidebar
const IMPLEMENTED_SCREENS = { home: "home", trip: "trip" };

document.querySelectorAll(".side-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".side-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const target = btn.dataset.target;
    const screen = IMPLEMENTED_SCREENS[target];
    if (screen) {
      goToScreen(screen);
      return;
    }
    // Les écrans restants (favoris, vidéo, menu) arrivent au fur et à
    // mesure que tu m'envoies les maquettes correspondantes.
    showToast("Écran « " + target + " » à venir");
  });
});

document.getElementById("trip2RefreshBtn")?.addEventListener("click", () => {
  showToast("Actualisation du trajet — à connecter au GPS");
});

/* ---------------------------------------------------------------------- */
/* Cartes du dashboard (placeholders tant que les écrans détaillés         */
/* n'existent pas)                                                         */
/* ---------------------------------------------------------------------- */

document.querySelectorAll(".card[data-action], .card-tile[data-action]").forEach((card) => {
  card.addEventListener("click", () => {
    showToast("« " + card.dataset.action + " » — écran à construire");
  });
});

document.getElementById("loginBtn")?.addEventListener("click", () => {
  showToast("Connexion — à implémenter");
});

document.getElementById("tripTrackerBtn")?.addEventListener("click", () => {
  document.querySelectorAll(".side-btn").forEach((b) => b.classList.toggle("active", b.dataset.target === "trip"));
  goToScreen("trip");
});

/* ---------------------------------------------------------------------- */
/* Barre du bas                                                            */
/* ---------------------------------------------------------------------- */

document.getElementById("btnCall")?.addEventListener("click", () => showToast("Appel — à implémenter"));
document.getElementById("btnLight")?.addEventListener("click", () => showToast("Éclairage — à implémenter"));
document.getElementById("btnVolume")?.addEventListener("click", () => showToast("Volume — à implémenter"));
document.getElementById("btnBrightness")?.addEventListener("click", () => showToast("Luminosité — à implémenter"));
document.getElementById("btnSettings")?.addEventListener("click", () => showToast("Réglages — à implémenter"));

/* ---------------------------------------------------------------------- */
/* Toast utilitaire                                                        */
/* ---------------------------------------------------------------------- */

let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

/* ---------------------------------------------------------------------- */
/* Détection hors-ligne                                                    */
/* ---------------------------------------------------------------------- */

const offlineBanner = document.getElementById("offlineBanner");

function updateOnlineStatus() {
  offlineBanner.classList.toggle("show", !navigator.onLine);
}
window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);
updateOnlineStatus();

/* ---------------------------------------------------------------------- */
/* Enregistrement du service worker (offline + installable)                */
/* ---------------------------------------------------------------------- */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((err) => {
      console.warn("Service worker non enregistré :", err);
    });
  });
}

/* ---------------------------------------------------------------------- */
/* Invite d'installation PWA (Android/desktop Chrome)                      */
/* ---------------------------------------------------------------------- */

let deferredInstallPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
});

// Astuce : appelle installApp() depuis un bouton de ton choix (par ex. dans
// le panneau réglages une fois que tu l'auras construit).
function installApp() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  deferredInstallPrompt = null;
}
