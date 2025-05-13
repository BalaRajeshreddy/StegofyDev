import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProfilePage from './components/profile/ProfilePage';
import { supabase, setupStorageBuckets } from "@/integrations/supabase/client";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import BrandDashboard from "./pages/BrandDashboard";
import QRCreator from "./pages/QRCreator";
import PageCreator from "./pages/PageCreator";
import LandingPagesList from "./pages/LandingPagesList";
import QRCodesList from "./pages/QRCodesList";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";
import PublishedLandingPage from "./pages/PublishedLandingPage";
import BrandProducts from "./pages/BrandProducts";
import BrandProductDetail from "./pages/BrandProductDetail";
import BrandSubmissions from './pages/BrandSubmissions';
import BrandAnalytics from "./pages/BrandAnalytics";
import BrandFiles from "./pages/BrandFiles";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Set up Supabase storage buckets when the app loads
    setupStorageBuckets();
    
    // Log authentication state for debugging
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Supabase auth event:', event);
      console.log('Session:', session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Brand Routes */}
            <Route path="/dashboard/brand" element={<BrandDashboard />} />
            <Route path="/dashboard/brand/create-qr" element={<QRCreator />} />
            <Route path="/dashboard/brand/create-page" element={<PageCreator />} />
            <Route path="/dashboard/brand/edit-page/:pageId" element={<PageCreator />} />
            <Route path="/dashboard/brand/edit-qr/:qrid" element={<QRCreator />} />
            <Route path="/dashboard/brand/landing-pages" element={<LandingPagesList />} />
            <Route path="/dashboard/brand/qr-codes" element={<QRCodesList />} />
            <Route path="/dashboard/brand/products" element={<BrandProducts />} />
            <Route path="/dashboard/brand/products/:id" element={<BrandProductDetail />} />
            <Route path="/dashboard/brand/submissions" element={<BrandSubmissions />} />
            <Route path="/dashboard/brand/analytics" element={<BrandAnalytics />} />
            <Route path="/dashboard/brand/files" element={<BrandFiles />} />
            
            {/* Admin Routes */}
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            
            {/* User Routes */}
            <Route path="/dashboard/user" element={<UserDashboard />} />
            
            {/* Profile Route */}
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Published Landing Page Route - Moved to the top for priority */}
            <Route path="/:slug" element={<PublishedLandingPage />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
