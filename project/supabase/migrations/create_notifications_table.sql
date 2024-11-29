-- Create notifications table
create table if not exists public.notifications (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    question_id uuid references public.questions(id) on delete cascade not null,
    question_title text not null,
    answer_id uuid references public.answers(id) on delete cascade not null,
    read boolean default false not null,
    read_at timestamp with time zone
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Create policies
create policy "Users can view their own notifications"
    on public.notifications for select
    using (auth.uid() = user_id);

create policy "System can insert notifications"
    on public.notifications for insert
    with check (true);

create policy "System can update notifications"
    on public.notifications for update
    using (auth.uid() = user_id);

create policy "System can delete notifications"
    on public.notifications for delete
    using (true);

-- Create function to create notification when answer is created
create or replace function public.handle_new_answer()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    -- Create notification for question author
    insert into public.notifications (user_id, question_id, question_title, answer_id)
    select 
        questions.user_id,
        questions.id as question_id,
        questions.title as question_title,
        new.id as answer_id
    from public.questions
    where questions.id = new.question_id
    and questions.user_id != new.user_id; -- Don't notify if user answers their own question
    
    return new;
end;
$$;

-- Create trigger for new answers
drop trigger if exists on_new_answer on public.answers;
create trigger on_new_answer
    after insert on public.answers
    for each row execute function public.handle_new_answer();

-- Function to update read_at timestamp when notification is marked as read
create or replace function public.update_notification_read_at()
returns trigger
language plpgsql
security definer
as $$
begin
    if new.read = true and old.read = false then
        new.read_at = now();
    end if;
    return new;
end;
$$;

-- Trigger to update read_at
create trigger update_notification_read_at
    before update on public.notifications
    for each row
    execute function public.update_notification_read_at();

-- Function to delete read notifications after 5 minutes
create or replace function public.delete_read_notifications()
returns void
language plpgsql
security definer
as $$
begin
    delete from public.notifications
    where read = true
    and read_at < now() - interval '5 minutes';
end;
$$;

-- Create cron job to run delete_read_notifications every minute
select cron.schedule(
    'delete-read-notifications',
    '* * * * *', -- every minute
    $$
    select delete_read_notifications();
    $$
);
