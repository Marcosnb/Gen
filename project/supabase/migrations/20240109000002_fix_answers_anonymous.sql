-- Garante que a coluna is_anonymous existe e tem o tipo correto
ALTER TABLE answers 
DROP COLUMN IF EXISTS is_anonymous;

ALTER TABLE answers
ADD COLUMN is_anonymous BOOLEAN NOT NULL DEFAULT FALSE;
