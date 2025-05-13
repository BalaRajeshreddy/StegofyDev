import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, QrCode, Building2, BarChart2 } from "lucide-react";
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  const [pendingBrands, setPendingBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);

  useEffect(() => {
    async function fetchPendingBrands() {
      setLoadingBrands(true);
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      setPendingBrands(data || []);
      setLoadingBrands(false);
    }
    fetchPendingBrands();
  }, []);

  const handleApprove = async (brandId, brandEmail) => {
    // Approve the brand
    const { error } = await supabase
      .from('brands')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', brandId);
    if (!error) {
      setPendingBrands((prev) => prev.filter((b) => b.id !== brandId));
      // TODO: Send email to brandEmail (implement SMTP logic later)
      alert('Brand approved! (Email will be sent)');
    } else {
      alert('Error approving brand');
    }
  };

  return (
    <DashboardLayout userType="Admin" userName="Admin User">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Total Brands" 
            value="87"
            icon={<Building2 className="h-5 w-5 text-primary-indigo" />}
            trend={{ value: "12 new this month", positive: true }}
          />
          <StatsCard 
            title="Total Users" 
            value="342"
            icon={<Users className="h-5 w-5 text-primary-blue" />}
            trend={{ value: "28 new this month", positive: true }}
          />
          <StatsCard 
            title="Total QR Codes" 
            value="1,568"
            icon={<QrCode className="h-5 w-5 text-primary-green" />}
            trend={{ value: "156 new this month", positive: true }}
          />
          <StatsCard 
            title="Total Scans" 
            value="25,842"
            icon={<BarChart2 className="h-5 w-5 text-primary-orange" />}
            trend={{ value: "3.2k this month", positive: true }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Brands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Acme Inc.", qrCodes: 56, scans: 2456 },
                  { name: "Tech Solutions", qrCodes: 43, scans: 1876 },
                  { name: "Global Foods", qrCodes: 38, scans: 1654 },
                  { name: "Fashion Brand", qrCodes: 32, scans: 1245 },
                  { name: "Sports Company", qrCodes: 28, scans: 987 },
                ].map((brand, index) => (
                  <div key={index} className="flex items-center hover:bg-muted rounded-md p-2">
                    <div className="h-10 w-10 bg-primary-indigo/10 rounded-full flex items-center justify-center">
                      <span className="font-medium">{index + 1}</span>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="font-medium">{brand.name}</p>
                      <p className="text-xs text-muted-foreground">{brand.qrCodes} QR codes</p>
                    </div>
                    <div className="text-sm font-medium">
                      {brand.scans.toLocaleString()} scans
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "New brand registered", brand: "Coffee Shop", time: "2 hours ago" },
                  { action: "QR code created", brand: "Tech Solutions", time: "5 hours ago" },
                  { action: "Landing page published", brand: "Fashion Brand", time: "6 hours ago" },
                  { action: "User registered", brand: "n/a", time: "1 day ago" },
                  { action: "QR code scanned 100+ times", brand: "Global Foods", time: "1 day ago" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center hover:bg-muted rounded-md p-2">
                    <div className="w-2 h-2 rounded-full bg-primary-blue"></div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">By {activity.brand}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Pending Brand Approvals</h2>
          {loadingBrands ? (
            <div>Loading pending brands...</div>
          ) : pendingBrands.length === 0 ? (
            <div className="text-muted-foreground">No pending brands for approval.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded shadow">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">Brand Name</th>
                    <th className="px-4 py-2 border">Contact</th>
                    <th className="px-4 py-2 border">Email</th>
                    <th className="px-4 py-2 border">Mobile</th>
                    <th className="px-4 py-2 border">Industry</th>
                    <th className="px-4 py-2 border">Employees</th>
                    <th className="px-4 py-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingBrands.map((brand) => (
                    <tr key={brand.id}>
                      <td className="px-4 py-2 border font-semibold">{brand.name}</td>
                      <td className="px-4 py-2 border">{brand.contact_first_name} {brand.contact_last_name}</td>
                      <td className="px-4 py-2 border">{brand.contact_email || brand.email}</td>
                      <td className="px-4 py-2 border">{brand.contact_mobile}</td>
                      <td className="px-4 py-2 border">{brand.industry_category}</td>
                      <td className="px-4 py-2 border">{brand.num_employees}</td>
                      <td className="px-4 py-2 border">
                        <Button size="sm" onClick={() => handleApprove(brand.id, brand.contact_email || brand.email)}>
                          Approve
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
