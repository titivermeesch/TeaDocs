---
sidebar_position: 0
title: What is Tea
---

# What is Tea

Tea is a reusable Minecraft minigames engine for Spigot (1.20.5 or newer). It ships as two plugins:

- **TeaCore** - the engine itself. Arena lifecycle, maps, teams, kits, abilities, cooldowns, effects, i18n, theme, chat routing, stats, and cross-server coordination (Redis + BungeeCord plugin-message channel). Every server that runs a game needs this.
- **TeaLobby** - the hub-side plugin. Provides `/play`, `/leave`, `/queue`, connection signs, and lobby spawn management.

Games built on Tea are separate plugin jars that declare `depend: [TeaCore]` and register a `GameDefinition` on enable. [Ascend](../ascend/intro.md) is one such game; future games each get their own jar and their own docs section.

Tea targets Java 21 and the plain Spigot API. No NMS, no Paper-only APIs - so the same jars run on Spigot, Paper, Purpur, and any Paper-based fork.

## Where to next

- **[User guide](./user/getting-started.md)** - you operate a server and want to install Tea, configure network/DB/Redis, author maps, and pick a theme.
- **[Developer docs](./dev/architecture.md)** - you're writing a new game on top of TeaCore, or contributing to the engine itself.
