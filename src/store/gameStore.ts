import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FishType = 
  | 'mackerel'      // Small impact
  | 'sardine'       // Small impact
  | 'anchovy'       // Small impact
  | 'guppy'         // Small-medium impact
  | 'tetra'         // Small-medium impact
  | 'goldfish'      // Medium impact
  | 'clownfish'     // Medium impact
  | 'angelfish'     // Medium-high impact
  | 'betta'         // Medium-high impact
  | 'salmon'        // High impact
  | 'tuna'          // Very high impact
  | 'shark'         // Critical impact
  | 'whale'         // Maximum impact;

export interface Fish {
  id: string;
  type: FishType;
  name: string;
  addedAt: Date;
  milestone?: string;
  medicineName?: string; // Which medicine saved this fish
  impactLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ScanRecord {
  id: string;
  medicineId: string;
  medicineName: string;
  detectedText: string;
  confidence: number;
  disposalMethod: string;
  safetyRating: string;
  actionTaken?: 'take-back' | 'sealed-disposal' | 'other' | 'skipped';
  actionQuality?: 'great' | 'okay' | 'risky';
  pointsEarned: number;
  timestamp: Date;
  imageUrl?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  requirement: number;
  type: 'disposals' | 'streak' | 'points';
}

interface GameState {
  // Points & Streak
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastActionDate: string | null;
  
  // Fish bowl
  fish: Fish[];
  waterClarity: number; // 0-100
  
  // History
  scanHistory: ScanRecord[];
  totalDisposals: number;
  
  // Achievements
  achievements: Achievement[];
  
  // Actions
  addScan: (scan: Omit<ScanRecord, 'id' | 'timestamp'>) => void;
  updateScanAction: (scanId: string, action: ScanRecord['actionTaken'], quality: ScanRecord['actionQuality'], environmentalImpact?: 'low' | 'medium' | 'high' | 'critical', medicineName?: string, calculatedPoints?: number, expectedFishType?: string) => void;
  addFish: (type: FishType, milestone?: string, medicineName?: string, impactLevel?: 'low' | 'medium' | 'high' | 'critical') => void;
  addPoints: (points: number) => void;
  updateStreak: () => void;
  checkAchievements: () => void;
  getStats: () => {
    totalDisposals: number;
    estimatedPollutionPrevented: number;
    waterSaved: number;
    co2Reduced: number;
  };
}

const defaultAchievements: Achievement[] = [
  {
    id: 'first-disposal',
    title: 'First Safe Disposal',
    description: 'Complete your first safe medication disposal',
    icon: '🌱',
    requirement: 1,
    type: 'disposals'
  },
  {
    id: 'week-streak',
    title: '7-Day Eco Streak',
    description: 'Maintain a 7-day disposal streak',
    icon: '🔥',
    requirement: 7,
    type: 'streak'
  },
  {
    id: 'water-protector',
    title: 'Water Protector',
    description: 'Complete 10 safe disposals',
    icon: '💧',
    requirement: 10,
    type: 'disposals'
  },
  {
    id: 'eco-champion',
    title: 'Eco Champion',
    description: 'Earn 500 eco points',
    icon: '🏆',
    requirement: 500,
    type: 'points'
  },
  {
    id: 'fish-friend',
    title: 'Fish Friend',
    description: 'Grow your aquarium to 5 fish',
    icon: '🐠',
    requirement: 5,
    type: 'disposals'
  },
  {
    id: 'planet-guardian',
    title: 'Planet Guardian',
    description: 'Complete 25 safe disposals',
    icon: '🌍',
    requirement: 25,
    type: 'disposals'
  }
];

const fishNames = [
  'Bubbles', 'Finn', 'Neptune', 'Coral', 'Splash', 'Wave', 
  'Azure', 'Marina', 'Pearl', 'Oceana', 'Tide', 'Reef'
];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActionDate: null,
      fish: [],
      waterClarity: 50,
      scanHistory: [],
      totalDisposals: 0,
      achievements: defaultAchievements,

      addScan: (scan) => {
        const newScan: ScanRecord = {
          ...scan,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };
        set((state) => ({
          scanHistory: [newScan, ...state.scanHistory],
        }));
      },

      updateScanAction: async (scanId, action, quality, environmentalImpact, medicineName, calculatedPoints?: number, expectedFishType?: string) => {
        // Points should be calculated by ActionConfirmation using GPT
        // This function just updates the scan record
        const scan = get().scanHistory.find(s => s.id === scanId);
        const pointsToAdd = calculatedPoints !== undefined && calculatedPoints > 0 ? calculatedPoints : (scan?.pointsEarned || 0);

        set((state) => {
          const updatedHistory = state.scanHistory.map((scan) =>
            scan.id === scanId
              ? { ...scan, actionTaken: action, actionQuality: quality, pointsEarned: pointsToAdd }
              : scan
          );

          const newTotalDisposals = action !== 'skipped' ? state.totalDisposals + 1 : state.totalDisposals;
          
          // Improve water clarity based on action quality
          let clarityBonus = quality === 'great' ? 5 : quality === 'okay' ? 2 : 0;
          const newClarity = Math.min(100, state.waterClarity + clarityBonus);

          return {
            scanHistory: updatedHistory,
            totalPoints: state.totalPoints + pointsToAdd,
            totalDisposals: newTotalDisposals,
            waterClarity: newClarity,
          };
        });

        // Update streak
        get().updateStreak();
        
        // Check for achievements
        get().checkAchievements();

        // Add fish based on environmental impact if action was great
        if (action !== 'skipped' && quality === 'great' && environmentalImpact) {
          const scan = get().scanHistory.find(s => s.id === scanId);
          if (scan) {
            // Use expected fish type if provided (from DisposalReport), otherwise calculate
            if (expectedFishType) {
              // Use the fish type that was shown in the preview
              get().addFish(
                expectedFishType as FishType,
                `Saved by disposing ${scan.medicineName} properly!`,
                scan.medicineName,
                environmentalImpact
              );
            } else {
              // Fallback: calculate fish type
              import('@/services/openai').then(({ selectFishForImpact }) => {
                const isAntibiotic = scan.medicineName?.toLowerCase().includes('antibiotic') || 
                                     scan.medicineName?.toLowerCase().includes('amoxicillin') ||
                                     scan.medicineName?.toLowerCase().includes('penicillin');
                const isControlled = scan.safetyRating === 'A' && scan.medicineName?.toLowerCase().includes('controlled');
                
                selectFishForImpact(
                  environmentalImpact,
                  scan.medicineName || 'Unknown',
                  scan.medicineName || 'Unknown',
                  isAntibiotic,
                  isControlled
                ).then((fishType) => {
                  get().addFish(
                    fishType,
                    `Saved by disposing ${scan.medicineName} properly!`,
                    scan.medicineName,
                    environmentalImpact
                  );
                }).catch(() => {
                  // Fallback if GPT fails
                  const fallbackFish: FishType = 
                    environmentalImpact === 'critical' ? 'tuna' :
                    environmentalImpact === 'high' ? 'salmon' :
                    environmentalImpact === 'medium' ? 'goldfish' : 'mackerel';
                  get().addFish(fallbackFish, `Saved by disposing ${scan.medicineName} properly!`, scan.medicineName, environmentalImpact);
                });
              });
            }
          }
        }

        // Also add fish for milestones (legacy support)
        const state = get();
        const milestones = [1, 3, 5, 10, 15, 25];
        if (milestones.includes(state.totalDisposals)) {
          const fishTypes: FishType[] = ['goldfish', 'guppy', 'tetra', 'clownfish', 'angelfish', 'betta'];
          const typeIndex = milestones.indexOf(state.totalDisposals);
          get().addFish(fishTypes[typeIndex], `${state.totalDisposals} safe disposals!`);
        }
      },

      addFish: (type, milestone, medicineName, impactLevel) => {
        const newFish: Fish = {
          id: crypto.randomUUID(),
          type,
          name: fishNames[Math.floor(Math.random() * fishNames.length)],
          addedAt: new Date(),
          milestone,
          medicineName,
          impactLevel,
        };
        set((state) => ({
          fish: [...state.fish, newFish],
        }));
      },

      addPoints: (points) => {
        set((state) => ({
          totalPoints: state.totalPoints + points,
        }));
      },

      updateStreak: () => {
        const today = new Date().toDateString();
        const state = get();
        
        if (state.lastActionDate === today) return;
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const isConsecutive = state.lastActionDate === yesterday.toDateString();
        
        set({
          currentStreak: isConsecutive ? state.currentStreak + 1 : 1,
          longestStreak: Math.max(state.longestStreak, isConsecutive ? state.currentStreak + 1 : 1),
          lastActionDate: today,
        });
      },

      checkAchievements: () => {
        const state = get();
        
        set({
          achievements: state.achievements.map((achievement) => {
            if (achievement.unlockedAt) return achievement;
            
            let shouldUnlock = false;
            
            if (achievement.type === 'disposals' && state.totalDisposals >= achievement.requirement) {
              shouldUnlock = true;
            } else if (achievement.type === 'streak' && state.currentStreak >= achievement.requirement) {
              shouldUnlock = true;
            } else if (achievement.type === 'points' && state.totalPoints >= achievement.requirement) {
              shouldUnlock = true;
            }
            
            return shouldUnlock
              ? { ...achievement, unlockedAt: new Date() }
              : achievement;
          }),
        });
      },

      getStats: () => {
        const state = get();
        return {
          totalDisposals: state.totalDisposals,
          estimatedPollutionPrevented: state.totalDisposals * 0.5, // kg of pollution prevented
          waterSaved: state.totalDisposals * 1000, // liters of water protected
          co2Reduced: state.totalDisposals * 0.2, // kg CO2 equivalent
        };
      },
    }),
    {
      name: 'disposai-game-storage',
    }
  )
);
