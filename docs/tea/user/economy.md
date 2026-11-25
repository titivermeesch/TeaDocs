---
sidebar_position: 13
title: Economy
---

# Economy

TeaCore uses [Vault](https://www.spigotmc.org/resources/vault.34315/) for all money operations. Vault is a **hard dependency**: TeaCore refuses to load without it.

TeaCore does not store balances. The plugin that registers a Vault `Economy` service holds them (EssentialsEco, CMI, an SQL-backed economy plugin, etc.). To keep balances in MySQL, install a Vault-compatible economy plugin that stores them there.

## Requirements

- Vault (hard dep; comes with TeaCore's plugin resolution).
- A Vault-compatible economy plugin. Common choices: **EssentialsX Economy**, **CMI**, **TNE (The New Economy)**, **XConomy**. Any plugin that registers a Vault `Economy` provider works.

If Vault is installed but no economy provider is registered, TeaCore logs a warning on boot, `/tea economy` commands respond with "no economy provider," and kits with `cost > 0` can't be bought: the picker shows their cost in red with a balance of 0.

## Money commands

TeaCore has no balance / give / take / set commands of its own, because Vault-compatible economy plugins already provide them. Use the commands from your economy plugin:

- **EssentialsX Economy**: `/balance`, `/eco give|take|set <player> <amount>`, `/pay`
- **CMI**: `/money`, `/eco`
- **TNE**: `/money`, `/transaction`
- Other Vault-compatible plugins: check their own docs

That plugin also sets the permissions and message wording for these commands.

## Kit purchases

Games can attach a `cost` to their kits. A kit with `cost: 0` is free; a kit with `cost: 100` requires the player to pay 100 of the server's currency the first time they pick it.

**Unlock model: one-time purchase, permanent.** The player pays once (TeaCore withdraws the money through Vault) and TeaCore records the unlock in its `tea_kit_unlocks` table. After that, the kit is free for that player in that game, across restarts and on every server in the network.

### What players see in the kit picker

- **Free kit**: normal icon, normal name, description only.
- **Priced kit they can afford**: normal icon, normal name, description + `Cost: 100 coins` line.
- **Priced kit they already own**: normal icon, normal name, description + `Cost: 100 coins (owned)` in green.
- **Priced kit they can't afford**: icon replaced with a red barrier, description + `Cost: 100 coins (you have 30 coins)` in red. Clicking it only sends a chat message.

![A priced kit the player can't afford yet](/img/tea/kit-locked.png)

`/kit <game> <kit>` follows the same rules as a click on the kit in the picker. If the kit has a price and the player doesn't own it, TeaCore buys it first. If they can't pay, or no economy plugin is available, TeaCore doesn't select the kit.

### When a purchase fails

TeaCore counts a purchase as successful only when both the Vault withdrawal and the `tea_kit_unlocks` insert succeed. If the unlock insert fails (database error), TeaCore deposits the withdrawn amount back to the player and refuses the selection. If the Vault withdrawal fails, TeaCore records no unlock and refuses the selection.

## Where balances live

Your Vault-compatible economy plugin owns balance storage. TeaCore stores kit ownership:

| Data | Owner | Table / file |
| ---- | ----- | ------------ |
| Player balances | Your Vault economy plugin | Whatever that plugin configures, often its own SQL table or YAML file. |
| Kit unlocks | TeaCore | `tea_kit_unlocks(player_uuid, game_id, kit_id, unlocked_at)` in the TeaCore database (SQLite or MySQL per `database.type`). |

## Developer notes

From a game plugin:

```java
EconomyService economy = TeaCoreAPI.get().economy();

if (!economy.isAvailable()) {
    // No Vault provider registered; degrade gracefully.
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
    500                  // cost: one-time unlock
);
TeaCoreAPI.get().kits().registerKit(premiumKit);
```

You need no further wiring. The kit picker shows the cost and locked states, handles the Vault withdrawal, and records the unlock.
