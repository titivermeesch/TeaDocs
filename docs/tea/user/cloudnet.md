---
sidebar_position: 6
title: CloudNet
---

# Running on CloudNet

TeaCore works with CloudNet v3. When a server runs as a CloudNet service, TeaCore notices and uses CloudNet to move players, start and stop arena servers, show match status on CloudNet's signs and keep templates up to date. Outside CloudNet none of this runs.

## Requirements

- CloudNet v3 with its Bridge module, which CloudNet installs on every service by default.
- Redis and a shared MySQL database, as for any [network](./configuring-network-mode.md). Use `network.mode: bungeecord` and `arena-pool.mode: central` on every service.

## Setting it up

1. Create a task per game, for example `Fireball`, next to CloudNet's `Lobby` and `Proxy` tasks. Set its minimum service count to `0`: TeaCore decides how many run.
2. Put TeaCore and the game in the task's template. Maps and waiting rooms come from the database, so templates don't need them (see [Arena servers](./hosting.md)).
3. Leave `network.server-id` on `auto`. Each service uses its CloudNet name (`Fireball-1`, `Lobby-1`) as its server id.
4. Set `network.lobby-server` to the lobby task's name and `network.eligible-matchmaker: true` on the lobby only.
5. Add the `cloudnet` section to TeaCore's config on the lobby:

```yaml
cloudnet:
  enabled: true
  lobby-task: Lobby
  publish-state: true
  games:
    fireball:
      task: Fireball
      min-services: 1
      max-services: 4
      arenas-per-service: 4
      idle-seconds: 120
  template-sync:
    enabled: false
    templates: ["Fireball/default"]
```

The game services need only `enabled`, `lobby-task` and `publish-state`. A `games` section on a game service does nothing, because only servers with `network.eligible-matchmaker: true` start and stop services. The lobby's `arena-pool.games` still sets how many joinable arenas the network keeps open.

## What it does

### Moving players

TeaCore sends players to other services through CloudNet's Bridge, so you never list servers in the proxy config. Sending someone back to the lobby picks the lobby service with the fewest players.

### Starting and stopping services

The lobby keeps `min-services` services of each game's task running. When players are queued, no open arena has room, and every service already holds `arenas-per-service` arenas, it starts another service, up to `max-services`. A service with nobody on it for `idle-seconds` is stopped, as long as nobody is queued and more than `min-services` are running.

### One match per service

Set `arenas-per-service: 1` in the lobby's `cloudnet.games` entry and `end-mode: SHUTDOWN` in the game's config (in the task's template). Then:

- Each service opens one arena. When players queue while every arena is in a match, the lobby starts another service for them.
- When a match ends, its players go back to the lobby service with the fewest players and the service stops. CloudNet deletes it, so the next match starts from a clean copy of the template.
- The lobby keeps `min-services` services running, so a new arena is ready before the next players queue. Set `idle-seconds` to how long an extra service may wait empty.

### Signs and NPCs

With `publish-state` on, each game service tells CloudNet:

| Field | Value |
| --- | --- |
| State | `LOBBY` while an arena on it takes players, `INGAME` once none does |
| Extra | the game and map, such as `fireball:coliseum` |
| MOTD | players and slots of the open arena, such as `3/8` |
| Max players | the slots of every arena on the service |

CloudNet's sign and NPC modules hide `INGAME` services by default and can show the other fields.

### Templates

Templates only need maps when you keep them out of the database (`maps.storage: files`). Then turn `template-sync` on: saving a map or a waiting room uploads `plugins/TeaCore/maps/` and `plugins/TeaCore/waiting-rooms/` into every listed template. Services started afterwards get the new version. Templates use CloudNet's `local` storage unless you add one: `Fireball/default/ftp`.

## Troubleshooting

**The Bridge logs `NoSuchMethodError` for `ServerListPingEvent` every second or so.** The Bridge build doesn't match your server software. TeaCore still moves players and starts and stops services, and the state, extra and MOTD fields above still reach CloudNet, because TeaCore sets them itself. Check CloudNet's own pages for a Bridge that fits your server.

**Nobody gets moved to a game service, and the lobby opens no arenas.** Make sure only the lobby has `network.eligible-matchmaker: true`.

## Permissions

CloudNet's CloudPerms module manages permissions on its services and ignores `/op`. Give staff TeaCore's permissions through CloudNet, for example `perms user Steve add permission tea.admin` and `tea.arena.admin`. See [Permissions](./permissions.md).
