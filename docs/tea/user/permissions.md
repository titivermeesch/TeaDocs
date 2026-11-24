---
sidebar_position: 6
title: Permissions
---

# Permissions

Each TeaCore command checks a Bukkit permission node. Game plugins built on Tea either register their own commands (with their own permissions) or hook into TeaCore's `/tea` tree. Each game documents its own permissions.

The table lists each node, its default, and the commands it controls. Use your permissions plugin (LuckPerms, PermissionsEx, etc.) to grant or revoke them per group.

## TeaCore

| Permission | Default | What it grants |
| ---------- | ------- | -------------- |
| `tea.admin` | op | Umbrella for admin access. Grants every child node below (`tea.reload`, `tea.version`, `tea.arena.admin`, `tea.settings`, `tea.arena.play`, `tea.chat.use`, `tea.chat.staff`, `tea.chat.global`, `tea.map.admin`, `tea.stats`). |
| `tea.reload` | op | `/tea reload`: reload config, theme, and locale bundles. |
| `tea.version` | everyone | `/tea version`: print the running TeaCore version. |
| `tea.arena.admin` | op | `/tea arena allocate`, `/tea arena release`, `/tea arena start`, `/tea arena observe`: spin up, tear down, force-start, and staff-observe arenas. Also `/tea admin` and every action in the [arena manager](./arena-manager.md). |
| `tea.settings` | op | The Settings menu in `/tea admin`. See [Changing settings](./settings.md). |
| `tea.arena.play` | everyone | `/tea arena join`, `/tea arena spectate`, `/tea arena leave`, plus the top-level `/leave` command, for player-side arena entry and exit. |
| `tea.map.admin` | op | Every `/tea map <subcommand>`: author, save, edit, delete map definitions. Game plugins register their map-authoring extensions (for example marking game-specific spawn points) as `/tea map` subcommands, so they also run under this node. Also the map editor checklist and the arena manager's maps menu. |
| `tea.chat.use` | everyone | `/chat`: switch the active chat channel. Always allows the `match` and `team` channels. |
| `tea.chat.staff` | op | Read and send messages on the staff channel (`/chat staff`). |
| `tea.chat.global` | op | Send messages on the global channel (`/chat global`). Everyone still receives global messages. |
| `tea.kit` | everyone | `/kit`: open the kit picker, or select a kit by id. Selecting a priced kit you don't own buys it first. |
| `tea.stats` | everyone | `/tea stats`: view **your own** stats. Viewing another player's stats (`/tea stats <player>`) also requires `tea.admin`. |
| `tea.menu` | everyone | `/menu <id>`: open a menu by id for yourself. Also gates `/profile`. A menu file can require an extra permission with `permission:`. See [Menus](./menus.md#opening-a-menu-by-command-menu). |
| `tea.menu.others` | op | `/menu <id> <player>`: open a menu for another online player. Also skips a menu file's `permission:` check. |
| `tea.dashboard.*` | op | `/dashboard` sign-in and every web dashboard action. One node per action, plus the `viewer`, `moderator` and `admin` bundles. See [Dashboard permissions](./dashboard.md#permissions). |
| `tea.board` | everyone | `/board` (alias `/sidebar`): hide or show your own sidebar. See [Feature switches](./features.md#board-per-player-sidebar-toggle). |
| `tea.vote` | everyone | `/vote` and the map vote item. See [Map voting](./map-voting.md). |
| `tea.ranked` | everyone | `/play <game> ranked`. See [Ranked play](./ranked.md). |
| `tea.leaderboard` | everyone | `/leaderboard <game>`. |
| `tea.lobby.play` | everyone | `/play <game> [map]`: queue for a game from the lobby. `/play` with no arguments opens the [game selector](./lobby.md#game-selector). (`/leave` is gated by `tea.arena.play` above so it works on every server.) Applies only on servers where `lobby.enabled: true`. |
| `tea.lobby.admin` | op | `/tea lobby` and all its subcommands: `sign bind\|unbind\|list`, `spawn set\|tp`, `config show\|manage-spawn\|gamemode`, and `reload`. Applies only on servers where `lobby.enabled: true`. |

## Common permission recipes

**Staff rank that can run everything:**
```
- tea.admin
- tea.lobby.admin
- tea.menu.others
```

**Regular player rank (no-op defaults, explicit):**
```
- tea.arena.play
- tea.chat.use
- tea.kit
- tea.stats
- tea.board
- tea.vote
- tea.ranked
- tea.leaderboard
- tea.menu
- tea.lobby.play
```

**Read-only "trial moderator" that can watch matches but not change state:**
```
- tea.arena.play
- tea.chat.staff
- tea.chat.global
```
(Leaves out `tea.arena.admin`, `tea.map.admin`, `tea.lobby.admin`, `tea.reload`.)

## Notes

- `tea.admin` is an umbrella permission: granting it grants every child node listed above. You only need to list a child if you want to override it back to `false`.
- Staff sign in to the dashboard with `/dashboard`, and the `tea.dashboard.*` nodes decide what they can do there. The admin token in `plugins/TeaCore/config.yml` is for scripts and API access. See [Dashboard permissions](./dashboard.md#permissions).
- Event-driven flows (the matchmaker teleporting players at match start, the lobby UI spawning players on respawn) skip permission checks because they run on the server, without a command.
