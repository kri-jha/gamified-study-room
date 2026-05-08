import { getRank, getRankProgress, getNextRank } from "@/lib/ranks";
import { motion } from "framer-motion";

const TIER_STYLES = {
  Bronze: {
    bg: "bg-gradient-to-br from-amber-900 via-amber-700 to-yellow-800",
    glow: "shadow-[0_0_30px_rgba(180,83,9,0.5),inset_0_1px_0_rgba(255,255,255,0.15)]",
    text: "text-amber-100",
    bar: "from-amber-700 to-amber-400",
    icon: "⚔️",
    border: "border-amber-500/40",
    particles: "bg-amber-400",
    ring: "ring-amber-600/30",
  },
  Silver: {
    bg: "bg-gradient-to-br from-slate-600 via-gray-400 to-slate-500",
    glow: "shadow-[0_0_30px_rgba(148,163,184,0.5),inset_0_1px_0_rgba(255,255,255,0.25)]",
    text: "text-white",
    bar: "from-slate-500 to-slate-300",
    icon: "🛡️",
    border: "border-slate-300/40",
    particles: "bg-slate-300",
    ring: "ring-slate-400/30",
  },
  Gold: {
    bg: "bg-gradient-to-br from-yellow-600 via-amber-400 to-yellow-500",
    glow: "shadow-[0_0_40px_rgba(234,179,8,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]",
    text: "text-yellow-50",
    bar: "from-yellow-600 to-yellow-300",
    icon: "⚜️",
    border: "border-yellow-300/50",
    particles: "bg-yellow-300",
    ring: "ring-yellow-500/30",
  },
  Platinum: {
    bg: "bg-gradient-to-br from-cyan-600 via-teal-400 to-emerald-500",
    glow: "shadow-[0_0_40px_rgba(34,211,238,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]",
    text: "text-cyan-50",
    bar: "from-teal-500 to-cyan-300",
    icon: "💎",
    border: "border-cyan-300/50",
    particles: "bg-cyan-300",
    ring: "ring-cyan-400/30",
  },
  Diamond: {
    bg: "bg-gradient-to-br from-blue-600 via-indigo-500 to-violet-600",
    glow: "shadow-[0_0_45px_rgba(99,102,241,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]",
    text: "text-blue-50",
    bar: "from-indigo-500 to-blue-300",
    icon: "💠",
    border: "border-indigo-300/50",
    particles: "bg-indigo-300",
    ring: "ring-indigo-400/30",
  },
  Crown: {
    bg: "bg-gradient-to-br from-purple-700 via-fuchsia-500 to-pink-600",
    glow: "shadow-[0_0_50px_rgba(168,85,247,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]",
    text: "text-purple-50",
    bar: "from-purple-600 to-fuchsia-300",
    icon: "👑",
    border: "border-purple-300/50",
    particles: "bg-purple-300",
    ring: "ring-purple-400/30",
  },
  Ace: {
    bg: "bg-gradient-to-br from-orange-600 via-red-500 to-rose-700",
    glow: "shadow-[0_0_50px_rgba(239,68,68,0.6),inset_0_1px_0_rgba(255,255,255,0.15)]",
    text: "text-orange-50",
    bar: "from-red-600 to-orange-300",
    icon: "🔥",
    border: "border-red-400/50",
    particles: "bg-red-300",
    ring: "ring-red-500/30",
  },
  "Ace Master": {
    bg: "bg-gradient-to-br from-red-700 via-rose-500 to-pink-700",
    glow: "shadow-[0_0_55px_rgba(225,29,72,0.7),inset_0_1px_0_rgba(255,255,255,0.15)]",
    text: "text-red-50",
    bar: "from-rose-600 to-red-300",
    icon: "⚡",
    border: "border-rose-400/50",
    particles: "bg-rose-300",
    ring: "ring-rose-500/30",
  },
  Conqueror: {
    bg: "bg-gradient-to-br from-yellow-500 via-amber-400 to-yellow-600",
    glow: "shadow-[0_0_60px_rgba(250,204,21,0.7),0_0_120px_rgba(250,204,21,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]",
    text: "text-yellow-900",
    bar: "from-yellow-500 to-amber-200",
    icon: "🏆",
    border: "border-yellow-300/60",
    particles: "bg-yellow-200",
    ring: "ring-yellow-400/40",
  },
};

const FloatingParticle = ({ delay, style, className }) => (
  <motion.div
    className={`absolute w-1 h-1 rounded-full ${className}`}
    initial={{ opacity: 0, y: 0, x: 0 }}
    animate={{
      opacity: [0, 1, 0],
      y: [-2, -18],
      x: [0, (Math.random() - 0.5) * 20],
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 2,
    }}
    style={style}
  />
);

const RankBadge = ({ hours, showProgress = true, size = "md" }) => {
  const rank = getRank(hours);
  const progress = getRankProgress(hours);
  const nextRank = getNextRank(hours);
  const style = TIER_STYLES[rank.tier] || TIER_STYLES.Bronze;

  const sizeConfig = {
    sm: { wrapper: "gap-2", badge: "px-4 py-2 rounded-xl", icon: "text-2xl w-10 h-10", name: "text-xs", div: "text-[9px]", progress: "max-w-[160px]" },
    md: { wrapper: "gap-3", badge: "px-5 py-3 rounded-2xl", icon: "text-3xl w-12 h-12", name: "text-sm", div: "text-[10px]", progress: "max-w-[220px]" },
    lg: { wrapper: "gap-4", badge: "px-7 py-4 rounded-2xl", icon: "text-4xl w-14 h-14", name: "text-base", div: "text-xs", progress: "max-w-[260px]" },
  };
  const s = sizeConfig[size];

  return (
    <div className={`flex flex-col items-center ${s.wrapper}`}>
      {/* Outer glow ring */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
        className="relative"
      >
        {/* Animated ring behind badge */}
        <motion.div
          className={`absolute -inset-1 rounded-[20px] ${style.bg} opacity-20 blur-md`}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Main Badge */}
        <div
          className={`relative ${style.bg} ${style.glow} ${s.badge} flex items-center gap-3 border ${style.border} overflow-hidden ring-2 ${style.ring}`}
        >
          {/* Shimmer sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-[shimmer_3s_infinite] pointer-events-none" />

          {/* Floating particles */}
          {[...Array(5)].map((_, i) => (
            <FloatingParticle
              key={i}
              delay={i * 0.4}
              className={style.particles}
              style={{ left: `${15 + i * 18}%`, bottom: "20%" }}
            />
          ))}

          {/* Icon container with glow backdrop */}
          <div className="relative flex items-center justify-center">
            <motion.div
              className={`absolute inset-0 ${style.particles} opacity-20 rounded-full blur-lg`}
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className={`${s.icon} flex items-center justify-center relative z-10`}
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">{style.icon}</span>
            </motion.div>
          </div>

          {/* Rank text block */}
          <div className="relative z-10 flex flex-col leading-tight">
            <span className={`font-display font-black ${s.name} ${style.text} tracking-[0.15em] uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]`}>
              {rank.tier}
            </span>
            {rank.division && (
              <span className={`${s.div} ${style.text} opacity-70 font-bold tracking-[0.3em] mt-0.5`}>
                DIVISION {rank.division}
              </span>
            )}
          </div>

          {/* Corner decorations */}
          <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 ${style.border} rounded-tl-xl opacity-60`} />
          <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 ${style.border} rounded-br-xl opacity-60`} />
        </div>
      </motion.div>

      {/* XP Progress bar */}
      {showProgress && nextRank && (
        <div className={`w-full ${s.progress}`}>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5 font-semibold tracking-wide">
            <span className="uppercase">{rank.name}</span>
            <span className="uppercase opacity-60">{nextRank.name}</span>
          </div>
          <div className="relative h-3 rounded-full bg-secondary/60 overflow-hidden border border-border/40 backdrop-blur-sm">
            {/* Track glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.4 }}
              className={`h-full rounded-full bg-gradient-to-r ${style.bar} relative`}
            >
              {/* Inner shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
              {/* Tip glow */}
              <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/40 blur-sm rounded-full" />
            </motion.div>
          </div>
          <div className="flex justify-between items-center mt-1.5">
            <p className="text-[10px] text-muted-foreground font-medium">
              {hours.toFixed(1)}h studied
            </p>
            <p className="text-[10px] text-muted-foreground font-medium opacity-60">
              {nextRank.minHours}h needed
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankBadge;
