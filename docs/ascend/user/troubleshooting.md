---
sidebar_position: 5
title: Troubleshooting
---

# Ascend troubleshooting

This page covers problems specific to Ascend. For engine problems (network mode, database, Redis, map pasting, chat routing) see the [Tea troubleshooting page](../../tea/user/troubleshooting.md).

## `/play ascend` fails with "Unknown game ascend"

Ascend is not running on any server in the network. See the Tea-level version of this error in the [Tea troubleshooting page](../../tea/user/troubleshooting.md#play-game-fails-with-unknown-game-name). The Ascend-specific causes are:

- `Ascend.jar` not installed on the arena server.
- Ascend disabled itself during startup. Look for a `SEVERE` line in the arena server log.

## Morph not visible / player looks like themselves to others

The disguise didn't apply. Check:

- LibsDisguises is enabled without errors on the server.
- The stage's `mob-type` is a valid `EntityType` name. Ascend logs "Unknown mob-type: XYZ" at startup for invalid values.
- The evolving player sees themselves in first person on purpose, to keep the controls usable. Other players see the morph.

## Evolution ceremony is in the wrong spot

The map's `evolution-viewer` and/or `evolution-mob` spawns are off. Run `/tea map edit ascend <map>` to open the draft, walk to the right positions and run `/tea map evolutionviewer` / `/tea map evolutionmob`, then `/tea map save`. `/tea map status` shows every spawn currently set on the draft.

## Ceremony fires but mob puppets don't appear

The ceremony sends per-viewer mob packets. If nothing shows up:

- The `evolution-mob` spawn is inside a wall or below the world. Re-run `/tea map edit` and reposition it.
- Another plugin is intercepting outbound entity-spawn packets. Try disabling packet-modifying plugins one at a time.

## Sneak-evolve does nothing on slabs/stairs

If sneak-progress isn't ticking up:

- You have to hold sneak for 3 seconds (2s with Quick Evolver). Damage resets the progress bar.
- You must have an evolve unlocked, which takes a kill since your last evolve.
- The arena must be in LIVE state.

## Abilities don't trigger when right-clicking an enemy morph

If a right-click doesn't fire your stage ability:

- Your stage's `ability:` in `config.yml` is blank or points at an unregistered id.
- The arena isn't in LIVE state yet.
- An inventory menu or another plugin's interaction handler is stealing the event first.

## "Missing translation: ascend.xxx" in chat or scoreboard

A translation key your stage uses isn't present in any loaded `lang/*.yml`. Ascend adds missing keys from the jar on startup, so restart the server first. If you added custom stages to `config.yml` and the scoreboard shows `ascend.stage.<your-id>`, the stage's translation key is missing from your locale bundle. Add it and run `/tea reload`.

## Match ends instantly on apex arrival

Your `stage-order:` list has fewer entries than expected, so the first stage a player reaches is already the apex. Check that `/tea reload` picked up your edits, and confirm `stage-order` lists every stage you want on the ladder, in the right order.

## Devolve-on-death keeps knocking me back to stage 0

`game.devolve-on-death: true` is the default. Set it to `false` in `plugins/Ascend/config.yml` so deaths cost HP but no progress.

## Winner isn't crowned at match timeout

`game.max-match-seconds` has elapsed but nobody wins. Ascend picks the highest-stage player when the timer runs out; ties (equal stages) resolve to no winner and the arena resets with no celebration. If this happens often, change `game.max-match-seconds` so more matches end with a winner.
