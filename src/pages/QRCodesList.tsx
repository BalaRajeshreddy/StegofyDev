import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QrCode, Edit, Trash, Download, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QRCode {
  id: string;
  title: string;
  description: string | null;
  url: string;
  views: number;
  created_at: string;
  landing_page: {
    title: string;
    slug: string;
  } | null;
}

const QRCodesList = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("...");
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);

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
          
          // Fetch QR codes for the user with landing page details
          const { data: codes, error: fetchError } = await supabase
            .from('qr_codes')
            .select(`
              *,
              landing_page:landing_page_id (
                title,
                slug
              )
            `)
            .order('created_at', { ascending: false });
            
          if (fetchError) {
            throw fetchError;
          }
          
          setQRCodes(codes || []);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setQRCodes(prevCodes => prevCodes.filter(code => code.id !== id));
      toast.success("QR code deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete QR code");
    }
  };

  // Generate QR image URL (same as QRCustomizer)
  const getQRImageUrl = (qr) => {
    // You may want to store color/backgroundColor in the QR code record in the future
    const size = 300;
    const color = '3F51B5'; // default blue
    const backgroundColor = 'FFFFFF'; // default white
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qr.url)}&bgcolor=${backgroundColor}&color=${color}`;
  };

  // Download handler
  const handleDownload = async (qr) => {
    const qrImageUrl = getQRImageUrl(qr);
    // Sanitize the QR code title for use as a filename
    const safeTitle = (qr.title || 'qrcode')
      .toLowerCase()
      .replace(/[^a-z0-9\-_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50) || 'qrcode';
    const filename = `${safeTitle}.png`;
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      if (typeof toast === 'function') toast('Failed to download QR code image.');
    }
  };

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
          <h1 className="text-2xl font-bold tracking-tight">QR Codes</h1>
          <Link to="/dashboard/brand/create-qr">
            <Button className="gap-2">
              <QrCode size={16} />
              Create New QR Code
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your QR Codes</CardTitle>
          </CardHeader>
          <CardContent>
            {qrCodes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Scans</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qrCodes.map((qr) => (
                    <TableRow key={qr.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                            <QrCode size={20} />
                          </div>
                          <div>
                            <p>{qr.title}</p>
                            {qr.description && (
                              <p className="text-xs text-muted-foreground">{qr.description}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {qr.landing_page ? (
                          <div>
                            <p className="text-sm">{qr.landing_page.title}</p>
                            <div className="flex items-center mt-1">
                              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                /{qr.landing_page.slug}
                              </code>
                              <a 
                                href={qr.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-primary hover:text-primary/80 ml-2"
                              >
                                <ExternalLink size={14} />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="text-sm truncate max-w-[200px]">{qr.url}</span>
                            <a 
                              href={qr.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-primary hover:text-primary/80 ml-2"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{qr.views || 0}</TableCell>
                      <TableCell>{new Date(qr.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Download"
                            onClick={() => handleDownload(qr)}
                          >
                            <Download size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/dashboard/brand/edit-qr/${qr.id}`)}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(qr.id)}
                            title="Delete"
                          >
                            <Trash size={16} className="text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 space-y-4">
                <QrCode className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No QR codes yet</h3>
                <p className="text-muted-foreground">You haven't created any QR codes yet.</p>
                <Button asChild>
                  <Link to="/dashboard/brand/create-qr">Create Your First QR Code</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default QRCodesList;
