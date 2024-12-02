-- Adicionar coluna type se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'notifications' AND column_name = 'type') THEN
        ALTER TABLE notifications ADD COLUMN type text;
    END IF;
END $$;

-- Tornar answer_id opcional
ALTER TABLE notifications 
ALTER COLUMN answer_id DROP NOT NULL;

-- Verificar e adicionar outras colunas necessárias se não existirem
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'notifications' AND column_name = 'read') THEN
        ALTER TABLE notifications ADD COLUMN read boolean DEFAULT false;
    END IF;
END $$;
