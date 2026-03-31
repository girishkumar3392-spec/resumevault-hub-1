import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { getCategories, saveCategories, addCategory, getResumes } from "@/lib/store";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function CategoriesPage() {
  const [, setTick] = useState(0);
  const [newName, setNewName] = useState("");
  const categories = getCategories();
  const resumes = getResumes();

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

  // Stats
  const activeCount = categories.filter(c => c.active).length;
  const totalResumes = resumes.length;

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
                    <label className="relative inline-block w-8 h-[18px] cursor-pointer">
                      <input type="checkbox" checked={c.active} onChange={() => toggleActive(c.id)} className="opacity-0 w-0 h-0 absolute" />
                      <span className={`absolute inset-0 rounded-[9px] transition-all cursor-pointer ${c.active ? 'bg-accent-dim' : 'bg-hover'}`}>
                        <span className={`absolute h-3 w-3 left-[3px] bottom-[3px] rounded-full transition-all ${c.active ? 'translate-x-3.5 bg-primary' : 'bg-muted-foreground'}`} />
                      </span>
                    </label>
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
    </>
  );
}
