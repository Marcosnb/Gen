-- Adiciona a coluna is_followers_only na tabela questions
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS is_followers_only BOOLEAN DEFAULT FALSE;

-- Atualiza as questões existentes para ter is_followers_only como false
UPDATE questions
SET is_followers_only = FALSE
WHERE is_followers_only IS NULL;
