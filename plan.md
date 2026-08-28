# VitePress + GitHub Pages Wiki 構築プラン

## Context

Markdown記事をGitHubで管理し、GitHub Pagesで公開する社内/個人Wikiを作りたい。編集はブランチを切ってPRを出す運用を想定しているが、非エンジニアにはこの操作が難しいため、各記事の下部に「記事を編集」ボタンを置き、クリックするとGitHub.comの編集画面（フォーク＋ブランチ作成＋PR作成が自動化されたUI）に直接飛べるようにしたい。

制約:
- GitHub Pagesでの公開のみ（サーバーサイド実装・DB不可、完全に静的サイトとしてビルドされる必要がある）
- 技術スタックはTypeScriptをメインとする
- 欲しい機能: ディレクトリによるカテゴリー分け、検索機能、タグ機能、最終更新日の自動表示、コメント機能（Giscus）

ヒアリングの結果、以下の方針で確定した:
- 検索: VitePress組み込みのローカル検索（minisearch、外部サービス不要）
- カテゴリー分け: ディレクトリ構成からTypeScriptスクリプトでサイドバーを自動生成（手動config編集不要）
- 追加機能: タグ機能 / 最終更新日の自動表示 / Giscusコメント
- 公開範囲: 完全公開（publicリポジトリ前提、GitHub Pages無料枠で完結）

## 全体構成

VitePressは「Markdown書くだけでドキュメントサイトになる」静的サイトジェネレータで、この要件と非常に相性が良い。特に **編集リンク機能（`editLink`）と ローカル検索・`lastUpdated` はすべて組み込み機能** であり、追加実装なしで満たせる。自作が必要なのは「ディレクトリ→サイドバー自動生成」「タグ一覧ページ」「Giscus埋め込み」の3点のみ。

### ディレクトリ構成

```
/
├── docs/                          # VitePressのソースルート
│   ├── .vitepress/
│   │   ├── config.ts              # VitePress設定（TypeScript）
│   │   ├── theme/
│   │   │   ├── index.ts           # デフォルトテーマを拡張、Giscusをdoc-afterスロットに注入
│   │   │   └── Giscus.vue         # Giscusコメント埋め込みコンポーネント
│   │   ├── scripts/
│   │   │   └── generateSidebar.ts # ディレクトリ構成→サイドバー/ナビ自動生成ロジック
│   │   └── theme/tags.data.ts     # VitePressの data loader でタグ一覧を build 時に集計
│   ├── public/                    # 画像等の静的アセット
│   ├── guide/                     # カテゴリ例（トップレベルディレクトリ = カテゴリ）
│   │   └── getting-started.md
│   ├── faq/
│   ├── tags/
│   │   └── index.md               # タグ一覧ページ（tags.data.tsを参照）
│   ├── contributing.md            # 非エンジニア向け「編集の仕方」ガイド
│   ├── 404.md
│   └── index.md                   # トップページ
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actionsでビルド&Pagesへデプロイ
├── package.json
└── tsconfig.json
```

- **カテゴリー = `docs/` 直下のディレクトリ**。サブディレクトリを作ればサイドバー上でネストしたグループになる。
- Front matter規約: `title`, `description`, `tags: []`, 任意で並び順用の `order`。

### 1. ディレクトリからのサイドバー自動生成

`docs/.vitepress/scripts/generateSidebar.ts` に Node.js の `fs`/`path` でディレクトリを再帰走査し、各Markdownファイルの frontmatter（`title`, `order`）を読んで `DefaultTheme.Sidebar` 型のオブジェクトを組み立てる関数を実装する。`config.ts` はビルド時（Node実行時）にこの関数を呼び出して `themeConfig.sidebar` にセットする。これにより **新しい記事やフォルダを追加するだけでサイドバーに自動反映**され、非エンジニアがPRで記事を追加してもconfig側の編集は不要になる。ナビゲーション（上部メニュー）も同スクリプトからカテゴリ一覧を抽出して生成する。

### 2. 「記事を編集」ボタン

VitePressの組み込み `editLink` 機能をそのまま使う。`config.ts` の `themeConfig.editLink` に以下を設定するだけで、各記事下部に自動的に「Edit this page」リンクが表示され、GitHub.comの該当ファイルの編集画面へ直接遷移する（未フォーク・未クローンのユーザーでもGitHub側がフォーク→ブランチ作成→PR作成まで自動で誘導してくれる）:

```ts
themeConfig: {
  editLink: {
    pattern: 'https://github.com/<org>/<repo>/edit/main/docs/:path',
    text: 'このページを編集する'
  }
}
```

自作コードは不要。表示文言だけ日本語にカスタマイズする。

### 3. 検索

`themeConfig.search: { provider: 'local' }` を設定するだけ。ビルド時に全文索引が生成され、完全にクライアントサイド・静的ファイルのみで動作する。外部サービス登録不要。

### 4. タグ機能

VitePressの **data loader**（`*.data.ts` ファイル）を使い、ビルド時に全Markdownのfrontmatterから `tags` を収集して `{ tag: string; pages: {title, url}[] }[]` の形にまとめる。`docs/tags/index.md` でこのデータをVueコンポーネントとして描画し、タグ一覧とタグごとの記事一覧を表示する。各記事のタグバッジ表示は、テーマの `doc-before` スロットにfrontmatterの `tags` を描画する小さなVueコンポーネントを追加して対応する。

### 5. 最終更新日の自動表示

VitePress組み込みの `lastUpdated: true` を `config.ts` に設定するだけで、各記事のGitコミット履歴から自動的に最終更新日を取得・表示する。ただしCI上でGitの全履歴が必要なため、GitHub Actionsの `actions/checkout` で `fetch-depth: 0` を指定する必要がある（後述）。

### 6. コメント機能（Giscus）

GitHub Discussionsを裏側に使う静的サイト対応のコメントウィジェット。事前にリポジトリでDiscussionsを有効化し、https://giscus.app で `repo-id` / `category-id` を取得しておく。`docs/.vitepress/theme/Giscus.vue` としてGiscusの `<script>` タグを埋め込むラッパーコンポーネントを作成し、`theme/index.ts` の `Layout` の `doc-after` スロットに差し込む。完全にクライアントサイドJSで完結するためGitHub Pagesと相性が良い。

### 7. 非エンジニア向け編集ガイド

`docs/contributing.md` に、編集ボタンの押し方・GitHubアカウントでの変更内容の保存（PR自動作成）・画像の追加方法を日本語で記載する。画像追加については、GitHub.comのファイル編集画面はテキストエリアへの**ドラッグ&ドロップ/貼り付けで画像を自動アップロードしMarkdownリンクを挿入する機能**を持つため、これを案内する（アップロード先はGitHubのアセットCDNであり、リポジトリへのコミットにはならない点は明記しておく）。

### 8. GitHub Pagesへのデプロイ

`.github/workflows/deploy.yml` で、`main` へのpush をトリガーに以下を実行する標準的なVitePress用ワークフローを組む:
1. `actions/checkout@v4`（`fetch-depth: 0` — `lastUpdated` のため）
2. `actions/setup-node@v4`
3. `npm ci`
4. `npm run docs:build`
5. `actions/upload-pages-artifact@v3`（`docs/.vitepress/dist`）
6. `actions/deploy-pages@v4`

リポジトリ設定でPagesのSourceを「GitHub Actions」に変更する必要がある（手動作業、実装後にユーザーへ案内）。また `config.ts` の `base` をプロジェクトページ用に `'/<repo名>/'` に設定する必要がある。

### package.json スクリプト

```json
{
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  }
}
```

## 参照・再利用する既存パターン

新規プロジェクトのため既存コードの再利用対象はないが、以下はすべてVitePress本体の組み込み機能であり自作しない:
- `editLink`（編集ボタン）
- `search.provider: 'local'`（検索）
- `lastUpdated`（最終更新日）
- data loader (`*.data.ts`) の仕組み（タグ集計に利用）
- `404.md` の自動認識

## 検証方法

1. `npm run docs:dev` でローカル起動し、`docs/guide/`, `docs/faq/` 配下にサンプル記事を追加してサイドバー・ナビが自動反映されることを確認
2. 各記事下部の編集ボタンが正しいGitHub編集URL（`.../edit/main/docs/<path>`）を指しているか確認
3. 検索ボックスでサンプル記事のタイトル・本文がヒットするか確認
4. `docs/tags/index.md` でタグ一覧・タグ別記事一覧が正しく表示されるか確認
5. ローカルではGit履歴が浅い場合 `lastUpdated` が表示されないことがあるため、`git log` が十分にある状態か、あるいはCI上のビルド結果で確認
6. Giscusは実リポジトリでDiscussions有効化・ID取得後でないと動作確認できないため、実装後に手動セットアップ手順を案内し、ステージング用リポジトリで表示確認
7. `main` へpushしGitHub Actionsが成功し、`https://<user>.github.io/<repo>/` で実際にサイトが表示されることを確認
