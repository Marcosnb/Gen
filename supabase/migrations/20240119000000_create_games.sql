-- Create games table
create table if not exists public.games (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    enabled boolean default false,
    points_multiplier integer default 1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add initial game
insert into public.games (name, enabled, points_multiplier)
values ('Chuva de Moedas', false, 1);

-- Enable RLS
alter table public.games enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.games
    for select
    using (true);

create policy "Enable write access for admins" on public.games
    for all
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
    )
    with check (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
    );
