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

// 1) 全記事の一覧（日付の新しい順）
export function getAllPosts(): PostMeta[] {
　const slugs = getPostSlugs();

  const posts = slugs.map((slug) => {
    const fileContents = fs.readFileSync(path.join(postsDirectory, `${slug}.md`), "utf8");
    const { data } = matter(fileContents);

    return {
      slug,
      title: data.title,
      date: data.date,
      tags: data.tags,
    };
  });

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

// 2) slug の一覧（generateStaticParams 用。Step 7 で使う）
export function getPostSlugs(): string[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const mdFiles = fileNames.filter((name) => name.endsWith(".md"));
  return mdFiles.map((name) => name.replace(".md", ""));
}
export async function getPostBySlug(slug: string) {
  const fileContents = fs.readFileSync(path.join(postsDirectory, `${slug}.md`), "utf8");
  const { data, content } = matter(fileContents);
    const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(content);

  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    tags: data.tags as string[],
    html: String(result),
  };
}