import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FileSelector } from '@/components/FileSelector';
import { MediaLibrary } from '@/components/page-builder/MediaLibrary';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const BrandProducts = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    image: '',
    images: [],
    category: '',
    subcategory: '',
    price: '',
    ecommerce_links: [],
    ingredients: '',
    materials: '',
    usage_instructions: '',
    usage_video: '',
    shelf_life: '',
    manufacturing_details: '',
    sustainability: '',
    recycling: '',
    certifications: [],
    faqs: [],
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Brand User');
  const navigate = useNavigate();
  const [brandId, setBrandId] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
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
      // Fetch products for this brand
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('brand_id', brand.id)
        .order('created_at', { ascending: false });
      setProducts(products || []);
      setLoading(false);
    }
    fetchProducts();
  }, [showForm]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // Get the brand for this user (should only be one row, use .single())
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!brand || brandError) {
      alert('No brand found for this user.');
      return;
    }
    const { error } = await supabase.from('products').insert({
      ...form,
      price: form.price ? parseFloat(form.price) : null,
      brand_id: brand.id,
    });
    if (!error) {
      setShowForm(false);
      setForm({
        name: '', description: '', image: '', images: [], category: '', subcategory: '', price: '',
        ecommerce_links: [], ingredients: '', materials: '', usage_instructions: '', usage_video: '',
        shelf_life: '', manufacturing_details: '', sustainability: '', recycling: '', certifications: [], faqs: [],
      });
    } else {
      alert('Error saving product');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: brand } = await supabase
      .from('brands')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!brand) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${brand.id}/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);
    if (uploadError) {
      alert('Error uploading image');
      return;
    }
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);
    setForm((prev) => ({ ...prev, image: publicUrl }));
  };

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

  return (
    <DashboardLayout userType="Brand" userName={userName}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setShowForm(true)}
          >
            Add Product
          </button>
        </div>
        {showForm && (
          <form onSubmit={handleAddProduct} className="bg-white p-6 rounded shadow mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Product Name</label>
              <input name="name" value={form.name} onChange={handleInput} className="w-full border rounded p-2" required />
            </div>
            <div>
              <label className="block font-medium">Category</label>
              <input name="category" value={form.category} onChange={handleInput} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block font-medium">Subcategory</label>
              <input name="subcategory" value={form.subcategory} onChange={handleInput} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block font-medium">Price</label>
              <input name="price" value={form.price} onChange={handleInput} className="w-full border rounded p-2" type="number" step="0.01" />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium">Description</label>
              <textarea name="description" value={form.description} onChange={handleInput} className="w-full border rounded p-2" rows={3} />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium">Image</label>
              <ProductImageInput value={form.image} onChange={img => setForm(prev => ({ ...prev, image: img }))} brandId={brandId} />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium">E-commerce Purchase Links (comma separated)</label>
              <input name="ecommerce_links" value={form.ecommerce_links} onChange={e => setForm(prev => ({ ...prev, ecommerce_links: e.target.value.split(',').map(s => s.trim()) }))} className="w-full border rounded p-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium">Ingredients</label>
              <IngredientsInput value={form.ingredients} onChange={ings => setForm(prev => ({ ...prev, ingredients: ings }))} />
            </div>
            <div>
              <label className="block font-medium">Materials</label>
              <input name="materials" value={form.materials} onChange={handleInput} className="w-full border rounded p-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium">Usage Instructions</label>
              <textarea name="usage_instructions" value={form.usage_instructions} onChange={handleInput} className="w-full border rounded p-2" rows={2} />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium">Usage Video (YouTube or video URL)</label>
              <input name="usage_video" value={form.usage_video} onChange={handleInput} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block font-medium">Shelf Life / Expiry</label>
              <input name="shelf_life" value={form.shelf_life} onChange={handleInput} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block font-medium">Manufacturing Details</label>
              <input name="manufacturing_details" value={form.manufacturing_details} onChange={handleInput} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block font-medium">Sustainability</label>
              <input name="sustainability" value={form.sustainability} onChange={handleInput} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block font-medium">Recycling Instructions</label>
              <input name="recycling" value={form.recycling} onChange={handleInput} className="w-full border rounded p-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium">Certifications (JSON or comma separated)</label>
              <textarea name="certifications" value={Array.isArray(form.certifications) ? form.certifications.join(', ') : form.certifications} onChange={e => setForm(prev => ({ ...prev, certifications: e.target.value.split(',').map(s => s.trim()) }))} className="w-full border rounded p-2" rows={2} />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium">FAQ Section (JSON or comma separated Q&A)</label>
              <textarea name="faqs" value={Array.isArray(form.faqs) ? form.faqs.join(', ') : form.faqs} onChange={e => setForm(prev => ({ ...prev, faqs: e.target.value.split(',').map(s => s.trim()) }))} className="w-full border rounded p-2" rows={2} />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
              <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white border rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 cursor-pointer flex flex-col overflow-hidden group"
                onClick={() => navigate(`/dashboard/brand/products/${product.id}`)}
              >
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                )}
                <div className="p-5 flex flex-col flex-1">
                  <div className="text-xl font-bold text-gray-900 mb-1 truncate">{product.name}</div>
                  <div className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description?.slice(0, 100)}{product.description?.length > 100 ? '...' : ''}</div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg font-semibold text-blue-600">{product.price ? `₹${product.price}` : ''}</span>
                    {product.category && <span className="bg-blue-50 text-blue-500 text-xs px-2 py-1 rounded-full ml-2">{product.category}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BrandProducts; 