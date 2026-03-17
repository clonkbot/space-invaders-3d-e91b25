import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getTopScores = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("scores")
      .withIndex("by_score")
      .order("desc")
      .take(10);
  },
});

export const getUserScores = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("scores")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(5);
  },
});

export const submitScore = mutation({
  args: {
    playerName: v.string(),
    score: v.number(),
    wave: v.number(),
    kills: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Insert score
    await ctx.db.insert("scores", {
      userId,
      playerName: args.playerName,
      score: args.score,
      wave: args.wave,
      createdAt: Date.now(),
    });

    // Update game stats
    const existingStats = await ctx.db
      .query("gameStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingStats) {
      await ctx.db.patch(existingStats._id, {
        totalGamesPlayed: existingStats.totalGamesPlayed + 1,
        totalScore: existingStats.totalScore + args.score,
        highestWave: Math.max(existingStats.highestWave, args.wave),
        totalKills: existingStats.totalKills + args.kills,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("gameStats", {
        userId,
        totalGamesPlayed: 1,
        totalScore: args.score,
        highestWave: args.wave,
        totalKills: args.kills,
        updatedAt: Date.now(),
      });
    }
  },
});

export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("gameStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});
