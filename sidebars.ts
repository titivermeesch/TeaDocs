import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  teaSidebar: [
    'tea/intro',
    {
      type: 'category',
      label: 'User guide',
      collapsed: false,
      items: [
        'tea/user/getting-started',
        'tea/user/installing',
        'tea/user/configuring-network-mode',
        'tea/user/theme-and-i18n',
        'tea/user/adding-a-map',
        'tea/user/lobby',
        'tea/user/permissions',
        'tea/user/features',
        'tea/user/sidebars',
        'tea/user/menus',
        'tea/user/placeholders',
        'tea/user/kill-credit',
        'tea/user/match-history',
        'tea/user/dashboard',
        'tea/user/economy',
        'tea/user/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'Developer',
      collapsed: false,
      items: [
        'tea/dev/architecture',
        'tea/dev/extending-with-a-new-game',
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
    {
      type: 'category',
      label: 'User guide',
      collapsed: false,
      items: [
        'ascend/user/installing',
        'ascend/user/gameplay',
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
    {
      type: 'category',
      label: 'User guide',
      collapsed: false,
      items: [
        'fireball/user/installing',
        'fireball/user/gameplay',
        'fireball/user/configuration',
        'fireball/user/map-authoring',
        'fireball/user/commands-and-placeholders',
        'fireball/user/troubleshooting',
      ],
    },
  ],
};

export default sidebars;
