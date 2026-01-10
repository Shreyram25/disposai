import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Fish {
  id: string;
  type: 'goldfish' | 'clownfish' | 'angelfish' | 'betta' | 'guppy' | 'tetra';
  name: string;
  addedAt: Date;
  milestone?: string;
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
  updateScanAction: (scanId: string, action: ScanRecord['actionTaken'], quality: ScanRecord['actionQuality']) => void;
  addFish: (type: Fish['type'], milestone?: string) => void;
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

      updateScanAction: (scanId, action, quality) => {
        let pointsToAdd = 0;
        
        if (quality === 'great') pointsToAdd = 50;
        else if (quality === 'okay') pointsToAdd = 25;
        else if (quality === 'risky') pointsToAdd = 5;

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

        // Add fish if milestone reached
        const state = get();
        const milestones = [1, 3, 5, 10, 15, 25];
        if (milestones.includes(state.totalDisposals)) {
          const fishTypes: Fish['type'][] = ['goldfish', 'guppy', 'tetra', 'clownfish', 'angelfish', 'betta'];
          const typeIndex = milestones.indexOf(state.totalDisposals);
          get().addFish(fishTypes[typeIndex], `${state.totalDisposals} safe disposals!`);
        }
      },

      addFish: (type, milestone) => {
        const newFish: Fish = {
          id: crypto.randomUUID(),
          type,
          name: fishNames[Math.floor(Math.random() * fishNames.length)],
          addedAt: new Date(),
          milestone,
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
