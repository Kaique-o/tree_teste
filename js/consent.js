/**
 * Kaique Oli Links Tree — LGPD/Cookies e Privacidade
 * --------------------------------------------------
 * Funcionalidade:
 * - Exibe o banner de cookies para novos visitantes.
 * - Salva o consentimento (analytics) no LocalStorage e Cookies de 1ª parte.
 * - Carrega scripts de analytics de forma condicional somente se autorizado.
 */

(() => {
  // Configurações de persistência
  const LS_KEY = "ka_consent_v1";
  const COOKIE_NAME = "ka_consent";
  const COOKIE_DAYS = 180; // Duração do consentimento (6 meses)

  // --- RESOLUÇÃO DE CAMINHOS ---
  // Detecta automaticamente a base do repositório para funcionar bem no GitHub Pages e subdiretórios.
  const __script = document.currentScript && document.currentScript.src ? new URL(document.currentScript.src) : new URL(location.href);
  const JS_BASE = new URL(".", __script); // Pasta /js/

  const COOKIE_PATH = (() => {
    try {
      const p = JS_BASE.pathname.replace(/js\/$/, ""); // Remove o "/js/" para chegar na raiz
      return p && p.startsWith("/") ? p : "/";
    } catch (_) {
      return "/";
    }
  })();

  /**
   * Atalho seletor por ID.
   */
  const $ = (id) => document.getElementById(id);

  // Elementos do DOM
  const banner = $("cookie");
  const modal = $("modal");
  const togAnalytics = $("tog-analytics");

  // Botões do Banner
  const btnAccept = $("cookie-aceitar");
  const btnReject = $("cookie-rejeitar");
  const btnPrefs = $("cookie-preferencias");

  // Botões do Modal
  const btnClose = $("modal-close");
  const btnSave = $("prefs-salvar");
  const btnAcceptAll = $("prefs-aceitar");

  let analyticsLoaded = false;

  // --- UTILITÁRIOS DE COOKIES (Vanilla JS) ---

  /**
   * Cria um cookie de primeira parte.
   * @param {string} name 
   * @param {string} value 
   * @param {number} days 
   */
  function setCookie(name, value, days) {
    const maxAge = days * 24 * 60 * 60;
    // Adiciona flag Secure se estiver em HTTPS e define SameSite=Lax.
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=${COOKIE_PATH}; SameSite=Lax${secure}`;
  }

  /**
   * Lê um cookie pelo nome.
   * @param {string} name 
   */
  function getCookie(name) {
    const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
  }

  // --- GERENCIAMENTO DE ESTADO (LOAD/SAVE) ---

  /**
   * Tenta carregar o consentimento do LocalStorage ou Cookies.
   */
  function loadConsent() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) { }

    try {
      const c = getCookie(COOKIE_NAME);
      if (c) return JSON.parse(c);
    } catch (_) { }

    return null;
  }

  /**
   * Salva as escolhas do usuário em ambos os storages.
   * @param {object} consent 
   */
  function saveConsent(consent) {
    const payload = JSON.stringify(consent);
    try {
      localStorage.setItem(LS_KEY, payload);
    } catch (_) { }
    // O cookie é essencial para ler o estado no servidor (se necessário) ou como backup.
    setCookie(COOKIE_NAME, payload, COOKIE_DAYS);
  }

  // --- CARREGAMENTO CONDICIONAL (Analytics) ---

  /**
   * Insere o script de analytics no head apenas se necessário.
   */
  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;

    const script = document.createElement("script");
    // Resolve o caminho do analytics_stub baseado na posição deste arquivo.
    script.src = new URL("./analytics_stub.js", JS_BASE).toString();
    script.defer = true;
    document.head.appendChild(script);
  }

  /**
   * Verifica o objeto de consentimento e decide se carrega o analytics.
   */
  function applyConsent(consent) {
    if (!consent) return;

    if (consent.analytics === true) {
      loadAnalytics();
    }
  }

  // --- INTERFACE DO USUÁRIO (Banner e Modal) ---

  function showBanner() {
    if (banner) banner.hidden = false;
  }

  function hideBanner() {
    if (banner) banner.hidden = true;
  }

  /**
   * Abre o modal de preferências detalhadas.
   */
  function openPrefs() {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "false");

    // Sincroniza os switches do modal com o que está salvo atualmente.
    const current = loadConsent();
    if (togAnalytics) {
      togAnalytics.checked = Boolean(current && current.analytics);
    }

    // Acessibilidade: Define foco inicial no botão de fechar ou no primeiro input.
    const focusTarget = btnClose || togAnalytics || modal;
    setTimeout(() => focusTarget && focusTarget.focus && focusTarget.focus(), 0);
  }

  /**
   * Fecha o modal sem salvar (cancelar).
   */
  function closePrefs() {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
  }

  /**
   * Processa a decisão final do usuário, salva e aplica.
   * @param {object} param0 - { analytics: boolean }
   */
  function setConsent({ analytics }) {
    const consent = {
      version: 1,
      ts: new Date().toISOString(), // Timestamp da decisão
      essential: true,             // Essencial é sempre ativo
      analytics: Boolean(analytics)
    };
    saveConsent(consent);
    applyConsent(consent);
    hideBanner();
    closePrefs();
  }

  // Expõe a função de abrir preferências globalmente para uso no main.js.
  window.KaConsent = { openPrefs };

  // --- EVENT LISTENERS ---

  // Botões Rápidos do Banner:
  if (btnAccept) btnAccept.addEventListener("click", () => setConsent({ analytics: true }));
  if (btnReject) btnReject.addEventListener("click", () => setConsent({ analytics: false }));
  if (btnPrefs) btnPrefs.addEventListener("click", openPrefs);

  // Controles do Modal:
  if (btnClose) btnClose.addEventListener("click", closePrefs);

  if (modal) {
    // Fecha clicando no backdrop (fundo cinza)
    modal.addEventListener("click", (e) => {
      const target = e.target;
      if (target && target.getAttribute && target.getAttribute("data-close") === "1") {
        closePrefs();
      }
    });
    // Fecha apertando ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") {
        closePrefs();
      }
    });
  }

  // Ações dentro do Modal de Preferências:
  if (btnSave) {
    btnSave.addEventListener("click", () => {
      setConsent({ analytics: togAnalytics && togAnalytics.checked });
    });
  }
  if (btnAcceptAll) {
    btnAcceptAll.addEventListener("click", () => {
      setConsent({ analytics: true });
    });
  }

  // --- INICIALIZAÇÃO ---
  // Tenta carregar a escolha anterior logo ao entrar na página.
  const currentConsent = loadConsent();
  if (!currentConsent) {
    showBanner(); // Visitante novo: mostra o banner
  } else {
    hideBanner();
    applyConsent(currentConsent); // Visitante recorrente: aplica escolhas
  }
})();

