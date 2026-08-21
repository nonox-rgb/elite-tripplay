/* ==========================================================================
   Langues disponibles + traductions minimales de l'UI.
   Pour ajouter une langue : ajoute une entrée dans LANGUAGES et un bloc
   dans STRINGS avec le même code.
   ========================================================================== */

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
];

const STRINGS = {
  en: {
    subtitle: "Select your language",
    tripStatus: "Trip status",
    timeLeft: "-- h -- m left",
    offline: "Offline — some features are unavailable",
  },
  fr: {
    subtitle: "Choisissez votre langue",
    tripStatus: "Statut du voyage",
    timeLeft: "--h --m restantes",
    offline: "Hors ligne — certaines fonctions sont indisponibles",
  },
  de: {
    subtitle: "Wähle deine Sprache",
    tripStatus: "Reisestatus",
    timeLeft: "--Std --Min verbleibend",
    offline: "Offline — einige Funktionen sind nicht verfügbar",
  },
  es: {
    subtitle: "Selecciona tu idioma",
    tripStatus: "Estado del viaje",
    timeLeft: "--h --m restantes",
    offline: "Sin conexión — algunas funciones no están disponibles",
  },
  it: {
    subtitle: "Seleziona la tua lingua",
    tripStatus: "Stato del viaggio",
    timeLeft: "--h --m rimanenti",
    offline: "Offline — alcune funzioni non sono disponibili",
  },
  pt: {
    subtitle: "Selecione o seu idioma",
    tripStatus: "Estado da viagem",
    timeLeft: "--h --m restantes",
    offline: "Offline — algumas funções estão indisponíveis",
  },
};
