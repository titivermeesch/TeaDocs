---
sidebar_position: 12
title: Quests
---

# Quests

Players get a few daily and weekly quests, such as "Win 2 matches" or "Get 10 kills". Finishing one pays its reward on the spot. `/quests` shows them with progress bars and the time until new ones.

- Every player gets 3 daily quests and 2 weekly quests from the lists in `plugins/TeaCore/quests.yml`. Each player gets a different mix, and the same one on every server.
- Daily quests change at midnight, weekly ones on Monday (server time). Set `settings.reset-hour` to move that.
- Progress counts matches finished, wins, kills and assists, in every game or one game. It counts on every server that shares the database.
- A quest pays coins through your economy plugin (Vault), runs console commands, or both. Without an economy plugin, TeaCore skips coin rewards and still runs the commands.

![The /quests menu](/img/tea/quests-menu.png)

You can add, change and remove quests in game (`/tea admin`, then **Settings**, then **Quests**) or on the dashboard's Settings page, without editing the file. See [Changing settings](./settings.md).

## quests.yml

```yaml
settings:
  daily-count: 3
  weekly-count: 2
  reset-hour: 0

daily:
  win-2:
    name: "Win 2 matches"
    goal: wins            # wins, games, kills or assists
    amount: 2
    game: any             # or a game id, e.g. fireball
    reward:
      coins: 100
      commands: ["give {player} diamond 1"]
```

Run `/tea reload` after editing. Changing the lists gives players new picks for the current day or week; progress on quests they keep stays.

The menu is `plugins/TeaCore/menus/quests.yml`. Each quest has `{name}`, `{progress}`, `{amount}`, `{bar}`, `{done}`, `{reward}`, `{period}` and `{resets_in}`.

## Settings

| Where | Key | Meaning |
| --- | --- | --- |
| `config.yml` | `features.quests` | `false` turns quests off. |
| `plugin.yml` permission | `tea.quests` | `/quests` (everyone by default). |
