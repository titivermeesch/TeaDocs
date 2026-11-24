---
sidebar_position: 10
title: PlaceholderAPI
---

# PlaceholderAPI placeholders

TeaCore ships a single [PlaceholderAPI](https://www.spigotmc.org/resources/placeholderapi.6245/) expansion with the identifier `tea`. Each placeholder has the form `%tea_<...>%`. PlaceholderAPI is a soft dependency: install it on any server where you want these placeholders rendered (scoreboards, tab lists, holograms, chat formats). Without it, TeaCore still runs and doesn't register the placeholders.

You only need to install PlaceholderAPI; the `tea` expansion registers itself when TeaCore starts. To turn the expansion off, set `features.placeholders: false` in `config.yml` and restart (see [Feature switches](./features.md)).

TeaCore's own [sidebars](./sidebars.md) and [menus](./menus.md) also resolve `%placeholders%` in their lines.

## Player and fleet placeholders

| Placeholder | Description |
| --- | --- |
| `%tea_name%` | Player name |
| `%tea_displayname%` | Player display name (falls back to the name when offline) |
| `%tea_uuid%` | Player UUID |
| `%tea_balance%` | Vault balance, raw (e.g. `1234.50`) |
| `%tea_balance_formatted%` | Vault balance, formatted by the economy provider |
| `%tea_version%` | TeaCore version |
| `%tea_server%` / `%tea_server_id%` | This server's id |
| `%tea_standalone%` | `true` on a standalone server, `false` in a fleet |
| `%tea_online%` | Players online on this server |
| `%tea_game_count%` | Games registered on this server |
| `%tea_map_count%` | Maps registered on this server |
| `%tea_arenas_total%` | Arenas running across the network |
| `%tea_players_in_games%` | Players in an arena across the network |

On a standalone server, "across the network" means this server.

## Core stats

TeaCore records game-agnostic stats for every game built on it, so these totals work network-wide and games don't need their own counters. Kills, deaths and assists come from TeaCore's [kill credit](./kill-credit.md); in team games every member of the winning team gets the win.

| Placeholder | Description |
| --- | --- |
| `%tea_wins%` | Matches won |
| `%tea_losses%` | Matches lost |
| `%tea_games_played%` | Matches played |
| `%tea_kills%` | Kills (across all games) |
| `%tea_deaths%` | Deaths (across all games) |
| `%tea_assists%` | Assists (across all games) |
| `%tea_winrate%` | Win percentage, one decimal (e.g. `42.9`) |
| `%tea_kdr%` | Kill/death ratio, two decimals |

## Ranked

| Placeholder | Description |
| --- | --- |
| `%tea_rating_<game>%` | The player's [ranked](./ranked.md) rating in that game, e.g. `%tea_rating_fireball%`. `1000` before their first ranked match. |
| `%tea_rank_<game>%` | The player's place on that game's leaderboard, or `-` without ranked matches. Refreshed every minute. |

## Current arena, team, and queue

These resolve to an empty string when the player isn't in an arena or queue.

| Placeholder | Description |
| --- | --- |
| `%tea_in_arena%` | `true` if the player is in an arena |
| `%tea_arena_id%` | Short arena id |
| `%tea_arena_game%` | Game id of the current arena |
| `%tea_arena_game_name%` | Game display name, translated |
| `%tea_arena_map%` | Map id of the current arena |
| `%tea_arena_map_id%` | Map id (same as above) |
| `%tea_arena_map_name%` | Map display name |
| `%tea_arena_state%` | Arena state (`WAITING`, `COUNTDOWN`, `LIVE`, `ENDING`, ...) |
| `%tea_arena_phase%` | Arena state in lower case (`waiting`, `live`, ...) |
| `%tea_arena_players%` | Participants in the arena |
| `%tea_arena_spectators%` | Spectators in the arena |
| `%tea_arena_min_players%` | Minimum players to start |
| `%tea_arena_max_players%` | Arena capacity |
| `%tea_arena_waiting_for%` | Players still needed to start |
| `%tea_arena_time_left%` | Seconds left in the current phase |
| `%tea_arena_seconds%` | Seconds left in the current phase (never below 0) |
| `%tea_arena_time%` | Time left in the current phase as `m:ss` |
| `%tea_arena_winner%` | Winning player or team name after the match ended, `-` before |
| `%tea_team%` | The player's team name, rendered in their language with its colour (e.g. `Red`) |
| `%tea_team_id%` | The player's team id (e.g. `red`) |
| `%tea_kit%` | Selected kit in the current arena's game, `-` if none |
| `%tea_match_kills%` | Kills in the current match |
| `%tea_match_deaths%` | Deaths in the current match |
| `%tea_match_assists%` | Assists in the current match |
| `%tea_queue_game%` | Game the player is queued for |
| `%tea_queue_position%` | Position in the queue (1-based) |
| `%tea_queue_size%` | Size of that queue |

Every built-in [sidebar tag](./sidebars.md#built-in-tags) is also available as `%tea_arena_<tag>%`, with `-` in the tag name written as `_`. For example `<waiting-for>` is `%tea_arena_waiting_for%`. The match placeholders need the player to be online.

## Kits and achievements

Replace `<game>` with a game id, e.g. `%tea_kit_mygame%`.

| Placeholder | Description |
| --- | --- |
| `%tea_kit_<game>%` | The player's selected kit for that game (works outside an arena), `-` if none |
| `%tea_kits_unlocked_<game>%` | Kits the player can use in that game: free kits plus bought ones |
| `%tea_achievements_unlocked%` | Achievements unlocked, all games together |
| `%tea_achievements_unlocked_<game>%` | Achievements unlocked in that game |
| `%tea_achievements_total_<game>%` | Achievements that game has |

`%tea_kit_<game>%` needs the player to be online. The `<game>` must be registered on this server.

## Per-game counters

Live numbers for one game. Replace `<id>` with the game id. These work for any game whose plugin is installed on this server; the counts cover the whole network.

| Placeholder | Description |
| --- | --- |
| `%tea_game_<id>_name%` | Game display name (server default language) |
| `%tea_game_<id>_players%` | Players in that game's arenas |
| `%tea_game_<id>_arenas%` | Arenas of that game |
| `%tea_game_<id>_arenas_<state>%` | Arenas of that game in one state, e.g. `_arenas_waiting`, `_arenas_live` |
| `%tea_game_<id>_queue%` | Players queued for that game |
| `%tea_game_<id>_maps%` | Maps registered for that game on this server |

Example for a lobby hologram:

```
%tea_game_mygame_name%: %tea_game_mygame_players% playing, %tea_game_mygame_queue% in queue
```

These do not need a player, so they work in holograms and global displays.

## Leaderboards

TeaCore keeps top-10 tables for every stat in memory and refreshes them in the background.

```
%tea_top_<board>_<position>_name%
%tea_top_<board>_<position>_value%
```

- `<position>` is 1 to 10.
- `_name` gives the player name, `_value` the number.
- An empty place shows `-` for the name and `0` for the value.

Boards:

| Board | Ranks by |
| --- | --- |
| `core_wins` | Core wins |
| `core_losses` | Core losses |
| `core_games_played` | Core games played |
| `core_kills` | Core kills |
| `core_deaths` | Core deaths |
| `core_assists` | Core assists |
| `<gameId>_<stat>` | A game's stat column, same names as the [per-game stats](#per-game-stats) below |

Examples:

```
%tea_top_core_wins_1_name%        -> Steve
%tea_top_core_wins_1_value%       -> 128
%tea_top_core_kills_3_name%       -> the third-best killer
%tea_top_ascend_games_won_1_name% -> best Ascend player by games won
```

A top-5 hologram:

```
1. %tea_top_core_wins_1_name% - %tea_top_core_wins_1_value%
2. %tea_top_core_wins_2_name% - %tea_top_core_wins_2_value%
3. %tea_top_core_wins_3_name% - %tea_top_core_wins_3_value%
4. %tea_top_core_wins_4_name% - %tea_top_core_wins_4_value%
5. %tea_top_core_wins_5_name% - %tea_top_core_wins_5_value%
```

Leaderboards refresh every 60 seconds. To change that, edit `leaderboards.refresh-seconds` in `config.yml` and restart (minimum 10):

```yaml
leaderboards:
  refresh-seconds: 120
```

They read from the shared database, so they show the same ranking on every server.

## Per-game stats

For each game that registers a stats schema, TeaCore exposes its columns as `%tea_<gameId>_<stat>%`, where `<stat>` is the column label lower-cased with spaces turned into underscores. For Ascend, whose stat columns are Kills, Deaths, Evolves, Games played, and Games won:

```
%tea_ascend_kills%
%tea_ascend_deaths%
%tea_ascend_evolves%
%tea_ascend_games_played%
%tea_ascend_games_won%
```

This works on any server in the fleet, including a lobby with no game jar loaded, because TeaCore reads the schema from the shared database.

Three short names work for any game that has the matching column: `wins` for `games_won`, and `played` or `games` for `games_played`. So `%tea_ascend_wins%` equals `%tea_ascend_games_won%`, and `%tea_top_ascend_wins_1_name%` equals `%tea_top_ascend_games_won_1_name%`. If a game has a column named `wins`, TeaCore uses that column.

## Ascend's extra placeholders

On top of its stat columns, Ascend registers a few of its own:

| Placeholder | Description |
| --- | --- |
| `%tea_ascend_evolutions%` | Lifetime evolutions |
| `%tea_ascend_stage%` | Current evolution stage in a live match (1-based; `0` if not playing) |
| `%tea_ascend_stage_index%` | Same, 0-based |
| `%tea_ascend_stage_max%` | Number of evolution stages configured |

See [adding placeholders from a game](../dev/extending-with-a-new-game.md#13-placeholders) to register your own.
