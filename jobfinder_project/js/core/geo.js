// File: js/core/geo.js
// Browser geolocation, Haversine distance formula, and Metro Cebu location presets.

/**
 * Compute the great-circle distance between two lat/lng points using the
 * Haversine formula. Returns distance in kilometres.
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} distance in km
 */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format a distance in km into a short, friendly string.
 * @param {number} km
 * @returns {string}
 */
function formatDistance(km) {
  if (km == null || isNaN(km)) return "Distance unknown";
  if (km < 1) return `${(km * 1000).toFixed(0)} m away`;
  return `${km.toFixed(1)} km away`;
}

/**
 * Real Metro Cebu location presets with exact GPS coordinates.
 * Each entry: { name, lat, lng, label }
 */
const LOCATION_PRESETS = [
  { name: "Cebu IT Park, Lahug, Cebu City", lat: 10.3308, lng: 123.9063, label: "Cebu IT Park" },
  { name: "Mactan Newtown, Lapu-Lapu City", lat: 10.3089, lng: 124.0016, label: "Mactan Newtown" },
  { name: "Cebu Business Park (Ayala), Cebu City", lat: 10.3181, lng: 123.9056, label: "Ayala Center Cebu" },
  { name: "Mandaue City Centro / A.S. Fortuna", lat: 10.3333, lng: 123.9333, label: "Mandaue City" },
  { name: "MEPZ 1 / Pusok, Lapu-Lapu City", lat: 10.3236, lng: 123.9794, label: "MEPZ 1" }
];

/**
 * Resolve a preset name (or partial label) to its coordinate object.
 * Falls back to null if not found.
 * @param {string} name
 * @returns {{name:string,lat:number,lng:number,label:string}|null}
 */
function findPreset(name) {
  if (!name) return null;
  const n = String(name).toLowerCase();
  return LOCATION_PRESETS.find(p =>
    p.name.toLowerCase() === n || p.label.toLowerCase() === n || p.name.toLowerCase().includes(n)
  ) || null;
}

/**
 * Request the user's current position via the browser Geolocation API.
 * Returns a Promise that resolves to { lat, lng } or null on failure.
 * @returns {Promise<{lat:number,lng:number}|null>}
 */
function getCurrentPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported by this browser.");
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  });
}

// Expose globally.
window.Geo = { haversineKm, formatDistance, LOCATION_PRESETS, findPreset, getCurrentPosition };