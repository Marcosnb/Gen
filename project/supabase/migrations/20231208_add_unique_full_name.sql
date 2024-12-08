-- Adiciona restrição única para o campo full_name na tabela profiles
ALTER TABLE profiles ADD CONSTRAINT unique_full_name UNIQUE (full_name);
