---
sidebar_position: 3
title: Writing a kit
---

# Writing a kit

A **kit** is a named bundle of abilities that a player can select for a game. The player's selected kit is retrieved via `KitRegistry#selectedKit(Player, GameId)`; your game applies it when a match goes LIVE.

Kits are the right tool when your game's design is "pick a loadout, each loadout grants a set of ability triggers". If your mechanics are shaped differently (for example one ability per evolution stage, or one ability per class unlocked mid-match), look at [Writing an ability](./writing-an-ability.md) for the escape hatch.

## Kit fields

```java
public record Kit(
    GameId gameId,
    String kitId,
    String displayNameKey,     // translation key
    String descriptionKey,     // translation key
    Material icon,             // for the kit-picker GUI / kit icon in inventory
    List<AbilityBinding> abilities
) {}
```

## Ability binding

Each binding wires a registered ability id to a trigger, cooldown, and per-binding tuning:

```java
public record AbilityBinding(
    String abilityId,             // registered via kits().registerAbility(gameId, id, factory)
    AbilityTrigger trigger,       // RIGHT_CLICK_ITEM | LEFT_CLICK_ITEM | SHIFT_PRESS | ...
    int cooldownTicks,            // 20 ticks per second
    CooldownDisplay display,      // XP_BAR | ACTION_BAR | BOSS_BAR | NONE
    Map<String, Object> config    // passed to the ability as ctx.config()
) {}
```

Cooldowns registered via `AbilityBinding.cooldownTicks` are automatically tracked by TeaCore's `CooldownService` - you don't manually manage them from your ability class unless you want to extend or cancel them.

`AbilityTrigger` values: `RIGHT_CLICK_ITEM`, `LEFT_CLICK_ITEM`, `SHIFT_PRESS`, `SHIFT_RELEASE`, `JUMP`, `DAMAGE_TAKEN`, `KILL`, `PASSIVE`.

## Registering

```java
// 1. Register the ability class factory
core.kits().registerAbility(MY_GAME, "dash", MyDashAbility::new);

// 2. Register one or more kits that use it
core.kits().registerKit(new Kit(
        MY_GAME,
        "runner",
        "mygame.kit.runner.name",
        "mygame.kit.runner.desc",
        Material.LEATHER_BOOTS,
        List.of(new AbilityBinding(
                "dash",
                AbilityTrigger.RIGHT_CLICK_ITEM,
                4 * 20,
                CooldownDisplay.XP_BAR,
                Map.of("strength", 1.5)
        ))
));
```

## The KitRegistry interface

```java
public interface KitRegistry {
    void registerAbility(GameId gameId, String abilityId, Supplier<Ability> factory);
    void registerKit(Kit kit);
    Optional<Kit> kit(GameId gameId, String kitId);
    Collection<Kit> kitsFor(GameId gameId);
    void selectKit(Player player, GameId gameId, String kitId);
    Optional<Kit> selectedKit(Player player, GameId gameId);
}
```

`selectedKit(Player, GameId)` returns the player's active kit, falling back to the first-registered kit for the game if none was explicitly chosen. Players change selection via `selectKit(Player, GameId, kitId)`.

Players pick a kit at runtime through TeaCore's kit picker. To show it from your game plugin, for example from a waiting-area menu item, open the `kits` menu for your game:

```java
// in your game plugin
if (!core.menus().open(player, "kits", Map.of("game", gameId.value()))) {
    player.performCommand("kit " + gameId.value());   // menus turned off: built-in picker
}
```

Players can also run `/kit <game>` (or `/kit` inside an arena) to open it, and `/kit <game> <kitId>` to select a kit without the menu. If the kit has a price and the player doesn't own it, TeaCore buys it first, with the same rules and messages as the menu. If they can't pay, TeaCore refuses the selection. The picker is the YAML menu `plugins/TeaCore/menus/kits.yml`, so admins can restyle it. When menus are turned off, `/kit` opens a built-in picker instead. See [Menus](../user/menus.md).

## Applying a kit on match start

TeaCore's arena lifecycle fires `ArenaStateChangeEvent` transitions for you, but it does not itself apply a kit. Games should listen for transitions into LIVE (or STARTING) and apply the selected kit's icon item plus any starting gear the game wants:

```java
@EventHandler
public void onArenaState(ArenaStateChangeEvent event) {
    if (!event.arena().gameId().equals(MY_GAME)) return;
    if (event.to() != ArenaState.STARTING) return;
    for (UUID uuid : event.arena().players()) {
        Player p = Bukkit.getPlayer(uuid);
        if (p == null) continue;
        Kit kit = core.kits().selectedKit(p, MY_GAME).orElse(null);
        if (kit == null) continue;
        p.getInventory().setItem(0, new ItemStack(kit.icon()));
    }
}
```

## Passive kits (no ability bindings)

Not every kit needs to grant an ability. If your design is "the kit is a passive perk - heal-on-kill, faster movement, extra max HP" then register a `Kit` with an empty `AbilityBinding` list and branch on `kitId()` in your controller:

```java
Kit kit = core.kits().selectedKit(player, MY_GAME).orElse(null);
if (kit != null && "quick_runner".equals(kit.kitId())) {
    // apply the passive perk
}
```

This pattern fits games where the real combat abilities come from somewhere else (a mid-match unlock, a transformed state, etc.) and the kit is just a named passive perk.
