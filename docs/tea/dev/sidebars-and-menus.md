---
sidebar_position: 7
title: Sidebars and menus
---

# Sidebars and menus

TeaCore renders sidebars and inventory menus for your game from YAML. You ship a default layout, register it once, and add the values only your game knows (coins, score, shop items). Admins restyle everything in config, and the [feature switches](../user/features.md) and `/board` work for your game with no extra code.

- Sidebars: `me.playbosswar.tea.core.api.sidebar`, via `core.sidebars()`.
- Menus: `me.playbosswar.tea.core.api.menu`, via `core.menus()`.

Admin-facing docs: [Sidebars](../user/sidebars.md) and [Menus](../user/menus.md). Link your game's docs to them and list the extra tags, values, sources and actions your game adds.

## Sidebars

### 1. Ship a layout in your config

```yaml
# src/main/resources/config.yml of your game plugin
sidebar:
  enabled: true
  title: "<primary><bold>MyGame"
  waiting:
    - "<secondary>Map: <highlight><map>"
    - "<secondary>Players: <highlight><players>/<max-players>"
  countdown:
    - "<success>Starting in <seconds>s"
  live:
    - "<secondary>Time: <accent><time>"
    - "<secondary>Coins: <accent><coins>"
    - ""
    - "@teams: <team-name>: <accent><team-score>"
  ended:
    - "<highlight><winner> <success>wins!"
```

Phase lists are `waiting`, `countdown`, `starting`, `live`, `ended`. A missing `starting` uses `countdown`; any other missing list uses `live`. The full list of built-in tags and `@players:` / `@teams:` columns is on the [Sidebars](../user/sidebars.md#built-in-tags) page.

### 2. Register it

```java
core.sidebars().registerGame(this, MY_GAME,
        getConfig().getConfigurationSection("sidebar"),
        new MySidebarData(controller));
```

```java
void registerGame(Plugin owner, GameId game, ConfigurationSection layout, SidebarData data);
void unregisterGame(GameId game);
```

- TeaCore shows the layout to every player in one of your game's arenas, picking the list for the arena's phase.
- Call `registerGame` again after your config reload to replace the layout.
- Call `unregisterGame` in `onDisable`.
- Pass `SidebarData.NONE` if the built-in tags are enough.
- A `null` section counts as a disabled layout.

### 3. Add your own values: `SidebarData`

Every method has a default, so override only what you need. Return tag names without brackets as keys. TeaCore merges them over its built-in values, so you can also override a built-in (for example your own `team-score`).

```java
public interface SidebarData {
    SidebarData NONE = new SidebarData() { };

    default Map<String, String> placeholders(Player viewer, Arena arena) { return Map.of(); }
    default Map<String, String> playerRow(Player viewer, Arena arena, Player player) { return Map.of(); }
    default Map<String, String> teamRow(Player viewer, Arena arena, String teamId) { return Map.of(); }
    default List<Player> sortPlayers(Arena arena, List<Player> players) { return players; }
}
```

| Method | Fills |
| --- | --- |
| `placeholders` | Extra `<tags>` for normal lines, for one viewer. |
| `playerRow` | Extra columns for each `@players:` row. `player` is the row's player. |
| `teamRow` | Extra columns for each `@teams:` row. `teamId` is the team id value, e.g. `red`. |
| `sortPlayers` | Order of the `@players:` rows. Default is join order. |

```java
final class MySidebarData implements SidebarData {
    private final MyGameController game;

    MySidebarData(MyGameController game) { this.game = game; }

    @Override
    public Map<String, String> placeholders(Player viewer, Arena arena) {
        return Map.of("coins", String.valueOf(game.coins(viewer.getUniqueId())));
    }

    @Override
    public Map<String, String> playerRow(Player viewer, Arena arena, Player player) {
        return Map.of("player-score", String.valueOf(game.score(player.getUniqueId())));
    }

    @Override
    public Map<String, String> teamRow(Player viewer, Arena arena, String teamId) {
        return Map.of("team-score", String.valueOf(game.teamPoints(arena, teamId)));  // overrides the built-in
    }

    @Override
    public List<Player> sortPlayers(Arena arena, List<Player> players) {
        return players.stream()
                .sorted(Comparator.comparingInt((Player p) -> game.score(p.getUniqueId())).reversed())
                .toList();
    }
}
```

TeaCore calls these methods on the main thread twice a second for every viewer (and `playerRow` once per row). Read from in-memory state; don't query the database here.

TeaCore inserts values as plain text and does not parse them as MiniMessage.

### Custom providers

For a sidebar a layout can't express, register a `SidebarProvider`:

```java
public interface SidebarProvider {
    default int priority() { return 0; }
    Optional<Sidebar> sidebarFor(Player player);

    record Sidebar(String title, List<String> lines) { }   // legacy section-code text
}

core.sidebars().registerProvider(myProvider);
```

- TeaCore asks every provider for every player twice a second. Return `Optional.empty()` when it doesn't apply.
- The highest `priority()` that returns a sidebar wins. Game layouts use `100`, the lobby layout `50`. Ties go to the provider registered first.
- Title and lines are already-rendered legacy text. Render them with `core.messageService().renderInline(...)` or `renderLegacy(...)`.
- TeaCore does **not** gate a custom provider for you. Check `core.features().enabled(MY_GAME, "sidebar")` and `core.sidebars().isHidden(player)` yourself.

### Other `SidebarService` methods

| Method | Does |
| --- | --- |
| `setHidden(player, hidden)` | Same as the player running `/board`. |
| `isHidden(player)` | Whether the player hid their sidebar. |
| `refresh(player)` | Re-render now instead of on the next half-second tick, e.g. right after a score change. |

## Menus

### 1. Ship a menu file

Put the file in your jar, e.g. `src/main/resources/menus/shop.yml`. It uses the same format as TeaCore's own menus; see [Menus](../user/menus.md).

```yaml
enabled: true
title: "<primary>Shop <muted>({page}/{pages})"
rows: 4
pattern:
  - "#########"
  - "#SSSSSSS#"
  - "#SSSSSSS#"
  - "###<X>###"
items:
  '#': { material: GRAY_STAINED_GLASS_PANE, name: " " }
  '<': { material: ARROW, name: "<secondary>Previous", action: previous-page }
  '>': { material: ARROW, name: "<secondary>Next", action: next-page }
  'X': { material: BARRIER, name: "<error>Close", action: close }
lists:
  'S':
    source: "mygame:shop"
    item:
      material: "{icon}"
      name: "{item_name}"
      glow: "{owned}"
      lore:
        - "<secondary>Price: <accent>{price}"
      actions:
        - "mygame:buy:{item_id}"
        - "sound:ENTITY_EXPERIENCE_ORB_PICKUP"
    empty: { material: BARRIER, name: "<muted>Nothing for sale" }
```

### 2. Register the menu, sources and actions

```java
MenuService menus = core.menus();

menus.registerSource("mygame:shop", (viewer, args) -> shop.items().stream()
        .map(item -> MenuEntry.of(Map.of(
                "item_id", item.id(),
                "item_name", item.displayName(),
                "icon", item.material().name(),
                "price", String.valueOf(item.price()),
                "owned", String.valueOf(shop.owns(viewer, item)))))
        .toList());

menus.registerAction("mygame:buy", (click, itemId) -> {
    shop.buy(click.player(), itemId);
    click.refresh();
});

String shopId = menus.registerMenu(this, "menus/shop.yml");   // "mygame:shop"
```

Open it from a command, an item click, or another menu (`open-menu:mygame:shop`):

```java
if (!core.menus().open(player, shopId, Map.of("arena", arena.id().value().toString()))) {
    // menu turned off by the admin: fall back or tell the player
}
```

### `MenuService`

```java
String registerMenu(Plugin owner, String resourcePath);
void registerSource(String id, MenuSource source);
void registerAction(String id, MenuAction action);
boolean open(Player player, String menuId, Map<String, String> args);
boolean isEnabled(String menuId);
Set<String> menuIds();
void reload();
```

| Method | Notes |
| --- | --- |
| `registerMenu` | Extracts the file to `plugins/<YourPlugin>/<resourcePath>` on first run (never overwrites), loads it, and returns its id. |
| `registerSource` | A list source, referenced as `source:` in YAML. |
| `registerAction` | A click action, referenced as `<id>` or `<id>:<argument>` in YAML. |
| `open` | Returns `false` if the menu is unknown or turned off. `args` become `{values}` and are passed to sources. |
| `isEnabled` | Menu exists and every switch for it is on. |
| `reload` | Re-reads every menu file. TeaCore calls it on `/tea reload`, so you don't have to. |

### Menu id rules

- A file shipped by TeaCore: the file name, e.g. `kits`, `stats`.
- A file an admin drops into `plugins/TeaCore/menus/`: the file name.
- A file registered by your plugin: `<owner plugin name in lower case>:<file name without .yml>`. `registerMenu(this, "menus/shop.yml")` in a plugin named `MyGame` gives `mygame:shop`.

The per-game switch `features.games.<id>.menus` matches the part before the colon against the game id. Name your plugin after your game id (case doesn't matter) so that switch works for your menus.

### Sources: `MenuSource` and `MenuEntry`

```java
@FunctionalInterface
public interface MenuSource {
    List<MenuEntry> entries(Player viewer, Map<String, String> args);
}

public record MenuEntry(Map<String, String> values, @Nullable ItemStack icon) {
    public static MenuEntry of(Map<String, String> values);
}
```

- Return entries in display order. TeaCore pages them over the list's slots.
- `values` fill `{placeholders}` in the item template and its actions, on top of the menu's own values.
- `icon` (optional) replaces the template's `material` as the base item, e.g. to keep a custom item's model or enchant glint. `name`, `lore` and `glow` from the template are still applied.
- If a source throws, TeaCore logs the exception and shows the list as empty.
- Namespace source ids with your game id.

### Actions: `MenuAction` and `MenuClick`

```java
@FunctionalInterface
public interface MenuAction {
    void run(MenuClick click, String argument);
}

public record MenuClick(Player player, String menuId, Map<String, String> args,
                        Map<String, String> values, ClickType type, MenuService menus) {
    public void refresh();   // re-render the menu the player is looking at
}
```

- `argument` is the text after the action id, with `{values}` already filled in and trimmed. Empty if there was none.
- `values` holds the clicked item's values (menu values plus the entry's). `args` holds the values the menu was opened with.
- Actions run on the next tick, so you can open or close inventories safely.
- Ids may contain colons. TeaCore picks the longest registered id that prefixes the action: `mygame:buy:sword` runs `mygame:buy` with argument `sword`.
- Namespace action ids with your game id.

The [Menus](../user/menus.md#actions) page lists the built-in actions (`close`, `back`, `open-menu`, `command`, `console`, `message`, `sound`, `next-page`, `previous-page`, `refresh`, `kit-select`, `play`, `join-arena`, `spectate`). Don't register your own actions under these ids.

### Built-in sources

TeaCore registers these sources. You can use them in your own menu files:

| Source | Args | Entries |
| --- | --- | --- |
| `kits` | `game` | Kits of one game |
| `stats-games` | `target_uuid` | Games with a stats schema |
| `games` | none | Every game on this server plus every game another server hosts |
| `maps` | `game` | Maps of one game on this server |
| `arenas` | `game`, `map` (both optional) | Live arenas in the network |
| `achievements` | `game`, `target_uuid` (both optional) | Achievements of every game on this server |
| `match-history` | `target_uuid` (optional) | The player's last 45 matches |

The values each source gives are on the [Menus](../user/menus.md#values) page. Don't register your own sources under these ids.

### Your game in the play menus

The `games` source shows your game with the icon from `GameDefinition.Builder#icon(Material)` and the name from `displayNameKey`. Set both. Menus, sidebars and placeholders all use the same name. See [Extending with a new game](./extending-with-a-new-game.md#2-register-a-gamedefinition). Admins can override them with `game-display.<id>` in TeaCore's config.

### Menu permissions

A menu file can set `permission:` at the top level. `MenuService#open` checks it on each call, so the check covers buttons, hotbar items and your own calls. If the player lacks it, `open` returns `false`.

### Opening TeaCore's menus from your game

To open the kit picker for your game (for example from a waiting-area item), open the `kits` menu and fall back to `/kit` behaviour:

```java
if (!core.menus().open(player, "kits", Map.of("game", MY_GAME.value()))) {
    player.performCommand("kit " + MY_GAME.value());   // built-in picker when menus are off
}
```

`/kit <game>` does the same, so you can dispatch the command instead.

The same pattern opens the game selector and the profile. `open` returns `false` if the menu is off:

```java
if (!core.menus().open(player, "play", Map.of())) {
    player.performCommand("play " + MY_GAME.value());   // no selector: queue directly
}
core.menus().open(player, "play-maps", Map.of("game", MY_GAME.value()));   // map picker for your game
core.menus().open(player, "profile", Map.of());
```

## Feature switches from code

```java
core.features().enabled("menus");               // server-wide
core.features().enabled(MY_GAME, "sidebar");    // with features.games.<id> override
```

Unknown keys default to `true`, so you can add your own switch names for optional parts of your game and document them.
