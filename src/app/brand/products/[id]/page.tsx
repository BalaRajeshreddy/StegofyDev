import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      setProduct(data);
      setForm(data);
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
    }).eq('id', id);
    if (!error) {
      alert('Product updated');
      router.refresh();
    } else {
      alert('Error updating product');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      router.push('/brand/products');
    } else {
      alert('Error deleting product');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!product) return <div className="p-8">Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <form onSubmit={handleSave} className="bg-white p-6 rounded shadow grid grid-cols-1 gap-4">
        <div>
          <label className="block font-medium">Product Name</label>
          <input name="name" value={form.name} onChange={handleInput} className="w-full border rounded p-2" required />
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
        <div>
          <label className="block font-medium">Description</label>
          <textarea name="description" value={form.description || ''} onChange={handleInput} className="w-full border rounded p-2" rows={3} />
        </div>
        <div>
          <label className="block font-medium">Image URL</label>
          <input name="image" value={form.image || ''} onChange={handleInput} className="w-full border rounded p-2" />
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
          <button type="button" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" onClick={handleDelete}>Delete</button>
          <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => router.push('/brand/products')}>Back</button>
        </div>
      </form>
    </div>
  );
} 