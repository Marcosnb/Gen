-- Garante que a tabela notifications tem a estrutura correta
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'answer',
    question_id TEXT DEFAULT '',
    question_title TEXT DEFAULT '',
    answer_id TEXT DEFAULT '',
    read BOOLEAN DEFAULT false
);

-- Habilita RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Permite que usuários autenticados vejam suas próprias notificações
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Permite que usuários autenticados criem notificações
CREATE POLICY "Users can create notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permite que usuários autenticados atualizem suas próprias notificações
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
