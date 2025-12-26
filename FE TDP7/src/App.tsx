import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Pages
import LandingPage from "./pages/auth/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import PendingPage from "./pages/auth/PendingPage";
import NotFound from "./pages/NotFound";

// User Pages
import { UserLayout } from "./components/layout/UserLayout";
import UserDashboard from "./pages/user/Dashboard";
import HouseholdPage from "./pages/user/HouseholdPage";
import FormsPage from "./pages/user/FormsPage";
import BookingPage from "./pages/user/BookingPage";
import FeedbackPage from "./pages/user/FeedbackPage";
import AccountPage from "./pages/user/AccountPage";
import NewsPage from "./pages/user/NewsPage"; // <--- IMPORT TRANG MỚI

// Admin Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import HouseholdsPage from "./pages/admin/HouseholdsPage";
import ResidentsPage from "./pages/admin/ResidentsPage";
import ApprovalsPage from "./pages/admin/ApprovalsPage";
import AssetsPage from "./pages/admin/AssetsPage";
import BookingsPage from "./pages/admin/BookingsPage";
import ReportsPage from "./pages/admin/ReportsPage";
import FeedbackPageManagement from "./pages/admin/FeedbackPageManagement";
import AdminNewsPage from "./pages/admin/AdminNewsPage";

const queryClient = new QueryClient();

// --- Guards ---
const RootRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'user') return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
};

const UserRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.status === 'pending') return <Navigate to="/pending" replace />;
  if (user.role !== 'user') return <Navigate to="/admin" replace />;
  return <UserLayout />;
};

const AdminRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            {/* Root */}
            <Route path="/" element={<RootRoute />} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/pending" element={<PendingPage />} />

            {/* User Dashboard */}
            <Route path="/dashboard" element={<UserRoute />}>
              <Route index element={<UserDashboard />} />
              <Route path="news" element={<NewsPage />} /> {/* <--- ROUTE MỚI */}
              <Route path="household" element={<HouseholdPage />} />
              <Route path="forms" element={<FormsPage />} />
              <Route path="booking" element={<BookingPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="account" element={<AccountPage />} />
            </Route>

            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                 <Route index element={<AdminDashboard />} />
                <Route path="households" element={<HouseholdsPage />} />
                <Route path="residents" element={<ResidentsPage />} />
                <Route path="news" element={<AdminNewsPage />} />
                <Route path="approvals" element={<ApprovalsPage />} />
                <Route path="feedback" element={<FeedbackPageManagement />} />
                <Route path="assets" element={<AssetsPage />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="reports" element={<ReportsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;