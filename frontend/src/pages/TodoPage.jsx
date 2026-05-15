import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Circle,
  Flame,
  Loader2,
  Plus,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trash2,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import API_URL from "@/config";
import { useAuth } from "@/contexts/AuthContext";

const QUEST_RARITIES = ["Common", "Rare", "Epic", "Legendary"];
const RARITY_STYLES = {
  Common: {
    border: "border-slate-400/20",
    cardBg: "from-slate-50/80 to-slate-100/40 dark:from-slate-800/30 dark:to-slate-900/20",
    badgeBg: "bg-slate-100 text-slate-500",
    accent: "text-slate-500",
    icon: "C",
    xp: 10,
    stripe: "from-slate-400/20 via-slate-300/10 to-transparent",
  },
  Rare: {
    border: "border-blue-400/30",
    cardBg: "from-blue-50/80 to-sky-50/40 dark:from-blue-900/20 dark:to-sky-900/10",
    badgeBg: "bg-blue-100 text-blue-600",
    accent: "text-blue-500",
    icon: "R",
    xp: 10,
    stripe: "from-blue-400/20 via-blue-300/10 to-transparent",
  },
  Epic: {
    border: "border-purple-400/30",
    cardBg: "from-purple-50/80 to-fuchsia-50/40 dark:from-purple-900/20 dark:to-fuchsia-900/10",
    badgeBg: "bg-purple-100 text-purple-600",
    accent: "text-purple-500",
    icon: "E",
    xp: 10,
    stripe: "from-purple-400/25 via-purple-300/10 to-transparent",
  },
  Legendary: {
    border: "border-amber-400/40",
    cardBg: "from-amber-50/80 to-yellow-50/40 dark:from-amber-900/20 dark:to-yellow-900/10",
    badgeBg: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700",
    accent: "text-amber-500",
    icon: "L",
    xp: 50,
    stripe: "from-amber-400/30 via-yellow-300/15 to-transparent",
  },
};

const getProgressColor = (pct) => {
  if (pct >= 80) return "from-emerald-400 to-green-500";
  if (pct >= 50) return "from-blue-400 to-cyan-500";
  if (pct >= 25) return "from-amber-400 to-orange-500";
  return "from-red-400 to-rose-500";
};

const normalizeQuest = (quest) => ({
  ...quest,
  id: quest._id || quest.id,
  percentage: Number.isFinite(Number(quest.percentage)) ? Number(quest.percentage) : 0,
  rewardClaimed: Boolean(quest.rewardClaimed),
  rarity: QUEST_RARITIES.includes(quest.rarity) ? quest.rarity : "Common",
});

const QuestCard = ({ task, rarity, isComplete, onToggle, onRemove, onUpdatePercentage }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -60, scale: 0.85, filter: "blur(4px)" }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`relative rounded-2xl border ${rarity.border} overflow-hidden group transition-shadow duration-300 ${
        isComplete ? "opacity-60 hover:opacity-80" : "hover:shadow-lg hover:shadow-primary/5"
      }`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${rarity.stripe}`} />

      <div className={`relative bg-gradient-to-br ${rarity.cardBg} backdrop-blur-sm p-5`}>
        <div className="absolute top-3 right-4 text-3xl opacity-[0.06] pointer-events-none select-none">
          {rarity.icon}
        </div>

        <div className="flex items-start gap-3.5">
          <motion.button
            type="button"
            whileTap={{ scale: 0.7, rotate: -10 }}
            onClick={onToggle}
            className="mt-0.5 shrink-0"
          >
            {isComplete ? (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CheckCircle className="w-6 h-6 text-emerald-500 drop-shadow-sm" />
              </motion.div>
            ) : (
              <Circle className="w-6 h-6 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
            )}
          </motion.button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-md ${rarity.badgeBg} inline-flex items-center gap-1`}>
                {rarity.icon} {task.rarity}
              </span>
              <span className="text-[9px] text-muted-foreground font-medium">+{rarity.xp} XP</span>
            </div>
            <p className={`font-display font-bold text-[15px] leading-snug ${isComplete ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">{task.description}</p>
            )}

            <div className="mt-3.5 flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-secondary/80 overflow-hidden relative">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(task.percentage)} relative`}
                  initial={{ width: 0 }}
                  animate={{ width: `${task.percentage}%` }}
                  transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {task.percentage > 15 && (
                    <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/30 blur-[2px] rounded-full" />
                  )}
                </motion.div>
              </div>
              <div className="flex items-center bg-secondary/60 rounded-lg border border-border/30 overflow-hidden">
                <button
                  type="button"
                  onClick={() => onUpdatePercentage(task.id, Math.max(0, task.percentage - 10))}
                  className="px-1.5 py-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-xs"
                >
                  -
                </button>
                <span className="text-xs font-display font-bold text-foreground w-9 text-center tabular-nums">
                  {task.percentage}%
                </span>
                <button
                  type="button"
                  onClick={() => onUpdatePercentage(task.id, Math.min(100, task.percentage + 10))}
                  className="px-1.5 py-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-xs"
                >
                  +
                </button>
              </div>
            </div>

            <AnimatePresence>
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 mt-3"
                >
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-200/50">
                    <Sparkles className="w-3 h-3" /> Complete
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      task.rewardClaimed
                        ? "text-muted-foreground bg-secondary/60 border-border/50"
                        : "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-200/50"
                    }`}
                  >
                    <Zap className="w-3 h-3" /> {task.rewardClaimed ? "Claimed" : `+${rarity.xp} XP ready`}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => onRemove(task.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/30 hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/5"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const TodoPage = () => {
  const { user, session, loading: authLoading, refreshProfile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("Common");
  const [filter, setFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const token = session?.access_token || localStorage.getItem("access_token");

  useEffect(() => {
    if (authLoading) return;

    if (!user || !token) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    const loadQuests = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/quests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load quests");
        const data = await res.json();
        setTasks(data.map(normalizeQuest));
      } catch (err) {
        console.error(err);
        toast.error("Could not load your quests");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuests();
  }, [authLoading, token, user]);

  const addTask = async () => {
    if (!newTitle.trim()) return;
    if (!user || !token) {
      toast.error("Sign in to create private quests");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch(`${API_URL}/api/quests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          rarity: selectedRarity,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create quest");

      setTasks((current) => [normalizeQuest(data), ...current]);
      setNewTitle("");
      setNewDesc("");
      setShowAddForm(false);
    } catch (err) {
      toast.error(err.message || "Could not create quest");
    } finally {
      setIsCreating(false);
    }
  };

  const updatePercentage = async (id, value) => {
    if (!token) return;
    const percentage = Math.min(100, Math.max(0, value));
    const previousTasks = tasks;

    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, percentage } : task
      )
    );

    try {
      const res = await fetch(`${API_URL}/api/quests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ percentage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update quest");

      setTasks((current) => current.map((task) => (task.id === id ? normalizeQuest(data) : task)));
    } catch (err) {
      setTasks(previousTasks);
      toast.error(err.message || "Could not update quest");
    }
  };

  const toggleComplete = (id) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    updatePercentage(id, task.percentage === 100 ? 0 : 100);
  };

  const removeTask = async (id) => {
    if (!token) return;
    const previousTasks = tasks;
    setTasks((current) => current.filter((task) => task.id !== id));

    try {
      const res = await fetch(`${API_URL}/api/quests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete quest");
    } catch (err) {
      setTasks(previousTasks);
      toast.error(err.message || "Could not delete quest");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return task.percentage < 100;
    if (filter === "completed") return task.percentage === 100;
    return true;
  });

  const overallPercentage =
    tasks.length > 0
      ? Math.round(tasks.reduce((sum, task) => sum + task.percentage, 0) / tasks.length)
      : 0;
  const completedCount = tasks.filter((task) => task.percentage === 100).length;
  const pendingClaimXP = tasks
    .filter((task) => task.percentage === 100 && !task.rewardClaimed)
    .reduce((sum, task) => sum + (RARITY_STYLES[task.rarity]?.xp || 10), 0);

  const claimTotalXP = async () => {
    if (!token || pendingClaimXP <= 0 || isClaiming) return;

    setIsClaiming(true);
    try {
      const res = await fetch(`${API_URL}/api/quests/claim-xp`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to claim XP");

      const claimedIds = new Set((data.claimedQuestIds || []).map(String));
      setTasks((current) =>
        current.map((task) =>
          claimedIds.has(String(task.id)) ? { ...task, rewardClaimed: true } : task
        )
      );

      await refreshProfile();
      toast.success(`Claimed ${data.xpGain} XP`);
    } catch (err) {
      toast.error(err.message || "Could not claim XP");
    } finally {
      setIsClaiming(false);
    }
  };

  const circumference = 2 * Math.PI * 44;
  const strokeDash = (overallPercentage / 100) * circumference;
  const progressColor =
    overallPercentage >= 80
      ? "#10b981"
      : overallPercentage >= 50
        ? "hsl(var(--primary))"
        : overallPercentage >= 25
          ? "#f59e0b"
          : "#ef4444";

  return (
    <PageTransition>
      <div className="min-h-screen p-4 md:p-8 pt-20 max-w-3xl mx-auto space-y-5">
        {!authLoading && !user && (
          <div className="glass rounded-2xl p-5 soft-shadow border border-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-display font-bold text-foreground">Your quest board is private</p>
              <p className="text-xs text-muted-foreground mt-1">
                Sign in to create quests that only your account can see.
              </p>
            </div>
            <Link
              to="/signin"
              className="inline-flex items-center justify-center bg-foreground text-background px-4 py-2 rounded-xl text-xs font-bold shadow-md"
            >
              Sign In
            </Link>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-between"
        >
          <div>
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2"
            >
              <Swords className="w-3.5 h-3.5" />
              Quest Board
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-display font-black text-foreground tracking-tight leading-none">
              Daily Quests
            </h1>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-xl font-display font-bold text-sm shadow-lg"
          >
            <Plus className="w-4 h-4" /> New Quest
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="overflow-hidden"
            >
              <div className="glass rounded-2xl p-5 soft-shadow border border-primary/10 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-xs font-display font-bold text-foreground">Create Quest</span>
                </div>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="Quest objective..."
                  className="w-full bg-background text-foreground rounded-xl px-4 py-3 text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 border border-border/50"
                  onKeyDown={(event) => event.key === "Enter" && addTask()}
                  autoFocus
                />
                <input
                  type="text"
                  value={newDesc}
                  onChange={(event) => setNewDesc(event.target.value)}
                  placeholder="Details (optional)..."
                  className="w-full bg-background/50 text-foreground rounded-xl px-4 py-2.5 text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 border border-border/30"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    Rarity:
                  </span>
                  {QUEST_RARITIES.map((rarityName) => {
                    const rarityStyle = RARITY_STYLES[rarityName];
                    return (
                      <motion.button
                        type="button"
                        key={rarityName}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setSelectedRarity(rarityName)}
                        className={`relative px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                          selectedRarity === rarityName
                            ? `${rarityStyle.badgeBg} shadow-sm`
                            : "text-muted-foreground/60 hover:text-foreground bg-secondary/50"
                        }`}
                      >
                        {rarityStyle.icon} {rarityName}
                      </motion.button>
                    );
                  })}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={addTask}
                    disabled={isCreating}
                    className="flex-1 bg-foreground text-background px-4 py-2 rounded-xl text-xs font-bold shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isCreating ? "Creating..." : "Create Quest"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="flex items-center gap-4 p-4 glass rounded-2xl soft-shadow"
        >
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--secondary))" strokeWidth="7" />
              <motion.circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke={progressColor}
                strokeWidth="7"
                strokeLinecap="round"
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${strokeDash} ${circumference}` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-display font-black text-foreground leading-none">
                {overallPercentage}%
              </span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-3 gap-2">
            {[
              {
                icon: <Target className="w-3.5 h-3.5 text-primary" />,
                val: `${completedCount}/${tasks.length}`,
                label: "Quests",
              },
              {
                icon: <Zap className="w-3.5 h-3.5 text-amber-500" />,
                val: pendingClaimXP,
                label: "Claimable",
              },
              {
                icon: <Flame className="w-3.5 h-3.5 text-orange-500" />,
                val: overallPercentage >= 75 ? "High" : overallPercentage >= 50 ? "Mid" : overallPercentage >= 25 ? "Low" : "New",
                label: "Streak",
              },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex justify-center mb-1">{stat.icon}</div>
                <p className="text-sm font-display font-black text-foreground leading-none">{stat.val}</p>
                <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1 bg-secondary/60 rounded-xl p-0.5 border border-border/30">
            {[
              { key: "all", label: "All", count: tasks.length },
              { key: "active", label: "Active", count: tasks.length - completedCount },
              { key: "completed", label: "Done", count: completedCount },
            ].map((filterItem) => (
              <button
                type="button"
                key={filterItem.key}
                onClick={() => setFilter(filterItem.key)}
                className="relative px-3.5 py-1.5 rounded-[10px] text-xs font-bold transition-all"
              >
                {filter === filterItem.key && (
                  <motion.div
                    layoutId="quest-f"
                    className="absolute inset-0 bg-foreground rounded-[10px]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span
                  className={`relative z-10 flex items-center gap-1.5 ${
                    filter === filterItem.key ? "text-background" : "text-muted-foreground"
                  }`}
                >
                  {filterItem.label}
                  <span className={`text-[9px] ${filter === filterItem.key ? "text-background/60" : "text-muted-foreground/50"}`}>
                    {filterItem.count}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {pendingClaimXP > 0 && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={claimTotalXP}
                disabled={isClaiming}
                className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-display font-bold shadow-md shadow-amber-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isClaiming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Claim Total XP
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm font-medium">Loading quests...</span>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => {
                const rarity = RARITY_STYLES[task.rarity] || RARITY_STYLES.Common;
                return (
                  <QuestCard
                    key={task.id}
                    task={task}
                    rarity={rarity}
                    isComplete={task.percentage === 100}
                    onToggle={() => toggleComplete(task.id)}
                    onRemove={removeTask}
                    onUpdatePercentage={updatePercentage}
                  />
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {!isLoading && filteredTasks.length === 0 && user && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl mb-5 inline-block"
            >
              {filter === "completed" ? "Done" : filter === "active" ? "Clear" : "Start"}
            </motion.div>
            <p className="font-display font-black text-foreground text-xl">
              {filter === "completed" ? "No trophies yet" : filter === "active" ? "All quests conquered!" : "Quest board is empty"}
            </p>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              {filter === "active" ? "You've completed everything! Add more quests to keep the streak going." : "Tap 'New Quest' to begin your adventure."}
            </p>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default TodoPage;
