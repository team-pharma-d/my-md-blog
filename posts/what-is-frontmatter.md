---
title: "frontmatterとは"
date: "2026-11-02"
tags: ["Next.js", "frontmatter"]
---

## frontmatterとは

「ファイルの表紙に書かれた管理情報」のようなものです。 本文そのものではなく、本文をどのように扱うかを定義する役割があります。

### メリット
- 記事の情報を本文と分けて管理できる
- プログラムから title や date を取り出せる

## コード例

```ts
const message: string = "frontmatter";
console.log(message);
```