import { useState } from "react";
import { Save, Trash2, Download } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { getSettings, saveSettings, exportJSON } from "@/lib/store";
import { toast } from "sonner";

export default function SettingsPage() {
  const settings = getSettings();
  const [companyName, setCompanyName] = useState(settings.companyName || 'ResumeVault');
  const [tagline, setTagline] = useState(settings.tagline || 'Smart Hiring Intelligence');
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const handleSaveGeneral = () => {
    saveSettings({ companyName, tagline });
    toast.success('Settings saved');
  };

  const handleChangePassword = () => {
    if (!currentPwd || !newPwd || !confirmPwd) { toast.error('Fill all password fields'); return; }
    const stored = localStorage.getItem('rv_admin_pwd') || btoa('Admin@123');
    if (btoa(currentPwd) !== stored) { toast.error('Current password is incorrect'); return; }
    if (newPwd !== confirmPwd) { toast.error('Passwords do not match'); return; }
    if (newPwd.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    localStorage.setItem('rv_admin_pwd', btoa(newPwd));
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    toast.success('Password updated');
  };

  const handleReset = () => {
    if (confirm('This will delete ALL data and reset to defaults. Are you sure?')) {
      ['rv_resumes', 'rv_categories', 'rv_settings', 'rv_admin_pwd', 'rv_admin_user', 'rv_session'].forEach(k => localStorage.removeItem(k));
      toast.success('All data reset. Reloading...');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your preferences" />
      <div className="p-4 md:p-7 flex-1 max-w-2xl">
        {/* General */}
        <div className="bg-card border border-border rounded-lg p-6 mb-5">
          <h3 className="text-[15px] font-display font-bold text-foreground mb-1.5">General Settings</h3>
          <p className="text-[13px] text-muted-foreground mb-5 pb-4 border-b border-border">Customize your workspace</p>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">Company Name</label>
              <input value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full py-2 px-3 bg-input border border-border rounded-md text-foreground text-sm outline-none focus:border-primary/50 transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">Tagline</label>
              <input value={tagline} onChange={e => setTagline(e.target.value)} className="w-full py-2 px-3 bg-input border border-border rounded-md text-foreground text-sm outline-none focus:border-primary/50 transition-all" />
            </div>
            <button onClick={handleSaveGeneral} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-[13.5px] font-medium hover:brightness-110 transition-all cursor-pointer">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="bg-card border border-border rounded-lg p-6 mb-5">
          <h3 className="text-[15px] font-display font-bold text-foreground mb-1.5">Change Password</h3>
          <p className="text-[13px] text-muted-foreground mb-5 pb-4 border-b border-border">Update your admin password</p>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">Current Password</label>
              <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} className="w-full py-2 px-3 bg-input border border-border rounded-md text-foreground text-sm outline-none focus:border-primary/50 transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">New Password</label>
                <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} className="w-full py-2 px-3 bg-input border border-border rounded-md text-foreground text-sm outline-none focus:border-primary/50 transition-all" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">Confirm Password</label>
                <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className="w-full py-2 px-3 bg-input border border-border rounded-md text-foreground text-sm outline-none focus:border-primary/50 transition-all" />
              </div>
            </div>
            <button onClick={handleChangePassword} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-[13.5px] font-medium hover:brightness-110 transition-all cursor-pointer">
              Update Password
            </button>
          </div>
        </div>

        {/* Data */}
        <div className="bg-card border border-border rounded-lg p-6 mb-5">
          <h3 className="text-[15px] font-display font-bold text-foreground mb-1.5">Data Management</h3>
          <p className="text-[13px] text-muted-foreground mb-5 pb-4 border-b border-border">Export or backup your data</p>
          <button onClick={exportJSON} className="inline-flex items-center gap-1.5 px-4 py-2 bg-card border border-border rounded-md text-[13.5px] font-medium text-foreground hover:border-primary/30 transition-all cursor-pointer">
            <Download className="w-4 h-4" /> Export JSON Backup
          </button>
        </div>

        {/* Danger */}
        <div className="bg-destructive/[0.03] border border-destructive/20 rounded-lg p-6">
          <h3 className="text-[15px] font-display font-bold text-destructive mb-1.5">Danger Zone</h3>
          <p className="text-[13px] text-muted-foreground mb-5 pb-4 border-b border-border">Irreversible actions</p>
          <button onClick={handleReset} className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-dim text-destructive border border-destructive/20 rounded-md text-[13.5px] font-medium hover:bg-destructive/20 transition-all cursor-pointer">
            <Trash2 className="w-4 h-4" /> Reset All Data
          </button>
        </div>
      </div>
    </>
  );
}
