---
sidebar_position: 8
title: Dashboard
---

# Web dashboard

TeaCore ships an embedded management dashboard: a React single-page app bundled inside the plugin jar and served over HTTP by the plugin itself. No external hosting, no separate process to deploy. From one URL you can see every arena, queue entry, online player, and registered game across your whole fleet, and drive control actions (start / release / allocate / end-match / reload maps / delete maps) from the browser.

## Enabling it

The dashboard is **off by default**. Enable it on exactly one server in your fleet — usually the lobby — so you get a single network-wide view.

Edit `plugins/TeaCore/config.yml`:

```yaml
dashboard:
  enabled: true
  bind-address: "0.0.0.0"   # "127.0.0.1" to limit to localhost + reverse proxy
  port: 8080
  admin-token: ""           # leave blank; TeaCore fills in a random token on first boot
```

Restart the server. On first boot TeaCore generates a random `admin-token`, writes it back to `config.yml`, and logs the value once at INFO. Grab it with:

```bash
grep admin-token plugins/TeaCore/config.yml
```

Then browse to `http://<host>:<port>/` (default `http://localhost:8080/`), paste the token when prompted, and you're in.

## What's on it

**Arenas panel.** One row per running arena across every server. Columns: arena id (short), game, map, state, server, roster count, uptime. Filter by state or game. Click a row to expand the full roster with player names, UUIDs, and their current team assignment. Action buttons per row — **Force start**, **Release**, **End match** — do exactly what their `/tea arena` equivalents do, just via the dashboard.

**Queue panel.** Players currently in the matchmaker queue, per game. Position, time waited, preferred map (if any).

**Games panel.** Every game registered with TeaCore, pool configuration, number of arenas live / warm / allocating.

**Maps panel.** Every map per game, with a **Delete** action. Reload maps from disk without restarting the plugin.

**Allocate button.** Global. Pick a game and an optional map; the matchmaker leader picks a server and spins up a fresh arena.

**Reload button.** Global. Runs `/tea reload` on the server hosting the dashboard (config + theme + locale bundles).

Updates stream live over WebSocket — no manual refresh needed. Arenas changing state, players joining/leaving, and queue entries appearing all show up within a tick or two.

## Cross-server dashboards

In `standalone` mode the dashboard sees only the server it's running on, because there are no other servers.

In `central` or `external` mode the dashboard reads fleet-wide state from Redis and issues control actions (allocate, release, end-match, delete-map, reload) back through Redis so the owning server can execute them. This means:

- You only ever need to enable the dashboard on **one** server. Pick the lobby.
- Redis must be reachable from the dashboard host with the same credentials as every other TeaCore instance in the fleet.
- Actions taken in the dashboard are the same as running the `/tea …` command on the owning server — the same permission logic applies at the server side, just bypassed client-side by the admin token.

## Authentication

Every API endpoint and every WebSocket message requires the `admin-token`. There is only one token. There are no player-facing endpoints, no user accounts, no sessions with expiry — the token is the whole auth story.

Consequences:
- **Treat the token like a password.** Anyone with it can end matches and delete maps across your whole fleet.
- Rotate it by editing `admin-token` in `config.yml` and restarting the server hosting the dashboard. Blank it out and TeaCore will generate a new random one on next boot.
- Bind to `127.0.0.1` + a reverse proxy (nginx, Caddy) with your own TLS + IP allow-list if you're exposing the dashboard on a public network.
- The token is not sent in URL query strings; it's passed in an `Authorization: Bearer` header and in the WebSocket connect handshake.

## Not gated by Bukkit permissions

Dashboard actions do not go through the `tea.admin` / `tea.arena.admin` permission system. They are authenticated purely by the admin token. If you want some staff members to be able to see live matches but not end them, run a second reverse-proxy that strips write-method requests — the dashboard plugin itself does not currently offer granular dashboard-side roles.

## Default ports and endpoints

- HTTP: configured `port`, default `8080`.
- WebSocket: same port, path `/ws`.
- REST endpoints live under `/api/`.
- Static SPA assets live under `/` (the bundled React app).

Open only the configured port, not a range — all traffic multiplexes through one port.
