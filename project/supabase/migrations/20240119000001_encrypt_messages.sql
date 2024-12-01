-- Enable the pgsodium extension if not already enabled
create extension if not exists pgsodium;

-- Add encrypted content column
alter table messages 
add column if not exists encrypted_content bytea;

-- Create encryption function
create or replace function encrypt_message() returns trigger as $$
begin
  -- Encrypt the message content
  new.encrypted_content := pgsodium.crypto_aead_det_encrypt(
    convert_to(new.content, 'utf8'),
    convert_to(new.from_user_id::text || ',' || new.to_user_id::text, 'utf8'),
    new.id::text::bytea,
    new.id::text::bytea
  );
  
  -- Clear the original content
  new.content := null;
  
  return new;
end;
$$ language plpgsql security definer;

-- Create decryption function
create or replace function decrypt_message(encrypted_content bytea, msg_id text, from_id text, to_id text) returns text as $$
begin
  return convert_from(
    pgsodium.crypto_aead_det_decrypt(
      encrypted_content,
      convert_to(from_id || ',' || to_id, 'utf8'),
      msg_id::bytea,
      msg_id::bytea
    ),
    'utf8'
  );
exception
  when others then
    return null;
end;
$$ language plpgsql security definer;

-- Create view for decrypted messages
create or replace view decrypted_messages as
select 
  id,
  from_user_id,
  to_user_id,
  decrypt_message(
    encrypted_content,
    id::text,
    from_user_id::text,
    to_user_id::text
  ) as content,
  created_at,
  read_at
from messages;

-- Create trigger for encryption
create trigger encrypt_message_insert
  before insert on messages
  for each row
  execute function encrypt_message();

-- Encrypt existing messages
update messages
set 
  encrypted_content = pgsodium.crypto_aead_det_encrypt(
    convert_to(content, 'utf8'),
    convert_to(from_user_id::text || ',' || to_user_id::text, 'utf8'),
    id::text::bytea,
    id::text::bytea
  ),
  content = null
where content is not null;

-- Grant permissions
grant select on decrypted_messages to authenticated;
grant all on messages to authenticated;
