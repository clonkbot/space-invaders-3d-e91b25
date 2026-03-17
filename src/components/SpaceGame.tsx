import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Text } from "@react-three/drei";
import * as THREE from "three";

interface GameProps {
  onGameOver: (score: number, wave: number, kills: number) => void;
  onQuit: () => void;
}

interface Invader {
  id: number;
  x: number;
  y: number;
  health: number;
  type: number;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  isEnemy: boolean;
}

interface GameState {
  playerX: number;
  invaders: Invader[];
  bullets: Bullet[];
  score: number;
  wave: number;
  kills: number;
  lives: number;
  gameOver: boolean;
  invaderDirection: number;
  lastEnemyShot: number;
}

function PlayerShip({ x }: { x: number }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x = x;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });

  return (
    <group ref={meshRef} position={[0, -4, 0]}>
      {/* Main body */}
      <mesh>
        <boxGeometry args={[0.6, 0.3, 0.2]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
      </mesh>
      {/* Cockpit */}
      <mesh position={[0, 0.2, 0]}>
        <coneGeometry args={[0.15, 0.4, 4]} />
        <meshStandardMaterial color="#ffffff" emissive="#00ffff" emissiveIntensity={0.3} />
      </mesh>
      {/* Wings */}
      <mesh position={[-0.4, -0.05, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.4, 0.1, 0.15]} />
        <meshStandardMaterial color="#0088aa" emissive="#00ffff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.4, -0.05, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.4, 0.1, 0.15]} />
        <meshStandardMaterial color="#0088aa" emissive="#00ffff" emissiveIntensity={0.3} />
      </mesh>
      {/* Engines */}
      <mesh position={[-0.2, -0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.05, 0.2, 8]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.2, -0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.05, 0.2, 8]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={2} />
      </mesh>
      {/* Engine glow */}
      <pointLight position={[0, -0.3, 0]} color="#ff6600" intensity={1} distance={2} />
    </group>
  );
}

function InvaderShip({ invader }: { invader: Invader }) {
  const meshRef = useRef<THREE.Group>(null);
  const colors = ["#ff0066", "#aa00ff", "#ff6600", "#00ff66"];
  const color = colors[invader.type % colors.length];

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x = invader.x;
      meshRef.current.position.y = invader.y;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2 + invader.id) * 0.2;
      meshRef.current.position.z = Math.sin(state.clock.elapsedTime * 3 + invader.id) * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Main body */}
      <mesh>
        <octahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      {/* Side pods */}
      <mesh position={[-0.3, 0, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.3, 0, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      {/* Eye */}
      <mesh position={[0, 0, 0.2]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
      </mesh>
      <pointLight position={[0, 0, 0.3]} color={color} intensity={0.5} distance={1.5} />
    </group>
  );
}

function BulletMesh({ bullet }: { bullet: Bullet }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x = bullet.x;
      meshRef.current.position.y = bullet.y;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshStandardMaterial
        color={bullet.isEnemy ? "#ff0066" : "#00ffff"}
        emissive={bullet.isEnemy ? "#ff0066" : "#00ffff"}
        emissiveIntensity={2}
      />
    </mesh>
  );
}

function GameScene({
  gameState,
  setGameState,
}: {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}) {
  const { viewport } = useThree();
  const lastUpdateRef = useRef(0);
  const bulletIdRef = useRef(0);

  // Calculate bounds based on viewport
  const bounds = useMemo(() => ({
    left: -viewport.width / 2 + 0.5,
    right: viewport.width / 2 - 0.5,
    top: viewport.height / 2 - 1,
    bottom: -viewport.height / 2 + 1,
  }), [viewport]);

  useFrame((state) => {
    if (gameState.gameOver) return;

    const delta = state.clock.elapsedTime - lastUpdateRef.current;
    if (delta < 0.016) return; // ~60fps cap
    lastUpdateRef.current = state.clock.elapsedTime;

    setGameState((prev) => {
      if (prev.gameOver) return prev;

      let { invaders, bullets, invaderDirection, score, kills, lives, wave } = prev;
      const newBullets: Bullet[] = [];

      // Move bullets
      bullets = bullets
        .map((b) => ({
          ...b,
          y: b.y + (b.isEnemy ? -0.15 : 0.2),
        }))
        .filter((b) => b.y > bounds.bottom - 1 && b.y < bounds.top + 1);

      // Move invaders
      let shouldDescend = false;
      let newDirection = invaderDirection;

      for (const inv of invaders) {
        if (
          (invaderDirection > 0 && inv.x > bounds.right - 0.5) ||
          (invaderDirection < 0 && inv.x < bounds.left + 0.5)
        ) {
          shouldDescend = true;
          newDirection = -invaderDirection;
          break;
        }
      }

      invaders = invaders.map((inv) => ({
        ...inv,
        x: inv.x + newDirection * 0.03,
        y: shouldDescend ? inv.y - 0.3 : inv.y,
      }));

      // Enemy shooting
      const now = state.clock.elapsedTime * 1000;
      if (now - prev.lastEnemyShot > Math.max(800 - wave * 50, 300) && invaders.length > 0) {
        const shooter = invaders[Math.floor(Math.random() * invaders.length)];
        newBullets.push({
          id: bulletIdRef.current++,
          x: shooter.x,
          y: shooter.y - 0.3,
          isEnemy: true,
        });
      }

      // Collision detection - player bullets vs invaders
      const remainingInvaders: Invader[] = [];
      let newScore = score;
      let newKills = kills;

      for (const inv of invaders) {
        let hit = false;
        for (let i = bullets.length - 1; i >= 0; i--) {
          const b = bullets[i];
          if (!b.isEnemy && Math.abs(b.x - inv.x) < 0.4 && Math.abs(b.y - inv.y) < 0.4) {
            hit = true;
            bullets.splice(i, 1);
            break;
          }
        }
        if (!hit) {
          remainingInvaders.push(inv);
        } else {
          newScore += 100 * wave;
          newKills++;
        }
      }

      // Collision detection - enemy bullets vs player
      let newLives = lives;
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        if (b.isEnemy && Math.abs(b.x - prev.playerX) < 0.5 && Math.abs(b.y - -4) < 0.4) {
          bullets.splice(i, 1);
          newLives--;
          if (newLives <= 0) {
            return { ...prev, gameOver: true, score: newScore, kills: newKills };
          }
        }
      }

      // Check if invaders reached bottom
      for (const inv of remainingInvaders) {
        if (inv.y < -3) {
          return { ...prev, gameOver: true, score: newScore, kills: newKills };
        }
      }

      // Spawn new wave
      let newWave = wave;
      let newInvaders = remainingInvaders;
      if (remainingInvaders.length === 0) {
        newWave = wave + 1;
        newInvaders = [];
        const rows = Math.min(3 + Math.floor(newWave / 2), 6);
        const cols = Math.min(6 + Math.floor(newWave / 3), 10);
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            newInvaders.push({
              id: row * cols + col,
              x: (col - cols / 2 + 0.5) * 0.8,
              y: bounds.top - 1 - row * 0.6,
              health: 1,
              type: row,
            });
          }
        }
      }

      return {
        ...prev,
        invaders: newInvaders,
        bullets: [...bullets, ...newBullets],
        invaderDirection: newDirection,
        score: newScore,
        kills: newKills,
        lives: newLives,
        wave: newWave,
        lastEnemyShot: newBullets.length > 0 ? now : prev.lastEnemyShot,
      };
    });
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 5, 5]} intensity={1} />

      <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />

      <PlayerShip x={gameState.playerX} />

      {gameState.invaders.map((invader) => (
        <InvaderShip key={invader.id} invader={invader} />
      ))}

      {gameState.bullets.map((bullet) => (
        <BulletMesh key={bullet.id} bullet={bullet} />
      ))}
    </>
  );
}

export function SpaceGame({ onGameOver, onQuit }: GameProps) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState());
  const bulletIdRef = useRef(1000);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastShotRef = useRef(0);

  function createInitialState(): GameState {
    const invaders: Invader[] = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 8; col++) {
        invaders.push({
          id: row * 8 + col,
          x: (col - 3.5) * 0.8,
          y: 3 - row * 0.6,
          health: 1,
          type: row,
        });
      }
    }
    return {
      playerX: 0,
      invaders,
      bullets: [],
      score: 0,
      wave: 1,
      kills: 0,
      lives: 3,
      gameOver: false,
      invaderDirection: 1,
      lastEnemyShot: 0,
    };
  }

  const shoot = useCallback(() => {
    const now = Date.now();
    if (now - lastShotRef.current < 250) return;
    lastShotRef.current = now;

    setGameState((prev) => ({
      ...prev,
      bullets: [
        ...prev.bullets,
        {
          id: bulletIdRef.current++,
          x: prev.playerX,
          y: -3.5,
          isEnemy: false,
        },
      ],
    }));
  }, []);

  const movePlayer = useCallback((direction: number) => {
    setGameState((prev) => ({
      ...prev,
      playerX: Math.max(-5, Math.min(5, prev.playerX + direction * 0.3)),
    }));
  }, []);

  // Keyboard controls
  useEffect(() => {
    const keys = new Set<string>();
    let animationId: number;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onQuit();
        return;
      }
      keys.add(e.key);
      if (e.key === " ") {
        e.preventDefault();
        shoot();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.delete(e.key);
    };

    const gameLoop = () => {
      if (keys.has("ArrowLeft") || keys.has("a")) movePlayer(-1);
      if (keys.has("ArrowRight") || keys.has("d")) movePlayer(1);
      animationId = requestAnimationFrame(gameLoop);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    animationId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [movePlayer, shoot, onQuit]);

  // Touch controls
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      if (Math.abs(deltaX) > 10) {
        movePlayer(deltaX > 0 ? 1 : -1);
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      // If it was a tap (small movement), shoot
      if (deltaX < 20 && deltaY < 20) {
        shoot();
      }
      touchStartRef.current = null;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [movePlayer, shoot]);

  // Handle game over
  useEffect(() => {
    if (gameState.gameOver) {
      onGameOver(gameState.score, gameState.wave, gameState.kills);
    }
  }, [gameState.gameOver, gameState.score, gameState.wave, gameState.kills, onGameOver]);

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <color attach="background" args={["#000008"]} />
        <fog attach="fog" args={["#000008", 5, 30]} />
        <GameScene gameState={gameState} setGameState={setGameState} />
      </Canvas>

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-3 md:p-4 flex justify-between items-start pointer-events-none">
        <div className="space-y-1 md:space-y-2">
          <div className="text-xs md:text-sm text-white/60 font-mono">SCORE</div>
          <div className="text-xl md:text-3xl font-black text-cyan-400">{gameState.score.toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="text-xs md:text-sm text-white/60 font-mono">WAVE</div>
          <div className="text-xl md:text-3xl font-black text-purple-400">{gameState.wave}</div>
        </div>
        <div className="text-right">
          <div className="text-xs md:text-sm text-white/60 font-mono">LIVES</div>
          <div className="text-xl md:text-3xl font-black text-pink-400">
            {"❤️".repeat(Math.max(0, gameState.lives))}
          </div>
        </div>
      </div>

      {/* Quit button */}
      <button
        onClick={onQuit}
        className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white/60 text-xs md:text-sm font-mono hover:bg-white/20 hover:text-white transition-all"
      >
        ESC TO QUIT
      </button>

      {/* Mobile controls hint */}
      <div className="absolute bottom-14 md:bottom-16 left-1/2 -translate-x-1/2 text-[10px] md:text-xs text-white/30 font-mono md:hidden">
        SWIPE TO MOVE • TAP TO FIRE
      </div>
    </div>
  );
}
