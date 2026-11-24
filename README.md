# Tea Docs

Public documentation site for the Tea minigames: the TeaCore engine and the games built on it, such as Ascend and Fireball. It uses [Docusaurus](https://docusaurus.io/).

The `deploy.yml` workflow publishes it to `https://titivermeesch.github.io/TeaDocs/` on each push to `main`.

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

It serves http://localhost:3000 and reloads as you edit pages.

## Build the static site

```
npm run build
```

The output goes to `build/`. Preview it locally with:

```
npm run serve
```

## Adding a new page

Add a `.md` file to the right subfolder under `docs/`. You can also reference it from `sidebars.ts`.

## Cross-repo content policy

This site describes public, installable behavior. Keep source code of closed-source Tea projects out of it, such as Ascend's internal class names, package paths or source files. If you write dev guidance based on Ascend internals, say "your game plugin" and give a pseudocode example.
