---
sidebar_position: 6
title: Troubleshooting
---

# Fireball troubleshooting

This page covers problems specific to Fireball. For engine problems (network mode, database, Redis, map pasting, chat) see the [Tea troubleshooting page](../../tea/user/troubleshooting.md).

## `/play fireball` says "Unknown game fireball"

Fireball is not running on any server in the network.

- Check that `Fireball.jar` is in `plugins/` on the arena server.
- Check the startup log for `Fireball enabled`. If you see `Fireball failed to start`, the lines after it say why.
- Check that TeaCore loaded first and without errors. Fireball does not load without it.

## No Fireball arena is available

Fireball has no map yet. [Author one](./map-authoring.md) or copy a map into `plugins/TeaCore/maps/` and run `/tea map reload`. Check with `/tea map list fireball`.

## `/tea map save` refuses to save

A required marker is missing. Run `/tea map status` to see which. For Fireball this is usually a team spawn: every team needs one, from `teamspawn0` to `teamspawn<count - 1>`.

## `/tea map teamspawn2` is an unknown command

You get one `teamspawn` command per team. With `teams.count: 2` that is `teamspawn0` and `teamspawn1`. Raise `teams.count` in `plugins/Fireball/config.yml` and restart to get more.

## Players of one team are not teleported to a base

The map has no spawn for that team. You hit this after you raise `teams.count` on a server with existing maps. Fix each map:

```
/tea map edit fireball <mapId>
/tea map teamspawn2        # the missing team number
/tea map save
```

## The match ends right after it starts

Only one team had players when the fight began, so it won by forfeit. A match that starts with a single player ends this way. Set the map's minimum to at least 2 (`/tea map edit`, `/tea map min 2`, `/tea map save`).

## Explosions knock players back but do not hurt

TeaCore's arenas are Peaceful by default, and Minecraft deals no explosion damage on Peaceful. Fireball sets its own arena worlds to Normal, so you do not need to change anything. If blasts still do no damage:

- Check that `game.max-explosion-damage` is not set too low.
- Check `game.friendly-fire`: with `false`, teammates never hurt each other.
- The target may be spawn-protected. Protection lasts `game.respawn-protection-seconds` (default 4) after every spawn and at the start of the fight.
- Check that another plugin (a region or protection plugin) is not cancelling damage in arena worlds.

## Big explosions never kill anyone

`game.max-explosion-damage` (default 12, 6 hearts) caps one explosion's damage so a single blast cannot kill a full-health player. Raise it, or set `0` for no cap.

## Right-clicking a fire charge does nothing

- Fireballs only work in a **live** Fireball match, not in the waiting room, countdown or outside arenas.
- The item must be a Fireball item (named like `Basic Fireball`). Plain fire charges do nothing. Use `/fireball give` to test.
- The type may be disabled (`fireballs.<type>.enabled: false`).
- The action bar tells you if you are on cooldown, out of fireballs or overheated.

## Throws fire before the player lets go of right-click

On a laggy connection the gap between repeated clicks can exceed `charge.release-gap-ms`. Raise it a little, for example to `300`. Higher values also add delay before a quick tap throws.

## The shop item does nothing

- The shop only opens in a live match.
- Check `shop.enabled: true`.
- If no items show, check `shop.prices`: only listed types are sold, and disabled types are hidden.
- If menus are turned off in TeaCore, or `menus/shop.yml` has `enabled: false`, Fireball opens a simple built-in shop instead. To get the YAML layout back, turn menus on and run `/tea reload`.

## Kits show their cost in red or can't be bought

Players buy kits with a `cost` above 0 from the server economy through Vault. You need a Vault economy plugin (EssentialsX Economy, CMI, ...). Without one, priced kits stay locked. Set `cost: 0` to make a kit free. See [Economy](../../tea/user/economy.md).

## Players spawn with no fireballs

Players get their selected kit, or the first kit in `kits:` if they never picked one. Check that kit has a `fireballs:` section with valid type ids, and that the types are enabled.

## Chests are empty

- The marked block must be a chest at match start. Check that the chest point sits exactly on the chest block (`/tea map status` shows how many chest points the map has).
- Check `loot.items` is not empty.

## Cannons do not fire

- Check `cannons.enabled: true` and that `cannons.types` has at least one entry.
- Players must right-click the exact block at the cannon point. If you marked the point one block too high, re-mark it: `/tea map cannon clear`, then mark each cannon again while standing on the spot where the block goes.
- The action bar says `The cannon is reloading.` while it is on cooldown.

## No power-ups drop

- Check `power-ups.enabled: true` and that `power-ups.pool` lists at least one enabled type.
- The map needs at least one point from `/tea map powerup`.
- Drops come every `power-ups.interval-seconds` (default 45).

## "Missing translation: fireball.xxx"

A text key is missing from your `lang/*.yml`. Fireball adds missing keys from the jar on startup, so restart the server first. If you added a kit or renamed a team key, add the matching key yourself (for example `fireball.kit.<id>.name` and `fireball.kit.<id>.desc`).

## Config changes do nothing

Restart the server after editing `plugins/Fireball/config.yml`. `/tea reload` reloads TeaCore and menu files, not Fireball's config.
