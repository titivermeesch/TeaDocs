---
sidebar_position: 4
title: Map authoring
---

# Ascend map authoring

Ascend uses the same core `/tea map ...` commands as any other Tea game - see the [Tea map authoring guide](../../tea/user/adding-a-map.md) for the core workflow (create / pos1 / pos2 / addspawn / save). This page only covers the Ascend-specific additions.

## Ascend's additional required fields

On top of the core requirements (pos1, pos2, waiting spawn, at least one participant spawn, min/max), an Ascend map must have:

- **Evolution viewer spawn** - where the evolving player is teleport-locked in spectator during the ceremony.
- **Evolution mob spawn** - where the old-stage and new-stage mob puppets appear for the evolving player to watch.

`/tea map save` refuses to save an Ascend map without both evolution spawns. `/tea map status` lists them as missing so you can see what's left before saving.

## Designing a ceremony chamber

Because the ceremony spawns and despawns mob puppets per-viewer via PacketEvents (nobody else in the arena sees anything), you don't need to keep the chamber hidden from the main arena. But a few layout tips make the ceremony feel good:

- Put the **viewer** spawn in an open "balcony" or cinematic position, facing the mob spawn.
- Put the **mob** spawn a few blocks in front of the viewer, at eye level or slightly below, facing the viewer. A 4-6 block gap usually looks best.
- Size the chamber so the mob puppets fit comfortably. The largest morphs (Iron Golem, Warden) need roughly a 4-block-tall, 3-block-wide space.
- Multiple players can be evolving simultaneously. Since each one has their own packet-only mob, overlap is fine - the chamber only needs to fit one physical puppet size, even at peak concurrent evolutions.

If either evolution spawn is missing from the map, Ascend falls back to an in-place evolve with no ceremony. Old maps authored before evolution spawns were added still work - they just skip the cinematic.

## Ascend-specific commands

Use these on top of the core `/tea map` commands during a `/tea map create` or `/tea map edit` session:

```
/tea map evolutionviewer
```

Stand where the evolving player should be locked during an evolution ceremony and run this. Facing direction is captured - point toward where the mob puppet will be.

```
/tea map evolutionmob
```

Stand where the old/new mob puppets should appear (typically a few blocks in front of the viewer, at eye level) and run this. Facing direction is captured - point toward where the viewer will be.

You can re-run either command at any time during the edit session to move the spawn. The previous value is overwritten. Both commands are contributed by Ascend via TeaCore's map-extension registry; the stored values live under an `extensions:` section in the map YAML.

## Full Ascend authoring workflow

```
/tea map create ascend jungle
# build or //paste your schematic

/tea map pos1
/tea map pos2
/tea map waiting
/tea map addspawn            # repeat for each participant spawn
/tea map evolutionviewer     # Ascend-specific
/tea map evolutionmob        # Ascend-specific
/tea map min 4
/tea map max 10

/tea map status              # verify everything's set
/tea map save
```

## Moving the ceremony chamber later

```
/tea map edit ascend jungle
# walk to the new viewer position and face the mob spot
/tea map evolutionviewer
# walk to the new mob position and face the viewer
/tea map evolutionmob
/tea map save
```

## Troubleshooting

If the ceremony is in the wrong spot, lands in mid-air, or fires in place despite both spawns being configured, see the [Ascend troubleshooting page](./troubleshooting.md).
