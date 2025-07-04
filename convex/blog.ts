import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// Get a single blog post by ID
export const getPost = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id as Id<"blogPosts">);
    if (!post) {
      return null;
    }

    // Fetch author information
    const author = await ctx.db.get(post.authorId);
    return {
      ...post,
      author: author ? { name: author.name } : null,
    };
  },
});

// List published blog posts, ordered by publish date
export const listPublishedPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_publishedAt", (q) => q.eq("published", true))
      .order("desc")
      .collect();

    // Fetch author information for each post
    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return {
          ...post,
          author: author ? { name: author.name } : null,
        };
      })
    );

    return postsWithAuthors;
  },
});

// Create a new blog post
export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const email = identity.email;
    if (!email) {
      throw new Error("User email not found");
    }

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const postId = await ctx.db.insert("blogPosts", {
      title: args.title,
      content: args.content,
      authorId: user._id,
      tags: args.tags,
      published: args.published,
      publishedAt: Date.now(),
    });

    return postId;
  },
});

// Update an existing blog post
export const updatePost = mutation({
  args: {
    postId: v.id("blogPosts"),
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const email = identity.email;
    if (!email) {
      throw new Error("User email not found");
    }

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user || post.authorId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.postId, {
      title: args.title,
      content: args.content,
      tags: args.tags,
      published: args.published,
      ...(args.published && !post.published ? { publishedAt: Date.now() } : {}),
    });
  },
});

// Delete a blog post
export const deletePost = mutation({
  args: {
    postId: v.id("blogPosts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const email = identity.email;
    if (!email) {
      throw new Error("User email not found");
    }

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user || post.authorId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.postId);
  },
});
