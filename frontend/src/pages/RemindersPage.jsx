import { useState, useEffect, useCallback, useRef, forwardRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  Bell, BellRing, Clock, Zap, Coffee, Sparkles, Plus, X, Volume2, VolumeX,
  Timer, CalendarClock, Brain, Trash2, Check, Sword, Shield, Crown, Skull,
  Flame, Target, Radio, Eye
} from "lucide-react";
import PageTransition from "@/components/PageTransition";
import {
  requestNotificationPermission,
  sendNotification,
  getRandomMessage,
  reminderScheduler,
} from "@/lib/notificationService";
import { toast } from "sonner";

/* ──────────── VIBES ──────────── */
const VIBES = [
  {
    id: "motivational", label: "War Cry", emoji: "⚔️", icon: Sword,
    gradient: "from-red-500/20 via-orange-500/10 to-yellow-500/20",
    border: "border-red-500/40", glow: "shadow-red-500/20",
    text: "text-red-400", accent: "bg-red-500",
    desc: "Aggressive. No mercy.",
    particles: ["🔥", "⚔️", "💀", "👊"],
  },
  {
    id: "funny", label: "Meme Lord", emoji: "💀", icon: Skull,
    gradient: "from-violet-500/20 via-purple-500/10 to-fuchsia-500/20",
    border: "border-violet-500/40", glow: "shadow-violet-500/20",
    text: "text-violet-400", accent: "bg-violet-500",
    desc: "Unhinged. Chaotic.",
    particles: ["💀", "🗿", "😭", "🤡"],
  },
  {
    id: "chill", label: "Zen Mode", emoji: "🧘", icon: Eye,
    gradient: "from-cyan-500/20 via-teal-500/10 to-emerald-500/20",
    border: "border-cyan-500/40", glow: "shadow-cyan-500/20",
    text: "text-cyan-400", accent: "bg-cyan-500",
    desc: "Peaceful. No pressure.",
    particles: ["✨", "🌿", "🫧", "💫"],
  },
];

const PRESETS = [
  { label: "Lightning", sub: "Every 15 min", minutes: 15, emoji: "⚡", color: "from-yellow-500/15 to-amber-500/15", border: "border-yellow-500/30" },
  { label: "Steady", sub: "Every 30 min", minutes: 30, emoji: "🎯", color: "from-blue-500/15 to-indigo-500/15", border: "border-blue-500/30" },
  { label: "Hourly", sub: "Every 60 min", minutes: 60, emoji: "🔔", color: "from-emerald-500/15 to-teal-500/15", border: "border-emerald-500/30" },
  { label: "Marathon", sub: "Every 2 hrs", minutes: 120, emoji: "🏔️", color: "from-purple-500/15 to-pink-500/15", border: "border-purple-500/30" },
];

const SMART_BREAKS = [
  { label: "Pomodoro", sub: "25 study → 5 break", studyMin: 25, breakMin: 5, emoji: "🍅", tier: "S", tierColor: "text-red-400" },
  { label: "Deep Focus", sub: "50 study → 10 break", studyMin: 50, breakMin: 10, emoji: "🧠", tier: "A", tierColor: "text-amber-400" },
  { label: "Speed Run", sub: "15 study → 3 break", studyMin: 15, breakMin: 3, emoji: "🏃", tier: "B", tierColor: "text-emerald-400" },
];

/* ──────────── FLOATING PARTICLES ──────────── */
const FloatingParticle = ({ emoji, delay }) => (
  <motion.span
    className="absolute text-2xl pointer-events-none select-none opacity-[0.07]"
    initial={{ y: "100%", x: `${Math.random() * 100}%`, rotate: 0 }}
    animate={{ y: "-100%", rotate: 360 }}
    transition={{ duration: 12 + Math.random() * 8, delay, repeat: Infinity, ease: "linear" }}
  >
    {emoji}
  </motion.span>
);

/* ──────────── GLITCH TEXT ──────────── */
const GlitchText = ({ children, className = "" }) => {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`relative inline-block ${className}`}>
      {glitch && (
        <>
          <span className="absolute inset-0 text-red-500/60 translate-x-[2px] translate-y-[-1px] clip-glitch-1">{children}</span>
          <span className="absolute inset-0 text-cyan-500/60 translate-x-[-2px] translate-y-[1px] clip-glitch-2">{children}</span>
        </>
      )}
      {children}
    </span>
  );
};

/* ──────────── NOTIFICATION PREVIEW CARD ──────────── */
const NotifPreview = forwardRef(({ message, vibe, onClose }, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, y: 30, scale: 0.9, rotateX: 15 }}
    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
    exit={{ opacity: 0, y: -20, scale: 0.95, filter: "blur(8px)" }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
    className={`relative overflow-hidden rounded-2xl border ${vibe.border} bg-gradient-to-br ${vibe.gradient} backdrop-blur-xl p-5`}
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent h-[2px]"
      animate={{ y: [0, 200] }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    />
    <div className="relative flex items-start gap-3">
      <motion.span
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5, repeat: 2 }}
        className="text-3xl"
      >
        {vibe.emoji}
      </motion.span>
      <div className="flex-1 min-w-0">
        <p className="font-black text-foreground text-sm tracking-tight">{message.title}</p>
        <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">{message.body}</p>
      </div>
      <button onClick={onClose} className="text-muted-foreground/50 hover:text-foreground transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
    <motion.div
      className={`absolute bottom-0 left-0 h-[3px] ${vibe.accent}`}
      initial={{ width: "100%" }}
      animate={{ width: "0%" }}
      transition={{ duration: 4, ease: "linear" }}
    />
  </motion.div>
));
NotifPreview.displayName = "NotifPreview";

/* ──────────── STATUS HUD ──────────── */
const StatusHUD = ({ isActive, preset, breakMode, times, vibe }) => {
  const items = [];
  if (preset !== null) items.push({ label: PRESETS[preset].label, emoji: PRESETS[preset].emoji });
  if (breakMode !== null) items.push({ label: SMART_BREAKS[breakMode].label, emoji: SMART_BREAKS[breakMode].emoji });
  if (times.length > 0) items.push({ label: `${times.length} alarm${times.length > 1 ? "s" : ""}`, emoji: "⏰" });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 ${
        isActive
          ? `${vibe.border} bg-gradient-to-r ${vibe.gradient} shadow-lg ${vibe.glow}`
          : "border-border/40 bg-muted/20"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isActive ? (
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className={`w-3 h-3 rounded-full ${vibe.accent}`}
            />
          ) : (
            <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
          )}
          <span className={`text-sm font-bold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
            {isActive ? "SYSTEM ACTIVE" : "SYSTEM OFFLINE"}
          </span>
        </div>
        {isActive && (
          <div className="flex items-center gap-1.5">
            <Radio className={`w-3.5 h-3.5 ${vibe.text}`} />
            <span className={`text-xs font-mono font-bold ${vibe.text}`}>LIVE</span>
          </div>
        )}
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {items.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background/50 text-xs font-semibold text-foreground border border-border/30">
              <span>{item.emoji}</span> {item.label}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
};

/* ──────────── MAIN PAGE ──────────── */
const RemindersPage = () => {
  const [permission, setPermission] = useState("default");
  const [activeVibe, setActiveVibe] = useState("motivational");
  const [scheduledTimes, setScheduledTimes] = useState([]);
  const [newTime, setNewTime] = useState("09:00");
  const [activePreset, setActivePreset] = useState(null);
  const [activeBreak, setActiveBreak] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [previewMessage, setPreviewMessage] = useState(null);
  const [showAddTime, setShowAddTime] = useState(false);

  useEffect(() => {
    if ("Notification" in window) setPermission(Notification.permission);
  }, []);

  const currentVibe = VIBES.find((v) => v.id === activeVibe);

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === "granted") {
      toast.success("Notifications unlocked! 🔓");
      sendNotification(activeVibe);
    } else if (result === "denied") {
      toast.error("Blocked. Check browser settings.");
    }
  };

  const handlePreview = () => {
    const msg = getRandomMessage(activeVibe);
    setPreviewMessage(msg);
    if (permission === "granted") sendNotification(activeVibe);
    setTimeout(() => setPreviewMessage(null), 4000);
  };

  const handleAddTime = () => {
    if (!scheduledTimes.includes(newTime)) {
      setScheduledTimes((prev) => [...prev, newTime].sort());
      setShowAddTime(false);
    }
  };

  const handleRemoveTime = (time) => setScheduledTimes((prev) => prev.filter((t) => t !== time));

  const handleActivate = useCallback(() => {
    if (permission !== "granted") { toast.error("Enable notifications first!"); return; }
    reminderScheduler.clearAll();
    if (scheduledTimes.length > 0) reminderScheduler.scheduleAtTimes(scheduledTimes, activeVibe);
    if (activePreset !== null) reminderScheduler.scheduleInterval(PRESETS[activePreset].minutes, activeVibe);
    if (activeBreak !== null) reminderScheduler.scheduleSmartBreak(SMART_BREAKS[activeBreak].studyMin);
    setIsActive(true);
    toast.success("Reminders deployed 🚀");
  }, [permission, scheduledTimes, activePreset, activeBreak, activeVibe]);

  const handleDeactivate = () => {
    reminderScheduler.clearAll();
    setIsActive(false);
    toast("System paused ⏸️");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pt-20 md:pt-24 pb-28 px-4 relative overflow-hidden">
        {/* Floating background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {currentVibe.particles.map((p, i) => (
            <FloatingParticle key={`${activeVibe}-${i}`} emoji={p} delay={i * 2} />
          ))}
        </div>

        {/* Ambient glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-[0.06] ${currentVibe.accent} pointer-events-none`} />

        <div className="max-w-2xl mx-auto space-y-5 relative z-10">

          {/* ── HEADER ── */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-center space-y-3"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="text-5xl"
            >
              {currentVibe.emoji}
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-none">
              <GlitchText>STUDY</GlitchText>{" "}
              <span className={currentVibe.text}>ALERTS</span>
            </h1>
            <p className="text-muted-foreground text-sm font-mono">
              // configure your notification loadout
            </p>
          </motion.div>

          {/* ── STATUS HUD ── */}
          <StatusHUD isActive={isActive} preset={activePreset} breakMode={activeBreak} times={scheduledTimes} vibe={currentVibe} />

          {/* ── PERMISSION BANNER ── */}
          {permission !== "granted" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className={`relative overflow-hidden rounded-2xl border-2 border-dashed ${currentVibe.border} p-6`}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <div className="relative text-center space-y-3">
                <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                  className="text-4xl inline-block"
                >
                  🔔
                </motion.div>
                <h3 className="font-black text-foreground text-lg">UNLOCK NOTIFICATIONS</h3>
                <p className="text-muted-foreground text-xs font-mono">
                  {">"} required to deploy reminder system
                </p>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                  onClick={handleEnableNotifications}
                  className={`px-8 py-3 ${currentVibe.accent} text-primary-foreground rounded-xl font-black text-sm shadow-xl ${currentVibe.glow} tracking-wide`}
                >
                  GRANT ACCESS →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── VIBE SELECTOR ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="space-y-3"
          >
            <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest px-1">
              ◆ SELECT VIBE
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {VIBES.map((vibe) => {
                const active = activeVibe === vibe.id;
                const Icon = vibe.icon;
                return (
                  <motion.button
                    key={vibe.id}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setActiveVibe(vibe.id)}
                    className={`relative p-4 rounded-2xl border-2 transition-all overflow-hidden ${
                      active
                        ? `${vibe.border} bg-gradient-to-br ${vibe.gradient} shadow-xl ${vibe.glow}`
                        : "border-border/30 bg-card/50 hover:border-border/60"
                    }`}
                  >
                    {active && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-transparent to-white/[0.03]"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                    )}
                    <div className="relative space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{vibe.emoji}</span>
                        {active && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className={`w-5 h-5 rounded-full ${vibe.accent} flex items-center justify-center`}
                          >
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </motion.div>
                        )}
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-black ${active ? "text-foreground" : "text-muted-foreground"}`}>{vibe.label}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{vibe.desc}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Preview button */}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handlePreview}
              className={`w-full py-3 rounded-xl border-2 border-dashed ${currentVibe.border} bg-gradient-to-r ${currentVibe.gradient} text-sm font-bold ${currentVibe.text} flex items-center justify-center gap-2 hover:shadow-lg ${currentVibe.glow} transition-all`}
            >
              <Volume2 className="w-4 h-4" /> TEST NOTIFICATION
            </motion.button>

            {/* Preview card */}
            <AnimatePresence>
              {previewMessage && (
                <NotifPreview
                  message={previewMessage}
                  vibe={currentVibe}
                  onClose={() => setPreviewMessage(null)}
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── QUICK PRESETS ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest px-1">
              ◆ FREQUENCY
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {PRESETS.map((preset, i) => {
                const active = activePreset === i;
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActivePreset(active ? null : i)}
                    className={`relative p-4 rounded-2xl border-2 text-left transition-all overflow-hidden ${
                      active
                        ? `${preset.border} bg-gradient-to-br ${preset.color} shadow-lg`
                        : "border-border/30 bg-card/50 hover:border-border/60"
                    }`}
                  >
                    {active && (
                      <motion.div
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <Check className="w-3.5 h-3.5 text-foreground" />
                      </motion.div>
                    )}
                    <span className="text-2xl block mb-2">{preset.emoji}</span>
                    <p className="text-sm font-black text-foreground">{preset.label}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{preset.sub}</p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* ── SCHEDULED TIMES ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
                ◆ ALARMS
              </h3>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowAddTime(!showAddTime)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  showAddTime
                    ? `${currentVibe.accent} text-primary-foreground`
                    : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {showAddTime ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </motion.button>
            </div>

            <AnimatePresence>
              {showAddTime && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="overflow-hidden"
                >
                  <div className={`flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed ${currentVibe.border} bg-gradient-to-r ${currentVibe.gradient}`}>
                    <input
                      type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-mono font-bold focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={handleAddTime}
                      className={`px-6 py-2.5 ${currentVibe.accent} text-primary-foreground rounded-xl text-sm font-black tracking-wide`}
                    >
                      SET
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {scheduledTimes.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <span className="text-3xl opacity-30">⏰</span>
                <p className="text-muted-foreground text-xs font-mono">no alarms set</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {scheduledTimes.map((time) => (
                    <motion.div
                      key={time} layout
                      initial={{ opacity: 0, x: -30, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 30, scale: 0.9, filter: "blur(4px)" }}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm group hover:border-border/80 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentVibe.gradient} ${currentVibe.border} border flex items-center justify-center`}>
                          <Clock className={`w-4 h-4 ${currentVibe.text}`} />
                        </div>
                        <span className="text-lg font-mono font-black text-foreground tracking-wider">
                          {new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={() => handleRemoveTime(time)}
                        className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* ── SMART BREAKS ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest px-1">
              ◆ BREAK PROTOCOL
            </h3>
            <div className="space-y-2">
              {SMART_BREAKS.map((brk, i) => {
                const active = activeBreak === i;
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveBreak(active ? null : i)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                      active
                        ? `${currentVibe.border} bg-gradient-to-r ${currentVibe.gradient} shadow-lg ${currentVibe.glow}`
                        : "border-border/30 bg-card/50 hover:border-border/60"
                    }`}
                  >
                    <span className="text-3xl">{brk.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-foreground">{brk.label}</p>
                        <span className={`text-[10px] font-mono font-black ${brk.tierColor} px-1.5 py-0.5 rounded bg-foreground/5`}>
                          TIER {brk.tier}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{brk.sub}</p>
                    </div>
                    {active && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className={`w-7 h-7 rounded-full ${currentVibe.accent} flex items-center justify-center flex-shrink-0`}
                      >
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* ── ACTIVATE / DEACTIVATE ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="pb-4"
          >
            {isActive ? (
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleDeactivate}
                  className="w-full py-4 rounded-2xl border-2 border-destructive/40 bg-destructive/10 text-destructive font-black text-sm hover:bg-destructive/20 transition-all flex items-center justify-center gap-2 tracking-wide"
                >
                  <VolumeX className="w-5 h-5" /> KILL SWITCH
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleActivate}
                disabled={permission !== "granted"}
                className={`w-full py-4 rounded-2xl ${currentVibe.accent} text-primary-foreground font-black text-sm shadow-xl ${currentVibe.glow} transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed tracking-widest`}
              >
                <Zap className="w-5 h-5" /> DEPLOY REMINDERS
              </motion.button>
            )}
          </motion.div>

        </div>
      </div>
    </PageTransition>
  );
};

export default RemindersPage;
