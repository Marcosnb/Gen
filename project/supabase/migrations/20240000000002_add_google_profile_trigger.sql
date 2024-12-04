-- Create a function to handle new user signup
create or replace function public.handle_google_auth()
returns trigger as $$
begin
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
    coalesce(new.raw_user_meta_data->>'picture', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.email),
    new.email,
    'not_specified',
    0,
    false,
    now(),
    now()
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Create a trigger that runs the function when a new user signs up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_google_auth();
