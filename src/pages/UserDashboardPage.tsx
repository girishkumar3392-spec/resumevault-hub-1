import { useEffect, useRef } from "react";
import { Upload, FileText, FolderSearch } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { formatDate } from "@/lib/store";
import { useResumes, useCategories } from "@/hooks/use-data";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function KpiCard({ label, value, sub, icon: Icon, delay }: { label: string; value: number | string; sub: string; icon: React.ElementType; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current && typeof value === 'number') {
      let startTime: number;
      const dur = 800;
      const step = (ts: number) => {
        if (!startTime) startTime = ts;
        const p = Math.min((ts - startTime) / dur, 1);
        if (ref.current) ref.current.textContent = Math.floor(p * value).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
        else if (ref.current) ref.current.textContent = value.toLocaleString();
      };
      requestAnimationFrame(step);
    }
  }, [value]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay * 0.05 }}
      className="bg-card border border-border rounded-lg p-5 relative overflow-hidden hover:border-primary/50 transition-all">
      <div className="absolute top-0 right-0 w-20 h-20 bg-accent-dim rounded-full translate-x-[30px] -translate-y-[30px]" />
      <div className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-accent-dim">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2.5">{label}</div>
      <div ref={ref} className="text-3xl font-display font-extrabold text-foreground leading-none mb-1.5">
        {typeof value === 'string' ? value : '0'}
      </div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </motion.div>
  );
}

export default function UserDashboardPage() {
  const { user } = useAuth();
  const { data: resumes = [], isLoading } = useResumes();
  const { data: categories = [] } = useCategories();

  // User can only see own resumes (enforced by RLS)
  const recent = resumes.slice(0, 5);

  if (isLoading) {
    return (
      <>
        <PageHeader title="My Dashboard" subtitle="Your resume overview" />
        <div className="p-4 md:p-7 flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="My Dashboard" subtitle={`Welcome back, ${user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'}`} />
      <div className="p-4 md:p-7 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <KpiCard label="My Resumes" value={resumes.length} sub="Total uploaded" icon={FileText} delay={0} />
          <KpiCard label="Categories" value={categories.filter(c => c.active).length} sub="Available categories" icon={FolderSearch} delay={1} />
          <KpiCard label="This Week" value={resumes.filter(r => new Date(r.uploadDate) >= new Date(Date.now() - 7 * 86400000)).length} sub="Uploaded recently" icon={Upload} delay={2} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-display font-bold text-foreground">Recent Uploads</h3>
              <Link to="/browse" className="text-[12px] text-primary hover:underline">View all →</Link>
            </div>
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-2">No resumes uploaded yet</p>
                <Link to="/upload" className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-[13px] font-medium hover:brightness-110 transition-all">
                  <Upload className="w-3.5 h-3.5" /> Upload Your First Resume
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recent.map(r => (
                  <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-hover transition-all">
                    <div className="w-8 h-8 rounded-lg bg-accent-dim flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-foreground truncate">{r.name}</div>
                      <div className="text-[11px] text-muted-foreground">{r.category}</div>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">{formatDate(r.uploadDate)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm font-display font-bold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/upload" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-hover transition-all">
                <div className="w-10 h-10 rounded-lg bg-accent-dim flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-foreground">Upload Resume</div>
                  <div className="text-[11px] text-muted-foreground">Add a new resume to the system</div>
                </div>
              </Link>
              <Link to="/browse" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-hover transition-all">
                <div className="w-10 h-10 rounded-lg bg-accent-dim flex items-center justify-center shrink-0">
                  <FolderSearch className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-foreground">My Resumes</div>
                  <div className="text-[11px] text-muted-foreground">View and manage your uploaded resumes</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
