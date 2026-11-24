---
sidebar_position: 2
title: Configuration
---

# Configuration

Every cosmetic is an entry under `cosmetics:` in `plugins/TeaCosmetics/config.yml`. The entry's key is its id, used in permissions (`tea.cosmetic.<id>`). Run `/cosmetics reload` after a change.

You can also add, price and change cosmetics in game under `/tea admin`, then **Settings**, or on the dashboard's **Settings** page. Changes there apply right away on every server that runs TeaCosmetics, with no reload or restart.

```yaml
walk-trails-in-matches: true    # false: walk trails only in the lobby

cosmetics:
  flame-trail:
    type: projectile-trail
    name: "<gold>Flame Trail"
    description: ["<gray>Fire follows your shots."]
    icon: BLAZE_POWDER
    price: 250
    particle: FLAME
    count: 2
  lightning-kill:
    type: kill-effect
    name: "<yellow>Thunderstruck"
    description: ["<gray>Lightning strikes where they fell."]
    icon: LIGHTNING_ROD
    price: 750
    effect: lightning
```

## Keys

| Key | For | Meaning |
| --- | --- | --- |
| `type` | all | `projectile-trail`, `walk-trail`, `kill-effect`, `win-effect`, `hat`, `death-message` or `victory-dance`. |
| `name` | all | Name in the menu and in messages. MiniMessage and theme tags work. |
| `description` | all | Lore lines under the name. |
| `icon` | all | Menu item [material](https://jd.papermc.io/paper/1.21.4/org/bukkit/Material.html), by its modern name. Older versions get the closest item (`RED_DYE` becomes red dye on 1.8), or paper if there is none. |
| `price` | all | Coins to buy it. `0` makes it free for everyone. |
| `particle` | trails, `effect: particles` | A [particle](https://jd.papermc.io/paper/1.21.4/org/bukkit/Particle.html) name, by its modern name. Particles that need an item or block don't work; `DUST` takes `color`. Older versions show the closest particle they have, or nothing. |
| `count` | trails, `effect: particles` | Particles per puff. Trails puff every 2 ticks (projectiles) or 4 ticks (walking). |
| `color` | `DUST`, `effect: firework` | `"#RRGGBB"`. |
| `effect` | kill and win effects | `particles`, `lightning` (looks and sounds real, hurts nobody), `firework` (bursts at once, hurts nobody) or `sound`. |
| `item` | hats | The item worn on the head, by its modern name, such as `CARVED_PUMPKIN`. |
| `texture` | hats | A player head texture (the base64 value from a head database), worn instead of `item`. |
| `message` | death messages | MiniMessage with `<killer>` and `<victim>`. |
| `dance` | victory dances | `spin`, `bounce`, `rocket` or `orbit`. `particle`, `count` and `color` style it. |
| `sound` | kill and win effects | A sound key such as `entity.player.levelup`. Plays with any effect, or alone with `effect: sound`. |

A win effect plays three times over about two seconds around every winner who wears one.

An entry with a mistake (unknown type or particle, missing particle) is skipped, and the console says why. Deleting an entry takes it away from players who own it; they keep it in the database, so adding it back returns it.

## Messages

The texts are in `plugins/TeaCosmetics/lang/en_US.yml` under `cosmetics`, including the type names and the price and status lines in the menu.
