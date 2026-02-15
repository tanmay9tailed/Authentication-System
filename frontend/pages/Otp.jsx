import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import API from "../services/api"; // FIXED import

export default function Otp() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);

      const res = await API.post("/auth/verify-otp", {
        userId: decoded.id,
        otp: data.otp,
      });

      if (res.data.message === "Account verified successfully") {
        toast.success(res.data.message || "OTP Verified");
        navigate("/dashboard");
      } else {
        toast.error(res.data.message || "Invalid");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendLoading(true);

      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);

      const res = await API.post("/auth/resend-otp", {
        userId: decoded.id,
      });

      toast.success(res.data.message || "OTP resent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-2">
          OTP Verification
        </h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Enter the 6-digit code sent to your email
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              type="number"
              {...register("otp", {
                required: "OTP is required",
                minLength: { value: 6, message: "Enter 6 digits" },
                maxLength: { value: 6, message: "Enter 6 digits" },
              })}
              placeholder="Enter OTP"
              className="w-full px-4 py-2 border rounded-lg text-center tracking-widest text-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            {errors.otp && (
              <p className="text-red-500 text-sm">
                {errors.otp.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white transition flex items-center justify-center gap-2
              ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              }`}
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={resendLoading}
          className="w-full mt-4 text-blue-500 text-sm hover:underline cursor-pointer"
        >
          {resendLoading ? "Sending..." : "Resend OTP"}
        </button>
      </div>
    </div>
  );
}
