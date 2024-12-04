-- Drop the trigger first
drop trigger if exists on_auth_user_created on auth.users;

-- Then drop the function
drop function if exists public.handle_new_user();
