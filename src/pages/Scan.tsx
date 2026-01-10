import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageScanner from '@/components/ImageScanner';
import DisposalReport from '@/components/DisposalReport';
import ActionConfirmation from '@/components/ActionConfirmation';
import { Medicine } from '@/data/medicineDatabase';
import { useGameStore } from '@/store/gameStore';

type ScanStep = 'scan' | 'report' | 'confirm';

const Scan = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<ScanStep>('scan');
  const [currentMedicine, setCurrentMedicine] = useState<Medicine | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [detectedText, setDetectedText] = useState('');
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  const { addScan } = useGameStore();

  const handleDetection = (medicine: Medicine, conf: number, text: string, imgUrl?: string) => {
    setCurrentMedicine(medicine);
    setConfidence(conf);
    setDetectedText(text);
    setImageUrl(imgUrl);
    setStep('report');
  };

  const handleConfirmAction = () => {
    if (currentMedicine) {
      // Add to scan history
      addScan({
        medicineId: currentMedicine.id,
        medicineName: currentMedicine.brandNames[0],
        detectedText,
        confidence,
        disposalMethod: currentMedicine.disposalMethods.primary.method,
        safetyRating: currentMedicine.disposalMethods.primary.safetyRating,
        pointsEarned: 0,
        imageUrl,
      });
      
      // Get the latest scan ID
      const store = useGameStore.getState();
      const latestScan = store.scanHistory[0];
      setCurrentScanId(latestScan?.id || null);
      
      setStep('confirm');
    }
  };

  const handleComplete = () => {
    navigate('/');
  };

  const handleBack = () => {
    if (step === 'report') {
      setStep('scan');
      setCurrentMedicine(null);
    } else if (step === 'confirm') {
      setStep('report');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pt-20 bg-gradient-to-b from-muted/30 to-background">
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              {step === 'scan' && 'Scan Medicine'}
              {step === 'report' && 'Disposal Report'}
              {step === 'confirm' && 'Confirm Action'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === 'scan' && 'Upload or capture medication image'}
              {step === 'report' && 'Review safe disposal instructions'}
              {step === 'confirm' && 'Tell us what you did'}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6">
        <AnimatePresence mode="wait">
          {step === 'scan' && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ImageScanner onDetection={handleDetection} />
            </motion.div>
          )}

          {step === 'report' && currentMedicine && (
            <motion.div
              key="report"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DisposalReport
                medicine={currentMedicine}
                confidence={confidence}
                detectedText={detectedText}
                onConfirmAction={handleConfirmAction}
              />
            </motion.div>
          )}

          {step === 'confirm' && currentScanId && currentMedicine && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ActionConfirmation
                scanId={currentScanId}
                recommendedMethod={currentMedicine.disposalMethods.primary.method}
                onComplete={handleComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Scan;
