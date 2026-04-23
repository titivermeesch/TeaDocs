---
sidebar_position: 4
title: Writing an ability
---

# Writing an ability

An ability is a plain Java class implementing `me.playbosswar.tea.core.api.kit.Ability`. One instance is created per player by the factory you register; per-match state can live on fields, but persistent cross-match state should not.

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

What's available to the ability:

```java
public interface AbilityContext {
    Player player();
    Arena arena();
    Map<String, Object> config();    // from AbilityBinding.config()
    void startCooldown(Duration duration);
    boolean isOnCooldown();
}
```

- `ctx.player()` - the player who triggered the ability.
- `ctx.arena()` - the arena they're currently in.
- `ctx.config()` - the per-binding YAML-wireable config.
- `ctx.startCooldown(Duration)` - start (or override) the ability's cooldown; the binding's `cooldownTicks` is applied automatically after `onTrigger` returns if you don't call this.
- `ctx.isOnCooldown()` - defensive check for re-entry.

The caller (`AbilityTriggerListener`) has already verified that the arena is in `LIVE` state and that the player is a participant, so your ability body can focus on the mechanic itself.

## Triggers

`AbilityTrigger` enum values, mapped to Bukkit events:

- `RIGHT_CLICK_ITEM`, `LEFT_CLICK_ITEM` - fired from `PlayerInteractEvent`.
- `SHIFT_PRESS`, `SHIFT_RELEASE` - fired from `PlayerToggleSneakEvent`.
- `JUMP` - reserved for future event wiring.
- `DAMAGE_TAKEN` - fired on `EntityDamageEvent` where the entity is the player.
- `KILL` - fired on `EntityDeathEvent` with the player as killer.
- `PASSIVE` - never auto-fired; the ability owns its scheduling (e.g. periodic heal).

## YAML-driven tuning

Keep the class stateless-across-matches and read all tuning from `ctx.config()`. The YAML side is `AbilityBinding.config`, which can come straight from a kits config file. This lets admins tune damage, heal amounts, and cooldowns without rebuilding the plugin.

## Cooldown display

The binding's `CooldownDisplay` determines where the player sees the remaining time:

- `XP_BAR` - hijacks the XP bar for the duration, restores to the player's actual XP on expiry/death/quit.
- `ACTION_BAR` - tickable text above the hotbar.
- `BOSS_BAR` - persistent bar at the top of the screen.
- `NONE` - no visual feedback.

When a player has multiple cooldowns active with `XP_BAR` display, TeaCore shows the soonest-ending one and transitions to the next as each expires.

## Using CooldownService directly

You can also drive cooldowns directly via `CooldownService` without going through `AbilityBinding` - useful when your game wires its own event dispatch:

```java
public interface CooldownService {
    void start(Player player, String id, Duration duration, CooldownDisplay display);
    void start(Player player, String id, String label, Duration duration, CooldownDisplay display);
    boolean isActive(Player player, String id);
    Duration remaining(Player player, String id);
    void cancelAll(Player player);
}
```

This is the pattern to use when you're dispatching abilities yourself rather than through the kit system. A typical convention is to share a single `CooldownService` across a family of abilities, keying each entry by `<gameId>.<ability-id>` and rendering into the action bar with a translated label.

## Skipping the kit/ability API entirely

If the "one ability belongs to a kit binding" shape doesn't fit your game, write your own Bukkit listener that dispatches directly to ability classes and call `CooldownService` manually. You lose automatic trigger wiring and kit integration, but you gain full control. See the Ascend dev docs for [Custom abilities](../../ascend/dev/custom-abilities.md) if you're looking at it specifically to extend Ascend.
