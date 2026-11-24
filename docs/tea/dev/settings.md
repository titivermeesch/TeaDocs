---
sidebar_position: 2
title: Editable settings
---

# Editable settings

Ship a settings schema in your jar and register it, and your config shows up in `/tea admin` under **Settings** and on the dashboard's Settings page. TeaCore builds the menus and the form, checks values before saving, writes them into your file (only the changed lines; comments stay), sends the change to every server with your plugin, and calls you back so you can apply it. See [Changing settings](../user/settings.md) for what staff see.

## Register

```java
@Override
public void onEnable() {
    TeaCoreAPI core = TeaCoreAPI.get();
    saveDefaultConfig();
    core.settings().register(this, "settings/config.yml", changed -> reloadSettings());
}

private void reloadSettings() {
    reloadConfig();
    // Re-read your values. Re-register kits (registerKit replaces a kit with the
    // same id) and your GameDefinition (games().register replaces it) so new
    // matches use them.
}
```

The callback runs on the main thread after the file was written, with the paths that changed. Matches already running can keep their old values; say so with `apply: next-match`.

## The schema

`src/main/resources/settings/config.yml`:

```yaml
id: mygame              # unique across the network
title: My Game
file: config.yml        # relative to your data folder
icon: DIAMOND_SWORD
apply: next-match       # default for every field: live | next-match | restart
categories:
  - id: match
    title: Match
    icon: CLOCK
    fields:
      - { path: game.max-match-seconds, type: int, min: 60, max: 3600, step: 30, title: Match length (seconds) }
      - { path: game.end-mode, type: enum, options: [RESET, SHUTDOWN], title: After a match, apply: restart }
      - { path: game.friendly-fire, type: boolean, title: Friendly fire }
  - id: kits
    title: Kits
    icon: CHEST
    fields:
      - path: kits
        type: map
        title: Kits
        new-entry: { cost: 0, icon: STONE_SWORD, gear: [] }
        fields:
          - { path: cost, type: int, min: 0, step: 50, title: Price }
          - { path: icon, type: material, title: Icon }
          - path: gear
            type: list
            from-inventory: true
            title: Gear
            fields:
              - { path: material, type: material, title: Item }
              - { path: amount, type: int, min: 1, max: 64, title: Amount }
              - { path: slot, type: int, min: 0, max: 40, title: Slot }
              - { path: name, type: text, title: Name }
```

### Field keys

| Key | Meaning |
| --- | --- |
| `path` | Dotted path in the file. Inside a `map` or `list`, relative to the entry. |
| `type` | One of the types below. |
| `title`, `help` | What staff see. Keep `help` to a sentence. |
| `min`, `max`, `step` | For numbers. `step` is what a click adds. |
| `options` | For `enum`. |
| `apply` | `live`, `next-match` or `restart`. Defaults to the file's `apply`. |
| `secret` | The dashboard never sends the value to the browser, and menus show only whether it's set. Use it for webhook addresses and tokens. |
| `icon` | Menu item for the field. |
| `new-entry` | Starting values for an entry added to a `map` or `list`. |
| `from-inventory` | On a `list` of items: adds **Copy from my inventory** in game. Items come in as `material`, `amount`, `slot` (0-35, armour 36-39) and `name` (MiniMessage). |
| `fields` | The fields of each entry of a `map` or item of a `list`. They can contain lists themselves, like kit gear. |

### Types

| Type | Value in the file |
| --- | --- |
| `boolean` | `true` / `false` |
| `int`, `number` | Whole number / decimal |
| `text` | A string |
| `enum` | One of `options` |
| `material` | A modern item name, such as `RED_WOOL`. Staff can type it or hold the item. |
| `text-list` | A list of strings |
| `map` | Entries by id, each with `fields` (kits, quests, cosmetics) |
| `list` | Items in order, each with `fields` (kit gear). A plain string item such as `- IRON_SWORD` is read as `{ material: IRON_SWORD }`. |

Keys in an entry that the schema doesn't list stay in the file untouched.

Leave out values only an admin setting up the server should touch, such as hosts and passwords. They stay in the file.
