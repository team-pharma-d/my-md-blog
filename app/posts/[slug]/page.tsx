import "highlight.js/styles/github-dark.css";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return {
    title: `${post.title} | ブログ`,
    description: `${post.title}についての記事です。`,
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
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">{post.title}</h1>
<p className="mt-2 text-sm text-zinc-500">{post.date}</p>
<article
 className="prose prose-zinc mt-8 max-w-none"
 dangerouslySetInnerHTML={{ __html: post.html }}
 />
    </main>
  );
}