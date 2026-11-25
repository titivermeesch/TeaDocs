---
sidebar_position: 3
title: Server versions
---

# Server versions

TeaCore and the games built on it run on **Minecraft 1.8.8 to 1.12.2, and 1.16.5 up to the latest release**, all from the same plugin jars. TeaCore detects the version at startup and logs it:

```
[TeaCore] Platform: legacy (Minecraft 1.8.8)
[TeaCore] Platform: modern (Minecraft 1.21.4)
```

## Which games run where

| Plugin | Versions |
| ------ | -------- |
| TeaCore | 1.8.8 to 1.12.2, 1.16.5 to latest |
| Fireball, Overcharge, TeaCosmetics | 1.8.8 to 1.12.2, 1.16.5 to latest |
| Ascend | 1.8.8 to 1.12.2, 1.16.5 to latest, with a [LibsDisguises](https://www.spigotmc.org/resources/libs-disguises-free.81/) build for your server version |

## 1.13 to 1.16.4

These versions can't load Tea. From 1.13, the server rewrites every plugin class as it loads, and on 1.13 to 1.15 the library that does this can't read Java 17 classes. The server stops TeaCore with `Unsupported class file major version 61` before any of its code runs. Update to 1.16.5 or newer, or stay on 1.12.2 or older.

On versions that lack a mob or item, the games use the closest one: Ascend's Warden stage becomes a Wither on 1.8, the Phantom a Bat, the Piglin a Zombie Pigman; Overcharge's energy cells are prismarine crystals instead of amethyst shards.

## Which server software

| Minecraft | Server software | Java |
| --------- | --------------- | ---- |
| 1.20.5 and newer | Paper (or Spigot), or a fork such as Purpur | 21 or newer, as Minecraft requires |
| 1.17 to 1.20.4 | Paper (or Spigot) | 17 or newer |
| 1.16.5 | Paper (or Spigot) | 17 or newer |
| 1.8.8 to 1.12.2 | Paper (or Spigot), or a fork | 17 or newer |

Every Tea jar needs Java 17 or newer, including on 1.8.8. Older Minecraft versions were made for Java 8, so on 1.8.8 pick server software that runs on Java 17.

On Paper 1.16.5, add `-DPaper.IgnoreJavaVersion=true` to the start command so it accepts Java 17. If you use FastAsyncWorldEdit there, use a build made for 1.16.5 (2.4.x): newer FAWE builds crash while pasting maps on 1.16.5.

## 1.8.8 on Java 17

These run Tea on Java 17 or newer:

- **Paper 1.8.8** (the last official 1.8.8 build from PaperMC). Tested with every Tea plugin on Java 17. At startup it prints a `NoSuchFieldException: modifiers` warning from its own `stackable-buckets` option, which newer Java blocks; nothing else is affected.
- **Spigot 1.8.8**, built with BuildTools. Add one line to `server.properties`:

  ```properties
  use-native-transport=false
  ```

  Without it, Spigot 1.8.8's old network library fails on newer Java and players can't connect.
- **1.8.8 forks that update the network library**, such as PandaSpigot, Titanium or WindSpigot, need no change. Their own pages say which Java versions they support; check before you switch.

Running a 1.8.8 network on Java 8 for other plugins? Run the Tea servers on Java 17 and leave the rest as they are: each server picks its own Java.

## What changes per version

Gameplay is the same on every version. Older versions lack some display features, so TeaCore falls back to the closest option:

| Feature | 1.19.4 and newer | Older versions |
| ------- | ---------------- | -------------- |
| Floating text (cannon labels, map editor labels) | Text displays | Stacked name tags on invisible armor stands |
| Coloured particles (fireball trails, map editor markers) | Sized dust | Coloured dust, one size |
| Team-coloured names | Team colour | Name prefix in the team colour |
| Glowing items (power-ups) | Glow outline | No outline (1.9+) |
| Off-hand | Locked for TeaCore items | 1.8 has no off-hand |
| Attack cooldown | Vanilla 1.9+ combat | 1.8 combat (no cooldown) |
| Sidebar line length | 64 characters per half | 16 characters per half (longer lines are cut) |
| Chat colours | Any RGB colour | The nearest of the 16 colours |

Config and menu files name items, sounds, particles and potion effects by their modern names (`RED_WOOL`, `ENTITY_BLAZE_SHOOT`, `SLOWNESS`). On older versions TeaCore uses the matching old one (`WOOL:14`, `FIREBALL`, `SLOW`).

## Maps

| | 1.16.5 and newer | 1.8 to 1.12 |
| --- | --- | --- |
| Map file | `<map>.schem` (Sponge format) | `<map>.schematic` (MCEdit format) |
| WorldEdit / FAWE | Needed to save and paste maps | Not needed: TeaCore reads and writes `.schematic` itself |

`/tea map save` writes the format of the server you're on. Modern servers can also paste `.schematic` maps (WorldEdit reads them), so a map built on 1.8 works everywhere. A `.schem` map built on a modern server uses blocks 1.8 doesn't have, so it can't be pasted on 1.8: build or convert those maps on 1.8.

Only blocks are stored in `.schematic` maps. Chest contents and entities aren't; games fill chests themselves.

## Players on other versions

The server version decides which features you get. Your proxy decides which client versions can join: install ViaVersion, ViaBackwards and ViaRewind on it to let newer or older clients join. With ViaRewind, set `cooldown-indicator: BOSS_BAR` in its config so 1.8 players don't get the attack-cooldown bar as a flickering subtitle.
