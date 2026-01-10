import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Achievement } from '@/store/gameStore';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
}

const AchievementBadge = ({ achievement, size = 'md' }: AchievementBadgeProps) => {
  const isUnlocked = !!achievement.unlockedAt;

  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center gap-2"
    >
      <div
        className={cn(
          'rounded-2xl flex items-center justify-center relative',
          sizeClasses[size],
          isUnlocked
            ? 'bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30'
            : 'bg-muted border-2 border-border'
        )}
      >
        {isUnlocked ? (
          <span>{achievement.icon}</span>
        ) : (
          <Lock className="h-5 w-5 text-muted-foreground" />
        )}
        
        {isUnlocked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center"
          >
            <span className="text-xs">✓</span>
          </motion.div>
        )}
      </div>
      
      <div className="text-center">
        <p className={cn(
          'text-xs font-medium',
          isUnlocked ? 'text-foreground' : 'text-muted-foreground'
        )}>
          {achievement.title}
        </p>
        {size !== 'sm' && (
          <p className="text-[10px] text-muted-foreground max-w-[80px]">
            {achievement.description}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default AchievementBadge;
