/* Ka Linktree — utilitarios basicos (ano + abrir preferencias)
   build: 2026-02-08
*/
(() => {
  const $ = (id) => document.getElementById(id);

  const ano = $("ano");
  if (ano) ano.textContent = String(new Date().getFullYear());

  const dt = $("data-atualizacao");
  if (dt) dt.textContent = "2026-02-08";

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
