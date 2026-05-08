import { RANKS, getRank } from "@/lib/ranks";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, CheckCircle2, ChevronRight } from "lucide-react";

const TIER_META = {
  Bronze:      { icon: "⚔️", bg: "from-amber-900 via-amber-700 to-yellow-800", text: "text-amber-100", border: "border-amber-500/40", glow: "shadow-[0_0_15px_rgba(180,83,9,0.3)]" },
  Silver:      { icon: "🛡️", bg: "from-slate-600 via-gray-400 to-slate-500", text: "text-white", border: "border-slate-300/40", glow: "shadow-[0_0_15px_rgba(148,163,184,0.3)]" },
  Gold:        { icon: "⚜️", bg: "from-yellow-600 via-amber-400 to-yellow-500", text: "text-yellow-50", border: "border-yellow-300/50", glow: "shadow-[0_0_20px_rgba(234,179,8,0.4)]" },
  Platinum:    { icon: "💎", bg: "from-cyan-600 via-teal-400 to-emerald-500", text: "text-cyan-50", border: "border-cyan-300/50", glow: "shadow-[0_0_20px_rgba(34,211,238,0.4)]" },
  Diamond:     { icon: "💠", bg: "from-blue-600 via-indigo-500 to-violet-600", text: "text-blue-50", border: "border-indigo-300/50", glow: "shadow-[0_0_25px_rgba(99,102,241,0.4)]" },
  Crown:       { icon: "👑", bg: "from-purple-700 via-fuchsia-500 to-pink-600", text: "text-purple-50", border: "border-purple-300/50", glow: "shadow-[0_0_25px_rgba(168,85,247,0.4)]" },
  Ace:         { icon: "🔥", bg: "from-orange-600 via-red-500 to-rose-700", text: "text-orange-50", border: "border-red-400/50", glow: "shadow-[0_0_25px_rgba(239,68,68,0.4)]" },
  "Ace Master":{ icon: "⚡", bg: "from-red-700 via-rose-500 to-pink-700", text: "text-red-50", border: "border-rose-400/50", glow: "shadow-[0_0_30px_rgba(225,29,72,0.4)]" },
  Conqueror:   { icon: "🏆", bg: "from-yellow-500 via-amber-400 to-yellow-600", text: "text-yellow-900", border: "border-yellow-300/60", glow: "shadow-[0_0_40px_rgba(250,204,21,0.5)]" },
};

// Group ranks by tier
const groupedTiers = () => {
  const tiers = [];
  const seen = new Set();
  for (const r of RANKS) {
    if (!seen.has(r.tier)) {
      seen.add(r.tier);
      tiers.push({
        tier: r.tier,
        ranks: RANKS.filter((x) => x.tier === r.tier),
      });
    }
  }
  return tiers;
};

const AllRanksModal = ({ open, onClose, currentHours }) => {
  const currentRank = getRank(currentHours);
  const tiers = groupedTiers();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative w-full h-full md:w-[90vw] md:h-[90vh] md:max-w-5xl md:rounded-3xl bg-background border border-border overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
              <div>
                <h2 className="text-xl font-display font-extrabold text-foreground">All Ranks</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Study more hours to unlock higher ranks
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {tiers.map((group, gi) => {
                const meta = TIER_META[group.tier] || TIER_META.Bronze;
                const isTierUnlocked = currentHours >= group.ranks[0].minHours;

                return (
                  <motion.div
                    key={group.tier}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: gi * 0.05 }}
                  >
                    {/* Tier header */}
                    <div className={`flex items-center gap-3 mb-3`}>
                      <div
                        className={`bg-gradient-to-br ${meta.bg} ${meta.glow} rounded-xl px-3 py-1.5 flex items-center gap-2 border ${meta.border}`}
                      >
                        <span className="text-lg">{meta.icon}</span>
                        <span className={`font-display font-bold text-sm ${meta.text} tracking-wider uppercase`}>
                          {group.tier}
                        </span>
                      </div>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {group.ranks[0].minHours}h – {group.ranks[group.ranks.length - 1].maxHours === Infinity ? "∞" : `${group.ranks[group.ranks.length - 1].maxHours}h`}
                      </span>
                    </div>

                    {/* Divisions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {group.ranks.map((rank) => {
                        const isCurrentRank = rank.name === currentRank.name;
                        const isUnlocked = currentHours >= rank.minHours;

                        return (
                          <div
                            key={rank.name}
                            className={`relative rounded-xl px-4 py-3 flex items-center gap-3 border transition-all ${
                              isCurrentRank
                                ? `bg-gradient-to-br ${meta.bg} ${meta.border} ${meta.glow}`
                                : isUnlocked
                                ? "bg-secondary/50 border-border hover:bg-secondary/80"
                                : "bg-secondary/20 border-border/30 opacity-50"
                            }`}
                          >
                            {/* Status icon */}
                            <div className="shrink-0">
                              {isCurrentRank ? (
                                <motion.div
                                  animate={{ scale: [1, 1.15, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <ChevronRight className={`w-5 h-5 ${meta.text}`} />
                                </motion.div>
                              ) : isUnlocked ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Lock className="w-4 h-4 text-muted-foreground/50" />
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-display font-bold truncate ${
                                  isCurrentRank ? meta.text : "text-foreground"
                                }`}
                              >
                                {rank.name}
                              </p>
                              <p
                                className={`text-[10px] font-medium ${
                                  isCurrentRank ? `${meta.text} opacity-70` : "text-muted-foreground"
                                }`}
                              >
                                {rank.minHours}h – {rank.maxHours === Infinity ? "∞" : `${rank.maxHours}h`}
                              </p>
                            </div>

                            {/* Current badge */}
                            {isCurrentRank && (
                              <span className={`text-[9px] font-bold uppercase tracking-widest ${meta.text} opacity-80`}>
                                You
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AllRanksModal;
