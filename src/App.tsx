import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { lazy, Suspense } from "react";

// User pages (always loaded)
import UserLoginPage from "./pages/UserLoginPage";
import UserLayout from "./components/UserLayout";
import UserDashboardPage from "./pages/UserDashboardPage";
import UploadPage from "./pages/UploadPage";
import UserBrowsePage from "./pages/UserBrowsePage";
import NotFound from "./pages/NotFound";

// Admin pages (lazy loaded - code split)
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const BrowsePage = lazy(() => import("./pages/BrowsePage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AdminUsersPage = lazy(() => import("./pages/AdminUsersPage"));

const queryClient = new QueryClient();

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<UserLoginPage />} />
              <Route path="/admin-login" element={<AdminLoginPage />} />

              {/* User routes */}
              <Route element={<UserLayout />}>
                <Route path="/dashboard" element={<UserDashboardPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/browse" element={<UserBrowsePage />} />
              </Route>

              {/* Admin routes (lazy loaded) */}
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<DashboardPage />} />
                <Route path="/admin/upload" element={<UploadPage />} />
                <Route path="/admin/browse" element={<BrowsePage />} />
                <Route path="/admin/categories" element={<CategoriesPage />} />
                <Route path="/admin/analytics" element={<AnalyticsPage />} />
                <Route path="/admin/settings" element={<SettingsPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
