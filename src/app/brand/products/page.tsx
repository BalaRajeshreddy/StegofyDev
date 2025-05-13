import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function BrandProductsPage() {
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
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Get brand for this user
      const { data: brand } = await supabase
        .from('brands')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (!brand) return;
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
    const { data: brand } = await supabase
      .from('brands')
      .select('id')
      .eq('user_id', user.id)
      .single();
    if (!brand) return;
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
      .single();
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

  return (
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
            <label className="block font-medium">Image Upload</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full border rounded p-2" />
            {form.image && <img src={form.image} alt="Product" className="mt-2 h-24 rounded" />}
          </div>
          <div className="md:col-span-2">
            <label className="block font-medium">E-commerce Purchase Links (comma separated)</label>
            <input name="ecommerce_links" value={form.ecommerce_links} onChange={e => setForm(prev => ({ ...prev, ecommerce_links: e.target.value.split(',').map(s => s.trim()) }))} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block font-medium">Ingredients</label>
            <input name="ingredients" value={form.ingredients} onChange={handleInput} className="w-full border rounded p-2" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 shadow hover:shadow-lg cursor-pointer"
              onClick={() => router.push(`/brand/products/${product.id}`)}
            >
              <div className="font-bold text-lg mb-2">{product.name}</div>
              <div className="text-gray-600 mb-2">{product.category}</div>
              <div className="mb-2">{product.description?.slice(0, 80)}{product.description?.length > 80 ? '...' : ''}</div>
              {product.image && <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded" />}
              <div className="mt-2 font-semibold">{product.price ? `₹${product.price}` : ''}</div>
              <a href="/brand/profile" className="text-blue-600 underline mt-2 block">View Brand Portfolio</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 