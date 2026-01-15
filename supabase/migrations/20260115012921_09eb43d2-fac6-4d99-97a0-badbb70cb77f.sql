-- Add birthday and loyalty fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birthday DATE,
ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS loyalty_level TEXT DEFAULT 'bronze' CHECK (loyalty_level IN ('bronze', 'silver', 'gold', 'platinum'));

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.birthday IS 'User birthday for birthday rewards';
COMMENT ON COLUMN public.profiles.loyalty_points IS 'Accumulated loyalty points';
COMMENT ON COLUMN public.profiles.loyalty_level IS 'Current loyalty tier: bronze, silver, gold, platinum';