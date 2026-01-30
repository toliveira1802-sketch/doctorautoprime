-- =============================================
-- DADOS REAIS: SERVICES
-- Serviços com preços e descrições realistas
-- =============================================

-- REVISÕES PERIÓDICAS
UPDATE public.services 
SET 
  description = 'Revisão completa de 10 mil km incluindo: troca de óleo e filtro, inspeção de freios, verificação de fluidos, calibragem de pneus e relatório fotográfico.',
  price = 450.00,
  duration_minutes = 120
WHERE name = 'Revisão 10.000km';

UPDATE public.services 
SET 
  description = 'Revisão completa de 20 mil km incluindo: troca de óleo, filtro de ar, filtro de cabine, velas, inspeção completa de suspensão e freios.',
  price = 680.00,
  duration_minutes = 180
WHERE name = 'Revisão 20.000km';

UPDATE public.services 
SET 
  description = 'Revisão completa de 30 mil km incluindo todos os itens da revisão de 20k + troca de fluido de freio, limpeza de bicos, teste de bateria.',
  price = 920.00,
  duration_minutes = 240
WHERE name = 'Revisão 30.000km';

-- SERVIÇOS BÁSICOS
UPDATE public.services 
SET 
  description = 'Troca de óleo mineral ou sintético com filtro. Inclui inspeção visual de 21 pontos e relatório.',
  price = 180.00,
  duration_minutes = 60
WHERE name = 'Troca de Óleo';

UPDATE public.services 
SET 
  description = 'Alinhamento computadorizado de direção e balanceamento das 4 rodas. Inclui calibragem e inspeção de pneus.',
  price = 150.00,
  duration_minutes = 90
WHERE name = 'Alinhamento e Balanceamento';

UPDATE public.services 
SET 
  description = 'Substituição de pastilhas de freio dianteiras ou traseiras. Peças originais ou OEM de qualidade.',
  price = 420.00,
  duration_minutes = 120
WHERE name = 'Troca de Pastilhas de Freio';

-- DIAGNÓSTICOS
UPDATE public.services 
SET 
  description = 'Diagnóstico completo do veículo com scanner de última geração. Inclui teste de road, verificação de todos os sistemas e relatório detalhado em PDF.',
  price = 380.00,
  duration_minutes = 240,
  is_full_day = true
WHERE name = 'Diagnóstico Completo';

UPDATE public.services 
SET 
  description = 'Análise específica do motor: compressão, vazamentos, consumo de óleo, sistema de ignição e injeção.',
  price = 280.00,
  duration_minutes = 180
WHERE name = 'Diagnóstico de Motor';

UPDATE public.services 
SET 
  description = 'Verificação completa de sistemas eletrônicos: sensores, módulos, central de injeção, airbags e ABS.',
  price = 220.00,
  duration_minutes = 120
WHERE name = 'Diagnóstico Eletrônico';

-- SERVIÇOS ESPECIALIZADOS
UPDATE public.services 
SET 
  description = 'Limpeza ultrassônica de bicos injetores com equipamento profissional. Melhora consumo e desempenho.',
  price = 380.00,
  duration_minutes = 120
WHERE name = 'Limpeza de Bicos Injetores';

UPDATE public.services 
SET 
  description = 'Substituição completa da correia dentada + tensionadores + bomba dágua (quando aplicável). Kit original.',
  price = 1200.00,
  duration_minutes = 300,
  is_full_day = true
WHERE name = 'Troca de Correia Dentada';

UPDATE public.services 
SET 
  description = 'Revisão completa da suspensão: amortecedores, molas, buchas, bandejas e pivôs. Inclui teste de road.',
  price = 850.00,
  duration_minutes = 180
WHERE name = 'Revisão de Suspensão';

UPDATE public.services 
SET 
  description = 'Alinhamento, balanceamento e geometria completa com equipamento 3D. Recomendado após troca de pneus.',
  price = 280.00,
  duration_minutes = 120
WHERE name = 'Geometria Completa';

UPDATE public.services 
SET 
  description = 'Substituição do kit de embreagem completo: disco, platô, rolamento e ajuste do pedal. Garantia de 1 ano.',
  price = 1800.00,
  duration_minutes = 480,
  is_full_day = true
WHERE name = 'Troca de Embreagem';

-- Verificar todos os serviços atualizados
SELECT 
  name,
  service_type,
  duration_minutes,
  CONCAT('R$ ', TO_CHAR(price, 'FM999G990D00')) as preco,
  is_full_day as dia_inteiro,
  display_order as ordem
FROM public.services
WHERE is_active = true
ORDER BY display_order;

-- Estatísticas
SELECT 
  service_type,
  COUNT(*) as total,
  CONCAT('R$ ', TO_CHAR(AVG(price), 'FM999G990D00')) as preco_medio,
  CONCAT('R$ ', TO_CHAR(MIN(price), 'FM999G990D00')) as preco_min,
  CONCAT('R$ ', TO_CHAR(MAX(price), 'FM999G990D00')) as preco_max
FROM public.services
WHERE is_active = true
GROUP BY service_type;
