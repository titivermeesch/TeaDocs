---
sidebar_position: 1
title: Installing Fireball
---

# Installing Fireball

Fireball runs on top of Tea. Before you start, [install TeaCore](../../tea/user/installing.md). For a multi-server setup, also [configure network mode, the database and Redis](../../tea/user/configuring-network-mode.md).

## Requirements

- Paper (or Spigot) **1.8.8 to 1.12.2 and 1.16.5 to the latest release**. See [Server versions](../../tea/user/server-versions.md).
- Java **21**
- **TeaCore 0.2.0 or newer** (hard dependency). Fireball will not load without it, and disables itself on an older TeaCore with a console message saying which version it needs.
- **FastAsyncWorldEdit** or **WorldEdit** on 1.16.5 and newer. This is a soft dependency and is not bundled. TeaCore uses it to save maps and to paste them into arenas. Without it you cannot author maps and TeaCore cannot build arenas. Servers on 1.8 to 1.12 don't need it.
- **A Vault economy plugin** (EssentialsX Economy, CMI, ...): needed only if you keep kits with a `cost` above 0. Vault itself is already required by TeaCore. See [Economy](../../tea/user/economy.md).
- **PlaceholderAPI**: optional, for the `%tea_fireball_*%` placeholders.

## Which servers need Fireball

Install Fireball on every server that should host Fireball matches. In a multi-server setup that is usually the arena servers, not the lobby. The lobby finds Fireball through Tea and sends players to an arena server.

On a single server (`network.mode: standalone`), install Fireball next to TeaCore and set `lobby.enabled: true` in `plugins/TeaCore/config.yml`, so the same server runs the lobby and the arenas.

## First boot

1. Drop `Fireball.jar` into `plugins/` next to TeaCore.
2. Start the server. Fireball creates:
   - `plugins/Fireball/config.yml`: game settings
   - `plugins/Fireball/lang/en_US.yml`: player-facing text
   - `plugins/Fireball/menus/shop.yml`: the shop menu layout
3. Check the log for `Fireball enabled (v...) with 2 teams`.
4. On first start, Fireball creates its stats table (`fireball_stats`) in the TeaCore database. You do not need to set it up.

## Add a map

Fireball has no playable map until you add one. Either:

- [Author a map in-game](./map-authoring.md), or
- Copy a ready-made map: put the `.schem` file (`.schematic` on 1.8 to 1.12) in `plugins/TeaCore/maps/schems/` and the map YAML in `plugins/TeaCore/maps/fireball.yml`, then run `/tea map reload`. Fireball ships the Coliseum map in both formats.

Then join with `/play fireball`.

## Upgrading

Replace `Fireball.jar` and restart. On startup, Fireball adds new config keys and translation keys to your files and keeps the values you changed.

## Next steps

1. [Author a map](./map-authoring.md). Every team needs its own spawn.
2. [Tune the config](./configuration.md).
3. [Learn the gameplay](./gameplay.md).
