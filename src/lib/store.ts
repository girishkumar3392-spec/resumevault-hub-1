// ResumeVault — localStorage data layer

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
  category: string;
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

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

const DEFAULT_CATEGORIES = [
  'Graphic Designer','UI/UX Designer','Video Editor','Motion Graphics Artist',
  'Content Writer / Copywriter','Digital Marketer','SEO Specialist',
  'Social Media Manager','Frontend Developer','Backend Developer',
  'Full Stack Developer','Mobile App Developer','Data Analyst',
  'Data Science / ML Engineer','DevOps / Cloud Engineer',
  'Cybersecurity Analyst','HR & Recruitment','Sales Executive',
  'Business Development','Project Manager / Scrum Master'
];

export function initDefaults() {
  if (!localStorage.getItem('rv_admin_pwd')) localStorage.setItem('rv_admin_pwd', btoa('Admin@123'));
  if (!localStorage.getItem('rv_admin_user')) localStorage.setItem('rv_admin_user', 'admin');
  if (!localStorage.getItem('rv_settings')) {
    localStorage.setItem('rv_settings', JSON.stringify({ companyName: 'ResumeVault', tagline: 'Smart Hiring Intelligence', logoData: null }));
  }
  if (!localStorage.getItem('rv_categories')) {
    const cats = DEFAULT_CATEGORIES.map((name, i) => ({
      id: 'cat_' + i, name, color: CAT_COLORS[i % CAT_COLORS.length], active: true, createdDate: new Date().toISOString()
    }));
    localStorage.setItem('rv_categories', JSON.stringify(cats));
  }
  if (!localStorage.getItem('rv_resumes')) {
    const samples = [
      { name:'Rahul Sharma', email:'rahul@email.com', phone:'9876543210', location:'Jaipur', category:'Frontend Developer', experience:'Mid-Level', notes:'Strong React & Vue skills, 4 years experience' },
      { name:'Priya Mehta', email:'priya@email.com', phone:'9123456780', location:'Mumbai', category:'UI/UX Designer', experience:'Senior', notes:'Figma expert, design systems, 6yr exp' },
      { name:'Arjun Patel', email:'arjun@email.com', phone:'8800123456', location:'Delhi', category:'Digital Marketer', experience:'Junior', notes:'Google Ads certified, Meta Ads' },
      { name:'Sneha Reddy', email:'sneha@email.com', phone:'7700998877', location:'Hyderabad', category:'Video Editor', experience:'Mid-Level', notes:'Adobe Premiere, After Effects, DaVinci' },
      { name:'Vikram Singh', email:'vikram@email.com', phone:'9900112233', location:'Bangalore', category:'Full Stack Developer', experience:'Senior', notes:'Node.js, React, MongoDB, AWS' },
      { name:'Neha Gupta', email:'neha@email.com', phone:'8811223344', location:'Jaipur', category:'Content Writer / Copywriter', experience:'Fresher', notes:'Blog writing, SEO content, social media' },
      { name:'Karan Joshi', email:'karan@email.com', phone:'9922334455', location:'Pune', category:'Data Analyst', experience:'Mid-Level', notes:'Python, Power BI, SQL, Tableau' },
      { name:'Divya Nair', email:'divya@email.com', phone:'9833221100', location:'Chennai', category:'Graphic Designer', experience:'Junior', notes:'Adobe Illustrator, Photoshop, Canva' },
      { name:'Rohit Mishra', email:'rohit@email.com', phone:'8899001122', location:'Delhi', category:'SEO Specialist', experience:'Mid-Level', notes:'Technical SEO, keyword research, backlinks' },
      { name:'Anjali Sharma', email:'anjali@email.com', phone:'9988776655', location:'Mumbai', category:'HR & Recruitment', experience:'Senior', notes:'Talent acquisition, HRIS, payroll' },
    ];
    const resumes: Resume[] = samples.map((s, i) => ({
      id: generateId(), ...s,
      filename: s.name.replace(' ', '_').toLowerCase() + '_resume.pdf',
      fileData: null,
      uploadDate: new Date(Date.now() - (i * 86400000 * 1.5)).toISOString(),
      uploadedBy: 'admin'
    }));
    localStorage.setItem('rv_resumes', JSON.stringify(resumes));
  }
}

// Auth
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
    localStorage.setItem('rv_session', JSON.stringify({ token: generateId() + generateId(), expiry: Date.now() + dur, user }));
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem('rv_session');
}

// Resumes
export function getResumes(): Resume[] {
  try { return JSON.parse(localStorage.getItem('rv_resumes') || '[]'); } catch { return []; }
}
export function saveResumes(arr: Resume[]) { localStorage.setItem('rv_resumes', JSON.stringify(arr)); }
export function addResume(obj: Omit<Resume, 'id' | 'uploadDate' | 'uploadedBy'>) {
  const resumes = getResumes();
  resumes.unshift({ ...obj, id: generateId(), uploadDate: new Date().toISOString(), uploadedBy: 'admin' });
  saveResumes(resumes);
}
export function deleteResume(id: string) { saveResumes(getResumes().filter(r => r.id !== id)); }
export function updateResume(id: string, data: Partial<Resume>) { saveResumes(getResumes().map(r => r.id === id ? { ...r, ...data } : r)); }

// Categories
export function getCategories(): Category[] {
  try { return JSON.parse(localStorage.getItem('rv_categories') || '[]'); } catch { return []; }
}
export function saveCategories(arr: Category[]) { localStorage.setItem('rv_categories', JSON.stringify(arr)); }
export function addCategory(name: string): boolean {
  const cats = getCategories();
  if (cats.find(c => c.name.toLowerCase() === name.toLowerCase())) return false;
  cats.push({ id: 'cat_' + generateId(), name, color: CAT_COLORS[cats.length % CAT_COLORS.length], active: true, createdDate: new Date().toISOString() });
  saveCategories(cats);
  return true;
}

// Settings
export function getSettings(): Settings {
  try { return JSON.parse(localStorage.getItem('rv_settings') || '{}'); } catch { return { companyName: 'ResumeVault', tagline: 'Smart Hiring Intelligence', logoData: null }; }
}
export function saveSettings(obj: Partial<Settings>) {
  localStorage.setItem('rv_settings', JSON.stringify({ ...getSettings(), ...obj }));
}

// Utils
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

export function categoryColor(name: string): string {
  const cats = getCategories();
  const idx = cats.findIndex(c => c.name === name);
  return CAT_COLORS[(idx >= 0 ? idx : 0) % CAT_COLORS.length];
}

export function categoryInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

export function getMostPopularCategory(): string {
  const resumes = getResumes();
  const cats = getCategories().filter(c => c.active);
  if (!cats.length || !resumes.length) return '—';
  let max = 0, best = '—';
  cats.forEach(c => {
    const cnt = resumes.filter(r => r.category === c.name).length;
    if (cnt > max) { max = cnt; best = c.name; }
  });
  return best;
}

export function getThisWeekCount(): number {
  const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - 7);
  return getResumes().filter(r => new Date(r.uploadDate) >= start).length;
}

export function getResumesByWeek(weeks: number): number[] {
  const resumes = getResumes();
  return Array.from({ length: weeks }, (_, i) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay() - ((weeks - 1 - i) * 7));
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return resumes.filter(r => { const d = new Date(r.uploadDate); return d >= start && d < end; }).length;
  });
}

export function exportCSV() {
  const resumes = getResumes();
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Category', 'Experience', 'Notes', 'Filename', 'Upload Date'];
  const rows = resumes.map(r => [r.id, r.name, r.email, r.phone, r.category, r.experience, (r.notes || '').replace(/,/g, ';'), r.filename, formatDate(r.uploadDate)]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'resumes_export.csv'; a.click();
  URL.revokeObjectURL(url);
}

export function exportJSON() {
  const data = { resumes: getResumes().map(r => ({ ...r, fileData: undefined })), categories: getCategories(), settings: getSettings(), exportDate: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'resumevault_backup.json'; a.click();
  URL.revokeObjectURL(url);
}
