"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function BlogPostPage() {
  const { id } = useParams();
  const post = useQuery(api.blog.getPost, { id: id as string });

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-3/4 bg-zinc-900 rounded mb-4" />
          <div className="h-4 w-1/4 bg-zinc-900 rounded mb-8" />
          <div className="space-y-4">
            <div className="h-4 bg-zinc-900 rounded w-full" />
            <div className="h-4 bg-zinc-900 rounded w-5/6" />
            <div className="h-4 bg-zinc-900 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/blog">
          <Button variant="ghost" className="mb-8 -ml-2 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Button>
        </Link>

        <article>
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-zinc-400">
              {post.author && (
                <span>
                  by <span className="text-zinc-300">{post.author.name}</span>
                </span>
              )}
              <span>•</span>
              <time>
                {formatDistanceToNow(post.publishedAt, { addSuffix: true })}
              </time>
            </div>
          </header>

          <div
            className="prose prose-invert max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <footer className="border-t border-zinc-800 pt-6">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-3 py-1 rounded-full text-sm bg-purple-500/10 text-purple-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}
