# Portfólio — Francisco Valeriano

Site pessoal feito com HTML, CSS e JavaScript puro, sem frameworks e sem etapa de build.

- Bilíngue (português e inglês)
- Tema claro e escuro

## Estrutura

```
index.html                  estrutura da página
css/style.css               cores, layout e animações
js/translations.js          todos os textos (PT e EN)
js/main.js                  idioma, tema, menu, animações
assets/favicon.svg          ícone da aba
```

## Como editar

- **Textos:** altere em `js/translations.js`, sempre nos dois idiomas.
- **Cores:** altere as variáveis no início de `css/style.css` (`:root` para o tema claro e `[data-theme="dark"]` para o escuro).
- **Liberar os projetos:** na seção `#projetos` do `index.html`, adicione o link no card:
  `<a class="card projects-card reveal" href="https://SEU-LINK" target="_blank" rel="noopener">`.
  Sem `href` o card mostra "Em breve" e não é clicável; com `href` ele mostra "Ver projetos" e abre o link em outra aba.

## Rodar localmente

Abra o `index.html` no navegador. Se preferir um servidor local:

```
npx serve .
```

## Publicação

O site é hospedado na Vercel, conectada a este repositório. Cada novo commit na branch `main` publica o site automaticamente.
