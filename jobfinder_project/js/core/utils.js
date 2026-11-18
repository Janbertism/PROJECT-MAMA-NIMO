// File: js/core/utils.js
// Shared helpers: date formatting, PHP currency formatting, DOM helpers,
// and the Dark Mode toggle.

/**
 * Format an ISO date string (or Date) into a friendly "Posted X ago" string.
 * Handles minutes, hours, days, weeks, months, and years.
 * @param {string|Date} dateInput
 * @returns {string}
 */
function timeAgo(dateInput) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return "Posted recently";

  const now = new Date();
  let seconds = Math.floor((now - date) / 1000);
  if (seconds < 0) seconds = 0; // clock skew guard

  if (seconds < 60) return "Posted just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Posted ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Posted ${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Posted ${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `Posted ${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Posted ${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(days / 365);
  return `Posted ${years} year${years === 1 ? "" : "s"} ago`;
}

/**
 * Format a numeric PHP amount into a readable string.
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return "Negotiable";
  return "₱" + Math.round(amount).toLocaleString("en-PH");
}

/**
 * Build a full salary range string from numeric bounds.
 * @param {number} min
 * @param {number} max
 * @param {string} [period="month"]
 * @returns {string}
 */
function formatSalaryRange(min, max, period = "month") {
  const per = period === "hour" ? "/hr" : "/month";
  if (min != null && max != null && !isNaN(min) && !isNaN(max)) {
    return `${formatCurrency(min)} - ${formatCurrency(max)}${per}`;
  }
  if (min != null && !isNaN(min)) return `From ${formatCurrency(min)}${per}`;
  if (max != null && !isNaN(max)) return `Up to ${formatCurrency(max)}${per}`;
  return "Salary not disclosed";
}

/**
 * Escape text so it is safe to insert via innerHTML.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Debounce a function so it only fires after a quiet period.
 * @param {Function} fn
 * @param {number} [waitMs=250]
 * @returns {Function}
 */
function debounce(fn, waitMs = 250) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), waitMs);
  };
}

/**
 * Dark Mode toggle — applies/removes the "dark" class on <html> and persists
 * the choice in localStorage via SavedStorage.
 */
function setupDarkModeToggle() {
  const root = document.documentElement;
  const toggleBtn = document.getElementById("themeToggle");
  if (!toggleBtn) return;

  // Apply saved theme on load.
  const saved = (window.SavedStorage && SavedStorage.getTheme()) || "light";
  root.setAttribute("data-theme", saved);
  updateToggleIcon(saved);

  toggleBtn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    if (window.SavedStorage) SavedStorage.setTheme(next);
    updateToggleIcon(next);
    // Dispatch a custom event so map tiles can be refreshed.
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: next } }));
  });
}

function updateToggleIcon(theme) {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  btn.innerHTML = theme === "dark"
    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'
    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></circle></svg>';
}

// Expose globally.
window.JFUtils = { timeAgo, formatCurrency, formatSalaryRange, escapeHtml, debounce, setupDarkModeToggle };