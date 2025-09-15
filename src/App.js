import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from './components/header';
import Dashboard from './components/Dashboard';
import Schedules from './components/Schedules';
import Reports from './components/Reports';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Footer from './components/footer';
import TrainMap from './components/maps';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [theme, setTheme] = useState("dark"); // "dark" | "light"

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white transition-colors duration-300">
        <Header
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isDark={theme}
          toggleTheme={toggleTheme}
        />

        {/* Define routes here */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/maps" className="flex-grow"element={<TrainMap />} />
        
          <Route path="/schedules" element={<Schedules />} /> */
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
