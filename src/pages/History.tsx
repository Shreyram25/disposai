import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Filter,
  Search,
  ChevronRight,
  Leaf
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore, ScanRecord } from '@/store/gameStore';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const getQualityColor = (quality?: string) => {
  switch (quality) {
    case 'great': return 'bg-success/10 text-success';
    case 'okay': return 'bg-primary/10 text-primary';
    case 'risky': return 'bg-warning/10 text-warning';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getRatingBadge = (rating: string) => {
  const colors: Record<string, string> = {
    'A': 'bg-success text-white',
    'B': 'bg-primary text-white',
    'C': 'bg-warning text-white',
    'D': 'bg-orange-500 text-white',
    'E': 'bg-destructive text-white',
  };
  return colors[rating] || 'bg-muted text-muted-foreground';
};

const History = () => {
  const { scanHistory } = useGameStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = scanHistory.filter(scan => 
    scan.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scan.detectedText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen pb-24 md:pt-20 bg-gradient-to-b from-muted/30 to-background">
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Disposal History</h1>
            <p className="text-sm text-muted-foreground">
              {scanHistory.length} total scans
            </p>
          </div>
        </div>
      </header>

      {/* Search */}
      <section className="px-4 py-2">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* History List */}
      <main className="px-4 py-4">
        <div className="max-w-md mx-auto space-y-3">
          {filteredHistory.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Leaf className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No Scans Yet</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Start scanning medicines to build your eco-history
              </p>
              <Link to="/scan">
                <Button variant="ocean">
                  Scan Your First Medicine
                </Button>
              </Link>
            </motion.div>
          ) : (
            filteredHistory.map((scan, index) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card rounded-2xl p-4"
              >
                <div className="flex items-start gap-4">
                  {/* Image or Icon */}
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {scan.imageUrl ? (
                      <img 
                        src={scan.imageUrl} 
                        alt={scan.medicineName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Leaf className="h-6 w-6 text-primary" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold truncate">{scan.medicineName}</h3>
                        <p className="text-xs text-muted-foreground break-words line-clamp-2">
                          {scan.detectedText}
                        </p>
                      </div>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-bold shrink-0',
                        getRatingBadge(scan.safetyRating)
                      )}>
                        {scan.safetyRating}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(scan.timestamp)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(scan.timestamp)}
                      </span>
                    </div>

                    {/* Action taken */}
                    {scan.actionTaken && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className={cn(
                          'px-2 py-1 rounded-lg text-xs font-medium',
                          getQualityColor(scan.actionQuality)
                        )}>
                          {scan.actionQuality === 'great' ? '✓ Great' :
                           scan.actionQuality === 'okay' ? '○ Okay' : '! Risky'}
                        </span>
                        {scan.pointsEarned > 0 && (
                          <span className="text-xs text-primary font-medium">
                            +{scan.pointsEarned} pts
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default History;
