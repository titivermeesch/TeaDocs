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
        'ascend/dev/custom-abilities',
      ],
    },
  ],
};

export default sidebars;
