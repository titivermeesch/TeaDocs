---
sidebar_position: 2
title: Supporting every version (platform API)
---

# Supporting every version

TeaCore runs on 1.8.8 to 1.12.2 and 1.16.5 to the latest release. A game does too, as long as it doesn't call version-specific Bukkit API directly. Anything that differs between versions goes through `TeaCoreAPI.get().platform()`:

```java
Platform p = core.platform();

ItemStack wool = p.items().colored("red", "WOOL", 16);           // WOOL:14 on 1.8
ItemStack charge = p.items().stackOr("FIRE_CHARGE", "STONE", 8);  // FIREBALL on 1.8
item = p.tags().set(item, "mygame", "kind", "meteor");            // NBT on 1.8, PDC on 1.14+
p.sounds().play(location, "ENTITY_BLAZE_SHOOT", 1f, 1f);
p.particles().dust(location, Color.ORANGE, 1.5f, 6, 0.3);
p.worlds().explode(location, 3f, false, true, thrower);           // credited to the thrower on every version
Hologram label = p.holograms().create(location, List.of("§6Cannon"));
```

| Part | What it covers |
| ---- | -------------- |
| `items()` | Items, materials, potions and enchantments by modern name; coloured blocks; heads; custom model data |
| `tags()` | Hidden string tags on items (persist) and entities (runtime) |
| `holograms()` | Floating text: text displays, or armor stands before 1.19.4 |
| `particles()` | Particles by modern name, coloured dust |
| `sounds()` | Sounds by modern name |
| `effects()` | Potion effect types by modern name |
| `entities()` | No AI, invulnerable, silent, gravity, collision, glowing, max health, `playerBehind(damager)` |
| `projectiles()` | What a projectile hit (1.8 doesn't say; TeaCore works it out) |
| `worlds()` | Min/max height, game rules by name, void worlds, sourced explosions |
| `players()` | Locale, main hand, inventory storage, hiding players, target block |
| `scoreboards()` | Objectives, team colours, line length limits |
| `supports(Feature)` | Whether the server has something natively (text displays, off-hand, ...) |

`version()` gives the Minecraft version if you need it.

## Build your game against both APIs

Compile against the **1.8.8 API** and add a second compile against the **modern API**. Code that passes both only uses calls every version has. Fireball's `build.gradle.kts`:

```kotlin
dependencies {
    // Its old bungeecord-chat snapshot no longer resolves; exclude it.
    compileOnly("org.spigotmc:spigot-api:1.8.8-R0.1-SNAPSHOT") { exclude(group = "net.md-5") }
}
val modernCheck by tasks.registering(JavaCompile::class) {
    source = sourceSets.main.get().java
    classpath = configurations["compileClasspath"].filter { !it.name.startsWith("spigot-api-1.8.8") } +
        configurations.detachedConfiguration(dependencies.create("org.spigotmc:spigot-api:1.21.3-R0.1-SNAPSHOT"))
    destinationDirectory.set(layout.buildDirectory.dir("modern-check"))
    options.release.set(21)
}
tasks.named("check") { dependsOn(modernCheck) }
```

Things to avoid in game code (each has a platform call or a cross-version alternative):

- `Material.X` / `Sound.X` / `Particle.X` / `PotionEffectType.X` constants that only exist on some versions: use names through the platform. Constants both have (`STONE`, `CHEST`, `PAPER`) are fine.
- `NamespacedKey` and persistent data: use `tags()`.
- `getItemInMainHand`, `PlayerInteractEvent#getHand`: use `players()`.
- Events that only exist on newer versions (`PlayerSwapHandItemsEvent`, `EntityPickupItemEvent`): use `PlayerPickupItemEvent`, which exists everywhere, or skip the feature on old versions.

## How TeaCore does it

TeaCore itself has three source sets:

- `main`: shared code, compiled against the 1.8.8 API and again against the modern API (`modernCheck`).
- `modern` (`src/modern/java`): `ModernPlatform`, compiled against the modern API only.
- `legacy` (`src/legacy/java`): `LegacyPlatform`, compiled against the 1.8.8 API, with the few server internals 1.8 needs through reflection (item NBT, entity NBT, sourced explosions).

The jar contains all three and `Platforms` loads one by class name at startup, so the other is never touched. Maps go through `SchematicStore`: WorldEdit on modern servers, TeaCore's own MCEdit reader/writer on 1.8.
