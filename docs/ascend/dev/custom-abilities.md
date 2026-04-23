---
sidebar_position: 2
title: Writing a new ability
---

# Writing a new ability

Ascend's stage abilities don't use TeaCore's `Ability` / `AbilityBinding` API. Instead, Ascend defines its own lightweight `StageAbility` interface tailored to "one ability per evolution stage" gameplay. This page walks through the interface, the dispatch model, and the steps to add a new one.

If you're building a brand-new game and trying to decide between this pattern and TeaCore's kit-based ability API, read the escape-hatch section of the [Tea ability docs](../../tea/dev/writing-an-ability.md#skipping-the-kitability-api-entirely) first.

## The StageAbility interface

Source: `ascend/src/main/java/me/playbosswar/ascend/abilities/StageAbility.java`

```java
public interface StageAbility {

    /** Stable id; referenced from EvolutionStage.abilityId(). */
    String id();

    /** Cooldown in ticks (20 = 1 second). 0 = no cooldown tracked. */
    default int cooldownTicks() { return 0; }

    default void onRightClick(StageContext ctx) {}

    default void onBowRelease(StageContext ctx, EntityShootBowEvent event) {}

    default void onDamageDealt(StageContext ctx, LivingEntity target,
                               EntityDamageByEntityEvent event) {}
}
```

Implement only the triggers your ability cares about. Unused methods default to no-op.

## StageContext

Source: `ascend/src/main/java/me/playbosswar/ascend/abilities/StageContext.java`

```java
public record StageContext(Player player, Arena arena, Plugin plugin, TeaCoreAPI core) {

    public void startCooldown(String abilityId, int cooldownTicks) { /* ... */ }
    public boolean isOnCooldown(String abilityId) { /* ... */ }
}
```

- `player()` - the player who triggered the ability.
- `arena()` - the arena they're currently in.
- `plugin()` - the `AscendPlugin` instance, for scheduling `BukkitRunnable`s.
- `core()` - `TeaCoreAPI` handle. Use `core.cooldowns()` directly if you need finer control than `StageContext#startCooldown`.

`startCooldown(id, ticks)` is the usual entry point - it keys cooldowns as `ascend.<id>`, renders them in the action bar with the `ascend.ability.<id>.name` translation as the label (the XP bar is reserved for evolve progress), and reads the player's locale from `MessageService`.

## Dispatch

`AscendStageAbilityListener` (source: `ascend/src/main/java/me/playbosswar/ascend/AscendStageAbilityListener.java`) receives the raw Bukkit events and dispatches to the `StageAbility` bound to the triggering player's current evolution stage. It only fires when the arena is in `LIVE` state and the player has a resolved `PlayerAscendData`.

Abilities are looked up by id in a `Map<String, StageAbility>` built once during plugin enable by `AscendPlugin#buildStageAbilities`.

## Example: right-click only

Minimal reference:

```java
package me.playbosswar.ascend.abilities;

import org.bukkit.Particle;
import org.bukkit.Sound;
import org.bukkit.entity.Entity;
import org.bukkit.entity.LivingEntity;
import org.bukkit.entity.Player;
import org.bukkit.util.Vector;

/** Iron Golem's Ground Pound: AoE hurt + upward launch within 4 blocks. */
public final class GroundPoundAbility implements StageAbility {

    private static final double RADIUS = 4.0;
    private static final double DAMAGE = 4.0;
    private static final int COOLDOWN_TICKS = 10 * 20;

    @Override public String id() { return "ground_pound"; }
    @Override public int cooldownTicks() { return COOLDOWN_TICKS; }

    @Override
    public void onRightClick(StageContext ctx) {
        if (ctx.isOnCooldown(id())) return;
        Player player = ctx.player();
        for (Entity e : player.getNearbyEntities(RADIUS, RADIUS, RADIUS)) {
            if (!(e instanceof LivingEntity target) || target.equals(player)) continue;
            target.damage(DAMAGE, player);
            target.setVelocity(new Vector(
                    target.getVelocity().getX() * 0.5,
                    1.2,
                    target.getVelocity().getZ() * 0.5));
        }
        player.getWorld().spawnParticle(Particle.EXPLOSION, player.getLocation(), 1);
        player.getWorld().playSound(player.getLocation(),
                Sound.ENTITY_IRON_GOLEM_ATTACK, 1.0f, 0.8f);
        ctx.startCooldown(id(), cooldownTicks());
    }
}
```

## Example: config-driven tuning

To read tuning from `plugins/Ascend/config.yml`, take the `Plugin` in the constructor and pull values in `onEnable`. `FlamethrowerAbility` is the reference:

```java
public FlamethrowerAbility(Plugin plugin) {
    this.plugin = plugin;
    var cfg = plugin.getConfig();
    this.cooldownTicks = cfg.getInt("abilities.flamethrower.cooldown-ticks", 4 * 20);
    this.durationTicks = cfg.getInt("abilities.flamethrower.duration-ticks", 30);
    // ...
}
```

Add your own `abilities.<id>.<field>` keys to `config.yml` and document them in [the configuration reference](../user/configuration.md#abilities---per-ability-tuning).

## Adding your ability to Ascend

1. Create your class in `ascend/src/main/java/me/playbosswar/ascend/abilities/`.
2. Register it in `AscendPlugin#buildStageAbilities`:
   ```java
   StageAbility[] abilities = {
           new GroundPoundAbility(),
           // ...
           new MyNewAbility(this)    // if it needs the plugin handle
   };
   ```
3. Add a translation for the ability's name and hint to every `plugins/Ascend/lang/<locale>.yml`:
   ```yaml
   ascend.ability.my_new.name: "My New"
   ascend.ability.my_new.hint: "Right-click to use"
   ```
4. Point a stage at it by setting `ability: my_new` in that stage's `config.yml` entry.

## Guidelines

- **Stay within Spigot API.** No NMS, no Paper-only APIs. Ascend is pure Spigot API for portability - see the project-level rule.
- **Read all tuning from config.** For any ability that might want to be tuned without rebuilding the plugin, take a `Plugin` in the constructor and read from `plugin.getConfig()` in the constructor (not per-trigger).
- **Use `StageContext#startCooldown`.** It renders the cooldown label via `MessageService`, so your ability's name automatically appears in the player's locale.
- **Schedule with `BukkitRunnable#runTaskTimer(plugin, ...)`.** Pass `ctx.plugin()` (the `AscendPlugin` handle) so Bukkit properly cleans up on plugin disable.
- **Bail early when the arena isn't LIVE.** `AscendStageAbilityListener` already filters for LIVE state, but if you're scheduling recurring ticks, re-check inside the runnable in case the match ends mid-ability.

## Handy reference abilities

All at `ascend/src/main/java/me/playbosswar/ascend/abilities/`:

- `GroundPoundAbility` - simplest hardcoded AoE.
- `FlamethrowerAbility` - config-driven, scheduled ticks, cone math.
- `SulphurBombAbility` - throwable projectile with forced detonation timer.
- `EggBlasterAbility` - uses the controller for damage routing.
- `BlinkAbility` - teleport without damage.
- `WebAbility` - fires a projectile, slows on hit.
- `DiveBombAbility` - aerial-only behavior, reads the player's velocity.

When in doubt, grep for the trigger you want in the existing classes and copy the pattern.
