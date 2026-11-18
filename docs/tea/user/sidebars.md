---
sidebar_position: 8
title: Sidebars
---

# Sidebars

TeaCore draws the scoreboard sidebar for every player. There are two kinds:

- **The lobby sidebar**: shown on lobby servers to players who are not in an arena. Layout in `plugins/TeaCore/sidebar.yml`.
- **Game sidebars**: shown to players inside an arena. Each game ships its own layout in its own config (a `sidebar:` section). TeaCore renders it and fills in the values.

Sidebars refresh twice a second. All text is MiniMessage with the [theme tags](./theme-and-i18n.md) (`<primary>`, `<secondary>`, `<accent>`, `<highlight>`, `<muted>`, `<success>`, `<error>`, `<warning>`).

## The lobby sidebar

TeaCore creates `plugins/TeaCore/sidebar.yml` on first start:

```yaml
lobby:
  enabled: true
  title: "<primary><bold>Tea</bold></primary>"
  lines:
    - ""
    - "<secondary>Player:</secondary> <highlight><player></highlight>"
    - "<secondary>Online:</secondary> <highlight><online></highlight>"
    - ""
    - "<secondary>Wins:</secondary> <accent>%tea_wins%</accent>"
    - "<secondary>Kills:</secondary> <accent>%tea_kills%</accent>"
    - ""
    - "<muted>/play to join a game</muted>"
```

| Key | Meaning |
| --- | --- |
| `enabled` | `false` turns the lobby sidebar off. |
| `title` | The sidebar title. |
| `lines` | Lines, top to bottom. `""` is a blank line. |

Tags you can use in the lobby sidebar:

| Tag | Value |
| --- | --- |
| `<player>` | The viewer's name |
| `<online>` | Players online on this server |

Anything else comes from PlaceholderAPI, for example `%tea_wins%`, `%tea_kdr%` or `%tea_top_core_wins_1_name%`. See [PlaceholderAPI](./placeholders.md).

The lobby sidebar only shows when:

- `lobby.enabled: true` in `config.yml` (it is a lobby server),
- `features.sidebar` and `features.lobby-sidebar` are both `true`,
- `lobby.enabled` in `sidebar.yml` is `true`,
- the player is not in an arena, and has not hidden it with `/board`.

Edit the file and run `/tea reload` to apply changes. When a TeaCore update adds keys to `sidebar.yml`, TeaCore merges them into your file on start and leaves your changes alone.

## Game sidebars

Each game decides what its sidebar looks like and ships a default layout in its own config file. The game's docs say which file. The layout has one list of lines per arena phase:

```yaml
sidebar:
  enabled: true
  title: "<primary><bold>MyGame"
  waiting:
    - ""
    - "<secondary>Map: <highlight><map>"
    - "<secondary>Players: <highlight><players>/<max-players>"
    - "<muted>Waiting for <waiting-for> more..."
  countdown:
    - ""
    - "<secondary>Map: <highlight><map>"
    - "<success>Starting in <seconds>s"
  live:
    - "<secondary>Time left: <accent><time>"
    - "<secondary>Kit: <highlight><kit>"
    - ""
    - "@players: <player-name> <muted><player-kills> kills"
    - ""
    - "<secondary>K/D/A: <accent><kills>/<deaths>/<assists>"
  ended:
    - ""
    - "<highlight><winner> <success>wins!"
```

### Phases

TeaCore picks the list that matches the arena's state:

| Phase list | Arena states |
| --- | --- |
| `waiting` | `ALLOCATING`, `WAITING` |
| `countdown` | `COUNTDOWN` |
| `starting` | `STARTING` |
| `live` | `LIVE` |
| `ended` | `ENDING`, `RESETTING`, `RELEASED` |

Fallbacks when a list is missing:

- `starting` missing: uses `countdown`, then `live`.
- Any other list missing: uses `live`.
- `live` missing too: the sidebar is empty.

The smallest working layout is a `title` and a `live` list.

### Built-in tags

Every game sidebar can use these tags. Values are for the player looking at the sidebar.

| Tag | Value |
| --- | --- |
| `<player>` | Viewer's name |
| `<game>` | Game id, e.g. `mygame` |
| `<game-name>` | Game display name, translated |
| `<arena>` | Short arena id (first 8 characters) |
| `<map-id>` | Map id, `-` if none |
| `<map>` | Map display name (falls back to the map id) |
| `<phase>` | Arena state in lower case: `waiting`, `countdown`, `starting`, `live`, `ending`, ... |
| `<players>` | Participants in the arena |
| `<spectators>` | Spectators in the arena |
| `<min-players>` | Minimum players to start |
| `<min>` | Same as `<min-players>` |
| `<max-players>` | Arena capacity |
| `<waiting-for>` | Players still needed to reach the minimum (never below 0) |
| `<seconds>` | Seconds left in the current phase |
| `<time>` | Same, as `m:ss` (e.g. `4:05`) |
| `<team>` | Viewer's team name (coloured, translated), `-` if no team |
| `<team-id>` | Viewer's team id, `-` if no team |
| `<kit>` | Viewer's selected kit for this game, `-` if none |
| `<kills>` | Viewer's kills this match |
| `<deaths>` | Viewer's deaths this match |
| `<assists>` | Viewer's assists this match |
| `<winner>` | Winning player or team name once the match ended, `-` before that |

TeaCore's kill credit counts kills, deaths and assists; see [Kill credit and assists](./kill-credit.md). They reset when the next match starts.

**Games add their own tags** (coins, score, lives, stage, ...). Each game's docs list them. A game can also override a built-in tag with its own value.

TeaCore prints a tag that nothing fills in as-is, so a typo like `<map-nmae>` shows up as typed on the board.

### Repeated rows: `@players:` and `@teams:`

A line that starts with `@players:` is repeated once for every participant. A line that starts with `@teams:` is repeated once for every team. The text after the prefix is the row template.

```yaml
live:
  - "@teams: <team-name> <muted>(<team-size>)</muted> <accent><team-score>"
  - ""
  - "@players: <player-name> <muted><player-health> hp"
```

Columns in a `@players:` row (one row per participant who is online):

| Tag | Value |
| --- | --- |
| `<player-name>` | That player's name |
| `<player-you>` | `true` on the viewer's own row, otherwise `false` |
| `<player-kills>` | That player's kills this match |
| `<player-deaths>` | That player's deaths this match |
| `<player-assists>` | That player's assists this match |
| `<player-team>` | That player's team name, `-` if no team |
| `<player-health>` | That player's health, rounded up |

Columns in a `@teams:` row (one row per team in the arena):

| Tag | Value |
| --- | --- |
| `<team-name>` | Team name (coloured, translated) |
| `<team-id>` | Team id, e.g. `red` |
| `<team-size>` | Team members currently in the arena |
| `<team-score>` | Sum of the members' kills this match, unless the game provides its own score |

All the normal built-in tags work in rows too. Games can add columns of their own and decide the row order (by default, rows follow join order). `@players:` and `@teams:` only work in game sidebars, not in the lobby sidebar.

Minecraft shows at most 15 sidebar lines, so keep repeated rows for small arenas.

### PlaceholderAPI in lines

If PlaceholderAPI is installed, `%placeholders%` work in every title and line, in both lobby and game sidebars:

```yaml
live:
  - "<secondary>Rank: %luckperms_prefix%"
  - "<secondary>Lifetime wins: <accent>%tea_wins%"
```

PlaceholderAPI runs before TeaCore applies the theme tags, so placeholder output can contain MiniMessage tags.

## Turning sidebars off

| To turn off | Do this |
| --- | --- |
| Every sidebar | `features.sidebar: false` in `config.yml` |
| The lobby sidebar | `features.lobby-sidebar: false`, or `lobby.enabled: false` in `sidebar.yml` |
| One game's sidebar | `features.games.<id>.sidebar: false`, or `enabled: false` in the game's `sidebar:` section |
| Your own sidebar (as a player) | `/board` |

See [Feature switches](./features.md) for details.

## Which sidebar wins

A player sees at most one sidebar. When more than one applies, the game sidebar wins over the lobby sidebar. A game can also register its own sidebar for special cases; the game decides how it ranks.
