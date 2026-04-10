
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::TEXT
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Trigger function: auto-assign 'user' role + create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============ RLS POLICIES FOR user_roles ============
CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ UPDATE RESUMES RLS ============
-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow read resumes" ON public.resumes;
DROP POLICY IF EXISTS "Allow insert resumes" ON public.resumes;
DROP POLICY IF EXISTS "Allow update resumes" ON public.resumes;
DROP POLICY IF EXISTS "Allow delete resumes" ON public.resumes;

-- New strict policies
CREATE POLICY "Users read own resumes"
  ON public.resumes FOR SELECT
  TO authenticated
  USING (uploaded_by = auth.uid()::TEXT OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anon read resumes"
  ON public.resumes FOR SELECT
  TO anon
  USING (false);

CREATE POLICY "Users insert own resumes"
  ON public.resumes FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid()::TEXT OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users update own resumes"
  ON public.resumes FOR UPDATE
  TO authenticated
  USING (uploaded_by = auth.uid()::TEXT OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users delete own resumes"
  ON public.resumes FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid()::TEXT OR public.has_role(auth.uid(), 'admin'));

-- ============ UPDATE CATEGORIES RLS ============
DROP POLICY IF EXISTS "Allow read categories" ON public.categories;
DROP POLICY IF EXISTS "Allow insert categories" ON public.categories;
DROP POLICY IF EXISTS "Allow update categories" ON public.categories;
DROP POLICY IF EXISTS "Allow delete categories" ON public.categories;

CREATE POLICY "Anyone can read categories"
  ON public.categories FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ UPDATE SETTINGS RLS ============
DROP POLICY IF EXISTS "Allow read settings" ON public.settings;
DROP POLICY IF EXISTS "Allow insert settings" ON public.settings;
DROP POLICY IF EXISTS "Allow update settings" ON public.settings;

CREATE POLICY "Anyone can read settings"
  ON public.settings FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can insert settings"
  ON public.settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update settings"
  ON public.settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ UPDATE PROFILES RLS ============
DROP POLICY IF EXISTS "Allow read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow update profiles" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND role IS NOT DISTINCT FROM (SELECT role FROM public.profiles WHERE user_id = auth.uid()));
