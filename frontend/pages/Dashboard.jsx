import React, { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState({ name: "User not found", email: "email not found" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/user");

        toast.success(res.data.message || "Got user...");
        setUser(res.data);
      } catch (err) {
        navigate("/")
        console.error(err.response?.data?.message);
        toast.error(err.response?.data?.message || "Not logged in");
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md transition hover:shadow-2xl">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Dashboard</h1>

        {/* User Info Card */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-lg font-semibold text-gray-800">{user.name}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-semibold text-gray-800">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
