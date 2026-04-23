---
sidebar_position: 1
title: Getting started
---

# Getting started

Tea is a two-plugin system for running Minecraft minigames on Spigot (1.20.5+):

- **TeaCore** - the engine. Every server that runs a game needs this.
- **TeaLobby** - the hub-side plugin. Provides `/play`, `/leave`, `/queue`, connection signs, and lobby spawn management.

Games are separate plugin jars on top of Tea. This section is about installing and operating Tea itself - for any specific game, see its own docs section (for example [Ascend](../../ascend/intro.md)).

## Minimum requirements

- Minecraft server 1.20.5 or newer (Spigot, Paper, or a Paper-based fork such as Purpur - Tea only uses Spigot API). Individual game plugins may require a higher minimum — see each game's own docs.
- Java 21
- WorldEdit or FastAsyncWorldEdit installed if you want to paste map schematics (soft dependency - everything else works without it)
- Redis (optional, only required for cross-server matchmaking)
- MySQL (optional, SQLite is the default)

Individual games may have additional hard dependencies. Check the game's own "Installing" page before deploying.

## Pick your deployment shape

| Shape | When to use | Redis needed? |
| ----- | ----------- | ------------- |
| **Standalone** - one server, multi-arena | Dev, small networks | No |
| **Bungeecord / k8s** - one arena per server, proxy in front | Scalable production, k8s pods | Yes |
| **Multi-server** - multiple servers, each running several arenas | Midsize networks | Yes |

Pick one when setting `network.mode` in `plugins/TeaCore/config.yml`. All game behavior is identical across shapes; only routing changes.

## Next steps

1. [Install TeaCore and TeaLobby](./installing.md)
2. [Configure network mode, DB, and Redis](./configuring-network-mode.md)
3. [Theme and translations](./theme-and-i18n.md)
4. [Author your first map](./adding-a-map.md)
5. Install and run a game on top of Tea - for example [Ascend](../../ascend/user/installing.md).
