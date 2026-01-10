import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Loader2, Edit2, Check, ImageIcon, Sparkles, AlertCircle, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Medicine } from '@/data/medicineDatabase';
import { extractTextFromImage, cleanupOCR } from '@/services/ocr';
import { identifyMedicine, identifyMedicineFromImage, MedicineInfo } from '@/services/openai';
import VideoScanner from '@/components/VideoScanner';
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
  onMultipleDetections?: (medicines: Array<{ medicine: Medicine; confidence: number; detectedText: string; imageUrl: string }>) => void;
}

// Convert MedicineInfo to Medicine format for compatibility
const convertMedicineInfo = (info: MedicineInfo): Medicine => ({
  ...info,
  form: info.form === 'other' ? 'tablet' : info.form,
});

const ImageScanner = ({ onDetection, onMultipleDetections }: ImageScannerProps) => {
  const [scanMode, setScanMode] = useState<'image' | 'video'>('image');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedText, setDetectedText] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [showDetection, setShowDetection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Cleanup OCR worker on unmount
  useEffect(() => {
    return () => {
      cleanupOCR();
    };
  }, []);

  const processImage = useCallback(async (url: string, file?: File, hint?: string) => {
    setImageUrl(url);
    setIsProcessing(true);
    setShowDetection(false);
    setError(null);

    try {
      // Step 1: Extract text using OCR (in parallel with Vision API)
      let ocrText = '';
      let ocrConfidence = 0;

      const ocrPromise = (async () => {
        if (hint) {
          return { text: hint, confidence: 90 };
        } else if (file) {
          return await extractTextFromImage(file);
        } else {
          return await extractTextFromImage(url);
        }
      })();

      // Step 2: Use GPT-4 Vision API to analyze the image
      const visionPromise = (async () => {
        if (file) {
          return await identifyMedicineFromImage(file);
        } else if (url) {
          return await identifyMedicineFromImage(url);
        }
        return null;
      })();

      // Wait for both OCR and Vision API
      const [ocrResult, visionResult] = await Promise.all([ocrPromise, visionPromise]);

      ocrText = ocrResult.text;
      ocrConfidence = ocrResult.confidence;

      // If OCR failed but Vision API succeeded, use Vision API result
      if ((!ocrText || ocrText === 'No text detected' || ocrText === 'Text extraction failed') && visionResult) {
        ocrText = visionResult.brandNames[0] || visionResult.genericName || 'Medicine detected';
        ocrConfidence = 95; // High confidence from Vision API
      }

      // If we have OCR text but no Vision result, we'll use OCR text for identification
      // If we have both, Vision API result is already the medicine info
      setDetectedText(ocrText);
      setEditedText(ocrText);
      setConfidence(ocrConfidence);
      setIsProcessing(false);
      setShowDetection(true);
      
      // Store the vision result for later use
      if (visionResult && file) {
        (file as any).visionResult = visionResult;
      }
    } catch (err) {
      console.error('Image processing failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image');
      setIsProcessing(false);
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentFile(file);
      const url = URL.createObjectURL(file);
      await processImage(url, file);
    }
  };

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentFile(file);
      const url = URL.createObjectURL(file);
      await processImage(url, file);
    }
  };

  const handleSampleClick = async (sample: typeof sampleImages[0]) => {
    setCurrentFile(null);
    await processImage(sample.url, undefined, sample.detectedText);
  };

  const handleConfirm = async () => {
    const finalText = isEditing ? editedText : detectedText;
    
    if (!finalText || finalText.trim().length === 0) {
      setError('Please enter or confirm the detected medicine name');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      let medicineInfo: MedicineInfo;
      
      // If we have a vision result from earlier, use it
      if (currentFile && (currentFile as any).visionResult) {
        medicineInfo = (currentFile as any).visionResult;
      } else if (currentFile || imageUrl) {
        // Use Vision API with the image
        const imageSource = currentFile || imageUrl!;
        medicineInfo = await identifyMedicineFromImage(imageSource, finalText);
      } else {
        // Fallback to text-only identification
        medicineInfo = await identifyMedicine(finalText);
      }
      
      const medicine = convertMedicineInfo(medicineInfo);
      const finalConfidence = isEditing ? 100 : confidence;
      
      onDetection(medicine, finalConfidence, finalText, imageUrl || undefined);
    } catch (err) {
      console.error('Medicine identification failed:', err);
      setError('Failed to identify medicine. Please try again or check your API key.');
      setIsProcessing(false);
    }
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
    setError(null);
    setCurrentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // If video mode, show VideoScanner
  if (scanMode === 'video' && onMultipleDetections) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="flex gap-2 mb-4">
          <Button
            variant="glass"
            size="sm"
            onClick={() => setScanMode('image')}
          >
            <Camera className="h-4 w-4 mr-2" />
            Image
          </Button>
          <Button
            variant="ocean"
            size="sm"
            onClick={() => setScanMode('video')}
          >
            <Video className="h-4 w-4 mr-2" />
            Video
          </Button>
        </div>
        <VideoScanner onDetections={onMultipleDetections} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Mode Selector */}
      {onMultipleDetections && (
        <div className="flex gap-2 mb-4">
          <Button
            variant={scanMode === 'image' ? 'ocean' : 'glass'}
            size="sm"
            onClick={() => setScanMode('image')}
          >
            <Camera className="h-4 w-4 mr-2" />
            Image
          </Button>
          <Button
            variant={scanMode === 'video' ? 'ocean' : 'glass'}
            size="sm"
            onClick={() => setScanMode('video')}
          >
            <Video className="h-4 w-4 mr-2" />
            Video
          </Button>
        </div>
      )}

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
            <div className="border-2 border-dashed border-primary/30 rounded-3xl p-8 bg-primary/5">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Scan Medicine Package</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Take a photo or upload an image of your medication
                </p>
                <div className="flex gap-3 justify-center">
                  {/* Camera Input */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCameraCapture}
                    className="hidden"
                  />
                  <Button 
                    variant="ocean" 
                    size="default"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                    Take Photo
                  </Button>
                  
                  {/* Upload Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button 
                    variant="glass" 
                    size="default"
                    onClick={() => fileInputRef.current?.click()}
                  >
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
                      <p className="text-sm font-medium">
                        {showDetection ? 'Identifying medicine with AI...' : 'Extracting text from image...'}
                      </p>
                      
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

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Error</p>
                  <p className="text-xs text-destructive/80 mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Detection Result */}
            <AnimatePresence>
              {showDetection && !error && (
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
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Identifying with AI...
                      </>
                    ) : (
                      'Get Disposal Instructions'
                    )}
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
