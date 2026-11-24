---
sidebar_position: 12
title: Ranked play
---

# Ranked play

Players who want their matches to count join with `/play <game> ranked`. Each player has a rating per game. Everyone starts at 1000; winning raises it and losing lowers it, by more when you beat stronger players.

## How matches form

- An arena takes its mode from its first player: ranked when that player used `/play <game> ranked`, casual otherwise. Casual players never land in a ranked arena, and ranked players never land in a casual one.
- A ranked arena takes players whose rating is within 150 of the arena's average. Every 10 seconds the arena waits, the window grows by 50, up to 600, so a quiet server still fills its matches.
- On a network the lobby queues ranked players the same way and routes them to a ranked arena that fits.

## How ratings change

When a ranked match ends, everyone who was in it when it went live gets a new rating (Elo):

- Teams count as one side, rated at their players' average. In a game without teams, each player is a side.
- A side scores 1 for a win, 0 for a loss and 0.5 for a draw, against the average rating of everyone else.
- The change is `k-factor x (score - expected score)`, rounded. With the default `k-factor` of 32, two players at 1000 move 16 points each.
- Leaving before the end counts as a loss.

Players see the change in chat at the end of the match, for example `+16 rating (1016)`.

## Where ratings show

| Where | What |
| --- | --- |
| `/leaderboard <game>` (aliases `/lb`, `/top`) | The top 45 players in a menu, or the top 10 in chat when menus are off. |
| `/stats` | A "Ranked" line per game with the rating, place, wins and losses. |
| `%tea_rating_<game>%` | The player's rating (1000 before their first ranked match). |
| `%tea_rank_<game>%` | The player's place on the leaderboard, or `-` without ranked matches. |
| [Web dashboard](./dashboard.md) | The Leaderboard page, top 100 per game. |

The leaderboard menu is `plugins/TeaCore/menus/leaderboard.yml`. Each entry has `{rank}`, `{player}`, `{uuid}`, `{rating}`, `{games}`, `{wins}` and `{losses}`.

## Settings

```yaml
features:
  ranked: true          # or per game: features.games.<id>.ranked

ranked:
  start-rating: 1000
  k-factor: 32          # most points one match can move
  range: 150            # starting rating window of a ranked arena
  widen-per-10s: 50     # window growth while the arena waits
  max-range: 600
```

Ratings live in the `tea_ratings` table. On a network, give every server the same MySQL database so they share ratings.

## Permissions

| Permission | Default | Allows |
| --- | --- | --- |
| `tea.ranked` | everyone | `/play <game> ranked` |
| `tea.leaderboard` | everyone | `/leaderboard` |
