import React, { useState } from 'react';
import { FileAsset } from '@/types/file';
import { FileUpload } from './FileUpload';
import { FileManager } from './FileManager';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface FileSelectorProps {
  type: 'image' | 'pdf';
  onSelect: (file: any) => void; // Changed to 'any' to accommodate various file types
  brandId: string;
  value?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const FileSelector: React.FC<FileSelectorProps> = ({
  type,
  onSelect,
  brandId,
  value
}) => {
  const [showFileManager, setShowFileManager] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [url, setUrl] = useState(value || '');

  const handleFileSelect = (file: FileAsset) => {
    onSelect(file);
    setShowFileManager(false);
  };

  const handleFileUpload = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      alert(`File size must be less than 5MB`);
      return;
    }
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${brandId}/${fileName}`;
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);
      if (uploadError) {
        throw uploadError;
      }
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
      // Insert file metadata into files table
      await supabase.from('files').insert({
        brand_id: brandId,
        name: file.name,
        url: publicUrl,
        size: file.size,
        mime_type: file.type,
        type: file.type.startsWith('image/') ? 'IMAGE' : file.type.endsWith('pdf') ? 'PDF' : 'OTHER',
      });
      onSelect({
        url: publicUrl,
        alt: file.name,
        file: file
      });
      setShowUpload(false);
    } catch (error) {
      alert('Error uploading image.');
      console.error(error);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    onSelect({
      url: newUrl,
      alt: 'Image'
    });
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="url">URL</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="existing">Existing Files</TabsTrigger>
        </TabsList>
        <TabsContent value="url" className="space-y-2">
          <Label>Enter URL</Label>
          <Input
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder={`Enter ${type === 'image' ? 'image' : 'PDF'} URL`}
          />
        </TabsContent>
        <TabsContent value="upload">
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">Upload New File</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New {type === 'image' ? 'Image' : 'PDF'}</DialogTitle>
              </DialogHeader>
              <FileUpload
                onUpload={handleFileUpload}
                accept={type === 'image' ? 'image/*' : '.pdf'}
                maxSize={MAX_FILE_SIZE}
                brandId={brandId}
              />
            </DialogContent>
          </Dialog>
        </TabsContent>
        <TabsContent value="existing">
          <Dialog open={showFileManager} onOpenChange={setShowFileManager}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">Select Existing File</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Select {type === 'image' ? 'Image' : 'PDF'}</DialogTitle>
              </DialogHeader>
              <FileManager
                brandId={brandId}
                onFileSelect={handleFileSelect}
                fileTypes={[type]}
              />
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};
