---
sidebar_position: 7
title: Changing settings
---

# Changing settings in game and on the dashboard

You don't have to open YAML files for day-to-day changes. TeaCore, every Tea game and TeaCosmetics list their settings in two places:

- **In game:** `/tea admin`, then **Settings**.
- **On the [dashboard](./dashboard.md):** the **Settings** page.

Both show the same settings, grouped by plugin and category, and both save into the plugin's own config file. Comments and layout in the file stay as they were, apart from the value you changed.

## What you can change

| Plugin | Examples |
| --- | --- |
| TeaCore | Feature switches, arenas kept ready, when empty arenas close, waiting items, lobby PvP, parties, ranked ratings, kill credit, Discord webhooks |
| Quests | How many daily and weekly quests a player gets, the reset hour, and every quest with its goal and rewards |
| Each game | Match timings, team sizes, game rules, kits with their price and gear |
| TeaCosmetics | Every cosmetic: its type, particle, colour, effect and price |

Setup values stay in the files: the network mode, Redis, the database, the dashboard itself, metrics and languages. Menus, sidebars, the theme and language files are files too. See [Menus](./menus.md), [Sidebars](./sidebars.md) and [Theme and languages](./theme-and-i18n.md).

## When a change takes effect

Each setting says when it applies:

| Label | Meaning |
| --- | --- |
| Right away | The server uses the new value at once. |
| From the next match | Matches running now finish with the old value. |
| After a restart | Saved now, used after the server restarts. |

## On a network

A change goes to every server that has the same file. Change a Fireball setting on the lobby and every server running Fireball saves it, even when the lobby doesn't run Fireball itself. When servers disagree on a value, the setting is marked **differs between servers**, and saving it makes them match again.

Every change is logged in the console of each server, with who made it. TeaCore also stores it in the database, and a server that starts later applies it before any game loads. See [Arena servers](./hosting.md#settings-in-the-database).

## In game

`/tea admin`, then **Settings**, lists each plugin. Pick one, then a category. Each setting shows its current value and when it takes effect.

| Setting type | Click | Does |
| --- | --- | --- |
| On/off | Any click | Switches it. |
| Number | Left / right | Up / down by one step. |
| Number | Shift-left | Up by ten steps. |
| Number | Shift-right | Type a value in chat. |
| Choice | Left / right | Next / previous option. |
| Item | Left | Uses the item in your hand. |
| Item | Right | Type an item name in chat. |
| Text | Any click | Type the new text in chat. |
| Lines of text | Left / right | Add a line in chat / remove the last line. |
| Kits, quests and other lists | Any click | Opens the list. |

When TeaCore asks you to type in chat, the message goes to the setting and nobody else sees it. Type `cancel` to keep the old value.

### Kits, quests and other lists

A list shows its entries, with **Add** at the end. Click an entry to edit its settings, or shift-right-click it to remove it. Entries such as quests ask for an id when you add them; use letters, digits, `-` and `_`.

Kit gear has one more button: **Copy from my inventory**. Put the items in your inventory where players should get them, including armour, then shift-click the button. The kit's gear becomes those items, in those slots, with their names.

## On the dashboard

![TeaCore settings on the dashboard](/img/dashboard-settings-teacore.png)

The Settings page shows the same plugins and categories as a form. Lists open into editors where you add, remove and reorder entries. Edits stay on the page until you click **Save**, which sends them all at once; **Discard** drops them. Webhook addresses never come back to the browser: the field only says whether one is set.

![Editing a Fireball kit and its gear](/img/dashboard-settings.png)

### One group of servers

**Apply to** at the top of the page picks where a save goes: every server, or one group, such as only arena servers. The page then shows the values of that group. A server's group comes from `network.group` in its config; empty means `lobby` on a lobby and `arena` everywhere else. A value saved for a group wins over the value for every server, also on servers that start later.

### History and undo

**History** lists recent changes: when, who, which setting, and the value before and after. **Undo** puts the old value back on the same servers. Undoing is a change too, so it shows up in the list and can itself be undone.

![The history of settings changes](/img/dashboard-settings-history.png)

## Permissions

| Permission | Default | Grants |
| --- | --- | --- |
| `tea.settings` | op | The Settings menu in `/tea admin`. Part of `tea.admin`. |
| `tea.dashboard.settings` | op | The Settings page on the dashboard. Part of `tea.dashboard.admin`. |

## Adding your own game

Games built on TeaCore can list their settings the same way. See [Editable settings](../dev/settings.md).
