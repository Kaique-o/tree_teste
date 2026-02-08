/* Ka Linktree — LGPD/cookies: banner + preferencias + bloqueio de analytics.
   - salva consentimento em localStorage e cookie (essencial).
   - carrega /js/analytics_stub.js SOMENTE se consent.analytics = true.
*/
(() => {
  const LS_KEY = "ka_consent_v1";
  const COOKIE_NAME = "ka_consent";
  const COOKIE_DAYS = 180;

  const $ = (id) => document.getElementById(id);

  const banner = $("cookie");
  const modal = $("modal");
  const togAnalytics = $("tog-analytics");

  const btnAccept = $("cookie-aceitar");
  const btnReject = $("cookie-rejeitar");
  const btnPrefs = $("cookie-preferencias");

  const btnClose = $("modal-close");
  const btnSave = $("prefs-salvar");
  const btnAcceptAll = $("prefs-aceitar");

  let analyticsLoaded = false;

  // ---------- cookie utils ----------
  function setCookie(name, value, days) {
    const maxAge = days * 24 * 60 * 60;
    // samesite=lax + secure (quando estiver em https)
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
  }

  function getCookie(name) {
    const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
  }

  // ---------- storage ----------
  function loadConsent() {
    // tenta localStorage
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}

    // fallback cookie
    try {
      const c = getCookie(COOKIE_NAME);
      if (c) return JSON.parse(c);
    } catch (_) {}

    return null;
  }

  function saveConsent(consent) {
    const payload = JSON.stringify(consent);
    try { localStorage.setItem(LS_KEY, payload); } catch (_) {}
    // cookie essencial: guarda a escolha (mesmo que seja rejeitar)
    setCookie(COOKIE_NAME, payload, COOKIE_DAYS);
  }

  // ---------- analytics loader ----------
  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;

    const s = document.createElement("script");
    s.src = "/js/analytics_stub.js";
    s.defer = true;
    document.head.appendChild(s);
  }

  function applyConsent(consent) {
    if (!consent) return;

    if (consent.analytics === true) {
      loadAnalytics();
    }
  }

  // ---------- UI ----------
  function showBanner() {
    if (banner) banner.hidden = false;
  }
  function hideBanner() {
    if (banner) banner.hidden = true;
  }

  function openPrefs() {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "false");

    // sync toggle com estado atual
    const current = loadConsent();
    if (togAnalytics) togAnalytics.checked = Boolean(current && current.analytics);

    // foco inicial
    const focusTarget = btnClose || togAnalytics || modal;
    setTimeout(() => focusTarget && focusTarget.focus && focusTarget.focus(), 0);
  }

  function closePrefs() {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
  }

  function setConsent({ analytics }) {
    const consent = {
      version: 1,
      ts: new Date().toISOString(),
      essential: true,
      analytics: Boolean(analytics)
    };
    saveConsent(consent);
    applyConsent(consent);
    hideBanner();
    closePrefs();
  }

  // expose pra outras paginas chamarem
  window.KaConsent = { openPrefs };

  // ---------- events ----------
  if (btnAccept) btnAccept.addEventListener("click", () => setConsent({ analytics: true }));
  if (btnReject) btnReject.addEventListener("click", () => setConsent({ analytics: false }));
  if (btnPrefs) btnPrefs.addEventListener("click", openPrefs);

  if (btnClose) btnClose.addEventListener("click", closePrefs);
  if (modal) {
    modal.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.getAttribute && t.getAttribute("data-close") === "1") closePrefs();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") closePrefs();
    });
  }

  if (btnSave) btnSave.addEventListener("click", () => setConsent({ analytics: togAnalytics && togAnalytics.checked }));
  if (btnAcceptAll) btnAcceptAll.addEventListener("click", () => setConsent({ analytics: true }));

  // ---------- init ----------
  const consent = loadConsent();
  if (!consent) {
    showBanner();
  } else {
    hideBanner();
    applyConsent(consent);
  }
})();
