import React from "react";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./lib/darkMode";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ScanPage } from "./pages/ScanPage";
import { DriverDashboard } from "./pages/DriverDashboard";
import { StickerGenerator } from "./pages/StickerGenerator";
import { AdminDashboard } from "./pages/AdminDashboard";
import { LandingPage } from "./components/LandingPage";

// Wrapper component to handle token parameter
const ScanPageWrapper = () => {
  const { token } = useParams<{ token: string }>();
  if (!token) {
    return <NotFound />;
  }
  return <ScanPage token={token} />;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <ThemeProvider>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/stickers" element={<StickerGenerator />} />
              <Route path="/dashboard" element={<DriverDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/t/:token" element={<ScanPageWrapper />} />
              <Route path="/legacy" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </ThemeProvider>
);

export default App;
