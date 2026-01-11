import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface InventoryItem {
  id: string;
  medicineName: string;
  genericName: string;
  brandNames: string[];
  expiryDate: Date;
  imageUrl: string;
  addedAt: Date;
  category: string;
  form: string;
  isExpired: boolean;
  daysUntilExpiry: number;
  disposalInstructions?: string;
  environmentalRisk?: 'low' | 'medium' | 'high' | 'critical';
  isAntibiotic?: boolean;
  isControlled?: boolean;
}

interface InventoryState {
  items: InventoryItem[];
  notificationsEnabled: boolean;
  lastNotificationCheck: Date | null;
  
  addItem: (item: Omit<InventoryItem, 'id' | 'addedAt' | 'isExpired' | 'daysUntilExpiry'>) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  getExpiredItems: () => InventoryItem[];
  getExpiringSoonItems: (days?: number) => InventoryItem[];
  checkExpiry: () => void;
  enableNotifications: () => Promise<void>;
  disableNotifications: () => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: [],
      notificationsEnabled: false,
      lastNotificationCheck: null,

      addItem: (itemData) => {
        const expiryDate = new Date(itemData.expiryDate);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isExpired = daysUntilExpiry < 0;

        const newItem: InventoryItem = {
          ...itemData,
          id: crypto.randomUUID(),
          addedAt: new Date(),
          expiryDate,
          isExpired,
          daysUntilExpiry,
        };

        set((state) => ({
          items: [...state.items, newItem],
        }));

        // Check if expired and show notification
        if (isExpired && get().notificationsEnabled) {
          get().checkExpiry();
        }
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === id) {
              const updated = { ...item, ...updates };
              // Recalculate expiry status
              const expiryDate = updated.expiryDate;
              const now = new Date();
              const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              return {
                ...updated,
                isExpired: daysUntilExpiry < 0,
                daysUntilExpiry,
              };
            }
            return item;
          }),
        }));
      },

      getExpiredItems: () => {
        return get().items.filter((item) => item.isExpired);
      },

      getExpiringSoonItems: (days = 30) => {
        return get().items.filter(
          (item) => !item.isExpired && item.daysUntilExpiry <= days && item.daysUntilExpiry >= 0
        );
      },

      checkExpiry: async () => {
        const expiredItems = get().getExpiredItems();
        const expiringSoonItems = get().getExpiringSoonItems(7);

        if (expiredItems.length > 0 && get().notificationsEnabled) {
          // Request notification permission if not already granted
          if (Notification.permission === 'granted') {
            expiredItems.forEach((item) => {
              new Notification('Medicine Expired!', {
                body: `${item.medicineName} has expired. Tap for disposal instructions.`,
                icon: item.imageUrl,
                tag: item.id,
                requireInteraction: true,
              });
            });
          }
        }

        if (expiringSoonItems.length > 0 && get().notificationsEnabled) {
          if (Notification.permission === 'granted') {
            expiringSoonItems.forEach((item) => {
              new Notification('Medicine Expiring Soon', {
                body: `${item.medicineName} expires in ${item.daysUntilExpiry} days.`,
                icon: item.imageUrl,
                tag: `expiring-${item.id}`,
              });
            });
          }
        }

        set({ lastNotificationCheck: new Date() });
      },

      enableNotifications: async () => {
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            set({ notificationsEnabled: true });
            // Check expiry immediately
            get().checkExpiry();
            // Set up periodic checking (every hour)
            setInterval(() => {
              get().checkExpiry();
            }, 60 * 60 * 1000);
          } else {
            set({ notificationsEnabled: false });
          }
        } else if (Notification.permission === 'granted') {
          set({ notificationsEnabled: true });
          get().checkExpiry();
          setInterval(() => {
            get().checkExpiry();
          }, 60 * 60 * 1000);
        } else {
          set({ notificationsEnabled: false });
        }
      },

      disableNotifications: () => {
        set({ notificationsEnabled: false });
      },
    }),
    {
      name: 'inventory-storage',
    }
  )
);

