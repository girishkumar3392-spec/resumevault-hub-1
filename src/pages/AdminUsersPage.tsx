import { useState } from "react";
import { Users, Shield, User, Plus, Trash2, X } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();
  const { data: profiles = [], isLoading } = useQuery({ queryKey: ['admin-profiles'], queryFn: fetchProfiles });
  const [showCreate, setShowCreate] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const admins = profiles.filter(p => p.role === 'admin');
  const users = profiles.filter(p => p.role !== 'admin');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill all fields");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setCreating(true);
    try {
      // Create user via Supabase Auth (sign up)
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: { display_name: fullName.trim() }
        }
      });
      if (error) throw error;
      toast.success(`User "${fullName}" created successfully!`);
      setShowCreate(false);
      setFullName(""); setEmail(""); setPassword("");
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['admin-profiles'] }), 1500);
    } catch (err: any) {
      toast.error(err.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('user_id', userId);
      if (error) throw error;
      toast.success(`User "${name}" deleted`);
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    }
  };

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

        {/* Create User Button */}
        <div className="flex justify-end mb-4">
          <button onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-[13px] font-medium hover:brightness-110 transition-all cursor-pointer">
            <Plus className="w-4 h-4" /> Create User
          </button>
        </div>

        {/* Create User Modal */}
        <AnimatePresence>
          {showCreate && (
            <>
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]" onClick={() => setShowCreate(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 flex items-center justify-center z-[201] p-4">
                <div className="bg-secondary border border-border rounded-xl p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-display font-bold text-foreground">Create New User</h3>
                    <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-md bg-hover border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateUser}>
                    <div className="mb-4">
                      <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">Full Name</label>
                      <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                        placeholder="Enter full name"
                        className="w-full py-2.5 px-3 bg-input border border-border rounded-md text-foreground text-sm outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground" />
                    </div>
                    <div className="mb-4">
                      <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">Email</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full py-2.5 px-3 bg-input border border-border rounded-md text-foreground text-sm outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground" />
                    </div>
                    <div className="mb-5">
                      <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">Password</label>
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="w-full py-2.5 px-3 bg-input border border-border rounded-md text-foreground text-sm outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground" />
                    </div>
                    <button type="submit" disabled={creating}
                      className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-[14px] font-medium hover:brightness-110 transition-all disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer">
                      {creating && <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />}
                      {creating ? 'Creating...' : 'Create User'}
                    </button>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

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
                    <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary text-left">Action</th>
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
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${p.role === 'admin' ? 'bg-primary/15 text-primary' : 'bg-accent-dim text-muted-foreground'}`}>
                          {p.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {p.role || 'user'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[13px] text-muted-foreground">{formatDate(p.created_at)}</td>
                      <td className="py-3 px-4">
                        {p.role !== 'admin' && (
                          <button onClick={() => handleDeleteUser(p.user_id, p.display_name || 'User')}
                            className="p-1.5 rounded-md bg-hover border border-border text-muted-foreground hover:text-destructive hover:border-destructive hover:bg-red-dim transition-all cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
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
            New users are automatically assigned "user" role. Admin role can only be assigned from the database.
          </p>
        </div>
      </div>
    </>
  );
}
