import React, { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../context/userSlice";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  
  const user = useSelector((state) => state.user);

  const handleLogout = async () => {
    try {
      const res = await API.post("/user/logout");
      dispatch(logout());
      navigate("/");
      toast.success(res.data.message || "Logout successfull");
    } catch (error) {
      console.log(error.response?.data?.message);
      navigate("/");
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md transition hover:shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Dashboard</h1>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-lg font-semibold text-gray-800">{user.userInfo?.name || "User not found"}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-semibold text-gray-800">{user.userInfo?.email || "User not found"}</p>
          </div>
        </div>

        <button
          className="px-5 py-2 rounded-lg bg-red-500 text-white font-semibold cursor-pointer
hover:bg-red-600 active:bg-red-700 
focus:outline-none focus:ring-2 focus:ring-red-300 
transition-all duration-200 shadow-md hover:shadow-lg"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
