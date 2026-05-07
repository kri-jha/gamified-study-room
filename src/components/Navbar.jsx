import { Link, useLocation } from "react-router-dom";
import { Sparkles, LogIn, LogOut, User, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

// ─── Dark mode hook ────────────────────────────────────────────────────────────
function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("gazen_theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("gazen_theme", dark ? "dark" : "light");
  }, [dark]);

  return [dark, setDark];
}

const Navbar = () => {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, signOut } = useAuth();
  const [dark, setDark] = useDarkMode();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/profile", label: "Profile" },
    { to: "/timer", label: "Timer" },
    { to: "/quests", label: "Quests" },
    { to: "/rooms", label: "Rooms" },
    { to: "/reminders", label: "Reminders" },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-card/80 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-6 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 15 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"
          >
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </motion.div>
          <span className="font-display font-extrabold text-base text-foreground group-hover:text-primary transition-colors">
            Productivity
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-card/60 backdrop-blur-md rounded-full px-2 py-1.5 border border-border/50">
          {navLinks.map((link) => {
            const active = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right: Dark mode + Auth */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setDark((d) => !d)}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-secondary hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground"
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <motion.div
              key={dark ? "moon" : "sun"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.div>
          </motion.button>

          {/* Auth */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="hidden sm:inline font-medium">{profile?.full_name || profile?.username || "Profile"}</span>
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 bg-secondary text-foreground px-4 py-2 rounded-full text-sm font-semibold hover:bg-secondary/80 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/signin"
                className="flex items-center gap-2 bg-foreground text-background px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border px-2 py-2">
        <div className="flex items-center justify-around">
          {navLinks.map((link) => {
            const active = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
          {/* Mobile dark toggle */}
          <button
            onClick={() => setDark((d) => !d)}
            className="px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
