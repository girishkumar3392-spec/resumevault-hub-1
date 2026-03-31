import { Outlet, Navigate } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { isLoggedIn, initDefaults } from "@/lib/store";

export default function AppLayout() {
  initDefaults();
  if (!isLoggedIn()) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="ml-60 flex-1 min-h-screen flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
