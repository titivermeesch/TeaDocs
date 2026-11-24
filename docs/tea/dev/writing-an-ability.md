---
sidebar_position: 4
title: Writing an ability
---

# Writing an ability

An ability is a plain Java class implementing `me.playbosswar.tea.core.api.kit.Ability`. The factory you register creates one instance per player. You can keep per-match state in fields, but keep state that outlives a match somewhere else.

## The Ability interface

```java
public interface Ability {
    /** Called when a registered trigger fires for this ability's binding. */
    void onTrigger(AbilityContext ctx);
}
```

## Minimal example

```java
package com.example.mygame.ability;

import me.playbosswar.tea.core.api.kit.Ability;
import me.playbosswar.tea.core.api.kit.AbilityContext;
import org.bukkit.Sound;
import org.bukkit.util.Vector;

public final class MyDashAbility implements Ability {

    @Override
    public void onTrigger(AbilityContext ctx) {
        if (ctx.isOnCooldown()) return;

        double strength = asDouble(ctx.config().get("strength"), 1.5);
        var player = ctx.player();
        Vector dir = player.getLocation().getDirection().normalize().multiply(strength);
        dir.setY(Math.max(dir.getY(), 0.3));
        player.setVelocity(dir);
        player.getWorld().playSound(player.getLocation(),
                Sound.ENTITY_FIREWORK_ROCKET_LAUNCH, 1.0f, 1.5f);
    }

    private static double asDouble(Object raw, double fallback) {
        return raw instanceof Number n ? n.doubleValue() : fallback;
    }
}
```

## AbilityContext

The ability gets this context:

```java
public interface AbilityContext {
    Player player();
    Arena arena();
    Map<String, Object> config();    // from AbilityBinding.config()
    void startCooldown(Duration duration);
    boolean isOnCooldown();
}
```

- `ctx.player()`: the player who triggered the ability.
- `ctx.arena()`: the arena they're in.
- `ctx.config()`: the per-binding config, which you can fill from YAML.
- `ctx.startCooldown(Duration)`: start (or override) the ability's cooldown. If you don't call it, TeaCore applies the binding's `cooldownTicks` after `onTrigger` returns.
- `ctx.isOnCooldown()`: a guard against re-entry.

The caller (`AbilityTriggerListener`) has already checked that the arena is `LIVE` and the player is a participant, so your ability only needs the mechanic.

## Triggers

`AbilityTrigger` enum values, mapped to Bukkit events:

- `RIGHT_CLICK_ITEM`, `LEFT_CLICK_ITEM`: fired from `PlayerInteractEvent`.
- `SHIFT_PRESS`, `SHIFT_RELEASE`: fired from `PlayerToggleSneakEvent`.
- `JUMP`: reserved for future event wiring.
- `DAMAGE_TAKEN`: fired on `EntityDamageEvent` where the entity is the player.
- `KILL`: fired on `EntityDeathEvent` with the player as killer.
- `PASSIVE`: TeaCore never fires it; the ability schedules itself (e.g. periodic heal).

## YAML-driven tuning

Keep no state across matches in the class and read all tuning from `ctx.config()`. The YAML side is `AbilityBinding.config`, which can come from a kits config file. Admins can then tune damage, heal amounts and cooldowns without rebuilding the plugin.

## Cooldown display

The binding's `CooldownDisplay` sets where the player sees the remaining time:

- `XP_BAR`: takes over the XP bar for the duration and restores the player's own XP on expiry, death or quit.
- `ACTION_BAR`: ticking text above the hotbar.
- `BOSS_BAR`: a bar at the top of the screen.
- `NONE`: no visual feedback.

When a player has multiple cooldowns active with `XP_BAR` display, TeaCore shows the soonest-ending one and transitions to the next as each expires.

## Using CooldownService directly

You can also call `CooldownService` without `AbilityBinding`, for example when your game dispatches its own events:

```java
public interface CooldownService {
    void start(Player player, String id, Duration duration, CooldownDisplay display);
    void start(Player player, String id, String label, Duration duration, CooldownDisplay display);
    boolean isActive(Player player, String id);
    Duration remaining(Player player, String id);
    void cancelAll(Player player);
}
```

Use this when you dispatch abilities yourself instead of through the kit system. A common convention is to share one `CooldownService` across a family of abilities, key each entry by `<gameId>.<ability-id>`, and show it in the action bar with a translated label.

## Skipping the kit/ability API entirely

If "one ability belongs to a kit binding" doesn't fit your game, write your own Bukkit listener that calls your ability classes, and call `CooldownService` yourself. You lose automatic trigger wiring and kit integration, and you control the whole flow.
