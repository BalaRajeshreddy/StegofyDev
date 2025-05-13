import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, ArrowLeft } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface QRCustomizerProps {
  qrData: {
    url: string;
    color: string;
    backgroundColor: string;
    logo: string;
    shape: string;
    frame: string;
  };
  onBack: () => void;
  onSave?: (qrImageUrl: string) => void;
  isSaving?: boolean;
}

export function QRCustomizer({ qrData, onBack, onSave, isSaving = false }: QRCustomizerProps) {
  const [color, setColor] = useState(qrData.color);
  const [backgroundColor, setBackgroundColor] = useState(qrData.backgroundColor);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [size, setSize] = useState(300);
  
  // Always append ?qr=1 for landing page URLs if not present
  let qrUrl = qrData.url;
  if (qrUrl && qrUrl.includes(window.location.origin) && !qrUrl.includes('qr=1')) {
    qrUrl += (qrUrl.includes('?') ? '&' : '?') + 'qr=1';
  }
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrUrl)}&bgcolor=${backgroundColor.replace('#', '')}&color=${color.replace('#', '')}`;

  const handleDownload = () => {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" className="gap-2" onClick={onBack}>
        <ArrowLeft size={16} />
        Back to QR Settings
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="rounded-lg border overflow-hidden bg-white">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Preview</h3>
          </div>
          <div 
            className="flex flex-col items-center justify-center p-8"
            style={{ backgroundColor }}
          >
            <div className="bg-white p-4 rounded shadow-sm">
              <img 
                src={qrImageUrl} 
                alt="QR Code preview" 
                className="mx-auto"
                style={{ borderRadius: `${cornerRadius}px` }}
              />
            </div>
            <p className="mt-4 text-sm text-center">
              Scans to: <a href={qrData.url} className="text-primary underline" target="_blank" rel="noreferrer">{qrData.url}</a>
            </p>
          </div>
        </div>
        
        <div>
          <Tabs defaultValue="design" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="shape">Shape</TabsTrigger>
              <TabsTrigger value="frame">Frame</TabsTrigger>
            </TabsList>
            
            <TabsContent value="design" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="qr-color">QR Color</Label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 border rounded" 
                    style={{ backgroundColor: color }}
                  />
                  <Input 
                    id="qr-color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-9 p-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="background-color">Background Color</Label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 border rounded" 
                    style={{ backgroundColor: backgroundColor }}
                  />
                  <Input 
                    id="background-color"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-9 p-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>QR Size</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[size]}
                    min={100}
                    max={800}
                    step={10}
                    onValueChange={(value) => setSize(value[0])}
                    className="flex-1"
                  />
                  <span className="text-sm">{size}px</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="shape" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Corner Radius</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[cornerRadius]}
                    min={0}
                    max={20}
                    step={1}
                    onValueChange={(value) => setCornerRadius(value[0])}
                    className="flex-1"
                  />
                  <span className="text-sm">{cornerRadius}px</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="frame" className="space-y-4 mt-4">
              <p className="text-muted-foreground">Frame options coming soon</p>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 space-y-4">
            <Button 
              variant="default" 
              className="w-full gap-2"
              onClick={onSave ? () => onSave(qrImageUrl) : undefined}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save QR Code"}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={handleDownload}
            >
              <Download size={16} />
              Download Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
