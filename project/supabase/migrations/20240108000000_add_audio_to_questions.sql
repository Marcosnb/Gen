-- Add audio_url column to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Create storage bucket for question audios if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('question-audios', 'question-audios', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload audio files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to audio files" ON storage.objects;

-- Set up storage policy to allow authenticated users to upload audio files
CREATE POLICY "Allow authenticated users to upload audio files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'question-audios'
);

-- Set up storage policy to allow public access to audio files
CREATE POLICY "Allow public access to audio files"
ON storage.objects FOR SELECT TO public
USING (
  bucket_id = 'question-audios'
);
