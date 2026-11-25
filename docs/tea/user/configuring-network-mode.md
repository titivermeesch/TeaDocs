---
sidebar_position: 3
title: Network mode & deployment shapes
---

# Network mode & deployment shapes

TeaCore supports three deployment shapes. Pick the one that matches how you run your servers, then copy the config block into `plugins/TeaCore/config.yml`.

* [**Standalone**](#standalone): one server runs lobby + games. No proxy needed.
* [**Central**](#central): proxy (BungeeCord or Velocity) + lobby + multiple arena servers. Leader balances allocations.
* [**External**](#external): one game per pod, external orchestrator (k8s HPA) owns scaling.

Running on Kubernetes or CloudNet? See [Running on Kubernetes](./kubernetes.md) and [Running on CloudNet](./cloudnet.md); both build on the central and external shapes below.




## Standalone

**Use this when:** You're running a single Paper (or Spigot) server that hosts the lobby and the games together. No proxy, one JVM, one server.


### What happens

* Players join the single server directly.
* TeaCore uses in-memory coordination (no Redis needed).
* The arena pool runs locally on this one server and allocates new arenas up to `max-total`.



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
2. Set `lobby.enabled: true` in `plugins/TeaCore/config.yml` (this single server hosts both the lobby and the arenas).
3. Start the server. `/tea game list` should show every registered game.
4. `/tea map create <game> <map>` to author your first map.
5. `/play <game>` to join. The pool opens arenas as needed, up to `max-total`.




### Scaling up and down

The pool keeps `min-available` joinable arenas per game. When more players queue than those arenas can take, it opens more, up to `max-total`. When the rush is over, arenas that have waited empty for `arena-pool.scale-down-idle-seconds` (default `60`) close again, down to `min-available`. The pool never closes an arena while players are queued for that game. Set it to `0` to keep extra arenas open. In central mode the lobby (the matchmaker leader) makes these decisions for the whole fleet.

## Central
**Use this when:** You run a proxy (BungeeCord or Velocity) in front of a lobby server plus one or more arena servers. Each arena server hosts several arenas. When the fleet needs a new arena, TeaCore puts it on the least-loaded server.


### What happens

- Players connect via the proxy. The proxy sends them to the lobby first.
- Every server (lobby included) publishes arena state and "hosted games" to Redis.
- One lobby server holds the **matchmaker leader lock**. Only that server's `ArenaPoolManager` makes allocation decisions.
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
    # this section populated; they just declare themselves as hosts and
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
2. On the lobby server, set `lobby.enabled: true` in `plugins/TeaCore/config.yml`. Leave it `false` (the default) on arena servers. If the lobby doesn't run a game's plugin, set that game's name and icon with [`game-display`](./lobby.md#game-names-and-icons) so the game selector shows them.
3. Start Redis + MySQL.
4. Start all servers. Each one registers its hosted games in Redis.
5. Set `network.eligible-matchmaker: true` on the lobby and `false` on every arena server. Only eligible servers compete for the matchmaker leader lock and run the cluster-wide pool manager. The lobby's `arena-pool.games` config is then the only sizing source for the fleet.
6. Build or copy your maps on any one server. They're stored in the database and every other server downloads them (see [Arena servers](./hosting.md)).
7. `/play <game>` from the proxy joins a players-needed arena on whichever arena server has one.

### Which server hosts what

Every arena server hosts every installed game unless you limit it with `hosting.games`. See [Arena servers](./hosting.md) for that, for how arenas pick their map, and for keeping maps on each server's disk instead of the database (`maps.storage: files`).

### Signed Redis messages

Servers sign every command and event they send each other through Redis with a shared network secret, and drop messages that are unsigned, wrongly signed or more than two minutes old. Each message also carries a random ID, and a server drops a second copy of an ID it has already seen, so a captured message can't be sent again. You don't set the secret up: the first server to start generates one and stores it in the shared MySQL database, and the others read it from there. A server that drops a message logs `Dropped an unsigned or wrongly signed message`. That usually means it uses a different database from the rest, its clock is off by minutes, or it runs a different TeaCore version (update every server together).

If your servers don't share a database, set the same `network.secret` on every server:

```yaml
network:
  secret: "a long random string"
```

## External

**Use this when:** Kubernetes (or similar) boots a fresh server per match. Each server hosts one arena, runs the match, then stops. Your autoscaler decides when to start more servers. See [Running on Kubernetes](./kubernetes.md) for a full setup.


### What happens

- When the server starts, TeaCore opens one arena per installed game as soon as the maps have loaded (`arena-pool.games.<id>.preload-on-startup` raises that number). It never opens arenas on other servers.
- With the game's `end-mode: SHUTDOWN`, the server stops when the match ends. With `end-mode: RESET`, it opens a new arena and keeps running.
- Your autoscaler watches the queue (for example the `tea_queue_players` [metric](./metrics.md)) and adds servers.

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

Per-game end mode (example; every game plugin exposes the same field in its own config):

```yaml
# plugins/<YourGame>/config.yml
game:
  end-mode: SHUTDOWN         # JVM exits after the ENDING phase
```

### Running

1. Build a server image with TeaCore, the game plugins and the maps inside.
2. Run the arena servers as a StatefulSet, so each has a stable name the proxy can list, and scale its replicas on the queue length.
3. The lobby runs normally. Each time an arena server starts, the lobby sees its arena and sends queued players to it.
4. When the match ends, the server stops and Kubernetes restarts it with a fresh world.

## Reload

```
/tea reload          # TeaCore: config, theme, all locale bundles
/tea lobby reload    # Reload connection signs + lobby spawn settings (the lobby UI inside TeaCore)
```

Neither command reconnects Redis or the DB pool. Restart the server for those.

## Also see

- [Installing](./installing.md): first-time setup for all three shapes.
- [Lobby](./lobby.md): hotbar items, the game selector and game names on lobby servers.
- [Arenas and pool internals](../dev/architecture.md): how allocations + control commands work under the hood.
