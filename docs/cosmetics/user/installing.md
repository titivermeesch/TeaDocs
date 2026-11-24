---
sidebar_position: 1
title: Installing
---

# Installing

## Requirements

- Paper (or Spigot) **1.8.8 to the latest release**. See [Server versions](../../tea/user/server-versions.md).
- TeaCore 0.2.0 or newer on the same server.
- An economy plugin through Vault (for example EssentialsX) to sell cosmetics for coins. Without one, players can still wear free cosmetics and the ones a permission unlocks.

## First boot

1. Put the TeaCosmetics jar in `plugins/` on every server where players should see cosmetics: the lobby and the servers that run matches.
2. Start the server. TeaCosmetics writes `plugins/TeaCosmetics/config.yml` with example cosmetics, and `lang/en_US.yml`.
3. Join and run `/cosmetics`.

TeaCosmetics stores what players own and wear in TeaCore's database (tables `cosmetics_owned` and `cosmetics_equipped`). On a network, give every server the same MySQL database so a cosmetic bought in the lobby shows up in matches.

## Commands and permissions

| Command | Permission | Default | Does |
| --- | --- | --- | --- |
| `/cosmetics` (alias `/cosmetic`) | `teacosmetics.use` | everyone | Opens the cosmetics menu. |
| `/cosmetics reload` | `teacosmetics.admin` | op | Re-reads `config.yml` and the menus. |

| Permission | Default | Unlocks |
| --- | --- | --- |
| `tea.cosmetic.<id>` | nobody | That cosmetic, without paying. Give it to a rank, or sell it through a store plugin. |
| `tea.cosmetic.*` | nobody | Every cosmetic. |

## The menu

`/cosmetics` opens a menu with one button per cosmetic type. Each type lists its cosmetics with their price and whether you own or wear one:

- Click a cosmetic you own (or that is free) to wear it. Click the one you wear to take it off.
- Click one you don't own to buy it. The price comes off your balance and you wear it at once.

Bedrock players get the menus as forms. The menus are `plugins/TeaCosmetics/menus/cosmetics.yml` and `cosmetics-list.yml`; change them like any [TeaCore menu](../../tea/user/menus.md).
