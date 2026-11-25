---
sidebar_position: 2
title: Gameplay
---

# Gameplay

Ascend is a free-for-all match. Every player starts as the same basic mob and evolves up a ladder of stronger forms. To win, you reach the apex stage **and** then land one more kill and complete one more evolve ritual.

## Core loop

1. Kill an opponent. This unlocks one evolve charge.
2. Stand on solid ground, hold sneak for 3 seconds (2 with the Quick Evolver kit).
3. The [evolution ceremony](#evolution-ceremony) plays and your morph advances one stage.
4. Repeat until you've climbed to the apex (Chicken by default), then get one more kill and one more evolve to win.

![Players fighting in an Ascend arena](/img/ascend/fight.jpg)

While you hold sneak, a ring of light closes in around you and your XP bar fills. Let go of sneak or leave the ground and the progress resets.

![A player sneaking to evolve](/img/ascend/evolve.jpg)

Reaching the apex stage does **not** win the match by itself. At the apex, you must land one more kill AND complete one more sneak-evolve ritual before the match ends, so the other players still get a chance to stop you.

## Player commands

- `/play ascend`: join any available Ascend arena (queues if cross-server).
- `/play ascend <mapId>`: queue for a specific map.
- `/leave`: leave the current arena.
- `/chat match | team | staff | global`: switch chat scope.

To pick a kit, right-click the Nether Star in the waiting area to open the kit selector.

You can also queue by right-clicking a connection sign an admin has bound via `/tea lobby sign bind ascend [mapId]` (see the [Tea user guide](../../tea/user/configuring-network-mode.md) for sign/spawn admin details).

## Admin commands

Tea provides the arena and lobby admin commands. See the [Tea user guide](../../tea/user/configuring-network-mode.md). The ones you will use most with Ascend:

- `/tea arena allocate ascend [map]`: force-allocate an arena (for testing).
- `/tea arena start <arenaId>`: fast-forward the current WAITING/COUNTDOWN phase.
- `/tea arena observe <arenaId>`: drop in as an invisible spectator.
- `/tea lobby sign bind ascend [map]`: bind a connection sign to Ascend.

## Default ladder

Ascend ships with more stages than the default ladder uses. The extra ones are defined but inactive; add them to `stage-order:` in `plugins/Ascend/config.yml` to use them.

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

Each stage has one ability. The abilities that ship with Ascend:

![A Blaze using Flamethrower](/img/ascend/flamethrower.jpg)

| Id | Behavior |
| -- | -------- |
| `ground_pound` | AoE hurt + upward launch within 4 blocks (Iron Golem). |
| `slime_slam` | Mid-air ground-pound that deals AoE damage on landing (Slime). |
| `sulphur_bomb` | Throwable coal projectile, detonates on impact or at max flight. Configurable radius/damage/knockback (Creeper). |
| `web` | Fires a web projectile that slows on hit (Spider). |
| `flamethrower` | Cone-shaped sustained stream, sets targets on fire. Tunable (Blaze). |
| `egg_blaster` | Chicken's egg projectile; detonates in AoE on hit. |
| `fireball` | Slow fireball that bursts on contact, hurting and burning everyone nearby, without breaking blocks (Ghast). |
| `blink` | Short teleport in aim direction (Enderman). Lands on the furthest spot with ground and room to stand before any wall; does nothing if there is none. |
| `leap_rip` | Pounce + bleed damage (Wolf). |
| `crossbow_volley` | Multi-arrow volley (Piglin). |
| `soul_slash` | Withering cleave (Wither Skeleton). |
| `molten_bounce` | Bouncy AoE slam (Magma Cube). |
| `sonic_boom` | Line-AoE shockwave (Warden). |
| `dive_bomb` | Aerial nosedive attack (Phantom). |

You tune each ability's cooldowns, damage, range, durations, knockback and fire ticks under `abilities.<id>:` in `plugins/Ascend/config.yml`. See [Configuration](./configuration.md) for the tunable values.

## Kits

Ascend ships with a few kits. A player gets their selected kit when they join a match. Kits give passive perks and no abilities; abilities come from the player's current stage.

- **Darwinist**: iron sword icon. Balanced starter, no perks.
- **Quick Evolver**: feather icon. Evolves in 2 seconds instead of 3.
- **Health Harvester**: golden apple icon. Heals 4 HP on every kill.

Right-click the Nether Star in the waiting area to open the kit-selector GUI and choose one. Ascend remembers each player's choice across matches.

## Death flow

When a player dies in Ascend:

1. They go into SPECTATOR mode for `game.death-spectator-seconds` (default 3).
2. If `game.devolve-on-death: true` (default), their stage drops by one (floor at 0).
3. They respawn at a participant spawn in the arena with the stage's loadout and HP.

Set `devolve-on-death: false` in `plugins/Ascend/config.yml` so dying never costs progress.

## Evolution ceremony

When a player evolves, Ascend moves them to a private ceremony chamber instead of morphing them in place:

1. They are locked into spectator view of the map's ceremony stand.
2. Their old morph stands in front of them, then dissolves in a particle + thunder burst.
3. Their new morph appears.
4. They return to a random participant spawn at the new stage.

Each player sees only their own ceremony. Other people in the arena see none of it, even when several players evolve at the same time.

See [Map authoring](./map-authoring.md) for how to place the ceremony chamber on a new map.

## Morphs

In combat, players appear as their current stage's mob, so opponents see and hit a Chicken, a Blaze, an Iron Golem and so on. You see yourself in first person as normal, which keeps the controls usable.

![A player disguised as an Iron Golem](/img/ascend/golem.jpg)

## Win condition, timeouts, and ties

- The first player to reach the apex stage and then land one more kill and evolve wins.
- `game.max-match-seconds` (default 300) is a hard cap on the LIVE phase. When reached, the player with the highest stage wins; ties result in no winner and the match resets.
- Staff can end a match from TeaCore's [arena manager](../../tea/user/arena-manager.md) (`/tea admin`), picking the winner or ending it as a draw. Chat announces the result and stats count it like a normal finish.
- Admins can also tear an arena down with `/tea arena release <id>` (see [Tea troubleshooting](../../tea/user/troubleshooting.md)).
