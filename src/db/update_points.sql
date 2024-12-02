-- Função para atualizar pontos do usuário
create or replace function update_user_points(user_id_param uuid, points_to_add int)
returns void as $$
declare
    current_points int;
    rows_affected int;
begin
    -- Verificar se o usuário existe
    select points into strict current_points
    from profiles
    where id = user_id_param;

    -- Atualizar os pontos
    update profiles 
    set points = COALESCE(current_points, 0) + points_to_add
    where id = user_id_param;

    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    
    -- Verificar se a atualização foi bem sucedida
    if rows_affected = 0 then
        raise exception 'Falha ao atualizar pontos para o usuário %', user_id_param;
    end if;

exception
    when no_data_found then
        raise exception 'Usuário % não encontrado', user_id_param;
    when others then
        raise exception 'Erro ao atualizar pontos: %', SQLERRM;
end;
$$ language plpgsql;
