---
sidebar_position: 6
title: Persistence guide
---

# Persistence guide

TeaCore owns a shared `javax.sql.DataSource` (HikariCP pool over SQLite or MySQL depending on `config.yml`). Your game plugin gets it from `core.database().dataSource()` and runs plain JDBC against it.

## The DatabaseService interface

```java
public interface DatabaseService {
    DataSource dataSource();
    void registerMigrations(Plugin plugin, String namespace, List<String> migrationFilenames);
}
```

`dataSource()` returns the shared pool. `registerMigrations` reads the migrations bundled in your plugin jar, applies any new ones, and records successful versions in `tea_schema_versions(plugin_name, version)`.

## Registering migrations

```java
core.database().registerMigrations(this, "mygame", List.of(
        "V001__init.sql",
        "V002__add_leaderboard.sql"
));
```

Each file lives at `resources/db/migrations/mygame/<name>.sql` in your plugin jar. Filenames **must** match `V<int>__<description>.sql`. The runner parses the version number, applies files in ascending order, records successful migrations, and skips versions it already applied.

## Conventions

- Prefix every table with your plugin's namespace (`mygame_stats`, not `stats`). That way your tables don't clash with another plugin's in the shared DB.
- Use `VARCHAR(36)` UUID strings rather than BIGINT foreign keys. They work on both SQLite and MySQL and match the rest of Tea.
- Reference `tea_player_profile(uuid)` if you want a formal FK; SQLite doesn't enforce it by default but MySQL does.
- If you want your plugin to work on SQLite installs too, keep MySQL-specific features (stored procedures, JSON operators) out of migrations and use plain DDL/DML.

## Example migration

`V001__init.sql`:

```sql
CREATE TABLE IF NOT EXISTS mygame_stats (
  uuid         VARCHAR(36) NOT NULL PRIMARY KEY,
  kills        INT NOT NULL DEFAULT 0,
  deaths       INT NOT NULL DEFAULT 0,
  games_played INT NOT NULL DEFAULT 0,
  games_won    INT NOT NULL DEFAULT 0,
  FOREIGN KEY (uuid) REFERENCES tea_player_profile(uuid) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mygame_stats_kills ON mygame_stats (kills DESC);
```

## Reading stats

```java
String sql = "SELECT kills, deaths FROM mygame_stats WHERE uuid = ?";
try (Connection c = core.database().dataSource().getConnection();
     PreparedStatement ps = c.prepareStatement(sql)) {
    ps.setString(1, uuid.toString());
    try (ResultSet rs = ps.executeQuery()) {
        if (rs.next()) {
            int kills = rs.getInt("kills");
            int deaths = rs.getInt("deaths");
            // ...
        }
    }
}
```

## Player profile

TeaCore inserts a row in `tea_player_profile` for each first-seen UUID on `PlayerJoinEvent`, so you don't need to. Read it with `core.playerProfiles().getOrCreate(uuid)`.

The shared profile holds only `uuid`, `first_seen`, `last_seen`, `locale` and `metadata_json`. Per-game stats live in per-game tables, so adding or removing a game needs no schema changes elsewhere.

## Exposing stats to `/tea stats`

TeaCore's `/tea stats [player]` command aggregates results from every registered `StatsProvider`. Register yours on enable, and the command calls your code each time someone looks up a player:

```java
core.stats().register(new StatsProvider() {
    @Override public GameId gameId() { return MY_GAME; }

    @Override public Map<String, String> fetch(UUID uuid) {
        Map<String, String> out = StatsProvider.newEntries();  // LinkedHashMap, preserves order
        // read from your per-game tables...
        out.put("Kills", String.valueOf(kills));
        out.put("Wins", String.valueOf(wins));
        return out;
    }
});
```

Return an empty map when you have no rows for the player. The command then skips your section.

## Connection pool notes

The server provides `sqlite-jdbc`. TeaCore downloads `mysql-connector-j` at startup when `database.type` is `mysql` and keeps it unrelocated, so its `META-INF/services` entries keep working. Don't shade either driver into a game plugin: use the `DataSource` TeaCore gives you.
