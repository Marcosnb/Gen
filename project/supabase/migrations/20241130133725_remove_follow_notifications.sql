-- Drop the trigger first
DROP TRIGGER IF EXISTS on_new_follower ON public.followers;

-- Then drop the function
DROP FUNCTION IF EXISTS handle_new_follower();
