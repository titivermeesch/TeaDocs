---
sidebar_position: 12
title: Parties
---

# Parties

TeaCore works with two party plugins: [Parties](https://www.spigotmc.org/resources/parties.3709/) and Party and Friends (through its Spigot party API). Install either one and parties play together, with no setup in TeaCore.

- When the party leader uses `/play <game>` (or `/play <game> ranked`), every party member on the same server who isn't in a match comes along.
- The party lands in one arena. TeaCore only picks an arena with room for the whole party.
- In team games, party members join the same team while it has room. A big party can make teams uneven. When the party is the only group in the match, TeaCore splits it so the match has two teams.
- On a network the lobby queues the party together and routes everyone to the same arena.
- Members get a chat line saying the leader took the party to the game.
- In ranked play the party is matched on the average rating of its members.

Members can't `/play` on their own while in a party. To change that:

```yaml
parties:
  enabled: true        # false: ignore party plugins
  leader-only: false   # true (default): only the leader can start /play
```

With `leader-only: false`, a member's `/play` takes only that member.

Party members who are on another server of the network when the leader queues stay where they are. Gather the party on one server first.
