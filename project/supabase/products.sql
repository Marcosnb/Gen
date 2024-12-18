-- Create the products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    tags TEXT,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view products
CREATE POLICY "Anyone can view products"
    ON public.products
    FOR SELECT
    USING (true);

-- Create policy to allow authenticated users to create products
CREATE POLICY "Authenticated users can create products"
    ON public.products
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy to allow users to update their own products
CREATE POLICY "Users can update their own products"
    ON public.products
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = seller_id)
    WITH CHECK (auth.uid() = seller_id);

-- Create policy to allow users to delete their own products
CREATE POLICY "Users can delete their own products"
    ON public.products
    FOR DELETE
    TO authenticated
    USING (auth.uid() = seller_id);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable public access to product images
CREATE POLICY "Public access to product images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'product-images');

-- Allow authenticated users to upload product images
CREATE POLICY "Authenticated users can upload product images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'product-images');

-- Allow users to delete their own product images
CREATE POLICY "Users can delete their own product images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'product-images' AND auth.uid() = owner);

-- Insert some example products
INSERT INTO public.products (title, description, price, category, image_url, tags, seller_id)
VALUES 
    ('iPhone 13 Pro', 'Smartphone Apple em excelente estado', 4999.99, 'Eletrônicos', 'https://jsidqphaomibeqpybhsz.supabase.co/storage/v1/object/public/product-images/iphone.jpg', 'apple,smartphone,iphone', '7c2c0d8d-2f8b-4f1d-8f1a-3f1d2f8b4f1d'),
    ('Notebook Dell', 'Notebook Dell Inspiron 15 polegadas', 3499.99, 'Eletrônicos', 'https://jsidqphaomibeqpybhsz.supabase.co/storage/v1/object/public/product-images/notebook.jpg', 'dell,notebook,computador', '7c2c0d8d-2f8b-4f1d-8f1a-3f1d2f8b4f1d')
ON CONFLICT (id) DO NOTHING;
