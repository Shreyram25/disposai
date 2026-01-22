import { motion } from 'framer-motion';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Medicine } from '@/data/medicineDatabase';
import DisposalReport from '@/components/DisposalReport';
import { getImageWithFallback } from '@/utils/placeholders';

interface MultipleMedicinesReportProps {
  medicines: Array<{
    medicine: Medicine;
    confidence: number;
    detectedText: string;
    imageUrl: string;
  }>;
  onMedicineSelect: (medicine: Medicine, confidence: number, detectedText: string, imageUrl: string) => void;
  onCompleteAll: () => void;
}

const MultipleMedicinesReport = ({ medicines, onMedicineSelect, onCompleteAll }: MultipleMedicinesReportProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-4"
    >
      {/* Header */}
      <div className="bg-card rounded-3xl shadow-elevated p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-success/10">
            <CheckCircle className="h-6 w-6 text-success" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Medicines Detected</h2>
            <p className="text-sm text-muted-foreground">
              {medicines.length} medicine{medicines.length !== 1 ? 's' : ''} found in video
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {medicines.length > 1 
            ? `Tap on any medicine below to view its disposal instructions. Process them one by one. ${medicines.length} remaining.`
            : 'Tap on the medicine below to view its disposal instructions.'}
        </p>
      </div>

      {/* Medicines List */}
      <div className="space-y-3">
        {medicines.map((item, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onMedicineSelect(item.medicine, item.confidence, item.detectedText, item.imageUrl)}
            className="w-full bg-card rounded-2xl shadow-card p-4 hover:bg-muted/50 transition-colors text-left"
          >
            <div className="flex items-start gap-4">
              {/* Medicine Image */}
              <img
                src={getImageWithFallback(item.imageUrl)}
                alt={item.medicine.brandNames[0]}
                className="w-20 h-20 object-cover rounded-xl"
                onError={(e) => {
                  // Fallback to placeholder if image fails
                  (e.target as HTMLImageElement).src = getImageWithFallback(null);
                }}
              />

              {/* Medicine Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1 truncate">
                  {item.medicine.brandNames[0]}
                </h3>
                <p className="text-sm text-muted-foreground mb-2 truncate">
                  {item.medicine.genericName}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {item.medicine.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(item.confidence)}% confidence
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="px-2 py-0.5 rounded bg-warning/10 text-warning font-medium">
                    {item.medicine.environmentalRisk.level.toUpperCase()} Risk
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Complete All Button */}
      <Button
        variant="ocean"
        size="lg"
        className="w-full"
        onClick={onCompleteAll}
      >
        Process All Medicines
      </Button>
    </motion.div>
  );
};

export default MultipleMedicinesReport;

