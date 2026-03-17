import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Id } from "../../convex/_generated/dataModel";

interface Score {
  _id: Id<"scores">;
  _creationTime: number;
  userId: Id<"users">;
  playerName: string;
  score: number;
  wave: number;
  createdAt: number;
}

export function Leaderboard() {
  const topScores = useQuery(api.scores.getTopScores) as Score[] | undefined;
  const userScores = useQuery(api.scores.getUserScores) as Score[] | undefined;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Global Leaderboard */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-4 md:p-6">
        <h2 className="text-[10px] md:text-xs text-purple-400/60 font-mono tracking-wider mb-3 md:mb-4 flex items-center gap-2">
          <span className="text-lg">🏆</span> GALACTIC LEADERBOARD
        </h2>

        {topScores === undefined ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 md:h-12 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : topScores.length === 0 ? (
          <p className="text-center text-white/30 text-xs md:text-sm font-mono py-6 md:py-8">
            NO SCORES YET. BE THE FIRST!
          </p>
        ) : (
          <div className="space-y-2">
            {topScores.map((score: Score, index: number) => (
              <motion.div
                key={score._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg ${
                  index === 0
                    ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
                    : index === 1
                    ? "bg-gradient-to-r from-gray-400/20 to-gray-300/20 border border-gray-400/30"
                    : index === 2
                    ? "bg-gradient-to-r from-orange-700/20 to-orange-600/20 border border-orange-700/30"
                    : "bg-white/5"
                }`}
              >
                <span
                  className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full font-black text-xs md:text-sm ${
                    index === 0
                      ? "bg-yellow-500 text-black"
                      : index === 1
                      ? "bg-gray-400 text-black"
                      : index === 2
                      ? "bg-orange-700 text-white"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs md:text-sm text-white truncate">
                    {score.playerName}
                  </p>
                  <p className="text-[10px] text-white/40 font-mono">WAVE {score.wave}</p>
                </div>
                <p className="font-black text-sm md:text-lg text-cyan-400">
                  {score.score.toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Personal Best */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
        <h2 className="text-[10px] md:text-xs text-cyan-400/60 font-mono tracking-wider mb-3 md:mb-4 flex items-center gap-2">
          <span className="text-lg">👤</span> YOUR MISSIONS
        </h2>

        {userScores === undefined ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 md:h-10 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : userScores.length === 0 ? (
          <p className="text-center text-white/30 text-xs md:text-sm font-mono py-4 md:py-6">
            COMPLETE A MISSION TO SEE SCORES
          </p>
        ) : (
          <div className="space-y-2">
            {userScores.map((score: Score, index: number) => (
              <motion.div
                key={score._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-white/5"
              >
                <div>
                  <p className="font-mono text-xs md:text-sm text-white/60">WAVE {score.wave}</p>
                </div>
                <p className="font-bold text-sm md:text-base text-cyan-400">
                  {score.score.toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
