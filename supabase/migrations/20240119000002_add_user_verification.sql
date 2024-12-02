-- Remover a coluna is_verified da tabela profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS is_verified;

-- Remover a política de verificação
DROP POLICY IF EXISTS "Only admins can update verification status" ON profiles;
