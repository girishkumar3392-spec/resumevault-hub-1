import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import UserSidebar from "./UserSidebar";
import { useAuth } from "@/contexts/AuthContext";

export default function UserLayout() {
  const { user, role, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // If admin logs in via /login, redirect to admin dashboard
  if (role === "admin") return <Navigate to="/admin/dashboard" replace />;

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <UserSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="md:ml-60 flex-1 min-h-screen flex flex-col w-full">
        <Outlet context={{ onMenuToggle: () => setSidebarOpen(true) }} />
      </main>
    </div>
  );
}
