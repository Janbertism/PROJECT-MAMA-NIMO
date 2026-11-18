// File: js/components/map.js
// Leaflet.js map wrapper for the Nearby Job Finder page.
// Exposes window.JobMap following the project's global window.* script pattern.

const JobMap = {
  map: null,
  pinLayer: null,
  userLayer: null,
  jobs: [],
  onPinClick: null,

  /**
   * Create the Leaflet map inside #jobs-map, add the tile layer, and
   * render pins for the given jobs.
   * @param {string} mapId
   * @param {Object[]} jobs
   * @param {object} [opts]
   * @returns {L.Map|null}
   */
  init(mapId, jobs = [], opts = {}) {
    const el = document.getElementById(mapId);
    if (!el || !window.L) {
      console.warn("Leaflet or map element missing.");
      return null;
    }

    // Clean up existing map instance if re-initialized
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    const center = opts.center || [10.323, 123.954];
    const zoom = opts.zoom || 12;

    this.map = L.map(el, { zoomControl: true }).setView(center, zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(this.map);

    this.pinLayer = L.layerGroup().addTo(this.map);
    this.userLayer = L.layerGroup().addTo(this.map);
    this.jobs = jobs;
    this.onPinClick = opts.onPinClick || null;

    this.renderPins(jobs);

    // Force Leaflet to recalculate container bounds after render
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 150);

    return this.map;
  },

  /** Clear and re-render pins for the given job list. */
  renderPins(jobs) {
    if (!this.map || !this.pinLayer) return;
    this.pinLayer.clearLayers();
    this.jobs = jobs;

    jobs.forEach((job) => {
      if (job.lat == null || job.lng == null) return;
      const marker = L.marker([job.lat, job.lng]).addTo(this.pinLayer);
      marker.jobId = job.id;
      marker.bindPopup(this.buildPopup(job));
      marker.on("click", () => this.firePinClick(job.id));
    });
  },

  /** Build the HTML shown in a pin's popup. */
  buildPopup(job) {
    const esc = (window.JFUtils && JFUtils.escapeHtml)
      ? JFUtils.escapeHtml
      : (s) => String(s);
    const salary = (window.JFUtils && JFUtils.formatSalaryRange)
      ? JFUtils.formatSalaryRange(job.salaryMin, job.salaryMax)
      : "";
    return (
      '<div class="map-popup">' +
      "<strong>" + esc(job.title) + "</strong><br/>" +
      "<span>" + esc(job.company) + "</span><br/>" +
      "<span>" + esc(salary) + "</span>" +
      "</div>"
    );
  },

  /** Notify listeners that a pin was clicked. */
  firePinClick(jobId) {
    if (this.onPinClick) this.onPinClick(jobId);
  },

  /** Register a pin-click handler (used by the results panel to sync cards). */
  setPinClickHandler(fn) {
    this.onPinClick = fn;
  },

  /**
   * Add/update the user's current-location marker and fly to it.
   * @param {number} lat
   * @param {number} lng
   */
  setUserLocation(lat, lng) {
    if (!this.map) return;
    this.userLayer.clearLayers();

    L.circleMarker([lat, lng], {
      radius: 8,
      color: "#2563eb",
      fillColor: "#3b82f6",
      fillOpacity: 0.9
    }).addTo(this.userLayer).bindPopup("You are here");

    L.marker([lat, lng], {
      icon: L.divIcon({
        className: "user-dot",
        html: '<div style="width:14px;height:14px;background:#1d4ed8;border:3px solid #fff;border-radius:50%"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      })
    }).addTo(this.userLayer);

    this.map.flyTo([lat, lng], Math.max(this.map.getZoom(), 13), { duration: 0.6 });
    setTimeout(() => this.map.invalidateSize(), 150);
  },

  /** Fly the map to a job's coordinates and open its pin popup. */
  flyToJob(job) {
    if (!this.map || !job || job.lat == null || job.lng == null) return;
    this.map.flyTo([job.lat, job.lng], 14, { duration: 0.5 });
    setTimeout(() => this.map.invalidateSize(), 150);
    this.openPinPopup(job.id);
  },

  /** Open the popup of the pin matching the given job id. */
  openPinPopup(jobId) {
    if (!this.pinLayer) return;
    this.pinLayer.eachLayer((layer) => {
      if (layer.jobId === jobId && layer.openPopup) layer.openPopup();
    });
  }
};

// Expose globally.
window.JobMap = JobMap;