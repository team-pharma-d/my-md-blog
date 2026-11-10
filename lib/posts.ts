import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";

// posts フォルダの絶対パス
const postsDirectory = path.join(process.cwd(), "posts");

// 記事1件分の frontmatter の型
export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
};

// frontmatter が不正なときのエラー（ビルドを止める）
function invalidFrontmatter(slug: string, reason: string): Error {
  return new Error(`${slug}.md の frontmatter が不正（${reason}）`);
}

// frontmatter の中身を確認し、title / date / tags を取り出す
function parseFrontmatter(
  slug: string,
  data: Record<string, unknown>,
): Omit<PostMeta, "slug"> {
  const { title, date, tags } = data;

  if (typeof title !== "string" || title.trim() === "") {
    throw invalidFrontmatter(slug, "title が文字列ではありません");
  }
  if (typeof date !== "string" || date.trim() === "") {
    // 引用符なしの date: 2026-11-01 は、日付型として読み込まれてここに来る
    throw invalidFrontmatter(slug, 'date が文字列ではありません。"2026-11-01" のように引用符で囲んでください');
  }
  // tags は省略可能（省略時は空の配列）。書く場合は文字列の配列にする
  if (tags !== undefined && !(Array.isArray(tags) && tags.every((tag) => typeof tag === "string"))) {
    throw invalidFrontmatter(slug, "tags が文字列の配列ではありません");
  }

  return { title, date, tags: Array.isArray(tags) ? tags : [] };
}

// 1) 全記事の一覧（日付の新しい順）
export function getAllPosts(dir: string = postsDirectory): PostMeta[] {
  const slugs = getPostSlugs(dir);

  const posts = slugs.map((slug) => {
    const fileContents = fs.readFileSync(path.join(dir, `${slug}.md`), "utf8");
    const { data } = matter(fileContents);

    return { slug, ...parseFrontmatter(slug, data) };
  });

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

// 2) slug の一覧（generateStaticParams 用。Step 7 で使う）
export function getPostSlugs(dir: string = postsDirectory): string[] {
  const fileNames = fs.readdirSync(dir);
  const mdFiles = fileNames.filter((name) => name.endsWith(".md"));
  return mdFiles.map((name) => name.replace(".md", ""));
}
export async function getPostBySlug(slug: string, dir: string = postsDirectory) {
  const fileContents = fs.readFileSync(path.join(dir, `${slug}.md`), "utf8");
  const { data, content } = matter(fileContents);
  const meta = parseFrontmatter(slug, data);
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(content);

  return {
    slug,
    ...meta,
    html: String(result),
    toc: extractToc(String(result)),
  };
}

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export function extractToc(html: string): TocItem[] {
  const items: TocItem[] = [];
  const pattern = /<h([23]) id="([^"]+)">(.*?)<\/h\1>/g;
  for (const match of html.matchAll(pattern)) {
    items.push({
      level: Number(match[1]) as 2 | 3,
      id: match[2],
      text: match[3].replace(/<[^>]+>/g, ""),
    });
  }
  return items;
}