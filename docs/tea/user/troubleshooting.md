---
sidebar_position: 6
title: Troubleshooting
---

# Troubleshooting

This page covers issues with the Tea engine itself. Issues specific to a particular game (for example morph, ceremony, or stage problems) belong in that game's troubleshooting page - for instance, [Ascend troubleshooting](../../ascend/user/troubleshooting.md).

## TeaCore fails to start with UnsatisfiedLinkError on SQLite

You're on a platform SQLite-JDBC doesn't ship a native library for. Switch to MySQL in `config.yml` or use a supported OS/architecture (most Linux + glibc, Windows, macOS x64/arm64 variants work out of the box). The SQLite native library is intentionally left unrelocated inside the shadow jar, so it loads the correct per-arch binary.

## TeaLobby fails to enable with NoClassDefFoundError: TeaCoreAPI

TeaCore didn't successfully enable - scroll up in the log for the TeaCore error. When TeaCore disables itself, its classloader goes away and dependent plugins lose access to its API classes.

## `/play <game>` fails with "Unknown game name"

The named game isn't registered on this server. In a split lobby/arena deployment, the lobby sees games via the coordination backend - check that `network.mode` is set to `bungeecord` or `multi-server` and that the arena server is heartbeating (look for `Coordination: redis` and arena entries in `SMEMBERS tea:arenas:index`). In a single-server setup, install the game's jar (and any of its own dependencies) on the same server.

## Arena allocates but players fall into the void

The schematic isn't being pasted. Check:

1. WorldEdit or FastAsyncWorldEdit is installed and enabled.
2. The map has a schematic - `/tea map info <game> <map>` should show a schematic path.
3. The schematic file actually exists at `plugins/TeaCore/maps/schems/<mapId>.schem`.

## Players stand around forever and the match never starts

The map might not have enough participant spawns for the player count, or the lifecycle timers haven't elapsed. As a quick fix, run `/tea arena start <arenaId>` to collapse the current phase timer. `/tea arena list` shows each arena's current state and player count.

## Chat leaks across arenas

Your `ChatRouter` isn't running or a third-party plugin is calling `Bukkit.broadcast` directly. Make sure no plugin replaces or cancels `AsyncPlayerChatEvent` before TeaCore's handler. Other plugins that broadcast match-state messages should use `MatchBroadcaster` from TeaCore rather than `Bukkit.broadcast`.

## "Missing translation: core.xxx" (or `lobby.xxx`, or a game's prefix) in chat

New translation keys were added in a plugin update but your on-disk lang file was missing them. This should resolve automatically since each plugin merges jar defaults with your disk overrides on enable; if it doesn't, delete `plugins/<PluginName>/lang/*.yml` and restart - they'll be re-extracted from the jar with all current keys.

## Map authoring: "Schematic paste failed"

The edit world exists but the saved schematic can't be pasted. Causes:

- The schematic file was manually deleted from `plugins/TeaCore/maps/schems/`.
- The schematic was saved with a different Minecraft version that introduced incompatible block IDs. Re-run `/tea map create` and build fresh, or replace the `.schem` with one compatible with the current server version.
- WorldEdit isn't loaded.

## Redis connection refused

Check `redis:` in `config.yml` matches your actual Redis host/port, and that Redis allows connections from the Tea servers (including password if `requirepass` is set). In `bungeecord`/`multi-server` mode with Redis unavailable, TeaCore falls back to in-memory coordination and logs a SEVERE warning - your cross-server features will silently degrade.
