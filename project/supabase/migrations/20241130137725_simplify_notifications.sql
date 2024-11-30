-- Adiciona coluna type na tabela notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'answer';
