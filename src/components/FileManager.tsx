import React, { useEffect, useState } from 'react';
import { FileAsset } from '@/types/file';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageIcon, FileIcon, Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface FileManagerProps {
  brandId: string;
  onFileSelect: (file: FileAsset) => void;
  filterType?: 'image' | 'pdf';
  fileTypes?: ('image' | 'pdf')[];
}

export const FileManager: React.FC<FileManagerProps> = ({
  brandId,
  onFileSelect,
  filterType,
  fileTypes
}) => {
  const [files, setFiles] = useState<FileAsset[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        setError(null);
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
            };
          });
        setFiles(filesWithUrls);
      } catch (error) {
        setFiles([]);
        setError('Failed to load files. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [brandId]);

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name?.toLowerCase().includes(search.toLowerCase());
    const matchesType = !filterType || 
      (filterType === 'image' && file.type === 'image');
    // Also check against fileTypes if provided
    const matchesFileTypes = !fileTypes || 
      fileTypes.some(type => type === file.type);
    return matchesSearch && (matchesType || matchesFileTypes);
  });

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.map((file) => (
          <Card
            key={file.id}
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => onFileSelect(file)}
          >
            <div className="flex items-center gap-4">
              <img
                src={file.url}
                alt={file.name}
                className="w-16 h-16 object-cover rounded border"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {search ? 'No files match your search' : 'No files found'}
        </div>
      )}
    </div>
  );
};
