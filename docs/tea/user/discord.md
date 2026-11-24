---
sidebar_position: 13
title: Discord
---

# Discord

TeaCore can post to Discord channels through webhooks. Each kind of post has its own webhook URL, so you choose which channel gets what.

| Post | What it shows |
| --- | --- |
| Match results | Game and map, the winner (team, player or draw), how long the match lasted, the MVP (most kills) and every player's kills, deaths and assists. |
| Staff actions | Who did what from `/tea admin` or the [web dashboard](./dashboard.md): ended matches and their winner, kicks, moves, players made spectator, released and allocated arenas, deleted maps. |
| Achievements | "Notch unlocked First Blood in Fireball". |
| Server status | A server starting or stopping. |

## Setting it up

1. In Discord, open the channel's settings, then Integrations, then Webhooks, and create a webhook. Copy its URL.
2. Paste it into `plugins/TeaCore/config.yml`:

```yaml
discord:
  match-results:
    url: "https://discord.com/api/webhooks/..."
  staff-actions:
    url: "https://discord.com/api/webhooks/..."   # usually a staff-only channel
  achievements:
    url: ""                                      # empty: not posted
  server-status:
    url: ""
```

3. Run `/tea reload`.

Leave a URL empty to turn that post off. You can use the same URL for several posts.

On a network, set the same URLs on every server. Each server posts what happens on it (its own matches, the staff actions done there, its own start and stop), so nothing is posted twice.

## Wording

The text comes from `core.discord` in `plugins/TeaCore/lang/<locale>.yml`, in the server's default language. Change it there like any other message.

## Notes

- Posts never ping anyone, even if a player's name looks like a mention.
- If Discord asks TeaCore to slow down, it waits and retries once.
- "Server went offline" is sent when the server shuts down normally. A crash can't send it.
- Treat webhook URLs like passwords: anyone with one can post to the channel. TeaCore never writes them to the log.
