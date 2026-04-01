import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { isLoggedIn, initDefaults } from "@/lib/store";

export default function AppLayout() {
  initDefaults();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isLoggedIn()) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="md:ml-60 flex-1 min-h-screen flex flex-col w-full">
        <Outlet context={{ onMenuToggle: () => setSidebarOpen(true) }} />
      </main>
    </div>
  );
}
