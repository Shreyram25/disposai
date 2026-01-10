import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';

interface FishBowlProps {
  size?: 'sm' | 'md' | 'lg';
  showStats?: boolean;
}

const fishColors: Record<string, string> = {
  goldfish: '#FFB347',
  clownfish: '#FF6B35',
  angelfish: '#87CEEB',
  betta: '#9B59B6',
  guppy: '#2ECC71',
  tetra: '#3498DB',
};

const FishBowl = ({ size = 'md', showStats = true }: FishBowlProps) => {
  const { fish, waterClarity, totalPoints, currentStreak } = useGameStore();

  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  };

  const waterOpacity = 0.3 + (waterClarity / 100) * 0.4;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Fish Bowl */}
      <div className={cn('relative', sizeClasses[size])}>
        {/* Bowl shape */}
        <div className="absolute inset-0 rounded-[40%_40%_45%_45%] border-4 border-white/30 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm overflow-hidden">
          {/* Water */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-b-[40%]"
            style={{
              height: '75%',
              background: `linear-gradient(180deg, 
                hsla(195, 80%, 60%, ${waterOpacity}) 0%, 
                hsla(200, 70%, 45%, ${waterOpacity + 0.1}) 100%)`,
            }}
            animate={{ scaleX: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Water surface wave */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-2"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
              }}
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          {/* Sand */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-[15%] rounded-b-[40%]"
            style={{
              background: 'linear-gradient(180deg, hsl(35, 50%, 65%) 0%, hsl(35, 45%, 55%) 100%)',
            }}
          >
            {/* Pebbles */}
            <div className="absolute bottom-1 left-[20%] w-2 h-1.5 rounded-full bg-stone-400/60" />
            <div className="absolute bottom-1.5 left-[50%] w-1.5 h-1 rounded-full bg-stone-500/50" />
            <div className="absolute bottom-1 left-[70%] w-2 h-1 rounded-full bg-stone-400/40" />
          </div>

          {/* Bubbles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-white/40"
              style={{ left: `${30 + i * 20}%`, bottom: '20%' }}
              animate={{
                y: [-10, -50],
                opacity: [0.6, 0],
                scale: [1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.7,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Fish */}
          <AnimatePresence>
            {fish.map((f, index) => (
              <motion.div
                key={f.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute"
                style={{
                  left: `${20 + (index % 3) * 25}%`,
                  bottom: `${25 + Math.floor(index / 3) * 15}%`,
                }}
              >
                <motion.div
                  animate={{
                    x: [0, 15, 0, -15, 0],
                    y: [0, -5, 0, 5, 0],
                    rotateY: [0, 0, 180, 180, 0],
                  }}
                  transition={{
                    duration: 4 + index,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <svg
                    width={size === 'lg' ? 24 : size === 'md' ? 18 : 14}
                    height={size === 'lg' ? 16 : size === 'md' ? 12 : 10}
                    viewBox="0 0 24 16"
                  >
                    <ellipse
                      cx="12"
                      cy="8"
                      rx="8"
                      ry="5"
                      fill={fishColors[f.type]}
                    />
                    <polygon
                      points="20,8 24,4 24,12"
                      fill={fishColors[f.type]}
                    />
                    <circle cx="8" cy="7" r="1.5" fill="white" />
                    <circle cx="8" cy="7" r="0.8" fill="#333" />
                  </svg>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Seaweed decorations */}
          <motion.div
            className="absolute bottom-[15%] left-[15%] w-1 h-8 rounded-full"
            style={{ background: 'linear-gradient(180deg, #2ECC71 0%, #27AE60 100%)' }}
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-[15%] right-[20%] w-1 h-6 rounded-full"
            style={{ background: 'linear-gradient(180deg, #27AE60 0%, #1E8449 100%)' }}
            animate={{ rotate: [5, -5, 5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
        </div>

        {/* Glass reflection */}
        <div className="absolute top-2 left-3 w-1/3 h-1/4 rounded-full bg-white/20 blur-sm" />
      </div>

      {/* Stats */}
      {showStats && (
        <div className="flex gap-4 text-center">
          <div className="glass-card px-3 py-2 rounded-xl">
            <p className="text-xs text-muted-foreground">Fish</p>
            <p className="text-lg font-bold text-primary">{fish.length}</p>
          </div>
          <div className="glass-card px-3 py-2 rounded-xl">
            <p className="text-xs text-muted-foreground">Points</p>
            <p className="text-lg font-bold text-primary">{totalPoints}</p>
          </div>
          <div className="glass-card px-3 py-2 rounded-xl">
            <p className="text-xs text-muted-foreground">Streak</p>
            <p className="text-lg font-bold text-accent">{currentStreak}🔥</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FishBowl;
