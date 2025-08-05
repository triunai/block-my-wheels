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

import NotFound from "./pages/core/NotFound";
import { ScanPage } from "./pages/utilities/ScanPage";
import { DriverDashboard } from "./pages/dashboards/DriverDashboard";
import { StickerGenerator } from "./pages/utilities/StickerGenerator";
import { AdminDashboard } from "./pages/dashboards/AdminDashboard";
import { LandingPage } from "./components/LandingPage";

import { Login } from "./pages/auth/Login";
import { Signup } from "./pages/auth/Signup";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import { Unauthorized } from "./pages/auth/Unauthorized";
import { DatabaseDiagnostics } from "./pages/utilities/DatabaseDiagnostics";
import { ProfileManager } from "./pages/utilities/ProfileManager";

import { DemoNavigation } from "./pages/DemoNavigation";

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
                <Route path="/demo" element={<DemoNavigation />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                <Route path="/t/:token" element={<ScanPageWrapper />} />
                
                {/* All routes now public for demo */}
                <Route path="/stickers" element={<StickerGenerator />} />
                <Route path="/dashboard" element={<DriverDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/diagnostics" element={<DatabaseDiagnostics />} />
                <Route path="/profile" element={<ProfileManager />} />
                <Route path="/quick-diagnostic" element={<QuickDiagnostic />} />
                
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
