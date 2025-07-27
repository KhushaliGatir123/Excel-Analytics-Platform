"use client"

import { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
import jwtDecode from "jwt-decode"

const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotMessage, setForgotMessage] = useState("")
  const [showForgotModal, setShowForgotModal] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!username || !password) {
      setError("All fields are required")
      setIsLoading(false)
      return
    }

    try {
      console.log("Sending login payload:", { username, password })
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      })
      localStorage.setItem("token", res.data.token)
      const decoded = jwtDecode(res.data.token)
      if (decoded.user.role === "admin") {
        navigate("/admin")
      } else {
        navigate("/dashboard")
      }
    } catch (error) {
      console.error("Login error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      })
      setError(error.response?.data?.msg || "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError("")
    setIsLoading(true)

    try {
      // Redirect to your backend Google OAuth endpoint
      window.location.href = "http://localhost:5000/api/auth/google"
    } catch (error) {
      console.error("Google login error:", error)
      setError("Google login failed. Please try again.")
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setForgotMessage("")

    if (!forgotEmail) {
      setForgotMessage("Please enter your email address")
      return
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email: forgotEmail,
      })
      setForgotMessage("Password reset email sent! Check your inbox.")
      setTimeout(() => {
        setShowForgotModal(false)
        setForgotEmail("")
        setForgotMessage("")
      }, 2000)
    } catch (error) {
      console.error("Forgot password error:", error)
      setForgotMessage(error.response?.data?.msg || "Failed to send reset email. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F0F2A] via-[#191B45] to-[#2B2C5B] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-black/70" />

      {/* Background glow effect */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background: "radial-gradient(circle at center, rgba(66,61,128,0.2) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Enhanced login box with shadows */}
        <div
          className="bg-[#0F0F2A]/90 backdrop-blur-lg rounded-xl p-8 border border-[#423D80]/50 transition-all duration-500 hover:scale-[1.02]"
          style={{
            boxShadow: `
              0 0 0 1px rgba(66, 61, 128, 0.3),
              0 4px 8px rgba(0, 0, 0, 0.3),
              0 8px 16px rgba(43, 44, 91, 0.4),
              0 16px 32px rgba(43, 44, 91, 0.3),
              0 32px 64px rgba(15, 15, 42, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              0 0 80px rgba(66, 61, 128, 0.15)
            `,
          }}
        >
          <h2
            className="text-3xl font-extrabold text-white mb-8 text-center tracking-wide"
            style={{ textShadow: "0 4px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(66, 61, 128, 0.3)" }}
          >
            Welcome Back
          </h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-6 backdrop-blur-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 bg-[#2B2C5B]/50 border border-[#423D80] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#423D80] focus:border-[#423D80] transition-all duration-300 backdrop-blur-sm"
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-[#2B2C5B]/50 border border-[#423D80] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#423D80] focus:border-[#423D80] transition-all duration-300 backdrop-blur-sm"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-sm text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-300 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-8 py-4 bg-gradient-to-r from-[#2B2C5B] to-[#423D80] text-white font-bold rounded-lg border border-[#423D80] hover:from-[#423D80] hover:to-[#5A4FCF] transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "Signing In..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#423D80]/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0F0F2A]/90 text-gray-400 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg border border-[#423D80]/50 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none backdrop-blur-sm flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-300 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0F0F2A]/95 backdrop-blur-lg border border-[#423D80]/50 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Reset Password</h3>
              <button
                onClick={() => {
                  setShowForgotModal(false)
                  setForgotEmail("")
                  setForgotMessage("")
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-300 mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full p-3 bg-[#2B2C5B]/50 border border-[#423D80] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#423D80] focus:border-[#423D80] transition-all duration-300"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {forgotMessage && (
                <div
                  className={`p-3 rounded-lg backdrop-blur-sm ${
                    forgotMessage.includes("sent")
                      ? "bg-green-500/20 border border-green-500/50 text-green-300"
                      : "bg-red-500/20 border border-red-500/50 text-red-300"
                  }`}
                >
                  {forgotMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#2B2C5B] to-[#423D80] hover:from-[#423D80] hover:to-[#5A4FCF] text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Send Reset Email
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login;
