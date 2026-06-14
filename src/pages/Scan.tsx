import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageScanner from '@/components/ImageScanner';
import DisposalReport from '@/components/DisposalReport';
import ActionConfirmation from '@/components/ActionConfirmation';
import MultipleMedicinesReport from '@/components/MultipleMedicinesReport';
import { Medicine } from '@/data/medicineDatabase';
import { useGameStore } from '@/store/gameStore';

type ScanStep = 'scan' | 'report' | 'confirm' | 'multiple';

const Scan = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<ScanStep>('scan');
  const [currentMedicine, setCurrentMedicine] = useState<Medicine | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [detectedText, setDetectedText] = useState('');
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [expectedFishType, setExpectedFishType] = useState<string | undefined>();
  const [multipleMedicines, setMultipleMedicines] = useState<Array<{
    medicine: Medicine;
    confidence: number;
    detectedText: string;
    imageUrl: string;
  }>>([]);

  const { addScan } = useGameStore();

  const handleDetection = (medicine: Medicine, conf: number, text: string, imgUrl?: string) => {
    setCurrentMedicine(medicine);
    setConfidence(conf);
    setDetectedText(text);
    setImageUrl(imgUrl);
    setStep('report');
  };

  const handleMultipleDetections = (medicines: Array<{
    medicine: Medicine;
    confidence: number;
    detectedText: string;
    imageUrl: string;
  }>) => {
    setMultipleMedicines(medicines);
    setStep('multiple');
  };

  const handleMedicineSelect = (medicine: Medicine, conf: number, text: string, imgUrl: string) => {
    setCurrentMedicine(medicine);
    setConfidence(conf);
    setDetectedText(text);
    setImageUrl(imgUrl);
    setStep('report');
  };

  const handleConfirmAction = (fishType?: string) => {
    if (currentMedicine) {
      // Store the expected fish type for consistency
      if (fishType) {
        setExpectedFishType(fishType);
      }
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
    // If we came from multiple medicines list, remove the processed one and go back
    if (multipleMedicines.length > 0 && currentMedicine) {
      // Find and remove the processed medicine from the list
      const updatedMedicines = multipleMedicines.filter(
        med => med.medicine.id !== currentMedicine.id
      );
      
      if (updatedMedicines.length > 0) {
        // There are more medicines to process
        setMultipleMedicines(updatedMedicines);
        setCurrentMedicine(null);
        setCurrentScanId(null);
        setStep('multiple');
      } else {
        // All medicines processed, go to dashboard
        navigate('/');
      }
    } else {
      // Single medicine scan, go to dashboard
      navigate('/');
    }
  };

  const handleBack = () => {
    if (step === 'report') {
      // If we came from multiple medicines, go back to that list
      if (multipleMedicines.length > 0) {
        setStep('multiple');
        setCurrentMedicine(null);
      } else {
        setStep('scan');
        setCurrentMedicine(null);
      }
    } else if (step === 'confirm') {
      setStep('report');
    } else if (step === 'multiple') {
      setStep('scan');
      setMultipleMedicines([]);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen pb-28 pt-4 md:pt-24 bg-gradient-to-b from-muted/30 to-background">
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
              {step === 'multiple' && 'Medicines Detected'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === 'scan' && 'Upload or capture medication image/video'}
              {step === 'report' && 'Review safe disposal instructions'}
              {step === 'confirm' && 'Tell us what you did'}
              {step === 'multiple' && 'Select a medicine to view disposal instructions'}
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
              <ImageScanner 
                onDetection={handleDetection}
                onMultipleDetections={handleMultipleDetections}
              />
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
                imageUrl={imageUrl}
                onConfirmAction={handleConfirmAction}
              />
            </motion.div>
          )}

          {step === 'multiple' && multipleMedicines.length > 0 && (
            <motion.div
              key="multiple"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <MultipleMedicinesReport
                medicines={multipleMedicines}
                onMedicineSelect={handleMedicineSelect}
                onCompleteAll={() => {
                  // Process first medicine
                  if (multipleMedicines.length > 0) {
                    const first = multipleMedicines[0];
                    handleMedicineSelect(first.medicine, first.confidence, first.detectedText, first.imageUrl);
                  }
                }}
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
                environmentalImpact={currentMedicine.environmentalRisk.level}
                medicineName={currentMedicine.brandNames[0]}
                remainingMedicinesCount={multipleMedicines.length}
                isAntibiotic={currentMedicine.hazardFlags.antibiotic}
                isControlled={currentMedicine.hazardFlags.controlled}
                expectedFishType={expectedFishType}
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
