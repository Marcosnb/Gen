-- Create followers table
create table if not exists public.followers (
    id uuid default gen_random_uuid() primary key,
    follower_id uuid references auth.users(id) on delete cascade,
    following_id uuid references auth.users(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(follower_id, following_id)
);

-- Add RLS policies
alter table public.followers enable row level security;

-- Policy to allow users to see who they follow and who follows them
create policy "Users can see their followers and following"
    on public.followers for select
    using (
        auth.uid() = follower_id or 
        auth.uid() = following_id
    );

-- Policy to allow users to follow others
create policy "Users can follow others"
    on public.followers for insert
    with check (
        auth.uid() = follower_id and 
        auth.uid() != following_id
    );

-- Policy to allow users to unfollow
create policy "Users can unfollow"
    on public.followers for delete
    using (auth.uid() = follower_id);

-- Create indexes for better performance
create index if not exists followers_follower_id_idx on public.followers(follower_id);
create index if not exists followers_following_id_idx on public.followers(following_id);