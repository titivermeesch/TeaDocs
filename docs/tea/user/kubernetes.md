---
sidebar_position: 5
title: Kubernetes
---

# Running on Kubernetes

This page shows how to run a Tea network on Kubernetes: a proxy, a lobby, arena servers, Redis and MySQL. It builds on [Network mode](./configuring-network-mode.md), so read that first.

There are two ways to run arenas:

| | Central | External |
| --- | --- | --- |
| Arena servers | A few long-running servers, many arenas each | One short-lived server per match |
| Who opens arenas | TeaCore's matchmaker on the lobby | Each server opens its own arena at boot |
| Who scales servers | You (fixed replicas, or a slow autoscaler) | Your autoscaler, on queue length |
| Good for | Most networks | Large networks that want hard isolation per match |

Start with central mode. It needs nothing beyond a normal StatefulSet, and TeaCore already opens and closes arenas inside the servers you give it.

## What every server needs

- **The same Redis and MySQL.** Run them in the cluster (for example with the Bitnami Helm charts) or use managed services. Every Tea server points at both.
- **A server id the proxy knows.** TeaCore sends players to another server by name through the proxy, so each server's id must match a name in the proxy's server list. Set `network.server-id: auto` and pass the pod name in the `TEA_SERVER_ID` environment variable. A StatefulSet gives pods stable names (`arena-0`, `arena-1`, ...), which is what the proxy needs.
- **Nothing for maps.** Maps and waiting rooms live in the database, and each pod downloads them when it starts. Build them on any server. See [Arena servers](./hosting.md).
- **Proxy forwarding.** Run the servers in offline mode behind the proxy, with Velocity modern forwarding or BungeeCord IP forwarding turned on, as for any proxy network.

## Images

The examples use `itzg/minecraft-server`, which downloads Paper (or Spigot) on first start. For production, build your own image on top of it with the plugin jars and configs already inside, so pods start fast and every pod is identical:

```dockerfile
FROM itzg/minecraft-server:java21
ENV EULA=TRUE TYPE=PAPER VERSION=1.21.4 ONLINE_MODE=FALSE
# plugins/ holds the jars plus TeaCore/config.yml and TeaCore/maps/
COPY plugins/ /plugins/
```

The image copies `/plugins` into the server's `plugins` folder at startup. Every Tea jar needs Java 17 or newer, including on 1.8.8 (see [Server versions](./server-versions.md)).

## Central mode

### TeaCore config

The lobby and the arena servers share one config file with three differences. Keep it in a ConfigMap, or in your image.

```yaml
# plugins/TeaCore/config.yml (arena servers)
network:
  mode: bungeecord
  server-id: auto              # read from TEA_SERVER_ID (the pod name)
  lobby-server: lobby
  eligible-matchmaker: false   # true on the lobby

redis:
  host: redis-master
  port: 6379

database:
  type: mysql
  mysql:
    host: mysql
    port: 3306
    database: tea
    user: tea
    password: ""               # better: inject from a Secret, see below

arena-pool:
  mode: central
```

On the lobby, set `eligible-matchmaker: true`, `lobby.enabled: true`, and size the pool under `arena-pool.games` (these numbers count arenas across all arena servers):

```yaml
arena-pool:
  mode: central
  scale-down-idle-seconds: 60
  games:
    fireball:
      min-available: 2
      max-total: 40
```

### Arena servers

A StatefulSet with a headless Service, so every pod has a stable name and DNS entry (`arena-0.arena`, `arena-1.arena`, ...):

```yaml
apiVersion: v1
kind: Service
metadata:
  name: arena
spec:
  clusterIP: None
  selector: { app: arena }
  ports: [{ name: minecraft, port: 25565 }]
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: arena
spec:
  serviceName: arena
  replicas: 3
  podManagementPolicy: Parallel
  selector:
    matchLabels: { app: arena }
  template:
    metadata:
      labels: { app: arena }
    spec:
      terminationGracePeriodSeconds: 90
      containers:
        - name: server
          image: registry.example.com/tea-arena:1.0.0
          env:
            - name: TEA_SERVER_ID
              valueFrom: { fieldRef: { fieldPath: metadata.name } }
            - name: MEMORY
              value: 3G
          ports: [{ containerPort: 25565, name: minecraft }]
          readinessProbe:
            tcpSocket: { port: 25565 }
            initialDelaySeconds: 30
            periodSeconds: 10
          livenessProbe:
            tcpSocket: { port: 25565 }
            initialDelaySeconds: 120
            periodSeconds: 20
          resources:
            requests: { cpu: "2", memory: 4Gi }
            limits: { memory: 4Gi }
```

The lobby is the same with `replicas: 1`, `TEA_SERVER_ID` set to `lobby`, and port 8080 added if it runs the [dashboard](./dashboard.md).

### Proxy

The proxy lists every server by the pod's DNS name. With a StatefulSet, list as many arena entries as your highest replica count; entries for pods that don't exist yet stay unused until you scale up.

```toml
# velocity.toml
[servers]
lobby = "lobby-0.lobby:25565"
arena-0 = "arena-0.arena:25565"
arena-1 = "arena-1.arena:25565"
arena-2 = "arena-2.arena:25565"
arena-3 = "arena-3.arena:25565"
try = ["lobby"]
```

Expose the proxy with a `LoadBalancer` Service on port 25565. Players only ever connect to the proxy.

### Scaling

Inside the servers, TeaCore opens arenas when players queue and closes empty ones after `scale-down-idle-seconds`. Changing the number of arena servers is up to you:

- **Fixed replicas** are the simplest. Size for your peak.
- **An autoscaler** can add servers when they fill up. Scale on CPU, or on TeaCore's [metrics](./metrics.md) through the Prometheus adapter or KEDA, for example `sum(tea_arenas{state!="released"})` divided by your arenas per server.

Scaling down removes the highest-numbered pod first, and any match running on it ends when the pod stops. Scale down slowly (a long stabilization window), or only when `tea_arena_players` for that pod is 0.

## External mode

In external mode each arena server hosts one match. When the server starts, TeaCore opens one arena per installed game as soon as the maps have loaded (`arena-pool.games.<id>.preload-on-startup` raises that number). The lobby sees the arena appear and sends queued players to it.

```yaml
# plugins/TeaCore/config.yml (arena servers)
network:
  mode: bungeecord
  server-id: auto
  lobby-server: lobby
  eligible-matchmaker: false
arena-pool:
  mode: external
```

```yaml
# plugins/Fireball/config.yml
game:
  end-mode: SHUTDOWN   # the server stops when the match is over
```

When the match ends, the server stops and Kubernetes restarts the container with a fresh world. With `end-mode: RESET` instead, the same server opens a new arena after each match and keeps running.

The proxy still needs every server's name, so use a StatefulSet as in central mode and list the possible pod names in the proxy config. To scale on demand, have your autoscaler watch the queue, for example with KEDA and the Prometheus query `sum(tea_queue_players{game="fireball"})`. The same caution applies when scaling down: a pod that stops mid-match ends that match.

TeaCore doesn't register servers with the proxy itself. If you want pods with random names (for example from a KEDA ScaledJob), add a proxy plugin that registers servers as pods come and go.

## Secrets

Keep passwords out of the ConfigMap. With `REPLACE_ENV_VARIABLES=TRUE`, the itzg image replaces `${CFG_...}` placeholders in config files with environment variables. Write `password: "${CFG_MYSQL_PASSWORD}"` in the TeaCore config and set `CFG_MYSQL_PASSWORD` from a Kubernetes Secret.

## Checklist

1. Redis and MySQL reachable from every pod.
2. Each server's `TEA_SERVER_ID` matches its name in the proxy config.
3. `eligible-matchmaker: true` on the lobby only.
4. Maps present on every arena server.
5. Proxy forwarding set up, servers in offline mode.
6. `/tea game list` on the lobby shows every game, and the [dashboard](./dashboard.md) shows every server.
