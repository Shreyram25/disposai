import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Scan from "./pages/Scan";
import History from "./pages/History";
import Inventory from "./pages/Inventory";
import About from "./pages/About";
import Pitch from "./pages/Pitch";
import NotFound from "./pages/NotFound";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Scan from "./pages/Scan";
import History from "./pages/History";
import Inventory from "./pages/Inventory";
import About from "./pages/About";
import Pitch from "./pages/Pitch";
import NotFound from "./pages/NotFound";
import ApiKeyService from "./services/apiKeys";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize API keys when app starts
    const initializeApiKeys = async () => {
      try {
        const apiKeyService = ApiKeyService.getInstance();
        await apiKeyService.initialize();
        console.log('API keys initialized successfully');
      } catch (error) {
        console.error('Failed to initialize API keys:', error);
      }
    };

    initializeApiKeys();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/history" element={<History />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/about" element={<About />} />
            <Route path="/pitch" element={<Pitch />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
