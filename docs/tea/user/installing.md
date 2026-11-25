---
sidebar_position: 2
title: Installing the engine
---

# Installing the engine

Tea ships as a single plugin jar: `TeaCore`. Lobby features (connection signs, `/play`, lobby spawn / gamemode management) ship inside that jar, and you turn them on per server with a config toggle.

## Which plugins go where

| Server role | Plugins to install | TeaCore config | Why |
| ----------- | ------------------ | -------------- | --- |
| Lobby / hub | `TeaCore` | `lobby.enabled: true` | `/play`, `/leave`, connection signs, lobby-side matchmaker |
| Game server (arena) | `TeaCore` + your game's jar | `lobby.enabled: false` | Runs matches; games declare `depend: [TeaCore]` |
| Single-server deployment | `TeaCore` + your game's jar | `lobby.enabled: true` | One JVM hosts both lobby and arenas |

Any game plugin built on Tea requires the TeaCore plugin. Game plugins can add their own hard dependencies. Check the installation page for each game.




WorldEdit or FastAsyncWorldEdit is a soft dependency of TeaCore. On 1.16.5 and newer you need it for map authoring (`/tea map create`, `/tea map edit`) and for pasting maps into arenas. Nothing else needs it. On 1.8 to 1.12 TeaCore saves and pastes maps itself, so you don't need it there. See [Server versions](./server-versions.md).


Floodgate is a soft dependency too. With it on a server, Bedrock players get [menus as forms](./menus.md#bedrock-players).


Parties (AlessioDP) and Party and Friends are soft dependencies as well: with one of them, [parties play together](./parties.md).

## First boot

1. Drop the `TeaCore` jar into `plugins/` on each server, plus any game jars you want to run there.
2. Start the server once. TeaCore extracts its defaults:
   - `plugins/TeaCore/config.yml`
   - `plugins/TeaCore/theme.yml`
   - `plugins/TeaCore/lang/en_US.yml`
   - Each game's own config and lang files

   It also downloads the libraries it needs into `plugins/TeaCore/libs/` (see [Libraries](#libraries)), so the server needs internet access on this first start.
3. Stop the server. Edit `plugins/TeaCore/config.yml` as needed (see [Network mode](./configuring-network-mode.md) and [Theme](./theme-and-i18n.md)). On any server that should host the lobby UI, set:

   ```yaml
   lobby:
     enabled: true
   ```

   Leave it `false` (the default) on arena-only servers. Then start the server again.

## Libraries

To keep the jar small, TeaCore doesn't bundle its larger libraries. It downloads them from Maven Central when it starts, checks each file's SHA-256 checksum, and keeps them in `plugins/TeaCore/libs/`. Later starts load them from that folder and don't need internet.

TeaCore only downloads what your config uses:

| Libraries | Downloaded when |
| --------- | --------------- |
| Jackson | Always |
| Lettuce, Netty and Reactor (Redis) | `network.mode` is not `standalone` |
| Javalin, Jetty and Kotlin (dashboard) | `dashboard.enabled: true` |
| MySQL Connector/J | `database.type: mysql` |

If you turn on one of these features later, TeaCore downloads its libraries on the next start.

### Servers without internet

If a download fails, TeaCore logs every missing file with its download URL and the exact path it expects under `plugins/TeaCore/libs/`, then disables itself. Download those files on another machine and put each one at the path shown, then restart. You can also copy the whole `plugins/TeaCore/libs/` folder from a server running the same TeaCore version with the same features turned on.

## Upgrading

Replace the jar and restart. If the new version uses newer libraries, TeaCore downloads them on that start. On enable, TeaCore (and each game plugin) merges newly-added translation keys and config defaults from its jar into your on-disk files, so your changes survive upgrades and new keys work.

If a language file gets corrupted or half-edited, delete `plugins/<PluginName>/lang/*.yml` and restart. TeaCore extracts the bundles again.

## Proxy setup (BungeeCord or Velocity)

Tea uses the legacy `BungeeCord` plugin-message channel to move players between servers. BungeeCord and Velocity both support this channel. You do not need a proxy-side plugin.

### BungeeCord

In `config.yml`:

```yaml
ip_forward: true
```

### Velocity

In `velocity.toml`, keep the channel enabled (the default) and set the forwarding mode to `legacy` (the easiest option; it matches the server's `spigot.yml bungeecord: true`) or to `modern` with a shared secret:

```toml
player-info-forwarding-mode = "legacy"

[advanced]
bungee-plugin-message-channel = true
```

### Game servers

On each server's `spigot.yml`:

```yaml
settings:
  bungeecord: true
```
