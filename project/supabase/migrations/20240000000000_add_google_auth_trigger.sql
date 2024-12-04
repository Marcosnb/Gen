-- Create a function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Get user's Google avatar or generate one using DiceBear
  avatar_url := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.email
  );

  insert into public.profiles (
    id,
    full_name,
    avatar_url,
    email,
    gender,
    points,
    is_admin,
    created_at,
    updated_at
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    avatar_url,
    new.email,
    'not_specified',
    0,
    false,
    now(),
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create a trigger that runs the function when a new user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
