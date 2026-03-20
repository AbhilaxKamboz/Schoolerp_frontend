// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import API from "../api/api";
// import { useAuth } from "../context/AuthContext";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await API.post("/login", { email, password });
//       login(res.data);

//       const role = res.data.user.role;
//       navigate(`/${role}`);
//     } catch (err) {
//       alert(err.response?.data?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
//       <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
//         <h2 className="text-2xl font-bold text-center mb-6">
//           {/* School ERP Login */}
//           login
//         </h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="email"
//             placeholder="Email"
//             className="w-full border p-2 rounded focus:outline-none focus:ring"
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             className="w-full border p-2 rounded focus:outline-none focus:ring"
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import { 
  FaUser, FaLock, FaEye, FaEyeSlash, 
  FaGraduationCap, FaSchool
} from "react-icons/fa";
import Swal from "sweetalert2";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const res = await API.post("/login", { email, password });
      
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      login(res.data);
      const role = res.data.user.role;
      navigate(`/${role}`);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-200 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Simple Branding */}
          <div className="hidden lg:block space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <FaSchool className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">SchoolERP</h1>
                <p className="text-sm text-gray-500">Education Management System</p>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-light text-gray-700">
                Welcome back
              </h2>
              <p className="text-gray-500 max-w-md">
                Access your dashboard to manage academics, track progress, and stay connected.
              </p>
            </div>

            <div className="flex gap-6 pt-4">
              <div>
                <p className="text-xl font-semibold text-gray-800">500+</p>
                <p className="text-xs text-gray-500">Schools</p>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div>
                <p className="text-xl font-semibold text-gray-800">50k+</p>
                <p className="text-xs text-gray-500">Students</p>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div>
                <p className="text-xl font-semibold text-gray-800">98%</p>
                <p className="text-xs text-gray-500">Satisfaction</p>
              </div>
            </div>
          </div>

          {/* Right Side - Clean Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Form Header */}
              <div className="bg-blue-600 px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <FaGraduationCap className="text-xl text-white" />
                  </div>
                  <h2 className="text-lg font-medium text-white">Account Login</h2>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400 text-sm" />
                    </div>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400 text-sm" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="text-gray-400 hover:text-gray-600 text-sm" />
                      ) : (
                        <FaEye className="text-gray-400 hover:text-gray-600 text-sm" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => Swal.fire({
                      title: "Reset Password",
                      text: "Please contact your school administrator.",
                      icon: "info",
                      confirmButtonColor: "#3b82f6",
                      confirmButtonText: "OK"
                    })}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Signing in...</span>
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 pt-2">
                  © 2026 SchoolERP. All rights reserved.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}