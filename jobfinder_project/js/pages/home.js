// File: js/pages/home.js
// Main controller for the Nearby Job Finder homepage

(function () {
  const state = {
    allJobs: [],
    filteredJobs: [],
    selectedJobId: null,
    userLat: 10.3308, // Default: Cebu IT Park
    userLng: 123.9063,
    radiusKm: 15,
    keyword: "",
    age: null,
    setup: "all",
    type: "all"
  };

  function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    if (window.Geo && typeof window.Geo.distanceKm === "function") {
      return window.Geo.distanceKm(lat1, lon1, lat2, lon2);
    }
    if (window.Geo && typeof window.Geo.haversine === "function") {
      return window.Geo.haversine(lat1, lon1, lat2, lon2);
    }
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function formatSalary(min, max) {
    if (window.Utils && typeof window.Utils.formatSalary === "function") {
      return window.Utils.formatSalary(min, max);
    }
    return `₱${Number(min).toLocaleString()} – ₱${Number(max).toLocaleString()}/mo`;
  }

  function migrateLegacySaved() {
    try {
      const legacy = JSON.parse(localStorage.getItem("jf_saved_jobs") || "[]");
      if (Array.isArray(legacy) && legacy.length > 0 && window.SavedStorage) {
        const current = SavedStorage.load();
        legacy.forEach((id) => {
          if (!current[id]) current[String(id)] = "Saved";
        });
        SavedStorage.save(current);
        localStorage.removeItem("jf_saved_jobs");
      }
    } catch (e) {}
  }

  function getSavedIds() {
    if (window.SavedStorage) {
      return SavedStorage.savedIds().map(String);
    }
    try {
      return JSON.parse(localStorage.getItem("jf_saved_jobs") || "[]").map(String);
    } catch (e) {
      return [];
    }
  }

  function toggleSavedId(id) {
    if (window.SavedStorage) {
      const map = SavedStorage.load();
      if (map[id]) {
        delete map[id];
      } else {
        map[id] = "Saved";
      }
      SavedStorage.save(map);
    }
    updateSavedBadge();
  }

  function updateSavedBadge() {
    const badge = document.getElementById("saved-count-badge");
    if (badge) badge.textContent = getSavedIds().length;
  }

  // Handle Local Sign In & Profile State
  function initAuth() {
    const authContainer = document.getElementById("auth-container");
    if (!authContainer) return;

    function renderAuthUI() {
      const storedUser = localStorage.getItem("jf_user_profile");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        authContainer.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.6rem; background: var(--bg-subtle); padding: 4px 10px; border-radius: 999px; border: 1px solid var(--border-color);">
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">👋 ${user.name}</span>
            <button id="signout-btn" style="background: none; border: none; color: #dc2626; font-size: 0.75rem; font-weight: 700; cursor: pointer;" title="Sign Out">Sign Out</button>
          </div>
        `;
        const signoutBtn = document.getElementById("signout-btn");
        if (signoutBtn) {
          signoutBtn.addEventListener("click", () => {
            localStorage.removeItem("jf_user_profile");
            renderAuthUI();
          });
        }
      } else {
        authContainer.innerHTML = `
          <a href="html/login.html" class="btn-secondary" style="padding: 0.5rem 1rem; border-radius: 10px; font-weight: 600; font-size: 0.88rem; text-decoration: none; display: inline-flex; align-items: center; pointer-events: auto; cursor: pointer;">Sign In</a>
        `;
      }
    }

    renderAuthUI();
  }

  function filterAndSortJobs() {
    const enriched = state.allJobs.map((job) => ({
      ...job,
      distance: calculateDistanceKm(state.userLat, state.userLng, job.lat, job.lng)
    }));

    state.filteredJobs = enriched
      .filter((job) => {
        const withinRadius = job.setup === "remote" || job.distance <= state.radiusKm;
        const matchesAge = !state.age || state.age >= (job.minAge || 18);
        const matchesSetup =
          state.setup === "all" ||
          (job.setup || "").toLowerCase() === state.setup.toLowerCase();
        const matchesType =
          state.type === "all" ||
          (job.type || "").toLowerCase() === state.type.toLowerCase();
        const q = state.keyword.trim().toLowerCase();
        const matchesKeyword =
          !q ||
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          (job.requirements || []).some((r) => r.toLowerCase().includes(q));

        return withinRadius && matchesAge && matchesSetup && matchesType && matchesKeyword;
      })
      .sort((a, b) => a.distance - b.distance);

    renderFeed();
    syncMap();
  }

  function renderFeed() {
    const feedEl = document.getElementById("jobs-feed") || document.getElementById("jobsFeed");
    const countEl = document.getElementById("results-count") || document.getElementById("resultsCount");
    if (!feedEl) return;

    if (countEl) {
      countEl.textContent = `${state.filteredJobs.length} job${state.filteredJobs.length === 1 ? "" : "s"} near you`;
    }

    if (state.filteredJobs.length === 0) {
      feedEl.innerHTML = `
        <div class="empty-state">
          <h3>No matching jobs within ${state.radiusKm} km</h3>
          <p>Try increasing your distance radius slider or clearing active filters.</p>
        </div>
      `;
      return;
    }

    const savedIds = getSavedIds();

    feedEl.innerHTML = state.filteredJobs
      .map((job) => {
        const isSaved = savedIds.includes(String(job.id));
        const isSelected = String(job.id) === String(state.selectedJobId);
        return `
          <article class="job-card ${isSelected ? "selected" : ""}" data-job-id="${job.id}">
            <div class="card-top">
              <div>
                <h3 class="job-title">${job.title}</h3>
                <p class="company-name">${job.company}</p>
              </div>
              <button type="button" class="bookmark-btn ${isSaved ? "saved" : ""}" data-save-id="${job.id}" title="Save Job">
                ${isSaved ? "♥" : "♡"}
              </button>
            </div>

            <div class="badge-row">
              <span class="pill distance-pill">📍 ${job.distance.toFixed(1)} km away</span>
              <span class="pill setup-pill">${job.setup}</span>
              <span class="pill type-pill">${job.type}</span>
              <span class="pill age-pill">${job.minAge}+ yrs</span>
            </div>

            <div class="salary-line">${formatSalary(job.salaryMin, job.salaryMax)}</div>
            <p class="posted-date">Posted: ${job.postedAt}</p>
          </article>
        `;
      })
      .join("");

    feedEl.querySelectorAll(".job-card").forEach((card) => {
      const jobId = card.dataset.jobId;
      card.addEventListener("click", (e) => {
        if (e.target.closest(".bookmark-btn")) return;
        selectJob(jobId);
      });
    });

    feedEl.querySelectorAll(".bookmark-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleSavedId(btn.dataset.saveId);
        renderFeed();
      });
    });

    if (!state.selectedJobId && state.filteredJobs.length > 0) {
      selectJob(state.filteredJobs[0].id);
    }
  }

  function selectJob(jobId) {
    state.selectedJobId = jobId;
    const job =
      state.filteredJobs.find((j) => String(j.id) === String(jobId)) ||
      state.allJobs.find((j) => String(j.id) === String(jobId));
    if (!job) return;

    document.querySelectorAll(".job-card").forEach((el) => {
      el.classList.toggle("selected", String(el.dataset.jobId) === String(jobId));
    });

    const detailsEl =
      document.getElementById("job-details-panel") || document.getElementById("jobDetails");
    if (detailsEl) {
      detailsEl.innerHTML = `
        <div class="details-header">
          <span class="pill distance-pill">📍 ${job.distance ? job.distance.toFixed(1) + " km away" : "Metro Cebu"}</span>
        </div>
        <h2>${job.title}</h2>
        <p class="company-sub">${job.company} • ${job.setup} • ${job.type}</p>
        <div class="salary-highlight">${formatSalary(job.salaryMin, job.salaryMax)}</div>

        <h4>Role Overview</h4>
        <p>${job.description}</p>

        <h4>Requirements & Qualifications</h4>
        <ul class="checklist">
          ${(job.requirements || []).map((req) => `<li>✔ ${req}</li>`).join("")}
        </ul>

        <h4>Benefits & Perks</h4>
        <div class="perks-wrap">
          ${(job.perks || []).map((perk) => `<span class="perk-tag">${perk}</span>`).join("")}
        </div>

        <div class="details-actions">
          <button id="open-apply-btn" class="btn-primary" style="cursor: pointer; pointer-events: auto;">Apply Now</button>
          <a href="https://www.google.com/maps/search/?api=1&query=${job.lat},${job.lng}" target="_blank" rel="noopener" class="btn-secondary">
            Open in Google Maps
          </a>
        </div>
      `;

      const applyBtn = document.getElementById("open-apply-btn");
      if (applyBtn) {
        applyBtn.addEventListener("click", () => openApplyModal(job));
      }
    }

    if (window.JobMap) {
      if (typeof window.JobMap.flyToJob === "function") {
        window.JobMap.flyToJob(job);
      } else if (typeof window.JobMap.focusJob === "function") {
        window.JobMap.focusJob(job);
      }
    }
  }

  function openApplyModal(job) {
    const modal = document.getElementById("apply-modal") || document.getElementById("applyModal");
    const body = document.getElementById("modal-body") || document.getElementById("modalBody");
    if (!modal || !body) return;

    const mailto = `mailto:${job.applyEmail}?subject=${encodeURIComponent(
      `Application for ${job.title} - JobFinder Near Me`
    )}&body=${encodeURIComponent(
      `Hello ${job.company} Hiring Team,\n\nI would like to apply for the ${job.title} position listed on JobFinder Near Me.\n\nBest regards,`
    )}`;

    body.innerHTML = `
      <h3>Apply to ${job.company}</h3>
      <p>Position: <strong>${job.title}</strong> (${formatSalary(job.salaryMin, job.salaryMax)})</p>
      <div class="modal-cta-group" style="display:flex; flex-direction:column; gap:10px; margin-top:16px;">
        <a href="${mailto}" class="btn-primary" id="confirm-email-apply">✉️ Send Email Application (${job.applyEmail})</a>
        <a href="${job.applyUrl}" target="_blank" rel="noopener" class="btn-secondary">🌐 Apply via Company Career Portal</a>
      </div>
    `;

    modal.classList.remove("hidden");
  }

  function syncMap() {
    if (!window.JobMap) return;
    if (typeof window.JobMap.setUserLocation === "function") {
      window.JobMap.setUserLocation(state.userLat, state.userLng);
    }
    if (typeof window.JobMap.renderPins === "function") {
      window.JobMap.renderPins(state.filteredJobs);
      if (typeof window.JobMap.setPinClickHandler === "function") {
        window.JobMap.setPinClickHandler((jobId) => selectJob(jobId));
      }
    }
  }

  function bindControls() {
    const keywordInput = document.getElementById("keyword-input");
    if (keywordInput) {
      keywordInput.addEventListener("input", (e) => {
        state.keyword = e.target.value;
        filterAndSortJobs();
      });
    }

    const locationSelect = document.getElementById("location-select");
    if (locationSelect) {
      locationSelect.addEventListener("change", (e) => {
        const [lat, lng] = e.target.value.split(",").map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          state.userLat = lat;
          state.userLng = lng;
          filterAndSortJobs();
        }
      });
    }

    const gpsBtn = document.getElementById("use-gps-btn");
    if (gpsBtn) {
      gpsBtn.addEventListener("click", () => {
        if (!navigator.geolocation) {
          alert("Geolocation is not supported by your browser.");
          return;
        }
        gpsBtn.textContent = "Locating...";
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            state.userLat = pos.coords.latitude;
            state.userLng = pos.coords.longitude;
            gpsBtn.textContent = "🎯 GPS Active";
            filterAndSortJobs();
          },
          () => {
            gpsBtn.textContent = "🎯 GPS Location";
            alert("Unable to retrieve GPS location. Please choose an area from the dropdown.");
          }
        );
      });
    }

    const radiusSlider = document.getElementById("radius-slider");
    const radiusValue = document.getElementById("radius-value");
    if (radiusSlider) {
      radiusSlider.addEventListener("input", (e) => {
        state.radiusKm = Number(e.target.value);
        if (radiusValue) radiusValue.textContent = `${state.radiusKm} km`;
        filterAndSortJobs();
      });
    }

    const ageInput = document.getElementById("age-input");
    if (ageInput) {
      ageInput.addEventListener("input", (e) => {
        state.age = e.target.value ? Number(e.target.value) : null;
        filterAndSortJobs();
      });
    }

    document.querySelectorAll("#setup-chips .chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        document.querySelectorAll("#setup-chips .chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        state.setup = chip.dataset.setup;
        filterAndSortJobs();
      });
    });

    document.querySelectorAll("#type-chips .chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        document.querySelectorAll("#type-chips .chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        state.type = chip.dataset.type;
        filterAndSortJobs();
      });
    });

    const closeModal = document.getElementById("close-modal-btn");
    const modal = document.getElementById("apply-modal");
    if (closeModal && modal) {
      closeModal.addEventListener("click", () => modal.classList.add("hidden"));
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.add("hidden");
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    migrateLegacySaved();
    state.allJobs = window.JobAPI ? window.JobAPI.fetchJobs() : [];

    if (window.JobMap && typeof window.JobMap.init === "function") {
      window.JobMap.init("jobs-map", state.allJobs, {
        center: [state.userLat, state.userLng],
        onPinClick: (jobId) => selectJob(jobId)
      });
    }

    updateSavedBadge();
    initAuth();
    bindControls();
    filterAndSortJobs();
  });
})();