import { defineConfig } from 'vitepress'
import { generateSidebar, generateNav } from './scripts/generateSidebar'

export default defineConfig({
  lang: 'ja-JP',
  title: 'N高大百科',
  description: 'A Markdown-based Wiki',
  base: '/md-wiki/',
  lastUpdated: true,
  ignoreDeadLinks: true,
  cleanUrls: true,

  themeConfig: {
    logo: '/logo.svg',
    nav: [
      ...generateNav(),
      {
        text: 'タグ',
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
    },
    outlineTitle: '目次',
    lastUpdatedText: '最終更新日',
    docFooter: {
      prev: '前のページ',
      next: '次のページ'
    },
    darkModeSwitchLabel: 'テーマ',
    lightModeSwitchTitle: 'ライトモードに切り替え',
    darkModeSwitchTitle: 'ダークモードに切り替え',
    sidebarMenuLabel: 'メニュー',
    returnToTopLabel: 'トップに戻る',
    langMenuLabel: '言語を変更'
  },

  markdown: {
    lineNumbers: true
  }
})
