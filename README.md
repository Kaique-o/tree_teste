# ka linktree (static)

pagina simples estilo linktree, seguindo a identidade dark/glass do teu layout.

## 1) trocar os links
abre `index.html` e troca os `href="https://example.com/..."` pelos teus links reais:

- sobre mim (home do teu site)
- blog
- youtube
- github
- instagram
- bluesky

tambem atualiza:
- `<link rel="canonical" ...>`
- `og:url` e `sitemap.xml` (tudo que esta como `https://example.com`)

## 2) cookies / lgpd
- banner de consentimento + modal de preferencias
- por padrao `analytics` fica **desligado**
- se o usuario aceitar, carrega `/js/analytics_stub.js`

pra plugar uma ferramenta real:
- troca o conteudo de `js/analytics_stub.js` pelo snippet do teu analytics
- **nao** carrega nada antes de consentimento

## 3) preview local
na raiz do projeto:

```bash
python -m http.server 8080
```

abre no navegador: `http://localhost:8080`

## 4) deploy
isso aqui eh 100% estatico. sobe em qualquer host:
- vercel static
- netlify
- cloudflare pages
- github pages

dica: se o host permitir, seta headers de seguranca (CSP, HSTS, etc.) no servidor.
