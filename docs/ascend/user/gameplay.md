---
sidebar_position: 2
title: Gameplay
---

# Gameplay

Ascend is a free-for-all match where every player starts as the same basic mob and evolves their way up a ladder of increasingly dangerous forms. The first player to reach the apex stage **and** land one more kill + complete one more evolve ritual wins.

## Core loop

1. Kill an opponent. This unlocks one evolve charge.
2. Stand on solid ground, hold sneak for 3 seconds (2 with the Quick Evolver kit). No damage in that window.
3. The [evolution ceremony](#evolution-ceremony) plays and your morph advances one stage.
4. Repeat until you've climbed to the apex (Chicken by default), then get one more kill and one more evolve to win.

The apex stage does **not** auto-win on arrival. Once at the apex, the player must land one more kill AND complete one more sneak-evolve ritual before the match ends. This keeps the final stretch contested instead of degenerating into a victory lap.

## Player commands

- `/play ascend` - join any available Ascend arena (queues if cross-server).
- `/play ascend <mapId>` - queue for a specific map.
- `/leave` - drop out of the current arena.
- `/chat match | team | staff | global` - switch chat scope.

Kit selection happens through the in-game kit-selector GUI - right-click the Nether Star in the waiting area to open it.

You can also queue by right-clicking a connection sign an admin has bound via `/tea lobby sign bind ascend [mapId]` (see the [Tea user guide](../../tea/user/configuring-network-mode.md) for sign/spawn admin details).

## Admin commands

Arena and lobby admin commands are shipped by Tea - see the [Tea user guide](../../tea/user/configuring-network-mode.md). The ones you'll reach for most often with Ascend:

- `/tea arena allocate ascend [map]` - force-allocate an arena (for testing).
- `/tea arena start <arenaId>` - fast-forward the current WAITING/COUNTDOWN phase.
- `/tea arena observe <arenaId>` - drop in as an invisible spectator.
- `/tea lobby sign bind ascend [map]` - bind a connection sign to Ascend.

## Default ladder

Ascend ships with 14 stage templates. 6 are enabled by default; the other 8 are scaffolded but disabled so you can swap them in by editing `plugins/Ascend/config.yml`.

| # | Stage | HP | Melee | Ability | Notes |
| - | ----- | -- | ----- | ------- | ----- |
| 0 | Iron Golem | 40 | 6 | Ground Pound | Starter. 50% knockback resist. |
| 1 | Blaze | 32 | 5 | Flamethrower | No fall damage. Takes damage in water. |
| 2 | Spider | 36 | 5 | Web Shot | No fall damage. Speed I. |
| 3 | Creeper | 28 | 4 | Sulphur Bomb | Throwable coal that detonates. |
| 4 | Slime | 22 | 4 | Slime Slam | Half fall damage. |
| 5 | Chicken (apex) | 16 | 3 | Egg Blaster | No fall damage. Double jump (space mid-air). |

See [Configuration](./configuration.md) for how to edit, reorder, enable, or disable stages.

## Abilities

Each stage has exactly one ability. The full catalog of 14 shipped abilities:

| Id | Behavior |
| -- | -------- |
| `ground_pound` | AoE hurt + upward launch within 4 blocks (Iron Golem). |
| `slime_slam` | Mid-air ground-pound that deals AoE damage on landing (Slime). |
| `sulphur_bomb` | Throwable coal projectile, detonates on impact or at max flight. Configurable radius/damage/knockback (Creeper). |
| `web` | Fires a web projectile that slows on hit (Spider). |
| `flamethrower` | Cone-shaped sustained stream, sets targets on fire. Fully tunable (Blaze). |
| `egg_blaster` | Chicken's egg projectile; detonates in AoE on hit. |
| `blink` | Short teleport in aim direction (Enderman). |
| `leap_rip` | Pounce + bleed damage (Wolf). |
| `crossbow_volley` | Multi-arrow volley (Piglin). |
| `soul_slash` | Withering cleave (Wither Skeleton). |
| `molten_bounce` | Bouncy AoE slam (Magma Cube). |
| `fireball` | Launches a small fireball (Ghast). |
| `sonic_boom` | Line-AoE shockwave (Warden). |
| `dive_bomb` | Aerial nosedive attack (Phantom). |

Two abilities are config-driven today (`flamethrower` and `sulphur_bomb`); the rest use hardcoded defaults inside their ability class. See [Configuration](./configuration.md) for the tunable values.

## Kits

Three kits ship with Ascend. A player's currently-selected kit is applied when they join a match. Kits are passive perks - none of them grants an ability (those come from the stage the player is currently on).

- **Darwinist** - iron sword icon. Balanced starter, no perks.
- **Quick Evolver** - feather icon. Evolves in 2 seconds instead of 3.
- **Health Harvester** - golden apple icon. Heals 4 HP on every kill.

Right-click the Nether Star in the waiting area to open the kit-selector GUI and choose one. Selection persists per player across matches.

## Death flow

When a player dies in Ascend:

1. They're put in SPECTATOR mode for `game.death-spectator-seconds` (default 3).
2. If `game.devolve-on-death: true` (default), their stage drops by one (floor at 0).
3. They're respawned at a participant spawn in the arena with the stage's loadout and HP.

Set `devolve-on-death: false` in `plugins/Ascend/config.yml` if you want pure kill-accumulation: dying never costs you progress.

## Evolution ceremony

When a player evolves, they don't just morph in place. Instead:

1. The player is moved to SPECTATOR at the map's `evolution-viewer` extra spawn.
2. A ticker teleport-locks them there for the duration of the ceremony so they can't fly off.
3. A fake old-stage mob is spawned at the `evolution-mob` extra spawn via PacketEvents - the spawn packet is sent to **only** the evolving player, so nobody else in the arena sees anything.
4. Particle burst + sound effects play, the old mob despawns (client-side), and a new-stage mob packet-spawns facing the viewer.
5. The player is teleported back into a random participant spawn and the new stage is applied.

Multiple players can be evolving at the exact same time without interfering - each one has their own isolated mob puppet. The ceremony only runs when the map has both evolution spawns configured; otherwise Ascend falls back to an in-place evolve.

See [Map authoring](./map-authoring.md) for how to place the ceremony chamber on a new map.

## Morphs

In combat, players are visually disguised as their current stage's mob via LibsDisguises. These aren't puppet entities - the player is the disguise, and attackers hit the disguise hitbox normally. `viewSelfDisguise` is off, so players see themselves in first-person but their opponents see the morph.

## Win condition, timeouts, and ties

- First player to reach the apex stage and then land one more kill + evolve wins.
- `game.max-match-seconds` (default 300) is a hard cap on the LIVE phase. When reached, the player with the highest stage wins; ties result in no winner and the match resets.
- Admins can force-end by calling `/tea arena release <id>` (see [Tea troubleshooting](../../tea/user/troubleshooting.md)).
