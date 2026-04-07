import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  fetchResumes, fetchCategories, fetchSettings, fetchResumeById, updateResumeAiStatus,
  addResume as addResumeFn, deleteResume as deleteResumeFn, updateResume as updateResumeFn,
  addCategory as addCategoryFn, updateCategory as updateCategoryFn, deleteCategory as deleteCategoryFn,
  saveSettings as saveSettingsFn,
  type Resume, type Category, type Settings
} from "@/lib/store";

// ─── n8n Webhook URL ───────────────────────────────────────────────────────────
const N8N_WEBHOOK_URL = "https://gauravprajapati.app.n8n.cloud/webhook/9d4e6a0f-7e84-4cc7-85f4-17ecc19c1f82";

async function triggerN8nWebhook(resume: Resume) {
  try {
    await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeId: resume.id,
        candidateName: resume.name,
        email: resume.email,
        phone: resume.phone,
        category: resume.category,
        experience: resume.experience,
        fileData: resume.fileData ?? null,
        filename: resume.filename,
      }),
    });
    console.log("n8n webhook triggered successfully");
  } catch (err) {
    console.warn("n8n webhook call failed (non-blocking):", err);
  }
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
export function useResumes() {
  return useQuery({ queryKey: ['resumes'], queryFn: fetchResumes });
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
}

export function useSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: fetchSettings });
}

export function useAddResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (obj: Omit<Resume, 'id' | 'uploadDate' | 'uploadedBy' | 'aiScore' | 'aiSummary' | 'aiStatus'>) => {
      const savedResume = await addResumeFn(obj);
      // Set status to analyzing and trigger webhook
      updateResumeAiStatus(savedResume.id, 'analyzing').catch(() => {});
      triggerN8nWebhook(savedResume);
      return savedResume;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resumes'] }),
  });
}

// Auto-refresh: poll resumes with "analyzing" status every 10s
export function useAiPolling() {
  const qc = useQueryClient();
  const { data: resumes = [] } = useResumes();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const analyzingIds = resumes.filter(r => r.aiStatus === 'analyzing').map(r => r.id);

  useEffect(() => {
    if (analyzingIds.length === 0) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      return;
    }
    intervalRef.current = setInterval(async () => {
      let anyDone = false;
      for (const id of analyzingIds) {
        const r = await fetchResumeById(id);
        if (r && r.aiStatus === 'done') anyDone = true;
      }
      if (anyDone) qc.invalidateQueries({ queryKey: ['resumes'] });
    }, 8000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [analyzingIds.join(',')]);
}

export function useDeleteResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResumeFn(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resumes'] }),
  });
}

export function useUpdateResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Resume> }) => updateResumeFn(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resumes'] }),
  });
}

export function useAddCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => addCategoryFn(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ name: string; color: string; active: boolean }> }) => updateCategoryFn(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategoryFn(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (obj: Partial<Settings>) => saveSettingsFn(obj),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}
