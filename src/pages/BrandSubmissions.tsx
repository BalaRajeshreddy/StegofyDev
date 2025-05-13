import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

const BrandSubmissions = () => {
  const [userName, setUserName] = useState('...');
  const [brandId, setBrandId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Fetch brand and submissions with pagination and filters
  useEffect(() => {
    async function fetchBrandAndSubmissions() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'Brand User');
      // Get brand id
      const { data: brand } = await supabase
        .from('brands')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (brand && brand.id) {
        setBrandId(brand.id);
        // Build query with filters
        let query = supabase
          .from('contact_submissions')
          .select('*', { count: 'exact' })
          .eq('brand_id', brand.id);
        if (search) {
          query = query.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,message.ilike.%${search}%`);
        }
        if (dateFrom) {
          query = query.gte('created_at', dateFrom);
        }
        if (dateTo) {
          query = query.lte('created_at', dateTo + 'T23:59:59');
        }
        query = query.order('created_at', { ascending: sortOrder === 'asc' });
        // Pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
        // Fetch
        const { data: submissions, count, error } = await query;
        if (!error) {
          setSubmissions(submissions || []);
          setTotal(count || 0);
        }
      }
      setLoading(false);
    }
    if (page > 0) fetchBrandAndSubmissions();
    // eslint-disable-next-line
  }, [page, pageSize, search, dateFrom, dateTo, sortOrder]);

  return (
    <DashboardLayout userType="Brand" userName={userName}>
      <div className="max-w-6xl mx-auto py-8">
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Contact Form Submissions</CardTitle>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto mt-4 md:mt-0">
              <Input
                type="search"
                placeholder="Search by name, email, or message..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full md:w-64"
              />
              <Input
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                className="w-full md:w-40"
                title="From date"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(1); }}
                className="w-full md:w-40"
                title="To date"
              />
              <select
                value={sortOrder}
                onChange={e => { setSortOrder(e.target.value as 'desc' | 'asc'); setPage(1); }}
                className="border rounded px-2 py-1 text-sm"
                title="Sort by date"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : submissions.length === 0 ? (
              <div className="text-gray-500">No submissions found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-t">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50 cursor-pointer border-b" onClick={() => { setSelected(s); setModalOpen(true); }}>
                        <td className="p-2 whitespace-nowrap">{s.customer_name}</td>
                        <td className="p-2 whitespace-nowrap">{s.customer_email}</td>
                        <td className="p-2 whitespace-nowrap">{new Date(s.created_at).toLocaleString()}</td>
                        <td className="p-2">
                          <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); setSelected(s); setModalOpen(true); }}>View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {total > pageSize && (
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      Page {page} of {Math.ceil(total / pageSize)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={page * pageSize >= total}
                        onClick={() => setPage(page + 1)}
                      >
                        Next
                      </Button>
                      <select
                        className="border rounded px-2 py-1 text-sm ml-2"
                        value={pageSize}
                        onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                      >
                        {[10, 20, 50].map(size => (
                          <option key={size} value={size}>{size} / page</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submission Details</DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-2">
                <div><b>Name:</b> {selected.customer_name}</div>
                <div><b>Email:</b> {selected.customer_email}</div>
                <div><b>Date:</b> {new Date(selected.created_at).toLocaleString()}</div>
                <div><b>Message:</b></div>
                <div className="bg-gray-100 rounded p-3 whitespace-pre-line">{selected.message}</div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default BrandSubmissions; 