---
sidebar_position: 4
title: Theme and translations
---

# Theme and translations

Tea plugins send all player-facing text through one shared theme. Edit the theme once and the change applies to games, scoreboards, chat messages and command responses.

## Theme

`plugins/TeaCore/theme.yml`:

```yaml
styles:
  primary: "<#5fd1ff>"
  secondary: "<gray>"
  accent: "<#ffb454>"
  success: "<green>"
  error: "<red>"
  warning: "<yellow>"
  highlight: "<bold><white>"
  muted: "<dark_gray>"

prefix: ""
```

Each style slot is a MiniMessage tag expression. Translation keys use slots as open/close tags, like `<primary>Hello</primary>`. The close tag restores the parent style.

TeaCore adds the global `prefix:` to the start of each `send(...)` call that goes through the MessageService. Leave it empty for no prefix, or put any MiniMessage expression here (for example `"<accent>[<primary>Tea</primary><accent>]</accent> "`).

## Translations

Each plugin ships its own locale bundle in `plugins/<PluginName>/lang/<locale>.yml`. On enable, each plugin adds keys from the jar that are missing from your file on disk. New translation keys work after an update, and your edits stay.

Each namespace has its own key prefix:

- `core.*`: TeaCore engine
- `lobby.*`: lobby UI inside TeaCore (signs, `/play`, lobby spawn / gamemode messages)
- Each game has its own prefix (e.g. `<gameid>.*`)

Placeholders use MiniMessage tag syntax: `<player>`, `<count>`, etc. Plugins supply placeholder values when sending the message.

If you add new content to a game's config (for example new stages, abilities, or game modes), add matching translation keys to that plugin's `lang/*.yml`. Each game's own documentation lists the key conventions it uses.

## Reload

```
/tea reload
```

Loads changes to `config.yml`, `theme.yml` and all `lang/*.yml` files without a restart.
