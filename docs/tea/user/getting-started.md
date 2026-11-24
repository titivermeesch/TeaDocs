---
sidebar_position: 1
title: Getting started
---

# Getting started

Tea is a single-plugin engine for running Minecraft minigames on Paper (or Spigot), from 1.8.8 to the latest release:

- **TeaCore**: the engine. Every server that runs a game needs it.
- **Lobby features** (connection signs, `/play` and the game selector, `/profile`, the lobby hotbar, `/leave`, lobby spawn / gamemode management) ship inside TeaCore. Turn them on with `lobby.enabled: true` in `plugins/TeaCore/config.yml`. Set this on every hub server; leave it off (the default) on arena-only servers.

Games are separate plugin jars on top of Tea. This section covers installing and running Tea. For a specific game, see that game's docs section.

## Minimum requirements

- Minecraft 1.8.8 or newer: Paper (or Spigot) or a fork such as Purpur. See [Server versions](./server-versions.md).
- Java 17 or newer
- On 1.13 and newer: WorldEdit or FastAsyncWorldEdit to save and paste maps (soft dependency, not bundled). 1.8 to 1.12 servers don't need it.
- Redis (optional, needed for cross-server matchmaking)
- MySQL (optional, SQLite is the default)

Games can have extra hard dependencies. Check the game's own "Installing" page before deploying.

## Pick your deployment shape

| Shape | When to use | Redis needed? |
| ----- | ----------- | ------------- |
| **Standalone**: one server, multi-arena | Dev, small networks | No |
| **Bungeecord / k8s**: one arena per server, proxy in front | Scalable production, k8s pods | Yes |
| **Multi-server**: multiple servers, each running several arenas | Midsize networks | Yes |

You pick one with `network.mode` in `plugins/TeaCore/config.yml`. Games behave the same in each shape; only routing changes.

## Next steps

1. [Install TeaCore](./installing.md)
2. [Configure network mode, DB, and Redis](./configuring-network-mode.md)
3. [Theme and translations](./theme-and-i18n.md)
4. [Author your first map](./adding-a-map.md)
5. On hub servers, set up the [lobby](./lobby.md): hotbar, game selector and game names.
6. Install and run a Tea-based game on top of the engine.
7. Optional: customise the [sidebars](./sidebars.md), [menus](./menus.md) and [placeholders](./placeholders.md), or turn features off with [feature switches](./features.md).
