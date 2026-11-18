---
sidebar_position: 9
title: Menus
---

# Menus

TeaCore defines its inventory menus in YAML. You can change the title, size, layout, every item, its text and what clicking it does without a rebuild.

TeaCore ships these menus in `plugins/TeaCore/menus/`:

| File | Menu id | Opened by | Shows |
| --- | --- | --- | --- |
| `play.yml` | `play` | `/play` with no arguments, the lobby Play item | Game selector. Left-click a game to play, right-click to pick a map. |
| `play-maps.yml` | `play-maps` | Right-click on a game in `play` | Quick join, the game's maps, and a Live arenas button. Needs the `game` value. |
| `arenas.yml` | `arenas` | Live arenas button, right-click on a map | Live arenas of a game, or of one of its maps. Left-click to join, right-click to spectate. Refreshes every second. |
| `profile.yml` | `profile` | `/profile`, the lobby Profile item, the head in `play` | Links to stats, achievements, match history and kits. |
| `profile-kits.yml` | `profile-kits` | Kits button in `profile` | Pick a game, then open its `kits` menu. |
| `achievements.yml` | `achievements` | Achievements button in `profile` | Achievements of every game, locked or unlocked. |
| `history.yml` | `history` | Match history button in `profile` | Your recent matches, newest first. See [Match history](./match-history.md). |
| `kits.yml` | `kits` | `/kit <game>`, `/kit` inside an arena, games' kit items, `profile-kits` | Kits of one game. |
| `stats.yml` | `stats` | `/stats [player]`, Stats button in `profile` | Core stats and per-game stats. |

Every default menu has a Close button. Menus you reach from another menu also have a Back button.

The play and profile menus show each game's name and icon. To change them, or to fill them in on a lobby server that does not run the game's plugin, see [Game names and icons](./lobby.md#game-display).

Games can ship their own menu files in their own data folder (for example `plugins/MyGame/menus/shop.yml`). They use the same format. Check each game's docs for its menus and the values they offer.

TeaCore writes the files on first start. It never overwrites your copy, so to get a newer default after an update, rename or delete your file and restart.

After editing, run `/tea reload`.

## How a menu file works

A menu is a chest inventory. You draw it with a **pattern**: one string per row, one character per slot. Then you say what each character means:

- **`items`**: fixed items, like borders, close buttons, page buttons.
- **`lists`**: an area TeaCore fills with one item per entry from a **source** (one per kit, one per game, ...). If there are more entries than slots, the menu gets pages.

A character that is not defined in `items` or `lists` (for example a space) is an empty slot.

### Top-level keys

| Key | Default | Meaning |
| --- | --- | --- |
| `enabled` | `true` | `false` turns this menu off. |
| `permission` | none | Permission a player needs to open this menu, from any button, item, command or game. Empty or missing: anyone. |
| `title` | `""` | Inventory title. Supports `{values}`, theme tags and `%papi%`. |
| `rows` | `3` | Number of rows, 1 to 6. |
| `refresh-ticks` | `0` | Re-render the menu every N ticks while it is open (`0` = never). Checked every 10 ticks, so use multiples of 10. |
| `pattern` | | One string per row, up to 9 characters each. |
| `items` | | Fixed items, keyed by pattern character. |
| `lists` | | List areas, keyed by pattern character. |

### Item keys

These keys work for fixed items, for a list's `item` template, and for a list's `empty` item.

| Key | Meaning |
| --- | --- |
| `material` | Bukkit material name, e.g. `DIAMOND_SWORD`. Can use `{values}`. Unknown or missing: `STONE`. |
| `name` | Display name. Supports `{values}`, theme tags and `%papi%`. |
| `lore` | List of lore lines. Same as `name`. |
| `amount` | Stack size, 1 to 64. Can use `{values}`. |
| `glow` | Enchantment glint when the value is true, e.g. `glow: "{selected}"`. |
| `view-if` | Only show the item when the value is true, e.g. `view-if: "{has_data}"`. |
| `skull-owner` | Player name for a `PLAYER_HEAD`, e.g. `"{target}"`. |
| `custom-model-data` | Integer, for resource packs. |
| `action` | One action, run on any click. |
| `actions` | A list of actions, run in order on any click. |
| `left-actions` | Actions for a left click only. |
| `right-actions` | Actions for a right click only. |
| `shift-actions` | Actions for a shift click only. |
| `show-without-history` | For `back` buttons: show the button even when there is no previous menu. Default `false`. |

When a player clicks, TeaCore runs `shift-actions` for a shift click, else `right-actions` for a right click, else `left-actions` for a left click. If that list is not set, it runs `action` + `actions`.

**True and false.** `glow` and `view-if` are false when the value is empty, `false`, `0`, `no`, or a `{placeholder}` that was not filled in. Anything else is true.

**Where `%papi%` works.** PlaceholderAPI placeholders work in `title`, `name` and `lore`. `material`, `amount`, `glow`, `view-if` and `skull-owner` only take `{values}`.

**Multi-line values.** Some values contain several lines, like `{kit_desc}` or `{lines}`. A lore line that uses one becomes one lore line per value line:

```yaml
lore:
  - "<secondary>{kit_desc}"     # a 3-line description gives 3 lore lines, each in <secondary>
```

### List keys

| Key | Meaning |
| --- | --- |
| `source` | Where the entries come from, e.g. `kits` or `stats-games`. |
| `item` | The item template for each entry. Required. |
| `empty` | Optional item shown in the first slot of the area when there are no entries. |

Each entry adds its own `{values}` to the item template (see [Sources](#sources)). Entries fill the list's slots left to right, top to bottom, in pattern order.

**Paging.** If a source has more entries than the area has slots, the menu gets pages. Add buttons with `next-page` and `previous-page`; they hide themselves when there is no next or previous page. `{page}` and `{pages}` hold the current page and the page count.

## Values

Text in a menu can use `{values}`. The available values depend on the menu and the entry:

- Every menu: `{player}` (the viewer's name), `{page}`, `{pages}`.
- Values passed when the menu was opened (for example `{game}` in the kits menu).
- In a list item: the entry's values from its source.

TeaCore inserts values as plain text. A value that contains `<` or `&` shows as-is and is not parsed.

### Values of the kits menu

Opened with `{game}` (the game id).

The `kits` source gives one entry per kit of that game:

| Value | Meaning |
| --- | --- |
| `{game}` | Game id |
| `{kit_id}` | Kit id |
| `{kit_name}` | Kit name, translated |
| `{kit_desc}` | Kit description, translated (multi-line) |
| `{kit_cost}` | Price, formatted by the economy plugin |
| `{kit_status}` | Price line: cost, owned, or not enough money. Empty for free kits. Text comes from `core.kit-picker.cost*` in TeaCore's lang file. |
| `{selected}` | `true` if this is the player's selected kit |
| `{locked}` | `true` if the kit costs money, is not owned, and the player cannot afford it |
| `{unlocked}` | `true` if the kit is free or owned |

TeaCore uses the kit's own icon as the item. A locked kit shows a `BARRIER`, a kit without an icon shows `PAPER`. TeaCore ignores the template's `material` for this source; `name`, `lore` and `glow` still apply.

### Values of the stats menu

Opened with the target player's totals:

| Value | Meaning |
| --- | --- |
| `{target}` | Name of the player whose stats are shown |
| `{target_uuid}` | Their UUID |
| `{wins}`, `{losses}`, `{games_played}` | Core stats |
| `{kills}`, `{deaths}`, `{assists}` | Core stats |
| `{winrate}` | Win percentage, one decimal |
| `{kdr}` | Kill/death ratio, two decimals |

The `stats-games` source gives one entry per game that has stats:

| Value | Meaning |
| --- | --- |
| `{game_id}` | Game id |
| `{game_name}` | Game name, translated |
| `{lines}` | One line per stat, `Label: value` (multi-line). Format comes from `core.stats.gui.game.entry` in TeaCore's lang file. |
| `{has_data}` | `true` if the player has stats in that game |

### Values of the play menus

The `games` source gives one entry per game: every game registered on this server, plus every game another server in the network hosts.

| Value | Meaning |
| --- | --- |
| `{game_id}` | Game id |
| `{game_name}` | Game name. From [`game-display`](./lobby.md#game-display), else the game's translation, else the id with a capital first letter. |
| `{players}` | Players in this game's arenas, network-wide |
| `{arenas}` | Arenas of this game, network-wide |
| `{open_arenas}` | Arenas in `WAITING` or `COUNTDOWN` |
| `{queue}` | Players in the queue for this game |
| `{maps}` | Maps for this game on this server |

The item is the game's icon (see [Game names and icons](./lobby.md#game-display)).

The `maps` source needs the `game` value and gives one entry per map of that game on this server:

| Value | Meaning |
| --- | --- |
| `{game}`, `{game_name}` | Game id and name |
| `{map_id}`, `{map_name}` | Map id and display name |
| `{min}`, `{max}` | Player bounds of the map |
| `{players}` | Players in arenas on this map, network-wide |

The item is always a `FILLED_MAP`.

The `arenas` source gives one entry per live arena in the network. With a `game` value it shows only that game, with a `map` value only that map.

| Value | Meaning |
| --- | --- |
| `{arena_id}` | First 8 characters of the arena id |
| `{arena_uuid}` | Full arena id |
| `{game}`, `{game_name}` | Game id and name |
| `{map_id}`, `{map_name}` | Map id and display name, `-` if none |
| `{state}` | Arena state in lower case, e.g. `waiting`, `live` |
| `{players}`, `{max}` | Players in the arena and its capacity |
| `{server}` | Id of the server that runs the arena |
| `{joinable}` | `true` when the arena is waiting or counting down and not full |

The item shows the state: `LIME_WOOL` waiting, `YELLOW_WOOL` countdown or starting, `RED_WOOL` live, `GRAY_WOOL` anything else.

### Values of the profile menus

The `achievements` source gives one entry per achievement of every game registered on this server. With a `game` value it shows one game. With a `target_uuid` value it shows that player's progress instead of the viewer's.

| Value | Meaning |
| --- | --- |
| `{game}`, `{game_name}` | Game id and name |
| `{achievement_id}` | Achievement id |
| `{name}`, `{desc}` | Name and description, translated |
| `{unlocked}` | `true` if the player unlocked it |
| `{status}` | `core.achievements.unlocked` or `core.achievements.locked` from TeaCore's lang file |

An unlocked achievement shows its own icon. A locked one shows `GRAY_DYE`.

The `match-history` source gives the viewer's last 45 matches, newest first. With a `target_uuid` value it shows that player's matches.

| Value | Meaning |
| --- | --- |
| `{game}`, `{game_name}` | Game id and name |
| `{map_name}` | Map display name, `-` if none |
| `{result}` | `win`, `loss` or `draw` |
| `{result_label}` | `core.history.win`, `.loss` or `.draw` from TeaCore's lang file |
| `{kills}`, `{deaths}`, `{assists}` | The player's numbers in that match |
| `{team}` | The player's team id, `-` if none |
| `{duration}` | Length of the live phase, `m:ss` |
| `{when}` | Time since the match ended, e.g. `5m`, `3h`, `2d` |

The item shows the result: `LIME_DYE` win, `RED_DYE` loss, `GRAY_DYE` draw.

## Sources

| Source | Needs | Gives |
| --- | --- | --- |
| `kits` | `game` value | One entry per kit of that game |
| `stats-games` | `target_uuid` value | One entry per game with a stats schema |
| `games` | nothing | One entry per game in the network |
| `maps` | `game` value | One entry per map of that game |
| `arenas` | optional `game` and `map` values | One entry per live arena |
| `achievements` | optional `game` and `target_uuid` values | One entry per achievement |
| `match-history` | optional `target_uuid` value | One entry per recent match |

Sources that supply their own item (`kits`, `games`, `maps`, `arenas`, `achievements`, `match-history`) ignore the template's `material`. `name`, `lore` and `glow` still apply.

Games register more sources (shop items, maps, ...). Their docs list them.

## Actions

Actions are written as `name` or `name:argument`. `{values}` in the argument are filled in before the action runs.

| Action | What it does | Example |
| --- | --- | --- |
| `close` | Closes the menu. | `close` |
| `back` | Goes back to the menu you came from. Closes the menu if there is none. | `back` |
| `open-menu:<id> [key=value ...]` | Opens another menu, passing values. Values cannot contain spaces. | `open-menu:kits game={game}` |
| `command:<command>` | Runs a command as the player. The leading `/` is optional. | `command:play mygame` |
| `console:<command>` | Runs a command as the console. | `console:give {player} diamond 1` |
| `message:<text>` | Sends a MiniMessage line to the player. Theme tags work. | `message:<success>Thanks for voting!` |
| `sound:<sound>` | Plays a sound to the player. | `sound:UI_BUTTON_CLICK` |
| `next-page` | Shows the next page. Hidden when on the last page. | `next-page` |
| `previous-page` | Shows the previous page. Hidden when on the first page. | `previous-page` |
| `refresh` | Re-renders the menu. | `refresh` |
| `kit-select:<game> <kit>` | Buys the kit through Vault if needed, selects it, and refreshes the menu. Same rules and messages as `/kit`. | `kit-select:{game} {kit_id}` |
| `play:<game> [map]` | Closes the menu and runs `/play <game> [map]` for the player. | `play:{game} {map_id}` |
| `join-arena:<id>` | Closes the menu and joins that arena. | `join-arena:{arena_uuid}` |
| `spectate:<id>` | Closes the menu and spectates that arena. | `spectate:{arena_uuid}` |

`join-arena` and `spectate` take the full id (`{arena_uuid}`) or the short one (`{arena_id}`). A player in the lobby can't enter an arena on another server, so these actions queue them for that arena's game and map instead. `play` runs `/play` as the player, so they need `tea.lobby.play`. See [Permissions](./permissions.md).

TeaCore hides a `back` button when there is no previous menu (for example when the menu was opened with a command). Set `show-without-history: true` to show it anyway; it then closes the menu.

Games add actions of their own, usually prefixed with their id (`mygame:buy:...`). An unknown action does nothing, and TeaCore logs a warning in the console.

Players can't take items out of a menu.

## Worked example: a links menu

Goal: add a "Links" button to the stats menu that opens a small menu with a few buttons.

1. Create `plugins/TeaCore/menus/links.yml`:

```yaml
enabled: true
title: "<primary>Links"
rows: 3
pattern:
  - "#########"
  - "#D#W#S#R#"
  - "####B####"
items:
  '#': { material: BLACK_STAINED_GLASS_PANE, name: " " }
  'D':
    material: PAPER
    name: "<accent>Discord"
    lore:
      - "<secondary>Click to get the invite link"
    actions:
      - "message:<secondary>Join us: <accent>discord.gg/example"
      - "sound:ENTITY_EXPERIENCE_ORB_PICKUP"
      - "close"
  'W':
    material: COMPASS
    name: "<accent>Website"
    action: "message:<secondary>Visit <accent>example.com"
  'S':
    material: EMERALD
    name: "<accent>Daily reward"
    lore:
      - "<secondary>Balance: <highlight>%vault_eco_balance_formatted%"
    actions:
      - "console:dailyreward give {player}"
      - "refresh"
  'R':
    material: DIAMOND_SWORD
    name: "<accent>Play MyGame"
    left-actions: [ "command:play mygame" ]
    right-actions: [ "open-menu:kits game=mygame" ]
    lore:
      - "<muted>Left click: queue"
      - "<muted>Right click: pick a kit"
  'B':
    material: ARROW
    name: "<secondary>Back"
    action: back
```

2. Add a button to `plugins/TeaCore/menus/stats.yml` that opens it. Put an `L` in the pattern and define it:

```yaml
pattern:
  - "####S####"
  - "#GGGGGGG#"
  - "#GGGGGGG#"
  - "B##<XL>##"
items:
  # ... existing items ...
  'L': { material: BOOK, name: "<primary>Links", action: "open-menu:links" }
```

3. Run `/tea reload`, then `/stats` and click the book. The Back button returns to the stats menu.

The `%vault_eco_balance_formatted%` line needs PlaceholderAPI with the Vault expansion; `dailyreward` stands for whatever plugin you use.

## Adding your own menu files

TeaCore loads any `.yml` file you put in `plugins/TeaCore/menus/` as a menu. Its id is the file name without `.yml` (`links.yml` is `links`).

Players reach your menu from a button in another menu (`open-menu:<id>`), from a [lobby hotbar item](./lobby.md#lobby-hotbar) (`menu: <id>`), or with [`/menu <id>`](#menu-command).

### Menu ids

| Where the file is | Menu id |
| --- | --- |
| `plugins/TeaCore/menus/kits.yml` | `kits` |
| `plugins/TeaCore/menus/<name>.yml` | `<name>` |
| A game's file, e.g. `plugins/MyGame/menus/shop.yml` | `mygame:shop` (plugin name in lower case, then the file name) |

Use these ids with `open-menu:`.

## Opening a menu by command: `/menu` {#menu-command}

```
/menu <id> [player]
```

- `/menu <id>` opens a menu for you. Needs `tea.menu` (everyone by default).
- Add `key=value` pairs to pass values the menu needs, for example `/menu kits game=fireball` or `/menu play-maps game=fireball`.
- `/menu <id> <player>` opens it for an online player. Needs `tea.menu.others` (op by default). The console can run this form, so NPC and sign plugins can open menus for players.
- Tab completion lists every menu that is on.
- If the menu file sets `permission:`, the player who gets the menu needs it. A sender with `tea.menu.others` skips that check, so staff and the console can open a menu for anyone.

The `stats` menu needs the target's stats, so open it with `/stats` rather than `/menu stats`.

## Turning menus off

| To turn off | Do this |
| --- | --- |
| Every menu | `features.menus: false` in `config.yml` |
| One game's menus | `features.games.<id>.menus: false` |
| One menu | `enabled: false` in its file |

If a menu is off, its command falls back:

| Menu off | Command does instead |
| --- | --- |
| `kits` | `/kit` opens TeaCore's built-in kit picker. |
| `stats` | `/stats` opens TeaCore's built-in stats viewer. |
| `play` | `/play` with no arguments shows the usage line. |
| `profile` | `/profile` runs `/stats`. |

Other menus don't open. See [Feature switches](./features.md).
