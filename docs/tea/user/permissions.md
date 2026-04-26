---
sidebar_position: 7
title: Permissions
---

# Permissions

Every TeaCore command is gated by a Bukkit permission node. Game plugins built on Tea may either register their own commands (with their own permissions) or hook into TeaCore's `/tea` tree; per-game permissions are documented by each game.

The tables below list every node, what grants it by default, and which command(s) it controls. Use your permissions plugin (LuckPerms, PermissionsEx, etc.) to hand out or revoke them per group.

## TeaCore

| Permission | Default | What it grants |
| ---------- | ------- | -------------- |
| `tea.admin` | op | Umbrella for admin access. Grants every child node below (`tea.reload`, `tea.version`, `tea.arena.admin`, `tea.arena.play`, `tea.chat.use`, `tea.chat.staff`, `tea.chat.global`, `tea.map.admin`, `tea.stats`). |
| `tea.reload` | op | `/tea reload` — reload config, theme, and locale bundles. |
| `tea.version` | everyone | `/tea version` — print the running TeaCore version. |
| `tea.arena.admin` | op | `/tea arena allocate`, `/tea arena release`, `/tea arena start`, `/tea arena observe` — spin up, tear down, force-start, and staff-observe arenas. |
| `tea.arena.play` | everyone | `/tea arena join`, `/tea arena spectate`, `/tea arena leave`, plus the top-level `/leave` and `/queue` commands — player-side arena entry, exit, and status. |
| `tea.map.admin` | op | Every `/tea map <subcommand>` — author, save, edit, delete map definitions. Game plugins' map-authoring extensions (for example marking game-specific spawn points) also run under this node since they are registered as `/tea map` subcommands. |
| `tea.chat.use` | everyone | `/chat` — switch the active chat channel. Always allows the `match` and `team` channels. |
| `tea.chat.staff` | op | Read and send messages on the staff channel (`/chat staff`). |
| `tea.chat.global` | op | Send messages on the global channel (`/chat global`). Everyone can still receive global messages. |
| `tea.kit` | everyone | `/kit` — open the kit picker, or select a kit by id. |
| `tea.stats` | everyone | `/tea stats` — view **your own** stats. Viewing another player's stats (`/tea stats <player>`) additionally requires `tea.admin`. |
| `tea.lobby.play` | everyone | `/play <game> [map]` — queue for a game from the lobby. (`/leave` and `/queue` are gated by `tea.arena.play` above so they work on every server.) Only effective on servers where `lobby.enabled: true`. |
| `tea.lobby.admin` | op | `/tealobby` and all its subcommands — `sign bind\|unbind\|list`, `spawn set\|tp`, `config show\|manage-spawn\|gamemode`, and `reload`. Only effective on servers where `lobby.enabled: true`. |

## Common permission recipes

**Staff rank that can run everything:**
```
- tea.admin
- tea.lobby.admin
```

**Regular player rank (no-op defaults, explicit):**
```
- tea.arena.play
- tea.chat.use
- tea.kit
- tea.stats
- tea.lobby.play
```

**Read-only "trial moderator" that can watch matches but not change state:**
```
- tea.arena.play
- tea.chat.staff
- tea.chat.global
```
(Deliberately excludes `tea.arena.admin`, `tea.map.admin`, `tea.lobby.admin`, `tea.reload`.)

## Notes

- `tea.admin` is an umbrella permission: granting it automatically grants every child node listed above. You don't need to list children separately unless you want to override one back to `false`.
- The dashboard is not gated by Bukkit permissions — it uses a single admin token configured in `plugins/TeaCore/config.yml`. See the Dashboard page.
- Event-driven flows (the matchmaker teleporting players at match start, the lobby UI spawning players on respawn) bypass permission checks — those are server-side operations, not commands.
