
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
  const s = { ...STRINGS.en, ...(STRINGS[code] || {}) };
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

  document.getElementById("wifiTitle").textContent = s.wifiTitle;
  document.getElementById("wifiNameLabel").textContent = s.wifiName;
  document.getElementById("wifiTypeLabel").textContent = s.wifiType;
  document.getElementById("wifiEstimateLabel").textContent = s.wifiEstimate;
  document.getElementById("wifiPingLabel").textContent = s.wifiPing;
  document.getElementById("wifiSpeedLabel").textContent = s.wifiSpeed;

  document.getElementById("trackerAvgLabel").textContent = s.trackerAvg;
  document.getElementById("trackerMaxLabel").textContent = s.trackerMax;
  document.getElementById("trackerDistLabel").textContent = s.trackerDist;
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

document.getElementById("trip2OpenTrackerBtn")?.addEventListener("click", () => {
  openTracker("trip");
});

document.getElementById("trackerBackBtn")?.addEventListener("click", () => {
  goToScreen(trackerReturnScreen);
});

document.getElementById("wifiBackBtn")?.addEventListener("click", () => {
  goToScreen("home");
});

/* ---------------------------------------------------------------------- */
/* Cartes du dashboard                                                     */
/* ---------------------------------------------------------------------- */

// Ces services ne peuvent pas être intégrés dans l'app (restrictions des
// plateformes) : on ouvre l'appli installée sur la tablette, ou le site
// dans un nouvel onglet si elle n'est pas installée.
const EXTERNAL_APPS = {
  video: "https://www.youtube.com/",
  "app-streaming": "https://www.netflix.com/",
  "app-music": "https://open.spotify.com/",
};

document.querySelectorAll(".card[data-action], .card-tile[data-action]").forEach((card) => {
  card.addEventListener("click", () => {
    const action = card.dataset.action;

    if (action === "wifi-screen") {
      goToScreen("wifi");
      return;
    }

    const url = EXTERNAL_APPS[action];
    if (url) {
      if (!navigator.onLine) {
        showToast("Connexion internet nécessaire pour ouvrir cette appli");
        return;
      }
      window.open(url, "_blank", "noopener");
      return;
    }

    showToast("« " + action + " » — écran à construire");
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

/* ==========================================================================
   Wi-Fi — diagnostic
   ========================================================================== */

const WIFI_NAME_KEY = "elite-tripplay:wifiname";

function initWifiScreen() {
  const nameInput = document.getElementById("wifiNameInput");
  const savedName = localStorage.getItem(WIFI_NAME_KEY);
  if (savedName) nameInput.value = savedName;

  document.getElementById("wifiNameSaveBtn")?.addEventListener("click", () => {
    localStorage.setItem(WIFI_NAME_KEY, nameInput.value.trim());
    showToast("Nom du réseau enregistré");
  });

  // navigator.connection n'existe que sur Chrome/Android — sur les autres
  // navigateurs, on affiche simplement "Indisponible".
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const typeEl = document.getElementById("wifiType");
  const estimateEl = document.getElementById("wifiEstimate");

  if (conn) {
    typeEl.textContent = conn.effectiveType ? conn.effectiveType.toUpperCase() : (conn.type || "--");
    estimateEl.textContent = conn.downlink ? conn.downlink + " Mbps (estimation OS)" : "--";
  } else {
    typeEl.textContent = "Indisponible sur ce navigateur";
    estimateEl.textContent = "Indisponible sur ce navigateur";
  }

  document.getElementById("wifiPingBtn")?.addEventListener("click", measurePing);
  document.getElementById("wifiSpeedBtn")?.addEventListener("click", measureSpeed);
}

async function measurePing() {
  if (!navigator.onLine) { showToast("Pas de connexion"); return; }
  const el = document.getElementById("wifiPing");
  el.textContent = "…";
  const samples = [];
  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    try {
      await fetch("icon-96.png?bust=" + Date.now() + "-" + i, { cache: "no-store" });
      samples.push(performance.now() - start);
    } catch (e) {
      el.textContent = "Erreur";
      return;
    }
  }
  const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
  el.textContent = Math.round(avg) + " ms";
}

async function measureSpeed() {
  if (!navigator.onLine) { showToast("Pas de connexion"); return; }
  const el = document.getElementById("wifiSpeed");
  el.textContent = "Test en cours…";
  const fileSizeBits = 3 * 1024 * 1024 * 8; // speedtest-3mb.bin
  const start = performance.now();
  try {
    const res = await fetch("speedtest-3mb.bin?bust=" + Date.now(), { cache: "no-store" });
    await res.blob();
  } catch (e) {
    el.textContent = "Erreur — fichier introuvable ?";
    return;
  }
  const seconds = (performance.now() - start) / 1000;
  const mbps = fileSizeBits / seconds / 1_000_000;
  el.textContent = mbps.toFixed(1) + " Mbps (vers ce site)";
}

/* ==========================================================================
   Trip Tracker — GPS, carte, compteur de vitesse
   ========================================================================== */

const TRACKING_KEY = "elite-tripplay:tracking";
const SPEEDO_MAX = 220; // km/h, échelle du compteur
const SPEEDO_START_ANGLE = -130;
const SPEEDO_END_ANGLE = 130;

let trackerReturnScreen = "home";
let trackerMap = null;
let trackerDarkLayer = null;
let trackerSatelliteLayer = null;
let trackerPolyline = null;
let trackerMarker = null;
let trackerMapInitialized = false;
let wakeLockRef = null;

const tracking = loadTrackingState();

function loadTrackingState() {
  try {
    const raw = localStorage.getItem(TRACKING_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { active: false, points: [], distanceKm: 0, maxSpeedKmh: 0, startedAt: null, watchId: null };
}

function saveTrackingState() {
  // watchId n'a pas de sens d'une session à l'autre : on ne le persiste pas
  const { watchId, ...toSave } = tracking;
  localStorage.setItem(TRACKING_KEY, JSON.stringify(toSave));
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function openTracker(fromScreen) {
  trackerReturnScreen = fromScreen;
  goToScreen("tracker");
  setTimeout(() => {
    initTrackerMap();
    trackerMap.invalidateSize();
    if (tracking.points.length) {
      const last = tracking.points[tracking.points.length - 1];
      trackerMap.setView([last.lat, last.lng], trackerMap.getZoom());
    }
  }, 60);
  startTracking();
}

function initTrackerMap() {
  if (trackerMapInitialized) return;
  trackerMapInitialized = true;

  trackerMap = L.map("trackerMap", { zoomControl: false, attributionControl: true }).setView([48.85, 2.35], 13);

  trackerDarkLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: "© OpenStreetMap contributors © CARTO",
    subdomains: "abcd",
    maxZoom: 19,
  }).addTo(trackerMap);

  trackerSatelliteLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: "Tiles © Esri", maxZoom: 19 }
  );

  trackerPolyline = L.polyline([], { color: "#ff2f9e", weight: 4 }).addTo(trackerMap);

  const dotIcon = L.divIcon({ className: "tracker-dot-icon", iconSize: [16, 16] });
  trackerMarker = L.marker([48.85, 2.35], { icon: dotIcon }).addTo(trackerMap);

  if (tracking.points.length) {
    trackerPolyline.setLatLngs(tracking.points.map((p) => [p.lat, p.lng]));
  }

  document.getElementById("mapRecenterBtn")?.addEventListener("click", () => {
    if (!tracking.points.length) { showToast("Position pas encore disponible"); return; }
    const last = tracking.points[tracking.points.length - 1];
    trackerMap.setView([last.lat, last.lng], trackerMap.getZoom());
  });

  let satelliteOn = false;
  document.getElementById("mapSatelliteBtn")?.addEventListener("click", () => {
    satelliteOn = !satelliteOn;
    if (satelliteOn) {
      trackerMap.removeLayer(trackerDarkLayer);
      trackerSatelliteLayer.addTo(trackerMap);
    } else {
      trackerMap.removeLayer(trackerSatelliteLayer);
      trackerDarkLayer.addTo(trackerMap);
    }
  });
}

function startTracking() {
  if (tracking.active) return;
  if (!("geolocation" in navigator)) {
    showToast("Géolocalisation indisponible sur cet appareil");
    return;
  }

  tracking.active = true;
  tracking.startedAt = tracking.startedAt || Date.now();
  saveTrackingState();

  tracking.watchId = navigator.geolocation.watchPosition(onPosition, onPositionError, {
    enableHighAccuracy: true,
    maximumAge: 1000,
    timeout: 15000,
  });

  requestWakeLock();
}

function stopTracking() {
  if (tracking.watchId != null) navigator.geolocation.clearWatch(tracking.watchId);
  tracking.active = false;
  tracking.watchId = null;
  saveTrackingState();
  releaseWakeLock();
}

function onPositionError(err) {
  showToast("GPS indisponible : " + err.message);
}

function onPosition(pos) {
  const { latitude: lat, longitude: lng, speed } = pos.coords;
  const now = Date.now();
  const last = tracking.points[tracking.points.length - 1];

  let speedKmh = 0;
  if (typeof speed === "number" && speed !== null && !Number.isNaN(speed)) {
    speedKmh = speed * 3.6;
  } else if (last) {
    const dtH = (now - last.t) / 3_600_000;
    const dKm = haversineKm(last.lat, last.lng, lat, lng);
    speedKmh = dtH > 0 ? dKm / dtH : 0;
  }

  if (last) {
    tracking.distanceKm += haversineKm(last.lat, last.lng, lat, lng);
  }
  if (speedKmh > tracking.maxSpeedKmh) tracking.maxSpeedKmh = speedKmh;

  tracking.points.push({ lat, lng, t: now, speed: speedKmh });
  // Limite la mémoire : on garde un point toutes les ~3s pour un long trajet
  if (tracking.points.length > 3000) tracking.points.shift();

  saveTrackingState();
  updateSpeedo(speedKmh);
  updateTrackerStats();
  updateTrackerMapLive(lat, lng);
}

function updateTrackerStats() {
  const elapsedH = tracking.startedAt ? (Date.now() - tracking.startedAt) / 3_600_000 : 0;
  const avg = elapsedH > 0 ? tracking.distanceKm / elapsedH : 0;

  const avgEl = document.getElementById("trackerAvgSpeed");
  const maxEl = document.getElementById("trackerMaxSpeed");
  const distEl = document.getElementById("trackerDistance");
  if (avgEl) avgEl.textContent = avg.toFixed(0) + " km/h";
  if (maxEl) maxEl.textContent = tracking.maxSpeedKmh.toFixed(0) + " km/h";
  if (distEl) distEl.textContent = tracking.distanceKm.toFixed(1) + " km";
}

function updateTrackerMapLive(lat, lng) {
  if (!trackerMap) return;
  trackerMarker.setLatLng([lat, lng]);
  trackerPolyline.addLatLng([lat, lng]);
}

/* ---- Compteur de vitesse analogique ---- */

function polarPoint(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function buildSpeedoTicks() {
  const group = document.getElementById("speedoTicks");
  if (!group) return;
  group.innerHTML = "";
  const step = 20;
  for (let v = 0; v <= SPEEDO_MAX; v += step) {
    const angle = SPEEDO_START_ANGLE + (v / SPEEDO_MAX) * (SPEEDO_END_ANGLE - SPEEDO_START_ANGLE);
    const outer = polarPoint(100, 100, 88, angle);
    const inner = polarPoint(100, 100, 76, angle);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", inner.x);
    line.setAttribute("y1", inner.y);
    line.setAttribute("x2", outer.x);
    line.setAttribute("y2", outer.y);
    line.setAttribute("stroke", "rgba(255,255,255,0.4)");
    line.setAttribute("stroke-width", "2");
    group.appendChild(line);
  }
}
buildSpeedoTicks();

function updateSpeedo(speedKmh) {
  const clamped = Math.max(0, Math.min(SPEEDO_MAX, speedKmh));
  const angle = SPEEDO_START_ANGLE + (clamped / SPEEDO_MAX) * (SPEEDO_END_ANGLE - SPEEDO_START_ANGLE);

  const needle = document.getElementById("speedoNeedle");
  if (needle) needle.setAttribute("transform", `rotate(${angle} 100 100)`);

  const arc = document.getElementById("speedoArc");
  if (arc) {
    const start = polarPoint(100, 100, 92, SPEEDO_START_ANGLE);
    const end = polarPoint(100, 100, 92, angle);
    const largeArc = angle - SPEEDO_START_ANGLE > 180 ? 1 : 0;
    arc.setAttribute("d", `M ${start.x} ${start.y} A 92 92 0 ${largeArc} 1 ${end.x} ${end.y}`);
  }

  const valueEl = document.getElementById("speedoValue");
  if (valueEl) valueEl.textContent = Math.round(clamped);
}

/* ---- Wake Lock : empêche l'écran de s'éteindre pendant le suivi ---- */

async function requestWakeLock() {
  try {
   
