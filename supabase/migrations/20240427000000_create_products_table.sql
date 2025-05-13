-- Create products table for brand-specific products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    images TEXT[],
    category TEXT,
    subcategory TEXT,
    price NUMERIC,
    ecommerce_links TEXT[],
    ingredients TEXT,
    materials TEXT,
    usage_instructions TEXT,
    usage_video TEXT,
    shelf_life TEXT,
    manufacturing_details TEXT,
    sustainability TEXT,
    recycling TEXT,
    certifications JSONB,
    faqs JSONB,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_products_brand_id ON products(brand_id); 