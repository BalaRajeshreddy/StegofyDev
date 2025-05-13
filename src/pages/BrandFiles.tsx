import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FileSelector } from '@/components/FileSelector';
import { Button } from '@/components/ui/button';

const BrandFiles = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brandId, setBrandId] = useState(null);
  const [userName, setUserName] = useState('Brand User');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'Brand User');
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
      setLoading(false);
    }
    fetchImages();
  }, [uploading]);

  const handleUpload = async (file) => {
    if (!file || !brandId) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${brandId}/${fileName}`;
    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);
    setUploading(false);
    if (error) {
      alert('Error uploading image');
    }
  };

  return (
    <DashboardLayout userType="Brand" userName={userName}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-start mb-6 gap-4">
          <h1 className="text-2xl font-bold">File Manager</h1>
          <FileSelector
            type="image"
            onSelect={handleUpload}
            brandId={brandId}
            value={null}
          />
        </div>
        {loading ? (
          <div>Loading images...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.length === 0 && <div className="col-span-full text-gray-500">No images uploaded yet.</div>}
            {images.map(img => (
              <div key={img.name} className="bg-white border rounded-lg shadow p-2 flex flex-col items-center">
                <img src={img.url} alt={img.name} className="w-full h-32 object-cover rounded mb-2" />
                <div className="text-xs truncate w-full mb-1">{img.name}</div>
                <div className="text-xs text-gray-400 mb-2">{img.created_at ? new Date(img.created_at).toLocaleString() : ''}</div>
                <Button size="sm" variant="outline" onClick={() => {navigator.clipboard.writeText(img.url)}}>Copy URL</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BrandFiles; 