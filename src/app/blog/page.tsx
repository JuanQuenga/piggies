"use client";

import { Suspense } from "react";
import { Newspaper, Pencil } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Doc, Id } from "../../../convex/_generated/dataModel";

type BlogPost = Doc<"blogPosts"> & {
  author: { name: string } | null;
};

function BlogPageContent() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const posts = useQuery(api.blog.listPublishedPosts);

  // Show loading state while both user and posts are loading
  if (!isUserLoaded || posts === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Newspaper className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-bold">Blog & Updates</h1>
        </div>
        <div className="animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-zinc-900 rounded-lg p-6 shadow-lg mb-6 h-48"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Newspaper className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-bold">Blog & Updates</h1>
        </div>
        {user && (
          <Link href="/blog/new">
            <Button variant="outline" className="gap-2">
              <Pencil className="w-4 h-4" />
              Write Post
            </Button>
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <p>No blog posts published yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map((post: BlogPost) => (
            <article
              key={post._id}
              className="bg-zinc-900 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <Link href={`/blog/${post._id}`} className="group">
                  <h2 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                    {post.title}
                  </h2>
                </Link>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm text-zinc-400">
                    {formatDistanceToNow(new Date(post.publishedAt), {
                      addSuffix: true,
                    })}
                  </span>
                  {post.author && (
                    <span className="text-sm text-zinc-500">
                      by {post.author.name}
                    </span>
                  )}
                </div>
              </div>
              <div
                className="text-zinc-300 mb-4 line-clamp-3 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: post.content,
                }}
              />
              <div className="flex items-center gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-3 py-1 rounded-full text-sm bg-purple-500/10 text-purple-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-8">
            <Newspaper className="w-8 h-8 text-purple-500" />
            <h1 className="text-3xl font-bold">Blog & Updates</h1>
          </div>
          <div className="animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-zinc-900 rounded-lg p-6 shadow-lg mb-6 h-48"
              />
            ))}
          </div>
        </div>
      }
    >
      <BlogPageContent />
    </Suspense>
  );
}
