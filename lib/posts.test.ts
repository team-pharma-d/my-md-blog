import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { extractToc, getAllPosts, getPostBySlug, getPostSlugs } from "./posts";

// テスト用の一時フォルダ。実際の posts/ は使わない
let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "posts-test-"));
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

function writePost(
  slug: string,
  meta: { title: string; date: string; tags: string[] },
) {
  const frontmatter = [
    "---",
    `title: "${meta.title}"`,
    `date: "${meta.date}"`,
    `tags: [${meta.tags.map((t) => `"${t}"`).join(", ")}]`,
    "---",
    "",
    "## 見出し",
    "",
    "本文",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(dir, `${slug}.md`), frontmatter, "utf8");
}

describe("getPostSlugs", () => {
  it(".md ファイルだけを拾い、拡張子を取り除く", () => {
    writePost("hello", { title: "A", date: "2026-11-01", tags: ["x"] });
    writePost("world", { title: "B", date: "2026-11-02", tags: ["y"] });
    fs.writeFileSync(path.join(dir, "memo.txt"), "md ではない");
    fs.writeFileSync(path.join(dir, ".DS_Store"), "");

    expect(getPostSlugs(dir).sort()).toEqual(["hello", "world"]);
  });

  it("記事が無いフォルダでは空の配列を返す", () => {
    expect(getPostSlugs(dir)).toEqual([]);
  });
});

describe("getAllPosts", () => {
  it("日付の新しい順に並べる", () => {
    writePost("old", { title: "古い記事", date: "2026-11-01", tags: ["a"] });
    writePost("new", { title: "新しい記事", date: "2026-11-05", tags: ["b"] });
    writePost("mid", { title: "真ん中の記事", date: "2026-11-03", tags: ["c"] });

    const slugs = getAllPosts(dir).map((post) => post.slug);

    expect(slugs).toEqual(["new", "mid", "old"]);
  });

  it("frontmatter の title / date / tags を取り出す", () => {
    writePost("only", {
      title: "タイトル",
      date: "2026-11-09",
      tags: ["Next.js", "SSG"],
    });

    expect(getAllPosts(dir)).toEqual([
      {
        slug: "only",
        title: "タイトル",
        date: "2026-11-09",
        tags: ["Next.js", "SSG"],
      },
    ]);
  });
});

// frontmatter を自由に書いた記事を作る（不正なケースの確認用）
function writeRaw(slug: string, frontmatter: string[]) {
  const text = ["---", ...frontmatter, "---", "", "## 見出し", ""].join("\n");
  fs.writeFileSync(path.join(dir, `${slug}.md`), text, "utf8");
}

describe("frontmatter の検証", () => {
  it("title が無い記事は、記事名を含むエラーで止まる", () => {
    writeRaw("no-title", ['date: "2026-11-01"', 'tags: ["a"]']);

    expect(() => getAllPosts(dir)).toThrow("no-title.md の frontmatter が不正");
  });

  it("date が文字列でない（引用符なし）記事はエラーで止まる", () => {
    writeRaw("bad-date", ['title: "A"', "date: 2026-11-01", 'tags: ["a"]']);

    expect(() => getAllPosts(dir)).toThrow("bad-date.md の frontmatter が不正");
  });

  it("tags が配列でない記事はエラーで止まる", () => {
    writeRaw("bad-tags", ['title: "A"', 'date: "2026-11-01"', 'tags: "Next.js"']);

    expect(() => getAllPosts(dir)).toThrow("bad-tags.md の frontmatter が不正");
  });

  it("tags を省略した記事は、空の配列として扱う", () => {
    writeRaw("no-tags", ['title: "A"', 'date: "2026-11-01"']);

    expect(getAllPosts(dir)[0].tags).toEqual([]);
  });

  it("getPostBySlug でも、不正な frontmatter はエラーで止まる", async () => {
    writeRaw("broken", ['title: "A"', "date: 2026-11-01"]);

    await expect(getPostBySlug("broken", dir)).rejects.toThrow(
      "broken.md の frontmatter が不正",
    );
  });
});

describe("extractToc", () => {
  it("h2 / h3 の level・id・text を順番どおりに取り出す", () => {
    const html = [
      '<h2 id="ssgとは">SSGとは</h2>',
      "<p>本文</p>",
      '<h3 id="メリット">メリット</h3>',
      '<h2 id="コード例">コード例</h2>',
    ].join("\n");

    expect(extractToc(html)).toEqual([
      { level: 2, id: "ssgとは", text: "SSGとは" },
      { level: 3, id: "メリット", text: "メリット" },
      { level: 2, id: "コード例", text: "コード例" },
    ]);
  });

  it("見出しの中のタグは取り除き、文字だけを text にする", () => {
    const html = '<h2 id="getallposts">関数 <code>getAllPosts</code> の使い方</h2>';

    expect(extractToc(html)).toEqual([
      { level: 2, id: "getallposts", text: "関数 getAllPosts の使い方" },
    ]);
  });

  it("h1 / h4 と、id の無い見出しは対象にしない", () => {
    const html = [
      '<h1 id="title">タイトル</h1>',
      '<h4 id="deep">深い見出し</h4>',
      "<h2>id が無い見出し</h2>",
    ].join("\n");

    expect(extractToc(html)).toEqual([]);
  });

  it("見出しが無い HTML では空の配列を返す", () => {
    expect(extractToc("<p>本文だけ</p>")).toEqual([]);
  });
});
