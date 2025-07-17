import React from "react";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./lib/darkMode";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, AdminRoute, DriverRoute } from "./components/ProtectedRoute";
import Index from "./pages/core/Index";
import NotFound from "./pages/core/NotFound";
import { ScanPage } from "./pages/utilities/ScanPage";
import { DriverDashboard } from "./pages/dashboards/DriverDashboard";
import { StickerGenerator } from "./pages/utilities/StickerGenerator";
import { AdminDashboard } from "./pages/dashboards/AdminDashboard";
import { LandingPage } from "./components/LandingPage";
import AnimationDemo from "./pages/animations/AnimationDemo";
import TrafficHeroDemo from "./pages/animations/TrafficHeroDemo";
import EpicShowcase from "./pages/animations/EpicShowcase";
import { Login } from "./pages/auth/Login";
import { Signup } from "./pages/auth/Signup";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import { Unauthorized } from "./pages/auth/Unauthorized";

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
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/animations" element={<AnimationDemo />} />
                <Route path="/traffic" element={<TrafficHeroDemo />} />
                <Route path="/3d" element={<EpicShowcase />} />
                <Route path="/t/:token" element={<ScanPageWrapper />} />
                <Route path="/legacy" element={<Index />} />
                
                {/* Protected routes */}
                <Route 
                  path="/stickers" 
                  element={
                    <ProtectedRoute>
                      <StickerGenerator />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <DriverRoute>
                      <DriverDashboard />
                    </DriverRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } 
                />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </ThemeProvider>
);

export default App;
