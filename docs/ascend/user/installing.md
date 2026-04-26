---
sidebar_position: 1
title: Installing Ascend
---

# Installing Ascend

Ascend is a game plugin that runs on top of Tea. Before you start here, make sure you already have [TeaCore installed](../../tea/user/installing.md) and [network mode / DB / Redis configured](../../tea/user/configuring-network-mode.md).

## Runtime dependencies

Ascend declares two hard dependencies in `plugin.yml`:

- **LibsDisguises** - used for the mob morphs. Install `LibsDisguises.jar` into `plugins/` on every server that runs Ascend.
- **ProtocolLib** - hard dependency of LibsDisguises. Install `ProtocolLib.jar` alongside it.

**PacketEvents** ships bundled inside LibsDisguises (Ascend's evolution ceremony uses it to send per-viewer mob packets), so you don't need to install it separately.

If either LibsDisguises or ProtocolLib is missing when Ascend tries to enable, the plugin will disable itself with "Unknown dependency LibsDisguises" (or similar) in the server log.

## Files extracted on first boot

After dropping `Ascend.jar` into `plugins/` and starting the server once, Ascend writes:

- `plugins/Ascend/config.yml` - ladder definition, lifecycle timers, per-ability tuning, scoreboard templates
- `plugins/Ascend/lang/en_US.yml` - translation bundle

Stop the server, edit these as needed (see [Configuration](./configuration.md)), then start again.

## Which servers need Ascend

Install Ascend on every server that should be able to host Ascend matches. In a bungeecord/multi-server deployment, that's usually the arena servers but not the lobby hub - the lobby discovers Ascend via the Redis coordination backend and routes players to it over the BungeeCord plugin-message channel.

In a single-server (`network.mode: standalone`) deployment, install Ascend on that one server alongside TeaCore (with `lobby.enabled: true` in `plugins/TeaCore/config.yml` so the same JVM hosts both the lobby UI and the arenas).

## Upgrading

Replace `Ascend.jar` and restart. Ascend merges newly-added translation keys and config defaults from the jar into your on-disk files, so your customizations survive the upgrade.

If you hit issues after an upgrade, delete `plugins/Ascend/lang/*.yml` and restart - they'll be re-extracted with the current key set.

## Next steps

1. [Author an Ascend map](./map-authoring.md) (the `evolution-viewer` + `evolution-mob` extra spawns are required on top of the core map fields).
2. [Tune `ascend/config.yml`](./configuration.md) - stages, abilities, sidebar.
3. [Play](./gameplay.md) - player commands, gameplay flow, kits.
