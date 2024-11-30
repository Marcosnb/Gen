-- Remove todas as funções e triggers anteriores
DROP FUNCTION IF EXISTS follow_user();
DROP FUNCTION IF EXISTS handle_new_follower();
DROP FUNCTION IF EXISTS create_follow_notification();

-- Remove e recria a política de insert em notifications
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON notifications;
CREATE POLICY "Enable insert for authenticated users"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);
