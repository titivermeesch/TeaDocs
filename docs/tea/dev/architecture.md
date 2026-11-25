---
sidebar_position: 1
title: Architecture
---

# Architecture

Tea is one Paper (or Spigot) plugin built with Gradle (Kotlin DSL). Small libraries are shaded into the jar; the large ones are downloaded at startup (see [Libraries](#libraries)). It runs from 1.8.8 to 1.12.2 and 1.16.5 to the latest release: shared code compiles against both the 1.8.8 and the modern API, and version-specific code lives in two platforms picked at startup (see [Supporting every version](./platform.md)):

- **TeaCore**: the engine. It holds the shared infrastructure, plus the hub-side lobby UI (`/play`, `/leave`, connection signs, lobby spawn / gamemode management) gated by `lobby.enabled` in `plugins/TeaCore/config.yml`.

Games are separate plugin jars that declare `depend: [TeaCore]` and consume the TeaCore API.

Tea compiles for Java 17 and uses the plain Spigot API, with no Paper-only APIs. The legacy platform (1.8 to 1.12) uses a little reflection into server internals for item NBT, entity NBT and sourced explosions; nothing else does.

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

- `TeaCoreAPI#serverId()`: the server's id from `network.server-id` (or `$TEA_SERVER_ID`).
- `TeaCoreAPI#isStandalone()`: `true` when `network.mode: standalone`.
- `TeaCoreAPI#lobbyServerName()`: proxy-side name of the hub server.

## Package boundary

Classes live under `me.playbosswar.tea.core.api.*` (public surface that game plugins may depend on) and `me.playbosswar.tea.core.impl.*` (internals). An ArchUnit test inside the `core` Gradle module fails the build if any class outside `core` imports from `impl`.

Games import only from `core.api.*`.

## Arena lifecycle

```
ALLOCATING -> WAITING -> COUNTDOWN -> STARTING -> LIVE -> ENDING -> RESETTING -> RELEASED
```

Each transition fires an `ArenaStateChangeEvent`. Games listen for these to initialize players (STARTING/LIVE), clean up (ENDING/RESETTING), etc.

- **ALLOCATING**: TeaCore creates a void world for the arena and, if the chosen map has a schematic, pastes it at `(0, 64, 0)`. TeaCore picks the map at this point (before the countdown) from either a fixed map id or the game's `MapSelectionPolicy` (`random` or `fixed`).
- **WAITING**: the arena accepts players. Transitions to COUNTDOWN when `arena.players().size() >= map.minPlayers()`.
- **COUNTDOWN**: ticks down from `lifecycle.countdownSeconds`. If the player count drops back below min-players, returns to WAITING. Below `titleCountdownThreshold` players see a big title overlay and hear a pling; above it, `chatAnnounceAtSeconds` posts chat announcements.
- **STARTING**: brief freeze for teleport + kit application.
- **LIVE**: gameplay. If `LifecycleConfig.maxMatchSeconds` is non-zero and reached, a `MatchTimedOutEvent` fires and the owning game decides the winner.
- **ENDING**: TeaCore announces the winner, holds a display period, then moves to RESETTING. `MatchEndEvent` fires when the game calls `ArenaManager#endMatch`.
- **RESETTING**: TeaCore unloads and deletes the world. If `EndMode.SHUTDOWN`, the JVM exits (k8s respawns a fresh pod).

Admins can force-collapse the current WAITING/COUNTDOWN timer with `/tea arena start <arenaId>`, which calls `ArenaManager#forceStart(ArenaId)`.

## Coordination

In `standalone` mode, `CoordinationBackend` is an `InMemoryBackend`, and all state stays in one JVM. In `bungeecord`/`multi-server` modes, `RedisBackend` (Lettuce) replaces it with the same interface and semantics. Arena servers refresh heartbeats every 2s with a 10s TTL; matchmakers run on leader-elected lobbies (SETNX on `tea:matchmaker:leader`, 10s TTL, refreshed every tick).

## Transport

TeaCore moves players between servers over the legacy `BungeeCord` plugin-message channel. BungeeCord and Velocity both honor this channel, so you don't need a proxy plugin.

## Persistence

`TeaCore` owns three tables: `tea_schema_versions` (the migration bookkeeping table), `tea_player_profile` (shared player profile), and `tea_lobby_signs` (connection-sign bindings, created by TeaCore's V003 migration). Every dependent plugin registers its own migrations at enable time. TeaCore's migration runner picks them up, applies anything new, and records the version in `tea_schema_versions(plugin_name, version)`. See [Persistence guide](./persistence-guide.md).

The server provides `sqlite-jdbc`. `mysql-connector-j` is downloaded only when `database.type` is `mysql` and stays unrelocated, so its service metadata still loads.

## Libraries

Adventure, XSeries, Caffeine, HikariCP, FastStats and Libby are shaded and relocated under `me.playbosswar.tea.core.libs`. The larger libraries are not in the jar: `LibraryLoader` uses [Libby](https://github.com/AlessioDP/libby) at the start of `onEnable` to download them from Maven Central into `plugins/TeaCore/libs/`, check their SHA-256, relocate them to the same `me.playbosswar.tea.core.libs` packages, and add them to the plugin class loader. Each group loads only when its feature is on: Jackson always, Lettuce and Netty when `network.mode` is not `standalone`, Javalin, Jetty and Kotlin when the dashboard is enabled, MySQL Connector/J for `database.type: mysql`.

The build writes the list (coordinates, checksums and relocations) to `teacore-libraries.txt` from the `coreLibs`, `redisLibs`, `dashboardLibs` and `mysqlLibs` configurations, so bumping a version in `libs.versions.toml` updates it. Code that uses a downloaded library must not load while its feature is off: for example `DashboardServer` is only created when the dashboard is enabled.

## Theme and i18n

Theme values are MiniMessage styling tags. TeaCore compiles them into a `TagResolver` so translation keys can write `<primary>Hello</primary>` and have the close tag pop back to the parent scope. The MessageService renders these to Adventure `Component`s for normal chat, and can also emit legacy section-code strings for contexts that need them (scoreboards, sign lines, titles).

Each plugin bundles `lang/<locale>.yml` resources inside its jar. On enable, it writes any jar-bundled keys that are missing from the on-disk file back into the file. Admin customizations stay, and new keys appear on their own.

## Games layered on top

A game plugin takes TeaCore's building blocks and layers its own mechanics on top. Typical ingredients for a new game:

- A `GameDefinition` registered in `onEnable`.
- A controller class listening for `ArenaStateChangeEvent`, `ArenaPlayerJoinEvent` and similar, plus any Bukkit events the game needs (damage, interact, chat).
- Optional kits registered via `KitRegistry`; optional abilities via `KitRegistry.registerAbility` or via the game's own per-situation dispatcher.
- A migration set + `StatsProvider` for per-game persistence.
- A per-match scoreboard wired through `MessageService` / `MatchBroadcaster`.

Games are standalone plugin jars that depend on TeaCore. See [Extending with a new game](./extending-with-a-new-game.md) for a step-by-step walkthrough.
