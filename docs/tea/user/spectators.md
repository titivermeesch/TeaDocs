---
sidebar_position: 12
title: Spectators
---

# Spectators

A spectator watches a match without playing in it. Players become spectators by joining a live arena (the arenas menu, `/tea arena spectate <id>`), or when staff make them one from the [arena manager](./arena-manager.md).

With `features.spectator-tools` on (the default), spectators get these tools:

- **Ghost mode.** Spectators fly in adventure mode, and the players can't see them. They can't hurt anyone, take damage, pick items up, open chests or press buttons. Projectiles fly through them, and players can place blocks where a spectator floats.
- **Teleporter** (compass, first hotbar slot). Opens a menu of the players still in the match, sorted by team, with their health and kills/deaths/assists. Left-click a player to teleport to them. Right-click to watch through their eyes; sneak to stop and get your tools back.
- **Play again** (paper, middle slot). Runs `/play <game>`, so you join the next match of the same game.
- **Leave** (red bed, last slot). Runs `/leave`.
- **Spectator sidebar.** While the match is live, spectators see the time left, each team's score, and the kills/deaths/assists of the player they watch.

![A spectator with the teleporter, play again and leave items, and the spectator sidebar](/img/tea/spectator.jpg)

Turn the tools off for every game with `features.spectator-tools: false`, or for one game with `features.games.<id>.spectator-tools: false`. Spectators then get the game's own spectator mode (usually vanilla spectator mode) and its normal sidebar.

## The teleporter menu

The teleporter is a YAML menu, `plugins/TeaCore/menus/spectate.yml`. Change its look like any [menu](./menus.md). Each player entry has these values:

![The teleporter menu](/img/tea/spectator-menu.png)

| Value | Meaning |
| --- | --- |
| `{uuid}` | The player's UUID, used by the actions. |
| `{name}` | Player name. |
| `{team}` | Team name, or `-`. |
| `{health}` | Health, rounded up. |
| `{kills}`, `{deaths}`, `{assists}` | This match's numbers. |

Two actions go with it: `spectate-tp:{uuid}` teleports to the player, and `spectate-follow:{uuid}` watches through their eyes. Bedrock players get the menu as a [form](./menus.md#bedrock-players).

## The spectator sidebar

The `spectator:` section of `plugins/TeaCore/sidebar.yml` holds the default lines:

```yaml
spectator:
  enabled: true
  lines:
    - "<secondary>Time:</secondary> <yellow><time></yellow>"
    - "<muted>You are spectating</muted>"
    - ""
    - "@teams: <team-name><gray>:</gray> <white><team-score></white>"
    - ""
    - "<secondary>Watching:</secondary> <highlight><watching></highlight>"
    - "<secondary>K/D/A:</secondary> <white><watching-kills>/<watching-deaths>/<watching-assists></white>"
```

It takes the same tags as a [game sidebar](./sidebars.md#game-sidebars), plus `<watching>`, `<watching-kills>`, `<watching-deaths>` and `<watching-assists>` for the player you watch through their eyes (`-` when you aren't watching anyone). A game can use its own lines by adding a `spectating:` list to its sidebar section. `enabled: false` gives spectators the game's `live` lines instead.
