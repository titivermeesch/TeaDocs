---
sidebar_position: 0
title: What is Tea
---

# What is Tea

Tea is a reusable Minecraft minigames engine for Spigot (1.20.5 or newer). It ships as a single plugin:

- **TeaCore** - the engine itself. Arena lifecycle, maps, teams, kits, abilities, cooldowns, effects, i18n, theme, chat routing, stats, and cross-server coordination (Redis + BungeeCord plugin-message channel). Every server that runs a game needs this.
- **Lobby features** (live inside TeaCore, gated by `lobby.enabled` in `plugins/TeaCore/config.yml`) provide `/play`, `/leave`, `/queue`, connection signs, and lobby spawn / gamemode auto-management. Set `lobby.enabled: true` on each hub server; leave it `false` (the default) on arena-only servers.

Games built on Tea are separate plugin jars that declare `depend: [TeaCore]` and register a `GameDefinition` on enable. Each game has its own plugin jar and its own docs section.

Tea targets Java 21 and the plain Spigot API. No NMS, no Paper-only APIs - so the same jars run on Spigot, Paper, Purpur, and any Paper-based fork.

## Where to next

- **[User guide](./user/getting-started.md)** - you operate a server and want to install Tea, configure network/DB/Redis, author maps, and pick a theme.
- **[Developer docs](./dev/architecture.md)** - you're writing a new game on top of TeaCore, or contributing to the engine itself.
