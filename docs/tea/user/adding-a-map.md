---
sidebar_position: 5
title: Authoring a map
---

# Authoring a map

Tea's map authoring runs entirely through `/tea map ...` commands. Each authoring session happens in a temporary void world that is created on `create`, rendered with your schematic on `edit`, and torn down on `save` or `discard`. Spawn positions are stored as offsets from the region's min-corner, so pasting the map into an arena world always puts spawns in the right place.

WorldEdit or FastAsyncWorldEdit must be installed on the server for schematic capture to work. Tea owns the save itself - you do not need to run `//schem save`.

Every game built on Tea shares this authoring flow. Games extend `/tea map` with their own subcommands via the map-extension registry - see each game's own map-authoring page for those extras. For example, Ascend registers `/tea map evolutionviewer` and `/tea map evolutionmob` for its evolution ceremony.

## Required fields

A map can only be saved once all of the following are set:

- `pos1` and `pos2` - two opposite corners of the region the schematic captures
- A **waiting spawn** - where players stand in WAITING / COUNTDOWN
- At least one **participant spawn** - where players teleport when the match goes LIVE
- `min` and `max` player counts

Games may enforce additional required spawns on top of these. `/tea map status` prints every field (core + game-specific) and flags missing ones before you try to save. `/tea map save` validates the same list and refuses to save if anything is missing.

## Workflow: creating a brand new map

```
/tea map create <gameId> <mapId>
```

For example, `/tea map create ascend jungle` creates a void world `tea_edit_<you>_ascend_jungle`, teleports you to `(0, 64, 0)`, and puts you in creative mode with an empty draft.

Build your map, or paste an existing schematic with WorldEdit's `//paste`.

Walk to one corner of the region you want captured (not necessarily the map bounds - just the blocks you want in the schematic):

```
/tea map pos1
```

Walk to the opposite corner:

```
/tea map pos2
```

Set a waiting spawn (where players stand while the match is in WAITING/COUNTDOWN):

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

Set any game-specific spawns the game you're authoring for requires. For Ascend, see the [Ascend map-authoring page](../../ascend/user/map-authoring.md).

Check what's still missing at any point:

```
/tea map status
```

Save:

```
/tea map save
```

This captures the region between `pos1` and `pos2` into `plugins/TeaCore/maps/schems/<mapId>.schem`, writes the metadata into `plugins/TeaCore/maps/<gameId>.yml`, teleports you out, and deletes the edit world.

## Workflow: editing an existing map

```
/tea map edit <gameId> <mapId>
```

This re-creates a fresh void world and pastes the saved schematic into it. Your previously-saved `pos1`, `pos2`, spawns, and any game-specific fields are loaded so you can verify and modify them.

Modify anything:

- Rebuild blocks - the next `save` captures the new version.
- Move `pos1` / `pos2` to re-size the captured region.
- Walk to a new location and run `/tea map addspawn` to add a spawn.
- Run `/tea map clearspawns` to wipe all participant spawns and re-add them from scratch.
- Re-run any game-specific extension commands (for example `/tea map evolutionviewer` and `/tea map evolutionmob` for Ascend).
- Update `/tea map min` / `/tea map max`.

Save:

```
/tea map save
```

Always re-captures a fresh schematic. The old one in `schems/` is overwritten.

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

`/tea map reload` re-reads `plugins/TeaCore/maps/<gameId>.yml` from disk at runtime - handy if you hand-edited YAML or copied maps in without restarting.

## Deleting a map

```
/tea map delete <gameId> <mapId>
```

Removes the YAML entry, deletes the schematic file, and unregisters the map from the running MapService.

## Authoring across restarts

If you crash or restart with drafts open, the temporary edit worlds are purged on the next TeaCore startup (any folder matching `tea_edit_*` in the world container that's not currently loaded gets deleted). The in-memory draft is lost, so don't expect to resume - re-run `/tea map edit` to re-paste the latest saved schematic and continue from there.
