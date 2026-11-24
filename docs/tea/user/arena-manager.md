---
sidebar_position: 10
title: Arena manager
---

# Arena manager

`/tea admin` opens the arena manager: menus for running arenas and maps from inside the game. It lists the arenas of every server in the network.

You need `tea.arena.admin` to open it. The map browser needs `tea.map.admin` as well. See [Permissions](./permissions.md).

## What you can do

| From | Click | Does |
| --- | --- | --- |
| Home | Left-click a game | Lists that game's arenas. |
| Home | Right-click a game | Opens the game's [maps](#maps). |
| Home | Shift-click a game | Allocates a new arena for the game. |
| Home | All arenas | Lists every arena of every game. |
| Home | Reload maps | Same as `/tea map reload`. |
| Home | Settings | Change TeaCore and game settings. See [Changing settings](./settings.md). |
| Arena list | Click an arena | Opens that arena. |
| Arena | Skip to the next phase | Same as `/tea arena start`: starts the countdown or the match now. |
| Arena | End the match | Pick the winning team (or player, in games without teams), or end it as a draw. Only works while the match is live. |
| Arena | Release the arena | Sends everyone out and deletes the arena. |
| Arena | Players | Opens the [player list](#players). |
| Arena | Observe | Puts you in the arena in spectator mode without joining it. |
| Arena | Spectate | Joins the arena as a spectator. |

![The arena manager (/tea admin)](/img/tea/arena-manager.png)

Ending, releasing, kicking, making someone a spectator and deleting a map ask "Are you sure?" first.

When you end a match, its players see "A staff member ended the match." The game then announces the result, and stats count it like a normal finish.

## Players

The player list shows participants first, then spectators.

| Click | Does |
| --- | --- |
| Left-click | Kicks the player out of the arena and back to the lobby. |
| Right-click | Moves the player to another arena. Pick the destination from the arenas that have room. |
| Shift + left-click | Makes the player a spectator of the same arena. |
| Shift + right-click | Teleports you to the player (you observe the arena). |

The player gets a message for each of these.

## Maps

The maps menu lists the maps this server has for the game.

| Click | Does |
| --- | --- |
| Left-click | Allocates an arena on that map. |
| Right-click | Opens the map in the [map editor](./adding-a-map.md#editor-tools). Only on a server that runs the game. |
| Shift + left-click | Deletes the map, after you confirm. Same as `/tea map delete`. |
| Shift + right-click | Lists the map's [older versions](./adding-a-map.md#map-versions). Click one to restore it, after you confirm. |

## Arenas on other servers

On a network (see [Network mode](./configuring-network-mode.md)), the arena manager works from any server:

- Actions on an arena run on the server that hosts it.
- Observe, Spectate and "teleport to player" send you through the proxy to that server first, then put you in the arena.
- Moving a player to an arena on another server sends them to that server through the proxy.
- Allocating picks a server that runs the game.

The arena list refreshes every second. Arenas on other servers report their state every 2 seconds, so a change you make there can take up to 2 seconds to show.

## Changing the menus

The arena manager is made of normal [menu files](./menus.md) in `plugins/TeaCore/menus/`:

| File | Menu |
| --- | --- |
| `admin.yml` | Home |
| `admin-arenas.yml` | Arena list |
| `admin-arena.yml` | One arena |
| `admin-players.yml` | Players of an arena |
| `admin-end.yml` | Winner picker |
| `admin-move.yml` | Destination picker for moving a player |
| `admin-maps.yml` | Maps of a game |
| `confirm.yml` | The "Are you sure?" question |

Set `enabled: false` in `admin.yml` to turn the arena manager off; `/tea admin` then says it is off. The `/tea arena` commands keep working either way.
