import { useNavigate } from "react-router-dom"

const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F0F2A] via-[#191B45] to-[#2B2C5B] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-black/70" />

      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-[#0F0F2A]/95 backdrop-blur-lg shadow-xl relative z-20">
        <h1 className="text-3xl font-extrabold text-gray-400 tracking-tight">Excel Analytics</h1>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 bg-[#2B2C5B] text-white font-bold rounded-md border border-[#423D80] hover:bg-[#423D80] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center relative">
          {/* Enhanced glow effect background */}
          <div
            className="absolute inset-0 rounded-xl animate-pulse-glow"
            style={{
              background: "linear-gradient(135deg, rgba(43,44,91,0.3), rgba(66,61,128,0.4), rgba(43,44,91,0.3))",
              filter: "blur(20px)",
              transform: "scale(1.1)",
            }}
          />

          {/* Main hero box with enhanced shadows */}
          <div
            className="relative bg-[#0F0F2A]/80 p-8 rounded-xl backdrop-blur-lg border border-[#423D80]/50 animate-pulse-slow transition-all duration-500 hover:scale-[1.02]"
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
            onMouseEnter={(e) => {
              e.target.style.boxShadow = `
                0 0 0 1px rgba(66, 61, 128, 0.5),
                0 8px 16px rgba(0, 0, 0, 0.4),
                0 16px 32px rgba(43, 44, 91, 0.5),
                0 32px 64px rgba(43, 44, 91, 0.4),
                0 64px 128px rgba(15, 15, 42, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.15),
                0 0 120px rgba(66, 61, 128, 0.25)
              `
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = `
                0 0 0 1px rgba(66, 61, 128, 0.3),
                0 4px 8px rgba(0, 0, 0, 0.3),
                0 8px 16px rgba(43, 44, 91, 0.4),
                0 16px 32px rgba(43, 44, 91, 0.3),
                0 32px 64px rgba(15, 15, 42, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.1),
                0 0 80px rgba(66, 61, 128, 0.15)
              `
            }}
          >
            <h2
              className="text-5xl font-extrabold text-white mb-6 animate-fade-in tracking-wide"
              style={{ textShadow: "0 4px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(66, 61, 128, 0.3)" }}
            >
              Transform Data into Insights with Excel Analytics
            </h2>
            <p className="text-xl text-gray-300/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Effortlessly upload Excel files, select columns, and create stunning Bar, Line, Pie, Scatter, and 3D
              visualizations. Unlock powerful insights with our intuitive analytics platform.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 bg-gradient-to-r from-[#2B2C5B] to-[#423D80] text-white font-bold rounded-md border border-[#423D80] hover:from-[#423D80] hover:to-[#5A4FCF] transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
            >
              Start Analyzing
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[#2B2C5B]/60 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
          <div className="bg-[#0F0F2A]/80 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-[#2B2C5B]/50">
            <h3 className="text-xl font-semibold text-white mb-3">Seamless Excel Upload</h3>
            <p className="text-gray-400/90">
              Upload .xlsx or .xls files effortlessly with our drag-and-drop interface.
            </p>
          </div>
          <div className="bg-[#0F0F2A]/80 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-[#2B2C5B]/50">
            <h3 className="text-xl font-semibold text-white mb-3">Vivid Visualizations</h3>
            <p className="text-gray-400/90">
              Craft Bar, Line, Pie, Scatter, and 3D charts to visualize your data dynamically.
            </p>
          </div>
          <div className="bg-[#0F0F2A]/80 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-[#2B2C5B]/50">
            <h3 className="text-xl font-semibold text-white mb-3">Tailored Analytics</h3>
            <p className="text-gray-400/90">
              Select any columns for X and Y axes to create custom charts that suit your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-[#0F0F2A]/95 text-center relative z-10">
        <p className="text-gray-400/90">© 2025 Excel Analytics. All rights reserved.</p>
      </footer>

      {/* Enhanced Styles */}
      <style jsx>{`
        @keyframes pulse-slow {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes pulse-glow {
          0% {
            opacity: 0.3;
            transform: scale(1.1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.15);
          }
          100% {
            opacity: 0.3;
            transform: scale(1.1);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 1.5s ease-out;
        }
      `}</style>
    </div>
  )
}

export default LandingPage
