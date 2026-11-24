---
sidebar_position: 2
title: Gameplay
---

# Gameplay

Fireball is a timed team fight. Players throw fireballs, knock each other off the map and score kills for their team. The team with the most kills when time runs out wins.

## Match flow

1. **Waiting and countdown.** Players gather in the map's waiting spawn until enough have joined. TeaCore runs the countdown.
2. **Start.** Fireball puts each player on a team and teleports them to their team's spawn with their kit. Chat says `You are on Red team.` Fireball fills the map chests.
3. **Fight.** The match runs for `game.max-match-seconds` (default 300 = 5 minutes). Every kill adds 1 to the killer's team score.
4. **Sudden death.** In the last 30 seconds, meteors fall on random players.
5. **End.** The team with the most kills wins. Chat shows a match summary.

Everyone starts the fight with spawn protection, so you can't be hit in the first seconds.

## Player commands

- `/play fireball`: join a Fireball arena.
- `/play fireball <mapId>`: queue for a specific map.
- `/leave`: leave the current arena.
- `/kit`: pick a kit (see [Kits](#kits)).
- `/stats`: see your stats.
- `/board`: hide or show the sidebar.

These all come from TeaCore. Fireball's own admin command is in [Commands and placeholders](./commands-and-placeholders.md).

## Throwing fireballs

Fireballs are fire charge items. Each one is tagged with its type, for example `Explosive Fireball`, and its description says what it does. Hold one and right-click to throw it.

### Charge throw

Hold right-click to charge. While it charges, a bar on the action bar fills up (`Charging ||||||.... 60%`), flames gather in front of you and you hear a rising tick. The longer you hold, the faster the fireball flies:

![Charging a throw: the bar fills on the action bar](/img/fireball/charge.png)

- Let go to throw. The throw fires a moment after you release (about 0.26 seconds by default).
- At full charge (1.5 seconds by default) it throws by itself at maximum speed.
- A quick tap throws at minimum speed after that short delay.

A charged throw flies up to 2.25 times as fast as a tap. Turn charging off with `charge.enabled: false`; then a click throws at once.

After a throw, that fireball type recharges for its `cooldown-ms`. On 1.11.2 and newer the hotbar item shows the white cooldown sweep. For cooldowns of 0.6 seconds or more, the action bar also fills a `Reloading` bar and says `Ready` with a click when you can throw again.

### Cooldowns and ammo

Each type has its own cooldown. After any throw, you must wait the cooldown of the type you want to throw next. If you try too early, the action bar says `That fireball is still charging.`

There are two ammo modes (`ammo.mode`):

- **items** (default): every throw uses up one fireball item. When you run out: `Out of fireballs!`
- **heat**: throws do not use up items. Instead, each throw costs heat from a bar that refills over time. Your XP bar shows the heat you have left, and your level shows it as a percent. Stronger types cost more heat. If you do not have enough: `Overheated - wait for your fireballs to cool down.` You still need at least one item of a type to throw it.

### Fireball jump

Your own fireball's blast launches you, even with friendly fire off. Throw one at your feet to jump forward and up. By default it does no damage to you (`fireball-jump.self-damage: 0`).

![A fireball jump](/img/fireball/jump.png)

The first time you land within 4 seconds of a fireball jump, you take no fall damage. Later landings deal normal fall damage.

### Deflection

Swing (left-click) at an incoming fireball to send it back. It must be within about 5 blocks and roughly in front of you. It flies off in the direction you are looking, at least as fast as it was going.

![Punching an incoming fireball back](/img/fireball/deflect.png)

By default the deflected fireball becomes yours: if it kills someone, you get the kill, and it can now hurt the player who threw it.

## Fireball types

Basic, Explosive, Chain, Cluster, Homing and Singularity explosions never break blocks. With friendly fire off (the default), effects skip you and your teammates.

![A fireball's description in the inventory](/img/fireball/lore.png)

| Type | What it does |
| ---- | ------------ |
| Basic | A small explosion on impact. Cheap and fast to throw. |
| Explosive | A large explosion plus five smaller blasts scattered around the impact, with a brief burst of flames. |
| Chain | Explodes, then jumps to the nearest enemy within 8 blocks that it has not hit yet. Up to 4 jumps. |
| Frost | Turns air and water under the impact into ice for 5 seconds. Enemies within 4 blocks get Slowness III and Weakness for 5 seconds. No explosion. |
| Void | Teleports enemies within 6 blocks to a random spot up to 20 blocks away, with a short Nausea. No explosion. |
| Lightning | A lightning strike. Enemies within 8 blocks take damage and get Slowness II and Weakness for 4 seconds. |
| Cluster | A small explosion that throws 5 basic fireballs in random directions. |
| Homing | Curves toward the nearest enemy within 20 blocks while it flies, then explodes. |
| Singularity | Pulls enemies within 8 blocks toward the impact for 1.5 seconds, then bursts in an explosion. |
| Meteor | On impact, a meteor falls from 40 blocks above that spot and explodes. |
| Toxic | Leaves a cloud for 6 seconds. Enemies inside get Poison and Blindness. No explosion. |

Each type flies with a trail in its own colour and bursts in that colour where it lands, so you can tell what is coming at you. Change a colour with `fireballs.<type>.color: "#RRGGBB"`, or turn the particles off with `fireball-trails: false`.

All numbers above are defaults. You can tune or turn off each type in [`fireballs:`](./configuration.md#fireballs-fireball-types).

Explosion damage is capped (`game.max-explosion-damage`, default 12 = 6 hearts before armor), so no single blast can kill a full-health player on its own.

Fireball removes missed fireballs after 10 seconds and clears every fireball in the arena when the match ends.

## Building and craters

Every spawn gives you 32 wool in your team colour. Place it to bridge gaps or build cover; enemy fireballs blow it up again. Depending on the server's settings (`blocks.explosion-damage`), fireballs also blast holes in the arena floor, except right around each team's spawn. Fall through a hole and the void gets you.

## Deaths and respawns

- You never see the death screen. When you would die, you become a spectator floating a few blocks above where you died, looking down at the fight, with a `You died` title counting down (`Respawning in 3...`). After 3 seconds (`game.respawn-delay-seconds`) you respawn at your team's spawn.
- Falling off the map kills you 6 blocks below its lowest block (`void-kill-depth`), so you don't wait through a long fall. While you wait to respawn you float above your base instead, so the void can't kill you again.
- On respawn your health is full, your potion effects are cleared, your heat bar is full, and your inventory is reset to your kit. You lose items from chests and the shop when you die. You keep your coins.
- After each respawn you are protected for 4 seconds (`game.respawn-protection-seconds`). Enemy hits and fireball effects do nothing to you. The action bar says `You are protected for a moment - get moving!`
- Hunger is off. Your food bar stays full the whole match.

![Floating above the spot you died, counting down to respawn](/img/fireball/respawn.png)

## Kills, assists and coins

Kill and assist credit follow TeaCore's combat tracking: if you hit an enemy and they die soon after (also by falling into the void), you get the kill. Players who also hit the victim recently get an assist. See [Kill credit](../../tea/user/kill-credit.md).

- **Kill**: your team gets 1 point. You get 10 coins.
- **Assist**: you get 5 coins. Chat says `Assist on <victim>! +5 coins`.
- **Void kill**: announced to the match: `<victim> was launched into the void by <killer>!`

Fireball credits fireballs, cannon shots, chain jumps, poison, lightning and the singularity burst to the player who threw or fired them. A death with no credited killer does not score.

Coins exist only for the current match and reset at the start of the next one.

## Shop

During a match, shopkeeper villagers stand on the map. Right-click one to open the shop, then click an item to buy one fireball. Map authors place shopkeepers with `/tea map shop`; a map without any gets one next to each team's spawn. With `shop.villager: false` you get a Nether Star in your last hotbar slot instead, which opens the same shop. The shopkeeper is a [TeaCore NPC](../../tea/user/npcs.md), so you can change its look in TeaCore's config.

![A shopkeeper next to the team spawn](/img/fireball/shop-npc.png)
![The shop menu](/img/fireball/shop-menu.png)

The shop sells every fireball type. Each item keeps its description, with the price and your balance under it. Default prices:

| Fireball | Price |
| -------- | ----- |
| Basic | 5 coins |
| Chain, Frost, Toxic | 25 coins |
| Explosive, Homing | 30 coins |
| Lightning, Cluster | 35 coins |
| Void | 40 coins |
| Singularity | 50 coins |
| Meteor | 60 coins |

`shop.prices` sets the prices and the item list. The menu layout is in `plugins/Fireball/menus/shop.yml`.

## Kits

Your kit is your starting loadout. You get it at the start and again on every respawn. Pick one with `/kit` (or `/kit fireball` from the lobby). If you never pick one, you get the first kit in the config.

![The kit picker](/img/fireball/kit.png)

| Kit | Unlock cost | Gear | Fireballs |
| --- | ----------- | ---- | --------- |
| Pyromancer | free | Iron sword, leather chestplate | 8 Basic, 3 Explosive |
| Trickster | 250 | Stone sword, bow, 16 arrows | 4 Chain, 2 Void |
| Frostweaver | 500 | Iron sword, iron chestplate, iron helmet | 5 Frost, 2 Lightning |

You pay the unlock cost once, in the server's economy currency (through Vault), not in match coins. After that the kit is yours for good. See [Economy](../../tea/user/economy.md).

## Chests

At the start of each match, Fireball fills the chests marked on the map with 10 to 15 random items: bows, swords, armor, golden apples, arrows, ender pearls, fishing rods, water buckets, ladders, healing potions, and rarer fireballs (Explosive, Chain, Meteor, Singularity).

## Cannons

Cannons are blocks on the map. During a match a fire charge spins above each one, under a floating label with its name, the fireball it fires and whether it is ready, plus flames while it is ready and smoke while it reloads. The fire charge stops spinning while the cannon reloads. Right-click or hit the fire charge (or right-click the cannon block) to fire in the direction you are looking. Shots never go below level, so looking down at the cannon to click it still fires across the map. The shot counts as yours. Cannons can't be broken, by hand or by explosions.

![A ready cannon: label, flames and the spinning fire charge](/img/fireball/cannon.png)
![Firing a cannon](/img/fireball/cannon-fire.png)

Each cannon has its own cooldown, shared by everyone. If it is not ready, the action bar says `The cannon is reloading.` The default cannon types are:

| Cannon | Fires | Cooldown |
| ------ | ----- | -------- |
| Rapid | Basic, very fast | 0.6 s |
| Heavy | Meteor | 5 s |
| Homing | Homing | 3.5 s |

The map's first cannon is Rapid, the second Heavy, the third Homing, the fourth Rapid again, and so on.

## Power-ups

Every 45 seconds a glowing fireball item drops at one of the map's power-up points. It is a random Meteor, Singularity or Cluster. Chat announces `A power-up has appeared at the center!`. The first player to walk over it picks it up, and chat tells the whole match who grabbed it.

## Sudden death

In the last 30 seconds of a match, everyone sees a `SUDDEN DEATH!` title. A meteor then falls on a random living player every 2.5 seconds. Meteors belong to no team and hurt everyone.

## Winning

- **Time runs out**: the team with the most kills wins: `Red team wins with 12 kills!`
- **Draw**: if the top teams are tied, or nobody scored, the match is a draw.
- **Forfeit**: if every player on the other team(s) leaves during the match, the team still in the arena wins at once: `Red team wins - every opponent left the match.` If everyone leaves, the match ends with no winner.
- **Ended by staff**: a staff member can end a match from TeaCore's [arena manager](../../tea/user/arena-manager.md), choosing the winning team or a draw. Chat shows the usual result line and the summary, and stats count it like a normal finish.

Forfeit results count only in the `Ended early` and `Won (ended early)` stats. They do not count as games played or games won, so leaving cannot boost anyone's win rate. See [Stats](./commands-and-placeholders.md#stats).

## Victory

When the match ends, every player gets a title:

![The winning team's view at the end of a match](/img/fireball/victory.png)

- **Winners** see `VICTORY!` and hear a fanfare. Fireworks in the team's colour burst around them, and they can fly for the few seconds before everyone goes back to the lobby. The MVP's subtitle says `You're the MVP with 9 kills!`
- **Losers** see `DEFEAT` with the winning team's name.
- **A draw** shows `DRAW` to everyone.

The MVP also gets a burst of particles. The titles are under `fireball.end` in the language file.

## Match summary

When a match ends, chat shows a summary:

![The match summary in chat](/img/fireball/end.png)

```
Match summary
MVP: Steve with 9 kills
- Steve 9 kills / 2 deaths / 3 assists
- Alex 6 kills / 4 deaths / 1 assists
...
```

The MVP is the player with the most kills. Fewer deaths breaks a tie. If nobody got a kill, there is no MVP.

## Achievements

| Achievement | How to get it |
| ----------- | ------------- |
| First Blood | Get the first kill of a match. |
| Killing Spree | Get 5 kills in one match. |
| Void Lord | Knock an enemy into the void. |
| Champion | Win a match (forfeit wins do not count). |
| Centurion | Reach 100 lifetime kills. |
