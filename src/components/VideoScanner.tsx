import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Upload, X, Loader2, Check, AlertCircle, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Medicine } from '@/data/medicineDatabase';
import { identifyMedicinesFromVideo, MedicineInfo } from '@/services/openai';
import { cn } from '@/lib/utils';

// Convert MedicineInfo to Medicine format
const convertMedicineInfo = (info: MedicineInfo): Medicine => ({
  ...info,
  form: info.form === 'other' ? 'tablet' : info.form,
});

interface VideoScannerProps {
  onDetections: (medicines: Array<{ medicine: Medicine; confidence: number; detectedText: string; imageUrl: string }>) => void;
}

interface DetectedMedicine {
  medicine: Medicine;
  confidence: number;
  detectedText: string;
  imageUrl: string;
}

/**
 * Extract a thumbnail frame from video for display
 */
async function extractVideoThumbnail(videoFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      video.currentTime = 1; // Get frame at 1 second
    };

    video.onseeked = () => {
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      }
    };

    video.onerror = reject;
    video.src = URL.createObjectURL(videoFile);
  });
}

const VideoScanner = ({ onDetections }: VideoScannerProps) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedMedicines, setDetectedMedicines] = useState<DetectedMedicine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const processVideo = useCallback(async (file: File) => {
    setVideoUrl(URL.createObjectURL(file));
    setIsProcessing(true);
    setError(null);
    setDetectedMedicines([]);

    try {
      // Extract thumbnail for display
      const thumbnail = await extractVideoThumbnail(file);
      setThumbnailUrl(thumbnail);

      // Use OpenAI to analyze video directly
      const results = await identifyMedicinesFromVideo(file);

      if (results.length === 0) {
        setError('No medicines detected in the video. Please ensure the medicine packages are clearly visible.');
        setIsProcessing(false);
        return;
      }

      // Convert results to DetectedMedicine format
      const detected: DetectedMedicine[] = results.map((result, index) => ({
        medicine: convertMedicineInfo(result.medicine),
        confidence: result.confidence,
        detectedText: result.detectedText,
        imageUrl: thumbnail, // Use thumbnail for display (or we could extract specific frames)
      }));

      setDetectedMedicines(detected);
      setIsProcessing(false);
    } catch (err) {
      console.error('Video processing failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to process video. Please ensure the video shows medicine packages clearly.');
      setIsProcessing(false);
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      await processVideo(file);
    } else {
      setError('Please upload a valid video file');
    }
  };

  const handleConfirm = () => {
    if (detectedMedicines.length > 0) {
      onDetections(detectedMedicines.map(d => ({
        medicine: d.medicine,
        confidence: d.confidence,
        detectedText: d.detectedText,
        imageUrl: d.imageUrl,
      })));
    }
  };

  const resetScanner = () => {
    setVideoUrl(null);
    setDetectedMedicines([]);
    setError(null);
    setIsPlaying(false);
    setThumbnailUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <AnimatePresence mode="wait">
        {!videoUrl ? (
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
                  <Video className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Scan Medicine Video</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a video showing multiple medicine packages
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  variant="ocean" 
                  size="default"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Video
                </Button>
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
            {/* Video Preview */}
            <div className="relative rounded-3xl overflow-hidden bg-muted aspect-video">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Close button */}
              <button
                onClick={resetScanner}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Play/Pause button */}
              <button
                onClick={togglePlayback}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-12 w-12 text-white" />
                ) : (
                  <Play className="h-12 w-12 text-white" />
                )}
              </button>

              {/* Processing overlay */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-6"
                  >
                    <Loader2 className="h-12 w-12 animate-spin mb-4" />
                    <p className="text-lg font-medium mb-2">Analyzing Video with AI...</p>
                    <p className="text-sm opacity-80 mb-4">
                      Extracting key frames and analyzing medicines
                    </p>
                    <p className="text-xs mt-2 opacity-60">
                      Processing video frames with GPT-4 Vision...
                    </p>
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

            {/* Detected Medicines List */}
            {!isProcessing && detectedMedicines.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl shadow-card p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Detected Medicines</p>
                    <p className="font-semibold text-lg">{detectedMedicines.length} found</p>
                  </div>
                  <div className="p-2 rounded-xl bg-success/10">
                    <Check className="h-5 w-5 text-success" />
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {detectedMedicines.map((detected, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl"
                    >
                      <img
                        src={detected.imageUrl || thumbnailUrl || ''}
                        alt={detected.medicine.brandNames[0]}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {detected.medicine.brandNames[0]}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {detected.medicine.genericName}
                        </p>
                        <p className="text-xs text-primary mt-1">
                          {Math.round(detected.confidence)}% confidence
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Button
                  variant="ocean"
                  size="lg"
                  className="w-full"
                  onClick={handleConfirm}
                >
                  View All Disposal Reports ({detectedMedicines.length})
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoScanner;

