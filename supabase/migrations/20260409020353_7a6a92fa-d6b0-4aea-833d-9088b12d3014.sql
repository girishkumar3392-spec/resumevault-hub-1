
-- Add anon role to all existing policies for categories
DROP POLICY IF EXISTS "Authenticated users can read categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON public.categories;

CREATE POLICY "Allow read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert categories" ON public.categories FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update categories" ON public.categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete categories" ON public.categories FOR DELETE TO anon, authenticated USING (true);

-- Add anon role to all existing policies for resumes
DROP POLICY IF EXISTS "Authenticated users can read resumes" ON public.resumes;
DROP POLICY IF EXISTS "Authenticated users can insert resumes" ON public.resumes;
DROP POLICY IF EXISTS "Authenticated users can update resumes" ON public.resumes;
DROP POLICY IF EXISTS "Authenticated users can delete resumes" ON public.resumes;

CREATE POLICY "Allow read resumes" ON public.resumes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert resumes" ON public.resumes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update resumes" ON public.resumes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete resumes" ON public.resumes FOR DELETE TO anon, authenticated USING (true);

-- Add anon role to settings policies
DROP POLICY IF EXISTS "Authenticated users can read settings" ON public.settings;
DROP POLICY IF EXISTS "Authenticated users can update settings" ON public.settings;

CREATE POLICY "Allow read settings" ON public.settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert settings" ON public.settings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update settings" ON public.settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Add anon role to profiles policies
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile safely" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

CREATE POLICY "Allow read profiles" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert profiles" ON public.profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update profiles" ON public.profiles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
