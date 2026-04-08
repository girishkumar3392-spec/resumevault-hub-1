
DROP POLICY IF EXISTS "Allow all access to resumes" ON public.resumes;
DROP POLICY IF EXISTS "Allow all resumes" ON public.resumes;
DROP POLICY IF EXISTS "Allow all access to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow all categories" ON public.categories;
DROP POLICY IF EXISTS "Allow all access to settings" ON public.settings;
DROP POLICY IF EXISTS "Allow all settings" ON public.settings;
DROP POLICY IF EXISTS "Allow all access to profiles" ON public.profiles;

CREATE POLICY "Authenticated users can read resumes" ON public.resumes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert resumes" ON public.resumes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update resumes" ON public.resumes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete resumes" ON public.resumes FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read categories" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update categories" ON public.categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete categories" ON public.categories FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read settings" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update settings" ON public.settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage own profile" ON public.profiles FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
