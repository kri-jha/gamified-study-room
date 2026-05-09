import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Square, Zap, Clock, Timer as TimerIcon } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { saveSession } from "@/lib/saveSession";
import { Link } from "react-router-dom";
import { sendNotification } from "@/lib/notificationService";

// ── Background-safe Timer Keys ────────────────────────────────────────────────
const T_START = "gazen_solo_timer_start";
const T_OFFSET = "gazen_solo_timer_offset";
const T_RUNNING = "gazen_solo_timer_running";
const T_MODE = "gazen_solo_timer_mode";
const T_TIMER_INITIAL = "gazen_solo_timer_initial";

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
  const [mode, setMode] = useState(
    () => localStorage.getItem(T_MODE) || "stopwatch"
  );
  const [timerInitial, setTimerInitial] = useState(
    () => Number(localStorage.getItem(T_TIMER_INITIAL) || 1500) // Default 25 mins
  );

  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [warnings, setWarnings] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSession, setLastSession] = useState(null);

  const tickRef = useRef(null);
  const audioRef = useRef(null);

  // ── Re-sync display when tab becomes active ───────────────────────────────
  useEffect(() => {
    const onVisibility = () => {
      if (!document.hidden) {
        setSeconds(getElapsed());
      } else if (isRunning) {
        setTabSwitchCount((c) => c + 1);
        setWarnings((w) => [...w, `⚠️ Tab switch at ${formatTime(getDisplaySeconds(getElapsed()))}`]);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [isRunning, mode, timerInitial]);

  // ── Tick the display every second ────────────────────────────────────────
  useEffect(() => {
    if (isRunning) {
      tickRef.current = setInterval(() => {
        const elapsed = getElapsed();
        setSeconds(elapsed);

        // Check for timer completion
        if (mode === "timer" && elapsed >= timerInitial) {
          handleTimerComplete();
        }
      }, 1000);
    } else {
      clearInterval(tickRef.current);
    }
    return () => clearInterval(tickRef.current);
  }, [isRunning, mode, timerInitial]);

  const handleTimerComplete = () => {
    handlePause();
    setSeconds(timerInitial); // Snap to end
    sendNotification("timer");
    toast.success("⏰ Time's up! Great session.");
    
    // Play sound if possible
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      }
      audioRef.current.play();
    } catch (e) {
      console.log("Audio play blocked");
    }
  };

  // ── Controls ──────────────────────────────────────────────────────────────
  const handleStart = () => {
    if (mode === "timer" && seconds >= timerInitial) {
      toast.error("Reset the timer to start again!");
      return;
    }
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
    handlePause();
    setSeconds(0);
    localStorage.removeItem(T_START);
    localStorage.removeItem(T_OFFSET);
    localStorage.setItem(T_RUNNING, "false");
    setTabSwitchCount(0);
    setWarnings([]);
  };

  const handleStop = async () => {
    const elapsed = mode === "timer" ? Math.min(seconds, timerInitial) : seconds;
    handlePause();
    handleReset();

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
      await refreshProfile();
    } else {
      toast.error("Couldn't save session to server");
    }
  };

  const switchMode = (newMode) => {
    if (isRunning) {
      toast.info("Pause the clock before switching modes.");
      return;
    }
    setMode(newMode);
    localStorage.setItem(T_MODE, newMode);
    handleReset();
  };

  const updateTimerInitial = (mins) => {
    const secs = mins * 60;
    setTimerInitial(secs);
    localStorage.setItem(T_TIMER_INITIAL, String(secs));
    handleReset();
  };

  // ── Formatting ────────────────────────────────────────────────────────────
  const getDisplaySeconds = (s) => {
    if (mode === "stopwatch") return s;
    return Math.max(0, timerInitial - s);
  };

  const formatTime = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const displaySeconds = getDisplaySeconds(seconds);
  const previewXp = Math.floor(Math.floor(seconds / 60) / 2)
    + (seconds >= 3600 ? Math.floor(Math.floor(seconds / 60) / 60) * 2 : 0);
  
  // Progress calc
  let progressPct;
  if (mode === "stopwatch") {
    progressPct = (seconds % 60) / 60;
  } else {
    progressPct = displaySeconds / timerInitial;
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center p-4 pt-20">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-display font-extrabold text-foreground">
              {mode === "stopwatch" ? "⏱️ Stopwatch" : "⏰ Focus Timer"}
            </h1>
            
            {/* Mode Switcher */}
            <div className="flex justify-center mt-4">
              <div className="bg-secondary/50 p-1 rounded-xl flex gap-1">
                <button
                  onClick={() => switchMode("stopwatch")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${mode === "stopwatch" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Clock className="w-4 h-4" /> Stopwatch
                </button>
                <button
                  onClick={() => switchMode("timer")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${mode === "timer" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <TimerIcon className="w-4 h-4" /> Timer
                </button>
              </div>
            </div>
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
                  strokeDasharray={`${progressPct * 754} 754`}
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-5xl font-display font-bold text-foreground tracking-widest">{formatTime(displaySeconds)}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {mode === "timer" && displaySeconds === 0 && seconds > 0 ? "🏁 Done!" : 
                   !isRunning && seconds === 0 ? "Ready" : !isRunning ? "⏸ Paused" : "🟢 Studying"}
                </p>
                {seconds >= 120 && (
                  <p className="text-xs text-primary font-semibold mt-1 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> +{previewXp} XP on stop
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Timer Presets (Only in Timer mode when not running) */}
          {mode === "timer" && !isRunning && seconds === 0 && (
            <div className="flex flex-wrap justify-center gap-2 animate-in fade-in slide-in-from-top-2">
              {[15, 25, 45, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => updateTimerInitial(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${timerInitial === m * 60 ? "bg-primary/10 border-primary text-primary" : "border-border hover:border-primary/50 text-muted-foreground"}`}
                >
                  {m}m
                </button>
              ))}
            </div>
          )}

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
