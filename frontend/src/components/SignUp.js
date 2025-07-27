"use client"

import { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
import jwtDecode from "jwt-decode"

const SignUp = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("user")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!username || !password || !role) {
      setError("All fields are required")
      setIsLoading(false)
      return
    }

    try {
      console.log("Sending signup payload:", { username, password, role })
      const res = await axios.post("http://localhost:5000/api/auth/signup", {
        username,
        password,
        role,
      })
      localStorage.setItem("token", res.data.token)
      const decoded = jwtDecode(res.data.token)
      if (decoded.user.role === "admin") {
        navigate("/admin")
      } else {
        navigate("/login")
      }
    } catch (error) {
      setError(error.response?.data?.msg || "Sign up failed. Please try again.")
      console.error("Frontend signup error:", error.response?.data || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError("")
    setIsLoading(true)

    try {
      // Redirect to your backend Google OAuth endpoint for signup
      window.location.href = "http://localhost:5000/api/auth/google?signup=true"
    } catch (error) {
      console.error("Google signup error:", error)
      setError("Google signup failed. Please try again.")
      setIsLoading(false)
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
        {/* Enhanced signup box with shadows */}
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
            Create Account
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

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-4 bg-[#2B2C5B]/50 border border-[#423D80] rounded-lg text-white focus:ring-2 focus:ring-[#423D80] focus:border-[#423D80] transition-all duration-300 backdrop-blur-sm"
                required
                disabled={isLoading}
              >
                <option value="user" className="bg-[#2B2C5B] text-white">
                  User
                </option>
                <option value="admin" className="bg-[#2B2C5B] text-white">
                  Admin
                </option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-8 py-4 bg-gradient-to-r from-[#2B2C5B] to-[#423D80] text-white font-bold rounded-lg border border-[#423D80] hover:from-[#423D80] hover:to-[#5A4FCF] transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
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

          {/* Google SignUp Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
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
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-300 hover:underline"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUp;
