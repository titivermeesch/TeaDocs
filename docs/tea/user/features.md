---
sidebar_position: 7
title: Feature switches
---

# Feature switches

You can turn off TeaCore's optional features without removing anything: sidebars, inventory menus, the PlaceholderAPI expansion, the queue bossbar, the lobby hotbar and match history. One block in `plugins/TeaCore/config.yml` controls them all.

**Everything is on by default.** A fresh install shows sidebars, uses the YAML menus, registers the `%tea_...%` placeholders (when PlaceholderAPI is installed), shows the queue bossbar, gives lobby players their hotbar items and records match history. Use this page to turn something off.

## The `features:` block

```yaml
# plugins/TeaCore/config.yml
features:
  sidebar: true
  lobby-sidebar: true
  menus: true
  placeholders: true
  queue-bossbar: true
  lobby-hotbar: true
  match-history: true
  match-recap: true
  map-editor-tools: true
  spectator-tools: true
  map-voting: true
  waiting-protection: true
  kit-item: true
  leave-item: true
  ranked: true
  quests: true
  games: {}
```

| Key | Default | What it controls | Applied |
| --- | --- | --- | --- |
| `sidebar` | `true` | Every TeaCore sidebar: the lobby sidebar and every game's in-game sidebar. `false` hides all of them. | On `/tea reload` |
| `lobby-sidebar` | `true` | Only the lobby sidebar (layout in `sidebar.yml`). Has no effect unless `lobby.enabled: true`. | On `/tea reload` |
| `menus` | `true` | Every YAML inventory menu (`menus/*.yml` in TeaCore and in games). With `false`, `/kit` and `/stats` fall back to TeaCore's built-in GUIs, `/play` with no arguments shows its usage line and `/profile` runs `/stats`. | On `/tea reload` |
| `placeholders` | `true` | The `tea` PlaceholderAPI expansion. Only matters when PlaceholderAPI is installed. | Restart only |
| `queue-bossbar` | `true` | The bossbar that shows a player's queue position while they wait for a match. | Immediately (checked every tick) |
| `lobby-hotbar` | `true` | The [lobby hotbar](./lobby.md#lobby-hotbar) items (`lobby.hotbar.items`). Has no effect unless `lobby.enabled: true`. | On `/tea reload`, for players who then join, respawn or leave an arena |
| `match-history` | `true` | Recording finished matches for the [match history](./match-history.md) menu. `false` stops recording new matches; matches already stored stay. | On `/tea reload` |
| `match-recap` | `true` | A personal summary in chat for every player when a match ends: result, their kills, deaths, assists, damage and place, the MVP, and rating changes in ranked. See [Match history](./match-history.md#match-recap). | Right away |
| `quests` | `true` | [Daily and weekly quests](./quests.md) and `/quests`. | Within a second |
| `ranked` | `true` | [Ranked play](./ranked.md): `/play <game> ranked`, ratings and `/leaderboard`. Can be set per game. | From the next `/play` |
| `map-voting` | `true` | [Map voting](./map-voting.md) while players wait for a match. Can be set per game. | From the next arena that opens |
| `waiting-protection` | `true` | Players waiting for a match take no damage and don't get hungry, until the match starts. Can be set per game. | Immediately |
| `kit-item` | `true` | Players waiting for a match get a hotbar item that opens the game's kit picker. Only for games with kits. Set the item and slot under `kit-item` (`material`, default `NETHER_STAR`; `hotbar-slot`, default `0`). Can be set per game. | For players joining after the change |
| `leave-item` | `true` | Players waiting for a match get a hotbar item that leaves the arena, like `/leave`. Set the item and slot under `leave-item` (`material`, default `RED_BED`; `hotbar-slot`, default `8`). Can be set per game. | For players joining after the change |
| `spectator-tools` | `true` | [Spectator tools](./spectators.md): ghost mode, the teleporter, play again and leave items, and the spectator sidebar. Can be set per game. | Within half a second |
| `map-editor-tools` | `true` | The [map editor tools](./adding-a-map.md#editor-tools): the tool hotbar and the particle markers while you edit a map. `/tea map` commands work either way. | On `/tea reload`, from the next `/tea map create` or `edit` |
| `games` | `{}` | Per-game overrides, see below. | On `/tea reload` |

A missing key counts as `true`. If a later TeaCore version adds a switch, that feature stays on until you turn it off.

These switches don't affect the Map Setup sidebar you see while you author a map.

## Per-game overrides

Under `features.games.<gameId>` you can override a switch for one game. The game id is the one you use with `/play <game>`.

```yaml
features:
  sidebar: true
  menus: true
  games:
    mygame:
      sidebar: false    # no in-game sidebar for mygame, other games keep theirs
    othergame:
      menus: false      # othergame's own menus are off
```

TeaCore checks two switches per game:

- `sidebar`: the in-game sidebar for players in that game's arenas.
- `menus`: menus shipped by that game's plugin (menu ids of the form `<plugin>:<file>`, see [Menus](./menus.md#menu-ids)). TeaCore matches the lower-cased plugin name, so this works when the game's plugin name equals its game id.

A per-game value wins over the server-wide one, in both directions. With `sidebar: false` server-wide and `games.fireball.sidebar: true`, only Fireball shows its sidebar.

`lobby-sidebar`, `placeholders`, `queue-bossbar`, `lobby-hotbar`, `match-history` and `map-editor-tools` are server-wide only. Putting them under `games.<id>` has no effect.

## Per-file `enabled:` flags

Each layout file also has its own switch. Use it to turn off one sidebar or one menu instead of a whole feature.

| Where | Key | Effect of `false` |
| --- | --- | --- |
| `plugins/TeaCore/sidebar.yml` | `lobby.enabled` | No lobby sidebar. |
| A game's config, `sidebar:` section | `sidebar.enabled` | No in-game sidebar for that game. Check the game's docs for the exact file. |
| `plugins/TeaCore/menus/kits.yml` | `enabled` | `/kit` uses the built-in kit picker. |
| `plugins/TeaCore/menus/stats.yml` | `enabled` | `/stats` uses the built-in stats viewer. |
| `plugins/TeaCore/menus/play.yml` | `enabled` | `/play` with no arguments shows its usage line. |
| `plugins/TeaCore/menus/profile.yml` | `enabled` | `/profile` runs `/stats`. |
| Any other menu file | `enabled` | Players can't open that menu. Buttons that open it do nothing. |

A sidebar or menu shows only if **all** switches that apply to it are on: the server-wide feature, the per-game override (if any) and the file's own `enabled:`.

## `/board`: per-player sidebar toggle
Players can hide their own sidebar with `/board` (alias `/sidebar`). Running it again shows it again.

- Permission: `tea.board`, granted to everyone by default. See [Permissions](./permissions.md).
- It hides both the lobby sidebar and in-game sidebars for that player.
- TeaCore keeps the choice in memory. It survives relogs but resets when the server restarts.
- It does not hide the Map Setup sidebar. That sidebar always wins over lobby and game sidebars while you edit a map.

## Reloading

After editing `config.yml`, run:

```
/tea reload
```

This re-reads `features:` (except `placeholders`, which needs a restart), `sidebar.yml` and every menu file.

## See also

- [Sidebars](./sidebars.md): the lobby sidebar and game sidebars.
- [Menus](./menus.md): editing `menus/*.yml`.
- [PlaceholderAPI](./placeholders.md): every `%tea_...%` placeholder.
- [Lobby](./lobby.md): the lobby hotbar and game selector.
- [Match history](./match-history.md): what TeaCore records per match.
