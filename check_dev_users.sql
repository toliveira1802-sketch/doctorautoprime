-- Verificar se toliveira1802@gmail.com já existe e qual sua role
SELECT 
  u.email,
  u.created_at as user_created_at,
  ur.role,
  p.full_name
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE u.email IN ('toliveira1802@gmail.com', 'sophia.duarte1@hotmail.com')
ORDER BY u.email;
