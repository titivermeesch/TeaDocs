import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  teaSidebar: [
    'tea/intro',
    {
      type: 'category',
      label: 'Setup',
      collapsed: false,
      items: [
        'tea/user/getting-started',
        'tea/user/installing',
        'tea/user/server-versions',
        'tea/user/configuring-network-mode',
        'tea/user/hosting',
        'tea/user/kubernetes',
        'tea/user/cloudnet',
        'tea/user/permissions',
        'tea/user/settings',
      ],
    },
    {
      type: 'category',
      label: 'Maps',
      collapsed: true,
      items: [
        'tea/user/adding-a-map',
        'tea/user/map-voting',
      ],
    },
    {
      type: 'category',
      label: 'Lobby and players',
      collapsed: true,
      items: [
        'tea/user/lobby',
        'tea/user/menus',
        'tea/user/npcs',
        'tea/user/sidebars',
        'tea/user/parties',
        'tea/user/quests',
        'tea/user/theme-and-i18n',
      ],
    },
    {
      type: 'category',
      label: 'Matches',
      collapsed: true,
      items: [
        'tea/user/features',
        'tea/user/arena-manager',
        'tea/user/spectators',
        'tea/user/ranked',
        'tea/user/kill-credit',
        'tea/user/match-history',
      ],
    },
    {
      type: 'category',
      label: 'Integrations',
      collapsed: true,
      items: [
        'tea/user/dashboard',
        'tea/user/placeholders',
        'tea/user/economy',
        'tea/user/discord',
        'tea/user/metrics',
      ],
    },
    'tea/user/troubleshooting',
    {
      type: 'category',
      label: 'Developer',
      collapsed: true,
      items: [
        'tea/dev/architecture',
        'tea/dev/extending-with-a-new-game',
        'tea/dev/settings',
        'tea/dev/platform',
        'tea/dev/writing-a-kit',
        'tea/dev/writing-an-ability',
        'tea/dev/events-reference',
        'tea/dev/persistence-guide',
        'tea/dev/sidebars-and-menus',
        'tea/dev/combat-and-kill-credit',
        'tea/dev/loot-tables',
      ],
    },
  ],
  ascendSidebar: [
    'ascend/intro',
    'ascend/user/gameplay',
    {
      type: 'category',
      label: 'Server setup',
      collapsed: false,
      items: [
        'ascend/user/installing',
        'ascend/user/configuration',
        'ascend/user/map-authoring',
        'ascend/user/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'Developer',
      collapsed: false,
      items: [
        'ascend/dev/custom-stages',
      ],
    },
  ],
  fireballSidebar: [
    'fireball/intro',
    'fireball/user/gameplay',
    {
      type: 'category',
      label: 'Server setup',
      collapsed: false,
      items: [
        'fireball/user/installing',
        'fireball/user/configuration',
        'fireball/user/map-authoring',
        'fireball/user/commands-and-placeholders',
        'fireball/user/troubleshooting',
      ],
    },
  ],
  overchargeSidebar: [
    'overcharge/intro',
    'overcharge/user/gameplay',
    {
      type: 'category',
      label: 'Server setup',
      collapsed: false,
      items: [
        'overcharge/user/installing',
        'overcharge/user/configuration',
        'overcharge/user/map-authoring',
      ],
    },
  ],
  cosmeticsSidebar: [
    'cosmetics/intro',
    {
      type: 'category',
      label: 'Server setup',
      collapsed: false,
      items: [
        'cosmetics/user/installing',
        'cosmetics/user/cosmetics',
        'cosmetics/user/configuration',
      ],
    },
  ],
};

export default sidebars;
