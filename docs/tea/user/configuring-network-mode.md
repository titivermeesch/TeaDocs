---
sidebar_position: 3
title: Network mode & deployment shapes
---

# Network mode & deployment shapes

TeaCore supports three deployment shapes. Pick the one that matches how you actually want to run your fleet, then copy the config block into `plugins/TeaCore/config.yml`.

- [**Standalone**](#standalone) - one box runs lobby + games. No proxy needed.
- [**Central**](#central) - proxy (BungeeCord or Velocity) + lobby + multiple arena servers. Leader balances allocations.
- [**External**](#external) - one game per pod, external orchestrator (k8s HPA) owns scaling.

Each shape is independent — you don't need to understand all three to run one. Pick yours and skim the others later.

## Standalone

**Use this when:** You're running a single Paper (or Spigot) server that hosts the lobby and the games together. No proxy, one JVM, one box. Most dev setups and small communities.

### What happens

- Players join the single server directly.
- TeaCore uses an in-memory coordination backend (no Redis).
- The arena pool runs locally on this one server and allocates new arenas up to `max-total`.

### Config

```yaml
# plugins/TeaCore/config.yml

network:
  mode: standalone
  server-id: auto
  lobby-server: lobby        # ignored in standalone

database:
  type: sqlite
  sqlite-file: plugins/TeaCore/tea.db

arena-pool:
  mode: standalone
  games:
    mygame:
      min-available: 1       # keep at least 1 waiting arena around
      max-total: 4           # never exceed 4 concurrent arenas
      preload-on-startup: 1  # spin up 1 arena at plugin enable
```

### Running

1. Drop the `TeaCore` jar and each game jar into `plugins/`.
2. Set `lobby.enabled: true` in `plugins/TeaCore/config.yml` (this single server hosts both the lobby UI and the arenas).
3. Start the server. `/tea game list` should show every registered game.
4. `/tea map create <game> <map>` to author your first map.
5. `/play <game>` to join. Pool automatically spins arenas up to `max-total`.

## Central

**Use this when:** You run a proxy (BungeeCord or Velocity) in front of a lobby server plus one or more arena servers. Multiple arenas per arena server. You want the fleet to self-balance — when a new arena is needed, it should land on the least-loaded server.

### What happens

- Players connect via the proxy. The proxy sends them to the lobby first.
- Every server (lobby included) publishes arena state and "hosted games" to Redis.
- One lobby server holds the **matchmaker leader lock**. That server's `ArenaPoolManager` is the only one that actually makes allocation decisions.
- When an allocation is needed, the leader looks at who hosts the game in question, picks the server with the fewest current arenas for that game, and sends an `ALLOCATE_ARENA` control command over Redis pub/sub. The target server creates the arena locally.
- On match end, `/play <game>` re-joins through the lobby, which routes to whichever server has a free slot.

### Config

Apply to **every** server (lobby + each arena server):

```yaml
# plugins/TeaCore/config.yml

network:
  mode: bungeecord           # activates the Redis-backed coordination backend
  server-id: arena-1         # set per server: "lobby", "arena-1", "arena-2", ...
  lobby-server: lobby        # name of the lobby server in the proxy's server list
  eligible-matchmaker: false # only the lobby is eligible; arena servers stay false

redis:
  host: redis.internal
  port: 6379
  password: ""

database:
  type: mysql                # all servers share one MySQL
  mysql:
    host: mysql.internal
    port: 3306
    database: tea
    user: tea
    password: ""

arena-pool:
  mode: central
  games:
    # In central mode, the LOBBY's arena-pool.games config is the single
    # source of truth for fleet-wide pool sizing. Arena servers don't need
    # this section populated — they just declare themselves as hosts and
    # accept ALLOCATE_ARENA control commands from the lobby. Put this block
    # on the lobby only, with one entry per game id you want auto-scaled.
    mygame:
      # These are NETWORK-WIDE totals in central mode, not per-server.
      min-available: 2       # keep 2 joinable arenas across the whole fleet
      max-total: 16          # never exceed 16 total arenas
      preload-on-startup: 0  # ignored in central mode (leader handles it)
```

### Running

1. Install the `TeaCore` jar + every game jar on every server.
2. On the lobby server, set `lobby.enabled: true` in `plugins/TeaCore/config.yml`. Leave it `false` (the default) on arena servers.
3. Start Redis + MySQL.
4. Start all servers. Each one registers its hosted games in Redis.
5. Set `network.eligible-matchmaker: true` on the lobby and `false` on every arena server. Only eligible servers compete for the matchmaker leader lock and run the cluster-wide pool manager. The lobby's `arena-pool.games` config is then the only sizing source for the fleet.
6. Copy your map data into each arena server's `plugins/TeaCore/maps/` directory. (Shared storage like NFS or S3 sync is the usual prod approach.)
7. `/play <game>` from the proxy joins a players-needed arena on whichever arena server has one.

### Gotcha: maps must exist on each hosting server

When the leader sends `ALLOCATE_ARENA` to arena-2, arena-2 reads its local `plugins/TeaCore/maps/` to find maps. If no maps are authored on that server, the allocation silently no-ops. Three options:

- Author maps on every server.
- Mount a shared volume at `plugins/TeaCore/maps/`.
- Use an image layer that pre-bakes maps into every arena server.

## External

**Use this when:** Kubernetes (or similar) boots a fresh pod per match. Each pod hosts exactly one arena, runs the match, then terminates. An external scaler (HPA on queue depth, or a custom controller) decides when to spawn more pods.

### What happens

- TeaCore's pool manager is a no-op — it never allocates.
- Each pod boots with `end-mode: SHUTDOWN`, so when the match ends the JVM exits and the pod dies.
- Your orchestrator watches queue depth via Redis and scales the pod count up.

### Config

On each arena pod:

```yaml
network:
  mode: bungeecord
  server-id: auto            # let k8s inject TEA_SERVER_ID from the pod name
  lobby-server: lobby

redis:
  host: redis.internal

database:
  type: mysql
  mysql: { ... }

arena-pool:
  mode: external             # core never allocates; each pod hosts one arena
```

On the lobby:

```yaml
arena-pool:
  mode: central              # lobby still uses central mode for discovery
  # or standalone if the lobby is the only server; external only applies to arena pods.
```

Per-game end mode (example — every game plugin exposes the same field in its own config):

```yaml
# plugins/<YourGame>/config.yml
game:
  end-mode: SHUTDOWN         # JVM exits after the ENDING phase
```

### Running

1. Build your pod image with TeaCore + game plugins + a single map baked in.
2. Kubernetes deployment with `replicas: N` controlled by an HPA (queue-depth custom metric).
3. Lobby runs normally. Queue-based routing still works — the lobby sees a new arena snapshot appear each time a pod boots and routes queued players into it.
4. After match end, the pod terminates; k8s replaces it per the deployment's replica count.

## Reload

```
/tea reload          # TeaCore: config, theme, all locale bundles
/tea lobby reload    # Reload connection signs + lobby spawn settings (the lobby UI inside TeaCore)
```

Neither command reconnects Redis or the DB pool — restart the server for those.

## Also see

- [Installing](./installing.md) — first-time setup for all three shapes.
- [Arenas and pool internals](../dev/architecture.md) — how allocations + control commands work under the hood.
