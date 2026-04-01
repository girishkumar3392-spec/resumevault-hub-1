import PageHeader from "@/components/PageHeader";
import { getResumes, getCategories, getThisWeekCount, getMostPopularCategory } from "@/lib/store";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#4F8EF7', '#7C5CFC', '#2DD4BF', '#F59E0B', '#EF4444', '#22C55E', '#EC4899', '#8B5CF6'];

export default function AnalyticsPage() {
  const resumes = getResumes();
  const categories = getCategories().filter(c => c.active);

  // Category distribution
  const catData = categories
    .map(c => ({ name: c.name.length > 15 ? c.name.substring(0, 15) + '…' : c.name, value: resumes.filter(r => r.category === c.name).length, color: c.color }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Experience distribution
  const expData = ['Fresher', 'Junior', 'Mid-Level', 'Senior'].map(e => ({
    name: e, value: resumes.filter(r => r.experience === e).length
  }));

  // Weekly trend (last 8 weeks)
  const weeklyData = Array.from({ length: 8 }, (_, i) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay() - ((7 - i) * 7));
    const end = new Date(start); end.setDate(end.getDate() + 7);
    return {
      name: `W${i + 1}`,
      value: resumes.filter(r => { const d = new Date(r.uploadDate); return d >= start && d < end; }).length
    };
  });

  const stats = [
    { label: 'Total Resumes', value: resumes.length },
    { label: 'Categories', value: categories.length },
    { label: 'This Week', value: getThisWeekCount() },
    { label: 'Top Category', value: getMostPopularCategory() },
  ];

  return (
    <>
      <PageHeader title="Analytics" subtitle="Insights & statistics" />
      <div className="p-4 md:p-7 flex-1">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-md py-3.5 px-4 text-center"
            >
              <div className="text-2xl font-display font-extrabold text-foreground">{s.value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Category Chart */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm font-display font-bold text-foreground mb-4">Resumes by Category</h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" stroke="#4B5563" fontSize={11} />
                  <YAxis dataKey="name" type="category" width={100} stroke="#4B5563" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#141720', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {catData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Experience Pie */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm font-display font-bold text-foreground mb-4">Experience Distribution</h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                    {expData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#141720', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-display font-bold text-foreground mb-4">Weekly Upload Trend</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="name" stroke="#4B5563" fontSize={11} />
                <YAxis stroke="#4B5563" fontSize={11} />
                <Tooltip contentStyle={{ background: '#141720', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="#4F8EF7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
