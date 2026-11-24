---
sidebar_position: 12
title: Map voting
---

# Map voting

Players waiting for a match vote on the map. When an arena opens, TeaCore picks up to three maps: the one the arena loaded plus random others of the same game. Players vote while the arena waits and counts down. When the countdown ends, the map with the most votes wins and the match starts there.

- Players get a map item in their hotbar. Right-click it for the vote menu (a form on Bedrock), or type `/vote <map>`. `/vote` alone opens the menu.
- Players can change their vote until the countdown ends. Leaving the arena drops their vote.
- Ties go to a random map among the leaders. With no votes, the arena keeps the map it loaded.
- If another map wins, TeaCore loads it and moves everyone onto it before the match starts. Expect a short pause at the end of the countdown while the map pastes.
- A map that holds fewer players than have joined can't win.
- A player who asked for a map with `/play <game> <map>` skips the vote: their arena keeps that map.
- Games with a fixed map, and games with one map, don't vote.

## Settings

In `plugins/TeaCore/config.yml`:

```yaml
features:
  map-voting: true      # or per game: features.games.<id>.map-voting

map-voting:
  options: 3            # maps per vote, the loaded one included
  hotbar-slot: 7        # 0-8, where the map item goes
```

Pick a hotbar slot your games don't use while players wait.

The menu is `plugins/TeaCore/menus/map-vote.yml`. Each map entry has `{map_id}`, `{map_name}`, `{votes}`, `{voted}` (`true` for the map you picked), `{min}` and `{max}`. The messages are under `core.vote` in the lang files.

## Permissions

| Permission | Default | Allows |
| --- | --- | --- |
| `tea.vote` | everyone | `/vote` and the map item |
