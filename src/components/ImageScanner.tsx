import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Loader2, Edit2, Check, ImageIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { findMedicine, getUnknownMedicineResponse, Medicine } from '@/data/medicineDatabase';
import { cn } from '@/lib/utils';

// Sample images for demo
const sampleImages = [
  { 
    name: 'Panadol', 
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop',
    detectedText: 'Panadol Extra'
  },
  { 
    name: 'Aspirin', 
    url: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=300&fit=crop',
    detectedText: 'Aspirin 500mg'
  },
  { 
    name: 'Medicine Bottle', 
    url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=300&fit=crop',
    detectedText: 'Amoxicillin Capsules'
  },
];

interface ImageScannerProps {
  onDetection: (medicine: Medicine, confidence: number, detectedText: string, imageUrl?: string) => void;
}

const ImageScanner = ({ onDetection }: ImageScannerProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedText, setDetectedText] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [showDetection, setShowDetection] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateOCR = useCallback((imageName: string = ''): string => {
    // Simulated OCR results based on image
    const ocrResults = [
      'Panadol Extra Strength',
      'Panadol Advance 500mg',
      'Adol Tablets',
      'Amoxicillin 250mg Capsules',
      'Brufen 400mg',
      'Ventolin Inhaler',
      'Unknown Medication',
    ];
    
    // Try to match sample image name first
    if (imageName.toLowerCase().includes('panadol')) {
      return 'Panadol Extra Strength 500mg';
    } else if (imageName.toLowerCase().includes('aspirin')) {
      return 'Aspirin Bayer 500mg';
    } else if (imageName.toLowerCase().includes('amoxicillin')) {
      return 'Amoxicillin 250mg Capsules';
    }
    
    return ocrResults[Math.floor(Math.random() * ocrResults.length)];
  }, []);

  const processImage = useCallback(async (url: string, hint?: string) => {
    setImageUrl(url);
    setIsProcessing(true);
    setShowDetection(false);

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const detected = hint || simulateOCR();
    const detectionConfidence = 75 + Math.random() * 20; // 75-95%
    
    setDetectedText(detected);
    setEditedText(detected);
    setConfidence(detectionConfidence);
    setIsProcessing(false);
    setShowDetection(true);
  }, [simulateOCR]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      processImage(url, file.name);
    }
  };

  const handleSampleClick = (sample: typeof sampleImages[0]) => {
    processImage(sample.url, sample.detectedText);
  };

  const handleConfirm = () => {
    const finalText = isEditing ? editedText : detectedText;
    const medicine = findMedicine(finalText) || getUnknownMedicineResponse();
    const finalConfidence = isEditing ? 100 : confidence;
    
    onDetection(medicine, finalConfidence, finalText, imageUrl || undefined);
  };

  const handleEdit = () => {
    if (isEditing) {
      setDetectedText(editedText);
      setConfidence(100);
    }
    setIsEditing(!isEditing);
  };

  const resetScanner = () => {
    setImageUrl(null);
    setDetectedText('');
    setConfidence(0);
    setShowDetection(false);
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <AnimatePresence mode="wait">
        {!imageUrl ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Upload Area */}
            <div 
              className="relative border-2 border-dashed border-primary/30 rounded-3xl p-8 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Scan Medicine Package</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Take a photo or upload an image of your medication
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="ocean" size="default">
                    <Camera className="h-4 w-4" />
                    Take Photo
                  </Button>
                  <Button variant="glass" size="default">
                    <Upload className="h-4 w-4" />
                    Upload
                  </Button>
                </div>
              </div>
            </div>

            {/* Sample Images */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Try with sample images</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {sampleImages.map((sample, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSampleClick(sample)}
                    className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
                  >
                    <img 
                      src={sample.url} 
                      alt={sample.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-xs text-white font-medium">{sample.name}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Image Preview */}
            <div className="relative rounded-3xl overflow-hidden bg-muted aspect-[4/3]">
              <img 
                src={imageUrl} 
                alt="Scanned medicine"
                className="w-full h-full object-cover"
              />
              
              {/* Close button */}
              <button
                onClick={resetScanner}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Processing overlay */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center"
                  >
                    <div className="text-center text-white">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm font-medium">Analyzing image...</p>
                      
                      {/* Scan line animation */}
                      <motion.div
                        className="absolute left-4 right-4 h-0.5 bg-primary"
                        initial={{ top: '20%' }}
                        animate={{ top: ['20%', '80%', '20%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Detection Result */}
            <AnimatePresence>
              {showDetection && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl shadow-card p-4 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-success/10">
                      <Check className="h-5 w-5 text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Detected Medicine</p>
                      {isEditing ? (
                        <Input
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          className="mt-1"
                          autoFocus
                        />
                      ) : (
                        <p className="font-semibold">{detectedText}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleEdit}
                    >
                      {isEditing ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Edit2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Confidence bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium text-primary">{Math.round(confidence)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${confidence}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </div>
                  </div>

                  <Button
                    variant="ocean"
                    size="lg"
                    className="w-full"
                    onClick={handleConfirm}
                  >
                    Get Disposal Instructions
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageScanner;
