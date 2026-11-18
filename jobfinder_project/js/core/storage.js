// File: js/core/storage.js
// localStorage helpers for saved jobs, application statuses, custom jobs,
// and theme preference. All keys namespaced under "jobfinder_".

const STORAGE_KEY_SAVED = "jobfinder_saved";
const STORAGE_KEY_CUSTOM = "jobfinder_custom_jobs";
const STORAGE_KEY_THEME = "jobfinder_theme";

const SavedStorage = {
  // ---------- Saved jobs + application status ----------
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SAVED);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      console.warn("Failed to read saved jobs from localStorage", e);
      return {};
    }
  },

  save(map) {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(map));
    } catch (e) {
      console.warn("Failed to write saved jobs to localStorage", e);
    }
  },

  getStatus(jobId) {
    return this.load()[jobId] || null;
  },

  setStatus(jobId, status) {
    const map = this.load();
    if (status) map[jobId] = status;
    else delete map[jobId];
    this.save(map);
    return map;
  },

  toggleSaved(jobId) {
    const map = this.load();
    if (map[jobId]) delete map[jobId];
    else map[jobId] = "saved";
    this.save(map);
    return map;
  },

  savedIds() {
    return Object.keys(this.load());
  },

  count() {
    return Object.keys(this.load()).length;
  },

  clear() {
    try { localStorage.removeItem(STORAGE_KEY_SAVED); }
    catch (e) { console.warn("Failed to clear saved jobs", e); }
  },

  // ---------- Custom jobs (employer portal) ----------
  loadCustomJobs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("Failed to read custom jobs", e);
      return [];
    }
  },

  saveCustomJobs(jobs) {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(jobs));
    } catch (e) {
      console.warn("Failed to write custom jobs", e);
    }
  },

  addCustomJob(job) {
    const all = this.loadCustomJobs();
    all.push(job);
    this.saveCustomJobs(all);
    return all;
  },

  /** Delete a custom posted job by id */
  deleteCustomJob(id) {
    const all = this.loadCustomJobs();
    const filtered = all.filter((job) => String(job.id) !== String(id));
    this.saveCustomJobs(filtered);
    return filtered;
  },

  // ---------- Theme ----------
  getTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY_THEME) || "light";
    } catch (e) {
      return "light";
    }
  },

  setTheme(theme) {
    try { localStorage.setItem(STORAGE_KEY_THEME, theme); }
    catch (e) { /* ignore */ }
  }
};

window.SavedStorage = SavedStorage;