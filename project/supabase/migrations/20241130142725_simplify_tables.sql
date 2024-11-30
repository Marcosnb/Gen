-- Recria a tabela notifications do zero
DROP TABLE IF EXISTS notifications;

CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    type TEXT,
    question_id TEXT,
    question_title TEXT,
    answer_id TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adiciona políticas de segurança básicas
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for users" ON notifications;
CREATE POLICY "Enable read access for users"
ON notifications FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON notifications;
CREATE POLICY "Enable insert for authenticated users"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for users" ON notifications;
CREATE POLICY "Enable update for users"
ON notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Recria a tabela followers
DROP TABLE IF EXISTS followers;

CREATE TABLE followers (
    follower_id UUID REFERENCES auth.users(id),
    following_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

-- Adiciona políticas de segurança para followers
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for authenticated users" ON followers;
CREATE POLICY "Enable all for authenticated users"
ON followers FOR ALL
TO authenticated
USING (true);
