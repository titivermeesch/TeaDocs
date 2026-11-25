---
sidebar_position: 3
title: Configuration
---

# Configuration

Everything lives in `plugins/Overcharge/config.yml`.

You can also change these settings in game under `/tea admin`, then **Settings**, or on the dashboard's **Settings** page. A change there goes to every server that runs Overcharge. Energy, station, Stun Gun and respawn settings apply right away. Kits, teams, timings, the arena pool and the match length apply from the next match. Nothing in this file needs a restart.

If you edit the file by hand, run `/tea reload` afterwards.

| Key | Default | Meaning |
| --- | --- | --- |
| `lifecycle.*` | 120 / 30 / 5 / 10 | Wait, countdown, starting and ending times in seconds, like every Tea game. |
| `pool.*` | | How many arenas TeaCore keeps ready. |
| `teams.max-size` | `6` | Players per team. |
| `game.battery-target` | `100` | Charge a battery needs to win. |
| `game.max-match-seconds` | `600` | Match length before the fullest battery wins. |
| `game.overtime-seconds` | `120` | Longest overtime after a tie. Then the fullest battery wins, or the match is a draw. `0` calls a tie a draw straight away. |
| `game.respawn-delay-seconds` | `3` | Time dead before you respawn. |
| `game.respawn-protection-seconds` | `3` | Time you can't be hurt after a respawn. |
| `game.friendly-fire` | `false` | `true` lets teammates hurt each other. |
| `energy.spawn-seconds` | `3` | Seconds between cell drops. |
| `energy.max-on-ground` | `12` | Cells on the ground before drops pause. |
| `energy.cell-value` | `5` | Charge per cell. |
| `energy.carry-cap` | `50` | Most charge one player carries. |
| `energy.drop-on-death` | `0.75` | Share of your charge dropped when you die. |
| `energy.glow-above` | `0.5` | Carriers above this share of the cap glow. |
| `station.radius` | `2.5` | How close to the station you must crouch. |
| `station.charge-per-second` | `5` | Charge moved into the battery per second. |
| `stun-gun.range` | `10` | Blocks the stun gun reaches. |
| `stun-gun.cooldown-seconds` | `6` | Time between shots. |
| `stun-gun.slow-seconds` | `2` | How long a zapped player is slowed. |
| `stun-gun.knock-loose` | `10` | Charge a zap knocks out of the target. |

![A team station, where carriers crouch to charge the battery](/img/overcharge/station.png)

## Kits

Each entry under `kits:` is a kit in TeaCore's kit picker:

```yaml
kits:
  runner:
    cost: 0
    icon: FEATHER
    gear:
      - { material: STICK, name: "<yellow>Shove Stick", knockback: 2 }
      - { material: LEATHER_BOOTS, slot: 36 }
    effects: ["SPEED:1"]
```

`gear` takes materials or entries with `material`, `amount`, `slot` (36 to 39 are boots to helmet), `name`, `knockback` and `stun-gun: true`. `effects` are permanent effects as `NAME:level`, where level 0 is level I. A `cost` above 0 makes players buy the kit with coins first. Set a kit's `name` and `description` (MiniMessage) in the kit itself, or leave them out to use `lang/en_US.yml` under `overcharge.kit`. A kit with neither shows its id written out.

## Sidebar

The `sidebar:` section works like every [Tea game sidebar](../../tea/user/sidebars.md). Overcharge adds `<charge>`, `<carry-cap>`, `<battery>` and `<battery-target>`, and `<team-battery>` in `@teams:` rows.
