---
sidebar_position: 5
title: Events reference
---

# Events reference

All TeaCore events extend `org.bukkit.event.Event`. You handle them with standard `@EventHandler` listeners. Arena events live under `me.playbosswar.tea.core.api.arena`; `ArenaKillEvent` lives under `me.playbosswar.tea.core.api.combat`.

## Arena lifecycle

### `ArenaStateChangeEvent`

TeaCore fires it on each state transition. Check `event.arena().gameId()` in your handler so it only reacts to your own game.

```java
public final class ArenaStateChangeEvent extends Event {
    public Arena arena();
    public ArenaState from();
    public ArenaState to();
}
```

Example:

```java
@EventHandler
public void onState(ArenaStateChangeEvent event) {
    if (!event.arena().gameId().equals(MY_GAME)) return;
    switch (event.to()) {
        case STARTING -> initialize(event.arena());
        case LIVE -> startGameplay(event.arena());
        case ENDING -> recordResults(event.arena());
        case RESETTING -> cleanup(event.arena());
        default -> {}
    }
}
```

### `ArenaPlayerJoinEvent` / `ArenaPlayerLeaveEvent`

TeaCore fires these when a player joins or leaves an arena, including transfers between arenas and disconnects. `ArenaPlayerLeaveEvent.LeaveReason` is `DISCONNECT | COMMAND | KICK | MATCH_ENDED`.

```java
public final class ArenaPlayerJoinEvent extends Event {
    public Arena arena();
    public Player player();
    public boolean spectator();
}

public final class ArenaPlayerLeaveEvent extends Event {
    public Arena arena();
    public Player player();
    public LeaveReason reason();
}
```

### `MatchEndEvent`

TeaCore fires it when a game declares the result and the arena enters ENDING. It fires before TeaCore evacuates participants, so your listener can still read final state, record stats or broadcast results. You can't cancel it. Games call one of these instead of mutating arena state:

```java
core.arenas().endMatch(arena.id(), winner.getUniqueId());   // solo winner
core.arenas().endMatch(arena.id(), null);                    // draw / no winner
core.arenas().endMatchForTeam(arena.id(), team.id());        // team result
```

The lifecycle ticker then handles the ENDING -> RESETTING/SHUTDOWN transition based on `GameDefinition.endMode`.

```java
public final class MatchEndEvent extends Event {
    public Arena arena();
    public Optional<UUID> winner();
    public Optional<TeamId> winningTeam();
}
```

- `winner()`: the winning player for `endMatch`. For `endMatchForTeam` it is a representative member of the winning team (a team member still in the arena), or empty if none is left.
- `winningTeam()`: the winning team when the game ended the match with `endMatchForTeam`. Empty for solo results, draws, and no winner.

TeaCore counts core stats from this event. With `winningTeam()` set, **every** member of that team still in the arena gets a win and everyone else a loss. Without it, only `winner()` wins. A draw (no `winner()` and no `winningTeam()`) counts as a game played for every participant, with no win or loss. Team games should use `endMatchForTeam`. With `endMatch`, only the player you pass gets the win.

In your handler, check `winningTeam()` first:

```java
@EventHandler
public void onEnd(MatchEndEvent event) {
    if (!event.arena().gameId().equals(MY_GAME)) return;
    event.winningTeam().ifPresentOrElse(
            team -> announceTeamWin(event.arena(), team),
            () -> event.winner().ifPresentOrElse(
                    uuid -> announceWinner(event.arena(), uuid),
                    () -> announceDraw(event.arena())));
}
```

### `MatchTimedOutEvent`

TeaCore fires it once when an arena's LIVE phase reaches `LifecycleConfig.maxMatchSeconds`. The owning game listens, picks a winner (or a draw), and calls `ArenaManager#endMatch`. If nothing handles the event, the arena stays in LIVE.

```java
public final class MatchTimedOutEvent extends Event {
    public Arena arena();
}
```

For example, a handler might pick the player with the highest score and declare them winner, or call `endMatch(id, null)` on a tie.

## Combat

### `ArenaKillEvent`

TeaCore fires it once per death of a participant in a live arena, after it resolves the killer and assists. It fires for real deaths (`PlayerDeathEvent`) and for deaths a game reports with `CombatTracker#reportKill` (games that cancel lethal damage). You can't cancel it; the death has already happened.

```java
public final class ArenaKillEvent extends Event {
    public Arena arena();
    public KillCredit credit();
}

public record KillCredit(UUID victim, @Nullable UUID killer, List<UUID> assists,
                         @Nullable EntityDamageEvent.DamageCause cause) {
    public Optional<UUID> killerId();
}
```

`killer` is `null` for an uncredited (environmental) death. `assists` is most-recent-first, never contains the killer, and is never `null`.

```java
@EventHandler
public void onKill(ArenaKillEvent event) {
    if (!event.arena().gameId().equals(MY_GAME)) return;
    event.credit().killerId().ifPresent(killer -> rewardKill(killer));
    event.credit().assists().forEach(this::rewardAssist);
}
```

Prefer this over `PlayerDeathEvent#getKiller()` for kill feeds and rewards: it includes projectile/TNT kills, faked deaths and assists. TeaCore counts core kills, deaths and assists from it. See [Combat and kill credit](./combat-and-kill-credit.md).

## Standard Bukkit events

You also handle the usual Bukkit events, such as `PlayerDeathEvent`, `EntityDamageEvent` and `PlayerInteractEvent`. Check arena membership with `core.arenas().arenaOf(uuid)` so your handler ignores players outside a match:

```java
Arena arena = core.arenas().arenaOf(player.getUniqueId()).orElse(null);
if (arena == null || !arena.gameId().equals(MY_GAME)) return;
if (arena.state() != ArenaState.LIVE) return;
```

## Chat

TeaCore's `ChatRouter` filters `AsyncPlayerChatEvent` by each sender's active channel. Don't add your own `AsyncPlayerChatEvent` handler that broadcasts to all online players. Use `MatchBroadcaster`:

```java
core.matchBroadcaster().toMatch(arena, "mygame.announce",
        Map.of("player", player.getName()));

core.matchBroadcaster().actionBarToMatch(arena, "mygame.kill.feed",
        Map.of("killer", killer.getName(), "victim", victim.getName()));

core.matchBroadcaster().toTeam(team, "mygame.team.rally");
core.matchBroadcaster().toSpectators(arena, "mygame.spectator.hint");
```

`MatchBroadcaster` stays inside arena boundaries. Its methods (`toMatch`, `toTeam`, `toSpectators`, `actionBarToMatch`) all accept an optional placeholder map for MiniMessage substitution via `MessageService`.
