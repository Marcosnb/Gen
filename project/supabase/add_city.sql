-- Adicionar campo city na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
