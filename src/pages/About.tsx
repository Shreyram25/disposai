import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  Heart, 
  Globe, 
  Users,
  AlertTriangle,
  ExternalLink,
  Mail,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const About = () => {
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
            <h1 className="text-xl font-bold">About DisposAI</h1>
            <p className="text-sm text-muted-foreground">Learn about our mission</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-6"
          >
            <div className="mx-auto w-20 h-20 rounded-3xl ocean-gradient flex items-center justify-center mb-4 shadow-glow">
              <Globe className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">DisposAI</h2>
            <p className="text-muted-foreground">
              Scan. Decide. Dispose responsibly.
            </p>
          </motion.div>

          {/* Mission */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Our Mission</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              DisposAI empowers individuals to make environmentally responsible 
              decisions about medication disposal. Using AI-powered recognition, 
              we provide personalized, safe disposal guidance while gamifying 
              eco-friendly behavior to create lasting change.
            </p>
          </motion.section>

          {/* Problem */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="font-semibold">The Problem</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                <span>Over 50% of medications are disposed improperly worldwide</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                <span>Pharmaceutical pollution affects 65% of rivers globally</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                <span>Improper antibiotic disposal accelerates antimicrobial resistance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                <span>1.27 million deaths annually from antibiotic-resistant infections</span>
              </li>
            </ul>
          </motion.section>

          {/* Features */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-success/10">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <h3 className="font-semibold">Key Features</h3>
            </div>
            <div className="grid gap-3">
              {[
                { title: 'AI Image Recognition', desc: 'Instantly identify medications from photos' },
                { title: 'Safe Disposal Guide', desc: 'Step-by-step instructions for each medicine type' },
                { title: 'Environmental Impact', desc: 'Learn about the eco-effects of improper disposal' },
                { title: 'Gamified Experience', desc: 'Earn points and grow your eco-aquarium' },
                { title: 'Take-Back Locator', desc: 'Find authorized disposal points nearby' },
              ].map((feature, i) => (
                <div key={i} className="bg-muted/30 rounded-xl p-3">
                  <p className="font-medium text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Team */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-semibold">The Team</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              DisposAI was created by a passionate team committed to environmental 
              sustainability and public health. Built with ❤️ for a cleaner planet.
            </p>
          </motion.section>

          {/* Disclaimer */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-warning/5 border border-warning/20 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h3 className="font-semibold text-warning">Important Disclaimer</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This tool provides general guidance only. Always follow local regulations 
              and pharmacy instructions for medication disposal. Do not flush medicines 
              unless official guidance explicitly permits it. When in doubt, use 
              pharmacy take-back programs. DisposAI is not responsible for improper 
              disposal decisions.
            </p>
          </motion.section>

          {/* Contact */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card rounded-2xl p-5"
          >
            <h3 className="font-semibold mb-3">Contact Us</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@disposai.app</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Dubai, UAE</span>
              </div>
            </div>
          </motion.section>

          {/* Version */}
          <p className="text-center text-xs text-muted-foreground py-4">
            DisposAI v1.0.0 • Made with 🌱 for Earth
          </p>
        </div>
      </main>
    </div>
  );
};

export default About;
