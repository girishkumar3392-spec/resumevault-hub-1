import { useState, useMemo } from "react";
import { Search, Eye, Trash2, Download, FileText, X, MapPin } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { getResumes, getCategories, deleteResume, formatDate, categoryColor, categoryInitials, exportCSV } from "@/lib/store";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function BrowsePage() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string[]>([]);
  const [expFilter, setExpFilter] = useState<string[]>([]);
  const [locFilter, setLocFilter] = useState<string[]>([]);
  const [viewResume, setViewResume] = useState<string | null>(null);
  const [, setTick] = useState(0);

  const categories = getCategories().filter(c => c.active);
  const allResumes = getResumes();

  const allLocations = useMemo(() => {
    const locs = allResumes.map(r => r.location || '').filter(Boolean);
    return [...new Set(locs)].sort();
  }, [allResumes]);

  const filtered = useMemo(() => {
    return allResumes.filter(r => {
      const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase()) || (r.email || '').toLowerCase().includes(search.toLowerCase()) || (r.location || '').toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter.length === 0 || catFilter.includes(r.category);
      const matchExp = expFilter.length === 0 || expFilter.includes(r.experience);
      const matchLoc = locFilter.length === 0 || locFilter.includes(r.location || '');
      return matchSearch && matchCat && matchExp && matchLoc;
    });
  }, [allResumes, search, catFilter, expFilter, locFilter]);

  const toggleFilter = (arr: string[], val: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete resume for "${name}"?`)) {
      deleteResume(id);
      setViewResume(null);
      setTick(t => t + 1);
      toast.success('Resume deleted');
    }
  };

  const detail = viewResume ? allResumes.find(r => r.id === viewResume) : null;

  return (
    <>
      <PageHeader title="Browse Resumes" subtitle={`${allResumes.length} resumes in database`}>
        <button onClick={exportCSV} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-card border border-border rounded-md text-[13px] font-medium text-foreground hover:border-primary/30 transition-all cursor-pointer">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </PageHeader>
      <div className="p-7 flex-1">
        <div className="flex gap-5 items-start">
          {/* Filter sidebar */}
          <div className="w-60 shrink-0 bg-card border border-border rounded-lg p-4 sticky top-20">
            <div className="text-[13px] font-bold text-foreground mb-3.5 flex items-center justify-between">
              Filters
              {(catFilter.length > 0 || expFilter.length > 0) && (
                <button onClick={() => { setCatFilter([]); setExpFilter([]); }} className="text-[11px] text-primary cursor-pointer hover:underline">Clear</button>
              )}
            </div>

            <div className="mb-4">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Experience</div>
              {['Fresher', 'Junior', 'Mid-Level', 'Senior'].map(e => (
                <label key={e} className="flex items-center gap-2 py-1 px-1 rounded cursor-pointer text-[13px] text-muted-foreground hover:bg-hover hover:text-foreground transition-all">
                  <input type="checkbox" checked={expFilter.includes(e)} onChange={() => toggleFilter(expFilter, e, setExpFilter)} className="accent-primary w-3.5 h-3.5" />
                  {e}
                  <span className="ml-auto text-[11px] text-muted-foreground bg-hover px-1.5 py-0.5 rounded-full">
                    {allResumes.filter(r => r.experience === e).length}
                  </span>
                </label>
              ))}
            </div>

            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Category</div>
              <div className="max-h-60 overflow-y-auto space-y-0.5">
                {categories.map(c => {
                  const count = allResumes.filter(r => r.category === c.name).length;
                  return (
                    <label key={c.id} className="flex items-center gap-2 py-1 px-1 rounded cursor-pointer text-[13px] text-muted-foreground hover:bg-hover hover:text-foreground transition-all">
                      <input type="checkbox" checked={catFilter.includes(c.name)} onChange={() => toggleFilter(catFilter, c.name, setCatFilter)} className="accent-primary w-3.5 h-3.5" />
                      <span className="truncate">{c.name}</span>
                      <span className="ml-auto text-[11px] text-muted-foreground bg-hover px-1.5 py-0.5 rounded-full shrink-0">{count}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resumes..." className="w-full py-2 pl-8 pr-3 bg-card border border-border rounded-md text-foreground text-[13.5px] outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground" />
              </div>
              <span className="text-[13px] text-muted-foreground">
                Showing <span className="text-foreground font-semibold">{filtered.length}</span> results
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {filtered.map(r => (
                  <motion.div
                    key={r.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-card border border-border rounded-lg p-4 hover:border-primary/20 hover:-translate-y-0.5 transition-all hover:shadow-lg"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center font-display font-bold text-[15px] text-primary-foreground shrink-0" style={{ background: categoryColor(r.category) }}>
                        {categoryInitials(r.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground leading-tight mb-0.5">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.email || r.phone || '—'}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11.5px] font-medium" style={{ background: categoryColor(r.category) + '26', color: categoryColor(r.category) }}>
                        {r.category}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11.5px] font-medium bg-accent-dim text-primary">
                        {r.experience}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2.5 border-t border-border">
                      <span className="text-[11.5px] text-muted-foreground">{formatDate(r.uploadDate)}</span>
                      <div className="flex gap-1.5">
                        <button onClick={() => setViewResume(r.id)} className="p-1.5 rounded-md bg-hover border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all cursor-pointer">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(r.id, r.name)} className="p-1.5 rounded-md bg-hover border border-border text-muted-foreground hover:text-destructive hover:border-destructive hover:bg-red-dim transition-all cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-hover rounded-2xl flex items-center justify-center mb-4">
                  <FileText className="w-7 h-7 text-muted-foreground" />
                </div>
                <div className="text-[15px] font-semibold text-foreground mb-1.5">No resumes found</div>
                <div className="text-[13px] text-muted-foreground max-w-[280px]">Try adjusting your filters or search term</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {detail && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" onClick={() => setViewResume(null)} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 bottom-0 w-[520px] max-w-[95vw] bg-secondary border-l border-border z-[201] flex flex-col"
          >
            <div className="px-6 py-5 border-b border-border flex items-center justify-between shrink-0">
              <h3 className="text-base font-display font-bold">Resume Details</h3>
              <button onClick={() => setViewResume(null)} className="w-7 h-7 rounded-md bg-transparent text-muted-foreground cursor-pointer hover:bg-hover hover:text-foreground transition-all flex items-center justify-center border-none">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {/* Info */}
              <div className="space-y-3.5 mb-6">
                {[
                  ['Name', detail.name],
                  ['Email', detail.email || '—'],
                  ['Phone', detail.phone || '—'],
                  ['Category', detail.category],
                  ['Experience', detail.experience],
                  ['Notes', detail.notes || '—'],
                  ['Filename', detail.filename],
                  ['Uploaded', formatDate(detail.uploadDate)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start gap-2.5 pb-3.5 border-b border-border last:border-0">
                    <span className="text-xs text-muted-foreground font-medium w-28 shrink-0 pt-0.5">{label}</span>
                    <span className="text-[13.5px] text-foreground flex-1 break-words">{value}</span>
                  </div>
                ))}
              </div>

              {/* Resume Preview */}
              <div>
                <h4 className="text-sm font-display font-bold text-foreground mb-3">Resume Preview</h4>
                {detail.fileData ? (
                  detail.fileData.startsWith('data:application/pdf') ? (
                    <iframe
                      src={detail.fileData}
                      className="w-full h-[500px] rounded-lg border border-border bg-white"
                      title={`Preview: ${detail.name}`}
                    />
                  ) : (
                    <div className="rounded-lg border border-border bg-input p-6 flex flex-col items-center justify-center gap-3 text-center">
                      <FileText className="w-10 h-10 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Preview not available for this file format</p>
                      <a href={detail.fileData} download={detail.filename} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-[13px] font-medium hover:brightness-110 transition-all">
                        <Download className="w-3.5 h-3.5" /> Download File
                      </a>
                    </div>
                  )
                ) : (
                  <div className="rounded-lg border border-border bg-input p-8 flex flex-col items-center justify-center gap-2 text-center">
                    <FileText className="w-10 h-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No file data available</p>
                    <p className="text-xs text-muted-foreground">This resume was added without a file attachment</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}
