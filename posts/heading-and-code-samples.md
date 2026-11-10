---
title: "見出しとコードブロックの書き方サンプル"
description: "目次の自動生成とコードの色付けが、深い見出しや複数言語のコードでも動くかを確かめるサンプル記事です。"
date: "2026-11-10"
tags: ["Markdown", "ハイライト"]
---

## この記事について

目次の自動生成とコードの色付けが、いろいろな書き方でも正しく動くかを確かめるための記事です。深い見出し、見出しの中のコード、複数の言語のコードブロックを含めています。

## `getAllPosts` と `getPostSlugs` の使い分け

見出しの中に `code`（インラインコード）を入れた例です。目次には、タグを取り除いた文字だけが出ます。

### 一覧ページで使う関数

`getAllPosts` は、全記事の title / date / tags を、日付の新しい順に返します。

#### 並べ替えの仕組み

日付が `"2026-11-05"` の形式なので、文字列の比較だけで新旧を判定できます。ここは h4 の見出しで、目次の対象外です。

##### さらに深い h5 の見出し

h5 まで入れても、変換と表示が壊れないことを確かめます。

### 記事ページで使う関数

`getPostSlugs` は、`generateStaticParams` に渡す slug の一覧を返します。

## コードブロックの例

### TypeScript

```ts
type Post = { slug: string; title: string };

export function toTitles(posts: Post[]): string[] {
  return posts.map((post) => post.title);
}
```

### シェル（bash）

```bash
npm install
npm run build
npm test
```

### 設定ファイル（json）

```json
{
  "scripts": {
    "build": "next build",
    "test": "vitest run"
  }
}
```

### 言語を指定しないコードブロック

```
言語を指定しない場合は、色付けされず、そのまま表示されます。
```
