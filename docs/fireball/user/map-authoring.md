---
sidebar_position: 4
title: Map authoring
---

# Fireball map authoring

Fireball uses the same `/tea map ...` commands as every Tea game. See the [Tea map authoring guide](../../tea/user/adding-a-map.md) for the core workflow (create, pos1, pos2, waiting, addspawn, min, max, save). This page covers what Fireball adds.

## What a Fireball map needs

On top of the core fields, a Fireball map has:

| Marker | Command | Required | Purpose |
| ------ | ------- | -------- | ------- |
| Team spawn | `/tea map teamspawn<i>` | Yes, one per team | Where team `<i>` spawns and respawns. |
| Chest | `/tea map chest` | No | A chest that Fireball fills with loot at match start. |
| Cannon | `/tea map cannon` | No | A block players right-click to fire a cannon. |
| Power-up point | `/tea map powerup` | No | A spot where power-up fireballs drop. |
| Shopkeeper | `/tea map shop` | No | Where a shop villager stands. Without any, each team gets one 3 blocks from its spawn. |

All markers appear in `/tea map status` and in the setup sidebar. `/tea map save` refuses to save until every team spawn is set.

## With the editor tools

Everything on this page also works with TeaCore's [editor tools](../../tea/user/adding-a-map.md#editor-tools). Sneak and scroll with the point tool to pick `chest`, `cannon`, `powerup` or a `team-spawn-<i>`, then right-click:

| Point type | Right-click a block marks |
| --- | --- |
| `chest`, `cannon` | The clicked block itself. Click the chest or the cannon block. |
| `powerup`, `team-spawn-<i>` | The space on top of the clicked block. |

Each type has its own marker colour: team spawns in the team's colour, chests brown, cannons grey, power-ups purple. Left-click a marker with the point tool to remove that point.

## Team spawns

Each team has its own spawn command, numbered from 0. The number of teams comes from `teams.count` in `plugins/Fireball/config.yml` (default 2).

| `teams.count` | Commands to run |
| ------------- | --------------- |
| 2 | `teamspawn0`, `teamspawn1` |
| 4 | `teamspawn0` to `teamspawn3` |
| 8 | `teamspawn0` to `teamspawn7` |

Team numbers map to colors in this order: 0 Red, 1 Blue, 2 Green, 3 Yellow, 4 Purple, 5 Orange, 6 Pink, 7 Lime.

Stand where the team should spawn, face the direction players should look, and run the command. Run it again to move the spawn.

Players go to their team spawn at the start of the match and after every death. TeaCore still requires at least one participant spawn (`/tea map addspawn`); put those at the team bases too.

If you change `teams.count` later, set `teams.count` first and restart, so the new `teamspawn` commands exist. Then edit each map and add the missing team spawns.

## Chests, cannons and power-up points

These three markers take a list of points. Each run adds one point at the block you are standing in (centered on that block). To start over, clear the list:

```
/tea map chest clear
/tea map cannon clear
/tea map powerup clear
```

### Chests

The marked block must be a chest when the match starts. Fireball skips any other block. You can mark one in two ways:

- Stand on top of the chest and run `/tea map chest`. A chest is shorter than a full block, so you are standing "in" the chest's block.
- Stand where the chest will go, run `/tea map chest`, step aside and place the chest there.

Fireball empties and refills chests from the [`loot:`](./configuration.md#loot-chest-loot) table each match.

### Cannons

A cannon is the block at the marked spot. Players right-click that block to fire. Any block works; the example map uses lodestone.

1. Stand on the spot where the cannon block will be.
2. Run `/tea map cannon`.
3. Step aside and place the cannon block on that spot.

Shots leave from just above the cannon block, in the direction the player is looking. Leave open space above and around it. Players cannot break cannon blocks during a match.

Cannon types follow the order you mark them in. With the default config:

| Marked as | Type |
| --------- | ---- |
| Cannon 1 | rapid |
| Cannon 2 | heavy |
| Cannon 3 | homing |
| Cannon 4 | rapid (the list starts again) |

Change the list in [`cannons.types`](./configuration.md#cannons) to change which types you get.

### Power-up points

Stand where a power-up should drop and run `/tea map powerup`. The item drops one block above the point. With several points, each drop picks one at random. A central, contested spot works best.

## Full workflow

```
/tea map create fireball arena1
# build or //paste your map

/tea map pos1
/tea map pos2
/tea map waiting
/tea map addspawn          # at the red base
/tea map addspawn          # at the blue base

/tea map teamspawn0        # red base
/tea map teamspawn1        # blue base

/tea map chest             # repeat for each chest
/tea map cannon            # repeat for each cannon, then place the block
/tea map powerup           # center

/tea map min 2
/tea map max 8

/tea map status
/tea map save
```

Use at least 2 for `min`. With fewer, a match can start with only one team in it and ends at once by forfeit.

## Editing a map later

```
/tea map edit fireball arena1
/tea map cannon clear
/tea map cannon            # re-mark each cannon
/tea map save
```

## Map file

`/tea map save` writes the map to `plugins/TeaCore/maps/fireball.yml` and the build to `plugins/TeaCore/maps/schems/<mapId>.schem` (`.schematic` on 1.8 to 1.12). Fireball stores its markers under `extensions:`. Coordinates are relative to the map's lowest corner.

```yaml
maps:
  coliseum:
    display-name: "Coliseum"
    min-players: 2
    max-players: 8
    schematic-file: "coliseum.schem"
    waiting-spawn: { x: 32.5, y: 6, z: 32.5, yaw: 0.0, pitch: 0.0 }
    participant-spawns:
      - { x: 12.5, y: 2, z: 32.5, yaw: 270.0, pitch: 0.0 }
      - { x: 52.5, y: 2, z: 32.5, yaw: 90.0, pitch: 0.0 }
    extensions:
      fireball:team-spawn-0:
        id: fireball:team-spawn-0
        x: 12.5
        y: 2
        z: 32.5
        yaw: 270.0
        pitch: 0.0
      fireball:team-spawn-1:
        id: fireball:team-spawn-1
        x: 52.5
        y: 2
        z: 32.5
        yaw: 90.0
        pitch: 0.0
      fireball:chests:
        points:
          - { id: "fireball:chests-0", x: 10.5, y: 2, z: 32.5, yaw: 0.0, pitch: 0.0 }
          - { id: "fireball:chests-1", x: 54.5, y: 2, z: 32.5, yaw: 0.0, pitch: 0.0 }
      fireball:cannons:
        points:
          - { id: "fireball:cannons-0", x: 32.5, y: 2, z: 52.5, yaw: 0.0, pitch: 0.0 }
          - { id: "fireball:cannons-1", x: 32.5, y: 2, z: 12.5, yaw: 0.0, pitch: 0.0 }
      fireball:powerups:
        points:
          - { id: "fireball:powerups-0", x: 32.5, y: 5, z: 32.5, yaw: 0.0, pitch: 0.0 }
```

You can hand-edit this file and run `/tea map reload`. Keep the schematic file and the YAML entry together when you copy a map to another server. A `.schematic` map works on every version; a `.schem` map only on 1.16.5 and newer.
