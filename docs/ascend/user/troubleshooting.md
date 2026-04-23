---
sidebar_position: 5
title: Troubleshooting
---

# Ascend troubleshooting

This page covers issues specific to Ascend. For engine-level problems (network mode, DB, Redis, map paste, chat routing) see the [Tea troubleshooting page](../../tea/user/troubleshooting.md).

## Ascend fails to enable with "Unknown dependency LibsDisguises"

LibsDisguises is a hard dependency of Ascend (declared in `plugin.yml`). Install `LibsDisguises.jar` (and `ProtocolLib.jar`) into `plugins/` on every server that runs Ascend and restart. PacketEvents ships bundled inside LibsDisguises, so you don't need to install it separately.

## `/play ascend` fails with "Unknown game ascend"

Ascend isn't registered on the target server. See the Tea-level version of this error in the [Tea troubleshooting page](../../tea/user/troubleshooting.md#play-game-fails-with-unknown-game-name). The Ascend-specific causes are:

- `Ascend.jar` not installed on the arena server.
- Ascend disabled itself during startup (scroll up for a `SEVERE` Ascend error - most commonly a missing LibsDisguises).

## Morph not visible / player looks like themselves to others

LibsDisguises didn't apply the disguise. Check:

- LibsDisguises is enabled without errors on the server.
- The stage's `mob-type` is a valid `EntityType` name. Ascend logs "Unknown mob-type: XYZ" at startup for invalid values.
- `viewSelfDisguise` is intentionally off, so the evolving player sees themselves in first-person - this is not a bug. Only other players see the morph.

## Evolution ceremony is in the wrong spot (or fires in place)

The map is missing its `evolution-viewer` and/or `evolution-mob` extension spawns. Run `/tea map edit ascend <map>` to open the draft, walk to the two positions and run `/tea map evolutionviewer` / `/tea map evolutionmob`, then `/tea map save`. `/tea map status` lists every extension currently set on the draft.

When either spawn is absent, Ascend falls back to an in-place evolve, so old maps still work - they just skip the ceremony.

## Ceremony fires but mob puppets don't appear

The ceremony uses PacketEvents (bundled with LibsDisguises) to send per-viewer mob-spawn packets. If nothing shows up:

- LibsDisguises isn't loaded (PacketEvents comes with it) - same fix as the "unknown dependency" error above.
- Another plugin is intercepting or cancelling outbound entity-spawn packets. Try disabling packet-modifying plugins one at a time.
- The `evolution-mob` extra spawn is inside a wall or below the world. Re-run `/tea map edit` and reposition it.

## Sneak-evolve does nothing on slabs/stairs

The controller relaxes Bukkit's `isOnGround()` check to include "solid block 0.1 below" because vanilla sometimes misreports on partial blocks. If you're still not evolving:

- You actually have to hold sneak for 3 seconds (2s with Quick Evolver). Any damage resets progress.
- You must have an earned evolve unlocked - a kill since your last evolve.
- The arena has to be in LIVE state.

## Abilities don't trigger when right-clicking an enemy morph

Ascend listens for both `PlayerInteractEvent` (air/block right-clicks) and `PlayerInteractEntityEvent` (right-click directly on another entity). If right-clicking an opponent's morph doesn't fire your stage ability:

- Your stage's `ability:` in `config.yml` is blank or points at an unregistered id.
- The arena isn't in LIVE state yet.
- An inventory menu or interaction is stealing the event first. Check for interfering plugins.

## Stage ability does nothing but the cooldown doesn't start

The ability is resolving correctly but bailing out silently - likely it's reading tuning values from `plugins/Ascend/config.yml` that are `0` or missing. Only `flamethrower` and `sulphur_bomb` are config-driven today; the rest use hardcoded defaults. See [Configuration](./configuration.md) for the expected keys and re-add any missing ones.

## "Missing translation: ascend.xxx" in chat or scoreboard

A new translation key was added in an Ascend update but your on-disk `lang/*.yml` was missing it. Ascend merges jar defaults on enable, so this should resolve automatically; if it doesn't, delete `plugins/Ascend/lang/*.yml` and restart - they'll be re-extracted with all current keys.

If you added custom stages to `config.yml` and the scoreboard shows `ascend.stage.<your-id>`, the stage's translation key isn't in your `lang/*.yml`. Add it to every locale bundle and `/tea reload`.

## Match ends instantly on apex arrival

Your `stages:` list has fewer enabled stages than expected, so the first one you reach is already the apex. Check `/tea reload` actually picked up your edits, and confirm the stages you want enabled have `enabled: true` in config order.

## Devolve-on-death keeps knocking me back to stage 0

That's the default behavior with `game.devolve-on-death: true`. Set it to `false` in `plugins/Ascend/config.yml` if you want deaths to cost only HP, not progress.

## Winner isn't crowned at match timeout

`game.max-match-seconds` has elapsed but nobody wins. Ascend's `MatchTimedOutEvent` handler picks the highest-stage player; ties (equal stages) resolve to no winner and the arena resets with no celebration. If that's happening too often, lower the time cap or raise it so matches naturally conclude.
