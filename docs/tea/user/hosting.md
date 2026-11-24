---
sidebar_position: 5
title: Arena servers
---

# Arena servers

On a network, everything servers share lives in the database: maps, older map versions, waiting rooms, menus, sidebars, the theme, language files, and settings staff changed in game or on the dashboard. A new arena server needs only its plugin jars, the database and Redis details, and a `hosting:` section that says what it runs. It downloads the rest when it starts.

## What a server hosts

```yaml
# plugins/TeaCore/config.yml
hosting:
  games: [any]      # game ids, or any
  map: default      # default | random | vote | a map id
  maps: {}          # per game, e.g. fireball: coliseum
```

**`games`** lists the games this server runs. `any` means every game whose jar is installed. The jars still have to be on the server; only maps and settings come from the database. Build one image with every game jar and use `games` to give servers different jobs, or leave it on `any`.

The lobby only opens a game's arenas on servers that list it, so you can keep one game on its own servers:

```yaml
hosting:
  games: [ascend]
```

**`map`** decides how an arena picks its map:

| Value | Arenas |
| --- | --- |
| `default` | Do what the game decides, with [map voting](./map-voting.md) if it's on. |
| `random` | Pick a random map, without a vote. |
| `vote` | Start on a random map and let the waiting players vote, even when the game would pick a fixed map. |
| a map id | Always use that map. If it doesn't exist for a game, that game picks at random. |

Use `maps` to set it per game, for example `fireball: coliseum` while every other game stays on `map`.

## One match per server

With `arena-pool.mode: external`, each server runs one match at a time and your orchestrator adds servers as needed (see [Kubernetes](./kubernetes.md) and [CloudNet](./cloudnet.md)).

- With one game in `games`, the server keeps an arena of that game open.
- With several games, or `any`, it opens one arena for the game most players are queued for, picking at random when nobody is queued. If its arena sits empty for 10 seconds while players queue for a different game, it closes the arena and opens that game instead.

Only games with at least one map count, so a game you installed but never built a map for is skipped.

## Maps in the database

```yaml
maps:
  storage: database   # or files
```

With `database` (the default), every server keeps a copy of `plugins/TeaCore/maps/` and `plugins/TeaCore/waiting-rooms/` and checks it against the database:

- At startup a server downloads what changed. Files the database doesn't have yet, such as a map you copied into the folder by hand, are uploaded, and so are files you edited while the server was off.
- When you save, delete or restore a map, or change a waiting room, the server uploads it and the other servers reload it within seconds.
- `/tea map reload` downloads new versions and uploads files you added by hand.

A server only downloads files that changed since its last check. Builds are stored once per version, so older versions of a map that kept the same build cost nothing extra.

On a single server with SQLite the same happens, in a file next to the server. Set `storage: files` to keep maps only in the folders, as before; then copy them to every server yourself.

MySQL needs no setup for this. TeaCore stores builds in pieces of 1 MB, so the default MySQL and MariaDB limits on query size don't matter.

## Menus, sidebars, theme and languages

```yaml
share-config-files: true
```

With this on (the default), TeaCore also shares `menus/`, `lang/`, `theme.yml` and `sidebar.yml` of TeaCore, and the `menus/` and `lang/` folders of every Tea game. Edit a file on any server and run `/tea reload` there, or restart that server: the other servers download it and reload. A new server starts with the network's versions.

Config files (`config.yml`, `quests.yml`) aren't shared this way. Their shared values come from [the settings](#settings-in-the-database).

## Downloading and uploading maps

On the dashboard's Games page, **Download** next to a map saves it as a zip, **Download all maps** saves every map and waiting room, and **Upload maps** loads a zip into the network. In game, `/tea map export <game> <map>` (or `all`) writes a zip to `plugins/TeaCore/exports/`, and `/tea map import-zip <file>` loads one from there.

An upload adds the maps and waiting rooms in the zip and replaces those with the same id, after keeping a version of the old one. Everything else stays. The zip can hold the `maps/` and `waiting-rooms/` folders of `plugins/TeaCore`, or a game's loose map files, such as `overcharge.yml` with `substation.schem`.

Both need `tea.dashboard.maps.transfer` on the dashboard, and `tea.map.admin` in game.

## Backups

Maps live in the database now, so back the database up. A regular MySQL backup (for example `mysqldump`) covers maps, versions, waiting rooms, shared files and settings along with stats and match history. For a copy you can move to another network, download all maps from the dashboard or run `/tea map export all`.

## Settings in the database

When staff change a setting in `/tea admin` or on the dashboard, TeaCore also stores it in the database. A server that starts later writes those values into its config files before any game reads them, so every server runs with the same settings. See [Changing settings](./settings.md).

On the dashboard you can save a value for one group of servers instead, such as only arena servers. A server's group is `network.group`, or `lobby` on a lobby and `arena` elsewhere when you leave it empty. A group value wins over the value for every server.

Values you change by editing a file stay on that server only. Change shared values in game or on the dashboard.
