import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { QRCustomizer } from "./QRCustomizer";
import { Palette, Link as LinkIcon, LayoutTemplate } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface LandingPageOption {
  id: string;
  title: string;
  slug: string;
}

interface QRGeneratorProps {
  userId: string;
  initialPageId?: string | null;
}

export function QRGenerator({ userId, initialPageId }: QRGeneratorProps) {
  const [url, setUrl] = useState('');
  const [qrType, setQrType] = useState(initialPageId ? 'landing-page' : 'direct');
  const [landingPages, setLandingPages] = useState<LandingPageOption[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>(initialPageId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [qrTitle, setQrTitle] = useState('');
  const [qrDescription, setQrDescription] = useState('');
  
  const [qrCodeData, setQRCodeData] = useState({
    url: '',
    color: '#3F51B5',
    backgroundColor: '#FFFFFF',
    logo: '',
    shape: 'square',
    frame: 'none',
  });
  
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch landing pages if user is logged in
    const fetchLandingPages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('landing_pages')
          .select('id, title, slug')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setLandingPages(data || []);

        // If initialPageId is provided, select it
        if (initialPageId) {
          setSelectedPageId(initialPageId);
        }
      } catch (error) {
        console.error('Error fetching landing pages:', error);
        toast.error('Failed to load landing pages');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchLandingPages();
    }
  }, [userId, initialPageId]);

  const generateQRCode = () => {
    let finalUrl = '';
    let finalTitle = qrTitle.trim() || 'My QR Code';
    
    if (qrType === 'landing-page') {
      if (!selectedPageId) {
        toast.error("Please select a landing page");
        return;
      }
      
      const selectedPage = landingPages.find(page => page.id === selectedPageId);
      if (selectedPage) {
        // Generate the custom URL using the slug
        finalUrl = `${window.location.origin}/${selectedPage.slug}`;
        if (!qrTitle) finalTitle = `QR for ${selectedPage.title}`;
      } else {
        toast.error("Invalid landing page selection");
        return;
      }
    } else {
      if (!url) {
        toast.error("Please enter a URL");
        return;
      }

      // Make sure URL has http:// or https:// prefix
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        finalUrl = `https://${url}`;
      } else {
        finalUrl = url;
      }
    }
    
    setQRCodeData({
      ...qrCodeData,
      url: finalUrl,
    });
    
    setStep(2);
  };

  const saveQRCode = async (qrImageUrl: string) => {
    setIsSaving(true);
    try {
      let brandId = null;
      // Fetch brand_id for the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: brand } = await supabase
          .from('brands')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        if (brand && brand.id) brandId = brand.id;
      }
      // Step 1: Insert QR code with a temporary URL
      let tempUrl = qrCodeData.url;
      const qrData = {
        user_id: userId,
        brand_id: brandId,
        title: qrTitle || 'My QR Code',
        description: qrDescription,
        url: tempUrl,
        landing_page_id: qrType === 'landing-page' ? selectedPageId : null
      };
      const { data: inserted, error: insertError } = await supabase
        .from('qr_codes')
        .insert(qrData)
        .select();
      if (insertError) throw insertError;
      const qrCodeId = inserted?.[0]?.id;
      let finalUrl = tempUrl;
      // Step 2: For landing page QR, update URL to include ?qr_id=THE_QR_CODE_ID
      if (qrType === 'landing-page' && qrCodeId) {
        const urlObj = new URL(tempUrl, window.location.origin);
        urlObj.searchParams.set('qr_id', qrCodeId);
        finalUrl = urlObj.origin + urlObj.pathname + urlObj.search;
        // Update the QR code record with the new URL
        await supabase
          .from('qr_codes')
          .update({ url: finalUrl })
          .eq('id', qrCodeId);
      }
      toast.success('QR Code saved successfully');
      navigate('/dashboard/brand/qr-codes');
    } catch (error) {
      console.error('Error saving QR code:', error);
      toast.error('Failed to save QR code');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto card-shadow rounded-xl overflow-hidden bg-white">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold">Create QR Code</h2>
        <p className="text-muted-foreground">Generate custom QR codes for your brand</p>
      </div>

      <div className="p-6">
        {step === 1 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qr-title">QR Code Title</Label>
                <Input
                  id="qr-title"
                  placeholder="My Product QR"
                  value={qrTitle}
                  onChange={(e) => setQrTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="qr-description">Description (Optional)</Label>
                <Input
                  id="qr-description"
                  placeholder="QR code for my product landing page"
                  value={qrDescription}
                  onChange={(e) => setQrDescription(e.target.value)}
                />
              </div>
            </div>
            
            <Tabs defaultValue="url" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="url">URL</TabsTrigger>
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="vcard">vCard</TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${qrType === 'landing-page' ? 'border-primary bg-primary/5' : 'hover:border-primary'}`}
                      onClick={() => setQrType('landing-page')}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <LayoutTemplate className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">Landing Page</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">Create a QR code for your custom landing page</p>
                      
                      {qrType === 'landing-page' && (
                        <div className="mt-4">
                          <Label htmlFor="landing-page">Select Landing Page</Label>
                          {landingPages.length > 0 ? (
                            <div className="flex mt-1">
                              <Select 
                                value={selectedPageId} 
                                onValueChange={setSelectedPageId}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a landing page" />
                                </SelectTrigger>
                                <SelectContent>
                                  {landingPages.map(page => (
                                    <SelectItem key={page.id} value={page.id}>
                                      {page.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <div className="mt-2 flex flex-col">
                              <p className="text-sm text-muted-foreground mb-2">
                                No landing pages found. Create one first.
                              </p>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate('/dashboard/brand/create-page')}
                              >
                                Create Landing Page
                              </Button>
                            </div>
                          )}
                          
                          {selectedPageId && (
                            <div className="mt-3">
                              <Label>Generated URL</Label>
                              <div className="mt-1 p-2 bg-gray-50 rounded border text-sm font-mono break-all">
                                {window.location.origin}/
                                {landingPages.find(p => p.id === selectedPageId)?.slug || '...'}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                This URL will be opened when the QR code is scanned
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${qrType === 'direct' ? 'border-primary bg-primary/5' : 'hover:border-primary'}`}
                      onClick={() => setQrType('direct')}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <LinkIcon className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">Direct URL</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">Link directly to any website</p>
                      
                      {qrType === 'direct' && (
                        <div className="mt-4">
                          <Label htmlFor="url">Enter URL</Label>
                          <div className="flex mt-1">
                            <div className="relative flex-grow">
                              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="url"
                                placeholder="example.com"
                                className="pl-9"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            https:// will be added automatically if not included
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={generateQRCode} 
                    className="w-full"
                    disabled={(qrType === 'direct' && !url) || (qrType === 'landing-page' && !selectedPageId)}
                  >
                    Next
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="text" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="text">Enter Text</Label>
                    <div className="flex mt-1">
                      <Input
                        id="text"
                        placeholder="Enter your text here"
                      />
                      <Button className="ml-2">
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="vcard" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" className="mt-1" />
                    </div>
                  </div>
                  <Button className="w-full">
                    Next
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <QRCustomizer 
            qrData={qrCodeData} 
            onBack={() => setStep(1)}
            onSave={saveQRCode}
            isSaving={isSaving}
          />
        )}
      </div>
    </div>
  );
}
