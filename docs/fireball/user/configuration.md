---
sidebar_position: 3
title: Configuration
---

# Configuration

Fireball reads all game settings from `plugins/Fireball/config.yml`. This page lists every key, grouped the same way as the file, with its default.

## Changing settings in game

Most of these settings can be changed without touching the file: open `/tea admin` and pick **Settings**, or use the **Settings** page of the web dashboard. A change is written into `config.yml` on every server that runs Fireball, and the rest of the file stays as it was.

- Combat, throwing, blocks, fireball types, cannons, the shop, sudden death and power-ups take effect right away.
- Match timings, the ammo mode and kits take effect from the next match.
- The number of teams, players per team and the shopkeeper NPC need a restart.

You can also edit kits there, including their gear: in game, **Copy from my inventory** fills a kit with the items you carry. Each kit has a **Name** and **Description**; leave them empty to use `fireball.kit.<id>.name` and `.desc` from the language file. A kit with neither shows its id written out, so `quick_shooter` reads "Quick Shooter".

The sidebar layout, chest loot and team names are only in the file.

## Editing the file

Restart the server after editing `config.yml` by hand. `/tea reload` reloads the shop menu file (`menus/shop.yml`).

When you upgrade Fireball, it adds new keys to your file and keeps your own values.

Times ending in `-ms` are milliseconds (1000 = 1 second). Times ending in `-seconds` are seconds.

## `lifecycle:` (phase timers)
Fireball passes these to TeaCore, which runs the waiting room and countdown.

```yaml
lifecycle:
  max-wait-seconds: 120
  countdown-seconds: 30
  starting-seconds: 5
  ending-seconds: 10
  title-countdown-threshold: 10
  chat-announce-at-seconds: [30, 15]
```

| Key | Default | What it does |
| --- | ------- | ------------ |
| `max-wait-seconds` | `120` | How long an arena waits for players. |
| `countdown-seconds` | `30` | Countdown once enough players have joined. |
| `starting-seconds` | `5` | Short phase where players are put on teams and sent to their spawns. |
| `ending-seconds` | `10` | Time after the match ends before players leave the arena. |
| `title-countdown-threshold` | `10` | At or below this many seconds, the countdown shows as a big title. |
| `chat-announce-at-seconds` | `[30, 15]` | Countdown values announced in chat (above the title threshold). |

## `pool:` (warm arenas)
How many Fireball arenas TeaCore keeps ready on this server.

| Key | Default | What it does |
| --- | ------- | ------------ |
| `pool.min-available` | `1` | Idle, joinable arenas to keep ready. |
| `pool.max-total` | `4` | Most Fireball arenas this server runs at once. |
| `pool.preload-on-startup` | `0` | Arenas to build when the server starts. |
| `pool.scale-cooldown-seconds` | `10` | Minimum seconds between adding arenas. |

## `game:` (core rules)
```yaml
game:
  max-match-seconds: 300
  end-mode: RESET
  respawn-protection-seconds: 4
  respawn-delay-seconds: 3
  friendly-fire: false
  max-explosion-damage: 12.0
  fireball-max-lifetime-ms: 10000
```

| Key | Default | What it does |
| --- | ------- | ------------ |
| `max-match-seconds` | `300` | Match length. When it runs out, the team with the most kills wins. |
| `end-mode` | `RESET` | What happens after a match. `RESET` resets the arena for the next match. `SHUTDOWN` stops the server (for setups that start a fresh server per match). |
| `respawn-protection-seconds` | `4` | Seconds of protection after each spawn and at the start of the fight. Protected players ignore enemy hits and fireball effects. `0` turns it off. |
| `respawn-delay-seconds` | `3` | Seconds a dead player spends floating above where they died, with a "You died" countdown title, before respawning. |
| `friendly-fire` | `false` | When `false`, fireballs, effects and melee never hurt or affect teammates. |
| `max-explosion-damage` | `12.0` | Most damage one explosion can deal to a player, before armor. `20` is a full health bar. `0` means no cap. |
| `fireball-max-lifetime-ms` | `10000` | Fireball removes thrown fireballs that have not hit anything after this long. `0` keeps them. |

Kill and assist credit use TeaCore's timing windows (`combat.kill-credit-window-ms` and `combat.assist-window-ms` in TeaCore's config). See [Kill credit](../../tea/user/kill-credit.md).

Hunger is always off in Fireball matches. There is no key for it.

## `blocks:` (building and explosion damage)
| Key | Default | What it does |
| --- | ------- | ------------ |
| `blocks.explosion-damage` | `placed` | What fireball explosions break. `off`: nothing. `placed`: only blocks players placed this match. `all`: the map too, except the blocks below. |
| `blocks.protect-radius` | `4` | With `all`, blocks this close to a team spawn never break. |
| `blocks.never-break` | bedrock, barrier, chests, dispensers, beacons, end portal frames | With `all`, these block types never break. |
| `blocks.wool-per-life` | `32` | Team-coloured wool each player gets on every spawn, for bridges and walls. `0` gives none. |

Players can break blocks they placed by hand, but never the map's blocks. Broken blocks drop nothing. When a match changed any block, TeaCore rebuilds that arena from its schematic for the next match instead of reusing the world, so every match starts on an intact map.

## `sudden-death:`

Meteors fall during the last seconds of a match.

| Key | Default | What it does |
| --- | ------- | ------------ |
| `sudden-death.enabled` | `true` | Turn sudden death on or off. |
| `sudden-death.seconds` | `30` | Starts when this many seconds are left. |
| `sudden-death.meteor-interval-ms` | `2500` | Time between meteors. |

## `sidebar:`

TeaCore draws this sidebar for everyone in a Fireball arena. There is one list of lines per phase: `waiting`, `countdown`, `live`, `ended`. Lines are MiniMessage with theme tags. For the full format, see [Sidebars](../../tea/user/sidebars.md).

```yaml
sidebar:
  enabled: true
  title: "<red><bold>FIREBALL</bold></red>"
  live:
    - "<secondary>Time:</secondary> <yellow><time></yellow>"
    - "<secondary>Team:</secondary> <team>"
    - ""
    - "@teams: <team-name><gray>:</gray> <white><team-score></white>"
    - ""
    - "<secondary>Your kills:</secondary> <white><kills></white>"
    - "<secondary>Coins:</secondary> <gold><coins></gold>"
```

Tags you can use:

- TeaCore tags: `<map>`, `<players>`, `<max-players>`, `<min-players>`, `<waiting-for>`, `<seconds>`, `<time>`, `<team>`, `<kills>`, `<deaths>`, `<assists>`, `<kit>`, `<winner>`, and any `%placeholderapi%` placeholder.
- Fireball tags: `<coins>` (your shop coins) and `<heat>` (your heat, in percent).
- `@teams:` lines repeat once per team, with `<team-name>`, `<team-size>` and Fireball's `<team-score>` (that team's kills).
- `@players:` lines repeat once per player, with `<player-name>`, `<player-kills>` and the other TeaCore row tags.

Turn the sidebar off with `enabled: false` here, per game in TeaCore (`features.games.fireball.sidebar`), or per player with `/board`. See [Optional features](../../tea/user/features.md).

## `ammo:` (ammo model)
```yaml
ammo:
  mode: items
  heat:
    max: 100.0
    regen-per-second: 20.0
```

| Key | Default | What it does |
| --- | ------- | ------------ |
| `ammo.mode` | `items` | `items`: each throw uses up one fireball item. `heat`: throws cost heat from a refilling bar instead (shown on the XP bar), and items are not used up. |
| `ammo.heat.max` | `100.0` | Size of the heat bar. Players start full and refill to full on respawn. |
| `ammo.heat.regen-per-second` | `20.0` | Heat refilled per second. |

Each type sets its own heat cost with `heat-cost` (see [`fireballs:`](#fireballs-fireball-types)).

## `fireball-jump:`

Your own fireball's blast launches you, even with friendly fire off.

| Key | Default | What it does |
| --- | ------- | ------------ |
| `fireball-jump.enabled` | `true` | When `false`, your own fireball does nothing to you. |
| `fireball-jump.power` | `1.0` | Multiplier on the launch. `2.0` launches twice as hard. |
| `fireball-jump.self-damage` | `0.0` | Damage your own fireball jump deals to you. `0` = pure movement. |
| `fireball-jump.no-fall-damage-ms` | `4000` | The first landing within this time after a fireball jump takes no fall damage. `0` = normal fall damage. |

## `charge:` (charge throw)
Hold right-click to charge, let go to throw.

| Key | Default | What it does |
| --- | ------- | ------------ |
| `charge.enabled` | `true` | When `false`, a click throws at once at `min-velocity-mult`. |
| `charge.max-charge-ms` | `1500` | Hold time for a full charge. At full charge the fireball throws by itself. |
| `charge.release-gap-ms` | `260` | How long after the last right-click signal the throw counts as released. This is also the delay before a quick tap throws. |
| `charge.min-velocity-mult` | `1.0` | Speed multiplier for a tap. |
| `charge.max-velocity-mult` | `2.25` | Speed multiplier at full charge. |

About `release-gap-ms`: the Minecraft client does not tell the server when you let go of right-click with a fire charge. While you hold the button, it repeats the click every 200 ms. Fireball treats "no click for `release-gap-ms`" as letting go. Fireball raises values below 210 to 210, because anything at or under 200 would end every charge early. Raise it a little if players with high ping see throws fire before they let go.

## `void-kill-depth`

| Key | Default | What it does |
| --- | ------- | ------------ |
| `void-kill-depth` | `6` | A player who falls off the map dies this many blocks below the map's lowest block, instead of after the long fall to the world's void. |

## `deflection:`

| Key | Default | What it does |
| --- | ------- | ------------ |
| `deflection.enabled` | `true` | Let players swing (left-click) to send an incoming fireball back. |
| `deflection.reattribute-kills` | `true` | The deflected fireball becomes the deflector's: kills go to them, and it can hurt the original thrower. |

## `teams:`

```yaml
teams:
  count: 2
  # name-keys: { 0: "fireball.team.red", 1: "fireball.team.blue" }
```

| Key | Default | What it does |
| --- | ------- | ------------ |
| `teams.count` | `2` | Number of teams, from 2 to 8. Values outside that range are clamped. |
| `teams.max-size` | `8` | Most players per team. |
| `teams.name-keys` | none | Optional. Override a team's display-name translation key, keyed by team number (0 = first team). |

Fireball uses teams in this order: Red, Blue, Green, Yellow, Purple, Orange, Pink, Lime. With `count: 3` you get Red, Blue and Green. Their names live in `lang/en_US.yml` under `fireball.team.*`.

Every map needs a spawn for each team: `teamspawn0` up to `teamspawn<count - 1>`. If you raise `count`, add the new team spawns to your existing maps. See [Map authoring](./map-authoring.md).

## `shop:`

```yaml
shop:
  enabled: true
  villager: true
  currency-per-kill: 10
  currency-per-assist: 5
  prices:
    basic: 5
    explosive: 30
    chain: 25
    frost: 25
    toxic: 25
    homing: 30
    lightning: 35
    cluster: 35
    void: 40
    singularity: 50
    meteor: 60
```

| Key | Default | What it does |
| --- | ------- | ------------ |
| `shop.enabled` | `true` | When `false`, there is no shop. |
| `shop.villager` | `true` | Shopkeeper villagers on the map (place them with `/tea map shop`; without points, one stands next to each team spawn). `false` gives every player a shop item in the last hotbar slot instead. |
| `shop.currency-per-kill` | `10` | Coins for a kill. |
| `shop.currency-per-assist` | `5` | Coins for an assist. |
| `shop.prices.<type>` | see above | Price in coins for one fireball of that type. Types not listed cannot be bought. |

Coins last for one match. They are separate from the server economy.

### `menus/shop.yml`

The shop's layout lives in `plugins/Fireball/menus/shop.yml`. It uses TeaCore's menu format (see [Menus](../../tea/user/menus.md)). The shop list (`source: "fireball:shop"`) gives one entry per item for sale. Each entry can use:

- `{type}`: type id, for example `explosive`
- `{name}`: the type's display name
- `{price}`: its price
- `{coins}`: the viewer's coins
- `{affordable}`: `true` or `false`

The action `fireball:buy:{type}` buys one. Set `enabled: false` in the file, or turn off menus in TeaCore, and Fireball shows a simple built-in shop instead.

![The default shop menu](/img/fireball/shop-menu.png)

## `fireballs:` (fireball types)
Each type has its own block. Shared keys:

| Key | What it does |
| --- | ------------ |
| `enabled` | When `false`, the type is gone everywhere: it cannot be thrown, bought, found in chests or dropped as a power-up, kits leave it out, and a cannon set to it does not fire. |
| `yield` | Explosion power on impact. Used by `basic`, `explosive`, `chain`, `cluster`, `homing` and `meteor` (for the falling meteor). |
| `heat-cost` | Heat each throw costs in `heat` ammo mode. |
| `cooldown-ms` | Wait before you can throw this type after your last throw. |
| `color` | Colour of the type's particle trail and impact burst, as `"#RRGGBB"`. Each type has its own default. Turn all trails off with the top-level `fireball-trails: false`. |

Defaults and extra keys per type:

| Type | yield | heat-cost | cooldown-ms | Extra keys (default) |
| ---- | ----- | --------- | ----------- | -------------------- |
| `basic` | 1.0 | 15 | 250 | - |
| `explosive` | 3.0 | 45 | 1200 | - |
| `chain` | 1.5 | 30 | 900 | `bounce-range` (8.0): how far it looks for the next enemy. Up to 4 jumps. |
| `frost` | 0.5 (unused) | 30 | 900 | `freeze-radius` (4.0), `freeze-duration-ms` (5000) |
| `void` | 0.0 (unused) | 35 | 1100 | `teleport-radius` (6.0): enemies in range are teleported. |
| `lightning` | 1.0 (unused) | 35 | 1100 | `strike-range` (8.0), `damage` (4.0). |
| `cluster` | 0.8 | 40 | 1300 | `fragments` (5): basic fireballs thrown out on impact. |
| `homing` | 1.2 | 40 | 1300 | `lock-range` (20.0), `turn-strength` (0.25): how sharply it turns, 0 to 1. |
| `singularity` | 0.5 (unused) | 50 | 2000 | `pull-radius` (8.0), `pull-strength` (1.2), `burst-delay-ms` (1500), `burst-yield` (2.5): power of the final burst. |
| `meteor` | 4.0 | 55 | 2500 | `fall-height` (40): blocks above the impact the meteor falls from. |
| `toxic` | 0.0 (unused) | 30 | 1000 | `cloud-radius` (4.0), `cloud-duration-ms` (6000) |

See [Gameplay](./gameplay.md#fireball-types) for what each type does.

## `cannons:`

```yaml
cannons:
  enabled: true
  cooldown-ms: 3000
  types:
    rapid:   { fireball: basic,  cooldown-ms: 600,  velocity-mult: 2.0 }
    heavy:   { fireball: meteor, cooldown-ms: 5000, velocity-mult: 1.2 }
    homing:  { fireball: homing, cooldown-ms: 3500, velocity-mult: 1.5 }
```

| Key | Default | What it does |
| --- | ------- | ------------ |
| `cannons.enabled` | `true` | When `false`, cannon blocks do nothing. |
| `cannons.cooldown-ms` | `3000` | Cooldown for a cannon type that does not set its own. |
| `cannons.types.<name>.fireball` | `basic` | Fireball type the cannon fires. |
| `cannons.types.<name>.cooldown-ms` | `cannons.cooldown-ms` | Cooldown between shots for this cannon. |
| `cannons.types.<name>.velocity-mult` | `1.5` | Shot speed. |

Cannons on a map take their type in order from this list, and the list repeats. With the defaults, cannon 1 is `rapid`, 2 is `heavy`, 3 is `homing`, 4 is `rapid`, and so on. Reorder or add entries to change that. Each cannon has its own cooldown, shared by all players.

## `power-ups:`

| Key | Default | What it does |
| --- | ------- | ------------ |
| `power-ups.enabled` | `true` | Turn power-up drops on or off. |
| `power-ups.interval-seconds` | `45` | Time between drops. Each live Fireball arena gets one drop at a random power-up point. |
| `power-ups.pool` | `[meteor, singularity, cluster]` | Types that can drop, picked at random. Disabled types are skipped. |

Maps without power-up points get no drops.

## `kits:` (starting loadouts)
Each entry under `kits:` is a kit. The key is the kit id. Players pick one in the kit picker.

![The kit picker with a priced kit](/img/tea/kit-locked.png)

```yaml
kits:
  pyromancer:
    cost: 0
    icon: BLAZE_POWDER
    gear:
      - IRON_SWORD
      - { material: LEATHER_CHESTPLATE, slot: 38 }
    fireballs:
      basic: 8
      explosive: 3
```

| Key | Default | What it does |
| --- | ------- | ------------ |
| `cost` | `0` | One-time unlock price in the server economy (Vault). `0` = free. |
| `icon` | `FIRE_CHARGE` | Material shown in the kit picker. |
| `gear` | none | Items to give. See the item format below. |
| `fireballs` | none | Fireballs to give, as `<type>: <amount>`. |

Items without a `slot` fill the hotbar from left to right. Fireballs go into the next free slots after the gear. Armor slots are `36` (boots), `37` (leggings), `38` (chestplate) and `39` (helmet).

The first kit in the list is the one players get if they never pick a kit. Keep it free.

The kit's name and description come from `lang/en_US.yml`: `fireball.kit.<id>.name` and `fireball.kit.<id>.desc`. Add both when you create a new kit.

### Item format

An item is either a material name (`IRON_SWORD`) or a map with these keys:

| Key | Example | What it does |
| --- | ------- | ------------ |
| `material` | `BOW` | Bukkit material name. |
| `amount` | `16` or `"8-16"` | Fixed amount, or a random amount in a range. |
| `slot` | `38` | Inventory slot (kits only). |
| `enchantments` | `["SHARPNESS:2"]` | `NAME:level` entries. |
| `potion` | `HEALING` | Potion type, for potion items. |
| `custom-name` | `"&6Blade"` | Display name, `&` color codes. |
| `lore` | `["&7Line"]` | Lore lines, `&` color codes. |
| `fireball` | `explosive` | Kits only. Gives a fireball of this type instead of a material. |

## `loot:` (chest loot)
Fireball clears and fills the chests marked on the map at the start of each match.

```yaml
loot:
  max-items-per-chest: 15
  min-items-per-chest: 10
  items:
    - { material: BOW, weight: 40, enchantments: ["POWER:1"] }
    - { material: GOLDEN_APPLE, weight: 20, amount: "1-3" }
    - { material: SPLASH_POTION, weight: 10, potion: HEALING }
    - { item: "fireball:explosive", weight: 20, amount: "1-2" }
```

| Key | Default | What it does |
| --- | ------- | ------------ |
| `loot.min-items-per-chest` | `10` | Fewest items per chest. |
| `loot.max-items-per-chest` | `15` | Most items per chest. |
| `loot.items` | see file | Weighted item list. Higher `weight` = more common. |

Each entry takes the [item format](#item-format) above (except `slot` and `fireball`) plus `weight` (default `1`). To put a fireball in the table, use `item: "fireball:<type>"` instead of `material`. Disabled fireball types never appear in chests.

The default table has bows, swords, armor, golden apples, arrows, ender pearls, fishing rods, water buckets, ladders, healing potions, and Explosive, Chain, Meteor and Singularity fireballs.

## `lang/en_US.yml` (text)
All player-facing text is in `plugins/Fireball/lang/en_US.yml`, as MiniMessage. Edit it to change wording, team names, fireball type names, kit names and achievement names. See [Theme and i18n](../../tea/user/theme-and-i18n.md).
