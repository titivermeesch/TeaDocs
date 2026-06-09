---
sidebar_position: 5
title: Troubleshooting
---

# Ascend troubleshooting

This page covers issues specific to Ascend. For engine-level problems (network mode, DB, Redis, map paste, chat routing) see the [Tea troubleshooting page](../../tea/user/troubleshooting.md).

## `/play ascend` fails with "Unknown game ascend"

Ascend isn't registered on a server in the fleet. See the Tea-level version of this error in the [Tea troubleshooting page](../../tea/user/troubleshooting.md#play-game-fails-with-unknown-game-name). The Ascend-specific causes are:

- `Ascend.jar` not installed on the arena server.
- Ascend disabled itself during startup - scroll up in the arena server log for a `SEVERE` line.

## Morph not visible / player looks like themselves to others

The disguise didn't apply. Check:

- LibsDisguises is enabled without errors on the server.
- The stage's `mob-type` is a valid `EntityType` name. Ascend logs "Unknown mob-type: XYZ" at startup for invalid values.
- The evolving player sees themselves in first-person on purpose so the controls don't feel weird - other players see the morph normally.

## Evolution ceremony is in the wrong spot

The map's `evolution-viewer` and/or `evolution-mob` spawns are off. Run `/tea map edit ascend <map>` to open the draft, walk to the right positions and run `/tea map evolutionviewer` / `/tea map evolutionmob`, then `/tea map save`. `/tea map status` shows every spawn currently set on the draft.

## Ceremony fires but mob puppets don't appear

The ceremony sends per-viewer mob packets. If nothing shows up:

- The `evolution-mob` spawn is inside a wall or below the world. Re-run `/tea map edit` and reposition it.
- Another plugin is intercepting outbound entity-spawn packets. Try disabling packet-modifying plugins one at a time.

## Sneak-evolve does nothing on slabs/stairs

If sneak-progress isn't ticking up:

- You have to hold sneak for 3 seconds (2s with Quick Evolver). Damage resets the progress bar.
- You must have an evolve unlocked - a kill since your last evolve.
- The arena must be in LIVE state.

## Abilities don't trigger when right-clicking an enemy morph

If a right-click doesn't fire your stage ability:

- Your stage's `ability:` in `config.yml` is blank or points at an unregistered id.
- The arena isn't in LIVE state yet.
- An inventory menu or another plugin's interaction handler is stealing the event first.

## "Missing translation: ascend.xxx" in chat or scoreboard

A translation key your stage uses isn't present in any loaded `lang/*.yml`. Ascend merges jar defaults on enable, so this should resolve automatically. If you added custom stages to `config.yml` and the scoreboard shows `ascend.stage.<your-id>`, the stage's translation key isn't in your locale bundle - add it and `/tea reload`.

## Match ends instantly on apex arrival

Your `stage-order:` list has fewer entries than expected, so the first stage a player reaches is already the apex. Check `/tea reload` actually picked up your edits, and confirm `stage-order` lists every stage you want on the ladder, in the right order.

## Devolve-on-death keeps knocking me back to stage 0

That's the default behavior with `game.devolve-on-death: true`. Set it to `false` in `plugins/Ascend/config.yml` if you want deaths to cost only HP, not progress.

## Winner isn't crowned at match timeout

`game.max-match-seconds` has elapsed but nobody wins. Ascend picks the highest-stage player when the timer runs out; ties (equal stages) resolve to no winner and the arena resets with no celebration. If that's happening too often, lower the time cap or raise it so matches naturally conclude.
