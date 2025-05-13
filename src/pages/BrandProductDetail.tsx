import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FileSelector } from '@/components/FileSelector';
import { MediaLibrary } from '@/components/page-builder/MediaLibrary';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

function isFileWithUrl(img: unknown): img is { url: string } {
  return typeof img === 'object' && img !== null && 'url' in img && typeof (img as any).url === 'string';
}

function ProductImageInput({ value, onChange, brandId }) {
  const [showLibrary, setShowLibrary] = useState(false);
  const [url, setUrl] = useState(value || '');
  return (
    <div>
      <Tabs defaultValue="upload">
        <TabsList>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="library">Select</TabsTrigger>
          <TabsTrigger value="url">Paste URL</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <FileSelector
            type="image"
            onSelect={file => file && (typeof file === 'object' && file !== null && 'url' in file ? onChange(file.url) : onChange(file))}
            brandId={brandId}
            value={value}
          />
        </TabsContent>
        <TabsContent value="library">
          <Button onClick={() => setShowLibrary(true)}>Open Media Library</Button>
          <MediaLibrary
            open={showLibrary}
            onOpenChange={setShowLibrary}
            onSelectImage={img => {
              if (img == null) return;
              if (isFileWithUrl(img)) {
                onChange(img.url);
              } else {
                onChange(img);
              }
              setShowLibrary(false);
            }}
          />
        </TabsContent>
        <TabsContent value="url">
          <Input
            placeholder="Paste image URL"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onBlur={() => onChange(url)}
          />
        </TabsContent>
      </Tabs>
      {value && <img src={value} alt="Product" className="mt-2 h-24 rounded" />}
    </div>
  );
}

function IngredientsInput({ value, onChange }) {
  const [ingredients, setIngredients] = useState(value || []);
  const handleChange = (idx, field, val) => {
    const updated = ingredients.map((ing, i) =>
      i === idx ? { ...ing, [field]: val } : ing
    );
    setIngredients(updated);
    onChange(updated);
  };
  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '' }]);
    onChange([...ingredients, { name: '', quantity: '' }]);
  };
  const removeIngredient = idx => {
    const updated = ingredients.filter((_, i) => i !== idx);
    setIngredients(updated);
    onChange(updated);
  };
  return (
    <div>
      {ingredients.map((ing, idx) => (
        <div key={idx} className="flex gap-2 mb-2">
          <Input
            placeholder="Name"
            value={ing.name}
            onChange={e => handleChange(idx, 'name', e.target.value)}
          />
          <Input
            placeholder="Quantity"
            value={ing.quantity}
            onChange={e => handleChange(idx, 'quantity', e.target.value)}
          />
          <Button type="button" onClick={() => removeIngredient(idx)}>Remove</Button>
        </div>
      ))}
      <Button type="button" onClick={addIngredient}>Add Ingredient</Button>
    </div>
  );
}

const BrandProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Brand User');
  const [brandId, setBrandId] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'Brand User');
      // Get brand for this user
      let brandIdFetched = null;
      if (user) {
        const { data: brand } = await supabase
          .from('brands')
          .select('id')
          .eq('user_id', user.id)
          .single();
        if (brand) brandIdFetched = brand.id;
      }
      setBrandId(brandIdFetched);
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      setProduct(data);
      // Parse ingredients as array if possible
      let ingredients = [];
      if (data && data.ingredients) {
        try {
          ingredients = typeof data.ingredients === 'string' ? JSON.parse(data.ingredients) : data.ingredients;
        } catch {
          ingredients = [];
        }
      }
      setForm({ ...data, ingredients });
      setLoading(false);
    }
    if (id) fetchProduct();
  }, [id]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('products').update({
      ...form,
      price: form.price ? parseFloat(form.price) : null,
      ingredients: JSON.stringify(form.ingredients),
    }).eq('id', id);
    if (!error) {
      alert('Product updated');
      navigate(0); // reload
    } else {
      alert('Error updating product');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      navigate('/dashboard/brand/products');
    } else {
      alert('Error deleting product');
    }
  };

  if (loading) return <DashboardLayout userType="Brand" userName={userName}><div className="p-8">Loading...</div></DashboardLayout>;
  if (!product) return <DashboardLayout userType="Brand" userName={userName}><div className="p-8">Product not found</div></DashboardLayout>;

  return (
    <DashboardLayout userType="Brand" userName={userName}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
        <form onSubmit={handleSave} className="bg-white p-6 rounded shadow mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-2">Basic Info</h2>
          </div>
          <div>
            <label className="block font-medium">Product Name</label>
            <input name="name" value={form.name || ''} onChange={handleInput} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block font-medium">Category</label>
            <input name="category" value={form.category || ''} onChange={handleInput} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block font-medium">Subcategory</label>
            <input name="subcategory" value={form.subcategory || ''} onChange={handleInput} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block font-medium">Price</label>
            <input name="price" value={form.price || ''} onChange={handleInput} className="w-full border rounded p-2" type="number" step="0.01" />
          </div>
          <div className="md:col-span-2">
            <label className="block font-medium">Description</label>
            <textarea name="description" value={form.description || ''} onChange={handleInput} className="w-full border rounded p-2" rows={3} />
          </div>
          <div className="md:col-span-2">
            <hr className="my-4" />
            <h2 className="text-lg font-semibold mb-2">Media</h2>
          </div>
          <div className="md:col-span-2">
            <label className="block font-medium">Image</label>
            <ProductImageInput value={form.image} onChange={img => setForm(prev => ({ ...prev, image: img }))} brandId={brandId} />
          </div>
          <div className="md:col-span-2">
            <hr className="my-4" />
            <h2 className="text-lg font-semibold mb-2">Details</h2>
          </div>
          <div className="md:col-span-2">
            <label className="block font-medium">E-commerce Purchase Links (comma separated)</label>
            <input name="ecommerce_links" value={Array.isArray(form.ecommerce_links) ? form.ecommerce_links.join(', ') : form.ecommerce_links || ''} onChange={e => setForm(prev => ({ ...prev, ecommerce_links: e.target.value.split(',').map(s => s.trim()) }))} className="w-full border rounded p-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block font-medium">Ingredients</label>
            <IngredientsInput value={form.ingredients} onChange={ings => setForm(prev => ({ ...prev, ingredients: ings }))} />
          </div>
          <div>
            <label className="block font-medium">Materials</label>
            <input name="materials" value={form.materials || ''} onChange={handleInput} className="w-full border rounded p-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block font-medium">Usage Instructions</label>
            <textarea name="usage_instructions" value={form.usage_instructions || ''} onChange={handleInput} className="w-full border rounded p-2" rows={2} />
          </div>
          <div className="md:col-span-2">
            <label className="block font-medium">Usage Video (YouTube or video URL)</label>
            <input name="usage_video" value={form.usage_video || ''} onChange={handleInput} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block font-medium">Shelf Life / Expiry</label>
            <input name="shelf_life" value={form.shelf_life || ''} onChange={handleInput} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block font-medium">Manufacturing Details</label>
            <input name="manufacturing_details" value={form.manufacturing_details || ''} onChange={handleInput} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block font-medium">Sustainability</label>
            <input name="sustainability" value={form.sustainability || ''} onChange={handleInput} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block font-medium">Recycling Instructions</label>
            <input name="recycling" value={form.recycling || ''} onChange={handleInput} className="w-full border rounded p-2" />
          </div>
          <div className="md:col-span-2">
            <hr className="my-4" />
            <h2 className="text-lg font-semibold mb-2">More Info</h2>
          </div>
          <div className="md:col-span-2">
            <label className="block font-medium">Certifications (JSON or comma separated)</label>
            <textarea name="certifications" value={Array.isArray(form.certifications) ? form.certifications.join(', ') : form.certifications || ''} onChange={e => setForm(prev => ({ ...prev, certifications: e.target.value.split(',').map(s => s.trim()) }))} className="w-full border rounded p-2" rows={2} />
          </div>
          <div className="md:col-span-2">
            <label className="block font-medium">FAQ Section (JSON or comma separated Q&A)</label>
            <textarea name="faqs" value={Array.isArray(form.faqs) ? form.faqs.join(', ') : form.faqs || ''} onChange={e => setForm(prev => ({ ...prev, faqs: e.target.value.split(',').map(s => s.trim()) }))} className="w-full border rounded p-2" rows={2} />
          </div>
          <div className="md:col-span-2 flex gap-2 mt-4">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
            <button type="button" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" onClick={handleDelete}>Delete</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default BrandProductDetail; 