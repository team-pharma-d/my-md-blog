# Markdown ブログ（静的生成）

Next.js の **SSG（Static Site Generation）** で作った、Markdown ベースの軽量ブログです。`posts/` に置いた `.md` ファイルから、一覧ページと記事ページをビルド時に HTML として生成します。WordPress の代わりに軽量な CMS が欲しい、という Web 制作の依頼を想定した課題として制作しました。

- **公開 URL**：https://my-md-blog-mu.vercel.app
- **リポジトリ**：https://github.com/team-pharma-d/my-md-blog
- **学習ノート**：[docs/learning-note.md](docs/learning-note.md)

## 達成したこと

- [x] `posts/` の `.md` を5本以上（現在6本）配置して `next build` が通る（すべての記事が静的 HTML として生成された）
- [x] `/posts/[slug]` で見出し階層（h2 / h3）が正しく表示される
- [x] Lighthouse の Performance が 90 以上（一覧・記事とも 100、モバイル・本番 URL で計測）

加えて、次を実装しました。

- frontmatter（title / date / tags）のパースと、カード形式の一覧表示（日付の新しい順）
- コードブロックのシンタックスハイライト
- 記事ごとの `title` / `description`（frontmatter の要約を使用）、`openGraph`、`canonical`（`generateMetadata`）と `<html lang="ja">`
- frontmatter の検証（title / date / tags / description が不正なら、記事名を示してビルドを止める）
- Vitest による `lib/posts.ts` のテスト（19本）
- 深い見出し（h4・h5）、見出し内のコード、ts・bash・json のコードブロックを含むサンプル記事

## 技術スタックと選定理由

| 技術 | 用途 | 選んだ理由 |
|---|---|---|
| Next.js 16（App Router） | フレームワーク・SSG | `generateStaticParams` で記事ページをビルド時に生成できる |
| TypeScript | 言語 | 記事データの型（`PostMeta`）を定義でき、取り違えに気づきやすい |
| gray-matter | frontmatter のパース | md を frontmatter と本文に分離する定番ライブラリ |
| unified / remark / rehype | Markdown → HTML 変換 | 変換を段階に分けて組み立てられ、見出し id やハイライトをプラグインで足せる |
| Tailwind CSS v4 + typography | スタイリング | `prose` クラスで、md 由来の HTML を簡単に整えられる |
| highlight.js（rehype-highlight） | コードの色付け | コードブロックの言語を自動で判定して色付けできる |
| Vitest | テスト | `lib/posts.ts` の動作（取得、並び順、目次、frontmatter の検証）を自動で確認できる |
| Vercel | ホスティング | GitHub 連携で、push するだけで公開できる |

## 処理の流れ

ビルド時に、md から完成済みの HTML までをすべて作ります。ブラウザからの要求には、できあがった HTML を返すだけです。

```mermaid
flowchart TD
    A["posts/*.md"] --> B["gray-matter<br/>frontmatter と本文に分離"]
    B --> C["frontmatter<br/>title / date / tags"]
    B --> D["本文（Markdown）"]
    C --> L["一覧ページ（カード表示）"]
    D --> E["unified パイプライン"]
    E --> F["remarkParse<br/>Markdown → mdast"]
    F --> G["remarkRehype<br/>mdast → hast"]
    G --> H["rehypeSlug<br/>見出しに id"]
    H --> I["rehypeHighlight<br/>コードに色付け用 class"]
    I --> J["rehypeStringify<br/>hast → HTML 文字列"]
    J --> K["記事ページ /posts/[slug]"]
    L --> M["ビルド時に静的 HTML として出力"]
    K --> M
```

## 検証結果

### テスト（`npm test`）

```
 ✓ lib/posts.test.ts (19 tests)

 Test Files  1 passed (1)
      Tests  19 passed (19)
```

- `.md` だけを拾うこと、日付の新しい順に並ぶこと、目次の level・id・text が正しいことを確認
- 不正な frontmatter（title なし、引用符なしの date、tags が配列でない、description が空）で、記事名つきのエラーになることを確認
- サンプル記事で、h4 以降が目次に入らないこと、見出し内の code が文字だけになること、ts・bash・json にハイライトが付くことを確認

### ビルド（`npm run build`）

```
Route (app)
┌ ○ /
├ ○ /_not-found
└   /posts/[slug]
  ├ ● /posts/code-highlight
  ├ ● /posts/deploy-to-vercel
  ├ ● /posts/heading-and-code-samples
  └ ● [+3 more paths]

○  (Static)  prerendered as static content
●  (SSG)     prerendered as static HTML (uses generateStaticParams)
```

- `Generating static pages (10/10)`：ビルド時に10ページを生成（`/`、`/_not-found`、記事6本、Next.js が自動で作る内部ページ）
- 記事6本がすべて `●（SSG）`。ビルドの警告もなし
- 生成物 `.next/server/app/posts/hello-ssg.html` に、見出しの `id`、ハイライト用の class、記事ごとの `description` / `og:*` / `canonical` が書き込まれた状態の HTML があることを確認

### Lighthouse（本番 URL・モバイル・シークレットウィンドウ）

| ページ | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| 一覧（`/`） | 100 | 100 | 100 | 100 |
| 記事（`/posts/hello-ssg`） | 100 | 100 | 100 | 100 |

| 一覧ページ | 記事ページ |
|---|---|
| ![Lighthouse 一覧](docs/images/lighthouse-top.png) | ![Lighthouse 記事](docs/images/lighthouse-post.png) |

高いスコアの理由：HTML をビルド時に完成させているため、実行時に md の読み込みや変換が発生せず、画像もほとんど使っていないためです。

## ディレクトリ構成

```
my-md-blog/
├─ app/
│   ├─ layout.tsx            # 全ページ共通の枠・サイト全体のメタタグ
│   ├─ page.tsx              # 一覧ページ
│   ├─ globals.css           # Tailwind と typography プラグインの設定
│   └─ posts/[slug]/page.tsx # 記事ページ（generateStaticParams / generateMetadata）
├─ lib/
│   ├─ posts.ts              # md の読み込み・変換・frontmatter の検証
│   └─ posts.test.ts         # posts.ts のテスト（Vitest）
├─ posts/                    # 記事（Markdown）
├─ docs/
│   ├─ learning-note.md      # 学習ノート
│   ├─ tags-rule.md          # tags の運用ルール
│   └─ images/               # 検証結果のスクリーンショット
└─ package.json
```

## ローカルでの動かし方

```bash
git clone https://github.com/team-pharma-d/my-md-blog.git
cd my-md-blog
npm install
npm run dev      # 開発サーバー（表示された URL にアクセス）
npm run build    # 本番ビルド（SSG の確認）
npm run start    # ビルド結果を本番モードで起動
npm test         # テスト（Vitest）
```

記事を追加するときは、`posts/` に `.md` ファイルを置き、先頭に次の frontmatter を書きます。ファイル名がそのまま URL の slug になります。

```md
---
title: "記事のタイトル"
description: "記事の要約（省略可）"
date: "2026-11-01"
tags: ["Next.js", "SSG"]
---
```

## 工夫した点

- 目次（TOC）を、見出しの id から自動生成して記事ページに表示した
- frontmatter の書き間違い（引用符なしの date など）を、公開前のビルドで気づけるように検証を入れた
- テストは一時フォルダに記事を作って行い、実際の `posts/` に依存しない作りにした
- md → HTML の変換を `unified` のパイプラインにして、見出し id（`rehypeSlug`）とコードの色付け（`rehypeHighlight`）をプラグインで追加できる構成にした
- 一覧用（frontmatter だけ）と記事用（HTML 変換まで）で関数を分け、一覧の生成で無駄な変換をしない
- 記事ごとの `title` / `description` を `generateMetadata` で出し分け、SEO スコア 100 を確認した
- 開発中に出たエラーの原因と対処を、[学習ノート](docs/learning-note.md)の「つまずきと解決」に記録した

## 自分で判断した点

課題の指定に沿って、AI に任せる部分と自分で判断する部分を分けました。

- **URL 設計**：`/posts/[slug]` にした。ファイル名をそのまま slug にすることで、記事の追加が「md を1つ置くだけ」で済み、URL に日付を入れない分、あとから日付を直してもリンクが変わらない
- **SEO 用のメタタグ**：サイト全体は `layout.tsx` の `metadata`、記事ごとは `generateMetadata` で `記事タイトル | ブログ` と frontmatter の `description` を出し分けた（`metadataBase` と `openGraph` も設定）。`<html lang="ja">` も指定した
- **tags の運用ルール**：[docs/tags-rule.md](docs/tags-rule.md) に定義した（表記ゆれを防ぐため、表記と個数を決めた）

## 今後の改善

- タグ別の一覧ページ
- 共有時のサムネイル画像（`og:image`）の設定
- GitHub Actions で、テストとビルドを自動実行
- RSS フィード、サイトマップの生成
- 記事内の画像の最適化（`next/image` の利用）
