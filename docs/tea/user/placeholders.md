---
sidebar_position: 8
title: PlaceholderAPI
---

# PlaceholderAPI placeholders

TeaCore ships a single [PlaceholderAPI](https://www.spigotmc.org/resources/placeholderapi.6245/) expansion with the identifier `tea`. Every placeholder is reached as `%tea_<...>%`. PlaceholderAPI is a soft dependency: install it on any server where you want these placeholders rendered (scoreboards, tab lists, holograms, chat formats). If it isn't installed the placeholders simply aren't registered - TeaCore still works.

No setup is required beyond installing PlaceholderAPI; the `tea` expansion registers itself when TeaCore starts.

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

## Core stats

TeaCore records game-agnostic stats for every game built on it, so these totals work network-wide without each game implementing its own counters.

| Placeholder | Description |
| --- | --- |
| `%tea_wins%` | Matches won |
| `%tea_losses%` | Matches lost |
| `%tea_games_played%` | Matches played |
| `%tea_kills%` | Kills (across all games) |
| `%tea_deaths%` | Deaths (across all games) |
| `%tea_winrate%` | Win percentage, one decimal (e.g. `42.9`) |
| `%tea_kdr%` | Kill/death ratio, two decimals |

## Current arena, team, and queue

These resolve to an empty string when the player isn't in an arena or queue.

| Placeholder | Description |
| --- | --- |
| `%tea_in_arena%` | `true` if the player is in an arena |
| `%tea_arena_id%` | Short arena id |
| `%tea_arena_game%` | Game id of the current arena |
| `%tea_arena_map%` | Map id of the current arena |
| `%tea_arena_state%` | Arena state (`WAITING`, `COUNTDOWN`, `LIVE`, `ENDING`, ...) |
| `%tea_arena_players%` | Participants in the arena |
| `%tea_arena_max_players%` | Arena capacity |
| `%tea_arena_time_left%` | Seconds left in the current phase |
| `%tea_team%` | The player's team display-name key |
| `%tea_team_id%` | The player's team id |
| `%tea_queue_game%` | Game the player is queued for |
| `%tea_queue_position%` | Position in the queue (1-based) |
| `%tea_queue_size%` | Size of that queue |

## Per-game stats

Every game that registers a stats schema gets its columns exposed automatically as `%tea_<gameId>_<stat>%`, where `<stat>` is the column label lower-cased with spaces turned into underscores. For Ascend, whose stat columns are Kills, Deaths, Evolves, Games played, and Games won:

```
%tea_ascend_kills%
%tea_ascend_deaths%
%tea_ascend_evolves%
%tea_ascend_games_played%
%tea_ascend_games_won%
```

This works on any server in the fleet - including a lobby with no game jar loaded - because the schema is read from the shared database.

## Ascend's extra placeholders

On top of its stat columns, Ascend registers a few of its own:

| Placeholder | Description |
| --- | --- |
| `%tea_ascend_evolutions%` | Lifetime evolutions |
| `%tea_ascend_stage%` | Current evolution stage in a live match (1-based; `0` if not playing) |
| `%tea_ascend_stage_index%` | Same, 0-based |
| `%tea_ascend_stage_max%` | Number of evolution stages configured |

See [adding placeholders from a game](../dev/extending-with-a-new-game.md#placeholders) to register your own.
