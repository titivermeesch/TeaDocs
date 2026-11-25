---
sidebar_position: 5
title: Authoring a map
---

# Authoring a map

You author Tea maps with `/tea map ...` commands. Each authoring session runs in a temporary void world: TeaCore creates it on `create`, pastes your schematic into it on `edit`, and deletes it on `save` or `discard`. TeaCore stores spawn positions as offsets from the region's min-corner, so spawns land in the right place when the map is pasted into an arena world.

On 1.16.5 and newer, you need WorldEdit or FastAsyncWorldEdit installed to save maps (TeaCore uses it as a soft dependency and does not bundle it). On 1.8 to 1.12 TeaCore saves maps itself. In both cases TeaCore does the save, so you do not need to run `//schem save`. TeaCore saves maps as `.schem` on modern servers and `.schematic` on 1.8 to 1.12 (see [Server versions](./server-versions.md#maps)).

Every game built on Tea uses this authoring flow. Games add their own `/tea map` subcommands through the map-extension registry; each game's map-authoring page lists them.


You can author a map with commands only, or with the [editor tools](#editor-tools) TeaCore puts on your hotbar while you edit.

## Required fields

You can save a map once these are set:

- `pos1` and `pos2`: two opposite corners of the region the schematic captures
- A **waiting spawn**: where players stand in WAITING / COUNTDOWN
- At least one **participant spawn**: where players teleport when the match goes LIVE
- `min` and `max` player counts

Games can require more spawns on top of these. `/tea map status` prints every field (core + game-specific) and flags missing ones before you try to save. `/tea map save` validates the same list and refuses to save if anything is missing.

## The setup sidebar

While you have a draft open (after `create` or `edit`), Tea shows a **Map Setup** sidebar with the steps you still need to do. It shows the next few incomplete steps, each with the command to run, plus a `+N more step(s) left` footer. When you complete a step it drops off and the next one moves up. Once every required field is set, run `/tea map save`.




Toggle the sidebar for yourself with:

```
/tea map board
```

It defaults on each time you start a new authoring session. To turn it off server-wide, set `map-setup-scoreboard.enabled: false` in `plugins/TeaCore/config.yml`.

## Editor tools



![Editing a map: the tools on the hotbar and the setup sidebar](/img/tea/map-editor.png)

| Slot | Tool | Use |
| --- | --- | --- |
| 1 | Region wand (blaze rod) | Left-click a block: pos1. Right-click a block: pos2. |
| 2 | Point tool | Right-click a block: place the selected point on top of it. Right-click air: place it where you stand. Left-click a marker: remove it. |
| 8 | Checklist (book) | Opens the [checklist menu](#checklist). |
| 9 | Save (emerald) | Same as `/tea map save`. |



**Choosing a point type.** The point tool places one kind of point at a time: participant spawns, the waiting spawn, or one of the specific game's own points. Its name shows the selected type and how many are placed. To pick another type, hold sneak and scroll, or sneak and right-click (sneak and left-click goes back). You can also pick a type in the checklist.

Spawns placed with the tool face the direction you were looking.




**Markers.** Every point shows as a coloured particle column with a floating label (`Spawns #2`, `chest #5`). The region is outlined in white, with orange corners. To remove a point, look at its marker and left-click with the point tool. You can remove any marker this way, whatever type is selected.


### Checklist

The checklist menu shows:

- **Region**: its size, or "Not set". Left- or right-click teleports you to pos1 or pos2.
- **Players**: the min and max player count. Left/right-click changes min by 1; shift + left/right-click changes max.
- **Display name**: set it with `/tea map displayname <name>`.
- **Ready to save** or **Steps missing**: click to save.
- One entry per point type with its count and whether it is done, required or optional. Left-click selects it on the point tool, right-click teleports you to its first point, shift-click removes all of them (after you confirm).

The eye button shows or hides the markers. The TNT button discards the draft (after you confirm).

![The map setup checklist](/img/tea/map-checklist.png)

To turn the tools and markers off, set `features.map-editor-tools: false` in `config.yml`. The commands below work either way.

## Workflow: creating a brand new map

```
/tea map create <gameId> <mapId>
```

For example, `/tea map create mygame jungle` creates a void world `tea_edit_<you>_mygame_jungle`, teleports you to `(0, 64, 0)`, and puts you in creative mode with an empty draft.

Build your map, or paste an existing schematic with WorldEdit's `//paste`.

Walk to one corner of the region you want captured (this can differ from the map bounds; pick the blocks you want in the schematic):

```
/tea map pos1
```

Walk to the opposite corner:

```
/tea map pos2
```

Set a waiting spawn (where players stand while the match is in WAITING/COUNTDOWN, unless you set a [waiting room or shared waiting area](./lobby.md#where-players-wait)):

```
/tea map waiting
```

For each participant spawn point (where players teleport when the match goes LIVE), walk to that spot facing the direction you want them to spawn and run:

```
/tea map addspawn
```

Set the map's player bounds:

```
/tea map min 4
/tea map max 10
```

Set any game-specific spawns the game you're authoring for requires. Each game documents its own extra spawn commands.

The [setup sidebar](#the-setup-sidebar) shows what's missing. To print the full checklist in chat, run:

```
/tea map status
```

Save:

```
/tea map save
```

This captures the region between `pos1` and `pos2` into `plugins/TeaCore/maps/schems/<mapId>.schem` (`.schematic` on 1.8 to 1.12), writes the metadata into `plugins/TeaCore/maps/<gameId>.yml`, teleports you out, and deletes the edit world.

## Workflow: editing an existing map

```
/tea map edit <gameId> <mapId>
```

This creates a new void world and pastes the saved schematic into it. Your previously-saved `pos1`, `pos2`, spawns, and any game-specific fields are loaded so you can verify and modify them.

Modify anything:

- Rebuild blocks. The next `save` captures the new version.
- Move `pos1` / `pos2` to re-size the captured region.
- Walk to a new location and run `/tea map addspawn` to add a spawn.
- Run `/tea map clearspawns` to wipe all participant spawns and re-add them from scratch.
- Re-run any game-specific extension commands the game registers under `/tea map`.
- Update `/tea map min` / `/tea map max`.

Save:

```
/tea map save
```

Saving captures a new schematic and overwrites the old one in `schems/`.

## Discarding changes

```
/tea map discard
```

Teleports you out and deletes the edit world without writing anything.

## Listing and inspecting maps

```
/tea map list
/tea map list <gameId>
/tea map info <gameId> <mapId>
```

`/tea map reload` re-reads `plugins/TeaCore/maps/<gameId>.yml` at runtime. Use it after you hand-edit YAML or copy maps in without restarting. With maps stored in the database (the default), it also uploads what you added, and every other server picks it up.

You only build or copy a map on one server. TeaCore keeps maps in the database and sends them to every server; see [Arena servers](./hosting.md#maps-in-the-database).

## Deleting a map

```
/tea map delete <gameId> <mapId>
```

Removes the YAML entry, deletes the schematic file, and unregisters the map from the running MapService. TeaCore keeps a backup first, so you can bring the map back with `/tea map restore`.

## Moving maps between networks

`/tea map export <game> <map>` writes one map to a zip in `plugins/TeaCore/exports/`, and `/tea map export all` writes every map and waiting room. `/tea map import-zip <file>` loads a zip from that folder. The dashboard does the same with its Download and Upload buttons. See [Arena servers](./hosting.md#downloading-and-uploading-maps).

## Map versions
Each time you save over a map, delete it or restore it, TeaCore copies the old YAML entry and schematic to `plugins/TeaCore/maps/backups/<gameId>/<mapId>/`. Versions are shared through the database like the maps, so any server can restore them. It keeps the newest 10 per map. Change that in `config.yml`:

```yaml
maps:
  keep-versions: 10
```

List a map's versions, newest first:

```
/tea map history <gameId> <mapId>
```

```
Versions of fireball/coliseum (newest first)
#1 2026-11-20 14:02 - Notch (save)
#2 2026-11-19 18:40 - Notch (save)
```

The word in brackets says what replaced that version: `save`, `delete`, or `before restore` for the version a restore replaced.

Put one back:

```
/tea map restore <gameId> <mapId> <n>
```

The map you had becomes the new `#1`, so you can undo a restore with `/tea map restore <gameId> <mapId> 1`. Restore also works for a deleted map. Arenas already running keep the map they started with; new arenas use the restored one. You can't restore a map while someone has it open in the editor.

You can also restore from the [arena manager](./arena-manager.md) (shift + right-click a map) and from the [web dashboard](./dashboard.md) (the clock button next to a map). Restores post to the staff channel when [Discord](./discord.md) is set up.

On a network, each server keeps its own `maps/` folder. The dashboard sends the restore to every server that hosts the game, so give them a shared `maps/` folder if you want the version numbers to match.

## Authoring across restarts

If the server crashes or restarts while drafts are open, TeaCore deletes the temporary edit worlds on its next startup (any unloaded folder matching `tea_edit_*` in the world container). You lose the in-memory draft. Run `/tea map edit` to paste the latest saved schematic and continue from there.
