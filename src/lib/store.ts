import { supabase } from "@/integrations/supabase/client";

const CAT_COLORS = [
  '#4F8EF7','#7C5CFC','#2DD4BF','#F59E0B','#EF4444',
  '#22C55E','#EC4899','#8B5CF6','#F97316','#06B6D4',
  '#84CC16','#E879F9','#FB7185','#34D399','#60A5FA',
  '#A78BFA','#FBBF24','#4ADE80','#F472B6','#38BDF8'
];

export interface Resume {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  category: string; // comma-separated for multi-category
  experience: string;
  notes: string;
  filename: string;
  fileData: string | null;
  uploadDate: string;
  uploadedBy: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  active: boolean;
  createdDate: string;
}

export interface Settings {
  companyName: string;
  tagline: string;
  logoData: string | null;
}

// ── Auth (localStorage) ──
export function isLoggedIn(): boolean {
  try {
    const s = JSON.parse(localStorage.getItem('rv_session') || 'null');
    if (!s) return false;
    if (Date.now() > s.expiry) { localStorage.removeItem('rv_session'); return false; }
    return true;
  } catch { return false; }
}

export function login(user: string, pass: string, remember: boolean): boolean {
  const storedUser = localStorage.getItem('rv_admin_user') || 'admin';
  const storedPwd = localStorage.getItem('rv_admin_pwd') || btoa('Admin@123');
  if (user.trim().toLowerCase() === storedUser && btoa(pass) === storedPwd) {
    const dur = remember ? 28800000 : 14400000;
    localStorage.setItem('rv_session', JSON.stringify({ token: crypto.randomUUID(), expiry: Date.now() + dur, user }));
    return true;
  }
  return false;
}

export function logout() { localStorage.removeItem('rv_session'); }

export function initDefaults() {
  if (!localStorage.getItem('rv_admin_pwd')) localStorage.setItem('rv_admin_pwd', btoa('Admin@123'));
  if (!localStorage.getItem('rv_admin_user')) localStorage.setItem('rv_admin_user', 'admin');
}

// ── Resumes (Supabase) ──
function dbToResume(r: any): Resume {
  return {
    id: r.id,
    name: r.name,
    email: r.email || '',
    phone: r.phone || '',
    location: r.location || '',
    category: r.category,
    experience: r.experience,
    notes: r.notes || '',
    filename: r.filename,
    fileData: r.file_data,
    uploadDate: r.created_at,
    uploadedBy: r.uploaded_by || 'admin',
  };
}

export async function fetchResumes(): Promise<Resume[]> {
  const { data, error } = await supabase.from('resumes').select('*').order('created_at', { ascending: false });
  if (error) { console.error('fetchResumes:', error); return []; }
  return (data || []).map(dbToResume);
}

export async function addResume(obj: Omit<Resume, 'id' | 'uploadDate' | 'uploadedBy'>): Promise<Resume> {
  const { data, error } = await supabase.from('resumes').insert({
    name: obj.name,
    email: obj.email || '',
    phone: obj.phone || '',
    location: obj.location || '',
    category: obj.category,
    experience: obj.experience,
    notes: obj.notes || '',
    filename: obj.filename,
    file_data: obj.fileData,
    uploaded_by: 'admin',
  }).select().single();
  if (error) throw error;
  return dbToResume(data);
}

export async function deleteResume(id: string) {
  const { error } = await supabase.from('resumes').delete().eq('id', id);
  if (error) throw error;
}

export async function updateResume(id: string, data: Partial<Resume>) {
  const update: any = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.email !== undefined) update.email = data.email;
  if (data.phone !== undefined) update.phone = data.phone;
  if (data.location !== undefined) update.location = data.location;
  if (data.category !== undefined) update.category = data.category;
  if (data.experience !== undefined) update.experience = data.experience;
  if (data.notes !== undefined) update.notes = data.notes;
  if (data.filename !== undefined) update.filename = data.filename;
  if (data.fileData !== undefined) update.file_data = data.fileData;
  const { error } = await supabase.from('resumes').update(update).eq('id', id);
  if (error) throw error;
}

// ── Categories (Supabase) ──
function dbToCategory(c: any): Category {
  return { id: c.id, name: c.name, color: c.color, active: c.active, createdDate: c.created_at };
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) { console.error('fetchCategories:', error); return []; }
  return (data || []).map(dbToCategory);
}

export async function addCategory(name: string): Promise<boolean> {
  const cats = await fetchCategories();
  if (cats.find(c => c.name.toLowerCase() === name.toLowerCase())) return false;
  const color = CAT_COLORS[cats.length % CAT_COLORS.length];
  const { error } = await supabase.from('categories').insert({ name, color, active: true });
  if (error) { console.error('addCategory:', error); return false; }
  return true;
}

export async function updateCategory(id: string, data: Partial<{ name: string; color: string; active: boolean }>) {
  const { error } = await supabase.from('categories').update(data).eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ── Settings (Supabase) ──
export async function fetchSettings(): Promise<Settings> {
  const { data, error } = await supabase.from('settings').select('*').limit(1).single();
  if (error || !data) return { companyName: 'ResumeVault', tagline: 'Smart Hiring Intelligence', logoData: null };
  return { companyName: data.company_name || 'ResumeVault', tagline: data.tagline || '', logoData: data.logo_data };
}

export async function saveSettings(obj: Partial<Settings>) {
  const current = await fetchSettings();
  const { data: existing } = await supabase.from('settings').select('id').limit(1).single();
  if (existing) {
    await supabase.from('settings').update({
      company_name: obj.companyName ?? current.companyName,
      tagline: obj.tagline ?? current.tagline,
      logo_data: obj.logoData ?? current.logoData,
    }).eq('id', existing.id);
  }
}

// ── Utils ──
export function formatDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  if (days < 7) return days + 'd ago';
  return formatDate(iso);
}

export function categoryColor(name: string, categories: Category[]): string {
  const idx = categories.findIndex(c => c.name === name);
  return idx >= 0 ? categories[idx].color : CAT_COLORS[0];
}

export function categoryInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

export function getMostPopularCategory(resumes: Resume[], categories: Category[]): string {
  const cats = categories.filter(c => c.active);
  if (!cats.length || !resumes.length) return '—';
  const counts: Record<string, number> = {};
  resumes.forEach(r => {
    r.category.split(',').map(c => c.trim()).filter(Boolean).forEach(cat => {
      counts[cat] = (counts[cat] || 0) + 1;
    });
  });
  let max = 0, best = '—';
  Object.entries(counts).forEach(([cat, cnt]) => {
    if (cnt > max && cats.some(c => c.name === cat)) { max = cnt; best = cat; }
  });
  return best;
}

export function getThisWeekCount(resumes: Resume[]): number {
  const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - 7);
  return resumes.filter(r => new Date(r.uploadDate) >= start).length;
}

export function exportCSV(resumes: Resume[]) {
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Location', 'Category', 'Experience', 'Notes', 'Filename', 'Upload Date'];
  const rows = resumes.map(r => [r.id, r.name, r.email, r.phone, r.location || '', r.category, r.experience, (r.notes || '').replace(/,/g, ';'), r.filename, formatDate(r.uploadDate)]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'resumes_export.csv'; a.click();
  URL.revokeObjectURL(url);
}

export async function exportJSON() {
  const [resumes, categories, settings] = await Promise.all([fetchResumes(), fetchCategories(), fetchSettings()]);
  const data = { resumes: resumes.map(r => ({ ...r, fileData: undefined })), categories, settings, exportDate: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'resumevault_backup.json'; a.click();
  URL.revokeObjectURL(url);
}
