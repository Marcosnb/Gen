-- Drop the products table and related policies
DROP TABLE IF EXISTS public.products;

-- Drop storage bucket policies
DROP POLICY IF EXISTS "Public access to product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own product images" ON storage.objects;

-- Delete product-images bucket if it exists
DELETE FROM storage.buckets WHERE id = 'product-images';
