-- Alterar a tabela notifications para tornar answer_id opcional
ALTER TABLE notifications 
ALTER COLUMN answer_id DROP NOT NULL;
