-- Recria a tabela followers com a estrutura correta
DROP TABLE IF EXISTS followers;

CREATE TABLE followers (
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- Adiciona políticas de segurança
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own follows"
ON followers FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
ON followers FOR DELETE 
TO authenticated
USING (auth.uid() = follower_id);

CREATE POLICY "Everyone can view follows"
ON followers FOR SELECT 
TO authenticated
USING (true);
