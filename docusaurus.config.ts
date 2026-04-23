import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Tea Minigames',
  tagline: 'A reusable Spigot minigames engine',
  favicon: 'img/favicon.ico',

  url: 'https://titivermeesch.github.io',
  baseUrl: '/TeaDocs/',

  organizationName: 'titivermeesch',
  projectName: 'TeaDocs',

  onBrokenLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/titivermeesch/TeaDocs/edit/main/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Tea Minigames',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'teaSidebar',
          position: 'left',
          label: 'Tea engine',
        },
        {
          type: 'docSidebar',
          sidebarId: 'ascendSidebar',
          position: 'left',
          label: 'Ascend',
        },
        {
          href: 'https://github.com/titivermeesch/teacore',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: 'Tea Minigames - MIT License',
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['java', 'yaml', 'kotlin', 'bash', 'toml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
