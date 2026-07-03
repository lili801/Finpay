import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';

// Pages
import Landing from './pages/Landing.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import VerifyEmail from './pages/auth/VerifyEmail.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';

// Dashboard sub-routes
import DashboardHome from './pages/dashboard/DashboardHome.jsx';
import WalletPlaceholder from './pages/dashboard/WalletPlaceholder.jsx';
import TransactionsPlaceholder from './pages/dashboard/TransactionsPlaceholder.jsx';
import NotificationsPlaceholder from './pages/dashboard/NotificationsPlaceholder.jsx';
import AdminPlaceholder from './pages/dashboard/AdminPlaceholder.jsx';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Guest Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Landing />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/verify-email"
            element={
              <PublicRoute>
                <VerifyEmail />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="wallet" element={<WalletPlaceholder />} />
            <Route path="transactions" element={<TransactionsPlaceholder />} />
            <Route path="notifications" element={<NotificationsPlaceholder />} />
            <Route path="admin" element={<AdminPlaceholder />} />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" reverseOrder={false} />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
