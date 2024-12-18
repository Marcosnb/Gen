-- Verificar produtos
SELECT p.*, up.full_name as seller_name
FROM products p
LEFT JOIN user_profiles up ON p.seller_id = up.id;
