import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchResumes, fetchCategories, fetchSettings,
  addResume as addResumeFn, deleteResume as deleteResumeFn, updateResume as updateResumeFn,
  addCategory as addCategoryFn, updateCategory as updateCategoryFn, deleteCategory as deleteCategoryFn,
  saveSettings as saveSettingsFn,
  type Resume, type Category, type Settings
} from "@/lib/store";

// ─── n8n Webhook URL ───────────────────────────────────────────────────────────
const N8N_WEBHOOK_URL = "https://gauravprajapati.app.n8n.cloud/webhook/9d4e6a0f-7e84-4cc7-85f4-17ecc19c1f82";

// ─── Helper: Resume upload hone pe n8n ko notify karo ─────────────────────────
async function triggerN8nWebhook(resume: Resume, fileData?: string) {
  try {
    await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateName: resume.name,
        email: resume.email,
        phone: resume.phone,
        category: resume.category,
        experience: resume.experience,
        filename: resume.filename,
        fileData: fileData ?? null,   // base64 PDF agar available ho
        resumeId: resume.id,
        uploadDate: resume.uploadDate,
      }),
    });
    console.log("n8n webhook triggered successfully");
  } catch (err) {
    // Webhook fail hone pe bhi main upload block nahi hoga
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
    mutationFn: async (obj: Omit<Resume, 'id' | 'uploadDate' | 'uploadedBy'>) => {
      // Step 1: Supabase mein save karo
      const savedResume = await addResumeFn(obj);

      // Step 2: Background mein n8n ko trigger karo (non-blocking)
      triggerN8nWebhook(savedResume, obj.fileData ?? undefined);

      return savedResume;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resumes'] }),
  });
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
