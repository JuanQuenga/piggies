import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const migrateConversations = internalMutation({
  args: {},
  handler: async (ctx, args) => {
    const all = await ctx.db.query("conversations").collect();
    for (const doc of all) {
      // If already migrated, skip
      if (
        doc.participants &&
        doc.participantSet &&
        doc.lastMessageTime !== undefined
      )
        continue;

      // Migrate participantIds -> participants/participantSet
      let participants = doc.participants;
      if (!participants && (doc as any).participantIds) {
        participants = (doc as any).participantIds;
      }
      // Set participantSet to same as participants
      let participantSet = doc.participantSet;
      if (!participantSet && participants) {
        participantSet = participants;
      }
      // Set lastMessageTime if missing
      let lastMessageTime = doc.lastMessageTime;
      if (lastMessageTime === undefined) {
        lastMessageTime = 0;
      }

      await ctx.db.patch(doc._id, {
        participants,
        participantSet,
        lastMessageTime,
      });
    }
    return null;
  },
});
