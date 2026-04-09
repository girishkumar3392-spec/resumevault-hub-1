
-- Drop the overly permissive ALL policy that allows role self-assignment
DROP POLICY IF EXISTS "Authenticated users can manage own profile" ON public.profiles;

-- Re-create insert policy (users can create their own profile)
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Restricted update: users can update own profile but NOT the role column
-- We use a security definer function to enforce this
CREATE OR REPLACE FUNCTION public.update_profile_safe(
  p_display_name text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    display_name = COALESCE(p_display_name, display_name),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    updated_at = now()
  WHERE user_id = auth.uid();
END;
$$;

-- Create a restrictive update policy - only allow updating non-role fields
CREATE POLICY "Users can update own profile safely"
ON public.profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE user_id = auth.uid()));

-- Delete own profile
CREATE POLICY "Users can delete own profile"
ON public.profiles FOR DELETE TO authenticated
USING (user_id = auth.uid());
