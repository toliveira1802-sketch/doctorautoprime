-- =============================================
-- DADOS REAIS: CLIENTES DE EXEMPLO
-- Clientes fictícios mas realistas para testes
-- =============================================

-- IMPORTANTE: Estes são dados fictícios para demonstração
-- Em produção, os clientes se cadastram pelo sistema

-- =============================================
-- 1. CLIENTE VIP PLATINA
-- =============================================
-- João Silva Santos
-- CPF: 123.456.789-00
-- Telefone: (11) 98765-4321
-- Cliente desde: 2023
-- Nível: Platina (mais de R$ 10.000 em serviços)

INSERT INTO public.profiles (user_id, full_name, phone, cpf, birth_date, address, city, state, zip_code)
VALUES (
  'user-uuid-joao',  -- Substituir pelo UUID real do auth.users
  'João Silva Santos',
  '(11) 98765-4321',
  '12345678900',
  '1985-03-15',
  'Rua das Flores, 123, Apto 45',
  'São Paulo',
  'SP',
  '01234-567'
);

-- Veículos do João
INSERT INTO public.vehicles (user_id, model, plate, year, brand, color, chassis, km_current)
VALUES 
  ('user-uuid-joao', 'Civic EXL 2.0', 'ABC1D23', '2022', 'Honda', 'Preto', 'CHASSIS123456', 25000),
  ('user-uuid-joao', 'CR-V Touring', 'XYZ9J87', '2023', 'Honda', 'Branco Pérola', 'CHASSIS789012', 15000);

-- =============================================
-- 2. CLIENTE OURO
-- =============================================
-- Maria Oliveira Costa
-- CPF: 234.567.890-11
-- Telefone: (11) 98765-5432
-- Cliente desde: 2024
-- Nível: Ouro (R$ 5.000 - R$ 10.000)

INSERT INTO public.profiles (user_id, full_name, phone, cpf, birth_date, address, city, state, zip_code)
VALUES (
  'user-uuid-maria',
  'Maria Oliveira Costa',
  '(11) 98765-5432',
  '23456789011',
  '1990-07-22',
  'Avenida Paulista, 1500, Conj 803',
  'São Paulo',
  'SP',
  '01310-100'
);

-- Veículo da Maria
INSERT INTO public.vehicles (user_id, model, plate, year, brand, color, km_current)
VALUES 
  ('user-uuid-maria', 'Corolla XEI', 'DEF2E34', '2021', 'Toyota', 'Prata', 35000);

-- =============================================
-- 3. CLIENTE PRATA
-- =============================================
-- Carlos Eduardo Mendes
-- CPF: 345.678.901-22
-- Telefone: (11) 98765-6543
-- Cliente desde: 2024
-- Nível: Prata (R$ 2.000 - R$ 5.000)

INSERT INTO public.profiles (user_id, full_name, phone, cpf, birth_date, address, city, state, zip_code)
VALUES (
  'user-uuid-carlos',
  'Carlos Eduardo Mendes',
  '(11) 98765-6543',
  '34567890122',
  '1988-11-10',
  'Rua Augusta, 789',
  'São Paulo',
  'SP',
  '01305-100'
);

-- Veículo do Carlos
INSERT INTO public.vehicles (user_id, model, plate, year, brand, color, km_current)
VALUES 
  ('user-uuid-carlos', 'HB20S 1.6', 'GHI3F45', '2020', 'Hyundai', 'Vermelho', 48000);

-- =============================================
-- 4. CLIENTE BRONZE (NOVO)
-- =============================================
-- Ana Paula Rodrigues
-- CPF: 456.789.012-33
-- Telefone: (11) 98765-7654
-- Cliente desde: 2026
-- Nível: Bronze (até R$ 2.000)

INSERT INTO public.profiles (user_id, full_name, phone, cpf, birth_date, address, city, state, zip_code)
VALUES (
  'user-uuid-ana',
  'Ana Paula Rodrigues',
  '(11) 98765-7654',
  '45678901233',
  '1995-05-18',
  'Rua da Consolação, 456, Apto 12',
  'São Paulo',
  'SP',
  '01302-000'
);

-- Veículo da Ana
INSERT INTO public.vehicles (user_id, model, plate, year, brand, color, km_current)
VALUES 
  ('user-uuid-ana', 'Onix 1.0', 'JKL4G56', '2019', 'Chevrolet', 'Branco', 62000);

-- =============================================
-- 5. CLIENTE EMPRESARIAL
-- =============================================
-- Pedro Henrique Santos (Empresa de Transportes)
-- CPF: 567.890.123-44
-- Telefone: (11) 98765-8765
-- Cliente desde: 2023
-- Nível: Platina (frota com 3 veículos)

INSERT INTO public.profiles (user_id, full_name, phone, cpf, birth_date, address, city, state, zip_code)
VALUES (
  'user-uuid-pedro',
  'Pedro Henrique Santos',
  '(11) 98765-8765',
  '56789012344',
  '1982-09-25',
  'Rua Comercial, 999, Sala 101',
  'São Paulo',
  'SP',
  '01234-000'
);

-- Frota do Pedro
INSERT INTO public.vehicles (user_id, model, plate, year, brand, color, km_current)
VALUES 
  ('user-uuid-pedro', 'Hilux CD 4x4', 'MNO5H67', '2022', 'Toyota', 'Branco', 45000),
  ('user-uuid-pedro', 'Hilux CD 4x4', 'PQR6I78', '2022', 'Toyota', 'Branco', 48000),
  ('user-uuid-pedro', 'L200 Triton', 'STU7J89', '2021', 'Mitsubishi', 'Prata', 65000);

-- =============================================
-- VERIFICAÇÃO
-- =============================================

-- Listar todos os clientes com seus veículos
SELECT 
  p.full_name as cliente,
  p.phone as telefone,
  COUNT(v.id) as total_veiculos,
  STRING_AGG(v.brand || ' ' || v.model, ', ') as veiculos
FROM public.profiles p
LEFT JOIN public.vehicles v ON v.user_id = p.user_id
GROUP BY p.full_name, p.phone
ORDER BY COUNT(v.id) DESC;

-- Estatísticas de veículos por marca
SELECT 
  brand as marca,
  COUNT(*) as quantidade,
  AVG(km_current) as km_media
FROM public.vehicles
WHERE is_active = true
GROUP BY brand
ORDER BY COUNT(*) DESC;

-- =============================================
-- NOTAS IMPORTANTES
-- =============================================

/*
⚠️ ATENÇÃO:
1. Substitua 'user-uuid-*' pelos UUIDs reais dos usuários do auth.users
2. Estes são dados fictícios para demonstração
3. Em produção, use dados reais dos clientes
4. CPFs e telefones são fictícios
5. Adapte endereços conforme sua região

📝 PRÓXIMOS PASSOS:
1. Criar usuários no Supabase Auth primeiro
2. Copiar os UUIDs gerados
3. Substituir nos INSERTs acima
4. Executar o script
*/
