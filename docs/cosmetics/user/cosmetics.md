---
sidebar_position: 1
title: The cosmetics
---

# The cosmetics

These are the cosmetics TeaCosmetics ships with. Change them, or add your own, in [Configuration](./configuration.md).

Players open `/cosmetics`, pick a type, and click a cosmetic to buy or wear it. Right-clicking a cosmetic in that menu, or running `/cosmetics preview <id>`, shows it without buying it: projectile trails on a thrown snowball, walk trails circling you, and kill and win effects three times in front of you. Previews work in the lobby and in a waiting arena, not during a match. Victory dances never launch or spin a player while a match is running.

![The /cosmetics menu](/img/cosmetics/menu.png)

## Projectile trails

Particles follow arrows, fireballs, snowballs and anything else you shoot.

| Flame Trail (`flame-trail`) | Heart Trail (`heart-trail`) | Pixie Trail (`rainbow-trail`) |
| --- | --- | --- |
| ![Flame Trail](/img/cosmetics/flame-trail.png) | ![Heart Trail](/img/cosmetics/heart-trail.png) | ![Pixie Trail](/img/cosmetics/rainbow-trail.png) |
| 250 coins | 400 coins | 600 coins |

## Walk trails

Particles at your feet while you move, in the lobby and in matches (`walk-trails-in-matches: false` keeps them to the lobby).

| Cloud Steps (`cloud-steps`) | Emerald Steps (`emerald-steps`) |
| --- | --- |
| ![Cloud Steps](/img/cosmetics/cloud-steps.png) | ![Emerald Steps](/img/cosmetics/emerald-steps.png) |
| 300 coins | 500 coins |

## Kill effects

Plays where a player you killed died.

| Thunderstruck (`lightning-kill`) | Celebration (`firework-kill`) | Soul Burst (`soul-kill`) |
| --- | --- | --- |
| ![Thunderstruck](/img/cosmetics/lightning-kill.png) | ![Celebration](/img/cosmetics/firework-kill.png) | ![Soul Burst](/img/cosmetics/soul-kill.png) |
| 750 coins | 500 coins | 400 coins |

The lightning looks and sounds real but hurts nobody, and the fireworks can't hurt anyone either.

## Win effects

Plays around you when you or your team wins.

| Victory Fireworks (`fireworks-win`) | Lucky Win (`totem-win`) |
| --- | --- |
| ![Victory Fireworks](/img/cosmetics/fireworks-win.png) | ![Lucky Win](/img/cosmetics/totem-win.png) |
| 1,000 coins | 800 coins |

## Hats

Worn on your head in the lobby. When you join a match the hat comes off, because the game decides what goes on your head; it goes back on when you return to the lobby. A hat never replaces a real helmet, and you can't take it off or drop it.

| Pumpkin Head (`pumpkin-head`) | Space Helmet (`space-helmet`) |
| --- | --- |
| A pumpkin | A glass block |
| 300 coins | 500 coins |

A hat can also be a player head with any texture (see [Configuration](./configuration.md)).

## Death messages

When you get a kill, everyone in the match reads your line in chat.

| Roasted (`roasted`) | Deleted (`deleted`) |
| --- | --- |
| *Steve was roasted by Alex* | *Alex deleted Steve* |
| 400 coins | 600 coins |

In Ascend the line replaces the usual kill message above the hotbar.

## Victory dances

Plays when you or your team wins, next to your win effect.

| Victory Spin (`victory-spin`) | Rocket Launch (`rocket-launch`) |
| --- | --- |
| You spin on the spot with green sparkles | You blast upward on a flame trail and burst into a firework |
| 500 coins | 900 coins |

`bounce` (four jumps) and `orbit` (particles circling you) are also available for your own dances. Dances never cause fall damage.

## Commands

| Command | Permission | What it does |
| --- | --- | --- |
| `/cosmetics` | `teacosmetics.use` | Opens the menu. |
| `/cosmetics preview <id>` | `teacosmetics.use` | Shows a cosmetic without wearing it. Once every 2 seconds. Not available once a match has started. |
| `/cosmetics equip <player> <id>` | `teacosmetics.admin` | Puts a cosmetic on an online player, without buying it. `none` takes everything off. |
| `/cosmetics reload` | `teacosmetics.admin` | Reloads the config. |

On servers older than 1.13, cosmetics use the closest particle the version has, or none (see [Server versions](../../tea/user/server-versions.md)).
