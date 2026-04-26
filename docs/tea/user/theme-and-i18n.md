---
sidebar_position: 4
title: Theme and translations
---

# Theme and translations

All user-visible text in Tea plugins runs through a central theme so that one edit changes the look across every game, scoreboard, chat message, and command response.

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

Each style slot is a MiniMessage tag expression. Translation keys reference slots as proper open/close tags, like `<primary>Hello</primary>`, and the close tag pops the style back to the parent scope.

The global `prefix:` is prepended to every `send(...)` call that goes through the MessageService. Leave it empty for no prefix, or put any MiniMessage expression here (for example `"<accent>[<primary>Tea</primary><accent>]</accent> "`).

## Translations

Each plugin ships its own locale bundle in `plugins/<PluginName>/lang/<locale>.yml`. On enable, each plugin writes any jar-bundled keys that are missing from your on-disk file back into the file, so newly-released translation keys work out of the box without clobbering any of your customizations.

Keys are prefixed per namespace to avoid collisions:

- `core.*` - TeaCore engine
- `lobby.*` - lobby UI inside TeaCore (signs, `/play`, lobby spawn / gamemode messages)
- Each game owns its own prefix (e.g. `<gameid>.*`)

Placeholders use MiniMessage tag syntax: `<player>`, `<count>`, etc. Plugins supply placeholder values when sending the message.

If you add new content to a game's config (for example new stages, abilities, or game modes), add matching translation keys to that plugin's `lang/*.yml`. Each game's own documentation lists the key conventions it uses.

## Reload

```
/tea reload
```

Picks up changes to `config.yml`, `theme.yml`, and all `lang/*.yml` files in-process, no restart required.
