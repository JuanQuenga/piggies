import { mutation } from "./_generated/server";

export const dropAllData = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all messages
    const messages = await ctx.db.query("messages").collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete all conversations
    const conversations = await ctx.db.query("conversations").collect();
    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }

    // Delete all profiles
    const profiles = await ctx.db.query("profiles").collect();
    for (const profile of profiles) {
      await ctx.db.delete(profile._id);
    }

    // Delete all users
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }

    // Delete all blog posts
    const blogPosts = await ctx.db.query("blogPosts").collect();
    for (const post of blogPosts) {
      await ctx.db.delete(post._id);
    }

    return {
      deleted: {
        messages: messages.length,
        conversations: conversations.length,
        profiles: profiles.length,
        users: users.length,
        blogPosts: blogPosts.length,
      },
    };
  },
});
