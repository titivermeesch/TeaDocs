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
| `mvp_uuid` | The player with the most kills, then the most damage. Empty when nobody got a kill. |

`winner_team` and `winner_uuid` are both empty for a draw.

Per player, in `tea_match_players`:

| Column | Meaning |
| --- | --- |
| `match_id` | The match |
| `uuid` | The player |
| `team` | The player's team id, empty in free-for-all games |
| `kills`, `deaths`, `assists` | The player's numbers in that match, from [kill credit](./kill-credit.md) |
| `damage` | Damage the player dealt to other players, in health points (2 per heart) |
| `name` | The player's name at the time (empty for matches recorded before TeaCore stored names) |
| `result` | `win`, `loss`, `draw`, or `left` for a player who left before the match ended |

Players who leave a live match (they quit, use `/leave`, are kicked or made a spectator) keep their row with result `left` and the kills, deaths and assists they had when they left.

TeaCore uses the same database as the rest of its data (`database:` in `config.yml`). With MySQL, every server in the network writes to the same tables, so a lobby shows matches played on any arena server.

## Match recap

When a match ends, every player gets their own summary in chat:

- the result (victory, defeat or draw), the map and how long the match took;
- their kills, deaths, assists and damage, and their place among all players;
- the MVP: the player with the most kills, then the most damage;
- in ranked matches, their new rating and how much it changed.

Turn it off with `features.match-recap: false`, for every game or one game (`features.games.<id>.match-recap`). Fireball shows its own shared scoreboard in chat when the recap is off. The dashboard's match page marks the MVP and shows each player's damage.

## Turning it off

```yaml
# plugins/TeaCore/config.yml
features:
  match-history: true
```

Set `match-history: false` and run `/tea reload` to stop recording. Matches already stored stay, and the `history` menu still shows them. See [Feature switches](./features.md).

## How long matches are kept

TeaCore deletes matches older than `match-history.keep-days` once a day. The default is 90 days; `0` keeps everything. Restart to apply.

```yaml
match-history:
  keep-days: 90
```

Staff can search, inspect and export the history in the [web dashboard](./dashboard.md#pages).

Apart from the daily `keep-days` cleanup, TeaCore doesn't delete rows from these tables. To keep less history, lower `keep-days`.

## The history menu

`plugins/TeaCore/menus/history.yml` shows a player's last 45 matches, newest first: result, game, map, kills, deaths, assists, length and how long ago. The result labels come from `core.history.win`, `core.history.loss`, `core.history.draw` and `core.history.left` in TeaCore's lang file. See [Menus](./menus.md#values-of-the-profile-menus) for every value you can use.

## Upgrading

TeaCore creates both tables on first start after the update (migration `V008`), with no setup from you. The history has no matches from before the update.
