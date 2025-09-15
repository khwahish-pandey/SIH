import React from "react";
import { Link } from "react-router-dom";

const Header = ({ activeSection, setActiveSection, isDark, toggleTheme }) => {
  return (
    <nav className="bg-sky-900 text-white px-4 lg:px-6 py-4 transition-colors duration-300 shadow-md">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-6">
          <h1 className="text-lg lg:text-2xl font-bold text-zinc-50">
            <span className="hidden sm:inline">RailMarg</span>
            <span className="sm:hidden">RCS</span>
          </h1>

          <ul className="flex space-x-6">
            <li>
              <Link
                to="/dashboard"
                onClick={() => setActiveSection("dashboard")}
                className={`flex items-center space-x-1 font-semibold px-3 py-1 rounded-md transition-colors duration-200
                  ${activeSection === "dashboard" ? "text-gray-400" : "text-white hover:text-gray-300"} no-underline`}
              >
                <span>📊</span>
                <span>Dashboard</span>
              </Link>
            </li>

            <li>
              <Link
                to="/schedules"
                onClick={() => setActiveSection("schedules")}
                className={`flex items-center space-x-1 font-semibold px-3 py-1 rounded-md transition-colors duration-200
                  ${activeSection === "schedules" ? "text-gray-400" : "text-white hover:text-gray-300"} no-underline`}
              >
                <span>📅</span>
                <span>Schedules</span>
              </Link>
            </li>

            <li>
              <Link
                to="/reports"
                onClick={() => setActiveSection("reports")}
                className={`flex items-center space-x-1 font-semibold px-3 py-1 rounded-md transition-colors duration-200
                  ${activeSection === "reports" ? "text-gray-400" : "text-white hover:text-gray-300"} no-underline`}
              >
                <span>📈</span>
                <span>Reports</span>
              </Link>
            </li>
             <li>
              <Link
                to="/maps"
                onClick={() => setActiveSection("maps")}
                className={`flex items-center space-x-1 font-semibold px-3 py-1 rounded-md transition-colors duration-200
                  ${activeSection === "maps" ? "text-gray-400" : "text-white hover:text-gray-300"} no-underline`}
              >
                <span>📌</span>
                <span>Maps</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-md text-slate-300 font-bold">System Online</span>
          </div>
          <div className="md:hidden">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          {/* <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-sky-800 hover:bg-sky-700 transition-colors duration-200"
            aria-label="Toggle theme"
          >
            {/* <span className="text-lg">{isDark === "dark" ? "🌙" : "☀️"}</span> */}
          {/* </button> */} 
        </div>
      </div>
    </nav>
  );
};

export default Header;
