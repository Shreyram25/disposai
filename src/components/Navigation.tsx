import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Scan, History, Package, Info, Presentation } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/scan', icon: Scan, label: 'Scan' },
  { path: '/inventory', icon: Package, label: 'Inventory' },
  { path: '/history', icon: History, label: 'History' },
  { path: '/about', icon: Info, label: 'About' },
];

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-safe sm:pb-4 pt-2 sm:px-6 md:bottom-auto md:top-0 md:py-4 md:pt-6">
      <div className="mx-auto max-w-lg">
        <div className="glass-card rounded-2xl border border-white/30 px-2 py-2 shadow-elevated backdrop-blur-xl">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative flex flex-col items-center gap-1 px-3 py-2 transition-colors"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-xl bg-primary/10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <item.icon
                    className={cn(
                      'relative z-10 h-5 w-5 transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                  <span
                    className={cn(
                      'relative z-10 text-[10px] font-medium transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
