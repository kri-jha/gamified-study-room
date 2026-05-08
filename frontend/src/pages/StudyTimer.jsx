import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Square, Zap } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { saveSession } from "@/lib/saveSession";
import { Link } from "react-router-dom";

// ── Background-safe Timer Keys ────────────────────────────────────────────────
const T_START = "gazen_solo_timer_start";
const T_OFFSET = "gazen_solo_timer_offset";
const T_RUNNING = "gazen_solo_timer_running";

const getElapsed = () => {
  const start = Number(localStorage.getItem(T_START) || 0);
  const offset = Number(localStorage.getItem(T_OFFSET) || 0);
  if (!start) return offset;
  return offset + Math.floor((Date.now() - start) / 1000);
};

const StudyTimer = () => {
  const { user, refreshProfile } = useAuth();

  const [seconds, setSeconds] = useState(() => getElapsed());
  const [isRunning, setIsRunning] = useState(
    () => localStorage.getItem(T_RUNNING) === "true"
  );
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [warnings, setWarnings] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  // Track last session result for "session saved" banner
  const [lastSession, setLastSession] = useState(null);

  const tickRef = useRef(null);

  // ── Re-sync display when tab becomes active ───────────────────────────────
  useEffect(() => {
    const onVisibility = () => {
      if (!document.hidden) {
        setSeconds(getElapsed());
      } else if (isRunning) {
        // Only warn for solo timer (focus mode)
        setTabSwitchCount((c) => c + 1);
        setWarnings((w) => [...w, `⚠️ Tab switch at ${formatTime(getElapsed())}`]);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [isRunning]);

  // ── Tick the display every second ────────────────────────────────────────
  useEffect(() => {
    if (isRunning) {
      tickRef.current = setInterval(() => setSeconds(getElapsed()), 1000);
    } else {
      clearInterval(tickRef.current);
    }
    return () => clearInterval(tickRef.current);
  }, [isRunning]);

  // ── Controls ──────────────────────────────────────────────────────────────
  const handleStart = () => {
    localStorage.setItem(T_OFFSET, String(seconds));
    localStorage.setItem(T_START, String(Date.now()));
    localStorage.setItem(T_RUNNING, "true");
    setIsRunning(true);
    setLastSession(null);
  };

  const handlePause = () => {
    localStorage.setItem(T_OFFSET, String(getElapsed()));
    localStorage.removeItem(T_START);
    localStorage.setItem(T_RUNNING, "false");
    setIsRunning(false);
  };

  const handleReset = () => {
    handlePause(); // stop and snapshot offset
    setSeconds(0);
    localStorage.removeItem(T_START);
    localStorage.removeItem(T_OFFSET);
    localStorage.setItem(T_RUNNING, "false");
    setTabSwitchCount(0);
    setWarnings([]);
  };

  const handleStop = async () => {
    handlePause();
    const elapsed = getElapsed();
    handleReset(); // clear the clock immediately for UX

    if (elapsed < 120) {
      toast.info("Study for at least 2 minutes to earn XP!");
      return;
    }

    if (!user?.id) {
      toast.error("Sign in to save your session and earn XP!");
      return;
    }

    setIsSaving(true);
    const result = await saveSession(user.id, elapsed);
    setIsSaving(false);

    if (result) {
      setLastSession({ ...result, seconds: elapsed });
      toast.success(`🎉 Session saved! +${result.xpGain} XP`);
      await refreshProfile(); // re-sync profile side bar
    } else {
      toast.error("Couldn't save session to server");
    }
  };

  // ── Formatting ────────────────────────────────────────────────────────────
  const formatTime = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const previewXp = Math.floor(Math.floor(seconds / 60) / 2)
    + (seconds >= 3600 ? Math.floor(Math.floor(seconds / 60) / 60) * 2 : 0);
  const progressDeg = (seconds % 60) * 6;

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center p-4 pt-20">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-display font-extrabold text-foreground">⏱️ Focus Timer</h1>
            <p className="text-muted-foreground text-sm mt-1">Stay focused. Earn XP. Build your streak.</p>
            {isRunning && (
              <p className="text-emerald-500 text-xs font-bold mt-2 flex items-center justify-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Timer runs even if you switch tabs
              </p>
            )}
          </div>

          {/* Timer Circle */}
          <div className="flex justify-center">
            <div className="relative w-64 h-64">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 256 256">
                <circle cx="128" cy="128" r="120" fill="none" stroke="hsl(220, 15%, 90%)" strokeWidth="8" />
                <circle
                  cx="128" cy="128" r="120" fill="none"
                  stroke={!isRunning && seconds > 0 ? "hsl(25, 90%, 55%)" : "hsl(220, 80%, 55%)"}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(progressDeg / 360) * 754} 754`}
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-5xl font-display font-bold text-foreground tracking-widest">{formatTime(seconds)}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {!isRunning && seconds === 0 ? "Ready" : !isRunning ? "⏸ Paused" : "🟢 Studying"}
                </p>
                {seconds >= 120 && (
                  <p className="text-xs text-primary font-semibold mt-1 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> +{previewXp} XP on stop
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {!isRunning ? (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-display font-bold hover:opacity-90 transition-all glow-primary">
                <Play className="w-5 h-5" /> {seconds > 0 ? "Resume" : "Start"}
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handlePause}
                className="flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-xl font-display font-bold hover:opacity-90 transition-all">
                <Pause className="w-5 h-5" /> Pause
              </motion.button>
            )}
            {seconds > 0 && (
              <>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleStop} disabled={isSaving}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-display font-bold hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20">
                  <Square className="w-5 h-5" /> {isSaving ? "Saving..." : "Stop & Save XP"}
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="flex items-center gap-2 bg-secondary text-foreground px-4 py-3 rounded-xl font-medium hover:bg-secondary/80 transition-all">
                  <RotateCcw className="w-5 h-5" />
                </motion.button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass rounded-xl p-3 text-center soft-shadow">
              <p className={`text-xl font-display font-bold ${seconds >= 120 ? "text-primary" : "text-muted-foreground"}`}>{previewXp}</p>
              <p className="text-xs text-muted-foreground">XP Preview</p>
            </div>
            <div className="glass rounded-xl p-3 text-center soft-shadow">
              <p className="text-xl font-display font-bold text-accent">{(seconds / 3600).toFixed(2)}h</p>
              <p className="text-xs text-muted-foreground">Session Hrs</p>
            </div>
            <div className="glass rounded-xl p-3 text-center soft-shadow">
              <p className={`text-xl font-display font-bold ${tabSwitchCount > 0 ? "text-destructive" : "text-emerald-500"}`}>{tabSwitchCount}</p>
              <p className="text-xs text-muted-foreground">Tab Switches</p>
            </div>
          </div>

          {/* Session Saved Banner */}
          <AnimatePresence>
            {lastSession && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="glass rounded-2xl p-5 border border-emerald-500/20 bg-emerald-500/5"
              >
                <h3 className="font-display font-bold text-emerald-600 flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4" /> Session Saved to Your Profile!
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-black text-foreground">+{lastSession.xpGain}</p>
                    <p className="text-xs text-muted-foreground">XP Earned</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-foreground">{(lastSession.seconds / 3600).toFixed(2)}h</p>
                    <p className="text-xs text-muted-foreground">Hours</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-primary">{lastSession.xp}</p>
                    <p className="text-xs text-muted-foreground">Total XP</p>
                  </div>
                </div>
                <Link to="/profile" className="mt-3 text-xs text-primary hover:underline font-semibold flex items-center gap-1">
                  View profile →
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="glass rounded-xl p-4 border border-destructive/30 soft-shadow">
              <p className="text-sm font-semibold text-destructive mb-2">⚠️ Focus Warnings</p>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {warnings.map((w, i) => <p key={i} className="text-xs text-muted-foreground">{w}</p>)}
              </div>
              <p className="text-xs text-destructive/70 mt-2">Tab switches are tracked to keep your streak honest.</p>
            </div>
          )}

          {!user && (
            <p className="text-center text-sm text-muted-foreground">
              <Link to="/signin" className="text-primary font-semibold hover:underline">Sign in</Link> to save your XP, streak, and hours to your profile!
            </p>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default StudyTimer;
