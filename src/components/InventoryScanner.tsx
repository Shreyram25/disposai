import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, Video, Image as ImageIcon, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { identifyMedicineFromImage, extractExpiryDateFromImage, extractMedicineAndExpiryFromVideo } from '@/services/openai';
import { extractTextFromImage } from '@/services/ocr';
import { Medicine } from '@/data/medicineDatabase';
import { useInventoryStore } from '@/store/inventoryStore';

type ScanMode = 'image' | 'video';
type ScanStep = 'select-mode' | 'scan-medicine' | 'scan-expiry' | 'processing' | 'complete' | 'error';

interface InventoryScannerProps {
  onComplete: () => void;
}

const InventoryScanner = ({ onComplete }: InventoryScannerProps) => {
  const [scanMode, setScanMode] = useState<ScanMode>('image');
  const [step, setStep] = useState<ScanStep>('select-mode');
  const [medicineImage, setMedicineImage] = useState<File | null>(null);
  const [expiryImage, setExpiryImage] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [medicineInfo, setMedicineInfo] = useState<Medicine | null>(null);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [missingInfo, setMissingInfo] = useState<'medicine' | 'expiry' | 'both' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const medicineInputRef = useRef<HTMLInputElement>(null);
  const expiryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { addItem } = useInventoryStore();

  const handleModeSelect = (mode: ScanMode) => {
    setScanMode(mode);
    setStep(mode === 'image' ? 'scan-medicine' : 'scan-medicine');
    setError(null);
    setMedicineImage(null);
    setExpiryImage(null);
    setVideoFile(null);
  };

  const handleMedicineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedicineImage(file);
      setStep('scan-expiry');
      setError(null);
    }
  };

  const handleExpiryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setExpiryImage(file);
      // Don't process immediately - let user review first
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      // Don't process immediately - let user review first
    }
  };

  const processImageScan = async () => {
    if (!medicineImage || !expiryImage) {
      setError('Please upload both medicine and expiry date images');
      return;
    }

    setIsProcessing(true);
    setStep('processing');
    setError(null);

    try {
      // Process medicine image - use exact same approach as ImageScanner
      const detectedText = await extractTextFromImage(medicineImage);
      const medicine = await identifyMedicineFromImage(medicineImage, detectedText.text);
      
      // Process expiry date image - use exact same approach as medicine image
      // Ensure File object is fresh and valid
      if (!expiryImage || !(expiryImage instanceof File)) {
        throw new Error('Invalid expiry image file');
      }
      const expiryResult = await extractExpiryDateFromImage(expiryImage);

      if (!expiryResult.expiryDate) {
        setError('Could not find expiry date. Please take a clearer photo of the expiry date label.');
        setStep('scan-expiry');
        setIsProcessing(false);
        return;
      }

      if (medicine.id === 'unknown') {
        setError('Could not identify the medicine. Please take a clearer photo of the medicine package.');
        setStep('scan-medicine');
        setIsProcessing(false);
        return;
      }

      // Convert to Medicine format
      const medicineData: Medicine = {
        id: medicine.id,
        brandNames: medicine.brandNames,
        genericName: medicine.genericName,
        category: medicine.category,
        form: medicine.form === 'other' ? 'tablet' : medicine.form,
        hazardFlags: medicine.hazardFlags,
        disposalMethods: medicine.disposalMethods,
        warnings: medicine.warnings,
        environmentalRisk: medicine.environmentalRisk,
        didYouKnow: medicine.didYouKnow,
      };

      setMedicineInfo(medicineData);
      setExpiryDate(expiryResult.expiryDate);

      // Add to inventory
      const medicineImageUrl = URL.createObjectURL(medicineImage);
      addItem({
        medicineName: medicine.brandNames[0],
        genericName: medicine.genericName,
        brandNames: medicine.brandNames,
        expiryDate: new Date(expiryResult.expiryDate),
        imageUrl: medicineImageUrl,
        category: medicine.category,
        form: medicine.form,
        environmentalRisk: medicine.environmentalRisk.level,
        isAntibiotic: medicine.hazardFlags.antibiotic,
        isControlled: medicine.hazardFlags.controlled,
      });

      setStep('complete');
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err.message || 'Failed to process images. Please try again.');
      setStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const processVideoScan = async () => {
    if (!videoFile) {
      setError('Please upload a video');
      return;
    }

    setIsProcessing(true);
    setStep('processing');
    setError(null);

    try {
      const result = await extractMedicineAndExpiryFromVideo(videoFile);

      if (result.missingInfo === 'both') {
        setError('Could not identify the medicine or expiry date. Please ensure both are clearly visible in the video and try recording again.');
        setMissingInfo('both');
        setStep('error');
        setIsProcessing(false);
        return;
      }

      if (result.missingInfo === 'medicine') {
        setError('Could not identify the medicine. Please ensure the medicine name and package are clearly visible in the video and try recording again.');
        setMissingInfo('medicine');
        setStep('error');
        setIsProcessing(false);
        return;
      }

      if (result.missingInfo === 'expiry') {
        setError('Could not find the expiry date. Please ensure the expiry date label is clearly visible in the video and try recording again.');
        setMissingInfo('expiry');
        setStep('error');
        setIsProcessing(false);
        return;
      }

      if (!result.medicine || !result.expiryDate) {
        setError('Missing information. Please try recording again with both medicine and expiry date clearly visible.');
        setStep('error');
        setIsProcessing(false);
        return;
      }

      // Convert to Medicine format
      const medicineData: Medicine = {
        id: result.medicine.id,
        brandNames: result.medicine.brandNames,
        genericName: result.medicine.genericName,
        category: result.medicine.category,
        form: result.medicine.form === 'other' ? 'tablet' : result.medicine.form,
        hazardFlags: result.medicine.hazardFlags,
        disposalMethods: result.medicine.disposalMethods,
        warnings: result.medicine.warnings,
        environmentalRisk: result.medicine.environmentalRisk,
        didYouKnow: result.medicine.didYouKnow,
      };

      setMedicineInfo(medicineData);
      setExpiryDate(result.expiryDate);

      // Try to get stock image for popular medications, otherwise use video thumbnail
      const { getMedicineImage } = await import('@/data/popularMedicines');
      const stockImage = getMedicineImage(result.medicine.brandNames[0], result.medicine.genericName);
      const videoUrl = URL.createObjectURL(videoFile);
      
      addItem({
        medicineName: result.medicine.brandNames[0],
        genericName: result.medicine.genericName,
        brandNames: result.medicine.brandNames,
        expiryDate: new Date(result.expiryDate),
        imageUrl: stockImage || videoUrl, // Use stock image if available
        category: result.medicine.category,
        form: result.medicine.form,
        environmentalRisk: result.medicine.environmentalRisk.level,
        isAntibiotic: result.medicine.hazardFlags.antibiotic,
        isControlled: result.medicine.hazardFlags.controlled,
      });

      setStep('complete');
    } catch (err: any) {
      console.error('Video scan error:', err);
      setError(err.message || 'Failed to process video. Please try again.');
      setStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setStep('select-mode');
    setError(null);
    setMedicineImage(null);
    setExpiryImage(null);
    setVideoFile(null);
    setMedicineInfo(null);
    setExpiryDate(null);
    setMissingInfo(null);
  };

  const handleNewScan = () => {
    handleRetry();
  };

  if (step === 'select-mode') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto space-y-4"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Add Medicine to Inventory</h2>
          <p className="text-sm text-muted-foreground">Choose how you want to scan</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleModeSelect('image')}
            className="p-6 rounded-2xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-all"
          >
            <ImageIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="font-semibold">Image Scan</p>
            <p className="text-xs text-muted-foreground mt-1">Upload 2 photos</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleModeSelect('video')}
            className="p-6 rounded-2xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-all"
          >
            <Video className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="font-semibold">Video Scan</p>
            <p className="text-xs text-muted-foreground mt-1">Record once</p>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (step === 'scan-medicine' && scanMode === 'image') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-md mx-auto space-y-4"
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">Step 1: Medicine Photo</h2>
          <p className="text-sm text-muted-foreground">Take or upload a photo of the medicine package</p>
        </div>

        <div className="space-y-3">
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleMedicineImageUpload}
            className="hidden"
          />
          <input
            ref={medicineInputRef}
            type="file"
            accept="image/*"
            onChange={handleMedicineImageUpload}
            className="hidden"
          />

          <Button
            variant="ocean"
            size="lg"
            className="w-full"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="h-5 w-5 mr-2" />
            Take Picture
          </Button>

          <Button
            variant="glass"
            size="lg"
            className="w-full"
            onClick={() => medicineInputRef.current?.click()}
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload Photo
          </Button>
        </div>

        {medicineImage && (
          <div className="mt-4">
            <img src={URL.createObjectURL(medicineImage)} alt="Medicine" className="w-full rounded-xl" />
          </div>
        )}

        <Button variant="ghost" onClick={() => setStep('select-mode')} className="w-full">
          Back
        </Button>
      </motion.div>
    );
  }

  if (step === 'scan-expiry' && scanMode === 'image') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-md mx-auto space-y-4"
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">Step 2: Expiry Date Photo</h2>
          <p className="text-sm text-muted-foreground">Take or upload a photo of the expiry date label</p>
        </div>

        <div className="space-y-3">
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleExpiryImageUpload}
            className="hidden"
          />
          <input
            ref={expiryInputRef}
            type="file"
            accept="image/*"
            onChange={handleExpiryImageUpload}
            className="hidden"
          />

          <Button
            variant="ocean"
            size="lg"
            className="w-full"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="h-5 w-5 mr-2" />
            Take Picture
          </Button>

          <Button
            variant="glass"
            size="lg"
            className="w-full"
            onClick={() => expiryInputRef.current?.click()}
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload Photo
          </Button>
        </div>

        {expiryImage && (
          <>
            <div className="mt-4">
              <img src={URL.createObjectURL(expiryImage)} alt="Expiry Date" className="w-full rounded-xl" />
            </div>
            <Button
              variant="ocean"
              size="lg"
              className="w-full"
              onClick={() => processImageScan()}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Process Images
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => {
                setExpiryImage(null);
                if (expiryInputRef.current) {
                  expiryInputRef.current.value = '';
                }
              }}
              disabled={isProcessing}
            >
              Choose Different Photo
            </Button>
          </>
        )}

        <Button 
          variant="ghost" 
          onClick={() => setStep('scan-medicine')} 
          className="w-full"
          disabled={isProcessing}
        >
          Back
        </Button>
      </motion.div>
    );
  }

  if (step === 'scan-medicine' && scanMode === 'video') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-md mx-auto space-y-4"
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">Record Video</h2>
          <p className="text-sm text-muted-foreground">
            Record a video showing both the medicine package and expiry date clearly
          </p>
        </div>

        <div className="bg-muted/50 rounded-2xl p-4 mb-4">
          <p className="text-sm font-semibold mb-2">Make sure to show:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>✓ Medicine name and package clearly</li>
            <li>✓ Expiry date label (Exp, Expiry, Use By)</li>
            <li>✓ Both in the same video</li>
          </ul>
        </div>

        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          capture="environment"
          onChange={handleVideoUpload}
          className="hidden"
        />

        <Button
          variant="ocean"
          size="lg"
          className="w-full"
          onClick={() => videoInputRef.current?.click()}
        >
          <Video className="h-5 w-5 mr-2" />
          Record Video
        </Button>

        {videoFile && (
          <>
            <div className="mt-4">
              <video src={URL.createObjectURL(videoFile)} controls className="w-full rounded-xl" />
            </div>
            <Button
              variant="ocean"
              size="lg"
              className="w-full"
              onClick={() => processVideoScan()}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Process Video
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => {
                setVideoFile(null);
                if (videoInputRef.current) {
                  videoInputRef.current.value = '';
                }
              }}
              disabled={isProcessing}
            >
              Choose Different Video
            </Button>
          </>
        )}

        <Button 
          variant="ghost" 
          onClick={() => setStep('select-mode')} 
          className="w-full"
          disabled={isProcessing}
        >
          Back
        </Button>
      </motion.div>
    );
  }

  if (step === 'processing') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-md mx-auto text-center space-y-4"
      >
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <p className="text-lg font-semibold">Processing...</p>
        <p className="text-sm text-muted-foreground">Identifying medicine and extracting expiry date</p>
      </motion.div>
    );
  }

  if (step === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto space-y-4"
      >
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-xl font-bold mb-2">Scan Failed</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>

          {missingInfo && (
            <div className="bg-muted/50 rounded-xl p-4 mb-4 text-left">
              <p className="text-sm font-semibold mb-2">What to do:</p>
              {missingInfo === 'medicine' && (
                <ul className="text-xs space-y-1">
                  <li>• Ensure medicine name is clearly visible</li>
                  <li>• Show the full package label</li>
                  <li>• Make sure lighting is good</li>
                </ul>
              )}
              {missingInfo === 'expiry' && (
                <ul className="text-xs space-y-1">
                  <li>• Look for labels like "Exp", "Expiry", "Use By"</li>
                  <li>• Make sure the date is clearly visible</li>
                  <li>• Try zooming in on the expiry date</li>
                </ul>
              )}
              {missingInfo === 'both' && (
                <ul className="text-xs space-y-1">
                  <li>• Show both medicine name and expiry date</li>
                  <li>• Record slowly and clearly</li>
                  <li>• Ensure good lighting</li>
                </ul>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRetry} className="flex-1">
              Try Again
            </Button>
            <Button variant="ghost" onClick={() => setStep('select-mode')} className="flex-1">
              Change Mode
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (step === 'complete') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto space-y-4"
      >
        <div className="bg-success/10 border border-success/20 rounded-2xl p-6 text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
          <h3 className="text-xl font-bold mb-2">Added to Inventory!</h3>
          {medicineInfo && (
            <div className="mt-4 text-left bg-muted/50 rounded-xl p-4">
              <p className="font-semibold">{medicineInfo.brandNames[0]}</p>
              <p className="text-sm text-muted-foreground">{medicineInfo.genericName}</p>
              <p className="text-sm mt-2">
                Expires: <span className="font-semibold">{new Date(expiryDate!).toLocaleDateString()}</span>
              </p>
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={handleNewScan} className="flex-1">
              Add Another
            </Button>
            <Button variant="ocean" onClick={onComplete} className="flex-1">
              Done
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
};

export default InventoryScanner;

