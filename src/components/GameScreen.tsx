import { useState, useCallback, Suspense } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { SpaceGame } from "./SpaceGame";
import { Leaderboard } from "./Leaderboard";

type GameState = "menu" | "playing" | "gameover";

export function GameScreen() {
  const { signOut } = useAuthActions();
  const [gameState, setGameState] = useState<GameState>("menu");
  const [currentScore, setCurrentScore] = useState(0);
  const [currentWave, setCurrentWave] = useState(1);
  const [currentKills, setCurrentKills] = useState(0);
  const [playerName, setPlayerName] = useState("PILOT");

  const stats = useQuery(api.scores.getUserStats);
  const submitScore = useMutation(api.scores.submitScore);

  const handleGameOver = useCallback(
    async (score: number, wave: number, kills: number) => {
      setCurrentScore(score);
      setCurrentWave(wave);
      setCurrentKills(kills);
      setGameState("gameover");

      if (score > 0) {
        await submitScore({
          playerName,
          score,
          wave,
          kills,
        });
      }
    },
    [submitScore, playerName]
  );

  const handleStartGame = () => {
    setCurrentScore(0);
    setCurrentWave(1);
    setCurrentKills(0);
    setGameState("playing");
  };

  return (
    <div className="min-h-screen relative">
      <AnimatePresence mode="wait">
        {gameState === "menu" && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
          >
            {/* Header */}
            <header className="p-3 md:p-4 flex justify-between items-center border-b border-cyan-500/20 bg-[#0a0a0f]/80 backdrop-blur-sm">
              <h1 className="text-lg md:text-2xl font-black tracking-tighter">
                <span className="text-cyan-400">SPACE</span>
                <span className="text-white">INVADERS</span>
              </h1>
              <button
                onClick={() => signOut()}
                className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-mono bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
              >
                LOGOUT
              </button>
            </header>

            {/* Main content */}
            <div className="flex-1 p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 pb-16">
              {/* Left side - Play section */}
              <div className="flex flex-col gap-4 md:gap-6">
                {/* Stats Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-4 md:p-6"
                >
                  <h2 className="text-[10px] md:text-xs text-cyan-400/60 font-mono tracking-wider mb-3 md:mb-4">
                    PILOT STATISTICS
                  </h2>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="bg-white/5 rounded-lg p-3 md:p-4">
                      <p className="text-[10px] md:text-xs text-white/40 font-mono">GAMES</p>
                      <p className="text-xl md:text-3xl font-black text-white">
                        {stats?.totalGamesPlayed ?? 0}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 md:p-4">
                      <p className="text-[10px] md:text-xs text-white/40 font-mono">TOTAL SCORE</p>
                      <p className="text-xl md:text-3xl font-black text-cyan-400">
                        {stats?.totalScore?.toLocaleString() ?? 0}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 md:p-4">
                      <p className="text-[10px] md:text-xs text-white/40 font-mono">BEST WAVE</p>
                      <p className="text-xl md:text-3xl font-black text-purple-400">
                        {stats?.highestWave ?? 0}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 md:p-4">
                      <p className="text-[10px] md:text-xs text-white/40 font-mono">TOTAL KILLS</p>
                      <p className="text-xl md:text-3xl font-black text-pink-400">
                        {stats?.totalKills ?? 0}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Name input */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-5"
                >
                  <label className="block text-[10px] md:text-xs text-cyan-400/60 font-mono tracking-wider mb-2">
                    PILOT CALLSIGN
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value.toUpperCase().slice(0, 12))}
                    className="w-full px-4 py-3 bg-black/50 border border-cyan-500/20 rounded-lg text-white font-mono text-sm md:text-base focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all"
                    placeholder="ENTER CALLSIGN"
                  />
                </motion.div>

                {/* Play button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartGame}
                  className="w-full py-4 md:py-6 rounded-xl font-black text-lg md:text-2xl tracking-wider bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white shadow-[0_0_40px_rgba(0,255,255,0.4)] hover:shadow-[0_0_60px_rgba(0,255,255,0.6)] transition-all relative overflow-hidden group"
                >
                  <span className="relative z-10">▶ LAUNCH MISSION</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>

                {/* Controls info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center text-[10px] md:text-xs text-white/30 font-mono space-y-1"
                >
                  <p>DESKTOP: ← → TO MOVE • SPACE TO FIRE</p>
                  <p>MOBILE: SWIPE TO MOVE • TAP TO FIRE</p>
                </motion.div>
              </div>

              {/* Right side - Leaderboard */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Leaderboard />
              </motion.div>
            </div>
          </motion.div>
        )}

        {gameState === "playing" && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black"
          >
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-cyan-400 font-mono animate-pulse">LOADING GAME...</div>
                </div>
              }
            >
              <SpaceGame onGameOver={handleGameOver} onQuit={() => setGameState("menu")} />
            </Suspense>
          </motion.div>
        )}

        {gameState === "gameover" && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-red-500/20 rounded-full blur-[100px] md:blur-[150px]"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>

            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="w-full max-w-md bg-[#0d0d15]/95 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 md:p-8 shadow-[0_0_80px_rgba(255,0,0,0.2)] relative z-10"
            >
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-5xl font-black text-center mb-6 md:mb-8"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
                  MISSION FAILED
                </span>
              </motion.h2>

              <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
                <div className="text-center">
                  <p className="text-xs md:text-sm text-white/40 font-mono mb-1">FINAL SCORE</p>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="text-4xl md:text-6xl font-black text-cyan-400"
                  >
                    {currentScore.toLocaleString()}
                  </motion.p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3 md:p-4 text-center">
                    <p className="text-[10px] md:text-xs text-white/40 font-mono">WAVE</p>
                    <p className="text-xl md:text-3xl font-black text-purple-400">{currentWave}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 md:p-4 text-center">
                    <p className="text-[10px] md:text-xs text-white/40 font-mono">KILLS</p>
                    <p className="text-xl md:text-3xl font-black text-pink-400">{currentKills}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartGame}
                  className="w-full py-3 md:py-4 rounded-lg font-bold text-sm md:text-base tracking-wider bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-[0_0_30px_rgba(0,255,255,0.3)] hover:shadow-[0_0_40px_rgba(0,255,255,0.5)] transition-all"
                >
                  ↻ TRY AGAIN
                </motion.button>
                <button
                  onClick={() => setGameState("menu")}
                  className="w-full py-3 md:py-4 rounded-lg font-mono text-xs md:text-sm tracking-wider bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all"
                >
                  RETURN TO BASE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
