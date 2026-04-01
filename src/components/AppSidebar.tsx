import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Upload, FolderSearch, Tags, BarChart3, Settings, LogOut, X } from "lucide-react";
import { logout, getSettings } from "@/lib/store";
import { useNavigate } from "react-router-dom";

const navItems = [
  { label: 'Main', items: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Upload, label: 'Upload Resume', path: '/upload' },
    { icon: FolderSearch, label: 'Browse Resumes', path: '/browse' },
  ]},
  { label: 'Manage', items: [
    { icon: Tags, label: 'Categories', path: '/categories' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ]},
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AppSidebar({ open, onClose }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const settings = getSettings();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNav = () => {
    onClose();
  };

  return (
    <aside className={`w-60 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      {/* Header */}
      <div className="p-5 border-b border-sidebar-border flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-[10px] flex items-center justify-center font-display font-extrabold text-sm text-primary-foreground shrink-0">
          RV
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-display font-bold text-foreground leading-tight truncate">{settings.companyName || 'ResumeVault'}</div>
          <div className="text-[10px] text-muted-foreground">Smart Hiring Intelligence</div>
        </div>
        <button onClick={onClose} className="md:hidden w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-hover flex items-center justify-center cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2.5 overflow-y-auto">
        {navItems.map(section => (
          <div key={section.label}>
            <div className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase px-2.5 pt-3 pb-1.5">
              {section.label}
            </div>
            {section.items.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNav}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13.5px] font-medium transition-all no-underline ${
                    active
                      ? 'bg-accent-dim text-primary border-l-[3px] border-primary -ml-2.5 pl-[17px]'
                      : 'text-muted-foreground hover:bg-hover hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3.5 border-t border-sidebar-border">
        <div className="flex items-center gap-2.5 p-2 rounded-md">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center font-bold text-xs text-primary-foreground shrink-0">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-foreground truncate">Administrator</div>
            <div className="text-[11px] text-muted-foreground">HR Manager</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-2 py-2 px-3 rounded-md bg-red-dim text-destructive border border-destructive/20 text-[13px] font-medium flex items-center justify-center gap-1.5 hover:bg-destructive/20 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
