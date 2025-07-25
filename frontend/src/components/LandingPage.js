import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003060] to-[#055C9D] flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-[#003060]/95 backdrop-blur-lg shadow-xl">
        <h1 className="text-3xl font-extrabold text-[#68BBE3] tracking-tight">Excel Analytics</h1>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 bg-gradient-to-r from-[#0E86D4] to-[#68BBE3] text-white font-semibold rounded-full border-2 border-white hover:from-[#68BBE3] hover:to-[#0E86D4] hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-extrabold text-white mb-6 animate-fade-in tracking-wide">
            Transform Data into Insights with Excel Analytics
          </h2>
          <p className="text-xl text-[#68BBE3]/90 mb-8 max-w-2xl mx-auto">
            Effortlessly upload Excel files, select columns, and create stunning Bar, Line, Pie, Scatter, and 3D visualizations. Unlock powerful insights with our intuitive analytics platform.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-4 bg-gradient-to-r from-[#0E86D4] to-[#68BBE3] text-white font-semibold rounded-full border-2 border-white hover:from-[#68BBE3] hover:to-[#0E86D4] hover:scale-110 transition-all duration-300 text-xl shadow-lg hover:shadow-2xl"
          >
            Start Analyzing
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[#055C9D]/60">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
          <div className="bg-[#003060]/80 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white mb-3">Seamless Excel Upload</h3>
            <p className="text-[#68BBE3]/90">Upload .xlsx or .xls files effortlessly with our drag-and-drop interface.</p>
          </div>
          <div className="bg-[#003060]/80 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white mb-3">Vivid Visualizations</h3>
            <p className="text-[#68BBE3]/90">Craft Bar, Line, Pie, Scatter, and 3D charts to visualize your data dynamically.</p>
          </div>
          <div className="bg-[#003060]/80 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white mb-3">Tailored Analytics</h3>
            <p className="text-[#68BBE3]/90">Select any columns for X and Y axes to create custom charts that suit your needs.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-[#003060]/95 text-center">
        <p className="text-white/90">© 2025 Excel Analytics. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;