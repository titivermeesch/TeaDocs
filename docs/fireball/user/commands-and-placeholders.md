---
sidebar_position: 5
title: Commands and placeholders
---

# Commands, permissions and placeholders

## Fireball commands

Fireball adds one admin command.

```
/fireball give <player> <type> [amount]
```

Alias: `/fb`. Permission: `fireball.admin` (default: op).

Gives a player tagged fireballs, for testing, events or staff use. `<type>` is a type id: `basic`, `explosive`, `chain`, `frost`, `void`, `lightning`, `cluster`, `homing`, `singularity`, `meteor`, `toxic`. `amount` defaults to 1 and goes up to 576. Anything that does not fit in the player's inventory drops at their feet. Tab completion lists players, types and common amounts.

Examples:

```
/fireball give Steve meteor
/fb give Alex explosive 16
```

Players can throw fireballs only inside a live Fireball match.

## Map commands

Fireball adds these subcommands to TeaCore's `/tea map` (permission `tea.map.admin`). See [Map authoring](./map-authoring.md).

| Command | What it does |
| ------- | ------------ |
| `/tea map teamspawn<i>` | Set team `<i>`'s spawn (`teamspawn0`, `teamspawn1`, ...). One per team. |
| `/tea map chest` | Add a loot chest at the block you stand in. |
| `/tea map chest clear` | Remove all chest points. |
| `/tea map cannon` | Add a cannon at the block you stand in. |
| `/tea map cannon clear` | Remove all cannon points. |
| `/tea map powerup` | Add a power-up drop point. |
| `/tea map powerup clear` | Remove all power-up points. |
| `/tea map shop` | Add a shopkeeper where you stand (facing your direction). |
| `/tea map shop clear` | Remove all shopkeeper points. |

## TeaCore commands you will use

| Command | What it does |
| ------- | ------------ |
| `/play fireball [map]` | Join a Fireball match. |
| `/leave` | Leave the current arena. |
| `/kit` / `/kit fireball` | Open the kit picker. |
| `/stats [player]` | Open the stats menu. |
| `/board` | Hide or show the sidebar for yourself. |
| `/tea arena allocate fireball [map]` | Start a new arena (for testing). |
| `/tea arena start <arenaId>` | Skip the current waiting or countdown timer. |
| `/tea map create fireball <mapId>` | Start authoring a map. |
| `/tea reload` | Reload TeaCore and menu files, including `menus/shop.yml`. |

[TeaCore permissions](../../tea/user/permissions.md) lists the permissions for these.

## Permissions

| Node | Default | Grants |
| ---- | ------- | ------ |
| `fireball.admin` | op | `/fireball give` |

Playing Fireball needs no Fireball permission. Joining, kits and stats use TeaCore's nodes (`tea.arena.play`, `tea.kit`, `tea.stats`).

## Placeholders

These need [PlaceholderAPI](https://www.spigotmc.org/resources/placeholderapi.6245/). They are part of TeaCore's `tea` expansion. For the full list of core placeholders (arena, team, queue, core stats, leaderboards), see [Placeholders](../../tea/user/placeholders.md).

### Live match

| Placeholder | Value |
| ----------- | ----- |
| `%tea_fireball_coins%` | Your shop coins this match. |
| `%tea_fireball_heat%` | Your heat, in percent (0-100). |
| `%tea_fireball_match_kills%` | Your kills this match. `0` outside a match. |
| `%tea_fireball_team_score%` | Your team's kills this match. `0` outside a match. |
| `%tea_fireball_team_score_<team>%` | A given team's kills this match, for example `%tea_fireball_team_score_red%`. |

Team ids are `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, `lime`.

All of these are empty when the player is offline.

### Lifetime stats

| Placeholder | Stat |
| ----------- | ---- |
| `%tea_fireball_kills%` | Kills |
| `%tea_fireball_deaths%` | Deaths |
| `%tea_fireball_assists%` | Assists |
| `%tea_fireball_games_played%` | Games played |
| `%tea_fireball_games_won%` | Games won |
| `%tea_fireball_ended_early%` | Ended early |
| `%tea_fireball_won_ended_early%` | Won (ended early) |

These work on any server in the network, including a lobby without Fireball installed.

Leaderboards use the same names, for example `%tea_top_fireball_kills_1_name%` and `%tea_top_fireball_kills_1_value%` for the top killer.

## Stats

Fireball stores lifetime stats per player in the `fireball_stats` table in the TeaCore database. Fireball creates and updates the table itself.

| Stat (column) | When it goes up |
| ------------- | --------------- |
| Kills (`kills`) | You get credit for a kill. |
| Deaths (`deaths`) | You die. |
| Assists (`assists`) | You helped with a kill someone else got credit for. |
| Games played (`games_played`) | A match you are in ends on time (win, loss or draw). |
| Games won (`games_won`) | Your team wins a match that ended on time. |
| Ended early (`games_abrupt`) | A match you are in ends early because the other team(s) left. |
| Won (ended early) (`games_abrupt_won`) | Your team was the one left in such a match. |

Fireball counts matches that end early apart from games played and won, so players cannot raise their win rate by having opponents leave.

TeaCore also keeps its own cross-game totals (wins, losses, kills, deaths). See [Kill credit](../../tea/user/kill-credit.md) and [Placeholders](../../tea/user/placeholders.md).
