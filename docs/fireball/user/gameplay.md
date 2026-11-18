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

Everyone starts the fight with spawn protection, so nobody gets hit in the first seconds.

## Player commands

- `/play fireball` - join a Fireball arena.
- `/play fireball <mapId>` - queue for a specific map.
- `/leave` - leave the current arena.
- `/kit` - pick a kit (see [Kits](#kits)).
- `/stats` - see your stats.
- `/board` - hide or show the sidebar.

These all come from TeaCore. Fireball's own admin command is in [Commands and placeholders](./commands-and-placeholders.md).

## Throwing fireballs

Fireballs are fire charge items. Each one is tagged with its type, for example `Explosive Fireball`. Hold one and right-click to throw it.

### Charge throw

Hold right-click to charge. You hear a rising tick while it charges. The longer you hold, the faster the fireball flies:

- Let go to throw. The throw fires a moment after you release (about 0.26 seconds by default).
- At full charge (1.5 seconds by default) it throws by itself at maximum speed.
- A quick tap throws at minimum speed after that short delay.

A charged throw flies up to 2.25 times as fast as a tap. Turn charging off with `charge.enabled: false`; then a click throws at once.

### Cooldowns and ammo

Each type has its own cooldown. After any throw, you must wait the cooldown of the type you want to throw next. If you try too early, the action bar says `That fireball is still charging.`

There are two ammo modes (`ammo.mode`):

- **items** (default) - every throw uses up one fireball item. When you run out: `Out of fireballs!`
- **heat** - throws do not use up items. Instead, each throw costs heat from a bar that refills over time. Your XP bar shows the heat you have left, and your level shows it as a percent. Stronger types cost more heat. If you do not have enough: `Overheated - wait for your fireballs to cool down.` You still need at least one item of a type to throw it.

### Fireball jump

Your own fireball's blast launches you, even with friendly fire off. Throw one at your feet to jump forward and up. By default it does no damage to you (`fireball-jump.self-damage: 0`).

The first time you land within 4 seconds of a fireball jump, you take no fall damage. Later landings deal normal fall damage.

### Deflection

Swing (left-click) at an incoming fireball to send it back. It must be within about 5 blocks and roughly in front of you. It flies off in the direction you are looking, at least as fast as it was going.

By default the deflected fireball becomes yours: if it kills someone, you get the kill, and it can now hurt the player who threw it.

## Fireball types

Basic, Explosive, Chain, Cluster, Homing and Singularity explosions never break blocks. With friendly fire off (the default), effects skip you and your teammates.

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

All numbers above are defaults. You can tune or turn off each type in [`fireballs:`](./configuration.md#fireballs---fireball-types).

Explosion damage is capped (`game.max-explosion-damage`, default 12 = 6 hearts before armor), so no single blast can kill a full-health player on its own.

Fireball removes missed fireballs after 10 seconds and clears every fireball in the arena when the match ends.

## Deaths and respawns

- You never see the death screen. When you would die, you become a spectator for 2 seconds (`game.respawn-delay-seconds`), then respawn at your team's spawn.
- Falling into the void always kills you.
- On respawn your health is full, your potion effects are cleared, your heat bar is full, and your inventory is reset to your kit. You lose items from chests and the shop when you die. You keep your coins.
- After each respawn you are protected for 4 seconds (`game.respawn-protection-seconds`). Enemy hits and fireball effects do nothing to you. The action bar says `You are protected for a moment - get moving!`
- Hunger is off. Your food bar stays full the whole match.

## Kills, assists and coins

Kill and assist credit follow TeaCore's combat tracking: if you hit an enemy and they die soon after (also by falling into the void), you get the kill. Players who also hit the victim recently get an assist. See [Kill credit](../../tea/user/kill-credit.md).

- **Kill** - your team gets 1 point. You get 10 coins.
- **Assist** - you get 5 coins. Chat says `Assist on <victim>! +5 coins`.
- **Void kill** - announced to the match: `<victim> was launched into the void by <killer>!`

Fireball credits fireballs, cannon shots, chain jumps, poison, lightning and the singularity burst to the player who threw or fired them. A death with no credited killer does not score.

Coins exist only for the current match and reset at the start of the next one.

## Shop

While the shop is on, every spawn gives you a Nether Star in your last hotbar slot. Right-click it to open the shop. Click an item to buy one fireball.

Default prices:

| Fireball | Price |
| -------- | ----- |
| Explosive | 30 coins |
| Singularity | 50 coins |
| Meteor | 60 coins |

`shop.prices` sets the prices and the item list. The menu layout is in `plugins/Fireball/menus/shop.yml`.

## Kits

Your kit is your starting loadout. You get it at the start and again on every respawn. Pick one with `/kit` (or `/kit fireball` from the lobby). If you never pick one, you get the first kit in the config.

| Kit | Unlock cost | Gear | Fireballs |
| --- | ----------- | ---- | --------- |
| Pyromancer | free | Iron sword, leather chestplate | 8 Basic, 3 Explosive |
| Trickster | 250 | Stone sword, bow, 16 arrows | 4 Chain, 2 Void |
| Frostweaver | 500 | Iron sword, iron chestplate, iron helmet | 5 Frost, 2 Lightning |

You pay the unlock cost once, in the server's economy currency (through Vault), not in match coins. After that the kit is yours for good. See [Economy](../../tea/user/economy.md).

## Chests

At the start of each match, Fireball fills the chests marked on the map with 10 to 15 random items: bows, swords, armor, golden apples, arrows, ender pearls, fishing rods, water buckets, ladders, healing potions, and rarer fireballs (Explosive, Chain, Meteor, Singularity).

## Cannons

Cannons are blocks on the map. Right-click one to fire a fireball in the direction you are looking. The shot counts as yours. Nobody can break a cannon.

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

- **Time runs out** - the team with the most kills wins: `Red team wins with 12 kills!`
- **Draw** - if the top teams are tied, or nobody scored, the match is a draw.
- **Forfeit** - if every player on the other team(s) leaves during the match, the team still in the arena wins at once: `Red team wins - every opponent left the match.` If everyone leaves, the match ends with no winner.

Forfeit results count only in the `Ended early` and `Won (ended early)` stats. They do not count as games played or games won, so leaving cannot boost anyone's win rate. See [Stats](./commands-and-placeholders.md#stats).

## Match summary

When a match ends, chat shows a summary:

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
