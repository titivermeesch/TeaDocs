---
sidebar_position: 9
title: Economy
---

# Economy

TeaCore integrates with [Vault](https://www.spigotmc.org/resources/vault.34315/) for all money operations. Vault is a **hard dependency** — TeaCore will refuse to load without it.

TeaCore does not store balances itself. Whichever plugin has registered a Vault `Economy` service is the source of truth (EssentialsEco, CMI, an SQL-backed economy plugin, etc.). If you want your balances persisted in MySQL, install a Vault-compatible economy plugin that does so.

## Requirements

- Vault (hard dep; comes with TeaCore's plugin resolution).
- A Vault-compatible economy plugin. Common choices: **EssentialsX Economy**, **CMI**, **TNE (The New Economy)**, **XConomy**. Any plugin that registers a Vault `Economy` provider will work.

If Vault is installed but no economy provider is registered, TeaCore logs a warning on boot, `/tea economy` commands respond with "no economy provider," and kits with `cost > 0` show up in the picker as **[LOCKED]**.

## Money commands

TeaCore intentionally does **not** ship its own balance / give / take / set commands — every Vault-compatible economy plugin already provides them and we'd just be duplicating its surface. Use whatever your installed economy plugin gives you:

- **EssentialsX Economy** → `/balance`, `/eco give|take|set <player> <amount>`, `/pay`
- **CMI** → `/money`, `/eco`
- **TNE** → `/money`, `/transaction`
- Other Vault-compatible plugins → check their own docs

Permissions and message wording also come from that plugin, not TeaCore.

## Kit purchases

Games can attach a `cost` to their kits. A kit with `cost: 0` is free; a kit with `cost: 100` requires the player to pay 100 of the server's currency the first time they pick it.

**Unlock model: one-time purchase, permanent.** The player pays once (money withdrawn through Vault) and TeaCore records the unlock in its own database table `tea_kit_unlocks`. From that point on, the kit is free for that player on that game, across restarts and across every server in the fleet.

### What players see in the kit picker

- **Free kit** — normal icon, normal name, description only.
- **Priced kit they can afford** — normal icon, normal name, description + `Cost: 100 coins` line.
- **Priced kit they already own** — normal icon, normal name, description + `Cost: 100 coins (owned)` in green.
- **Priced kit they can't afford** — icon replaced with a red barrier, name prefixed `[LOCKED]`, description + `Cost: 100 coins (you have 30 coins)` in red. Clicking does nothing beyond a chat message.

### When a purchase fails

A purchase is only considered successful when both the Vault withdrawal and the `tea_kit_unlocks` insert succeed. If the unlock insert fails (database error), TeaCore deposits the withdrawn amount back to the player and refuses the selection. If the Vault withdrawal fails, no unlock is recorded and the selection is refused.

## Where balances live

Your Vault-compatible economy plugin owns balance storage. TeaCore only stores kit ownership. Concretely:

| Data | Owner | Table / file |
| ---- | ----- | ------------ |
| Player balances | Your Vault economy plugin | Whatever that plugin configures — usually its own SQL table or YAML file. |
| Kit unlocks | TeaCore | `tea_kit_unlocks(player_uuid, game_id, kit_id, unlocked_at)` in the TeaCore database (SQLite or MySQL per `database.type`). |

## Developer notes

From a game plugin:

```java
EconomyService economy = TeaCoreAPI.get().economy();

if (!economy.isAvailable()) {
    // No Vault provider registered — degrade gracefully.
    return;
}

if (economy.has(playerUuid, 100)) {
    economy.withdraw(playerUuid, 100);
}
```

To register a priced kit:

```java
Kit premiumKit = new Kit(
    gameId,
    "pro",
    "game.kit.pro.name",
    "game.kit.pro.desc",
    Material.DIAMOND_SWORD,
    List.of(),           // ability bindings
    Map.of(),            // starter items
    500                  // cost — one-time unlock
);
TeaCoreAPI.get().kits().registerKit(premiumKit);
```

No further wiring is needed: the kit picker automatically renders the cost and disabled states, handles the Vault withdrawal, and records the unlock.
