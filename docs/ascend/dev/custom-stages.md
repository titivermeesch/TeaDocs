---
sidebar_position: 1
title: Authoring a new stage
---

# Authoring a new stage

Adding a stage to Ascend is a config-only change as long as you're reusing an existing ability id. This page walks through every field in an Ascend stage entry and calls out what you need to add alongside the config.

If you want the stage to use a new ability that doesn't ship with Ascend, see [Custom abilities](./custom-abilities.md) first - you'll need an id to point the stage at.

## Where stages live

`plugins/Ascend/config.yml`, under `stages:`. The config loader (`ascend/src/main/java/me/playbosswar/ascend/EvolutionStages.java`) accepts two shapes:

**Section with child keys** (default, recommended):

```yaml
stages:
  iron_golem:
    enabled: true
    ability: ground_pound
    # ...
  blaze:
    enabled: true
    # ...
```

The child key doubles as the stage id. Stage order on the ladder is config order.

**List of maps**:

```yaml
stages:
  - id: iron_golem
    enabled: true
    ability: ground_pound
  - id: blaze
    enabled: true
```

Pick one style and stick with it.

## Every field, explained

Each entry is a record that maps onto `EvolutionStage` (`ascend/src/main/java/me/playbosswar/ascend/EvolutionStage.java`). Defaults come from `EvolutionStages#parseSection`.

| Field | Type | Default | Notes |
| ----- | ---- | ------- | ----- |
| `enabled` | bool | `true` | `false` skips the stage entirely - it doesn't count toward the apex. |
| `name-key` | string | `ascend.stage.<id>` | Translation key for the display name. Add the key to every `plugins/Ascend/lang/*.yml`. |
| `ability` | string | none | Id of a registered `StageAbility`. Blank or missing = no ability on this stage. |
| `mob-type` | EntityType name | none | Any Bukkit `EntityType` LibsDisguises can spawn. Invalid values log a warning and fall through to "no morph". |
| `head-material` | Material name | none | Optional worn helmet rendered on the player. |
| `combat-item` | Material name | `STICK` | Hotbar slot-0 flavor item. Damage is driven by `melee-damage`, not this item's vanilla damage. |
| `info-icon` | Material name | `MobHeads.iconFor(mob-type)` | Slot-8 stage-info icon. |
| `max-health` | double | `20.0` | Half-hearts. |
| `melee-damage` | double | `3.0` | Half-hearts per punch. Applied via a damage override in `AscendController`. |
| `walk-speed` | float | `0.22` | Vanilla base speed. `0.20` is normal player speed. |
| `knockback-resistance` | double 0.0-1.0 | `0.0` | `1.0` = total immunity. Clamped to `[0, 1]`. |
| `fall-damage-multiplier` | double 0.0-1.0 | `1.0` | `0` = immune, `0.5` = half, `1` = full. Clamped. |
| `water-damage` | bool | `false` | Chip HP every tick while in water. |
| `speed-amplifier` | int | `0` | `0` = none, `1` = Speed I, `2` = Speed II. Applied as a potion effect. |
| `double-jump` | bool | `false` | Allows a mid-air leap triggered by pressing space while airborne. Cooldown is shared across stages via `game.chicken-double-jump-cooldown-ms`. |

## Example: adding Wither Skeleton to the ladder

The `wither_skeleton` stage ships disabled. To slot it in between Blaze and Spider:

```yaml
stages:
  iron_golem:
    enabled: true
    # ...
  blaze:
    enabled: true
    # ...
  wither_skeleton:
    enabled: true                           # flipped from false
    name-key: ascend.stage.wither_skeleton
    ability: soul_slash
    mob-type: WITHER_SKELETON
    combat-item: WITHER_SKELETON_SKULL
    max-health: 35
    melee-damage: 7
    walk-speed: 0.22
  spider:
    enabled: true
    # ...
```

Then `/tea reload` and the next match will use the updated ladder.

## Example: a brand new stage

Say you want to add a "Vex" stage:

1. Add the entry to `config.yml`:
   ```yaml
   vex:
     enabled: true
     name-key: ascend.stage.vex
     ability: blink                    # reusing an existing ability
     mob-type: VEX
     combat-item: IRON_SWORD
     max-health: 18
     melee-damage: 6
     walk-speed: 0.30
     fall-damage-multiplier: 0.0
   ```

2. Add the translation key to every `plugins/Ascend/lang/<locale>.yml`:
   ```yaml
   ascend.stage.vex: "Vex"
   ```

3. `/tea reload`.

## Things to watch for

- **Position matters.** Stage order in config is stage order on the ladder. Reordering entries changes who's next to whom. The last enabled stage is the apex.
- **Missing translation key.** If you forget to add `ascend.stage.<id>` to your lang bundle, the scoreboard and chat will show the raw key string. Tea's merge-bundled-defaults pass won't help you here because your new key isn't in the jar.
- **Unknown mob type.** Ascend accepts any `EntityType` name but warns if the value is unrecognized. The stage still loads without a morph - players will look like themselves.
- **All stages disabled.** If every stage has `enabled: false`, Ascend falls back to the hardcoded 6-stage default ladder. Enable at least two stages to get a meaningful ladder.

## If you need a new ability for the stage

See [Custom abilities](./custom-abilities.md) to write a new `StageAbility` class, register it in `buildStageAbilities()`, and then point your new stage's `ability:` at the new id.
