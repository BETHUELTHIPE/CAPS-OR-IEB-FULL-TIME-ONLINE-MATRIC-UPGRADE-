import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Profile } from "./types";
import { dbAuth, syncFirestoreWithLocalCache } from "./lib/db";


// Import custom pages
import { Layout } from "./components/Layout";
import { Home } from "./components/Home";
import { About } from "./components/About";
import { Services } from "./components/Services";
import { Subjects } from "./components/Subjects";
import { Pricing } from "./components/Pricing";
import { Contact } from "./components/Contact";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Dashboard } from "./components/Dashboard";
import { VideoRequestsPage } from "./components/VideoRequestsPage";
import { BookPage } from "./components/BookPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { Gallery } from "./components/Gallery";

export default function App() {
  const [user, setUser] = useState<Profile | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("amh_dark_mode") === "true";
  });
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem("amh_high_contrast") === "true";
  });
  const [fontScale, setFontScale] = useState<"normal" | "large" | "xl">(() => {
    const saved = localStorage.getItem("amh_font_scale");
    return (saved === "large" || saved === "xl") ? saved : "normal";
  });

  // Sync active user session on load & bootstrap Firebase Firestore sync
  useEffect(() => {
    setUser(dbAuth.getCurrentUser());
    syncFirestoreWithLocalCache();
  }, []);

  // Sync dark mode class with DOM element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("amh_dark_mode", String(darkMode));
  }, [darkMode]);

  // Sync high contrast mode class with DOM element
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
    localStorage.setItem("amh_high_contrast", String(highContrast));
  }, [highContrast]);

  // Sync font scale class with DOM element
  useEffect(() => {
    document.documentElement.classList.remove("font-scale-large", "font-scale-xl");
    if (fontScale === "large") {
      document.documentElement.classList.add("font-scale-large");
    } else if (fontScale === "xl") {
      document.documentElement.classList.add("font-scale-xl");
    }
    localStorage.setItem("amh_font_scale", fontScale);
  }, [fontScale]);

  const handleLoginSuccess = (profile: Profile) => {
    setUser(profile);
  };

  const handleLogout = () => {
    dbAuth.logout();
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Layout 
        user={user} 
        onLogout={handleLogout} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        fontScale={fontScale}
        setFontScale={setFontScale}
      >
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/gallery" element={<Gallery user={user} />} />
          <Route path="/contact" element={<Contact />} />
          <Route 
            path="/video-requests" 
            element={user ? <VideoRequestsPage user={user} /> : <Navigate to="/login?redirect=video-requests" replace />} 
          />
          <Route path="/book" element={<BookPage user={user} onLoginSuccess={handleLoginSuccess} />} />

          {/* Authentication Pages */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" replace /> : <Register onRegisterSuccess={handleLoginSuccess} />} 
          />

          {/* Protected Student Portal Dashboard */}
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} onProfileUpdate={setUser} /> : <Navigate to="/login" replace />} 
          />

          {/* Protected Admin Portal Dashboard */}
          <Route 
            path="/admin" 
            element={user && (user.role === "admin" || user.role === "tutor") ? <AdminDashboard user={user} /> : <Navigate to="/dashboard" replace />} 
          />

          {/* Fallback routing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
