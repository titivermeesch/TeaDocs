---
sidebar_position: 14
title: Metrics
---

# Metrics

TeaCore serves Prometheus metrics at `/metrics` on the [web dashboard](./dashboard.md) port. One scrape covers the whole network: every server sends its stats to the dashboard server every 15 seconds.

## Setting it up

1. Turn on the dashboard on one server (`dashboard.enabled: true`).
2. Pick a long random token and put it in that server's `plugins/TeaCore/config.yml`:

```yaml
metrics:
  token: "change-me-to-something-long"
```

3. Run `/tea reload`.
4. Point Prometheus at it:

```yaml
scrape_configs:
  - job_name: tea
    scrape_interval: 15s
    metrics_path: /metrics
    authorization:
      credentials: "change-me-to-something-long"
    static_configs:
      - targets: ["lobby.example.com:8080"]
```

With `token` empty, `/metrics` answers 404. A wrong token gets 401. The dashboard's admin token doesn't work here, so a leaked scrape config can't act on your network.

## What you get

Per server (label `server`):

| Metric | Meaning |
| --- | --- |
| `tea_server_up` | 1 while the server sends stats. A server that stops sending drops out after a minute. |
| `tea_server_tps` | TPS over the last minute. |
| `tea_server_mspt` | Average tick time in milliseconds. Paper only. |
| `tea_server_players` | Players online. |
| `tea_server_memory_used_bytes`, `tea_server_memory_max_bytes` | Java heap. |
| `tea_arena_spare_worlds` | Released arena worlds kept for reuse (`arena-pool.spare-worlds`). |

Arenas and queues:

| Metric | Labels | Meaning |
| --- | --- | --- |
| `tea_arenas` | `server`, `game`, `state` | Arenas in each state (`allocating`, `waiting`, `countdown`, `live`, ...). |
| `tea_arena_players` | `server`, `game`, `state` | Players in those arenas, spectators not counted. |
| `tea_queue_players` | `game` | Players waiting in the queue. |
| `tea_game_hosts` | `game` | Servers that host the game. |

Counters, since the dashboard server started:

| Metric | Labels | Counts |
| --- | --- | --- |
| `tea_matches_started_total` | `server`, `game` | Matches that went live. |
| `tea_matches_total` | `server`, `game` | Matches that ended. |
| `tea_deaths_total` | `server`, `game`, `kind` | Deaths in matches. `kind="kill"` when a player got the kill, `other` for falls, the void and so on. |
| `tea_arena_joins_total` | `server`, `game`, `spectator` | Players joining arenas. |
| `tea_arenas_allocated_total` | `server`, `game` | Arenas that finished loading their map. |

Prometheus handles counter resets, so `rate(tea_matches_total[1h])` keeps working across restarts.

## Example queries

```
# Matches per hour, per game
sum by (game) (rate(tea_matches_total[1h])) * 3600

# Servers below 18 TPS
tea_server_tps < 18

# Players waiting longer than the arenas can take them
sum by (game) (tea_queue_players) > 0 and sum by (game) (tea_arenas{state="waiting"}) == 0
```
