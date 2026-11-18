---
sidebar_position: 12
title: Match history
---

# Match history

TeaCore records every finished match of every Tea game in its database. Players see their recent matches in the `history` menu (`/profile`, then Match history). Games and other plugins can read the same data through the [API](../dev/extending-with-a-new-game.md#match-history).

## What TeaCore stores

TeaCore writes one row when a match ends, plus one row per player still in the arena at that moment.

Per match, in `tea_match_history`:

| Column | Meaning |
| --- | --- |
| `match_id` | Unique id of the match |
| `game_id` | Game id |
| `map_id` | Map id, empty if the arena had no map |
| `server_id` | Id of the server that ran the match |
| `started_at` | When the match went `LIVE` |
| `ended_at` | When the match ended |
| `duration_seconds` | Length of the `LIVE` phase |
| `winner_team` | Winning team id, for team results |
| `winner_uuid` | Winning player, for solo results. For team results, one member of the winning team. |

`winner_team` and `winner_uuid` are both empty for a draw.

Per player, in `tea_match_players`:

| Column | Meaning |
| --- | --- |
| `match_id` | The match |
| `uuid` | The player |
| `team` | The player's team id, empty in free-for-all games |
| `kills`, `deaths`, `assists` | The player's numbers in that match, from [kill credit](./kill-credit.md) |
| `result` | `win`, `loss` or `draw` |

A player who left before the match ended has no row in `tea_match_players`.

TeaCore uses the same database as the rest of its data (`database:` in `config.yml`). With MySQL, every server in the network writes to the same tables, so a lobby shows matches played on any arena server.

## Turning it off

```yaml
# plugins/TeaCore/config.yml
features:
  match-history: true
```

Set `match-history: false` and run `/tea reload` to stop recording. Matches already stored stay, and the `history` menu still shows them. See [Feature switches](./features.md).

TeaCore never deletes rows from these tables. If they grow too large for you, delete old rows from `tea_match_history` and the matching `tea_match_players` rows yourself.

## The history menu

`plugins/TeaCore/menus/history.yml` shows a player's last 45 matches, newest first: result, game, map, kills, deaths, assists, length and how long ago. The result labels come from `core.history.win`, `core.history.loss` and `core.history.draw` in TeaCore's lang file. See [Menus](./menus.md#values-of-the-profile-menus) for every value you can use.

## Upgrading

TeaCore creates both tables on first start after the update (migration `V008`). The history has no matches from before the update. You don't need to do anything.
