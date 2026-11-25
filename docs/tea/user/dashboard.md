---
sidebar_position: 12
title: Dashboard
---

# Web dashboard

TeaCore serves a web dashboard from inside the plugin. It shows every arena, queue, player and finished match across your network, live, and lets staff act on them: end a match with a chosen winner, kick or move a player, release an arena, delete a map.

## Turning it on

The dashboard is off by default. Turn it on for one server only, usually the lobby. On a network it reads every server's state through Redis, so one dashboard covers them all.

```yaml
# plugins/TeaCore/config.yml
dashboard:
  enabled: true
  bind-address: "127.0.0.1"
  port: 8080
  public-url: "https://dash.example.com"
  admin-token: ""
```

| Key | Meaning |
| --- | --- |
| `enabled` | Starts the dashboard on this server. Restart to apply. |
| `bind-address`, `port` | Where it listens. One port carries the pages, the API and the live feed. The default `127.0.0.1` only accepts connections from the same machine. See [Opening it to other machines](#opening-it-to-other-machines). |
| `public-url` | The address people open the dashboard at. TeaCore puts it in the login link players get in game. Set it on **every** server, since players can run `/dashboard` from any of them. Without it, players get a code to type instead of a link. |
| `admin-token` | A break-glass login with every permission, and the Bearer token for scripts. TeaCore fills in a random one on first boot. Set it to `off` to turn token login off. |

### Opening it to other machines

By default the dashboard listens on `127.0.0.1`, so only the machine running the server can open it. To reach it from elsewhere, pick one:

- **Reverse proxy (recommended).** Keep `bind-address: "127.0.0.1"` and point nginx or Caddy at `http://127.0.0.1:8080`. The proxy handles HTTPS and is the only thing exposed. For example, with Caddy:

  ```
  dash.example.com {
      reverse_proxy 127.0.0.1:8080
  }
  ```

- **Listen on every interface.** Set `bind-address: "0.0.0.0"` and open the port in your firewall. Use this inside a private network, or when the server runs in Docker and you publish the port (inside a container, `127.0.0.1` is not reachable from the host). Traffic is plain HTTP unless something in front adds HTTPS.

## Signing in

1. In game, run `/dashboard` (or `/tea dashboard login`).
2. Click the link in chat. If `public-url` is not set, open the dashboard and type the code from chat (for example `K7QP-M3XD`).

The code works once and expires after 2 minutes. You are signed in as your Minecraft account, and the dashboard shows your name. A session lasts 12 hours. Restarting the server that runs the dashboard signs everyone out.

When TeaCore makes the code, it records which dashboard permissions you have at that moment. Changes to your permissions apply from your next sign-in. To cut someone off sooner, sign their session out on the Sessions page (see [Pages](#pages)).

The login page also has **Use the admin token instead**, for when nobody can join the server.

![The sign-in page](/img/dashboard-login.png)

Scripts can call the API with `Authorization: Bearer <admin-token>`.

## Permissions

Each dashboard action has its own permission, so you choose what each staff rank can do. Players need `tea.dashboard.view` to sign in.

| Permission | Allows |
| --- | --- |
| `tea.dashboard.view` | Signing in and seeing arenas, queues, games, players, the live arena view and match history. |
| `tea.dashboard.chat` | Seeing match chat in the live arena view. |
| `tea.dashboard.history.export` | Downloading match history as CSV. |
| `tea.dashboard.queue.remove` | Removing a player from a queue. |
| `tea.dashboard.player.kick` | Kicking a player out of an arena. |
| `tea.dashboard.player.move` | Moving a player to another arena. |
| `tea.dashboard.player.spectator` | Making a player a spectator. |
| `tea.dashboard.arena.allocate` | Allocating arenas. |
| `tea.dashboard.arena.start` | Skipping an arena to its next phase. |
| `tea.dashboard.arena.end` | Ending a match, with a winner or as a draw. |
| `tea.dashboard.arena.release` | Releasing arenas. |
| `tea.dashboard.maps.reload` | Reloading maps on every server. |
| `tea.dashboard.maps.delete` | Deleting maps. |
| `tea.dashboard.maps.restore` | Restoring an older version of a map. |
| `tea.dashboard.sessions` | Seeing who is signed in and signing them out. |
| `tea.dashboard.maps.transfer` | Downloading and uploading maps. |
| `tea.dashboard.settings` | Changing settings on the Settings page. See [Changing settings](./settings.md). |

Three bundles grant common sets:

| Bundle | Contains |
| --- | --- |
| `tea.dashboard.viewer` | `view`, `history.export` |
| `tea.dashboard.moderator` | the viewer bundle plus `chat`, `queue.remove` and the three `player.*` permissions |
| `tea.dashboard.admin` | everything (ops have it, and `tea.admin` includes it) |

Every `tea.dashboard.*` node defaults to op, apart from `viewer` and `moderator`, which nobody gets by default. Grant them with your permissions plugin, for example `lp group mod permission set tea.dashboard.moderator`. The dashboard hides buttons you don't have permission for, and the server refuses those actions anyway.

TeaCore writes every action to the console with the account that did it, for example `[dashboard] Notch: end match in arena 63dfe98c-... (winner team red)`.

## Pages

**Overview.** Counts of games, arenas, players and queued players, the arena list, and the latest kills across the network.

![Dashboard overview](/img/dashboard-overview.png)

**Arenas.** Every arena on every server with its state, players and phase timer. Click one to open its live view.

**Live arena view.** For one arena, updated every 2 seconds:

- Teams with their total kills, deaths and assists.
- Every player with their kills, deaths and assists this match. Buttons to make them a spectator, move them to another arena or kick them.
- The arena's in-game sidebar, as one of its players sees it, in its colours. Game-specific lines (Fireball coins, Ascend stages) show up without any dashboard setup.
- The kill feed: who killed whom, with assists and the cause.
- Match chat, for accounts with `tea.dashboard.chat`. Everything players type in a match is visible to those accounts, so grant it with care.
- **End match** (pick the winning team, or the winning player in games without teams, or a draw), **Skip phase** and **Release**.

![The live view of a match](/img/dashboard-arenas.png)

**Queues.** Who is waiting for which game, with a button to remove them.

**Activity.** Charts of players online, players queued and matches running over the last 24 hours, 7 days or 30 days, and matches per day by game. The server running the dashboard records a sample every minute and keeps 35 days.

![The Activity page](/img/dashboard-activity.png)

**Servers.** Every server with its group, version, players, TPS and memory, which games it hosts and how it picks maps, and the arenas open on it. A server that stops reporting turns grey.

![The Servers page](/img/dashboard-servers.png)

**Games.** Every game with its pool and lifecycle settings and its maps. Reload or delete maps here, download one or all of them as a zip, or upload a zip (see [Arena servers](./hosting.md#downloading-and-uploading-maps)). The clock button next to a map lists its [older versions](./adding-a-map.md#map-versions) and restores one.

![The Games page with map download, upload and reload](/img/dashboard-games.png)

**Players.** Online players, and any player's profile by uuid: first and last seen, stats per game, their recent matches and their current win or loss streak. Click a match to open it.

![A player's profile](/img/dashboard-players.png)

**History.** Finished matches, newest first. Filter by game, map, player (name or uuid) and date range. Click a match for every player's team, result and kills, deaths and assists. **Export CSV** downloads the filtered list with one row per player per match, up to 10,000 matches.

![Match history](/img/dashboard-history.png)

A match page lists every player with their team, result, kills, deaths, assists and damage, and marks the MVP.

![One match with the MVP and each player's damage](/img/dashboard-match.png)

**Leaderboard.** The top 100 ranked players of each game. See [Ranked play](./ranked.md).

**Settings.** TeaCore, quest, game and cosmetic settings as forms, saved to every server that has them or to one group of servers, with a history of changes you can undo. Needs `tea.dashboard.settings`. See [Changing settings](./settings.md).

![The Settings page](/img/dashboard-settings.png)

**Sessions.** Who is signed in, from where and until when. Sign any session out. Needs `tea.dashboard.sessions`.

![The Sessions page](/img/dashboard-sessions.png)

## Match history retention

TeaCore deletes matches older than `match-history.keep-days` (default 90) once a day. Set it to `0` to keep everything. Restart to apply.

```yaml
match-history:
  keep-days: 90
```

Matches recorded before this version have no player names, so the player filter only finds them by uuid.

## Networks

On a network (`central` or `external` mode) the dashboard reads every server's arenas from Redis, and its actions run on the server that owns the arena. The kill feed, chat and sidebar travel the same way. Every server must reach the same Redis and the same database: login codes are stored in the database, so a player on any server can sign in to the dashboard on the lobby.

## Security

- Put the dashboard behind HTTPS on any public network. Keep the default `127.0.0.1` bind and let a reverse proxy (nginx, Caddy) handle TLS. The session cookie is marked `Secure` when the proxy sends `X-Forwarded-Proto: https`.
- The session cookie is `HttpOnly` and `SameSite=Strict`, so page scripts can't read it and other sites can't use it.
- After 30 failed sign-ins from one address in a minute, TeaCore refuses more until the minute is over. Successful sign-ins never count.
- Treat the admin token like a password, or set `admin-token: off` once your staff sign in with `/dashboard`.
- Requests may carry a body of up to 64 KB, and must state its size (`Content-Length`). Only a map upload from someone signed in with `tea.dashboard.maps.transfer` may send up to 300 MB. Larger requests get `413`.

## Endpoints

Everything goes through the one port: the web app at `/`, the REST API under `/api/`, and the live event feed at `/api/events` (WebSocket).
