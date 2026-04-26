# Tea Docs

Public documentation site for the Tea minigames ecosystem (the TeaCore engine and the Ascend minigame). Built with [Docusaurus](https://docusaurus.io/).

Deployed at `https://titivermeesch.github.io/TeaDocs/` by the `deploy.yml` workflow on every push to `main`.

## Requirements

- Node.js 20+
- npm

## Local development

Install dependencies once:

```
npm ci
```

Start the dev server (hot reload):

```
npm start
```

Opens http://localhost:3000 with live-reload as you edit pages.

## Build the static site

```
npm run build
```

Output lives in `build/`. Preview locally with:

```
npm run serve
```

## Adding a new page

Drop a `.md` into the right subfolder under `docs/` and (optionally) reference it from `sidebars.ts`.

## Cross-repo content policy

This docs site describes public, installable behavior. It does **not** reference the source code of closed-source Tea projects (for example, Ascend's internal class names, package paths, or source files). If you're writing dev guidance that originally cited Ascend internals, phrase it generically as "your game plugin" and offer a pseudocode example instead.
