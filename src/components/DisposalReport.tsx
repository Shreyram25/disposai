import { useRef, useState, useEffect } from 'react';
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
  Leaf,
  Loader2,
  Fish
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Medicine } from '@/data/medicineDatabase';
import { findNearbyHospitals, getImproperDisposalImpact, selectFishForImpact } from '@/services/openai';
import { cn } from '@/lib/utils';

interface DisposalReportProps {
  medicine: Medicine;
  confidence: number;
  detectedText: string;
  imageUrl?: string;
  onConfirmAction: (fishType?: string) => void;
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

const getFishPreviewUrl = (fishType: string): string => {
  const fishImageMap: Record<string, string> = {
    mackerel: 'https://source.unsplash.com/100x100/?mackerel,fish',
    sardine: 'https://source.unsplash.com/100x100/?sardine,fish',
    anchovy: 'https://source.unsplash.com/100x100/?anchovy,fish',
    guppy: 'https://source.unsplash.com/100x100/?guppy,fish,aquarium',
    tetra: 'https://source.unsplash.com/100x100/?tetra,fish,aquarium',
    goldfish: 'https://source.unsplash.com/100x100/?goldfish,fish,aquarium',
    clownfish: 'https://source.unsplash.com/100x100/?clownfish,fish,reef',
    angelfish: 'https://source.unsplash.com/100x100/?angelfish,fish,reef',
    betta: 'https://source.unsplash.com/100x100/?betta,fish,aquarium',
    salmon: 'https://source.unsplash.com/100x100/?salmon,fish',
    tuna: 'https://source.unsplash.com/100x100/?tuna,fish',
    shark: 'https://source.unsplash.com/100x100/?shark,fish,ocean',
    whale: 'https://source.unsplash.com/100x100/?whale,ocean',
  };
  return fishImageMap[fishType] || fishImageMap.mackerel;
};

const DisposalReport = ({ medicine, confidence, detectedText, imageUrl, onConfirmAction }: DisposalReportProps) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const actionId = `ECO-${Date.now().toString(36).toUpperCase()}`;
  const [hospitals, setHospitals] = useState<Array<{
    id: number;
    name: string;
    address: string;
    distance: string;
    acceptsAll: boolean;
    hours: string;
  }>>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [impactInfo, setImpactInfo] = useState<{
    impactDescription: string;
    fishThatWouldDie: string;
    fishYouWillSave: string;
  } | null>(null);
  const [fishPreview, setFishPreview] = useState<string | null>(null);

  useEffect(() => {
    // Get user location and find nearby hospitals
    const loadHospitals = async () => {
      try {
        let latitude: number | undefined;
        let longitude: number | undefined;

        // Try to get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              latitude = position.coords.latitude;
              longitude = position.coords.longitude;
              findNearbyHospitals(latitude, longitude).then(setHospitals).finally(() => setLoadingHospitals(false));
            },
            () => {
              // If location denied, use default city
              findNearbyHospitals().then(setHospitals).finally(() => setLoadingHospitals(false));
            }
          );
        } else {
          // No geolocation support, use default
          const locations = await findNearbyHospitals();
          setHospitals(locations);
          setLoadingHospitals(false);
        }
      } catch (error) {
        console.error('Failed to load hospitals:', error);
        setLoadingHospitals(false);
      }
    };

    // Load impact information
    const loadImpactInfo = async () => {
      try {
        // Safety check - ensure all required properties exist
        if (!medicine.environmentalRisk || !medicine.brandNames || !medicine.genericName || !medicine.hazardFlags) {
          console.warn('Medicine missing required properties, using fallback values');
          setImpactInfo({
            impactDescription: 'Environmental impact information unavailable.',
            fishThatWouldDie: 'mackerel',
            fishYouWillSave: 'mackerel',
          });
          setFishPreview('mackerel');
          return;
        }

        const impact = await getImproperDisposalImpact(
          medicine.environmentalRisk.level || 'low',
          medicine.brandNames[0],
          medicine.genericName,
          medicine.hazardFlags.antibiotic || false
        );
        setImpactInfo(impact);
        
        // Get fish preview - ALWAYS use the same fish type from impactInfo to ensure perfect sync
        // This ensures the fish shown in preview is exactly the same as the one added to aquarium
        let fishType = impact.fishYouWillSave || impact.fishThatWouldDie;
        if (!fishType) {
          fishType = await selectFishForImpact(
            medicine.environmentalRisk.level || 'low',
            medicine.brandNames[0],
            medicine.genericName,
            medicine.hazardFlags.antibiotic || false,
            medicine.hazardFlags.controlled || false
          );
        }
        setFishPreview(fishType);
      } catch (error) {
        console.error('Failed to load impact info:', error);
        // Set fallback values to prevent blank screen
        setImpactInfo({
          impactDescription: 'Environmental impact information unavailable.',
          fishThatWouldDie: 'mackerel',
          fishYouWillSave: 'mackerel',
        });
        setFishPreview('mackerel');
      }
    };

    loadHospitals();
    loadImpactInfo();
  }, [medicine]);

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

  // Safety check - ensure medicine has required properties
  if (!medicine || !medicine.brandNames || !medicine.disposalMethods) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-card rounded-3xl">
        <p className="text-destructive">Error: Invalid medicine data</p>
      </div>
    );
  }

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

          {/* Medicine Image */}
          {imageUrl && (
            <div className="mt-4 bg-white/10 rounded-xl p-2">
              <img 
                src={imageUrl} 
                alt={medicine.brandNames[0]}
                className="w-full h-32 object-contain rounded-lg"
                onError={(e) => {
                  // Hide image if it fails to load (e.g., CORS issue with external URLs)
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
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
          {medicine.environmentalRisk && (
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="h-4 w-4 text-primary" />
                <p className="font-semibold">Environmental Impact</p>
                <span className={cn('text-sm font-medium ml-auto', getRiskColor(medicine.environmentalRisk.level || 'low'))}>
                  {(medicine.environmentalRisk.level || 'low').toUpperCase()} Risk
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {medicine.environmentalRisk.description || 'Environmental risk information unavailable.'}
              </p>
              
              {/* Impact of Improper Disposal */}
              {impactInfo && impactInfo.fishYouWillSave && (
                <div className="mt-3 pt-3 border-t border-primary/20">
                  <p className="text-xs font-semibold text-destructive mb-2">⚠️ If Disposed Improperly:</p>
                  <p className="text-xs text-muted-foreground mb-2">{impactInfo.impactDescription}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Fish className="h-4 w-4 text-primary" />
                    <span className="text-xs text-primary font-medium">
                      You'll save: {impactInfo.fishYouWillSave.charAt(0).toUpperCase() + impactInfo.fishYouWillSave.slice(1)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fish Preview */}
          {fishPreview && (
            <div className="bg-water-light/10 rounded-2xl p-4 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                  <img
                    src={getFishPreviewUrl(fishPreview)}
                    alt={fishPreview}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Fish You'll Save</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {fishPreview} will be added to your aquarium
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Did You Know */}
          <div className="flex gap-3 items-start bg-muted/30 rounded-2xl p-4">
            <Lightbulb className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warning">Did You Know?</p>
              <p className="text-sm text-muted-foreground mt-1">{medicine.didYouKnow}</p>
            </div>
          </div>

          {/* Nearby Hospitals */}
          {medicine.disposalMethods.primary.method.includes('Hospital') || medicine.disposalMethods.primary.method.includes('Take-Back') ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <p className="font-semibold">Nearby DHA Hospitals</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Clean Your Medicine Cabinet Drive</span>
              </div>
              {loadingHospitals ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Finding nearby hospitals...</span>
                </div>
              ) : hospitals.length > 0 ? (
                <div className="space-y-2">
                  {hospitals.slice(0, 2).map((location) => (
                    <div 
                      key={location.id}
                      className="flex items-center justify-between bg-muted/30 rounded-xl p-3"
                    >
                      <div>
                        <p className="font-medium text-sm">{location.name}</p>
                        <p className="text-xs text-muted-foreground">{location.address}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{location.distance} away • {location.hours}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/30 rounded-xl p-3 text-center">
                  <p className="text-sm text-muted-foreground">Unable to find nearby hospitals. Please search for DHA hospitals manually.</p>
                </div>
              )}
            </div>
          ) : null}

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
          onClick={() => onConfirmAction(fishPreview || undefined)}
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
        This tool provides general guidance only. Follow local regulations and DHA guidelines. 
        When in doubt, use hospital take-back programs (DHA Clean Your Medicine Cabinet Drive).
      </p>
    </motion.div>
  );
};

export default DisposalReport;
