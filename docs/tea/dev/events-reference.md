---
sidebar_position: 5
title: Events reference
---

# Events reference

All TeaCore events extend `org.bukkit.event.Event` and are handled via standard `@EventHandler` listeners. They live under `me.playbosswar.tea.core.api.arena`.

## Arena lifecycle

### `ArenaStateChangeEvent`

Fired on every state transition. Handlers should guard on `event.arena().gameId()` to limit to games they own.

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

Fired when a player is added to or removed from an arena, including when they transfer between arenas or disconnect. `ArenaPlayerLeaveEvent.LeaveReason` is `DISCONNECT | COMMAND | KICK | MATCH_ENDED`.

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

Fired via `ArenaManager#endMatch(ArenaId, UUID)` when a game wants to declare a winner and transition to ENDING. Games call this rather than directly mutating arena state:

```java
core.arenas().endMatch(arena.id(), winner.getUniqueId());
```

The winner UUID is optional (pass `null` for draws). The lifecycle ticker then handles the ENDING -> RESETTING/SHUTDOWN transition based on `GameDefinition.endMode`.

```java
public final class MatchEndEvent extends Event {
    public Arena arena();
    public Optional<UUID> winner();
}
```

### `MatchTimedOutEvent`

Fires once when an arena's LIVE phase reaches `LifecycleConfig.maxMatchSeconds`. The owning game is expected to listen, pick a winner (or draw), and call `ArenaManager#endMatch`. If nothing handles the event, the arena stays in LIVE.

```java
public final class MatchTimedOutEvent extends Event {
    public Arena arena();
}
```

For example, a handler might pick the player with the highest score and declare them winner, or call `endMatch(id, null)` on a tie.

## Standard Bukkit events

You also work with the usual Bukkit events - `PlayerDeathEvent`, `EntityDamageEvent`, `PlayerInteractEvent`, etc. Guard on arena membership using `core.arenas().arenaOf(uuid)` to avoid reacting outside a match context:

```java
Arena arena = core.arenas().arenaOf(player.getUniqueId()).orElse(null);
if (arena == null || !arena.gameId().equals(MY_GAME)) return;
if (arena.state() != ArenaState.LIVE) return;
```

## Chat

`AsyncPlayerChatEvent` is filtered by TeaCore's `ChatRouter` based on each sender's active channel. Game plugins should not add their own broad `AsyncPlayerChatEvent` handler that broadcasts to all online players - use `MatchBroadcaster` instead:

```java
core.matchBroadcaster().toMatch(arena, "mygame.announce",
        Map.of("player", player.getName()));

core.matchBroadcaster().actionBarToMatch(arena, "mygame.kill.feed",
        Map.of("killer", killer.getName(), "victim", victim.getName()));

core.matchBroadcaster().toTeam(team, "mygame.team.rally");
core.matchBroadcaster().toSpectators(arena, "mygame.spectator.hint");
```

`MatchBroadcaster` always respects arena boundaries. The channels it exposes (`toMatch`, `toTeam`, `toSpectators`, `actionBarToMatch`) all accept an optional placeholder map for MiniMessage substitution via `MessageService`.
