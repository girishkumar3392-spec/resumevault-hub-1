import { useEffect, useRef } from "react";
import { Upload, Users, Tags, TrendingUp } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { formatDate, categoryColor, categoryInitials, getThisWeekCount, getMostPopularCategory } from "@/lib/store";
import { useResumes, useCategories } from "@/hooks/use-data";
import { motion } from "framer-motion";

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
      className="bg-card border border-border rounded-lg p-5 relative overflow-hidden hover:border-primary/50 transition-all group">
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

export default function DashboardPage() {
  const { data: resumes = [], isLoading: loadingResumes } = useResumes();
  const { data: categories = [], isLoading: loadingCategories } = useCategories();

  if (loadingResumes || loadingCategories) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Overview of your resume database" />
        <div className="p-4 md:p-7 flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </>
    );
  }

  const thisWeek = getThisWeekCount(resumes);
  const popular = getMostPopularCategory(resumes, categories);
  const recent = resumes.slice(0, 8);
  const expCounts = { Fresher: 0, Junior: 0, 'Mid-Level': 0, Senior: 0 };
  resumes.forEach(r => { if (r.experience in expCounts) expCounts[r.experience as keyof typeof expCounts]++; });

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of your resume database" />
      <div className="p-4 md:p-7 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Total Resumes" value={resumes.length} sub="All uploaded resumes" icon={Users} delay={0} />
          <KpiCard label="Categories" value={categories.filter(c => c.active).length} sub={`of ${categories.length} total`} icon={Tags} delay={1} />
          <KpiCard label="This Week" value={thisWeek} sub="Uploaded in last 7 days" icon={Upload} delay={2} />
          <KpiCard label="Top Category" value={popular} sub="Most resumes" icon={TrendingUp} delay={3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm font-display font-bold text-foreground mb-4">Recent Uploads</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="py-2.5 px-3.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary text-left">Name</th>
                    <th className="py-2.5 px-3.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary text-left">Category</th>
                    <th className="py-2.5 px-3.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary text-left">Experience</th>
                    <th className="py-2.5 px-3.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(r => (
                    <tr key={r.id} className="border-b border-border hover:bg-hover transition-colors">
                      <td className="py-3 px-3.5 text-[13.5px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0" style={{ background: categoryColor(r.category, categories) }}>
                            {categoryInitials(r.category)}
                          </div>
                          <span className="font-medium">{r.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11.5px] font-medium" style={{ background: categoryColor(r.category, categories) + '26', color: categoryColor(r.category, categories) }}>
                          {r.category}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-[13.5px] text-muted-foreground">{r.experience}</td>
                      <td className="py-3 px-3.5 text-[13.5px] text-muted-foreground">{formatDate(r.uploadDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm font-display font-bold text-foreground mb-4">Experience Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(expCounts).map(([level, count]) => {
                const pct = resumes.length ? Math.round((count / resumes.length) * 100) : 0;
                return (
                  <div key={level}>
                    <div className="flex justify-between text-[13px] mb-1.5">
                      <span className="text-muted-foreground">{level}</span>
                      <span className="text-foreground font-semibold">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-hover rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700" style={{ width: pct + '%' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Top Categories</h4>
              <div className="space-y-2">
                {categories
                  .filter(c => c.active)
                  .map(c => ({ ...c, count: resumes.filter(r => r.category === c.name).length }))
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map(c => (
                    <div key={c.id} className="flex items-center justify-between text-[13px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                        <span className="text-muted-foreground truncate max-w-[140px]">{c.name}</span>
                      </div>
                      <span className="text-foreground font-semibold">{c.count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
