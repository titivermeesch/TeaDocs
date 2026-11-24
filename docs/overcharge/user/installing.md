---
sidebar_position: 1
title: Installing
---

# Installing

## Requirements

- Paper (or Spigot) **1.8.8 to the latest release**. See [Server versions](../../tea/user/server-versions.md).
- TeaCore 0.2.0 or newer, set up as in the [TeaCore install guide](../../tea/user/installing.md).
- WorldEdit or FastAsyncWorldEdit, so TeaCore can paste the map.

## First boot

1. Put the Overcharge jar in `plugins/` on every server that runs matches.
2. Copy the built-in map from Overcharge's `maps/` folder: `overcharge.yml` to `plugins/TeaCore/maps/` and `substation.schem` to `plugins/TeaCore/maps/schems/`.
3. Start the server. Overcharge writes `plugins/Overcharge/config.yml` and `lang/en_US.yml`.
4. Join with a second player and run `/play overcharge`.

Substation has four bases, so up to four teams play on it. Players pick a kit with `/kit overcharge`; without a pick they get the first kit, Runner.

## Stats, achievements and placeholders

`/stats` shows kills, deaths, charge delivered, games played and games won. The achievements are Plugged In (your first delivery), Power Plant (50 charge in one match) and Short Circuit (zap three carriers in one match).

| Placeholder | Value |
| --- | --- |
| `%tea_overcharge_charge%` | Charge you carry. |
| `%tea_overcharge_carry_cap%` | Most charge you can carry. |
| `%tea_overcharge_battery%` | Your team's battery. |
| `%tea_overcharge_battery_<team>%` | A team's battery, for example `battery_red`. |
| `%tea_overcharge_battery_target%` | Charge a battery needs to win. |
