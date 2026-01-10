import { useRef } from 'react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { 
  Download, 
  Share2, 
  CheckCircle, 
  AlertTriangle, 
  Building2, 
  Trash2, 
  Recycle,
  Droplets,
  Lightbulb,
  Shield,
  MapPin,
  ChevronRight,
  Leaf
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Medicine, takeBackLocations } from '@/data/medicineDatabase';
import { cn } from '@/lib/utils';

interface DisposalReportProps {
  medicine: Medicine;
  confidence: number;
  detectedText: string;
  onConfirmAction: () => void;
}

const getRatingColor = (rating: string) => {
  switch (rating) {
    case 'A': return 'bg-success text-success-foreground';
    case 'B': return 'bg-primary text-primary-foreground';
    case 'C': return 'bg-warning text-warning-foreground';
    case 'D': return 'bg-orange-500 text-white';
    case 'E': return 'bg-destructive text-destructive-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getRiskColor = (level: string) => {
  switch (level) {
    case 'low': return 'text-success';
    case 'medium': return 'text-warning';
    case 'high': return 'text-orange-500';
    case 'critical': return 'text-destructive';
    default: return 'text-muted-foreground';
  }
};

const getMethodIcon = (icon: string) => {
  switch (icon) {
    case 'Building2': return Building2;
    case 'Trash2': return Trash2;
    case 'Recycle': return Recycle;
    case 'Droplets': return Droplets;
    default: return CheckCircle;
  }
};

const DisposalReport = ({ medicine, confidence, detectedText, onConfirmAction }: DisposalReportProps) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const actionId = `ECO-${Date.now().toString(36).toUpperCase()}`;

  const handleDownload = async () => {
    if (reportRef.current) {
      try {
        const dataUrl = await toPng(reportRef.current, { 
          quality: 0.95,
          backgroundColor: '#ffffff',
        });
        const link = document.createElement('a');
        link.download = `DisposAI-Report-${actionId}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to generate image:', err);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DisposAI Disposal Report',
          text: `I safely disposed ${medicine.brandNames[0]} using DisposAI! Join the eco-movement.`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
  };

  const PrimaryIcon = getMethodIcon(medicine.disposalMethods.primary.icon);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Report Card */}
      <div 
        ref={reportRef}
        className="bg-card rounded-3xl shadow-elevated overflow-hidden"
      >
        {/* Header */}
        <div className="report-gradient p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-80 mb-1">Disposal Report</p>
              <h2 className="text-2xl font-bold">{medicine.brandNames[0]}</h2>
              <p className="text-sm opacity-80">{medicine.genericName}</p>
            </div>
            <div className={cn(
              'px-3 py-1.5 rounded-full text-sm font-bold',
              getRatingColor(medicine.disposalMethods.primary.safetyRating)
            )}>
              {medicine.disposalMethods.primary.safetyRating} Rating
            </div>
          </div>

          {/* Detection info */}
          <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">
              Detected: "{detectedText}" ({Math.round(confidence)}% confidence)
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Primary Method */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <PrimaryIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recommended Method</p>
                <p className="font-semibold">{medicine.disposalMethods.primary.method}</p>
              </div>
            </div>

            {/* Steps */}
            <div className="bg-muted/50 rounded-2xl p-4 space-y-2">
              {medicine.disposalMethods.primary.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <p className="text-sm flex-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings */}
          {medicine.warnings.length > 0 && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <p className="font-semibold text-destructive">Important Warnings</p>
              </div>
              <ul className="space-y-1">
                {medicine.warnings.map((warning, i) => (
                  <li key={i} className="text-sm text-destructive/80 flex items-start gap-2">
                    <span>•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Environmental Impact */}
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="h-4 w-4 text-primary" />
              <p className="font-semibold">Environmental Impact</p>
              <span className={cn('text-sm font-medium ml-auto', getRiskColor(medicine.environmentalRisk.level))}>
                {medicine.environmentalRisk.level.toUpperCase()} Risk
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {medicine.environmentalRisk.description}
            </p>
          </div>

          {/* Did You Know */}
          <div className="flex gap-3 items-start bg-muted/30 rounded-2xl p-4">
            <Lightbulb className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warning">Did You Know?</p>
              <p className="text-sm text-muted-foreground mt-1">{medicine.didYouKnow}</p>
            </div>
          </div>

          {/* Nearby Locations */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <p className="font-semibold">Nearby Take-Back Locations</p>
            </div>
            <div className="space-y-2">
              {takeBackLocations.slice(0, 2).map((location) => (
                <div 
                  key={location.id}
                  className="flex items-center justify-between bg-muted/30 rounded-xl p-3"
                >
                  <div>
                    <p className="font-medium text-sm">{location.name}</p>
                    <p className="text-xs text-muted-foreground">{location.distance} away</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>

          {/* Report Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Eco Action ID</p>
              <p className="font-mono text-sm font-semibold">{actionId}</p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        <Button 
          variant="ocean" 
          size="lg" 
          className="w-full"
          onClick={onConfirmAction}
        >
          <CheckCircle className="h-5 w-5" />
          I've Disposed This Medication
        </Button>

        <div className="flex gap-3">
          <Button 
            variant="glass" 
            size="default"
            className="flex-1"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Save Report
          </Button>
          <Button 
            variant="glass" 
            size="default"
            className="flex-1"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-6 text-xs text-muted-foreground text-center px-4">
        This tool provides general guidance only. Follow local regulations and pharmacy 
        instructions. When in doubt, use take-back programs.
      </p>
    </motion.div>
  );
};

export default DisposalReport;
