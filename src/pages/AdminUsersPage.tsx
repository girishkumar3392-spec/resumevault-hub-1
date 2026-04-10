import { useState } from "react";
import { Users, Shield, User } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/store";
import { motion } from "framer-motion";

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  role: string | null;
  created_at: string;
  avatar_url: string | null;
}

async function fetchProfiles(): Promise<UserProfile[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) { console.error('fetchProfiles:', error); return []; }
  return data || [];
}

export default function AdminUsersPage() {
  const { data: profiles = [], isLoading } = useQuery({ queryKey: ['admin-profiles'], queryFn: fetchProfiles });

  const admins = profiles.filter(p => p.role === 'admin');
  const users = profiles.filter(p => p.role !== 'admin');

  return (
    <>
      <PageHeader title="User Management" subtitle={`${profiles.length} registered users`} />
      <div className="p-4 md:p-7 flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Users', value: profiles.length, icon: Users },
            { label: 'Admins', value: admins.length, icon: Shield },
            { label: 'Users', value: users.length, icon: User },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-md py-3.5 px-4 text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-accent-dim flex items-center justify-center">
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-display font-extrabold text-foreground">{s.value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary text-left">User</th>
                    <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary text-left">Role</th>
                    <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary text-left">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map(p => (
                    <tr key={p.id} className="border-b border-border hover:bg-hover transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-primary-foreground shrink-0 ${p.role === 'admin' ? 'bg-gradient-to-br from-primary to-accent' : 'bg-gradient-to-br from-teal to-primary'}`}>
                            {(p.display_name?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <div className="text-[13.5px] font-semibold text-foreground">{p.display_name || 'Unnamed'}</div>
                            <div className="text-[11px] text-muted-foreground">{p.user_id?.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                          p.role === 'admin' ? 'bg-primary/15 text-primary' : 'bg-accent-dim text-muted-foreground'
                        }`}>
                          {p.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {p.role || 'user'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[13px] text-muted-foreground">{formatDate(p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-4 bg-card border border-border rounded-lg p-4">
          <p className="text-[12px] text-muted-foreground">
            <Shield className="w-3.5 h-3.5 inline mr-1" />
            To change a user's role, update their role directly in the backend database. New users are automatically assigned the "user" role.
          </p>
        </div>
      </div>
    </>
  );
}
