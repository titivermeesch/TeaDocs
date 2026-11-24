---
sidebar_position: 4
title: Map authoring
---

# Map authoring

Overcharge maps use TeaCore's [map editor](../../tea/user/adding-a-map.md). Besides the usual waiting spawn, a map needs:

| Point | Command | How many |
| --- | --- | --- |
| Team spawn | `/tea map teamspawn0` to `teamspawn3` | One per team |
| Station | `/tea map station0` to `station3` | One per team, where players crouch to charge |
| Energy points | `/tea map energy` | One or more in the middle, where cells drop |

Teams are numbered in this order: 0 red, 1 blue, 2 green, 3 yellow. Teams 0 and 1 are required. A map plays with as many teams as it has a spawn and a station for, so mark 2, 3 or 4. Leave no gaps: a map with team 0, 1 and 3 plays with two teams.

The editor's point tool has these point types too, and the checklist shows what is missing.

## Tips

- Put the energy points in the open and the stations about as far from the middle as each other, so no team has a shorter run.
- Give each base some cover near the station: crouching there makes carriers easy to catch.
- A void edge makes fights faster: anyone who falls loses everything they carry.
