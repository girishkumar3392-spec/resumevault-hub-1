import { useState } from "react";
import { Plus, Trash2, Eye, X, FileText, Download } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { getCategories, saveCategories, addCategory, getResumes, formatDate, categoryColor, categoryInitials } from "@/lib/store";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function CategoriesPage() {
  const [, setTick] = useState(0);
  const [newName, setNewName] = useState("");
  const [viewCategory, setViewCategory] = useState<string | null>(null);
  const [viewResume, setViewResume] = useState<string | null>(null);
  const categories = getCategories();
  const resumes = getResumes();
  const navigate = useNavigate();

  const handleAdd = () => {
    if (!newName.trim()) return;
    if (addCategory(newName.trim())) {
      toast.success(`Category "${newName}" added`);
      setNewName("");
      setTick(t => t + 1);
    } else {
      toast.error("Category already exists");
    }
  };

  const toggleActive = (id: string) => {
    const cats = getCategories();
    saveCategories(cats.map(c => c.id === id ? { ...c, active: !c.active } : c));
    setTick(t => t + 1);
  };

  const handleDelete = (id: string, name: string) => {
    const count = resumes.filter(r => r.category === name).length;
    if (count > 0) {
      toast.error(`Cannot delete "${name}" — ${count} resume(s) assigned`);
      return;
    }
    if (confirm(`Delete category "${name}"?`)) {
      saveCategories(getCategories().filter(c => c.id !== id));
      setTick(t => t + 1);
      toast.success('Category deleted');
    }
  };

  const activeCount = categories.filter(c => c.active).length;
  const totalResumes = resumes.length;
  const categoryResumes = viewCategory ? resumes.filter(r => r.category === viewCategory) : [];
  const viewResumeDetail = viewResume ? resumes.find(r => r.id === viewResume) : null;

  return (
    <>
      <PageHeader title="Categories" subtitle={`${categories.length} categories, ${activeCount} active`} />
      <div className="p-7 flex-1">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: categories.length },
            { label: 'Active', value: activeCount },
            { label: 'Inactive', value: categories.length - activeCount },
            { label: 'Resumes', value: totalResumes },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-md py-3.5 px-4 text-center">
              <div className="text-2xl font-display font-extrabold text-foreground">{s.value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Add */}
        <div className="flex gap-2 mb-6">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="New category name..."
            className="flex-1 max-w-xs py-2 px-3 bg-input border border-border rounded-md text-foreground text-sm outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground"
          />
          <button onClick={handleAdd} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-[13.5px] font-medium hover:brightness-110 transition-all cursor-pointer">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          <AnimatePresence>
            {categories.map(c => {
              const count = resumes.filter(r => r.category === c.name).length;
              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-card border border-border rounded-lg p-4 transition-all ${!c.active ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                    <span className="text-[13.5px] font-semibold flex-1 truncate">{c.name}</span>
                  </div>
                  <div className="text-xl font-display font-extrabold text-foreground mb-0.5">{count}</div>
                  <div className="text-[11px] text-muted-foreground">Resumes</div>
                  <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border">
                    <div className="flex items-center gap-2">
                      <label className="relative inline-block w-8 h-[18px] cursor-pointer">
                        <input type="checkbox" checked={c.active} onChange={() => toggleActive(c.id)} className="opacity-0 w-0 h-0 absolute" />
                        <span className={`absolute inset-0 rounded-[9px] transition-all cursor-pointer ${c.active ? 'bg-accent-dim' : 'bg-hover'}`}>
                          <span className={`absolute h-3 w-3 left-[3px] bottom-[3px] rounded-full transition-all ${c.active ? 'translate-x-3.5 bg-primary' : 'bg-muted-foreground'}`} />
                        </span>
                      </label>
                      {count > 0 && (
                        <button
                          onClick={() => setViewCategory(c.name)}
                          className="p-1.5 rounded-md bg-hover border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
                          title="View resumes in this category"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <button onClick={() => handleDelete(c.id, c.name)} className="p-1.5 rounded-md bg-hover border border-border text-muted-foreground hover:text-destructive hover:border-destructive hover:bg-red-dim transition-all cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Category Resumes Drawer */}
      {viewCategory && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" onClick={() => { setViewCategory(null); setViewResume(null); }} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 bottom-0 w-[520px] max-w-[95vw] bg-secondary border-l border-border z-[201] flex flex-col"
          >
            <div className="px-6 py-5 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-display font-bold">{viewCategory}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{categoryResumes.length} resume{categoryResumes.length !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={() => { setViewCategory(null); setViewResume(null); }} className="w-7 h-7 rounded-md bg-transparent text-muted-foreground cursor-pointer hover:bg-hover hover:text-foreground transition-all flex items-center justify-center border-none">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {viewResumeDetail ? (
                /* Resume detail view inside category drawer */
                <div>
                  <button
                    onClick={() => setViewResume(null)}
                    className="inline-flex items-center gap-1 text-[13px] text-primary mb-4 cursor-pointer hover:underline"
                  >
                    ← Back to list
                  </button>
                  <div className="space-y-3.5 mb-5">
                    {[
                      ['Name', viewResumeDetail.name],
                      ['Email', viewResumeDetail.email || '—'],
                      ['Phone', viewResumeDetail.phone || '—'],
                      ['Experience', viewResumeDetail.experience],
                      ['Notes', viewResumeDetail.notes || '—'],
                      ['Filename', viewResumeDetail.filename],
                      ['Uploaded', formatDate(viewResumeDetail.uploadDate)],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-start gap-2.5 pb-3.5 border-b border-border last:border-0">
                        <span className="text-xs text-muted-foreground font-medium w-24 shrink-0 pt-0.5">{label}</span>
                        <span className="text-[13.5px] text-foreground flex-1 break-words">{value}</span>
                      </div>
                    ))}
                  </div>
                  {viewResumeDetail.fileData ? (
                    viewResumeDetail.fileData.startsWith('data:application/pdf') ? (
                      <div>
                        <h4 className="text-sm font-display font-bold text-foreground mb-3">Resume Preview</h4>
                        <iframe
                          src={viewResumeDetail.fileData}
                          className="w-full h-[450px] rounded-lg border border-border bg-white"
                          title={`Preview: ${viewResumeDetail.name}`}
                        />
                      </div>
                    ) : (
                      <div className="rounded-lg border border-border bg-input p-6 flex flex-col items-center gap-3">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                        <a href={viewResumeDetail.fileData} download={viewResumeDetail.filename} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-[13px] font-medium hover:brightness-110 transition-all">
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      </div>
                    )
                  ) : (
                    <div className="rounded-lg border border-border bg-input p-6 flex flex-col items-center gap-2 text-center">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No file attached</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Resumes list */
                <div className="space-y-2.5">
                  {categoryResumes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="w-10 h-10 text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">No resumes in this category</p>
                    </div>
                  ) : (
                    categoryResumes.map(r => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-border rounded-lg p-3.5 hover:border-primary/20 transition-all cursor-pointer"
                        onClick={() => setViewResume(r.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-sm text-primary-foreground shrink-0"
                            style={{ background: categoryColor(r.category) }}
                          >
                            {categoryInitials(r.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13.5px] font-semibold text-foreground truncate">{r.name}</div>
                            <div className="text-xs text-muted-foreground">{r.email || r.phone || '—'}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-accent-dim text-primary">
                              {r.experience}
                            </span>
                            <div className="text-[11px] text-muted-foreground mt-1">{formatDate(r.uploadDate)}</div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}
