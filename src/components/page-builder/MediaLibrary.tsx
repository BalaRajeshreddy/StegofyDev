import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MediaLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectImage: (url: string, alt: string) => void;
}

export function MediaLibrary({ open, onOpenChange, onSelectImage }: MediaLibraryProps) {
  const [images, setImages] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [brandId, setBrandId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchImages();
    }
    // eslint-disable-next-line
  }, [open]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Get brand for this user
      const { data: brand } = await supabase
        .from('brands')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (!brand) return;
      setBrandId(brand.id);
      // List all files in the brand's folder
      const { data: files, error } = await supabase.storage
        .from('product-images')
        .list(`${brand.id}/`, { limit: 100, offset: 0 });
      if (error) {
        setImages([]);
        setLoading(false);
        toast.error('Failed to load files. Please try again.');
        return;
      }
      // Get public URLs for each file
      const imagesWithUrls = files
        .filter(f => f.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
        .map(f => {
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(`${brand.id}/${f.name}`);
          return { ...f, url: publicUrl };
        });
      setImages(imagesWithUrls);
    } catch (error) {
      setImages([]);
      toast.error('Failed to load files. Please try again.');
    }
    setLoading(false);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0 || !brandId) {
        return;
      }
      setIsUploading(true);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `${brandId}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);
        if (uploadError) throw uploadError;
      }
      toast.success('Images uploaded successfully');
      fetchImages();
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectImage = () => {
    if (selectedImage) {
      onSelectImage(selectedImage, altText || 'Image');
      onOpenChange(false);
      setSelectedImage(null);
      setAltText("");
    } else {
      toast.error('Please select an image');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="library" className="flex-1 flex flex-col overflow-hidden">
          <TabsList>
            <TabsTrigger value="library">My Images</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>
          <TabsContent value="library" className="flex-1 overflow-hidden flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4">
                <ImageIcon className="w-12 h-12 mb-4 opacity-40" />
                <p>Loading images...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4">
                <ImageIcon className="w-12 h-12 mb-4 opacity-40" />
                <p>No images uploaded yet</p>
                <p className="text-sm">Upload some images to get started</p>
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-3 gap-4 p-4">
                  {images.map((image) => (
                    <div
                      key={image.name}
                      className={`aspect-square border rounded-md overflow-hidden cursor-pointer relative ${selectedImage === image.url ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedImage(image.url)}
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                      {selectedImage === image.url && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center">
                            ✓
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedImage && (
              <div className="border-t p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="alt-text">Alt Text (for accessibility)</Label>
                  <Input
                    id="alt-text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe what's in the image"
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSelectImage}>
                    Use Selected Image
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="upload" className="flex-1 flex flex-col">
            <div className="flex-1 border-2 border-dashed rounded-md flex flex-col items-center justify-center p-8">
              <Upload className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Drag & drop images here</p>
              <p className="text-sm text-muted-foreground mb-4">Or click to browse files</p>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleUpload}
                disabled={isUploading}
              />
              <Button
                asChild
                variant="outline"
                disabled={isUploading}
              >
                <label htmlFor="image-upload">
                  {isUploading ? 'Uploading...' : 'Select Files'}
                </label>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
