---
sidebar_position: 11
title: Kill credit and assists
---

# Kill credit and assists

TeaCore decides who gets the kill when a player dies in a match, and who gets an assist. The same rules apply to every Tea game, so every game counts kills, deaths, assists, wins and losses the same way.

## The rules

For every player in a live match, TeaCore remembers which enemies hit them and when.

When that player dies:

1. **Kill**: the enemy who hit them **most recently** gets the kill, if that hit was within `combat.kill-credit-window-ms` (default 6 seconds).
2. **Assists**: every **other** enemy who hit them within `combat.assist-window-ms` (default 8 seconds) gets an assist.
3. **Death**: the victim always gets a death, even when nobody gets the kill.

![Kills and assists in the dashboard's kill feed](/img/dashboard-kill-feed.png)

Then TeaCore clears the victim's hit history.

Hits that count:

- Melee hits.
- Projectiles (arrows, snowballs, fireballs, tridents, ...), credited to the player who shot them.
- TNT, credited to the player who lit it.
- Lingering potion clouds, credited to the player who threw the potion.
- Anything the game reports itself (poison, ability damage, a knock into lava, ...).

Hits that never count:

- Hits from teammates.
- Hitting yourself.
- Hits outside the `LIVE` phase (waiting area, countdown, after the match ended).
- Hits from players who are not in the same arena.

### Examples

With the default windows (kill 6s, assist 8s):

| What happened before the death | Kill | Assists |
| --- | --- | --- |
| Alex hit Sam 2s ago | Alex | - |
| Alex hit Sam 5s ago, Jo hit Sam 1s ago | Jo | Alex |
| Alex hit Sam 7s ago, nobody since | nobody | Alex |
| Alex knocked Sam into the void 3s ago | Alex | - |
| Sam fell off on their own, nobody hit them for 10s | nobody | - |

In the third row the last hit is too old for the kill but recent enough for an assist.

TeaCore credits knock-offs, void deaths and fall deaths after a hit to the last attacker, as long as they happen within the kill window.

## Configuration

```yaml
# plugins/TeaCore/config.yml
combat:
  kill-credit-window-ms: 6000
  assist-window-ms: 8000
```

| Key | Default | Meaning |
| --- | --- | --- |
| `combat.kill-credit-window-ms` | `6000` | How long (milliseconds) a hit can give the kill. |
| `combat.assist-window-ms` | `8000` | How long (milliseconds) a hit can give an assist. |

Keep the assist window equal to or longer than the kill window. Run `/tea reload` to apply changes.

## Core stats for every game

TeaCore keeps a set of stats for every player across all Tea games. Kill credit lives in TeaCore, so these stats work for every game without the game counting anything. A game that handles deaths its own way (for example respawning players without a real death screen) reports each death to TeaCore, which counts it like a normal death.

| Stat | Counted when |
| --- | --- |
| Kills | A player gets the kill credit for a death. |
| Deaths | A player dies in a live match. |
| Assists | A player gets an assist. |
| Games played | A match ends while the player is still in it. Draws count. |
| Wins | The match ends and the player won. **In team games, every member of the winning team gets the win.** |
| Losses | The match ends with a winner and the player did not win. |

Notes:

- A player who leaves before the match ends gets no game played, win or loss for it.
- A draw (no winner) counts as a game played for everyone still in the match, with no win and no loss. Games played can be higher than wins plus losses. Win rate is wins divided by games played, so a draw lowers it.
- Kills, deaths and assists are also counted per match. Those show on game sidebars (`<kills>`, `<deaths>`, `<assists>`) and reset when the next match starts.

You can see them in:

- `/stats [player]`: the stats menu shows wins, losses, win rate, kills, deaths, assists and KDR.
- PlaceholderAPI: `%tea_kills%`, `%tea_deaths%`, `%tea_assists%`, `%tea_wins%`, `%tea_losses%`, `%tea_games_played%`, `%tea_winrate%`, `%tea_kdr%`, the per-match `%tea_match_kills%` / `%tea_match_deaths%` / `%tea_match_assists%`, and leaderboards such as `%tea_top_core_kills_1_name%`. See [PlaceholderAPI](./placeholders.md).

Games can still keep their own, more detailed stats (for example Ascend's evolves). Those are separate from the core stats above.

## Upgrading

TeaCore adds the assists column to its `tea_core_stats` table on first start after the update (migration `V007`). Existing players start at 0 assists. You don't need to do anything.

Older TeaCore versions counted a draw as a loss. TeaCore doesn't change totals recorded before the update.
