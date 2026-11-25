---
sidebar_position: 2
title: Extending with a new game
---

# Extending with a new game

A Tea game is a standard Paper (or Spigot) plugin that declares `depend: [TeaCore]` and registers a `GameDefinition` on enable. This page builds an example `MyGame` plugin from start to finish.

## 1. `plugin.yml`

```yaml
name: MyGame
version: '${version}'
main: com.example.mygame.MyGamePlugin
api-version: '1.16'
depend: [TeaCore]
```

Use `api-version: '1.16'`, like TeaCore. Servers from 1.13 to 1.15 then refuse the plugin with a clear "Unsupported API version" message instead of failing on Java 17 classes, and servers older than 1.13 ignore the field. A newer value such as `'1.21'` would lock out 1.16.5 to 1.20. Also check in `onEnable` that TeaCore is enabled before calling `TeaCoreAPI.get()`: on 1.16 to 1.16.4 TeaCore loads, sees the version isn't supported and disables itself. To run on every version TeaCore supports (1.8.8 to 1.12.2 and 1.16.5 to the latest), build against both server APIs and use `core.platform()` for anything version-specific: see [Supporting every version](./platform.md).

If your game uses other plugins that must be present at enable time, add them to `depend:`. For example, a game that relies on LibsDisguises for mob morphs would declare `depend: [TeaCore, LibsDisguises]`.

### Pinning a compatible TeaCore version

A game built against one TeaCore API may break against an older or newer core. Check the version at the top of `onEnable`. If the installed TeaCore doesn't match what you built against, your game then refuses to start instead of failing in confusing ways later:

```java
TeaCoreAPI core = TeaCoreAPI.get();
if (!core.requireVersion(this, ">=0.1.0")) return;
```

`requireVersion` checks the requirement and, on a mismatch, logs an explanatory error and disables your plugin, so you only need to `return`. The spec is an operator followed by a version: `==` for an exact core, `>=` for a minimum, plus `>`, `<=`, `<`; a bare version (`"0.1.0"`) means `>=`. TeaCore compares only the numeric `major.minor.patch` and ignores `-SNAPSHOT` or any other qualifier, so `0.1.0-SNAPSHOT` satisfies `>=0.1.0`. To check without disabling the plugin, call `core.isCompatible(">=0.1.0")` and handle it yourself.

## 2. Register a `GameDefinition`

```java
package com.example.mygame;

import me.playbosswar.tea.core.api.TeaCoreAPI;
import me.playbosswar.tea.core.api.game.*;
import org.bukkit.Material;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.List;

public final class MyGamePlugin extends JavaPlugin {

    public static final GameId MY_GAME = GameId.of("mygame");

    @Override
    public void onEnable() {
        TeaCoreAPI core = TeaCoreAPI.get();
        if (!core.requireVersion(this, ">=0.1.0")) return;   // see "Pinning a compatible TeaCore" below

        GameDefinition def = GameDefinition.builder(MY_GAME, this)
                .displayNameKey("mygame.name")
                .icon(Material.DIAMOND_SWORD)          // item in the game selector
                .teamMode(TeamMode.FFA)
                .lifecycle(new LifecycleConfig(
                        120,                    // maxWaitSeconds
                        30,                     // countdownSeconds
                        5,                      // startingSeconds
                        10,                     // endingSeconds
                        300,                    // maxMatchSeconds (0 = no cap)
                        10,                     // titleCountdownThreshold
                        List.of(30, 15)))       // chatAnnounceAtSeconds
                .mapSelection(MapSelectionPolicy.random())
                .pool(new PoolConfig(1, 4, 1, 10))
                .endMode(EndMode.RESET)
                .build();

        core.games().register(def);
    }

    @Override
    public void onDisable() {
        try {
            TeaCoreAPI.get().games().unregister(MY_GAME);
        } catch (Exception ignored) {
            // core already disabled
        }
    }
}
```

Notes:

- `GameDefinition` has no min/max player bounds. Those live on each `MapDefinition`, so different maps for the same game can have different capacities.
- `LifecycleConfig` accepts a 4-arg, 5-arg, or 7-arg form; use the full 7-arg form above when you want to set the title threshold and chat announcement times. `LifecycleConfig.defaults()` returns `(120, 30, 5, 10, 0, 10, [30, 15])`.
- `icon(Material)` sets the item that stands for your game in TeaCore's menus (the game selector and the game list under Kits in the profile). Without it, or with `null`, the icon is `PAPER`. Admins can override the icon and the name with `game-display.<id>` in TeaCore's config. A lobby that doesn't run your plugin gets them the same way. See [Game names and icons](../user/lobby.md#game-names-and-icons).
- A typical implementation reads most of these values from its own `config.yml` and passes them into the builder at enable time.

## 3. Write a controller

Most of the game logic sits in one "controller" class that's a `Listener` on the Bukkit event bus, plus any scheduled tasks you need.

```java
public final class MyGameController implements Listener {

    private final Plugin plugin;
    private final TeaCoreAPI core;
    private final GameId gameId;

    public MyGameController(Plugin plugin, TeaCoreAPI core, GameId gameId) {
        this.plugin = plugin;
        this.core = core;
        this.gameId = gameId;
    }

    @EventHandler
    public void onArenaState(ArenaStateChangeEvent event) {
        if (!event.arena().gameId().equals(gameId)) return;
        switch (event.to()) {
            case STARTING -> initialize(event.arena());   // teleport, apply kits, reset state
            case LIVE -> startGameplay(event.arena());    // start per-match timers
            case ENDING -> recordResults(event.arena());  // write stats
            case RESETTING -> cleanup(event.arena());     // drop per-player caches
            default -> {}
        }
    }

    @EventHandler
    public void onJoin(ArenaPlayerJoinEvent event) {
        if (!event.arena().gameId().equals(gameId)) return;
        // initial scoreboard attach, welcome message via MatchBroadcaster, etc.
    }

    @EventHandler
    public void onLeave(ArenaPlayerLeaveEvent event) {
        if (!event.arena().gameId().equals(gameId)) return;
        // cleanup that specific player's slot
    }
}
```

Register it in `onEnable`:

```java
MyGameController controller = new MyGameController(this, core, MY_GAME);
getServer().getPluginManager().registerEvents(controller, this);
```

To declare the result and trigger the ENDING transition, the controller calls one of:

```java
core.arenas().endMatch(arena.id(), winner.getUniqueId());   // one winning player
core.arenas().endMatch(arena.id(), null);                    // draw / no winner
core.arenas().endMatchForTeam(arena.id(), winningTeam.id()); // a winning team
```

Both fire `MatchEndEvent`, and the lifecycle ticker handles the rest. Pick the call by result type:

| Your game | Call | Who gets a core win |
| --- | --- | --- |
| Free-for-all, one winner | `endMatch(id, uuid)` | That player |
| Teams | `endMatchForTeam(id, teamId)` | Every member of that team still in the arena |
| Draw, or nobody won | `endMatch(id, null)` or `endMatchForTeam(id, null)` | Nobody |

When there is a winner, everyone else still in the arena gets a loss. A draw gives everyone still in the arena a game played, with no win or loss. With `endMatchForTeam`, `MatchEndEvent#winningTeam()` holds the team and `winner()` a representative member. Don't use `endMatch` with one team member for a team game: only that player would get the win.

## 4. Match timeouts

If your game has a hard time cap, listen for `MatchTimedOutEvent` (fired at `LifecycleConfig.maxMatchSeconds`) and decide a winner:

```java
@EventHandler
public void onTimeout(MatchTimedOutEvent event) {
    if (!event.arena().gameId().equals(gameId)) return;
    UUID winner = pickLeader(event.arena());
    core.arenas().endMatch(event.arena().id(), winner);
    // team game: core.arenas().endMatchForTeam(event.arena().id(), leadingTeam(event.arena()));
}
```

A typical handler picks the winner from the game's own scoring, such as highest score or most lives remaining.

## 5. Kits and abilities

If your game has a conventional "pick a kit, kit grants abilities" design, use TeaCore's kit/ability API:

```java
core.kits().registerAbility(MY_GAME, "dash", MyDashAbility::new);

core.kits().registerKit(new Kit(
        MY_GAME,
        "runner",
        "mygame.kit.runner.name",
        "mygame.kit.runner.desc",
        Material.LEATHER_BOOTS,
        List.of(new AbilityBinding(
                "dash",
                AbilityTrigger.RIGHT_CLICK_ITEM,
                4 * 20,                     // 4s cooldown in ticks
                CooldownDisplay.XP_BAR,
                Map.of("strength", 1.5)     // YAML-wireable config
        ))
));
```

Players pick kits through TeaCore's kit picker. Open it from your game (for example from a waiting-area item) by running `/kit <game>` for the player, or with `core.menus().open(player, "kits", Map.of("game", MY_GAME.value()))`. The picker is the YAML `kits` menu, which admins can restyle. When menus are turned off, TeaCore uses a built-in picker; see [Sidebars and menus](./sidebars-and-menus.md#opening-teacores-menus-from-your-game). See [Writing a kit](./writing-a-kit.md) and [Writing an ability](./writing-an-ability.md) for the full API.

### When to use your own dispatcher instead

If your abilities don't fit "a kit contains a list of bindings" (for example "one ability per evolution stage, unlocked mid-match"), you can skip `AbilityBinding` and write your own Bukkit listener that calls your ability classes. You lose automatic cooldown tracking and trigger wiring, and in exchange you can shape the gameplay without kits.

Kits can still add passive perks. You can register kits with empty `AbilityBinding` lists and have the controller read the player's selected kit id and apply a passive perk.

## 6. Sidebar and chat

Don't build your own Bukkit scoreboard. Ship a `sidebar:` layout in your config and register it; TeaCore renders it per player, picks the list for the arena phase, and respects the admin's feature switches and `/board`:

```yaml
# config.yml
sidebar:
  enabled: true
  title: "<primary><bold>MyGame"
  waiting: [ "<secondary>Players: <highlight><players>/<max-players>" ]
  live:
    - "<secondary>Time: <accent><time>"
    - "<secondary>Score: <accent><score>"
    - "@players: <player-name> <muted><player-kills>"
```

```java
core.sidebars().registerGame(this, MY_GAME, getConfig().getConfigurationSection("sidebar"),
        new SidebarData() {
            @Override
            public Map<String, String> placeholders(Player viewer, Arena arena) {
                return Map.of("score", String.valueOf(controller.score(viewer.getUniqueId())));
            }
        });
```

Call `registerGame` again after your config reload, and `core.sidebars().unregisterGame(MY_GAME)` in `onDisable`. [Sidebars and menus](./sidebars-and-menus.md#sidebars) covers built-in tags, row columns and custom providers.

For chat, use `MatchBroadcaster` instead of `Bukkit.broadcast`:

```java
core.matchBroadcaster().toMatch(arena, "mygame.announce",
        Map.of("player", player.getName()));

core.matchBroadcaster().actionBarToMatch(arena, "mygame.kill.feed",
        Map.of("killer", killer.getName(), "victim", victim.getName()));
```

`MatchBroadcaster` keeps messages inside the arena, so players in other matches on the same server don't see them.

## 7. Menus

Ship menus as YAML in your jar and register them; admins edit the copy in your data folder. Fill lists with a `MenuSource` and handle clicks with a `MenuAction`:

```java
core.menus().registerSource("mygame:shop", (viewer, args) -> shopEntries(viewer));
core.menus().registerAction("mygame:buy", (click, itemId) -> {
    shop.buy(click.player(), itemId);
    click.refresh();
});
String shopId = core.menus().registerMenu(this, "menus/shop.yml");   // id "mygame:shop"

// later, e.g. from an item click:
core.menus().open(player, shopId, Map.of());
```

The menu id is `<your plugin name, lower case>:<file name>`. Name your plugin after your game id so `features.games.<id>.menus` applies to your menus. Full API and YAML format: [Sidebars and menus](./sidebars-and-menus.md#menus).

## 8. Loot tables

If your game fills chests, keep the table in your config and let TeaCore roll it:

```java
core.loot().registerItemProvider("mygame", (id, amount) -> myItems.create(id, amount));
core.loot().registerTable(this, "mygame:chests", getConfig().getConfigurationSection("loot.chests"));

core.loot().table("mygame:chests").ifPresent(table -> table.fill(chest.getBlockInventory()));
```

See [Loot tables](./loot-tables.md) for the YAML format, including legacy enchantment names.

## 9. Reporting kills

TeaCore resolves kill credit (killer + assists) and counts core kills, deaths and assists for you. Your part depends on how deaths work in your game:

| Your game | What to do |
| --- | --- |
| Players really die (`PlayerDeathEvent`) | Nothing. TeaCore reports the death. |
| You cancel the lethal damage and respawn the player | Call `core.combat().reportKill(arena, victim, event)` with the cancelled damage event. |
| An ability deals damage without a player source (poison, pulls, `damage(amount)`) | Call `core.combat().recordHit(arena, victimUuid, attackerUuid)` so the attacker gets credit. |

```java
// Inside your lethal-damage handler, after event.setCancelled(true):
core.combat().reportKill(arena, victim, event);
```

React to kills (kill feed, rewards, your own stats) with `ArenaKillEvent` instead of `PlayerDeathEvent`. Don't add core kills/deaths yourself. Details: [Combat and kill credit](./combat-and-kill-credit.md).

## 10. Persistence and stats

Register migrations in `onEnable`:

```java
core.database().registerMigrations(this, "mygame", List.of("V001__init.sql"));
```

SQL lives at `resources/db/migrations/mygame/V001__init.sql` in your jar.

Expose the data to `/tea stats` by registering a `StatsProvider`:

```java
core.stats().register(new StatsProvider() {
    @Override public GameId gameId() { return MY_GAME; }

    @Override public Map<String, String> fetch(UUID uuid) {
        Map<String, String> out = StatsProvider.newEntries();
        out.put("kills", String.valueOf(readKills(uuid)));
        out.put("games-won", String.valueOf(readWins(uuid)));
        return out;
    }
});
```

See [Persistence guide](./persistence-guide.md) for table conventions and dialect handling.

### Match history
TeaCore records every finished match for you: game, map, server, duration, winner, and each player's team, kills, deaths, assists and result. You don't write anything. Read it with `core.matchHistory()`:

```java
public interface MatchHistoryService {
    List<PlayerMatch> recentFor(UUID player, int limit);    // a player's matches, newest first
    List<MatchRecord> recent(@Nullable GameId game, int limit);  // all matches; game narrows to one
    List<PlayerMatch> participants(UUID matchId);           // every player line of one match

    record MatchRecord(UUID matchId, String gameId, @Nullable String mapId, @Nullable String serverId,
                       Instant endedAt, int durationSeconds, @Nullable String winnerTeam,
                       @Nullable UUID winnerUuid) { }

    record PlayerMatch(MatchRecord match, @Nullable String team, int kills, int deaths, int assists,
                       String result) { }   // result: "win", "loss" or "draw"
}
```

```java
Bukkit.getScheduler().runTaskAsynchronously(this, () -> {
    List<PlayerMatch> last = core.matchHistory().recentFor(player.getUniqueId(), 10);
    long wins = last.stream().filter(m -> m.result().equals("win")).count();
    // hop back to the main thread before touching the player
});
```

- Every call queries the database. Call it off the main thread.
- On a database error TeaCore logs a warning and returns an empty list.
- `winnerTeam` and `winnerUuid` are both `null` for a draw. For a team result, `winnerUuid` is one member of the winning team.
- `durationSeconds` is the length of the `LIVE` phase.
- `participants` sorts by kills, highest first. Only players still in the arena at match end have a line.
- TeaCore records at `MatchEndEvent`, so the result follows the call you made: `endMatch`, `endMatchForTeam`, or a draw with `null`.
- Admins can stop recording with `features.match-history: false`. Reads still work and return what is stored.

Admin-facing docs: [Match history](../user/match-history.md).

## 11. Maps

Use the admin commands in [Authoring a map](../user/adding-a-map.md). TeaCore registers maps at runtime when it loads `plugins/TeaCore/maps/<gameId>.yml` on startup (or when an admin runs `/tea map reload`). Your plugin doesn't need to ship default maps. A bare install has zero maps, and admins author them in-game.

If your game needs to attach data to a map beyond the built-in fields (ceremony spawns, boss-entity type, capture points, ...), register a `MapExtension` on enable. Extensions plug into `/tea map` authoring, YAML persistence, and typed lookup without your game owning a second command prefix.

For a single named spawn, use a `SpawnPointExtension`:

```java
// Declare a typed key once per extension.
public static final MapExtensionKey<SpawnPoint> BOSS_PAD =
        MapExtensionKey.of("mygame:boss-pad", SpawnPoint.class);

// Register in onEnable.
core.maps().extensions().register(SpawnPointExtension.builder(BOSS_PAD)
        .subcommand("bosspad")       // admin types /tea map bosspad
        .required(true)              // fails /tea map save if not set
        .statusLabel("boss-pad")     // shown in /tea map status
        .build());

// Read at runtime.
Optional<SpawnPoint> pad = map.extension(BOSS_PAD);
```

Admins now run `/tea map bosspad` while editing the draft to capture their current location. TeaCore handles YAML round-trips, coordinate translation between edit-world and paste-origin, and the `/tea map status` summary. A `required(true)` extension also shows up as a step in the map-setup sidebar, using your `statusLabel` and subcommand, so admins get authoring guidance for your game with no extra code.

For a list of points (chests, capture points, item spawners), use `MultiPointExtension`. Each `/tea map <subcommand>` adds a point at the admin's block, `/tea map <subcommand> clear` removes them all, and the value is a `List<SpawnPoint>`:

```java
public static final MapExtensionKey<List<SpawnPoint>> CHESTS = MultiPointExtension.key("mygame:chests");

core.maps().extensions().register(MultiPointExtension.builder(CHESTS)
        .subcommand("chest")         // /tea map chest
        .label("chest")              // status lines, markers, point ids (chest-0, chest-1, ...)
        .icon(Material.CHEST)        // shown on the editor's point tool and checklist
        .markerColor(Color.ORANGE)   // particle colour of the markers
        .build());

List<SpawnPoint> chests = map.extension(CHESTS).orElse(List.of());
```

`SpawnPointExtension.Builder` has the same `icon(...)` and `markerColor(...)`.

**Which game an extension belongs to.** Start the key id with your game id and a colon (`mygame:chests`). TeaCore reads the game from that prefix (`MapExtension.game()`) and only uses the extension for that game's maps: validation, `/tea map status`, the setup sidebar and the editor tools all skip other games' extensions. An id without a prefix applies to every game. Override `game()` if your ids don't follow the pattern.

For non-spawn data (entity types, block regions, config-shaped structs), implement `MapExtension<T>` directly. TeaCore calls `handleCommand` when admins type `/tea map <subcommand>`, `toYaml`/`fromYaml` at save/load, and the optional `toRelative`/`toAbsolute` if your value carries coordinates that need to survive the edit-world-to-minCorner relocation. A game that needs two named spawn points (for example a viewer pad and a mob pad for a ceremony) can register two `SpawnPointExtension`s, each with its own key and subcommand.

**Map editor support.** The [editor tools](../user/adding-a-map.md#editor-tools) draw markers for, place and remove points of any extension that implements these optional methods (the built-in extensions already do):

| Method | Default | Purpose |
| --- | --- | --- |
| `List<SpawnPoint> points(T value)` | empty | The points to draw as markers, in the same coordinates as the value. |
| `T removePoint(T value, int index)` | `null` (clear) | The value without the point at `index`; `null` clears the extension. |
| `T placePoint(T current, SpawnPoint point)` | `null` | The value after placing a point. Returning `null` makes the point tool call `handleCommand` with no arguments instead. |
| `Material editorIcon()` | `PAPER` | Item for the point tool and the checklist. |
| `Color markerColor()` | white | Particle colour. |

An extension that implements none of them still works with commands; it shows in the checklist and on the point tool, but without markers.

## 12. Translations

Each game plugin ships its own `lang/<locale>.yml` bundle and registers it on enable so players see localized strings:

```java
core.messageService().registerBundles(this, List.of("en_US"));
```

Prefix all keys with your game id (for example `mygame.match.won`, `mygame.stage.forest`) so they don't collide with TeaCore (`core.*`), TeaCore's lobby features (`lobby.*`), or other games. Ship any locales you want. TeaCore loads the list you pass from your jar's `lang/<locale>.yml` resources, and admins can override them with files in `plugins/<YourPlugin>/lang/`.

## 13. Placeholders
Once you register a stats schema (step 10), TeaCore exposes each column as a PlaceholderAPI placeholder `%tea_<gameId>_<stat>%` with no extra code. To add placeholders that aren't stat columns (live match state, computed values), register a `PlaceholderResolver` under your game id:

```java
core.placeholders().register("mygame", (player, key) -> switch (key) {
    case "stage" -> player == null ? null
            : String.valueOf(controller.stageOf(player.getUniqueId()));
    case "kills_this_round" -> ...;
    default -> null;          // return null for keys you don't handle
});
```

These resolve as `%tea_mygame_stage%`, `%tea_mygame_kills_this_round%`, and so on. Return `null` for any key you don't own so other resolvers (and the auto stat columns) still get a chance. The resolver may receive a `null` or offline player, so check for both. See the [placeholder reference](../user/placeholders.md) for everything TeaCore exposes out of the box.

## 14. Editable settings

List your config in a settings schema and staff can change it from `/tea admin` and the dashboard. See [Editable settings](./settings.md).

## 15. Putting it together

Your `onEnable` ends up close to this:

```java
@Override
public void onEnable() {
    TeaCoreAPI core = TeaCoreAPI.get();
    if (!core.requireVersion(this, ">=0.1.0")) return;

    saveDefaultConfig();
    core.messageService().registerBundles(this, List.of("en_US"));

    core.database().registerMigrations(this, "mygame", List.of("V001__init.sql"));
    core.stats().register(new MyGameStatsProvider(core.database().dataSource()));

    registerGame(core);
    registerKits(core);

    MyGameController controller = new MyGameController(this, core, MY_GAME);
    getServer().getPluginManager().registerEvents(controller, this);

    core.sidebars().registerGame(this, MY_GAME,
            getConfig().getConfigurationSection("sidebar"), new MySidebarData(controller));
    core.menus().registerMenu(this, "menus/shop.yml");
    core.loot().registerTable(this, "mygame:chests", getConfig().getConfigurationSection("loot.chests"));
}
```

The rest is your game's own mechanics.
