-- Add 'dev' role to the enum (this will persist now)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'dev';