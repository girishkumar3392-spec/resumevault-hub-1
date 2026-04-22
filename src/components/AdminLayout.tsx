import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

export default function AdminLayout() {
  const { user, role, loading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="md:ml-60 flex-1 min-h-screen flex flex-col w-full">
        {/* Admin Header with Logout */}
        <div className="flex items-center justify-end px-4 py-2 border-b border-border bg-card shrink-0">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-muted-foreground hover:text-destructive hover:bg-red-dim border border-border hover:border-destructive/30 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
        <Outlet context={{ onMenuToggle: () => setSidebarOpen(true) }} />
      </main>
    </div>
  );
}
