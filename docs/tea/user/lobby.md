---
sidebar_position: 4
title: Lobby
---

# Lobby

Players land on a lobby server, pick a game there and return to it after a match. The lobby features ship inside TeaCore. Turn them on with `lobby.enabled: true` in `plugins/TeaCore/config.yml` on every hub server. Leave it off (the default) on arena-only servers.

On a lobby server, players get:

- a [hotbar](#lobby-hotbar) with a Play item and a Profile item,
- the [game selector](#game-selector) (`/play`),
- their [profile](#profile) (`/profile`),
- the lobby sidebar (see [Sidebars](./sidebars.md)),
- connection signs, lobby spawn and gamemode, managed with `/tea lobby` (see [Permissions](./permissions.md)).

## Lobby hotbar

Lobby players get a few hotbar items. A right-click on an item opens a menu or runs a command. The defaults are a compass in slot 0 that opens the [game selector](#game-selector) and a book in slot 4 that opens the [profile](#profile).

![The lobby hotbar](/img/tea/lobby-hotbar.png)

```yaml
# plugins/TeaCore/config.yml
features:
  lobby-hotbar: true

lobby:
  enabled: true
  hotbar:
    items:
      - slot: 0
        material: COMPASS
        name: "<primary><bold>Play</bold> <muted>(right-click)"
        lore: ["<secondary>Pick a game and a map"]
        menu: play
      - slot: 4
        material: BOOK
        name: "<primary><bold>Profile</bold> <muted>(right-click)"
        lore: ["<secondary>Stats, achievements, history and kits"]
        menu: profile
      - slot: 8
        material: EMERALD
        name: "<accent>Shop"
        command: "shop"
```

Each item takes these keys:

| Key | Default | Meaning |
| --- | --- | --- |
| `slot` | position in the list | Hotbar slot, `0` to `8`. |
| `material` | `COMPASS` | Bukkit material name. An unknown material skips the item. |
| `name` | `""` | Display name. MiniMessage and theme tags. |
| `lore` | none | List of lore lines. Same format as `name`. |
| `menu` | | Menu id to open, e.g. `play`. See [Menus](./menus.md#menu-ids). |
| `command` | | Command to run as the player. The leading `/` is optional. |

`name` and `lore` support `<player>` (the player's name) and `%placeholderapi%` placeholders.

Set `menu` or `command`. If you set both, `menu` wins. To open a menu with values, use `command`, for example `command: "menu kits game=fireball"`.

The items follow these rules:

- Players get them on join, on respawn and when they leave an arena.
- TeaCore removes them when the player joins an arena. Players in an arena never get them.
- Players can't move, drop or swap them to the off hand.
- An item replaces whatever was in its slot.

The hotbar needs both `lobby.enabled: true` and `features.lobby-hotbar: true`. After `/tea reload`, players get the new items the next time they join, respawn or leave an arena. Turning `lobby-hotbar` off removes the items the next time a player joins, respawns or uses one. Each item carries its own action, so if you reorder the list, an old item still opens the right thing.

## Game selector

`/play` with no arguments opens the game selector, the `play` menu. The default Play hotbar item opens it too.

![The /play game selector](/img/tea/play-menu.png)

1. **Pick a game.** The menu lists every game in the network: the games this server runs and the games other servers host. Each shows how many players are in it, how many arenas are open and how many maps it has. Left-click a game to queue for it, the same as `/play <game>`. Right-click to choose a map.
2. **Pick a map** (`play-maps`). Quick join queues for any map. Left-click a map to queue for that map, the same as `/play <game> <map>`. Right-click a map, or click Live arenas, to see its arenas.
3. **Pick an arena** (`arenas`). The list shows each live arena's map, state, players and server, and updates every second. Left-click to join, right-click to spectate.

The selector also has a head that opens the player's [profile](#profile).

`/play <game> [map]` still works. If the `play` menu or all menus are off, `/play` with no arguments shows the usage line instead.

Every screen is a YAML menu you can restyle. See [Menus](./menus.md) for the files and the values each one shows.

## Profile

`/profile` opens the `profile` menu. The default Profile hotbar item opens it too. From there players reach:

- **Stats**: runs `/stats`.
- **Achievements**: every achievement of every game this server runs, locked or unlocked.
- **Match history**: their recent matches. See [Match history](./match-history.md).
- **Kits**: pick a game, then a kit for it.

`/profile` needs `tea.menu`. If the profile menu or all menus are off, `/profile` runs `/stats` instead.

## PvP in the lobby

By default players can't hurt each other in the lobby: hits, arrows, thrown potions and TNT they lit do nothing to other players. Set `lobby.pvp: true` to allow it. Players in an arena on the same server are not affected; the game decides there. `/tea reload` applies a change.

```yaml
lobby:
  enabled: true
  pvp: false
```

## Game names and icons
Menus show each game with a name and an icon. By default the game's plugin supplies both. A lobby server that doesn't run a game's plugin still lists the game, since other servers host it, but has no name or icon for it. It shows the id with a capital first letter and a `PAPER` icon instead.

Set `game-display` on the lobby to fix that, or to override a game's own name and icon on any server:

```yaml
# plugins/TeaCore/config.yml (top level, not under lobby)
game-display:
  mygame:
    name: "<red>My Game"
    icon: FIRE_CHARGE
```

| Key | Meaning |
| --- | --- |
| `game-display.<id>.name` | Name in menus. MiniMessage and theme tags. |
| `game-display.<id>.icon` | Bukkit material name. An unknown material falls back to the game's own icon. |

The game id is the one you use with `/play <game>`. Both keys are optional. A key you set wins over the game's own name or icon in every menu, in sidebars (`<game-name>`) and in `%tea_game_<id>_name%`.

The name falls back in this order: `game-display.<id>.name`, the game's own translated name, then the id with a capital first letter. The icon falls back to the game's own icon, then `PAPER`.

## Where players wait

Players who join an arena wait there until the countdown ends. You choose where:

1. **A waiting room** (recommended): a small build you make once. Every arena gets its own copy, so players only ever see the players of their own match.
2. **A shared waiting area**: one spot in any world that every arena uses. Players of different arenas see each other there.
3. **The map's waiting spawn**: the default, inside the map itself.

TeaCore uses the first one that's set. Spectators always go straight into the arena.

![Waiting for a match: the kit picker in slot 1 and the leave item in slot 9](/img/tea/waiting.png)

### Waiting rooms

Build a room once, then assign it to a game or to a single map. Each new arena pastes its own copy of the room into the arena's world, far from the map, and its players wait there. When the countdown ends they move to the map. Nobody can break, build in or blow up a room.

To build one:

```
/tea waiting room edit lobbyroom   # opens an empty editor world (or the room, to change it)
/tea waiting room pos1             # one corner, where you stand
/tea waiting room pos2             # the opposite corner
/tea waiting room spawn            # where players appear, facing where you look
/tea waiting room save             # saves it and takes you back
/tea waiting room discard          # leaves without saving
```

The editor shows the corners, the outline of the region and the spawn with particles.

Then choose where it's used:

```
/tea waiting room assign lobbyroom fireball            # every Fireball arena
/tea waiting room assign shipdeck fireball high_seas   # only arenas on the High Seas map
/tea waiting room unassign fireball high_seas          # High Seas goes back to the game's room
/tea waiting room list                                 # rooms and where they're used
/tea waiting room delete lobbyroom
```

A map's own room wins over the game's room. A map without one uses the game's room, and a game without one falls back to a shared waiting area or the map's waiting spawn. New assignments apply to arenas opened after the change.

Rooms live in `plugins/TeaCore/waiting-rooms/`: one schematic per room and `waiting-rooms.yml` with the spawns and assignments. Like maps, they're stored in the database and every server gets them (see [Arena servers](./hosting.md)). Rooms need the same things as maps: WorldEdit or FastAsyncWorldEdit on 1.13 and newer, nothing extra on older versions. Every command needs the `tea.arena.admin` permission.

### A shared waiting area

One spot that every arena of a game uses, in any world:

```
/tea waiting set            # the default for every game
/tea waiting set fireball   # only for Fireball (overrides the default)
/tea waiting show [game]
/tea waiting clear [game]
```

Each match's chat, sidebar and kit picker still belong to the player's own arena, but players see everyone else standing there. TeaCore saves the spot under `waiting-area` in its config. Its world must be loaded on the server that hosts the arenas; if it isn't, players wait inside the map and TeaCore logs a warning.

## See also

- [Network mode & deployment shapes](./configuring-network-mode.md): where `lobby.enabled` goes in each setup.
- [Menus](./menus.md): every menu file, source and action.
- [Feature switches](./features.md): `features.lobby-hotbar` and the other switches.
