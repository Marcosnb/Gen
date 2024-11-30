-- Add type column to notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'answer';

-- Add follower_id column for follow notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS follower_id UUID REFERENCES auth.users(id);

-- Create a function to handle new follower notifications
CREATE OR REPLACE FUNCTION handle_new_follower()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, follower_id, created_at)
  VALUES (NEW.following_id, 'follow', NEW.follower_id, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new followers
CREATE TRIGGER on_new_follower
  AFTER INSERT ON followers
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_follower();
