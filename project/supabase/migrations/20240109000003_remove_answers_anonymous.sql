-- Remove a coluna is_anonymous da tabela answers
ALTER TABLE answers 
DROP COLUMN IF EXISTS is_anonymous;
