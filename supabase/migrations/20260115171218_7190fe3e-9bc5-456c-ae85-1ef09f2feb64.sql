-- Fix mechanics table: restrict phone exposure to authenticated users only
DROP POLICY IF EXISTS "Anyone can view active mechanics" ON public.mechanics;

CREATE POLICY "Authenticated users can view active mechanics" 
ON public.mechanics 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Fix events table: restrict business data to authenticated users only
DROP POLICY IF EXISTS "Anyone can view active events" ON public.events;

CREATE POLICY "Authenticated users can view active events" 
ON public.events 
FOR SELECT 
TO authenticated
USING ((is_active = true) AND (event_date >= CURRENT_DATE));