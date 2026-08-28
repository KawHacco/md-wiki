import { defineConfig } from 'vitepress'
import { generateSidebar, generateNav } from './scripts/generateSidebar'

export default defineConfig({
  title: 'Wiki',
  description: 'A Markdown-based Wiki',
  base: '/md-wiki/',
  lastUpdated: true,
  ignoreDeadLinks: true,

  themeConfig: {
    logo: '/logo.svg',
    nav: [
      ...generateNav(),
      {
        text: 'Tags',
        link: '/tags/',
        activeMatch: '/tags/'
      }
    ],
    sidebar: generateSidebar(),
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '検索',
            buttonAriaLabel: '検索'
          },
          modal: {
            noResultsText: '検索結果なし',
            resetButtonTitle: 'リセット',
            footer: {
              selectText: '選択',
              navigateText: 'ナビゲーション',
              closeText: '閉じる'
            }
          }
        }
      }
    },
    editLink: {
      pattern: 'https://github.com/namiyama814/md-wiki/edit/main/docs/:path',
      text: 'このページを編集する'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/namiyama814/md-wiki' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026'
    }
  },

  markdown: {
    lineNumbers: true
  }
})
