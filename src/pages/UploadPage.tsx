import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, FileText, X, Check, Eye } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { addResume, getCategories } from "@/lib/store";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface FileEntry {
  file: File;
  name: string;
  category: string;
  experience: string;
  email: string;
  phone: string;
  location: string;
  notes: string;
  progress: number;
  done: boolean;
  uploading: boolean;
  previewUrl: string | null;
}

export default function UploadPage() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [dragging, setDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const categories = getCategories().filter(c => c.active);
  const intervalsRef = useRef<Map<number, ReturnType<typeof setInterval>>>(new Map());

  useEffect(() => {
    return () => {
      intervalsRef.current.forEach(interval => clearInterval(interval));
      intervalsRef.current.clear();
      // Revoke preview URLs
      files.forEach(f => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); });
    };
  }, []);

  const handleFiles = useCallback((fileList: FileList) => {
    const entries: FileEntry[] = Array.from(fileList).map(f => ({
      file: f,
      name: f.name.replace(/[._-]/g, ' ').replace(/\.(pdf|docx?|rtf)$/i, '').replace(/\b\w/g, l => l.toUpperCase()).trim(),
      category: categories[0]?.name || '',
      experience: 'Mid-Level',
      email: '',
      phone: '',
      location: '',
      notes: '',
      progress: 0,
      done: false,
      uploading: false,
      previewUrl: f.type === 'application/pdf' ? URL.createObjectURL(f) : null,
    }));
    setFiles(prev => [...prev, ...entries]);
  }, [categories]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  const updateFile = (idx: number, data: Partial<FileEntry>) => {
    setFiles(prev => prev.map((f, i) => i === idx ? { ...f, ...data } : f));
  };

  const removeFile = (idx: number) => {
    const interval = intervalsRef.current.get(idx);
    if (interval) { clearInterval(interval); intervalsRef.current.delete(idx); }
    setFiles(prev => {
      const f = prev[idx];
      if (f?.previewUrl) URL.revokeObjectURL(f.previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const uploadFile = (idx: number) => {
    const entry = files[idx];
    if (!entry || entry.done || entry.uploading) return;
    if (!entry.name.trim() || !entry.category) {
      toast.error('Name and category are required');
      return;
    }

    // Mark as uploading
    updateFile(idx, { uploading: true, progress: 0 });

    // Keep a reference to the File object and entry data
    const fileRef = entry.file;
    const entrySnapshot = { ...entry };

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        intervalsRef.current.delete(idx);

        // Read the file - using the File reference directly, NOT from state
        const reader = new FileReader();
        reader.onload = () => {
          addResume({
            name: entrySnapshot.name,
            email: entrySnapshot.email,
            phone: entrySnapshot.phone,
            location: entrySnapshot.location,
            category: entrySnapshot.category,
            experience: entrySnapshot.experience,
            notes: entrySnapshot.notes,
            filename: fileRef.name,
            fileData: reader.result as string,
          });
          updateFile(idx, { progress: 100, done: true, uploading: false });
          toast.success(`${entrySnapshot.name} uploaded successfully!`);
        };
        reader.onerror = () => {
          updateFile(idx, { uploading: false, progress: 0 });
          toast.error(`Failed to read ${fileRef.name}`);
        };
        reader.readAsDataURL(fileRef);
      } else {
        updateFile(idx, { progress });
      }
    }, 200);

    intervalsRef.current.set(idx, interval);
  };

  const uploadAll = () => {
    files.forEach((f, i) => {
      if (!f.done && !f.uploading) {
        setTimeout(() => uploadFile(i), i * 100);
      }
    });
  };

  const pendingCount = files.filter(f => !f.done && !f.uploading).length;

  return (
    <>
      <PageHeader title="Upload Resume" subtitle="Add new resumes to the database" />
      <div className="p-7 flex-1">
        {/* Drop zone */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all relative ${
            dragging ? 'border-primary bg-accent-dim' : 'border-border hover:border-primary'
          }`}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.rtf"
            onChange={e => { if (e.target.files && e.target.files.length > 0) { handleFiles(e.target.files); e.target.value = ''; } }}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="w-12 h-12 bg-accent-dim rounded-xl flex items-center justify-center mx-auto mb-3.5">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div className="text-[15px] font-semibold text-foreground mb-1.5">
            Drop files here or click to browse
          </div>
          <div className="text-[13px] text-muted-foreground">
            PDF, DOC, DOCX, RTF — Max 10MB each
          </div>
        </motion.div>

        {/* File cards */}
        {files.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">
                {files.length} file{files.length > 1 ? 's' : ''} selected
                {files.filter(f => f.done).length > 0 && (
                  <span className="text-green ml-2">({files.filter(f => f.done).length} uploaded)</span>
                )}
              </span>
              {pendingCount > 0 && (
                <button onClick={uploadAll} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-[13.5px] font-medium hover:brightness-110 transition-all cursor-pointer">
                  <Upload className="w-4 h-4" /> Upload All ({pendingCount})
                </button>
              )}
            </div>

            {files.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-accent-dim rounded-lg flex items-center justify-center shrink-0">
                    {entry.done ? <Check className="w-[18px] h-[18px] text-green" /> : <FileText className="w-[18px] h-[18px] text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold truncate">{entry.file.name}</div>
                    <div className="text-xs text-muted-foreground">{(entry.file.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {entry.previewUrl && (
                      <button
                        onClick={() => setPreviewFile(previewFile === entry.previewUrl ? null : entry.previewUrl)}
                        className="p-1.5 rounded-md bg-hover border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
                        title="Preview PDF"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {!entry.done && !entry.uploading && (
                      <button onClick={() => removeFile(i)} className="p-1.5 rounded-md bg-hover border border-border text-muted-foreground hover:text-destructive hover:border-destructive hover:bg-red-dim transition-all cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {entry.uploading && (
                      <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    )}
                  </div>
                </div>

                {/* Live PDF Preview */}
                {previewFile === entry.previewUrl && entry.previewUrl && (
                  <div className="mb-3 rounded-lg overflow-hidden border border-border bg-background">
                    <iframe
                      src={entry.previewUrl}
                      className="w-full h-[400px] bg-white"
                      title={`Preview: ${entry.file.name}`}
                    />
                  </div>
                )}

                {!entry.done && !entry.uploading ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[12px] font-medium text-muted-foreground mb-1">Candidate Name *</label>
                        <input value={entry.name} onChange={e => updateFile(i, { name: e.target.value })} className="w-full py-2 px-3 bg-input border border-border rounded-md text-foreground text-sm outline-none focus:border-primary/50 transition-all" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-muted-foreground mb-1">Category *</label>
                        <select value={entry.category} onChange={e => updateFile(i, { category: e.target.value })} className="w-full py-2 px-3 bg-input border border-border rounded-md text-foreground text-sm outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer">
                          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-muted-foreground mb-1">Experience</label>
                        <select value={entry.experience} onChange={e => updateFile(i, { experience: e.target.value })} className="w-full py-2 px-3 bg-input border border-border rounded-md text-foreground text-sm outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer">
                          {['Fresher', 'Junior', 'Mid-Level', 'Senior'].map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-muted-foreground mb-1">Email</label>
                        <input value={entry.email} onChange={e => updateFile(i, { email: e.target.value })} placeholder="email@example.com" className="w-full py-2 px-3 bg-input border border-border rounded-md text-foreground text-sm outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-muted-foreground mb-1">Phone</label>
                        <input value={entry.phone} onChange={e => updateFile(i, { phone: e.target.value })} placeholder="Phone number" className="w-full py-2 px-3 bg-input border border-border rounded-md text-foreground text-sm outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-muted-foreground mb-1">Notes</label>
                        <input value={entry.notes} onChange={e => updateFile(i, { notes: e.target.value })} placeholder="Optional notes" className="w-full py-2 px-3 bg-input border border-border rounded-md text-foreground text-sm outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => uploadFile(i)} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground rounded-md text-[13px] font-medium hover:brightness-110 transition-all cursor-pointer">
                        <Upload className="w-3.5 h-3.5" /> Upload
                      </button>
                    </div>
                  </>
                ) : entry.uploading ? (
                  <div className="mt-1">
                    <div className="flex justify-between text-[12px] text-muted-foreground mb-1.5">
                      <span>Uploading...</span>
                      <span>{Math.round(entry.progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-hover rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300" style={{ width: entry.progress + '%' }} />
                    </div>
                  </div>
                ) : (
                  <div className="text-[13px] text-green flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Uploaded successfully
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
