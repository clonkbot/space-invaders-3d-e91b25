import { useConvexAuth } from "convex/react";
import { AuthScreen } from "./components/AuthScreen";
import { GameScreen } from "./components/GameScreen";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            className="w-16 h-16 md:w-20 md:h-20 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-cyan-400 font-mono text-sm md:text-base tracking-wider">INITIALIZING SYSTEMS...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      <div className="scanlines" />
      <AnimatePresence mode="wait">
        {isAuthenticated ? (
          <motion.div
            key="game"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
          >
            <GameScreen />
          </motion.div>
        ) : (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <AuthScreen />
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 py-2 md:py-3 text-center z-50 bg-gradient-to-t from-[#0a0a0f] to-transparent">
      <p className="text-[10px] md:text-xs text-cyan-900/60 font-mono tracking-wide">
        Requested by <span className="text-cyan-700/60">@web-user</span> · Built by <span className="text-purple-700/60">@clonkbot</span>
      </p>
    </footer>
  );
}
