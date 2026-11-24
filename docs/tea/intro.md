---
sidebar_position: 0
title: What is Tea
---

# What is Tea

Tea is a reusable Minecraft minigames engine for Paper (or Spigot), from 1.8.8 to the latest release. It ships as a single plugin:

* **TeaCore**: the engine itself, with arena lifecycle, maps, teams, kits, abilities, cooldowns, effects, i18n, theme, chat routing, stats, and cross-server coordination (Redis + BungeeCord/Velocity).
* **Lobby features** (live inside TeaCore, gated by `lobby.enabled` in `plugins/TeaCore/config.yml`) provide `/play`, `/leave`, connection signs, and lobby spawn / gamemode auto-management. Set `lobby.enabled: true` on each hub server; leave it `false` (the default) on arena-only servers.


TeaCore also gives every game a shared set of player-facing features. The server owner configures all of them:

* [**Sidebars**](./user/sidebars.md): a lobby sidebar and per-game sidebars.
* [**Menus**](./user/menus.md): YAML inventory menus (kit picker, stats viewer).
* [**PlaceholderAPI placeholders**](./user/placeholders.md): stats, arena state, per-game counters and leaderboards.
* [**Kill credit and assists**](./user/kill-credit.md): one set of kill, death, assist, win and loss rules for every game.
* [**Feature switches**](./user/features.md): turn any of the above off, server-wide or per game.
* ...





Tea runs on Java 17 or newer and uses the plain Spigot API, with no Paper-only APIs, so the same jars run on Spigot, Paper, Purpur and Paper-based forks, from 1.8.8 to the latest release. On 1.8 to 1.12 TeaCore reaches into a few server internals (item and entity NBT, explosions). See [Server versions](./user/server-versions.md).

## Where to next

- **[User guide](./user/getting-started.md)**: you operate a server and want to install Tea, configure network/DB/Redis, author maps, and pick a theme.
- **[Developer docs](./dev/architecture.md)**: you're writing a new game on top of TeaCore, or contributing to the engine.
