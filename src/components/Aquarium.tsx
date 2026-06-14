import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, FishType } from '@/store/gameStore';
import { cn } from '@/lib/utils';

interface AquariumProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStats?: boolean;
}

const fishColors: Record<FishType, string> = {
  mackerel: '#4A90E2',
  sardine: '#7B8FA1',
  anchovy: '#95A5A6',
  guppy: '#2ECC71',
  tetra: '#3498DB',
  goldfish: '#FFB347',
  clownfish: '#FF6B35',
  angelfish: '#87CEEB',
  betta: '#9B59B6',
  salmon: '#FF6B6B',
  tuna: '#4ECDC4',
  shark: '#34495E',
  whale: '#2C3E50',
};

const fishSizes: Record<FishType, { width: number; height: number }> = {
  mackerel: { width: 40, height: 20 },
  sardine: { width: 35, height: 18 },
  anchovy: { width: 30, height: 15 },
  guppy: { width: 45, height: 30 },
  tetra: { width: 45, height: 30 },
  goldfish: { width: 60, height: 40 },
  clownfish: { width: 55, height: 35 },
  angelfish: { width: 65, height: 45 },
  betta: { width: 60, height: 40 },
  salmon: { width: 80, height: 50 },
  tuna: { width: 100, height: 60 },
  shark: { width: 120, height: 75 },
  whale: { width: 150, height: 90 },
};

// Get real fish images - using Unsplash with specific search terms
// Get fish emoji based on type
const getFishEmoji = (fishType: FishType): string => {
  const emojiMap: Record<FishType, string> = {
    mackerel: '🐟',
    sardine: '🐟',
    anchovy: '🐟',
    guppy: '🐠',
    tetra: '🐠',
    goldfish: '🐠',
    clownfish: '🐠',
    angelfish: '🐠',
    betta: '🐠',
    salmon: '🐟',
    tuna: '🐟',
    shark: '🦈',
    whale: '🐋',
  };
  return emojiMap[fishType] || '🐟';
};

// Get fish images - using emoji as visual representation with colored background
// In production, replace with actual fish stock images from a CDN
const getFishImageUrl = (fishType: FishType): string => {
  // Return empty to trigger emoji fallback for now
  // TODO: Replace with actual fish stock images from CDN
  return '';
};

const Aquarium = ({ size = 'lg', showStats = true }: AquariumProps) => {
  const { fish, waterClarity, totalPoints, currentStreak } = useGameStore();

  const sizeClasses = {
    sm: 'w-64 h-48',
    md: 'w-96 h-64',
    lg: 'w-[600px] h-[400px]',
    xl: 'w-[800px] h-[500px]',
  };

  const waterOpacity = 0.3 + (waterClarity / 100) * 0.4;

  // Calculate grid positions for better fish distribution
  const getFishPosition = (index: number, total: number) => {
    const cols = Math.ceil(Math.sqrt(total * 1.5));
    const row = Math.floor(index / cols);
    const col = index % cols;
    const spacingX = 100 / (cols + 1);
    const spacingY = 60 / (Math.ceil(total / cols) + 1);
    
    return {
      left: `${spacingX * (col + 1)}%`,
      bottom: `${15 + spacingY * (row + 1)}%`,
    };
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Aquarium */}
      <div className={cn('relative', sizeClasses[size])}>
        {/* Aquarium tank */}
        <div className="absolute inset-0 rounded-2xl border-4 border-white/30 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm overflow-hidden shadow-2xl">
          {/* Water */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-b-2xl"
            style={{
              height: '80%',
              background: `linear-gradient(180deg, 
                hsla(195, 80%, 60%, ${waterOpacity}) 0%, 
                hsla(200, 70%, 45%, ${waterOpacity + 0.1}) 100%)`,
            }}
            animate={{ scaleX: [1, 1.01, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Water surface wave */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-3"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
              }}
              animate={{ x: [0, 20, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          {/* Sand/Substrate */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-[20%] rounded-b-2xl"
            style={{
              background: 'linear-gradient(180deg, hsl(35, 50%, 65%) 0%, hsl(35, 45%, 55%) 100%)',
            }}
          >
            {/* Decorative pebbles and shells */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${10 + i * 12}%`,
                  bottom: `${2 + (i % 2) * 3}%`,
                  width: `${4 + (i % 3)}px`,
                  height: `${4 + (i % 3)}px`,
                  background: i % 2 === 0 ? 'rgba(139, 69, 19, 0.6)' : 'rgba(255, 255, 255, 0.4)',
                }}
                animate={{
                  y: [0, -2, 0],
                  opacity: [0.6, 0.8, 0.6],
                }}
                transition={{
                  duration: 2 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>

          {/* Bubbles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/40"
              style={{ 
                left: `${15 + i * 15}%`, 
                bottom: '25%',
                width: `${4 + (i % 3)}px`,
                height: `${4 + (i % 3)}px`,
              }}
              animate={{
                y: [-20, -100],
                opacity: [0.6, 0],
                scale: [1, 0.3],
                x: [0, (i % 2 === 0 ? 1 : -1) * 10],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Seaweed/Plants */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bottom-[20%] rounded-full"
              style={{
                left: `${10 + i * 20}%`,
                width: '3px',
                height: `${30 + (i % 3) * 10}px`,
                background: `linear-gradient(180deg, #2ECC71 0%, #27AE60 100%)`,
              }}
              animate={{ 
                rotate: [-8 + (i % 3) * 2, 8 - (i % 3) * 2, -8 + (i % 3) * 2],
              }}
              transition={{ 
                duration: 2 + i * 0.3, 
                repeat: Infinity, 
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
            />
          ))}

          {/* Fish */}
          <AnimatePresence>
            {fish.map((f, index) => {
              const position = getFishPosition(index, fish.length);
              const fishSize = fishSizes[f.type];
              const baseSize = size === 'xl' ? 1.2 : size === 'lg' ? 1 : size === 'md' ? 0.8 : 0.6;
              
              return (
                <motion.div
                  key={f.id}
                  initial={{ scale: 0, opacity: 0, x: -20 }}
                  animate={{ scale: 1, opacity: 1, x: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute"
                  style={{
                    left: position.left,
                    bottom: position.bottom,
                  }}
                >
                  <motion.div
                    animate={{
                      x: [0, 30, 0, -30, 0],
                      y: [0, -10, 0, 10, 0],
                      scaleX: [1, -1, 1, -1, 1],
                    }}
                    transition={{
                      duration: 5 + index * 0.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    title={f.name + (f.medicineName ? ` - Saved by ${f.medicineName}` : '')}
                    className="drop-shadow-lg"
                  >
                    <div
                      className="relative"
                      style={{
                        width: `${fishSize.width * baseSize}px`,
                        height: `${fishSize.height * baseSize}px`,
                      }}
                    >
                      <img
                        src={getFishImageUrl(f.type)}
                        alt={f.type}
                        className="w-full h-full object-contain"
                        style={{
                          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                        }}
                        onError={(e) => {
                          // Show emoji fish with colored background
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.fish-fallback')) {
                            const fallback = document.createElement('div');
                            fallback.className = 'fish-fallback rounded-full flex items-center justify-center';
                            fallback.style.width = `${fishSize.width * baseSize}px`;
                            fallback.style.height = `${fishSize.height * baseSize}px`;
                            fallback.style.backgroundColor = fishColors[f.type];
                            fallback.style.opacity = '0.9';
                            fallback.style.fontSize = `${Math.max(20, fishSize.width * baseSize * 0.6)}px`;
                            fallback.style.filter = 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))';
                            fallback.textContent = getFishEmoji(f.type);
                            parent.appendChild(fallback);
                          }
                        }}
                        onLoad={(e) => {
                          // If image loads, hide any fallback
                          const parent = (e.target as HTMLImageElement).parentElement;
                          const fallback = parent?.querySelector('.fish-fallback');
                          if (fallback) fallback.remove();
                        }}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Glass reflection */}
          <div className="absolute top-4 left-6 w-1/3 h-1/4 rounded-full bg-white/20 blur-md" />
          <div className="absolute top-2 right-8 w-1/4 h-1/5 rounded-full bg-white/15 blur-sm" />
        </div>
      </div>

      {/* Stats */}
      {showStats && (
        <div className="flex gap-4 text-center">
          <div className="glass-card px-4 py-3 rounded-xl">
            <p className="text-xs text-muted-foreground">Fish Saved</p>
            <p className="text-xl font-bold text-primary">{fish.length}</p>
          </div>
          <div className="glass-card px-4 py-3 rounded-xl">
            <p className="text-xs text-muted-foreground">Points</p>
            <p className="text-xl font-bold text-primary">{totalPoints}</p>
          </div>
          <div className="glass-card px-4 py-3 rounded-xl">
            <p className="text-xs text-muted-foreground">Streak</p>
            <p className="text-xl font-bold text-accent">{currentStreak}🔥</p>
          </div>
          <div className="glass-card px-4 py-3 rounded-xl">
            <p className="text-xs text-muted-foreground">Water Quality</p>
            <p className="text-xl font-bold text-primary">{waterClarity}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aquarium;

