/**
 * Kaique Oli Links Tree — Utilitários Básicos
 * -----------------------------------------
 * Responsabilidades:
 * - Atualização automática do ano no rodapé.
 * - Gerenciamento de tema (Claro/Escuro) com persistência no LocalStorage.
 * - Hooks para abertura de preferência de cookies.
 */

(() => {
  /**
   * Atalho para selecionar elementos pelo ID.
   * @param {string} id 
   * @returns {HTMLElement|null}
   */
  const $ = (id) => document.getElementById(id);

  // --- ANO AUTOMÁTICO ---
  // Atualiza o elemento com ID "ano" para o ano atual.
  const ano = $("ano");
  if (ano) {
    ano.textContent = String(new Date().getFullYear());
  }

  // --- DATA DE ATUALIZAÇÃO ---
  // Utilizado em páginas internas/simples para indicar a última revisão.
  const dt = $("data-atualizacao");
  if (dt) {
    dt.textContent = "2026-02-08";
  }

  // --- GERENCIAMENTO DE TEMA (CLARO/ESCURO) ---
  const root = document.documentElement;
  const THEME_KEY = "ka_theme";

  /**
   * Recupera o tema salvo ou retorna nulo.
   */
  const storedTheme = (() => {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (err) {
      console.warn("LocalStorage indisponível:", err);
      return null;
    }
  })();

  /**
   * Verifica se o usuário prefere o modo claro nas configurações do sistema.
   */
  const prefersLight = (() => {
    try {
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    } catch {
      return false;
    }
  })();

  /**
   * Aplica o tema visual e opcionalmente o persiste.
   * @param {string} theme - 'light' ou 'dark'
   * @param {boolean} persist - Se deve salvar a escolha no LocalStorage.
   */
  function setTheme(theme, persist = true) {
    const t = (theme === "light") ? "light" : "dark";

    // Aplica o atributo data-theme ao <html> (CSS consome este atributo)
    root.dataset.theme = t;

    // 2. Metatags e Identidade Visual (barra de status mobile)
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", (t === "light") ? "#fdfaff" : "#070808");
    }

    // Persistência
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, t);
      } catch (err) {
        console.error("Erro ao salvar tema:", err);
      }
    }
  }

  // --- INICIALIZAÇÃO DO TEMA ---
  // Prioridade: Salvo em disco > Preferência do Sistema > Padrão (Escuro)
  const initialTheme = storedTheme || (prefersLight ? "light" : "dark");
  setTheme(initialTheme, false);

  // --- ANIMAÇÃO DO LOGO (Uma vez por sessão) ---
  const LOGO_ANIM_KEY = "ka_logo_anim";
  const logoText = $("logo-text");

  if (logoText) {
    const fullText = logoText.textContent;
    const hasAnimated = sessionStorage.getItem(LOGO_ANIM_KEY);

    if (!hasAnimated) {
      // Limpa para começar a digitar letra por letra
      logoText.textContent = "";
      logoText.classList.add("animate-typing"); // Apenas para o cursor

      let charIdx = 0;
      const typeChar = () => {
        if (charIdx < fullText.length) {
          logoText.textContent += fullText.charAt(charIdx);
          charIdx++;
          // Velocidade variável para parecer mais natural
          const delay = charIdx === 6 ? 400 : 100 + Math.random() * 50;
          setTimeout(typeChar, delay);
        } else {
          // Finalizou a digitação
          sessionStorage.setItem(LOGO_ANIM_KEY, "true");
          setTimeout(() => {
            logoText.classList.add("typing-done");
          }, 1500);
        }
      };

      // Pequeno delay antes de começar
      setTimeout(typeChar, 500);
    }
  }

  // Listener para o botão de toggle
  const toggleBtn = $("theme-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = root.dataset.theme || "dark";
      setTheme(current === "light" ? "dark" : "light", true);
    });
  }

  // --- COMPARTILHAMENTO ---
  const shareBtn = $("share-toggle");
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const shareData = {
        title: "Kaique Oli — Links Oficiais",
        text: "Confira os links oficiais do Kaique Oli: site, blog, projetos e redes sociais.",
        url: window.location.href,
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(window.location.href);
          const originalTitle = shareBtn.getAttribute("title") || "Compartilhar";
          shareBtn.setAttribute("title", "Link copiado!");
          setTimeout(() => shareBtn.setAttribute("title", originalTitle), 2000);
          alert("Link copiado para a área de transferência!");
        }
      } catch (err) {
        if (err.name !== "AbortError") console.error("Erro ao compartilhar:", err);
      }
    });
  }

  /**
   * Hook para ligar botões de "preferências" ao sistema de consentimento.
   * @param {string} id - ID do botão/link.
   */
  function hookPrefs(id) {
    const el = $(id);
    if (!el) return;
    el.addEventListener("click", (e) => {
      e.preventDefault();
      // Verifica se o objeto global do consentimento já foi carregado
      if (window.KaConsent && typeof window.KaConsent.openPrefs === "function") {
        window.KaConsent.openPrefs();
      }
    });
  }

  // Ativa os ganchos para os IDs conhecidos
  hookPrefs("abrir-preferencias");
  hookPrefs("abrir-preferencias-inline");
})();

