import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { motion } from "framer-motion";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] md:bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-cyan-500/10 rounded-full blur-[80px] md:blur-[120px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-purple-500/10 rounded-full blur-[80px] md:blur-[120px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-6 md:mb-8 relative z-10"
      >
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-2 md:mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
            SPACE
          </span>
          <br />
          <span className="text-white drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]">
            INVADERS
          </span>
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-cyan-400/60 font-mono text-xs md:text-sm tracking-[0.2em] md:tracking-[0.3em]"
        >
          DEFEND THE GALAXY • YEAR 2847
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-sm md:max-w-md relative z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl" />
        <div className="relative bg-[#0d0d15]/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,255,255,0.1)]">
          <div className="flex gap-2 mb-6 md:mb-8">
            <button
              onClick={() => setFlow("signIn")}
              className={`flex-1 py-2 md:py-3 rounded-lg font-mono text-xs md:text-sm tracking-wider transition-all duration-300 ${
                flow === "signIn"
                  ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-black shadow-[0_0_20px_rgba(0,255,255,0.4)]"
                  : "bg-white/5 text-cyan-400/60 hover:bg-white/10"
              }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => setFlow("signUp")}
              className={`flex-1 py-2 md:py-3 rounded-lg font-mono text-xs md:text-sm tracking-wider transition-all duration-300 ${
                flow === "signUp"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                  : "bg-white/5 text-purple-400/60 hover:bg-white/10"
              }`}
            >
              SIGN UP
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div>
              <label className="block text-[10px] md:text-xs text-cyan-400/60 font-mono tracking-wider mb-2">
                EMAIL ADDRESS
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 md:py-4 bg-white/5 border border-cyan-500/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all font-mono text-sm"
                placeholder="pilot@starfleet.com"
              />
            </div>
            <div>
              <label className="block text-[10px] md:text-xs text-cyan-400/60 font-mono tracking-wider mb-2">
                PASSWORD
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 md:py-4 bg-white/5 border border-cyan-500/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all font-mono text-sm"
                placeholder="••••••••"
              />
            </div>
            <input name="flow" type="hidden" value={flow} />

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-xs md:text-sm font-mono text-center"
              >
                ⚠ {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 md:py-4 rounded-lg font-bold tracking-wider text-sm md:text-base transition-all duration-300 ${
                flow === "signIn"
                  ? "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black shadow-[0_0_30px_rgba(0,255,255,0.3)] hover:shadow-[0_0_40px_rgba(0,255,255,0.5)]"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                  />
                  AUTHENTICATING...
                </span>
              ) : flow === "signIn" ? (
                "LAUNCH MISSION →"
              ) : (
                "ENLIST PILOT →"
              )}
            </button>
          </form>

          <div className="mt-5 md:mt-6 pt-5 md:pt-6 border-t border-white/10">
            <button
              onClick={() => signIn("anonymous")}
              className="w-full py-3 md:py-4 rounded-lg font-mono text-xs md:text-sm tracking-wider bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all duration-300"
            >
              CONTINUE AS GUEST PILOT
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 md:mt-8 text-center relative z-10"
      >
        <p className="text-[10px] md:text-xs text-white/30 font-mono">
          USE ARROW KEYS OR SWIPE TO MOVE • SPACE OR TAP TO FIRE
        </p>
      </motion.div>
    </div>
  );
}
