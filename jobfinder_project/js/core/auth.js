// File: js/core/auth.js
(function () {
  function initGlobalAuth() {
    const authContainer = document.getElementById("auth-container");
    if (!authContainer) return;

    const isInSubfolder = window.location.pathname.includes("/html/");
    const loginPageUrl = isInSubfolder ? "login.html" : "html/login.html";

    const storedUser = localStorage.getItem("jf_user_profile");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      authContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.6rem; background: var(--bg-subtle); padding: 5px 12px; border-radius: 999px; border: 1px solid var(--border-color);">
          <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">${user.name}${user.age ? ` (${user.age})` : ""}</span>
          <span style="color: var(--border-color);">|</span>
          <button id="signout-btn" style="background: none; border: none; color: #dc2626; font-size: 0.78rem; font-weight: 700; cursor: pointer;" title="Sign Out">Sign Out</button>
        </div>
      `;

      const ageInput = document.getElementById("age-input");
      if (ageInput && user.age && !ageInput.value) {
        ageInput.value = user.age;
        ageInput.dispatchEvent(new Event("input", { bubbles: true }));
      }

      const signoutBtn = document.getElementById("signout-btn");
      if (signoutBtn) {
        signoutBtn.addEventListener("click", () => {
          localStorage.removeItem("jf_user_profile");
          initGlobalAuth();
        });
      }
    } else {
      authContainer.innerHTML = `
        <a href="${loginPageUrl}" class="btn-secondary" style="padding: 0.5rem 1rem; border-radius: 10px; font-weight: 600; font-size: 0.88rem; text-decoration: none; display: inline-flex; align-items: center;">Sign In</a>
      `;
    }
  }

  document.addEventListener("DOMContentLoaded", initGlobalAuth);
})();