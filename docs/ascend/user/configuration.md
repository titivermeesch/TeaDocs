---
sidebar_position: 3
title: Configuration
---

# Configuration

Ascend reads everything game-specific from `plugins/Ascend/config.yml`. This page covers the main sections admins tune: `stage-order:`, `stages:`, `abilities:`, and `sidebar:`. Top-level `game:` and `lifecycle:` are lighter and documented inline below.

Reload with `/tea reload` after editing.

## `game:` - match behavior

```yaml
game:
  devolve-on-death: true
  max-match-seconds: 300
  celebration-fireworks: 5
  death-spectator-seconds: 3
```

- `devolve-on-death` - when a player dies, drop one stage (floor at 0). Set `false` for pure kill-accumulation.
- `max-match-seconds` - hard LIVE cap. `0` disables. When reached, highest-stage player wins; ties = no winner.
- `celebration-fireworks` - fireworks spawned at the winner on victory.
- `death-spectator-seconds` - seconds held in SPECTATOR before respawning.

## `lifecycle:` - phase timers

```yaml
lifecycle:
  max-wait-seconds: 120
  countdown-seconds: 30
  starting-seconds: 5
  ending-seconds: 10
  title-countdown-threshold: 10        # at or below this many seconds, big title overlay kicks in
  chat-announce-at-seconds: [30, 15]   # chat announcements above the threshold
```

Seconds at or below `title-countdown-threshold` use a big title + pling; anything in `chat-announce-at-seconds` above the threshold posts a chat message. As admin, `/tea arena start <id>` collapses the current phase timer so a match can be kicked off without waiting.

## `stage-order:` - the ladder

The ladder is driven by the top-level `stage-order:` array. Stage ids appear in this list in the order players progress through them; the last id is the apex (the winning stage). Stage ids defined under `stages:` but absent from this list are simply ignored - leave them off to disable.

```yaml
stage-order:
  - iron_golem
  - blaze
  - spider
  - creeper
  - slime
  - chicken
```

To swap, reorder, or add stages, edit this list. To use one of the bundled extras (`wither_skeleton`, `piglin`, `enderman`, `wolf`, `phantom`, `magma_cube`, `warden`), insert its id where you want it on the ladder.

If `stage-order` is missing or empty, Ascend falls back to the hardcoded default ladder (Iron Golem → Blaze → Spider → Creeper → Slime → Chicken) and logs a warning.

## `stages:` - per-stage tuning

Each entry under `stages:` defines the stats and ability for one stage id. The id is the YAML key. Order in `stages:` doesn't matter - the ladder is taken from `stage-order:`.

```yaml
stages:
  iron_golem:
    name-key: ascend.stage.iron_golem
    ability: ground_pound
    mob-type: IRON_GOLEM
    combat-item: IRON_INGOT
    max-health: 40
    melee-damage: 6
    walk-speed: 0.20
    knockback-resistance: 0.5
  blaze:
    # ...
```

### All stage fields

| Field | Type | Default | What it does |
| ----- | ---- | ------- | ------------ |
| `name-key` | string | `ascend.stage.<id>` | Translation key for the stage display name. |
| `ability` | string | none | Id of a registered `StageAbility` (or blank/missing for no ability). |
| `mob-type` | EntityType | none | Bukkit `EntityType` name used for the morph. |
| `head-material` | Material | none | Optional worn helmet. |
| `combat-item` | Material | `STICK` | Hotbar slot-0 flavor item; damage comes from `melee-damage`, not this. |
| `info-icon` | Material | `MobHeads.iconFor(mob-type)` | Slot-8 icon in the stage info item. |
| `max-health` | double | `20.0` | Half-hearts of max HP. |
| `melee-damage` | double | `3.0` | Half-hearts per punch. |
| `walk-speed` | double | `0.22` | `Player.setWalkSpeed` value (`0.20` = vanilla). |
| `knockback-resistance` | double 0.0-1.0 | `0.0` | `1.0` = total immunity. |
| `fall-damage-multiplier` | double 0.0-1.0 | `1.0` | `0` = immune, `0.5` = half, `1` = full. |
| `water-damage` | bool | `false` | Takes damage while touching water. |
| `speed-amplifier` | int | `0` | `0` = none, `1` = Speed I, `2` = Speed II. |
| `double-jump` | bool | `false` | Allows a mid-air leap (Chicken). |
| `mob-size` | int | `0` | Slime / magma cube morph size (vanilla values are 1, 2, 4). `0` keeps the LibsDisguises default. |

If you add brand new stages, don't forget to add matching translation keys (`ascend.stage.<id>`) to every `plugins/Ascend/lang/*.yml`, and slot the id into `stage-order`.

## `abilities:` - per-ability tuning

Every ability ships its full tuning surface as YAML keys under `abilities.<id>`. Durations, damages, and cooldowns are all in ticks (20 ticks = 1s) unless otherwise noted. Omit a key to keep the bundled default. The bundled `config.yml` lists every ability and every key with comments.

```yaml
abilities:
  flamethrower:
    duration-ticks: 30
    tick-damage: 0.5
    fire-ticks: 40
    tick-interval: 4
    range: 4.5
    cone-width: 1.2
    cooldown-ticks: 80
  sulphur_bomb:
    damage: 9.0
    radius: 4.5
    knockback: 1.4
    max-flight-ticks: 40
    cooldown-ticks: 60
  ground_pound:
    radius: 4.0
    damage: 4.0
    cooldown-ticks: 200
    launch-velocity: 1.2
  # ... web, slime_slam, blink, crossbow_volley, dive_bomb, egg_blaster,
  # double_jump, fireball, leap_rip, molten_bounce, sonic_boom, soul_slash
  # all expose their full tuning surface; see the bundled config for the
  # complete list of keys.
```

The `double_jump` block tunes the chicken's mid-air leap (`forward`, `up`) and its anti-hover cooldown (`cooldown-ms`).

## `sidebar:` - per-state scoreboard

Ascend attaches a per-player scoreboard to everyone in the arena. Lines are MiniMessage templates with theme tags like `<primary>`, `<accent>`, `<muted>` and per-state placeholders:

```yaml
sidebar:
  title: "<primary><bold>Ascend</bold></primary>"
  waiting:
    - "<secondary>Kit:</secondary> <accent><kit></accent>"
    - "<secondary>Waiting for</secondary> <accent><waiting-for></accent> <secondary>more</secondary>"
  countdown:
    - "<secondary>Kit:</secondary> <accent><kit></accent>"
    - "<secondary>Starting in</secondary> <accent><seconds>s</accent>"
  live:
    - "<secondary>Kit:</secondary> <accent><kit></accent>"
    - "<secondary>Ability:</secondary> <accent><ability></accent>"
    - ""
    - "<primary>Players:</primary>"
    - "@players: <accent><player-name></accent> <secondary>(<player-stage>/<max>)</secondary>"
    - ""
    - "<secondary>Time:</secondary> <accent><time></accent>"
  ended:
    - "<accent><winner></accent> <success>wins!</success>"
    - "<secondary>Your final stage:</secondary> <accent><stage>/<max></accent>"
```

### Per-state placeholders

- `waiting` - `<kit>`, `<waiting-for>`, `<min>`, `<time>`, `<seconds>`
- `countdown` - `<kit>`, `<time>`, `<seconds>`
- `live` - `<kit>`, `<stage>`, `<max>`, `<kills>`, `<alive>`, `<time>`, `<seconds>`, `<ability>`, `<ability-hint>`, `<ability-cooldown>`
- `ended` - `<kit>`, `<stage>`, `<kills>`, `<winner>`

`<time>` renders as `mm:ss` (or `hh:mm:ss` for long matches). Raw seconds are on `<seconds>`.

### `@players:` expansion

Any line starting with `@players:` is expanded to one line per arena participant; the viewer's own line gets a `(you)` suffix. Per-player placeholders inside an `@players:` template: `<player-name>`, `<player-stage>`, `<player-stage-name>`, `<player-ability>`.

Max ~14 lines per state after `@players:` expansion - beyond that, scoreboard slots run out.

## Chat and stats

Ascend uses TeaCore's chat router, so the kill feed and game messages stay inside the arena and don't leak across matches running on the same server.

Per-match results are written to the `ascend_stats` table (`uuid`, `kills`, `deaths`, `evolves`, `games_played`, `games_won`). Schema is applied by TeaCore's migration runner on first boot from `V001__init.sql`. Query per-player totals with `/tea stats [player]`.
