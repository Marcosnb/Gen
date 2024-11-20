-- Criar tabela de respostas
create table if not exists public.answers (
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now(),
    content text not null,
    user_id uuid not null references auth.users(id),
    question_id uuid not null references public.questions(id),
    is_accepted boolean not null default false
);

-- Habilitar RLS
alter table public.answers enable row level security;

-- Criar políticas de RLS
-- Permitir leitura para todos
create policy "Permitir leitura para todos"
on public.answers for select
to authenticated, anon
using (true);

-- Permitir inserção apenas para usuários autenticados
create policy "Permitir inserção para usuários autenticados"
on public.answers for insert
to authenticated
with check (auth.uid() = user_id);

-- Permitir atualização apenas para o autor da resposta
create policy "Permitir atualização para o autor"
on public.answers for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Permitir exclusão apenas para o autor da resposta
create policy "Permitir exclusão para o autor"
on public.answers for delete
to authenticated
using (auth.uid() = user_id);

-- Criar índices
create index if not exists answers_question_id_idx on public.answers(question_id);
create index if not exists answers_user_id_idx on public.answers(user_id);
create index if not exists answers_created_at_idx on public.answers(created_at desc);
