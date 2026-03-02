import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { User } from "./types";
import AuthPage from "./pages/AuthPage";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminProducts from "./pages/AdminProducts";
import AdminWithdrawals from "./pages/AdminWithdrawals";
import AdminLeads from "./pages/AdminLeads";
import AdminSales from "./pages/AdminSales";
import AdminSettings from "./pages/AdminSettings";
import AffiliateLayout from "./layouts/AffiliateLayout";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import AffiliateProducts from "./pages/AffiliateProducts";
import AffiliateWithdrawals from "./pages/AffiliateWithdrawals";
import AffiliateLeads from "./pages/AffiliateLeads";
import PublicLeadCapture from "./pages/PublicLeadCapture";

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/l/:code" element={<PublicLeadCapture />} />
        <Route path="/login" element={<AuthPage onLogin={handleLogin} />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/*" 
          element={
            user?.role === 'admin' ? (
              <AdminLayout user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/users" element={<AdminUsers />} />
                  <Route path="/products" element={<AdminProducts />} />
                  <Route path="/withdrawals" element={<AdminWithdrawals />} />
                  <Route path="/leads" element={<AdminLeads />} />
                  <Route path="/sales" element={<AdminSales />} />
                  <Route path="/settings" element={<AdminSettings user={user} />} />
                </Routes>
              </AdminLayout>
            ) : <Navigate to="/login" />
          } 
        />

        {/* Affiliate Routes */}
        <Route 
          path="/affiliate/*" 
          element={
            user?.role === 'affiliate' ? (
              <AffiliateLayout user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<AffiliateDashboard user={user} />} />
                  <Route path="/products" element={<AffiliateProducts user={user} />} />
                  <Route path="/withdrawals" element={<AffiliateWithdrawals user={user} />} />
                  <Route path="/leads" element={<AffiliateLeads user={user} />} />
                </Routes>
              </AffiliateLayout>
            ) : <Navigate to="/login" />
          } 
        />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? "/admin" : "/affiliate") : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}
