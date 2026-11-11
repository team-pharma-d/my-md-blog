import type { Metadata } from "next";
import "highlight.js/styles/github-dark.css";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const title = `${post.title} | ブログ`;
  // frontmatter の description を使う。無ければ、タイトルから作った文にする
  const description = post.description ?? `${post.title}についての記事です。`;

  return {
    title,
    description,
    alternates: { canonical: `/posts/${slug}` },
    // openGraph は layout.tsx の設定と統合されないため、共通の項目もここに書く
    openGraph: {
      type: "article",
      locale: "ja_JP",
      siteName: "Markdown ブログ（静的生成）",
      title,
      description,
      url: `/posts/${slug}`,
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-3xl font-bold">{post.title}</h1>
<p className="mt-2 text-sm text-zinc-500">{post.date}</p>
      {post.toc.length > 0 && (
        <nav className="mt-6 rounded-lg border border-zinc-200 p-4">
          <p className="mb-2 text-sm font-semibold">目次</p>
          <ul className="space-y-1 text-sm">
            {post.toc.map((item) => (
              <li key={item.id} className={item.level === 3 ? "ml-4" : ""}>
                <a href={`#${item.id}`} className="text-zinc-600 hover:underline">
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
<article
 className="prose prose-zinc prose-code:before:content-none prose-code:after:content-none mt-8 max-w-none [overflow-wrap:anywhere]"
 dangerouslySetInnerHTML={{ __html: post.html }}
 />
    </main>
  );
}