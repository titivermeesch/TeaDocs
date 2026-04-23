---
sidebar_position: 2
title: Installing the engine
---

# Installing the engine

Tea is distributed as two plugin jars: `TeaCore` and `TeaLobby`. Which ones you install depends on what a given server is supposed to do.

## Which plugins go where

| Server role | Plugins to install | Why |
| ----------- | ------------------ | --- |
| Lobby / hub | `TeaCore`, `TeaLobby` | `/play`, `/leave`, `/queue`, connection signs, lobby-side matchmaker |
| Game server (arena) | `TeaCore` + your game's jar | Runs matches; games declare `depend: [TeaCore]` |
| Single-server deployment | Everything above | All plugins in the same JVM |

`TeaLobby` declares `depend: [TeaCore]`. Any game plugin built on Tea (for example Ascend) does the same. Game plugins may add their own hard dependencies - check the installation page for each game.

WorldEdit or FastAsyncWorldEdit is a soft-dependency of TeaCore. It's only required for map authoring (`/tea map create`, `/tea map edit`) and for pasting schematics at arena allocation time. Nothing else needs it.

## First boot

1. Drop `TeaCore.jar` and `TeaLobby.jar` into `plugins/` on each server, plus any game jars you want to run there.
2. Start the server once. Each plugin extracts its defaults:
   - `plugins/TeaCore/config.yml`
   - `plugins/TeaCore/theme.yml`
   - `plugins/TeaCore/lang/en_US.yml`
   - `plugins/TeaLobby/config.yml`, `plugins/TeaLobby/lang/en_US.yml`
   - Each game's own config and lang files
3. Stop the server, edit those files as needed (see [Network mode](./configuring-network-mode.md) and [Theme](./theme-and-i18n.md)), then start again.

## Upgrading

Replace the jar and restart. On enable, each plugin merges newly-added translation keys and config defaults from its jar into your on-disk files, so your customizations survive upgrades and any new keys still work.

If you ever end up with a corrupt or partially-edited language file, delete `plugins/<PluginName>/lang/*.yml` and restart - the bundles will be re-extracted.

## Proxy setup (BungeeCord or Velocity)

Tea uses the legacy `BungeeCord` plugin-message channel for cross-server connects - both BungeeCord and Velocity honor this channel. You do not need a proxy-side plugin.

### BungeeCord

In `config.yml`:

```yaml
ip_forward: true
```

### Velocity

In `velocity.toml`, make sure the channel isn't disabled (it's enabled by default) and forwarding mode is either `legacy` (simplest, matches the server's `spigot.yml bungeecord: true`) or `modern` with a shared secret:

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
