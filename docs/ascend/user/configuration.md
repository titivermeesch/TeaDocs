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
| `ability` | string | none | Ability id (see [the ability list](../dev/custom-stages.md)), or blank/missing for no ability. |
| `mob-type` | EntityType | none | Bukkit `EntityType` name used for the morph. |
| `head-material` | Material | none | Optional worn helmet. |
| `combat-item` | Material | `STICK` | Hotbar slot-0 flavor item; damage comes from `melee-damage`, not this. |
| `info-icon` | Material | the mob's head | Slot-8 icon in the stage info item. |
| `max-health` | double | `20.0` | Half-hearts of max HP. |
| `melee-damage` | double | `3.0` | Half-hearts per punch. |
| `walk-speed` | double | `0.22` | Walking speed (`0.20` = vanilla). |
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

TeaCore draws this sidebar for everyone in an Ascend arena, with one line list per phase. Lines are MiniMessage templates with theme tags like `<primary>`, `<accent>` and `<muted>`, plus placeholders:

```yaml
sidebar:
  enabled: true
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

### Placeholders

Every line can use TeaCore's built-in sidebar tags (`<map>`, `<players>`, `<max-players>`, `<waiting-for>`, `<seconds>`, `<time>`, `<kit>`, `<winner>` and more, see [Sidebars](../../tea/user/sidebars.md)) and any `%placeholderapi%` placeholder. Ascend adds:

- `<stage>` and `<max>` - your stage and the apex stage number
- `<kills>` - your kills this match
- `<alive>` - players in the arena
- `<ability>`, `<ability-hint>`, `<ability-cooldown>` - your current ability, its hint, and `Ready` or the seconds left

`<time>` renders as `m:ss`. Raw seconds are on `<seconds>`.

### `@players:` rows

A line starting with `@players:` repeats once per player in the arena. Inside it you can use `<player-name>` (your own row gets ` (you)`), `<player-stage>`, `<player-stage-name>` and `<player-ability>`, plus TeaCore's row tags such as `<player-kills>`.

Keep each phase at 15 lines or fewer after `@players:` expansion; a sidebar has no room for more.

### Turning it off

Set `enabled: false` here, turn off `features.games.ascend.sidebar` in TeaCore's `config.yml`, or let players hide it themselves with `/board`. See [Optional features](../../tea/user/features.md).

## Chat and stats

Ascend uses TeaCore's chat router, so the kill feed and game messages stay inside the arena and don't leak across matches running on the same server.

Ascend keeps per-player totals (kills, deaths, evolves, games played, games won) in the `ascend_stats` table, which it creates on first start. Players see them with `/stats`, admins with `/stats <player>`. Ascend also adds `%tea_ascend_stage%` (current stage, counting from 1), `%tea_ascend_stage_index%` (counting from 0), `%tea_ascend_stage_max%` and `%tea_ascend_evolutions%`. You can read the totals through placeholders such as `%tea_ascend_games_won%`, and as leaderboards such as `%tea_top_ascend_games_won_1_name%`. TeaCore separately counts kills, deaths, assists, wins and losses across all Tea games. See [Placeholders](../../tea/user/placeholders.md) and [Kill credit](../../tea/user/kill-credit.md).
