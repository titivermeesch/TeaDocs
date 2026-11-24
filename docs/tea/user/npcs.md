---
sidebar_position: 13
title: NPCs
---

# NPCs

An NPC is a creature that stands in a game's arenas and opens a menu when a player right-clicks it, for example Fireball's shopkeeper. TeaCore spawns NPCs when an arena reaches the right phase, keeps them in place (explosions and pushes don't move them), makes them invulnerable, and removes them when the phase ends.

## Placing NPCs on a map

Each NPC has an id, which is also its map command. While editing a map:

| Command | What it does |
| ------- | ------------ |
| `/tea map <npc id>` | Add an NPC where you stand, facing your direction. |
| `/tea map <npc id> clear` | Remove all points for that NPC. |

For example, `/tea map shop` places a Fireball shopkeeper. One NPC stands on each point. A game can give an NPC default spots for maps without points; Fireball puts a shopkeeper next to each team spawn.

## Changing or adding NPCs

Under `npcs` in `plugins/TeaCore/config.yml`, keyed by game and NPC id. Every key is optional.

```yaml
npcs:
  fireball:
    shop:                         # restyle Fireball's shopkeeper
      entity: WANDERING_TRADER
      name: "<gold><bold>Fireball Shop"
    rules:                        # a new NPC that opens your own menu
      menu: rules                 # plugins/TeaCore/menus/rules.yml
      name: "<aqua>How to play"
      phases: [WAITING, COUNTDOWN]
```

| Key | Meaning |
| --- | ------- |
| `menu` | Menu id to open on right-click: a file in `menus/` or a game's menu such as `fireball:shop`. |
| `entity` | Any living entity type, e.g. `VILLAGER`, `WANDERING_TRADER`, `IRON_GOLEM`. Default `VILLAGER`. |
| `name` | Name above the NPC (MiniMessage). Default: the game's translated name. |
| `phases` | Arena states the NPC stands in: `WAITING`, `COUNTDOWN`, `STARTING`, `LIVE`, `ENDING`. Default `LIVE`. |
| `enabled` | `false` removes a game's NPC. |

A new NPC id (like `rules` above) gets its `/tea map rules` command after a restart. The server log says how many NPCs it spawned in each arena, or that an NPC has no points on the map.

## For game developers

Register NPCs in `onEnable` with `TeaCoreAPI.npcs()`:

```java
core.npcs().register(NpcDefinition.builder(MY_GAME, "shop")
        .menu("mygame:shop")              // opened on right-click
        .onClick(player -> openOldShop(player)) // when menus are off
        .name("mygame.npc.shop")          // translation key
        .entity(EntityType.VILLAGER)
        .activeIn(ArenaState.LIVE)
        .defaultSpots(arena -> spotsNextToEachTeamSpawn(arena))
        .build());
```

Menus open with the arguments `game` and `npc`.
