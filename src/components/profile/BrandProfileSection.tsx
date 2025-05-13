import React, { useState, useEffect } from 'react';
import { BrandProfile } from '@/types/profile';
import { supabase, setupStorageBuckets } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileSelector } from '@/components/FileSelector';
import { MediaLibrary } from '@/components/page-builder/MediaLibrary';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface BrandProfileSectionProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const BrandProfileSection: React.FC<BrandProfileSectionProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const [profile, setProfile] = useState<BrandProfile & {
    gstNumber?: string;
    foundedYear?: string;
    hqLocation?: string;
    whatsappSupport?: string;
    supportEmail?: string;
    supportPhone?: string;
    teamMembers?: string[];
    productCategories?: string[];
    logo?: string;
    website?: string;
  }>({
    basicInfo: {
      brandName: '',
      logo: '',
      tagline: '',
      description: '',
      brandVideo: '',
      missionVision: '',
      foundingYear: 0,
    },
    contactInfo: {
      email: '',
      phone: '',
      address: '',
    },
    socialLinks: {
      website: '',
      facebook: '',
      instagram: '',
      linkedin: '',
    },
    certifications: [],
    awards: [],
    campaigns: [],
    featuredProducts: [],
    newLaunchProducts: [],
    reviews: [],
    gstNumber: '',
    foundedYear: '',
    hqLocation: '',
    whatsappSupport: '',
    supportEmail: '',
    supportPhone: '',
    teamMembers: [],
    productCategories: [],
    logo: '',
    website: '',
  });

  const [loading, setLoading] = useState(true);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mapBackendBrandToProfile = (data: any): BrandProfile & any => ({
    basicInfo: {
      brandName: data.name || '',
      logo: data.logo || '',
      tagline: data.tagline || '',
      description: data.description || '',
      brandVideo: data.brand_video || '',
      missionVision: data.mission_vision || '',
      foundingYear: data.founded_year ? Number(data.founded_year) : 0,
    },
    contactInfo: {
      email: data.email || data.contact_email || '',
      phone: data.contact_mobile || data.phone || '',
      address: data.contact_address || data.address || '',
    },
    socialLinks: {
      website: (data.social_handles && data.social_handles.website) || data.website || '',
      facebook: (data.social_handles && data.social_handles.facebook) || '',
      instagram: (data.social_handles && data.social_handles.instagram) || '',
      linkedin: (data.social_handles && data.social_handles.linkedin) || '',
    },
    certifications: data.certifications || [],
    awards: data.awards || [],
    campaigns: data.campaigns || [],
    featuredProducts: data.featured_products || [],
    newLaunchProducts: data.new_launch_products || [],
    reviews: data.reviews || [],
    gstNumber: data.gst_number || '',
    foundedYear: data.founded_year || '',
    hqLocation: data.hq_location || '',
    whatsappSupport: data.whatsapp_support || '',
    supportEmail: data.support_email || '',
    supportPhone: data.support_phone || '',
    teamMembers: data.team_members || [],
    productCategories: data.product_categories || [],
    logo: data.logo || '',
    website: data.website || '',
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        await setupStorageBuckets();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Please login to view your profile');
          setLoading(false);
          toast.error('Please login to view your profile');
          return;
        }
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (error) throw error;
        if (data) {
          setProfile(mapBackendBrandToProfile(data));
          setBrandId(data.id || null);
        }
      } catch (error) {
        setError('Failed to load profile. Please try again.');
        console.error('Error initializing profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, productIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPEG, PNG, and WebP images are allowed');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        if (uploadError.message.includes('duplicate')) {
          toast.error('A file with this name already exists');
        } else {
          throw uploadError;
        }
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Update profile with new image
      const newProducts = [...profile.featuredProducts];
      newProducts[productIndex] = {
        ...newProducts[productIndex],
        images: [...(newProducts[productIndex].images || []), publicUrl]
      };
      setProfile(prev => ({ ...prev, featuredProducts: newProducts }));
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to update your profile');
        return;
      }

      // Validate required fields
      if (!profile.basicInfo.brandName) {
        toast.error('Brand name is required');
        return;
      }

      if (!profile.contactInfo.email) {
        toast.error('Email is required');
        return;
      }

      // Only include fields that are shown/used in the profile page and exist in the brands table
      const updatePayload = {
        user_id: user.id,
        name: profile.basicInfo.brandName,
        logo: profile.logo,
        tagline: profile.basicInfo.tagline,
        description: profile.basicInfo.description,
        website: profile.website,
        gst_number: profile.gstNumber,
        founded_year: profile.foundedYear ? Number(profile.foundedYear) : null,
        hq_location: profile.hqLocation,
        whatsapp_support: profile.whatsappSupport,
        support_email: profile.supportEmail,
        support_phone: profile.supportPhone,
        team_members: profile.teamMembers && profile.teamMembers.length > 0 ? profile.teamMembers : null,
        product_categories: profile.productCategories && profile.productCategories.length > 0 ? profile.productCategories : null,
        email: profile.contactInfo.email,
        contact_email: profile.contactInfo.email,
        contact_mobile: profile.contactInfo.phone,
        contact_address: profile.contactInfo.address,
        social_handles: profile.socialLinks && Object.keys(profile.socialLinks).length > 0 ? profile.socialLinks : null,
        updated_at: new Date().toISOString(),
      };

      // Remove undefined/null/empty string fields
      Object.keys(updatePayload).forEach(
        key => (updatePayload[key] === undefined || updatePayload[key] === null || updatePayload[key] === '') && delete updatePayload[key]
      );

      const { error } = await supabase
        .from('brands')
        .upsert(updatePayload, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating profile:', error);
        if (error.code === '23505') {
          toast.error('A profile with this email already exists');
        } else {
          toast.error('Failed to update profile. Please try again.');
        }
        return;
      }

      toast.success('Profile updated successfully');
      // Update URL with brand name
      const brandSlug = profile.basicInfo.brandName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      window.history.pushState({}, '', `/brand/${brandSlug}`);
    } catch (error) {
      console.error('Error updating brand profile:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');
    setProfile((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof BrandProfile],
        [field]: value,
      },
    }));
  };

  function DynamicListInput({ label, value, onChange, placeholder }) {
    const [list, setList] = useState(value || []);
    const handleChange = (idx, val) => {
      const updated = list.map((item, i) => (i === idx ? val : item));
      setList(updated);
      onChange(updated);
    };
    const addItem = () => {
      setList([...list, '']);
      onChange([...list, '']);
    };
    const removeItem = idx => {
      const updated = list.filter((_, i) => i !== idx);
      setList(updated);
      onChange(updated);
    };
    return (
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {list.map((item, idx) => (
          <div key={idx} className="flex gap-2 mb-1">
            <Input
              placeholder={placeholder}
              value={item}
              onChange={e => handleChange(idx, e.target.value)}
            />
            <Button type="button" onClick={() => removeItem(idx)} size="sm">Remove</Button>
          </div>
        ))}
        <Button type="button" onClick={addItem} size="sm">Add</Button>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <span className="text-lg text-gray-500">Loading profile...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-96">
            <span className="text-lg text-red-500">{error}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded-lg shadow-md">
            {/* Render all fields at once for brand profile */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Company Info</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    name="basicInfo.brandName"
                    value={profile.basicInfo.brandName}
                    onChange={handleChange}
                    placeholder="Enter brand name"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                  <FileSelector
                    type="image"
                    value={profile.logo}
                    brandId={brandId || ''}
                    onSelect={file => setProfile(prev => ({ ...prev, logo: typeof file === 'object' && file !== null && 'url' in file ? file.url : file }))}
                  />
                  {profile.logo && <img src={profile.logo} alt="Logo" className="mt-2 h-16 rounded shadow" />}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="basicInfo.description"
                    value={profile.basicInfo.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe your brand..."
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={profile.website || ''}
                    onChange={e => setProfile(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourbrand.com"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={profile.gstNumber || ''}
                    onChange={e => setProfile(prev => ({ ...prev, gstNumber: e.target.value }))}
                    placeholder="Enter GST number"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
                  <input
                    type="number"
                    name="foundedYear"
                    value={profile.foundedYear || ''}
                    onChange={e => setProfile(prev => ({ ...prev, foundedYear: e.target.value }))}
                    placeholder="e.g. 2010"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HQ Location</label>
                  <input
                    type="text"
                    name="hqLocation"
                    value={profile.hqLocation || ''}
                    onChange={e => setProfile(prev => ({ ...prev, hqLocation: e.target.value }))}
                    placeholder="Enter headquarters location"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Support Number</label>
                  <input
                    type="text"
                    name="whatsappSupport"
                    value={profile.whatsappSupport || ''}
                    onChange={e => setProfile(prev => ({ ...prev, whatsappSupport: e.target.value }))}
                    placeholder="Enter WhatsApp support number"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <DynamicListInput
                    label="Team Members (Invite by Email)"
                    value={profile.teamMembers}
                    onChange={list => setProfile(prev => ({ ...prev, teamMembers: list }))}
                    placeholder="Email"
                  />
                </div>
                <div className="sm:col-span-2">
                  <DynamicListInput
                    label="Product Categories"
                    value={profile.productCategories}
                    onChange={list => setProfile(prev => ({ ...prev, productCategories: list }))}
                    placeholder="Category"
                  />
                </div>
              </div>
              <h3 className="text-xl font-semibold mt-8">Contact & Support</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    name="contactInfo.email"
                    value={profile.contactInfo.email}
                    onChange={handleChange}
                    placeholder="Enter official email"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Support Email</label>
                  <input
                    type="email"
                    name="supportEmail"
                    value={profile.supportEmail || ''}
                    onChange={e => setProfile(prev => ({ ...prev, supportEmail: e.target.value }))}
                    placeholder="Enter support email"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="contactInfo.phone"
                    value={profile.contactInfo.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Support Phone</label>
                  <input
                    type="tel"
                    name="supportPhone"
                    value={profile.supportPhone || ''}
                    onChange={e => setProfile(prev => ({ ...prev, supportPhone: e.target.value }))}
                    placeholder="Enter support phone number"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Physical Address</label>
                  <textarea
                    name="contactInfo.address"
                    value={profile.contactInfo.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Enter address"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                  />
                </div>
              </div>
              <h3 className="text-xl font-semibold mt-8">Social Handles</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    name="socialLinks.website"
                    value={profile.socialLinks.website}
                    onChange={handleChange}
                    placeholder="https://yourbrand.com"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                  <input
                    type="url"
                    name="socialLinks.facebook"
                    value={profile.socialLinks.facebook}
                    onChange={handleChange}
                    placeholder="Facebook URL"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                  <input
                    type="url"
                    name="socialLinks.instagram"
                    value={profile.socialLinks.instagram}
                    onChange={handleChange}
                    placeholder="Instagram URL"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  <input
                    type="url"
                    name="socialLinks.linkedin"
                    value={profile.socialLinks.linkedin}
                    onChange={handleChange}
                    placeholder="LinkedIn URL"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-8">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BrandProfileSection; 