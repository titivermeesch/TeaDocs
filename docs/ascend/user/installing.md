---
sidebar_position: 1
title: Installing Ascend
---

# Installing Ascend

Ascend is a game plugin that runs on top of Tea. It needs TeaCore 0.2.0 or newer, and disables itself on an older TeaCore with a console message saying which version it needs. Before you start, [install TeaCore](../../tea/user/installing.md) and [configure network mode, the database and Redis](../../tea/user/configuring-network-mode.md).

## Runtime dependencies

Ascend declares two hard dependencies in `plugin.yml`:

- **LibsDisguises**: provides the mob morphs. Install `LibsDisguises.jar` into `plugins/` on every server that runs Ascend.
- **PacketEvents or ProtocolLib**: whichever your LibsDisguises build needs. Current builds use PacketEvents, older ones ProtocolLib.

## Which servers need Ascend

Install Ascend on every server that should host Ascend matches. In a multi-server setup that is usually the arena servers, not the lobby. The lobby finds Ascend through Tea and sends players to an arena server.

On a single server (`network.mode: standalone`), install Ascend next to TeaCore and set `lobby.enabled: true` in `plugins/TeaCore/config.yml`, so the same server runs the lobby and the arenas.

## Upgrading

Replace `Ascend.jar` and restart. On startup, Ascend adds new translation keys and config defaults from the jar to your files and keeps the values you changed.

## Next steps

1. [Author an Ascend map](./map-authoring.md) (the `evolution-viewer` + `evolution-mob` extra spawns are required on top of the core map fields).
2. [Tune `ascend/config.yml`](./configuration.md): stages, abilities, sidebar.
3. [Play](./gameplay.md): player commands, gameplay flow, kits.
