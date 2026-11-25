---
sidebar_position: 14
title: Troubleshooting
---

# Troubleshooting

This page covers problems with the Tea engine. For problems with one game, see that game's troubleshooting page.

## "TeaCore could not download the libraries it needs"

TeaCore downloads some libraries from Maven Central (`repo1.maven.org`) on first start and after upgrades (see [Libraries](./installing.md#libraries)). This error means the server couldn't reach it: no internet, a firewall, or a proxy that blocks it.

The log lists each missing file with its URL and the path it belongs at under `plugins/TeaCore/libs/`. Either allow the server to reach Maven Central and restart, or download those files yourself, put each one at the path shown, and restart. Game plugins that depend on TeaCore stay disabled until TeaCore starts.

If the log says a checksum doesn't match, the file in `plugins/TeaCore/libs/` is damaged or a different version. TeaCore deletes it and downloads it again.

## TeaCore fails to start with UnsatisfiedLinkError on SQLite

SQLite-JDBC has no native library for your platform. Switch to MySQL in `config.yml` or use a supported OS/architecture (most Linux + glibc, Windows, and macOS x64/arm64 variants work).


## Lobby commands (`/play`, `/tea lobby`) report "Unknown command" or do nothing

`lobby.enabled` in `plugins/TeaCore/config.yml` controls the lobby features. On a server where it's `false` (the default), the lobby UI does nothing: signs aren't bound, `/play` queries the network instead of acting locally, and lobby-spawn enforcement is off. Set `lobby.enabled: true` on the hub server and restart (or `/tea lobby reload`) to turn the lobby UI on.

If TeaCore failed to enable, the server unloads it and all its commands disappear, lobby and arena alike. Scroll up in the log for the TeaCore error and fix that first.

## `/play <game>` fails with "Unknown game name"

The named game isn't registered on this server. In a split lobby/arena deployment, the lobby sees games through the coordination layer. Check that `network.mode` is set to `bungeecord` or `multi-server` and that the arena server is heartbeating (look for `Coordination: redis` and arena entries in `SMEMBERS tea:arenas:index`). In a single-server setup, install the game's jar (and any of its own dependencies) on the same server.

## Arena allocates but players fall into the void

TeaCore isn't pasting the schematic. Check:

1. On 1.16.5 and newer: WorldEdit or FastAsyncWorldEdit is installed and enabled (1.8 to 1.12 doesn't need it).
2. The map has a schematic: `/tea map info <game> <map>` should show a schematic path.
3. The schematic file exists at `plugins/TeaCore/maps/schems/<mapId>.schem` (or `.schematic`).

## Players wait and the match never starts

The map might not have enough participant spawns for the player count, or the lifecycle timers haven't run out. To skip ahead, run `/tea arena start <arenaId>` to collapse the current phase timer. `/tea arena list` shows each arena's current state and player count.

## Chat leaks across arenas

Your `ChatRouter` isn't running, or a third-party plugin calls `Bukkit.broadcast` itself. Make sure no plugin replaces or cancels `AsyncPlayerChatEvent` before TeaCore's handler. Other plugins that broadcast match-state messages should use `MatchBroadcaster` from TeaCore rather than `Bukkit.broadcast`.

## "Missing translation: core.xxx" (or `lobby.xxx`, or a game's prefix) in chat

A plugin update added translation keys that your lang file on disk lacks. Each plugin merges the jar defaults into your file on enable, so a restart should fix it. If it doesn't, delete `plugins/<PluginName>/lang/*.yml` and restart. The plugin extracts fresh files from the jar with all current keys.

## Map authoring: "Schematic paste failed"

The edit world exists, but TeaCore can't paste the saved schematic. Causes:

- Someone deleted the schematic file from `plugins/TeaCore/maps/schems/`.
- Someone saved the schematic on a different Minecraft version with incompatible block IDs. A `.schem` from a modern server can't be pasted on 1.8 to 1.12; a `.schematic` works everywhere. Re-run `/tea map create` and build fresh, or replace the file with one made for this version.
- On 1.16.5 and newer: WorldEdit isn't loaded.

## Redis connection refused

Check that `redis:` in `config.yml` matches your Redis host/port, and that Redis allows connections from the Tea servers (including password if `requirepass` is set). In `bungeecord`/`multi-server` mode with Redis unavailable, TeaCore falls back to in-memory coordination and logs a SEVERE warning. Cross-server features then degrade with no further warning.
