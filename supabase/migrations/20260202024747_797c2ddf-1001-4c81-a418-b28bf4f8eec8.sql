-- Criar usuário admin via função do Supabase
-- Nota: O usuário precisa se registrar via interface, mas podemos pré-configurar a role

-- Primeiro, vamos verificar se já existe um convite para esse email e criar um
INSERT INTO public.invites (code, role, expires_at, created_by)
VALUES ('ADMIN-TOLIVEIRA-2026', 'admin', NOW() + INTERVAL '7 days', NULL)
ON CONFLICT (code) DO NOTHING;

-- Também criar um convite mais fácil de usar
INSERT INTO public.invites (code, role, expires_at, created_by)
VALUES ('ADMIN123', 'admin', NOW() + INTERVAL '30 days', NULL)
ON CONFLICT (code) DO NOTHING;