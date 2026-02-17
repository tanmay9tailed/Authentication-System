import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Otp from "../pages/Otp";
import Dashboard from "../pages/Dashboard";
import { useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { login, logout } from "../context/userSlice";
import PublicRoute from "../components/PublicRoute";
import ProtectedRoute from "../components/ProtectedRoutes";

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const logged = await API.get("/auth");
        if (logged.data.loggedIn) {
          const res = await API.get("/user");

          dispatch(login({ name: res.data.name, email: res.data.email }));

          toast.success(res.data.message || "Got user...");
        } else {
          dispatch(logout());
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Unauthorized");
      }
    };

    checkAuth();
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
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

      <Route
        path="/otp"
        element={
          <PublicRoute>
            <Otp />
          </PublicRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
