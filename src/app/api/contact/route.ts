import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';
// Placeholder for email sending utility
async function sendEmailToBrand(brandEmail: string, customerName: string, customerEmail: string, message: string) {
  // TODO: Implement SMTP email sending here
  console.log('Send email to', brandEmail, { customerName, customerEmail, message });
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, brandId } = await request.json();
    if (!name || !email || !message || !brandId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Save to DB
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([{ brand_id: brandId, customer_name: name, customer_email: email, message }]);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // Fetch brand email
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('email')
      .eq('id', brandId)
      .single();
    if (brand && brand.email) {
      await sendEmailToBrand(brand.email, name, email, message);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 });
  }
} 