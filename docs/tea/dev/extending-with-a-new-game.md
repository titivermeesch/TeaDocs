---
sidebar_position: 2
title: Extending with a new game
---

# Extending with a new game

A Tea game is a standard Spigot plugin that declares `depend: [TeaCore]` and registers a `GameDefinition` on enable. This page walks through building a hypothetical `MyGame` plugin end-to-end.

## 1. `plugin.yml`

```yaml
name: MyGame
version: '${version}'
main: com.example.mygame.MyGamePlugin
api-version: '1.21'
depend: [TeaCore]
```

If your game uses other plugins that must be present at enable time, add them to `depend:`. For example, a game that relies on LibsDisguises for mob morphs would declare `depend: [TeaCore, LibsDisguises]`.

## 2. Register a `GameDefinition`

```java
package com.example.mygame;

import me.playbosswar.tea.core.api.TeaCoreAPI;
import me.playbosswar.tea.core.api.game.*;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.List;

public final class MyGamePlugin extends JavaPlugin {

    public static final GameId MY_GAME = GameId.of("mygame");

    @Override
    public void onEnable() {
        TeaCoreAPI core = TeaCoreAPI.get();

        GameDefinition def = GameDefinition.builder(MY_GAME, this)
                .displayNameKey("mygame.name")
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

- `GameDefinition` does **not** carry min/max player bounds - those live on each `MapDefinition`, so different maps for the same game can have different capacities.
- `LifecycleConfig` accepts a 4-arg, 5-arg, or 7-arg form; the full 7-arg form above is recommended when you want control over the title threshold and chat announcement times. `LifecycleConfig.defaults()` returns `(120, 30, 5, 10, 0, 10, [30, 15])`.
- A typical implementation reads most of these values from its own `config.yml` and passes them into the builder at enable time.

## 3. Write a controller

Most of the game logic sits in a single "controller" class that's a `Listener` on the Bukkit event bus, plus a couple of scheduled tasks if needed.

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

To declare a winner and trigger the ENDING transition, the controller calls:

```java
core.arenas().endMatch(arena.id(), winner.getUniqueId());
```

Pass `null` for the winner UUID on draws. This fires `MatchEndEvent` and the lifecycle ticker takes it from there.

## 4. Match timeouts

If your game has a hard time cap, listen for `MatchTimedOutEvent` (fired at `LifecycleConfig.maxMatchSeconds`) and decide a winner:

```java
@EventHandler
public void onTimeout(MatchTimedOutEvent event) {
    if (!event.arena().gameId().equals(gameId)) return;
    UUID winner = pickLeader(event.arena());
    core.arenas().endMatch(event.arena().id(), winner);
}
```

A typical handler picks a winner based on the game's own scoring (highest score, most lives remaining, etc.).

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

Players pick kits through the TeaCore kit-selector GUI. Games open it themselves (typically from a waiting-area menu item that calls `KitSelectorGui.open(player, gameId)`). See [Writing a kit](./writing-a-kit.md) and [Writing an ability](./writing-an-ability.md) for the full API.

### When to use your own dispatcher instead

If your abilities don't map cleanly onto "kit contains a list of bindings" - for example "one ability per evolution stage, unlocked mid-match" - you can skip `AbilityBinding` and write your own Bukkit listener that dispatches directly to ability classes. The trade-off: you lose automatic cooldown tracking and trigger wiring, but you also don't have to squeeze the gameplay into a kit-shaped hole.

Kits can still be part of the game as passive flavor. You can register kits with empty `AbilityBinding` lists and have the controller read the player's selected kit id and apply a passive perk.

## 6. Scoreboard and chat

For scoreboards, wire your own `org.bukkit.scoreboard.Scoreboard` per arena or per player and render lines through `MessageService#renderComponent(locale, key, placeholders)` so your translation keys and theme styles apply. A common pattern is to pull MiniMessage templates from your own `config.yml` under a `sidebar:` key and expand them per player, which lets admins retheme the scoreboard without a rebuild.

For chat, never call `Bukkit.broadcast` - use `MatchBroadcaster`:

```java
core.matchBroadcaster().toMatch(arena, "mygame.announce",
        Map.of("player", player.getName()));

core.matchBroadcaster().actionBarToMatch(arena, "mygame.kill.feed",
        Map.of("killer", killer.getName(), "victim", victim.getName()));
```

This keeps messages scoped to the arena so nothing leaks across matches running on the same server.

## 7. Persistence and stats

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

## 8. Maps

Use the admin commands in [Authoring a map](../user/adding-a-map.md). Maps are registered at runtime when TeaCore loads `plugins/TeaCore/maps/<gameId>.yml` on startup (or when an admin runs `/tea map reload`). Your plugin doesn't ship default maps unless you want to - a bare install has zero maps and admins author them in-game.

If your game needs to attach data to a map beyond the built-in fields (ceremony spawns, boss-entity type, capture points, ...), register a `MapExtension` on enable. Extensions plug into `/tea map` authoring, YAML persistence, and typed lookup without your game owning a second command prefix.

The simplest case is a single named spawn - ship as a `SpawnPointExtension`:

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

Admins now run `/tea map bosspad` while editing the draft to capture their current location. Core handles YAML round-trips, coordinate translation between edit-world and paste-origin, and the `/tea map status` summary.

For non-spawn data (entity types, block regions, config-shaped structs), implement `MapExtension<T>` directly. Core calls `handleCommand` when admins type `/tea map <subcommand>`, `toYaml`/`fromYaml` at save/load, and optionally `toRelative`/`toAbsolute` if your value carries coordinates that need to survive the edit-world-to-minCorner relocation. A game that needs two named spawn points (for example a viewer pad and a mob pad for a ceremony) can register two `SpawnPointExtension`s, each with its own key and subcommand.

## 9. Translations

Each game plugin ships its own `lang/<locale>.yml` bundle and registers it on enable so players see localized strings:

```java
core.messageService().registerBundles(this, List.of("en_US"));
```

Prefix all keys with your game id (for example `mygame.match.won`, `mygame.stage.forest`) so they don't collide with TeaCore (`core.*`), TeaCore's lobby features (`lobby.*`), or other games. Ship whatever locales you want here - the list you pass is loaded from your jar's `lang/<locale>.yml` resources, and admins can override them with files in `plugins/<YourPlugin>/lang/`.

## 10. Putting it together

Your `onEnable` ends up roughly like this:

```java
@Override
public void onEnable() {
    TeaCoreAPI core = TeaCoreAPI.get();

    saveDefaultConfig();
    core.messageService().registerBundles(this, List.of("en_US"));

    core.database().registerMigrations(this, "mygame", List.of("V001__init.sql"));
    core.stats().register(new MyGameStatsProvider(core.database().dataSource()));

    registerGame(core);
    registerKits(core);

    MyGameController controller = new MyGameController(this, core, MY_GAME);
    getServer().getPluginManager().registerEvents(controller, this);
}
```

From here the rest is just your game's own mechanics.
