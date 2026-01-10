import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Scan, 
  Droplets, 
  Leaf, 
  Trophy, 
  TrendingUp,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Aquarium from '@/components/Aquarium';
import StatsCard from '@/components/StatsCard';
import AchievementBadge from '@/components/AchievementBadge';
import { useGameStore } from '@/store/gameStore';

const Index = () => {
  const { totalPoints, totalDisposals, currentStreak, achievements, getStats } = useGameStore();
  const stats = getStats();
  const unlockedAchievements = achievements.filter(a => a.unlockedAt);

  return (
    <div className="min-h-screen pb-24 md:pt-20">
      {/* Hero Section */}
      <section className="ocean-gradient px-4 pt-12 pb-16 md:pt-16">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">DisposAI</h1>
            <p className="text-white/80 text-sm">Scan. Decide. Dispose responsibly.</p>
          </motion.div>

          {/* Fish Bowl */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <Aquarium size="lg" showStats={false} />
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="px-4 -mt-8">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-3 gap-3">
            <StatsCard
              title="Eco Points"
              value={totalPoints}
              icon={Sparkles}
              color="primary"
              delay={0.3}
            />
            <StatsCard
              title="Disposed"
              value={totalDisposals}
              icon={Leaf}
              color="success"
              delay={0.4}
            />
            <StatsCard
              title="Streak"
              value={`${currentStreak}🔥`}
              icon={TrendingUp}
              color="warning"
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* Scan CTA */}
      <section className="px-4 mt-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link to="/scan">
              <Button variant="ocean" size="xl" className="w-full">
                <Scan className="h-6 w-6" />
                Scan Medicine
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="px-4 mt-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card rounded-2xl p-5"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Droplets className="h-5 w-5 text-primary" />
              Your Environmental Impact
            </h3>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{stats.waterSaved.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Liters Protected</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{stats.estimatedPollutionPrevented.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">kg Pollution Prevented</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">{stats.co2Reduced.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">kg CO₂ Reduced</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Achievements */}
      <section className="px-4 mt-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-warning" />
                Achievements
              </h3>
              <span className="text-sm text-muted-foreground">
                {unlockedAchievements.length}/{achievements.length}
              </span>
            </div>

            <div className="glass-card rounded-2xl p-4">
              <div className="flex gap-4 overflow-x-auto pb-2">
                {achievements.slice(0, 5).map((achievement) => (
                  <AchievementBadge 
                    key={achievement.id} 
                    achievement={achievement} 
                    size="sm" 
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="px-4 mt-8">
        <div className="max-w-md mx-auto space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Link 
              to="/history"
              className="glass-card rounded-2xl p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Leaf className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">View Disposal History</p>
                  <p className="text-xs text-muted-foreground">See all your past scans</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-4 mt-8 mb-4">
        <div className="max-w-md mx-auto">
          <p className="text-xs text-center text-muted-foreground px-4">
            DisposAI provides general guidance only. Follow local regulations and 
            pharmacy instructions. When in doubt, use take-back programs.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
