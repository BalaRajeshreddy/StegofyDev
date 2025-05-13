import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, LayoutPanelLeft, Folder, BarChart2, Plus, Mail, Eye, MousePointerClick } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BrandDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("...");
  const [isLoading, setIsLoading] = useState(true);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>({
    totalViews: 0,
    totalQRScans: 0,
    totalClicks: 0,
    totalSubmissions: 0,
    perPage: [],
    landingPages: [],
    recentQRCodes: []
  });

  // Ensure brand row exists for this user (safe, server-side check)
  useEffect(() => {
    async function ensureBrandRow() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Try to find brand by user_id
      let { data: brand } = await supabase
        .from('brands')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      // If not found, try to find by email and update with user_id
      if (!brand) {
        const { data: brandByEmail } = await supabase
          .from('brands')
          .select('id')
          .eq('email', user.email)
          .maybeSingle();
        if (brandByEmail) {
          await supabase.from('brands').update({ user_id: user.id }).eq('id', brandByEmail.id);
        }
      }
    }
    ensureBrandRow();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (!data.session) {
          toast.error("You need to be logged in to access this page");
          navigate("/auth");
          return;
        }
        
        // Session exists, get user data
        const { user } = data.session;
        if (user) {
          setUserName(user.user_metadata?.name || user.email?.split('@')[0] || "Brand User");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        toast.error("Authentication failed");
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    async function fetchBrandAndAnalytics() {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserName(user.user_metadata?.name || user.email?.split('@')[0] || "Brand User");
      // Get brand id
      const { data: brand } = await supabase
        .from('brands')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (brand && brand.id) {
        setBrandId(brand.id);
        // Fetch landing pages for this brand
        const { data: landingPages } = await supabase
          .from('landing_pages')
          .select('id, title, slug, created_at')
          .eq('brand_id', brand.id)
          .order('created_at', { ascending: false });
        // Fetch recent QR codes for this brand
        const { data: recentQRCodes } = await supabase
          .from('qr_codes')
          .select('id, title, url, created_at')
          .eq('brand_id', brand.id)
          .order('created_at', { ascending: false });
        // Fetch total analytics counts
        const [{ count: totalViews }, { count: totalQRScans }, { count: totalClicks }, { count: totalSubmissions }] = await Promise.all([
          supabase.from('page_views').select('id', { count: 'exact', head: true }).eq('brand_id', brand.id),
          supabase.from('qr_scans').select('id', { count: 'exact', head: true }).eq('brand_id', brand.id),
          supabase.from('page_clicks').select('id', { count: 'exact', head: true }).eq('brand_id', brand.id),
          supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('brand_id', brand.id),
        ]);
        setAnalytics(prev => ({
          ...prev,
          totalViews: totalViews || 0,
          totalQRScans: totalQRScans || 0,
          totalClicks: totalClicks || 0,
          totalSubmissions: totalSubmissions || 0,
          landingPages: landingPages || [],
          recentQRCodes: recentQRCodes || []
        }));
      }
      setIsLoading(false);
    }
    fetchBrandAndAnalytics();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout userType="Brand" userName="...">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="Brand" userName={userName}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex gap-2">
            <Link to="/dashboard/brand/create-qr">
              <Button className="gap-2">
                <Plus size={16} />
                Create QR Code
              </Button>
            </Link>
            <Link to="/dashboard/brand/create-page">
              <Button variant="outline" className="gap-2">
                <Plus size={16} />
                Create Page
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Total Page Views" 
            value={analytics.totalViews}
            icon={<Eye className="h-5 w-5 text-primary-blue" />} 
          />
          <StatsCard 
            title="QR Scans" 
            value={analytics.totalQRScans}
            icon={<QrCode className="h-5 w-5 text-primary-green" />} 
          />
          <StatsCard 
            title="Page Clicks" 
            value={analytics.totalClicks}
            icon={<MousePointerClick className="h-5 w-5 text-primary-orange" />} 
          />
          <Link to="/dashboard/brand/submissions" style={{ textDecoration: 'none' }}>
            <StatsCard 
              title="Form Submissions" 
              value={analytics.totalSubmissions}
              icon={<Mail className="h-5 w-5 text-primary-indigo" />} 
            />
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Recently Added Landing Pages */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Recently Added Landing Pages</h2>
            {analytics.landingPages && analytics.landingPages.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {analytics.landingPages.slice(0, 3).map(page => (
                  <li key={page.id} className="py-2 flex items-center justify-between">
                    <span>{page.title}</span>
                    <a
                      href={`/${page.slug || page.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      View
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-muted-foreground">No landing pages found.</div>
            )}
          </div>
          {/* Recently Created QR Codes */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Recently Created QR Codes</h2>
            {analytics.recentQRCodes && analytics.recentQRCodes.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {analytics.recentQRCodes.slice(0, 3).map(qr => (
                  <li key={qr.id} className="py-2 flex items-center justify-between">
                    <span>{qr.title}</span>
                    <a
                      href={qr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      Open
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-muted-foreground">No QR codes found.</div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BrandDashboard;
