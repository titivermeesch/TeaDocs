---
sidebar_position: 1
title: Authoring a new stage
---

# Authoring a new stage

Adding a stage to Ascend is a config-only change. This page walks through every field in an Ascend stage entry and calls out what you need to add alongside the config. The 14 abilities that ship with Ascend (`ground_pound`, `flamethrower`, `web`, `sulphur_bomb`, `slime_slam`, `egg_blaster`, `blink`, `leap_rip`, `crossbow_volley`, `soul_slash`, `molten_bounce`, `fireball`, `sonic_boom`, `dive_bomb`) cover most evolution-game shapes, and any new stage you add can pick from any of them.

## Where stages live

`plugins/Ascend/config.yml`. The ladder is split into two pieces:

- `stage-order:` - a flat array of stage ids that defines who's next to whom on the ladder. Last id is the apex.
- `stages:` - a map of `<id>: { stats... }` per stage. Order in this map doesn't matter; stage-order owns the ladder.

```yaml
stage-order:
  - iron_golem
  - blaze
  - wither_skeleton
  - spider
  - creeper
  - slime
  - chicken

stages:
  iron_golem:
    ability: ground_pound
    # ...
  blaze:
    ability: flamethrower
    # ...
```

## Every field, explained

Each entry is a record that maps onto `EvolutionStage` (`ascend/src/main/java/me/playbosswar/ascend/stage/EvolutionStage.java`). Defaults come from `EvolutionStages#parseSection`.

| Field | Type | Default | Notes |
| ----- | ---- | ------- | ----- |
| `name-key` | string | `ascend.stage.<id>` | Translation key for the display name. Add the key to every `plugins/Ascend/lang/*.yml`. |
| `ability` | string | none | Id of a registered `StageAbility`. Blank or missing = no ability on this stage. |
| `mob-type` | EntityType name | none | Any Bukkit `EntityType` name. Invalid values log a warning and fall through to "no morph". |
| `head-material` | Material name | none | Optional worn helmet rendered on the player. |
| `combat-item` | Material name | `STICK` | Hotbar slot-0 flavor item. Damage is driven by `melee-damage`, not this item's vanilla damage. |
| `info-icon` | Material name | `MobHeads.iconFor(mob-type)` | Slot-8 stage-info icon. |
| `max-health` | double | `20.0` | Half-hearts. |
| `melee-damage` | double | `3.0` | Half-hearts per punch. |
| `walk-speed` | float | `0.22` | `Player.setWalkSpeed` value. `0.20` is the vanilla baseline. |
| `knockback-resistance` | double 0.0-1.0 | `0.0` | `1.0` = total immunity. Clamped to `[0, 1]`. |
| `fall-damage-multiplier` | double 0.0-1.0 | `1.0` | `0` = immune, `0.5` = half, `1` = full. Clamped. |
| `water-damage` | bool | `false` | Chip HP every tick while in water. |
| `speed-amplifier` | int | `0` | `0` = none, `1` = Speed I, `2` = Speed II. Applied as a potion effect. |
| `double-jump` | bool | `false` | Allows a mid-air leap triggered by pressing space while airborne. The leap's `forward`, `up`, and anti-hover `cooldown-ms` live under `abilities.double_jump:`. |
| `mob-size` | int | `0` | Slime / magma cube size (vanilla values are 1, 2, 4). `0` keeps the LibsDisguises default. Ignored for non-sized mobs. |

## Example: adding Wither Skeleton to the ladder

The `wither_skeleton` stage ships defined under `stages:` but isn't in the default `stage-order`. To slot it in between Blaze and Spider:

```yaml
stage-order:
  - iron_golem
  - blaze
  - wither_skeleton   # added
  - spider
  - creeper
  - slime
  - chicken
```

Then `/tea reload` and the next match will use the updated ladder.

## Example: a brand new stage

Say you want to add a "Vex" stage:

1. Add the entry to `stages:`:
   ```yaml
   stages:
     vex:
       name-key: ascend.stage.vex
       ability: blink                    # reusing an existing ability
       mob-type: VEX
       combat-item: IRON_SWORD
       max-health: 18
       melee-damage: 6
       walk-speed: 0.30
       fall-damage-multiplier: 0.0
   ```

2. Slot the id into `stage-order` where you want it on the ladder:
   ```yaml
   stage-order:
     - iron_golem
     - blaze
     - spider
     - vex                # added before creeper
     - creeper
     - slime
     - chicken
   ```

3. Add the translation key to every `plugins/Ascend/lang/<locale>.yml`:
   ```yaml
   ascend.stage.vex: "Vex"
   ```

4. `/tea reload`.

## Things to watch for

- **`stage-order` is the only source of order.** Stages defined under `stages:` but absent from `stage-order` are ignored entirely. Disabling a stage = removing it from `stage-order`.
- **Missing translation key.** If you forget to add `ascend.stage.<id>` to your lang bundle, the scoreboard and chat will show the raw key string.
- **Unknown mob type.** Ascend accepts any `EntityType` name but warns if the value is unrecognized. The stage still loads without a morph - players will look like themselves.
- **Empty stage-order.** If `stage-order` is missing or empty, Ascend falls back to the bundled 6-stage default ladder and logs a warning.

