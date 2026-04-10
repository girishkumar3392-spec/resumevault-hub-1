import { useState, useMemo, useEffect } from "react";
import { Search, Eye, FileText, X, MapPin, SlidersHorizontal, Maximize2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { formatDate, categoryColor } from "@/lib/store";
import { useResumes, useCategories } from "@/hooks/use-data";
import { motion, AnimatePresence } from "framer-motion";

function base64ToBlobUrl(base64: string, mime = 'application/pdf'): string {
  const byteChars = atob(base64);
  const byteArr = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
  return URL.createObjectURL(new Blob([byteArr], { type: mime }));
}

export default function UserBrowsePage() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string[]>([]);
  const [expFilter, setExpFilter] = useState<string[]>([]);
  const [viewResume, setViewResume] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: allResumes = [], isLoading } = useResumes();
  const { data: allCategories = [] } = useCategories();
  const categories = allCategories.filter(c => c.active);

  const getResumeCategories = (cat: string) => cat.split(',').map(c => c.trim()).filter(Boolean);

  const filtered = useMemo(() => {
    return allResumes.filter(r => {
      const q = search.toLowerCase();
      const matchSearch = !search || r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q) || (r.email || '').toLowerCase().includes(q);
      const resumeCats = getResumeCategories(r.category);
      const matchCat = catFilter.length === 0 || catFilter.some(f => resumeCats.includes(f));
      const matchExp = expFilter.length === 0 || expFilter.includes(r.experience);
      return matchSearch && matchCat && matchExp;
    });
  }, [allResumes, search, catFilter, expFilter]);

  const toggleFilter = (arr: string[], val: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const detail = viewResume ? allResumes.find(r => r.id === viewResume) : null;

  return (
    <>
      <PageHeader title="My Resumes" subtitle={`${allResumes.length} resumes uploaded by you`} />
      <div className="p-4 md:p-7 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4 md:gap-5 items-start">
            <button onClick={() => setShowFilters(!showFilters)}
              className="md:hidden w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-card border border-border rounded-lg text-[13px] font-medium text-foreground cursor-pointer">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>

            <div className={`w-full md:w-56 shrink-0 bg-card border border-border rounded-lg p-4 md:sticky md:top-20 ${showFilters ? 'block' : 'hidden md:block'}`}>
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
                  </label>
                ))}
              </div>
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Category</div>
                <div className="max-h-60 overflow-y-auto space-y-0.5">
                  {categories.map(c => (
                    <label key={c.id} className="flex items-center gap-2 py-1 px-1 rounded cursor-pointer text-[13px] text-muted-foreground hover:bg-hover hover:text-foreground transition-all">
                      <input type="checkbox" checked={catFilter.includes(c.name)} onChange={() => toggleFilter(catFilter, c.name, setCatFilter)} className="accent-primary w-3.5 h-3.5" />
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                      <span className="truncate">{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4 gap-3">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your resumes..."
                    className="w-full py-2 pl-8 pr-3 bg-card border border-border rounded-md text-foreground text-[13.5px] outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground" />
                </div>
                <span className="text-[13px] text-muted-foreground">
                  <span className="text-foreground font-semibold">{filtered.length}</span> results
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filtered.map(r => {
                    const resumeCats = getResumeCategories(r.category);
                    return (
                      <motion.div key={r.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-card border border-border rounded-lg p-4 hover:border-primary/20 hover:-translate-y-0.5 transition-all hover:shadow-lg">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center font-display font-bold text-[15px] text-primary-foreground shrink-0 bg-primary">
                            {r.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-foreground leading-tight mb-0.5">{r.name}</div>
                            <div className="text-xs text-muted-foreground">{r.email || '—'}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {resumeCats.map(cat => (
                            <span key={cat} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: categoryColor(cat, allCategories) + '26', color: categoryColor(cat, allCategories) }}>
                              {cat}
                            </span>
                          ))}
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-accent-dim text-primary">{r.experience}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2.5 border-t border-border">
                          <span className="text-[11.5px] text-muted-foreground">{formatDate(r.uploadDate)}</span>
                          <button onClick={() => setViewResume(r.id)} className="p-1.5 rounded-md bg-hover border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all cursor-pointer">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {filtered.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-hover rounded-2xl flex items-center justify-center mb-4">
                    <FileText className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div className="text-[15px] font-semibold text-foreground mb-1.5">No resumes found</div>
                  <div className="text-[13px] text-muted-foreground">Try adjusting your filters or upload a resume first</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {detail && <UserResumeDetail detail={detail} categories={allCategories} onClose={() => setViewResume(null)} />}
    </>
  );
}

function UserResumeDetail({ detail, categories, onClose }: { detail: any; categories: any[]; onClose: () => void }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (detail.fileData) {
      const url = base64ToBlobUrl(detail.fileData);
      setBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    return undefined;
  }, [detail.fileData, detail.id]);

  const resumeCats = detail.category.split(',').map((c: string) => c.trim()).filter(Boolean);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} transition={{ type: 'spring', damping: 25 }}
        className={`fixed right-0 top-0 bottom-0 bg-secondary border-l border-border z-[201] flex flex-col ${fullscreen ? 'w-full' : 'w-[520px] max-w-[95vw]'}`}>
        <div className="px-4 md:px-6 py-4 border-b border-border flex items-center justify-between shrink-0 gap-2">
          <h3 className="text-base font-display font-bold truncate">{detail.name}</h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {detail.fileData && (
              <button onClick={() => setFullscreen(!fullscreen)} className="p-1.5 rounded-md bg-hover border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all cursor-pointer" title="Toggle fullscreen">
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-md bg-hover border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {!fullscreen && (
            <div className="space-y-3 mb-5">
              {[['Name', detail.name], ['Email', detail.email || '—'], ['Phone', detail.phone || '—'],
                ['Experience', detail.experience], ['Notes', detail.notes || '—'], ['Filename', detail.filename], ['Uploaded', formatDate(detail.uploadDate)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start gap-2.5 pb-3 border-b border-border last:border-0">
                  <span className="text-xs text-muted-foreground font-medium w-24 shrink-0 pt-0.5">{label}</span>
                  <span className="text-[13.5px] text-foreground flex-1 break-words">{value}</span>
                </div>
              ))}
              <div className="flex items-start gap-2.5 pb-3 border-b border-border">
                <span className="text-xs text-muted-foreground font-medium w-24 shrink-0 pt-1">Categories</span>
                <div className="flex flex-wrap gap-1.5">
                  {resumeCats.map((cat: string) => (
                    <span key={cat} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: categoryColor(cat, categories) + '26', color: categoryColor(cat, categories) }}>
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          {blobUrl ? (
            <iframe src={blobUrl} className={`w-full rounded-lg border border-border bg-white ${fullscreen ? 'h-[calc(100vh-80px)]' : 'h-[500px]'}`} title={`Preview: ${detail.name}`} />
          ) : (
            <div className="rounded-lg border border-border bg-input p-8 flex flex-col items-center gap-3 text-center">
              <FileText className="w-12 h-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No file preview available</p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
