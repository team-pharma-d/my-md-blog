import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts();

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-3xl font-bold mb-8">ブログ</h1>
      <ul className="grid gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <li key={post.slug}>
  <Link
    href={`/posts/${post.slug}`}
    className="block rounded-lg border border-zinc-200 p-4 transition hover:shadow-md hover:border-zinc-400"
  >
    <h2 className="text-lg font-semibold">{post.title}</h2>
    <p className="mt-1 text-sm text-zinc-500">{post.date}</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {post.tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
        >
          {tag}
        </span>
      ))}
    </div>
  </Link>
</li>
        ))}
      </ul>
    </main>
  );
}