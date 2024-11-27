-- Create messages table
create table if not exists public.messages (
    id uuid default uuid_generate_v4() primary key,
    content text not null,
    from_user_id uuid references auth.users(id) on delete cascade not null,
    to_user_id uuid references auth.users(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    read_at timestamp with time zone
);

-- Add RLS policies
alter table public.messages enable row level security;

create policy "Users can read messages they sent or received"
    on public.messages for select
    using (
        auth.uid() = from_user_id or
        auth.uid() = to_user_id
    );

create policy "Users can insert messages"
    on public.messages for insert
    with check (
        auth.uid() = from_user_id
    );

-- Create indexes
create index messages_from_user_id_idx on public.messages(from_user_id);
create index messages_to_user_id_idx on public.messages(to_user_id);
create index messages_created_at_idx on public.messages(created_at);

-- Add foreign key references to profiles
alter table public.messages
    add constraint messages_from_user_id_fkey
    foreign key (from_user_id)
    references public.profiles(id)
    on delete cascade;

alter table public.messages
    add constraint messages_to_user_id_fkey
    foreign key (to_user_id)
    references public.profiles(id)
    on delete cascade;
