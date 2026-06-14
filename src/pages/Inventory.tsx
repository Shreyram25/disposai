import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Bell, BellOff, Trash2, AlertTriangle, Calendar, Package, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInventoryStore, InventoryItem } from '@/store/inventoryStore';
import InventoryScanner from '@/components/InventoryScanner';
import { getDisposalInfoForMedicine } from '@/services/openai';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getImageWithFallback } from '@/utils/placeholders';

const Inventory = () => {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [disposalInstructions, setDisposalInstructions] = useState<string | null>(null);
  const [loadingDisposal, setLoadingDisposal] = useState(false);

  const {
    items,
    notificationsEnabled,
    getExpiredItems,
    getExpiringSoonItems,
    removeItem,
    enableNotifications,
    disableNotifications,
    checkExpiry,
  } = useInventoryStore();

  const expiredItems = getExpiredItems();
  const expiringSoonItems = getExpiringSoonItems(7);

  useEffect(() => {
    // Check expiry on mount and set up periodic checking
    checkExpiry();
    const interval = setInterval(() => {
      checkExpiry();
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, [checkExpiry]);

  const handleGetDisposalInstructions = async (item: InventoryItem) => {
    setSelectedItem(item);
    setLoadingDisposal(true);
    setDisposalInstructions(null);

    try {
      const disposalInfo = await getDisposalInfoForMedicine(
        item.medicineName,
        item.genericName,
        item.category,
        item.form
      );
      setDisposalInstructions(disposalInfo.disposalMethods.primary.steps.join('\n'));
    } catch (error) {
      console.error('Failed to get disposal instructions:', error);
      setDisposalInstructions('Please use hospital take-back (DHA Clean Your Medicine Cabinet Drive) for expired medicines.');
    } finally {
      setLoadingDisposal(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getExpiryStatus = (item: InventoryItem) => {
    if (item.isExpired) {
      return { label: 'Expired', color: 'text-destructive', bg: 'bg-destructive/10' };
    }
    if (item.daysUntilExpiry <= 7) {
      return { label: 'Expiring Soon', color: 'text-warning', bg: 'bg-warning/10' };
    }
    if (item.daysUntilExpiry <= 30) {
      return { label: 'Expires This Month', color: 'text-orange-500', bg: 'bg-orange-500/10' };
    }
    return { label: 'Valid', color: 'text-success', bg: 'bg-success/10' };
  };

  if (showScanner) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted pb-24 pt-20 md:pt-24 px-4">
        <InventoryScanner onComplete={() => setShowScanner(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted pb-24 pt-20 md:pt-24 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Inventory</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {items.length} medicine{items.length !== 1 ? 's' : ''} in inventory
            </p>
          </div>
          <Button
            variant="ocean"
            size="default"
            onClick={() => setShowScanner(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Medicine
          </Button>
        </div>

        {/* Notifications Toggle */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Expiry Notifications</p>
              <p className="text-xs text-muted-foreground">
                Get notified when medicines expire or are expiring soon
              </p>
            </div>
            <Button
              variant={notificationsEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (notificationsEnabled) {
                  disableNotifications();
                } else {
                  enableNotifications();
                }
              }}
            >
              {notificationsEnabled ? (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Enabled
                </>
              ) : (
                <>
                  <BellOff className="h-4 w-4 mr-2" />
                  Enable
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {expiredItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <p className="font-semibold text-destructive">
                {expiredItems.length} Expired Medicine{expiredItems.length !== 1 ? 's' : ''}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              These medicines have expired and should be disposed of properly.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                const firstExpired = expiredItems[0];
                handleGetDisposalInstructions(firstExpired);
              }}
            >
              View Disposal Instructions
            </Button>
          </motion.div>
        )}

        {expiringSoonItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-warning/10 border border-warning/20 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-warning" />
              <p className="font-semibold text-warning">
                {expiringSoonItems.length} Expiring Soon
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              These medicines will expire within 7 days.
            </p>
          </motion.div>
        )}

        {/* Disposal Instructions Modal */}
        {selectedItem && disposalInstructions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-6 border border-border"
          >
            <h3 className="text-xl font-bold mb-2">Disposal Instructions</h3>
            <p className="text-sm text-muted-foreground mb-4">
              For: {selectedItem.medicineName}
            </p>
            <div className="bg-muted/50 rounded-xl p-4 mb-4">
              <pre className="text-sm whitespace-pre-wrap font-sans">
                {disposalInstructions}
              </pre>
            </div>
            <div className="flex gap-3">
              <Button
                variant="ocean"
                onClick={() => {
                  navigate('/scan');
                }}
                className="flex-1"
              >
                Scan for Disposal
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedItem(null);
                  setDisposalInstructions(null);
                }}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </motion.div>
        )}

        {/* Inventory List */}
        {items.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-border">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold mb-2">No medicines in inventory</p>
            <p className="text-sm text-muted-foreground mb-4">
              Add medicines to track their expiry dates
            </p>
            <Button variant="ocean" onClick={() => setShowScanner(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Medicine
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items
              .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
              .map((item) => {
                const status = getExpiryStatus(item);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-all"
                  >
                    <div className="flex gap-4">
                      <img
                        src={getImageWithFallback(item.imageUrl)}
                        alt={item.medicineName}
                        className="w-20 h-20 rounded-xl object-cover"
                        onError={(e) => {
                          // Fallback to placeholder if image fails
                          (e.target as HTMLImageElement).src = getImageWithFallback(null);
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{item.medicineName}</h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.genericName}
                            </p>
                          </div>
                          <span className={cn('px-2 py-1 rounded-full text-xs font-medium', status.bg, status.color)}>
                            {status.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(item.expiryDate)}
                          </span>
                          {item.isExpired ? (
                            <span className="text-destructive font-medium">
                              Expired {Math.abs(item.daysUntilExpiry)} day{Math.abs(item.daysUntilExpiry) !== 1 ? 's' : ''} ago
                            </span>
                          ) : (
                            <span>
                              {item.daysUntilExpiry} day{item.daysUntilExpiry !== 1 ? 's' : ''} left
                            </span>
                          )}
                        </div>

                        {item.isExpired && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="mt-3 w-full"
                            onClick={() => handleGetDisposalInstructions(item)}
                            disabled={loadingDisposal}
                          >
                            {loadingDisposal ? 'Loading...' : 'Get Disposal Instructions'}
                          </Button>
                        )}

                        <Button
                          variant="destructive"
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() => {
                            if (confirm(`Remove ${item.medicineName} from inventory? This action cannot be undone.`)) {
                              removeItem(item.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Medicine
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;

