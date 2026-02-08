/* Ka Linktree — utilitarios basicos (ano + tema + abrir preferencias)
   build: 2026-02-08
*/
(() => {
  const $ = (id) => document.getElementById(id);

  // ano automatico
  const ano = $("ano");
  if (ano) ano.textContent = String(new Date().getFullYear());

  // data de atualizacao (paginas simples)
  const dt = $("data-atualizacao");
  if (dt) dt.textContent = "2026-02-08";

  // tema (claro/escuro)
  const root = document.documentElement;

  const KEY = "ka_theme";
  const stored = (() => {
    try { return localStorage.getItem(KEY); } catch { return null; }
  })();

  const prefersLight = (() => {
    try {
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    } catch {
      return false;
    }
  })();

  function setTheme(theme, persist = true){
    const t = (theme === "light") ? "light" : "dark";
    root.dataset.theme = t;

    // atualiza label do botao (mostra a acao)
    const label = $("theme-label");
    if (label) label.textContent = (t === "light") ? "modo escuro" : "modo claro";

    // theme-color (mobile)
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", (t === "light") ? "#f6f7ff" : "#070a12");

    if (persist){
      try { localStorage.setItem(KEY, t); } catch {}
    }
  }

  // inicializa
  setTheme(stored || (prefersLight ? "light" : "dark"), false);

  const toggle = $("theme-toggle");
  if (toggle){
    toggle.addEventListener("click", () => {
      const current = root.dataset.theme || "dark";
      setTheme(current === "light" ? "dark" : "light", true);
    });
  }

  // abre modal de preferencias de cookies
  function hookPrefs(id){
    const el = $(id);
    if (!el) return;
    el.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.KaConsent && typeof window.KaConsent.openPrefs === "function") {
        window.KaConsent.openPrefs();
      }
    });
  }

  hookPrefs("abrir-preferencias");
  hookPrefs("abrir-preferencias-inline");
})();
