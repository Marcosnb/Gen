-- Adiciona coluna type na tabela notifications se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'notifications' AND column_name = 'type') THEN
        ALTER TABLE notifications ADD COLUMN type text;
    END IF;
END $$;

-- Função para criar notificação quando alguém seguir um usuário
create or replace function handle_new_follower()
returns trigger
language plpgsql
security definer
as $$
begin
    -- Não notificar se o usuário seguir a si mesmo (não deveria acontecer, mas por precaução)
    if NEW.follower_id = NEW.following_id then
        return NEW;
    end if;

    -- Buscar informações do usuário que está seguindo
    with follower_info as (
        select full_name
        from profiles
        where id = NEW.follower_id
    )
    insert into notifications (
        user_id,
        type,
        created_at,
        read,
        question_id,
        question_title
    )
    select
        NEW.following_id,
        'follow',
        NEW.created_at,
        false,
        null,
        follower_info.full_name
    from follower_info;

    return NEW;
end;
$$;

-- Criar trigger para nova função
drop trigger if exists on_new_follower on followers;
create trigger on_new_follower
    after insert on followers
    for each row
    execute function handle_new_follower();
