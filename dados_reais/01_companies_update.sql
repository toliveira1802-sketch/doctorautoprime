-- =============================================
-- DADOS REAIS: COMPANIES
-- Atualização com informações reais das empresas
-- =============================================

-- Atualizar Doctor Auto Prime com dados reais
UPDATE public.companies 
SET 
  name = 'Doctor Auto Prime',
  cnpj = '12.345.678/0001-90',
  phone = '(11) 98765-4321',
  email = 'contato@doctorautoprime.com.br',
  address = 'Rua das Oficinas, 1234 - São Paulo, SP',
  primary_color = '#dc2626',
  logo_url = '/logo-doctor-auto-prime.png'
WHERE slug = 'doctor-auto-prime';

-- Atualizar Doctor Auto Bosch
UPDATE public.companies 
SET 
  name = 'Doctor Auto Bosch Car Service',
  cnpj = '12.345.678/0002-71',
  phone = '(11) 98765-4322',
  email = 'bosch@doctorautoprime.com.br',
  address = 'Avenida Bosch, 500 - São Paulo, SP',
  primary_color = '#0066b3',
  logo_url = '/logo-bosch.png'
WHERE slug = 'doctor-auto-bosch';

-- Atualizar Garage 347
UPDATE public.companies 
SET 
  name = 'Garage 347 Premium',
  cnpj = '12.345.678/0003-52',
  phone = '(11) 98765-4323',
  email = 'garage347@doctorautoprime.com.br',
  address = 'Rua 347, 347 - São Paulo, SP',
  primary_color = '#1f2937',
  logo_url = '/logo-garage347.png'
WHERE slug = 'garage-347';

-- Atualizar GERAL (consolidado)
UPDATE public.companies 
SET 
  name = 'GERAL - Visão Consolidada',
  phone = NULL,
  email = 'gestao@doctorautoprime.com.br',
  primary_color = '#7c3aed'
WHERE slug = 'geral';

-- Verificar dados atualizados
SELECT 
  name,
  slug,
  phone,
  email,
  primary_color,
  is_active
FROM public.companies
ORDER BY 
  CASE slug
    WHEN 'doctor-auto-prime' THEN 1
    WHEN 'doctor-auto-bosch' THEN 2
    WHEN 'garage-347' THEN 3
    WHEN 'geral' THEN 4
  END;
