import { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
import jwtDecode from "jwt-decode"

const SignUp = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("user")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!username || !password || !role) {
      setError("All fields are required")
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
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-4 bg-[#2B2C5B]/50 border border-[#423D80] rounded-lg text-white focus:ring-2 focus:ring-[#423D80] focus:border-[#423D80] transition-all duration-300 backdrop-blur-sm"
                required
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
              className="w-full px-8 py-4 bg-gradient-to-r from-[#2B2C5B] to-[#423D80] text-white font-bold rounded-lg border border-[#423D80] hover:from-[#423D80] hover:to-[#5A4FCF] transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
            >
              Create Account
            </button>
          </form>

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

export default SignUp
