// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'C0rr3ct',
  tagline: 'C0rr3ct\'s blog',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://C0rr3c7.github.io/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'C0rr3c7', // Usually your GitHub org/user name.
  projectName: 'C0rr3c7.github.io', // Usually your repo name.
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/C0rr3c7/C0rr3c7.github.io/tree/master',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/C0rr3c7/C0rr3c7.github.io/tree/master',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'C0rr3rt',
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'HackMyVmSidebar',
            position: 'left',
            label: 'HackMyVm',
          },
          {
            type: 'docSidebar',
            sidebarId: 'VulnHubSidebar',
            position: 'left',
            label: 'VulnHub',
          },
          {
            type: 'docSidebar',
            sidebarId: 'HackTheBoxSidebar',
            position: 'left',
            label: 'HackTheBox',
          },
          {
            type: 'docSidebar',
            sidebarId: 'VulnStackSidebar',
            position: 'left',
            label: 'VulnStack',
          },
          {
            type: 'docSidebar',
            sidebarId: 'PortSwiggerSidebar',
            position: 'left',
            label: 'PortSwigger',
          },
          {
            type: 'docSidebar',
            sidebarId: 'YingJiSidebar',
            position: 'left',
            label: '应急响应',
          },
          {
            type: 'docSidebar',
            sidebarId: 'CTFSidebar',
            position: 'left',
            label: 'CTF',
          },
          { to: '/about', label: '关于', position: 'right' },
          { to: '/blog', label: 'Blog', position: 'right' },
          // {
          //   href: 'https://github.com/',
          //   label: 'GitHub',
          //   position: 'right',
          // },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} My Blog, Inc. Built with Docusaurus.`,
      },
      prism: {
        additionalLanguages: ['powershell', 'php', 'ini', 'json', 'java', 'csharp'],
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      docs: {
        sidebar: {
          autoCollapseCategories: true,
        },
      },
    }),
  themes: [
    [
      "@easyops-cn/docusaurus-search-local",
      ({
        hashed: true,
        language: ["en", "zh"],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      })
    ]
  ],
};

export default config;
