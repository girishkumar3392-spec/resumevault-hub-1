import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchResumes, fetchCategories, fetchSettings,
  addResume as addResumeFn, deleteResume as deleteResumeFn, updateResume as updateResumeFn,
  addCategory as addCategoryFn, updateCategory as updateCategoryFn, deleteCategory as deleteCategoryFn,
  saveSettings as saveSettingsFn,
  type Resume, type Category, type Settings
} from "@/lib/store";

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
    mutationFn: (obj: Omit<Resume, 'id' | 'uploadDate' | 'uploadedBy'>) => addResumeFn(obj),
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
