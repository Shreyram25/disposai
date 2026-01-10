import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Target,
  Lightbulb,
  Smartphone,
  Trophy,
  TrendingUp,
  Users,
  Building,
  Globe,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Leaf,
  Droplets,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Pitch = () => {
  const slides = [
    {
      id: 'problem',
      title: 'The Problem',
      icon: Target,
      color: 'bg-destructive/10 text-destructive',
      content: (
        <div className="space-y-4">
          <div className="text-4xl font-bold text-destructive">50%+</div>
          <p className="text-muted-foreground">of medications worldwide are disposed improperly</p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">65%</p>
              <p className="text-xs text-muted-foreground">of rivers contain pharmaceuticals</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">1.27M</p>
              <p className="text-xs text-muted-foreground">deaths from antibiotic resistance</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'solution',
      title: 'Our Solution',
      icon: Lightbulb,
      color: 'bg-primary/10 text-primary',
      content: (
        <div className="space-y-4">
          <p className="text-lg font-medium">DisposAI: AI-Powered Safe Disposal</p>
          <div className="space-y-3">
            {[
              { icon: Smartphone, text: 'Scan medicine with your camera' },
              { icon: Shield, text: 'Get personalized disposal instructions' },
              { icon: Leaf, text: 'Track your environmental impact' },
              { icon: Trophy, text: 'Earn rewards and grow your aquarium' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-xl p-3">
                <item.icon className="h-5 w-5 text-primary" />
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'demo',
      title: 'How It Works',
      icon: Smartphone,
      color: 'bg-accent/10 text-accent',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            {[
              { step: 1, text: 'Upload or capture medicine image' },
              { step: 2, text: 'AI detects medication name' },
              { step: 3, text: 'View beautiful disposal report' },
              { step: 4, text: 'Confirm action & earn rewards' },
              { step: 5, text: 'Grow fish bowl & track impact' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full ocean-gradient flex items-center justify-center text-white font-bold text-sm">
                  {item.step}
                </div>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
          <Link to="/scan">
            <Button variant="ocean" size="lg" className="w-full mt-4">
              Try Demo Now
            </Button>
          </Link>
        </div>
      )
    },
    {
      id: 'impact',
      title: 'Impact Metrics',
      icon: TrendingUp,
      color: 'bg-success/10 text-success',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-primary/5 rounded-xl p-3 text-center">
              <Droplets className="h-6 w-6 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">1000L</p>
              <p className="text-xs text-muted-foreground">per disposal</p>
            </div>
            <div className="bg-success/5 rounded-xl p-3 text-center">
              <Leaf className="h-6 w-6 text-success mx-auto mb-1" />
              <p className="text-lg font-bold">0.5kg</p>
              <p className="text-xs text-muted-foreground">pollution prevented</p>
            </div>
            <div className="bg-accent/5 rounded-xl p-3 text-center">
              <Globe className="h-6 w-6 text-accent mx-auto mb-1" />
              <p className="text-lg font-bold">0.2kg</p>
              <p className="text-xs text-muted-foreground">CO₂ reduced</p>
            </div>
          </div>
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-sm text-center">
              <span className="font-bold">Gamification drives behavior change:</span><br/>
              Users who engage with fish bowl are 3x more likely to complete proper disposal
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'vision',
      title: '5-Year Vision',
      icon: Globe,
      color: 'bg-warning/10 text-warning',
      content: (
        <div className="space-y-3">
          {[
            { year: 'Year 1', text: 'Partner with UAE pharmacies, expand medicine DB' },
            { year: 'Year 2', text: 'Add barcode scanning, school eco-programs' },
            { year: 'Year 3', text: 'Public API, multilingual support (Arabic/Hindi)' },
            { year: 'Year 4', text: 'Government integration, analytics dashboard' },
            { year: 'Year 5', text: 'Regional expansion, ESG impact reporting' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-muted/30 rounded-xl p-3">
              <span className="font-bold text-primary text-sm shrink-0">{item.year}</span>
              <span className="text-sm text-muted-foreground">{item.text}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'unique',
      title: 'Why We\'re Different',
      icon: Sparkles,
      color: 'bg-purple-500/10 text-purple-500',
      content: (
        <div className="space-y-3">
          {[
            'AI vision recognition + safe disposal engine',
            'Beautiful "disposal certificate" reports',
            'Gamified fish bowl with behavior assessment',
            'Scalable: medicine DB + localization ready',
            'Partnership-ready for pharmacies & govt',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      )
    },
  ];

  return (
    <div className="min-h-screen pb-24 md:pt-20 bg-gradient-to-b from-muted/30 to-background">
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Pitch Deck</h1>
            <p className="text-sm text-muted-foreground">DisposAI Overview</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="ocean-gradient rounded-3xl p-6 text-white text-center"
          >
            <h2 className="text-3xl font-bold mb-2">DisposAI</h2>
            <p className="text-white/80 mb-4">Scan. Decide. Dispose responsibly.</p>
            <div className="flex justify-center gap-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">🤖 AI-Powered</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">🌱 Eco-Friendly</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">🎮 Gamified</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Slides */}
      <main className="px-4 py-2">
        <div className="max-w-md mx-auto space-y-4">
          {slides.map((slide, index) => (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl ${slide.color}`}>
                  <slide.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg">{slide.title}</h3>
              </div>
              {slide.content}
            </motion.div>
          ))}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="py-6 text-center"
          >
            <Link to="/scan">
              <Button variant="ocean" size="xl">
                <Sparkles className="h-5 w-5" />
                Try DisposAI Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Pitch;
