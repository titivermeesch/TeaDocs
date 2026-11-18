---
sidebar_position: 9
title: Loot tables
---

# Loot tables

`LootService` turns a config section into a weighted loot table and fills chests from it. Your game owns the YAML, so admins edit it in your config. TeaCore parses and rolls it. Your game adds custom items through a `LootItemProvider`.

The API lives in `me.playbosswar.tea.core.api.loot`. You reach it through `core.loot()`.

## YAML format

```yaml
# plugins/MyGame/config.yml
loot:
  chests:
    min-items: 4
    max-items: 7
    items:
      - { material: STONE_SWORD, weight: 30 }
      - { material: BOW, weight: 10, enchantments: ["power:2", "DURABILITY:1"] }
      - { material: ARROW, weight: 25, amount: "4-12" }
      - { material: GOLDEN_APPLE, weight: 8, amount: "1-2" }
      - { material: SPLASH_POTION, weight: 6, potion: HEALING }
      - { material: PAPER, weight: 2, custom-name: "&6Lucky Ticket", lore: ["&7Trade at the shop"] }
      - { item: "mygame:grappling_hook", weight: 5 }
      - { mygame: smoke_bomb, weight: 5, amount: "1-3" }
      - COBBLESTONE
```

Table keys:

| Key | Default | Meaning |
| --- | --- | --- |
| `min-items` | `10` | Fewest items per roll. `min-items-per-chest` also works. |
| `max-items` | `15` | Most items per roll. `max-items-per-chest` also works. |
| `items` | | The entries. |

Entry keys:

| Key | Meaning |
| --- | --- |
| `material` | A Bukkit material name. |
| `item` | A custom item, `namespace:id`, built by a registered `LootItemProvider`. |
| `<namespace>: <id>` | Shorthand for `item: "<namespace>:<id>"`, e.g. `mygame: smoke_bomb`. |
| `weight` | Relative chance. Default `1`. Entries with `0` or less are dropped. |
| `amount` | A number or a range `"min-max"`. Default `1`. |
| `enchantments` | List of `"NAME:level"`. Level defaults to 1. |
| `potion` | A Bukkit `PotionType` for potion items, e.g. `HEALING`, `STRENGTH`. |
| `custom-name` | Display name, `&` colour codes. |
| `lore` | List of lore lines, `&` colour codes. |

A plain string entry (like `COBBLESTONE` above) is a material with weight 1.

### Enchantment names

Both naming styles work:

- Modern keys: `sharpness`, `power`, `unbreaking`, `protection`, ... (case-insensitive).
- Legacy Bukkit names from pre-1.20.5 configs:

| Legacy name | Modern key |
| --- | --- |
| `DAMAGE_ALL` | `sharpness` |
| `DAMAGE_UNDEAD` | `smite` |
| `DAMAGE_ARTHROPODS` | `bane_of_arthropods` |
| `DIG_SPEED` | `efficiency` |
| `DURABILITY` | `unbreaking` |
| `LOOT_BONUS_BLOCKS` | `fortune` |
| `LOOT_BONUS_MOBS` | `looting` |
| `PROTECTION_ENVIRONMENTAL` | `protection` |
| `PROTECTION_FIRE` | `fire_protection` |
| `PROTECTION_FALL` | `feather_falling` |
| `PROTECTION_EXPLOSIONS` | `blast_protection` |
| `PROTECTION_PROJECTILE` | `projectile_protection` |
| `OXYGEN` | `respiration` |
| `WATER_WORKER` | `aqua_affinity` |
| `ARROW_DAMAGE` | `power` |
| `ARROW_KNOCKBACK` | `punch` |
| `ARROW_FIRE` | `flame` |
| `ARROW_INFINITE` | `infinity` |
| `LUCK` | `luck_of_the_sea` |

TeaCore applies enchantments unsafely, so levels above vanilla limits work. It ignores unknown enchantment or potion names and still gives the item.

### Invalid entries

When you register the table, TeaCore skips any entry with an unknown `material`, or with no `material` and no item reference, and logs a warning in your plugin's log (`Loot table '<id>': skipping invalid entry #<n>`).

If a roll picks a custom item whose namespace has no registered provider, TeaCore skips it and logs a warning. That roll gives no item, so the chest gets one item fewer.

## Registering a table

```java
public void loadLoot() {
    ConfigurationSection section = getConfig().getConfigurationSection("loot.chests");
    if (section != null) {
        core.loot().registerTable(this, "mygame:chests", section);
    }
}
```

- The id is any string; namespace it with your game id.
- Registering the same id again replaces the table, so call this from your reload too.
- `core.loot().table("mygame:chests")` returns `Optional<LootTable>`.

## Rolling and filling

```java
LootTable table = core.loot().table("mygame:chests").orElseThrow();

// Fill a chest: clears it, then puts each rolled item in a random empty slot.
if (block.getState() instanceof Chest chest) {
    table.fill(chest.getBlockInventory());
}

// Or just get the items.
List<ItemStack> items = table.roll();
```

- `roll()` picks a count between `min-items` and `max-items`, then picks that many entries by weight. Picks are independent, so the same entry can come up twice.
- Every pick builds a fresh `ItemStack`, so amounts and ranges are rolled per item.
- `fill(inventory)` tries random empty slots; if it can't find one, it falls back to `addItem`.

A typical game refills its chests when the arena goes `LIVE` and again on a refill timer.

## Custom items: `LootItemProvider`

```java
@FunctionalInterface
public interface LootItemProvider {
    Optional<ItemStack> create(String id, int amount);
}
```

Register one per namespace, before any table rolls:

```java
core.loot().registerItemProvider("mygame", (id, amount) -> switch (id) {
    case "grappling_hook" -> Optional.of(items.grapplingHook(amount));
    case "smoke_bomb" -> Optional.of(items.smokeBomb(amount));
    default -> Optional.empty();   // unknown id: nothing is added
});
```

- TeaCore matches the namespace in lower case.
- `amount` is the rolled stack size, at least 1.
- TeaCore applies the entry's `custom-name`, `lore`, `enchantments` and `potion` on top of the item you return.

Admins can then use `item: "mygame:smoke_bomb"` or `mygame: smoke_bomb` in any loot table, including tables of other games.
