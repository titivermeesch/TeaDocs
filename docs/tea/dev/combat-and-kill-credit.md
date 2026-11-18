---
sidebar_position: 8
title: Combat and kill credit
---

# Combat and kill credit

TeaCore tracks who hit whom in live arenas and decides kill credit (killer + assists) for every death. TeaCore counts core stats (kills, deaths, assists) and the sidebar's per-match values from that. Your game plugin reports only the hits and deaths the server can't see.

The API lives in `me.playbosswar.tea.core.api.combat`. You reach it through `core.combat()`.

For the admin-facing rules (windows, examples), see [Kill credit and assists](../user/kill-credit.md).

## What TeaCore does on its own

- **Hits.** TeaCore records every `EntityDamageByEntityEvent` on a participant of a `LIVE` arena (at `MONITOR`, ignoring cancelled events). The attacker is the damager if it's a player, or the player behind a `Projectile`, `TNTPrimed` or `AreaEffectCloud`. TeaCore ignores self-hits, teammates and players outside the arena.
- **Real deaths.** TeaCore reports a `PlayerDeathEvent` for a participant of a `LIVE` arena itself.
- **Cleanup.** TeaCore clears a player's hit history when they die, leave the arena, or the arena goes to `ENDING`, `RESETTING` or `RELEASED`.

If your game uses real deaths and normal damage, you don't need to call anything.

## `CombatTracker`

```java
public interface CombatTracker {
    void recordHit(Arena arena, UUID victim, UUID attacker);
    KillCredit reportKill(Arena arena, Player victim, EntityDamageEvent.DamageCause cause); // cause nullable
    KillCredit reportKill(Arena arena, Player victim, EntityDamageEvent finalBlow);
    Optional<UUID> lastAttacker(UUID victim);
    MatchStats matchStats(ArenaId arena, UUID player);
    void clear(UUID victim);
}
```

| Method | Use it for |
| --- | --- |
| `recordHit(arena, victim, attacker)` | Damage the server can't attribute: poison, fire from an ability, a pull into lava, custom damage. Ignored unless the arena is `LIVE`, both players are participants, they are on different teams, and it isn't a self-hit. |
| `reportKill(arena, victim, cause)` | A death you handle yourself. Resolves credit, fires `ArenaKillEvent`, clears the victim's history. Call once per death. `cause` may be `null`. |
| `reportKill(arena, victim, finalBlow)` | A death where you **cancelled** the lethal damage event. Records the attacker behind `finalBlow` first, then behaves like the method above. |
| `lastAttacker(victim)` | The most recent enemy hit within the kill-credit window, e.g. for a "last hit by" message. |
| `matchStats(arenaId, player)` | The player's kills, deaths and assists in the current match. |
| `clear(victim)` | Drop a player's hit history, e.g. after a respawn where old hits should no longer count. |

`reportKill` does not check the arena state. Only call it for deaths that should count.

### Credit resolution

When a death is reported, TeaCore sorts the victim's recent hits newest first:

- The newest hit within `combat.kill-credit-window-ms` (default 6000) is the **killer**.
- Every other hit within `combat.assist-window-ms` (default 8000) is an **assist**.

If the newest hit is older than the kill window, there is no killer, but it can still be an assist. Each attacker appears at most once (only their latest hit counts). TeaCore reads the windows from config on every use, so `/tea reload` applies them.

## Games that cancel lethal damage

Many minigames cancel the lethal hit and respawn the player in place, so the player never dies. The automatic tracker ignores cancelled events and would lose the final blow. Pass the event to `reportKill`:

```java
@EventHandler(priority = EventPriority.HIGH, ignoreCancelled = true)
public void onLethalDamage(EntityDamageEvent event) {
    if (!(event.getEntity() instanceof Player victim)) return;
    Arena arena = core.arenas().arenaOf(victim.getUniqueId()).orElse(null);
    if (arena == null || !arena.gameId().equals(MY_GAME)) return;
    if (arena.state() != ArenaState.LIVE) return;
    if (victim.getHealth() - event.getFinalDamage() > 0) return;   // not lethal

    event.setCancelled(true);
    KillCredit credit = core.combat().reportKill(arena, victim, event);
    respawnInPlace(victim);
    // credit.killerId(), credit.assists() if you need them right here
}
```

`reportKill(arena, victim, finalBlow)` looks at `finalBlow`. If it's an `EntityDamageByEntityEvent`, TeaCore records the player behind the damager (player, projectile shooter, TNT source or effect-cloud source) as the latest hit, then resolves credit. It takes the damage cause from the event.

TeaCore records the non-lethal hits before that, as long as you don't cancel them.

**No double counting.** If a real `PlayerDeathEvent` follows within 1.5 seconds of a death you reported for the same player, TeaCore ignores it. If you report a death and then let the player die anyway, it counts once.

## Custom damage

When your ability deals damage with `victim.damage(amount)` (no source), or sets up damage that lands later, record the hit yourself:

```java
public void castPoison(Arena arena, Player caster, Player target) {
    target.addPotionEffect(new PotionEffect(PotionEffectType.POISON, 100, 1));
    core.combat().recordHit(arena, target.getUniqueId(), caster.getUniqueId());
}
```

For damage over time, call `recordHit` again on each tick that should refresh the credit.

## `ArenaKillEvent`

TeaCore fires it once per death, after it resolves credit, for real deaths and for deaths reported with `reportKill`. You can't cancel it: the death has already happened.

```java
public final class ArenaKillEvent extends Event {
    public Arena arena();
    public KillCredit credit();
}

public record KillCredit(
        UUID victim,
        @Nullable UUID killer,          // null for an uncredited death
        List<UUID> assists,             // most recent first, never contains the killer, never null
        @Nullable EntityDamageEvent.DamageCause cause) {
    public Optional<UUID> killerId();
}
```

Use it for kill feeds, rewards and your own stats instead of `PlayerDeathEvent#getKiller()`. It also sees faked deaths, projectile and TNT kills, and assists:

```java
@EventHandler
public void onKill(ArenaKillEvent event) {
    if (!event.arena().gameId().equals(MY_GAME)) return;
    KillCredit credit = event.credit();
    String victim = Bukkit.getOfflinePlayer(credit.victim()).getName();

    credit.killerId().ifPresentOrElse(killerId -> {
        String killer = Bukkit.getOfflinePlayer(killerId).getName();
        core.matchBroadcaster().toMatch(event.arena(), "mygame.kill",
                Map.of("killer", killer, "victim", victim));
        rewards.give(killerId, 10);
    }, () -> core.matchBroadcaster().toMatch(event.arena(), "mygame.died",
            Map.of("victim", victim)));

    for (UUID assister : credit.assists()) {
        rewards.give(assister, 3);
    }
}
```

Don't increment TeaCore's core kills/deaths/assists yourself. TeaCore counts them from this event.

## `MatchStats`

```java
public record MatchStats(int kills, int deaths, int assists) {
    public static final MatchStats ZERO = ...;
}

MatchStats stats = core.combat().matchStats(arena.id(), player.getUniqueId());
```

TeaCore counts these from `ArenaKillEvent` for the current match. You can still read them while the arena is `ENDING`, for end-of-match summaries. TeaCore drops them when the arena goes to `RESETTING` or `RELEASED`, or a new match reaches `STARTING`. Unknown players return `MatchStats.ZERO`.

The built-in sidebar tags `<kills>`, `<deaths>`, `<assists>` and the `@players:` columns read these values, as do `%tea_match_kills%` and the other match placeholders.

## Wins and team results

Core wins and losses come from `MatchEndEvent`. For team games, end the match with `endMatchForTeam` so every member of the winning team gets the win:

```java
core.arenas().endMatchForTeam(arena.id(), winningTeam.id());   // team result
core.arenas().endMatch(arena.id(), winner.getUniqueId());       // solo result
core.arenas().endMatch(arena.id(), null);                       // draw
```

See [Events reference](./events-reference.md#matchendevent).
