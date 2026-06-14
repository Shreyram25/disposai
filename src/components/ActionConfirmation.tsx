import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Package, 
  HelpCircle, 
  SkipForward,
  CheckCircle,
  ThumbsUp,
  AlertCircle,
  Trophy,
  Sparkles,
  Fish,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore, ScanRecord } from '@/store/gameStore';
import { calculatePointsForDisposal } from '@/services/openai';
import { cn } from '@/lib/utils';

interface ActionConfirmationProps {
  scanId: string;
  recommendedMethod: string;
  environmentalImpact?: 'low' | 'medium' | 'high' | 'critical';
  medicineName?: string;
  remainingMedicinesCount?: number;
  isAntibiotic?: boolean;
  isControlled?: boolean;
  expectedFishType?: string;
  onComplete: () => void;
}

type ActionType = 'take-back' | 'sealed-disposal' | 'other' | 'skipped';

const actions = [
  {
    id: 'take-back' as ActionType,
    label: 'Hospital Take-Back',
    description: 'Returned to DHA hospital (Clean Your Medicine Cabinet Drive)',
    icon: Building2,
    points: 0, // Will be calculated by GPT
  },
  {
    id: 'sealed-disposal' as ActionType,
    label: 'Household Disposal',
    description: 'Mixed with coffee grounds/cat litter, sealed, and disposed in trash',
    icon: Package,
    points: 0, // Will be calculated by GPT
  },
  {
    id: 'other' as ActionType,
    label: 'Other Method',
    description: 'Used a different disposal method',
    icon: HelpCircle,
    points: 0, // Will be calculated by GPT
  },
  {
    id: 'skipped' as ActionType,
    label: 'Not Yet',
    description: "I'll dispose of it later",
    icon: SkipForward,
    points: 0,
  },
];

const ActionConfirmation = ({ scanId, recommendedMethod, environmentalImpact, medicineName, remainingMedicinesCount, isAntibiotic, isControlled, expectedFishType, onComplete }: ActionConfirmationProps) => {
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quality, setQuality] = useState<'great' | 'okay' | 'risky' | null>(null);
  const [calculatedPoints, setCalculatedPoints] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const { updateScanAction, fish } = useGameStore();

  // Order actions by priority - recommended method first
  const isRecommendedTakeBack = recommendedMethod.toLowerCase().includes('hospital') || recommendedMethod.toLowerCase().includes('take-back');
  const isRecommendedHousehold = recommendedMethod.toLowerCase().includes('household') || recommendedMethod.toLowerCase().includes('coffee') || recommendedMethod.toLowerCase().includes('disposal');
  
  const orderedActions = useMemo(() => {
    if (isRecommendedTakeBack) {
      return [
        ...actions.filter(a => a.id === 'take-back'),
        ...actions.filter(a => a.id !== 'take-back' && a.id !== 'skipped'),
        actions.find(a => a.id === 'skipped')!
      ].filter(Boolean);
    } else if (isRecommendedHousehold) {
      return [
        ...actions.filter(a => a.id === 'sealed-disposal'),
        ...actions.filter(a => a.id !== 'sealed-disposal' && a.id !== 'skipped'),
        actions.find(a => a.id === 'skipped')!
      ].filter(Boolean);
    }
    return actions;
  }, [isRecommendedTakeBack, isRecommendedHousehold]);

  const handleConfirm = async () => {
    if (!selectedAction) return;

    setIsCalculating(true);

    // Determine quality based on action vs recommendation
    let actionQuality: 'great' | 'okay' | 'risky' = 'okay';
    
    if (selectedAction === 'take-back' || selectedAction === 'sealed-disposal') {
      // Check if action matches recommendation
      const isRecommended = recommendedMethod.toLowerCase().includes(selectedAction === 'take-back' ? 'hospital' : 'household') ||
                            recommendedMethod.toLowerCase().includes(selectedAction === 'take-back' ? 'take-back' : 'disposal');
      actionQuality = isRecommended ? 'great' : 'okay';
    } else if (selectedAction === 'other') {
      actionQuality = 'risky';
    } else if (selectedAction === 'skipped') {
      actionQuality = 'risky';
    }

    // Calculate points using GPT
    let points = 0;
    if (selectedAction !== 'skipped' && environmentalImpact) {
      try {
        points = await calculatePointsForDisposal(
          selectedAction,
          environmentalImpact,
          isAntibiotic || false,
          isControlled || false,
          recommendedMethod
        );
        setCalculatedPoints(points);
      } catch (error) {
        console.error('Failed to calculate points:', error);
        // Fallback points
        if (actionQuality === 'great') points = 50;
        else if (actionQuality === 'okay') points = 25;
        else points = 10;
        setCalculatedPoints(points);
      }
    }

    setQuality(actionQuality);
    // Update scan action with calculated points and expected fish type
    updateScanAction(scanId, selectedAction, actionQuality, environmentalImpact, medicineName, points, expectedFishType);
    setIsCalculating(false);
    setShowResult(true);
  };

  const selectedActionData = actions.find(a => a.id === selectedAction);

  if (showResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-card rounded-3xl shadow-elevated p-8 text-center">
          {/* Result Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            className={cn(
              'mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6',
              quality === 'great' ? 'bg-success/10' : 
              quality === 'okay' ? 'bg-primary/10' : 
              'bg-warning/10'
            )}
          >
            {quality === 'great' ? (
              <Trophy className="h-10 w-10 text-success" />
            ) : quality === 'okay' ? (
              <ThumbsUp className="h-10 w-10 text-primary" />
            ) : (
              <AlertCircle className="h-10 w-10 text-warning" />
            )}
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold mb-2"
          >
            {quality === 'great' ? 'Excellent Work!' : 
             quality === 'okay' ? 'Good Job!' : 
             'Keep Trying!'}
          </motion.h2>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mb-6"
          >
            {quality === 'great' 
              ? "You've protected waterways and contributed to a cleaner environment!"
              : quality === 'okay'
              ? "Your disposal was safe. Consider pharmacy take-back next time for maximum impact."
              : "Every step counts! Try using an authorized disposal method next time."}
          </motion.p>

          {/* Points Earned */}
          {selectedAction !== 'skipped' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 mb-6"
            >
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold text-primary">
                  +{calculatedPoints !== null ? calculatedPoints : 0} Eco Points
                </span>
              </div>
            </motion.div>
          )}

          {/* Fish Earned */}
          <AnimatePresence>
            {fish.length > 0 && quality === 'great' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-water-light/20 rounded-2xl p-4 mb-6"
              >
                <div className="flex items-center justify-center gap-2">
                  <Fish className="h-5 w-5 text-water-dark" />
                  <span className="text-sm font-medium">
                    New fish added to your aquarium!
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            variant="ocean" 
            size="lg" 
            className="w-full"
            onClick={onComplete}
          >
            {remainingMedicinesCount && remainingMedicinesCount > 0 
              ? `Continue to Next Medicine (${remainingMedicinesCount} remaining)`
              : 'Continue to Dashboard'}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-card rounded-3xl shadow-elevated p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold">How did you dispose of it?</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tell us what action you took
          </p>
        </div>

        {/* Action Options */}
        <div className="space-y-3 mb-6">
          {actions.map((action) => (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedAction(action.id)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
                selectedAction === action.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30 bg-muted/30'
              )}
            >
              <div className={cn(
                'p-2 rounded-xl',
                selectedAction === action.id ? 'bg-primary/10' : 'bg-muted'
              )}>
                <action.icon className={cn(
                  'h-5 w-5',
                  selectedAction === action.id ? 'text-primary' : 'text-muted-foreground'
                )} />
              </div>
              <div className="flex-1">
                <p className="font-medium">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </motion.button>
          ))}
        </div>

        <Button
          variant="ocean"
          size="lg"
          className="w-full"
          disabled={!selectedAction || isCalculating}
          onClick={handleConfirm}
        >
          {isCalculating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Calculating Points...
            </>
          ) : (
            'Confirm Action'
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default ActionConfirmation;
