import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ResetPassword from "./pages/ResetPassword";
import { ToastContainer } from "react-toastify";
import DemoDashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import withAuth from "./hoc/WithAuth";
import Login from "./pages/Login";
import React from "react";

const Router: React.FC = () => {
  const AuthDemoDashboard = withAuth(DemoDashboard); // Wrapping the component with HOC

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer />

        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/demodashboard" element={<AuthDemoDashboard />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Router;
