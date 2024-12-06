-- Adiciona a coluna is_anonymous na tabela answers
ALTER TABLE answers
ADD COLUMN is_anonymous BOOLEAN DEFAULT FALSE;
