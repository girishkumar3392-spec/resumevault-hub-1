import { useState } from "react";
import { Save, Download } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { exportJSON } from "@/lib/store";
import { useSettings, useSaveSettings } from "@/hooks/use-data";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function SettingsPage() {
  const { data: settings } = useSettings();
  const saveSettingsMutation = useSaveSettings();
  const [companyName, setCompanyName] = useState(settings?.companyName || 'ResumeVault');
  const [tagline, setTagline] = useState(settings?.tagline || 'Smart Hiring Intelligence');
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);

  const handleSaveGeneral = () => {
    saveSettingsMutation.mutate({ companyName, tagline }, {
      onSuccess: () => toast.success('Settings saved'),
      onError: () => toast.error('Failed to save settings'),
    });
  };

  const handleChangePassword = async () => {
    if (!newPwd || !confirmPwd) { toast.error('Fill all password fields'); return; }
    if (newPwd !== confirmPwd) { toast.error('Passwords do not match'); return; }
    if (newPwd.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    setChangingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully');
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    }
    setChangingPwd(false);
  };

  const handleExportJSON = async () => {
    await exportJSON();
    toast.success('JSON backup exported');
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your preferences" />
      <div className="p-4 md:p-7 flex-1 max-w-2xl">
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

        <div className="bg-card border border-border rounded-lg p-6 mb-5">
          <h3 className="text-[15px] font-display font-bold text-foreground mb-1.5">Change Password</h3>
          <p className="text-[13px] text-muted-foreground mb-5 pb-4 border-b border-border">Update your account password</p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">New Password</label>
                <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} className="w-full py-2 px-3 bg-input border border-border rounded-md text-foreground text-sm outline-none focus:border-primary/50 transition-all" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">Confirm Password</label>
                <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className="w-full py-2 px-3 bg-input border border-border rounded-md text-foreground text-sm outline-none focus:border-primary/50 transition-all" />
              </div>
            </div>
            <button onClick={handleChangePassword} disabled={changingPwd} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-[13.5px] font-medium hover:brightness-110 transition-all cursor-pointer disabled:opacity-70">
              {changingPwd ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-[15px] font-display font-bold text-foreground mb-1.5">Data Management</h3>
          <p className="text-[13px] text-muted-foreground mb-5 pb-4 border-b border-border">Export or backup your data</p>
          <button onClick={handleExportJSON} className="inline-flex items-center gap-1.5 px-4 py-2 bg-card border border-border rounded-md text-[13.5px] font-medium text-foreground hover:border-primary/30 transition-all cursor-pointer">
            <Download className="w-4 h-4" /> Export JSON Backup
          </button>
        </div>
      </div>
    </>
  );
}
