import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { 
  School, Menu, X, Sun, Moon, LogIn, User, LogOut, 
  Mail, Phone, Clock, MessageSquare, ChevronDown, Bell, ExternalLink, Shield, MapPin,
  Sparkles, CheckCircle2, ShieldCheck, ArrowRight, ArrowUp, ChevronRight, BookOpen, Github
} from "lucide-react";
import { Profile, Booking } from "../types";
import { dbAuth, dbAPI } from "../lib/db";
import { ThemeToggle } from "./ThemeToggle";
import { SmartNotificationsDropdown } from "./SmartNotificationsDropdown";
import { ToastNotificationManager } from "./ToastNotificationManager";
import { AccessibilityToolbar } from "./AccessibilityToolbar";
import { AmarisLogo } from "./AmarisLogo";

interface LayoutProps {
  children: React.ReactNode;
  user: Profile | null;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  highContrast?: boolean;
  setHighContrast?: (active: boolean) => void;
  fontScale?: "normal" | "large" | "xl";
  setFontScale?: (scale: "normal" | "large" | "xl") => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  onLogout, 
  darkMode, 
  setDarkMode,
  highContrast = false,
  setHighContrast = () => {},
  fontScale = "normal",
  setFontScale = () => {}
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Notification Bell Alert States
  const [bellDropdownOpen, setBellDropdownOpen] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<Booking[]>([]);
  const [simulatedAlert, setSimulatedAlert] = useState<Booking | null>(null);

  // Focus Mode State (hides top navigation menu & top bar for distraction-free math workspace)
  const [isFocusMode, setIsFocusMode] = useState<boolean>(() => {
    return localStorage.getItem("amh_focus_mode") === "true";
  });

  useEffect(() => {
    const handleFocusModeToggle = (e: Event) => {
      const active = (e as CustomEvent).detail?.active ?? (localStorage.getItem("amh_focus_mode") === "true");
      setIsFocusMode(active);
    };

    window.addEventListener("focusModeToggle", handleFocusModeToggle);
    window.addEventListener("storage", handleFocusModeToggle);
    return () => {
      window.removeEventListener("focusModeToggle", handleFocusModeToggle);
      window.removeEventListener("storage", handleFocusModeToggle);
    };
  }, []);

  // Poll for upcoming tutoring sessions starting within 10 minutes
  useEffect(() => {
    if (!user) {
      setActiveAlerts([]);
      return;
    }

    const checkAlerts = () => {
      try {
        const allBookings = dbAPI.getBookings(user.id);
        const now = new Date();
        
        const alerts = allBookings.filter(bk => {
          if (bk.status === "completed" || bk.status === "cancelled") return false;
          
          try {
            // bk.lesson_date format is YYYY-MM-DD, bk.lesson_time format is HH:MM
            const [year, month, day] = bk.lesson_date.split("-").map(Number);
            const [hour, minute] = bk.lesson_time.split(":").map(Number);
            const lessonDate = new Date(year, month - 1, day, hour, minute, 0);
            
            const diffMs = lessonDate.getTime() - now.getTime();
            const diffMins = diffMs / 60000;
            
            // Alert activates if lesson starts in the next 10 minutes (and hasn't passed by more than 10 mins)
            return diffMins >= -10 && diffMins <= 10;
          } catch (e) {
            return false;
          }
        });

        const combinedAlerts = [...alerts];
        if (simulatedAlert) {
          combinedAlerts.push(simulatedAlert);
        }
        
        setActiveAlerts(combinedAlerts);
      } catch (e) {
        console.error("Error loading alerts", e);
      }
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 15000);
    return () => clearInterval(interval);
  }, [user, simulatedAlert]);

  const handleLogoutClick = () => {
    onLogout();
    setProfileDropdownOpen(false);
    navigate("/");
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Services", path: "/services" },
    { label: "Gallery", path: "/gallery" },
    { label: "Subjects", path: "/subjects" },
    { label: "Book Class", path: "/book" },
    { label: "Pricing", path: "/pricing" },
    { label: "Contact", path: "/contact" }
  ];

  return (
    <div className={`print-only min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? "dark bg-navy-950 text-navy-100" : "bg-navy-50 text-navy-900"}`}>
      {/* Keyboard & Screen Reader Skip to Content Link */}
      <a href="#main-content" className="skip-to-content-link">
        Skip to main content (Bypass Navigation)
      </a>

      {/* Top bar with quick South African contact info & physical address */}
      {!isFocusMode && (
        <div className="bg-navy-950 text-slate-300 text-[11px] sm:text-xs py-2 px-4 border-b border-navy-800/80 font-mono shadow-2xs">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <a 
                href="https://maps.google.com/?q=27+Atteridgeville,+Pretoria+West,+0008,+Gauteng"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-navy-900/80 hover:bg-navy-850 border border-navy-800 text-slate-200 hover:text-gold-400 transition-all text-[11px]"
                title="Open location in Google Maps"
              >
                <MapPin className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                <span className="font-semibold underline decoration-gold-500/30 underline-offset-2">27 Atteridgeville, Pretoria West, 0008, Gauteng</span>
              </a>
              
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-navy-900/80 border border-navy-800 text-slate-300 text-[11px]">
                <Phone className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                <span className="font-semibold">071 415 6665</span>
              </span>

              <span className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-navy-900/80 border border-navy-800 text-slate-300 text-[11px]">
                <Mail className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                <span className="font-semibold">bethuelmoukangwe8@gmail.com</span>
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-bold">
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                CAPS & IEB Matric Upgrades Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Primary Sticky Header Navbar */}
      {!isFocusMode && (
        <header className="sticky top-0 z-40 bg-white/85 dark:bg-navy-950/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-navy-800/80 shadow-xs transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Logo with branding */}
          <Link to="/" className="flex items-center group transition-transform hover:scale-[1.01]">
            <AmarisLogo variant="horizontal" size="md" />
          </Link>

          {/* Desktop Nav Links Pill Container */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 dark:bg-navy-900/80 p-1.5 rounded-full border border-slate-200/80 dark:border-navy-800/80 shadow-inner">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? "bg-white dark:bg-navy-800 text-royal-700 dark:text-gold-400 shadow-2xs border border-slate-200/80 dark:border-navy-700 font-extrabold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-navy-800/50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action buttons & controls */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Grouped Controls Island */}
            <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-navy-900/80 p-1 rounded-full border border-slate-200/80 dark:border-navy-800/80 shadow-2xs">
              {/* Smart Notifications Bell (Only if Logged In) */}
              {user && (
                <SmartNotificationsDropdown user={user} />
              )}

              {/* Accessibility & High Contrast Controls */}
              <AccessibilityToolbar 
                highContrast={highContrast}
                setHighContrast={setHighContrast}
                fontScale={fontScale}
                setFontScale={setFontScale}
              />

              {/* Floating Dark Mode Theme Toggle */}
              <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} variant="floating-icon" />
            </div>

            {/* User Account Dropdown or Login Buttons */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 bg-gradient-to-r from-royal-50 to-slate-100 dark:from-navy-900 dark:to-navy-850 border border-royal-200/80 dark:border-navy-700/80 rounded-full text-xs text-slate-800 dark:text-white font-semibold hover:border-royal-400 dark:hover:border-gold-400/50 transition-all shadow-2xs cursor-pointer"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-royal-600 to-amber-500 text-white rounded-full flex items-center justify-center text-[11px] font-black shadow-xs">
                    {user.first_name.charAt(0)}{user.surname.charAt(0)}
                  </div>
                  <div className="flex flex-col items-start text-left leading-tight">
                    <span className="font-extrabold max-w-[100px] truncate text-slate-900 dark:text-white">{user.first_name}</span>
                    <span className="text-[9px] font-mono text-royal-600 dark:text-gold-400 uppercase font-bold">
                      {user.role === "admin" ? (user.is_super_admin ? "Super Admin" : "Admin") : user.role}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${profileDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-xl py-2 text-xs z-50 animate-fadeIn backdrop-blur-xl">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-navy-800/80 bg-slate-50/50 dark:bg-navy-950/50 rounded-t-2xl">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-royal-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                          {user.first_name.charAt(0)}{user.surname.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold text-slate-900 dark:text-white truncate">{user.first_name} {user.surname}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <Link 
                        to="/dashboard" 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl transition-colors font-medium"
                      >
                        <User className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                        <span>Student Dashboard</span>
                      </Link>

                      {(user.role === "admin" || user.role === "tutor") && (
                        <Link 
                          to="/admin" 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-royal-700 dark:text-gold-400 hover:bg-royal-50 dark:hover:bg-navy-800 rounded-xl font-bold transition-colors"
                        >
                          <Shield className="w-4 h-4 text-amber-500" />
                          <span>{user.role === "tutor" ? "Tutor Portal" : "Admin Control Center"}</span>
                        </Link>
                      )}
                    </div>

                    <div className="p-1 border-t border-slate-100 dark:border-navy-800/80 mt-1">
                      <button 
                        onClick={handleLogoutClick}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors font-bold cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-royal-600 dark:hover:text-gold-400 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-full transition-all"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-5 py-2 bg-gradient-to-r from-royal-600 via-royal-700 to-navy-900 hover:from-royal-700 hover:to-navy-950 text-white text-xs font-extrabold rounded-full shadow-md hover:shadow-royal-500/20 transition-all flex items-center gap-1.5 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Enrol Now</span>
                  <Sparkles className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu trigger */}
          <div className="flex items-center gap-1.5 lg:hidden">
            {user && <SmartNotificationsDropdown user={user} />}
            <AccessibilityToolbar 
              highContrast={highContrast}
              setHighContrast={setHighContrast}
              fontScale={fontScale}
              setFontScale={setFontScale}
            />
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} variant="floating-icon" />
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-full border border-slate-200/80 dark:border-navy-700 transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-navy-800 bg-white/95 dark:bg-navy-950/95 backdrop-blur-xl px-4 py-4 space-y-4 shadow-2xl animate-fadeIn">
            <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link 
                    key={link.path} 
                    to={link.path} 
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      isActive 
                        ? "bg-royal-600/10 text-royal-700 dark:bg-gold-500/10 dark:text-gold-400 border border-royal-500/20 dark:border-gold-500/20" 
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800"
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-royal-600 dark:text-gold-400" />}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-slate-100 dark:border-navy-800 pt-3 flex flex-col gap-2">
              {user ? (
                <div className="p-3 bg-slate-50 dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-royal-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                      {user.first_name.charAt(0)}{user.surname.charAt(0)}
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-slate-900 dark:text-white">{user.first_name} {user.surname}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-1 pt-1">
                    <Link 
                      to="/dashboard" 
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-navy-800 text-slate-800 dark:text-white border border-slate-200 dark:border-navy-700"
                    >
                      <User className="w-3.5 h-3.5 text-royal-600" />
                      <span>Student Dashboard</span>
                    </Link>

                    {(user.role === "admin" || user.role === "tutor") && (
                      <Link 
                        to="/admin" 
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-royal-50 dark:bg-navy-800 text-royal-700 dark:text-gold-400 border border-royal-200 dark:border-navy-700"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-500" />
                        <span>{user.role === "tutor" ? "Tutor Portal" : "Admin Panel"}</span>
                      </Link>
                    )}

                    <button 
                      onClick={handleLogoutClick}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link 
                    to="/login" 
                    className="px-4 py-2.5 text-center text-xs font-extrabold border border-slate-200 dark:border-navy-700 rounded-xl hover:bg-slate-50 dark:hover:bg-navy-800 text-slate-800 dark:text-slate-200"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-4 py-2.5 text-center text-xs font-extrabold bg-gradient-to-r from-royal-600 to-navy-900 text-white rounded-xl shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>Enrol Now</span>
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      )}

      {/* Main page content layout slot */}
      <main id="main-content" tabIndex={-1} role="main" aria-label="Main Content Area" className="flex-1 outline-none">
        {children}
      </main>

      {/* Footer component */}
      {!isFocusMode && (
      <footer className="bg-navy-900 text-navy-350 border-t border-navy-800 pt-16 pb-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-navy-800">
          
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <AmarisLogo variant="horizontal" size="md" lightText={true} />
            </Link>
            <p className="text-xs text-navy-400 leading-relaxed">
              We provide premium, full-time online mathematics upgrades and interactive tutoring for South African CAPS and IEB matric learners.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider mb-4">Syllabus Options</h4>
            <ul className="space-y-2 text-xs text-navy-400">
              <li>• CAPS Matric Upgrades (Public Schools)</li>
              <li>• IEB Independent Mathematics Upgrades</li>
              <li>• IEB Advanced Programme (AP) Mathematics</li>
              <li>• National Senior Certificate (NSC) Prep</li>
              <li>• Grade 12 Mark Booster Programs</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs text-navy-400">
              <li><Link to="/about" className="hover:text-gold-400 transition-colors">• About the Founder</Link></li>
              <li><Link to="/services" className="hover:text-gold-400 transition-colors">• Tutoring Services</Link></li>
              <li><Link to="/gallery" className="hover:text-gold-400 transition-colors">• Media & Photos Gallery</Link></li>
              <li><Link to="/subjects" className="hover:text-gold-400 transition-colors">• Mathematics Curriculum</Link></li>
              <li><Link to="/pricing" className="hover:text-gold-400 transition-colors">• Lesson Packages & pricing</Link></li>
              <li><Link to="/contact" className="hover:text-gold-400 transition-colors">• Support & WhatsApp Hotline</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider mb-4">Official Contact</h4>
            <div className="space-y-3 text-xs text-navy-400">
              <a 
                href="https://maps.google.com/?q=27+Atteridgeville,+Pretoria+West,+0008,+Gauteng"
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-2 hover:text-gold-400 transition-colors group"
              >
                <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="underline decoration-gold-400/30 underline-offset-2">27 Atteridgeville, Pretoria West, 0008, Gauteng</span>
              </a>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>071 415 6665</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span className="break-all">bethuelmoukangwe8@gmail.com</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>Mon - Sun: 07:00 - 20:00</span>
              </p>
              <div className="pt-2 flex gap-2">
                <a 
                  href="https://wa.me/27714156665" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  Chat WhatsApp
                </a>
              </div>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-navy-500 border-t border-navy-800/60 mt-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span>© 2026 Amaris Learning Hub. All rights reserved. Registered South African Matric Tutor.</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 font-mono text-[11px]">
            <span className="text-navy-300 bg-navy-800/80 px-3 py-1 rounded-full border border-navy-700 flex items-center gap-1.5 shadow-sm">
              <span className="text-gold-400 font-bold">Designed & Built by</span>
              <span className="text-white font-extrabold">Audrin Developers</span>
              <span className="text-navy-400">•</span>
              <a 
                href="https://github.com/BETHUELTHIPE" 
                target="_blank" 
                rel="noreferrer" 
                className="text-gold-400 hover:text-gold-300 underline inline-flex items-center gap-1 font-bold"
              >
                <Github className="w-3.5 h-3.5" />
                <span>@BETHUELTHIPE</span>
              </a>
              <span className="text-navy-400">•</span>
              <a href="tel:0714156665" className="text-slate-300 hover:underline font-bold">071 415 6665</a>
            </span>
            <div className="flex gap-4 text-navy-400">
              <a href="#privacy" className="hover:text-navy-300">Privacy Policy</a>
              <a href="#terms" className="hover:text-navy-300">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
      )}

      {/* Floating Dark Mode Toggle Button */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed bottom-6 right-6 z-50 p-3 bg-white dark:bg-navy-900 border-2 border-royal-500/35 dark:border-gold-400/40 text-royal-600 dark:text-gold-400 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer group flex items-center justify-center"
        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        id="floating-dark-mode-toggle"
      >
        <div className="relative w-6 h-6 flex items-center justify-center">
          {darkMode ? (
            <Sun className="w-5 h-5 text-gold-400" />
          ) : (
            <Moon className="w-5 h-5 text-royal-600" />
          )}
        </div>
      </button>

      {/* Toast Notification Manager for Milestones & Streaks */}
      <ToastNotificationManager />
    </div>
  );
};
