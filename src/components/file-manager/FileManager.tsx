import { useState, useEffect } from 'react';
import { FileAsset, FileType } from '@/lib/types/file';
import { FileUpload } from '@/components/shared/FileUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Image, FileText, Folder, Search, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface FileManagerProps {
  brandId: string;
  onSelect?: (file: FileAsset) => void;
  allowedTypes?: FileType[];
  showUpload?: boolean;
}

export function FileManager({
  brandId,
  onSelect,
  allowedTypes = ['image', 'pdf'],
  showUpload = true,
}: FileManagerProps) {
  const [files, setFiles] = useState<FileAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFiles() {
      setLoading(true);
      try {
        // List all files in the brand's folder in Supabase Storage
        const { data: storageFiles, error } = await supabase.storage
          .from('product-images')
          .list(`${brandId}/`, { limit: 100, offset: 0 });
        if (error) throw error;
        // Get public URLs for each file
        const filesWithUrls: FileAsset[] = (storageFiles || [])
          .filter(f => f.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
          .map(f => {
            const { data: { publicUrl } } = supabase.storage
              .from('product-images')
              .getPublicUrl(`${brandId}/${f.name}`);
            return {
              id: f.id || f.name,
              name: f.name,
              url: publicUrl,
              type: 'image',
              size: f.metadata?.size || 0,
              folder: brandId,
              alt: f.name,
              brandId: brandId,
              userId: '',
              createdAt: '',
              updatedAt: '',
              metadata: undefined,
              tags: undefined,
              description: undefined,
              usageCount: 0,
              lastUsed: undefined,
              mimeType: '',
            };
          });
        setFiles(filesWithUrls);
      } catch (error) {
        setFiles([]);
      }
      setLoading(false);
    }
    fetchFiles();
  }, [brandId, showUploadDialog]);

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = allowedTypes.includes(file.type);
    return matchesSearch && matchesType;
  });

  const handleFileUpload = async (file: File) => {
    if (!file || !brandId) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${brandId}/${fileName}`;
    await supabase.storage.from('product-images').upload(filePath, file);
    setShowUploadDialog(false);
  };

  const handleFileSelect = (file: FileAsset) => {
    if (onSelect) {
      onSelect(file);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>
        {showUpload && (
          <Button
            variant="outline"
            className="ml-4"
            onClick={() => setShowUploadDialog(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        )}
      </div>
      <div className="flex-1 p-4">
        {loading ? (
          <div>Loading files...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFiles.map((file) => (
              <Card
                key={file.id}
                className={cn(
                  'cursor-pointer hover:border-primary transition-colors',
                  onSelect && 'hover:bg-muted/50'
                )}
                onClick={() => handleFileSelect(file)}
              >
                <CardContent className="p-4">
                  <div className="aspect-square rounded-md overflow-hidden bg-muted">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredFiles.length === 0 && !loading && (
              <div className="col-span-full text-center text-gray-500">No files found</div>
            )}
          </div>
        )}
      </div>
      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>
              Upload a file to your brand's library
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <FileUpload
              onFileSelect={async (file) => {
                await handleFileUpload(file);
                setShowUploadDialog(false);
              }}
              config={{
                maxSizeInMB: 5,
                allowedTypes: ['image'],
                allowedMimeTypes: [
                  'image/jpeg',
                  'image/png',
                  'image/gif',
                  'image/webp',
                ]
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 