# 学習ノート：Next.js で作る Markdown ブログ（SSG）

## 1. この課題の目的
- （ここに自分の言葉で書く）

## 2. SSG とは
- SSG / SSR / CSR の違い
- ビルド時と実行時で、何が行われるか

<!-- 図を入れる場所：SSG のビルド時 / 実行時の流れ -->

## 3. 環境構築で学んだこと
### 3-1. create-next-app の選択肢
| 質問 | 選択 | 理由 |
|---|---|---|
| React Compiler | No | |
| Cache Components | No | |
| AGENTS.md | No | |

### 3-2. ポート番号（3000 / 3001）
- ポート：パソコン内でアプリごとに通信の入り口を分ける番号
- `npm run dev` は通常 3000 番を使うが、他のアプリが使用中だと Next.js が自動で次の空き番号（3001）に切り替える
- ターミナルに `Port 3000 is in use by process ○○, using available port 3001 instead.` と表示される
- 対処：ターミナルに表示された URL（`Local: http://localhost:3001`）にアクセスすればよい

## 4. App Router とファイル構成
- `app/page.tsx` と `app/layout.tsx` の役割
- 動的ルート `[slug]` の仕組み

## 5. 記事データの読み込み（lib/posts.ts）
### 5-1. getPostSlugs
- `readdirSync` → `filter` → `map` の流れ

### 5-2. getAllPosts
- `matter()` が返す `data` と `content`
- `sort` で日付の新しい順にする方法

<!-- 図を入れる場所：posts/*.md から一覧データができるまで -->

## 6. Markdown → HTML 変換（remark / rehype）
- unified のパイプライン
- mdast / hast（構文木）とは

<!-- 図を入れる場所：変換パイプライン -->

## 7. ページの作成
### 7-1. 一覧ページ
### 7-2. 詳細ページ（generateStaticParams）

## 8. つまずきと解決
| 症状 | 原因 | 解決方法 |
|---|---|---|
| `the name 'Home' is defined multiple times` | `app/page.tsx` に `export default function Home()` が2つあった | 重複した `Home` を削除し、元の `Home` の中に `console.log` を1行追加した |
| ターミナルに undefined が出た | getAllPosts が // TODO のままで return がなかった | 関数の中身を書いた |
| `awaitgetPostBySlug is not defined` | `await` と関数名の間に半角スペースがなく、1つの名前になった | 半角スペースを入れて `await getPostBySlug(...)` にした |
| `'export' cannot be used outside of module code` | 同じ `export async function getPostBySlug` の行を2回貼り付けた | 重複した1行を削除した |
| `Expression expected` | 関数の貼り付けが重なり、余った `console.log(content);` と `}` が残った | `getPostBySlug` から下を全部消し、正しい形を1回だけ貼り直した |
| `Export getPostBySlug doesn't exist in target module` | 上の構文エラーで `lib/posts.ts` が正しく読み込めず、関数が見つからなかった | 構文エラーを直したら解消した（原因は1つで、エラーは連動していた） |

### 8-1. `Home` の重複エラーの詳細

**原因**
手順書の例をそのまま貼り付けた結果、`Home` 関数が2つになった。同じ名前の関数を同じファイルに2回書くと、どちらを使うか決められずエラーになる。

**直し方**
1. ファイルの先頭に import を1行追加する


```tsx
import { getAllPosts } from "@/lib/posts";
```

2. 元からある `Home` 関数の中に `console.log` を1行だけ追加する

```tsx
export default function Home() {
  console.log(getAllPosts());
  return (
    ...（元のコードのまま）
  );
}
```

**学び**
`export default function Home` はファイル全体で1つだけにする。

### 8-2. 波括弧 `{ }` の崩れによる連鎖エラー

**原因**
`getPostBySlug` の骨組みを貼り付けたあとに、同じ内容をもう一度貼り付けてしまい、`export` の行や `}` が重複・余りになった。

**エラーの見方**
- 1つ構文が崩れると、その関数を import している別のファイルでも「関数が存在しない」というエラーが出る（連鎖）
- エラー文の `>` が付いた行と、その上下の行番号が、直す場所の手がかり
- ターミナルには古いログが残るので、`Ctrl + C` → `npm run dev` で再起動すると見やすい

**学び**
- 関数は、`export` の行と閉じ `}` が**1組ずつ**になっているか確認する
- 直すのが難しいときは、崩れた部分を全部消して、正しい形を1回だけ貼り直す
- `Cmd + F` で、同じ行が重複していないか検索する

## 9. ビルドと検証
- `npm run build` の結果
- Lighthouse のスコア

## 10. 用語集
| 用語 | 意味 |
|---|---|
| SSG | |
| frontmatter | |
| パース | |
| slug | |
| Server Component | |