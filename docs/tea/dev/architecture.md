---
sidebar_position: 1
title: Architecture
---

# Architecture

Tea is one Spigot plugin built with Gradle (Kotlin DSL) and shaded into a fat jar. It compiles against the Spigot API from version 1.20.5 onward (the first Minecraft version to require Java 21):

- **TeaCore** - the engine. All shared infrastructure, plus the hub-side lobby UI (`/play`, `/leave`, connection signs, lobby spawn / gamemode management) gated by `lobby.enabled` in `plugins/TeaCore/config.yml`.

Games are separate plugin jars that declare `depend: [TeaCore]` and consume the TeaCore API.

Tea targets Java 21 and the plain Spigot API. No NMS, no Paper-only APIs - so the same jars run on Spigot, Paper, Purpur, and any Paper-based fork.

## TeaCore subsystems

Every subsystem is exposed via `TeaCoreAPI.get().<accessor>()`:

| Subsystem | Accessor | Purpose |
| --------- | -------- | ------- |
| `GameRegistry` | `games()` | Register `GameDefinition`s. |
| `ArenaManager` | `arenas()` | Allocate / release / query arena state; end matches; force-start; admin observe. |
| `MapService` | `maps()` | Register and look up maps; paste schematics into arena worlds. |
| `TeamManager` | `teams()` | Assign players to teams (or single-team FFA). |
| `KitRegistry` | `kits()` | Register abilities and kits; track player selections. |
| `CooldownService` | `cooldowns()` | Per-player per-id cooldowns; display on XP bar / action bar / boss bar. |
| `EffectService` | `effects()` | Particle + sound bundles. |
| `ChatRouter` | `chatRouter()` | Scope `AsyncPlayerChatEvent` by each sender's match / team / staff / global channel. |
| `MatchBroadcaster` | `matchBroadcaster()` | Scoped message sender (avoid `Bukkit.broadcast`). |
| `CoordinationBackend` | `coordination()` | Arena heartbeats + queue + matchmaker lock. |
| `ProxyTransport` | `proxyTransport()` | Cross-server `Connect` via `BungeeCord` plugin-message channel. |
| `PlayerProfileService` | `playerProfiles()` | Shared, cross-game player profile (uuid, first/last seen, locale). |
| `DatabaseService` | `database()` | Shared `javax.sql.DataSource` + plugin-owned migrations. |
| `MessageService` | `messageService()` | Localized, themed message dispatch. |
| `Theme` | `theme()` | Style slots for consistent text appearance. |
| `StatsRegistry` | `stats()` | Register per-game `StatsProvider`s that `/tea stats` aggregates. |

Utility helpers:

- `TeaCoreAPI#serverId()` - the server's id from `network.server-id` (or `$TEA_SERVER_ID`).
- `TeaCoreAPI#isStandalone()` - `true` when `network.mode: standalone`.
- `TeaCoreAPI#lobbyServerName()` - proxy-side name of the hub server.

## Package boundary

Classes live under `me.playbosswar.tea.core.api.*` (public surface that game plugins may depend on) and `me.playbosswar.tea.core.impl.*` (internals). An ArchUnit test inside the `core` Gradle module fails the build if any class outside `core` imports from `impl`.

Games must only import from `core.api.*`.

## Arena lifecycle

```
ALLOCATING -> WAITING -> COUNTDOWN -> STARTING -> LIVE -> ENDING -> RESETTING -> RELEASED
```

Each transition fires an `ArenaStateChangeEvent`. Games listen for these to initialize players (STARTING/LIVE), clean up (ENDING/RESETTING), etc.

- **ALLOCATING**: a void world is created for the arena, and if the chosen map has a schematic it's pasted at `(0, 64, 0)`. Map is picked at this moment (not at countdown) from either a fixed map id or the game's `MapSelectionPolicy` (`random` or `fixed`).
- **WAITING**: arena is accepting players. Transitions to COUNTDOWN when `arena.players().size() >= map.minPlayers()`.
- **COUNTDOWN**: ticks down from `lifecycle.countdownSeconds`. If the player count drops back below min-players, returns to WAITING. Below `titleCountdownThreshold` a big title overlay + pling kicks in; above it, `chatAnnounceAtSeconds` posts chat announcements.
- **STARTING**: brief freeze for teleport + kit application.
- **LIVE**: gameplay. If `LifecycleConfig.maxMatchSeconds` is non-zero and reached, a `MatchTimedOutEvent` fires and the owning game decides the winner.
- **ENDING**: winner announced, display period, then RESETTING. `MatchEndEvent` fires when the game calls `ArenaManager#endMatch`.
- **RESETTING**: world unloaded and deleted. If `EndMode.SHUTDOWN`, the JVM exits (k8s respawns a fresh pod).

Admins can force-collapse the current WAITING/COUNTDOWN timer with `/tea arena start <arenaId>`, which calls `ArenaManager#forceStart(ArenaId)`.

## Coordination

In `standalone` mode, `CoordinationBackend` is an `InMemoryBackend` - everything stays in one JVM. In `bungeecord`/`multi-server` modes, `RedisBackend` (Lettuce) replaces it. Same interface, same semantics. Arena heartbeats are refreshed every 2s with a 10s TTL; matchmakers run on leader-elected lobbies (SETNX on `tea:matchmaker:leader`, 10s TTL, refreshed every tick).

## Transport

Cross-server player moves happen via the legacy `BungeeCord` plugin-message channel. Both BungeeCord and Velocity honor this channel, so no proxy plugin is required.

## Persistence

`TeaCore` owns three tables: `tea_schema_versions` (the migration bookkeeping table), `tea_player_profile` (shared player profile), and `tea_lobby_signs` (connection-sign bindings, created by TeaCore's V003 migration). Every dependent plugin registers its own migrations at enable time - TeaCore's migration runner picks them up, applies anything new, and records the version in `tea_schema_versions(plugin_name, version)`. See [Persistence guide](./persistence-guide.md).

Both `sqlite-jdbc` and `mysql-connector-j` stay unrelocated inside the shadow jar so their native libraries and service metadata continue to load correctly.

## Theme and i18n

Theme values are MiniMessage styling tags. They're compiled into a `TagResolver` so translation keys can write `<primary>Hello</primary>` and have the close tag pop back to the parent scope. The MessageService renders these to Adventure `Component`s for normal chat, and can also emit legacy section-code strings for contexts that need them (scoreboards, sign lines, titles).

Each plugin bundles `lang/<locale>.yml` resources inside its jar. On enable, it writes any jar-bundled keys that are missing from the on-disk file back into the file - preserving admin customizations while still shipping new keys automatically.

## Games layered on top

A game plugin takes TeaCore's building blocks and layers its own mechanics on top. Typical ingredients for a new game:

- A `GameDefinition` registered in `onEnable`.
- A controller class listening for `ArenaStateChangeEvent`, `ArenaPlayerJoinEvent`, etc., plus any Bukkit events the game cares about (damage, interact, chat).
- Optional kits registered via `KitRegistry`; optional abilities via `KitRegistry.registerAbility` or via the game's own per-situation dispatcher.
- A migration set + `StatsProvider` for per-game persistence.
- A per-match scoreboard wired through `MessageService` / `MatchBroadcaster`.

Games are standalone plugin jars that depend on TeaCore. See [Extending with a new game](./extending-with-a-new-game.md) for a step-by-step walkthrough.
