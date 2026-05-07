import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar,
} from "recharts";
import { useState, useMemo } from "react";
import { generateWeeklyData, generateMonthlyData, generateYearlyData } from "@/lib/mockData";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, TrendingUp, BarChart3, Flame, Target } from "lucide-react";

const COLORS = {
  primary: "hsl(var(--primary))",
  accent: "hsl(160, 60%, 45%)",
  purple: "hsl(260, 60%, 55%)",
  orange: "hsl(25, 90%, 55%)",
  grid: "hsl(220, 15%, 92%)",
  axis: "hsl(220, 10%, 60%)",
  blue: "hsl(220, 80%, 55%)",
};

const PIE_COLORS = [COLORS.primary, COLORS.accent, COLORS.purple, COLORS.orange];

const PERIOD_CONFIG = {
  weekly: { label: "7D", subtitle: "Last 7 days" },
  monthly: { label: "30D", subtitle: "Last 30 days" },
  yearly: { label: "1Y", subtitle: "Last 365 days" },
};

const pieData = [
  { name: "Study", value: 65 },
  { name: "Practice", value: 20 },
  { name: "Review", value: 10 },
  { name: "Break", value: 5 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-foreground/90 backdrop-blur-xl rounded-lg px-3 py-2 shadow-xl border-0">
      <p className="text-[10px] font-display font-bold text-background">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[11px] text-background/70">
          {p.name}: <span className="font-bold text-background">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const GlowStatCard = ({ icon: Icon, label, value, gradient, iconBg, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 200, damping: 15 }}
    className="relative group"
  >
    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`} />
    <div className="relative rounded-2xl p-4 border border-border/50 bg-background/50 backdrop-blur-sm hover:border-border transition-all overflow-hidden">
      {/* Subtle background pattern */}
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br ${gradient} opacity-[0.07] -translate-y-6 translate-x-6`} />
      
      <div className={`inline-flex p-2 rounded-xl ${iconBg} mb-3`}>
        <Icon className="w-4 h-4" />
      </div>
      <motion.p
        className="text-2xl font-display font-black text-foreground leading-none"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.1 }}
      >
        {value}
      </motion.p>
      <p className="text-[10px] text-muted-foreground font-semibold mt-1 uppercase tracking-widest">{label}</p>
    </div>
  </motion.div>
);

const ProductivityCharts = () => {
  const [period, setPeriod] = useState("weekly");

  const data = useMemo(() => {
    if (period === "weekly") return generateWeeklyData();
    if (period === "monthly") return generateMonthlyData();
    return generateYearlyData();
  }, [period]);

  const totalHours = data.reduce((s, d) => s + d.hours, 0);
  const totalTasks = data.reduce((s, d) => s + d.tasks, 0);
  const avgHours = data.length > 0 ? (totalHours / data.length) : 0;
  const bestDay = data.reduce((best, d) => (d.hours > best.hours ? d : best), data[0]);
  const config = PERIOD_CONFIG[period];

  const tickFormatter = period === "monthly"
    ? (val, idx) => (idx % 5 === 0 ? val : "")
    : undefined;

  // Radial data for focus score
  const focusScore = Math.min(100, Math.round(totalHours * 2.5));
  const radialData = [{ value: focusScore, fill: COLORS.primary }];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2.5 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10"
            whileHover={{ scale: 1.05 }}
          >
            <BarChart3 className="w-5 h-5 text-primary" />
          </motion.div>
          <div>
            <h3 className="font-display text-lg font-extrabold text-foreground tracking-tight">Productivity</h3>
            <p className="text-[10px] text-muted-foreground font-medium">{config.subtitle}</p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-0.5 bg-secondary/80 rounded-xl p-1 border border-border/40 backdrop-blur-sm">
          {Object.entries(PERIOD_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className="relative px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
            >
              {period === key && (
                <motion.div
                  layoutId="prod-pill"
                  className="absolute inset-0 bg-foreground rounded-lg"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              <span className={`relative z-10 ${period === key ? "text-background" : "text-muted-foreground"}`}>
                {cfg.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlowStatCard icon={Clock} label="Hours" value={totalHours.toFixed(1)} gradient="from-blue-500/20 to-cyan-500/20" iconBg="bg-blue-500/10 text-blue-500" delay={0} />
        <GlowStatCard icon={CheckCircle2} label="Tasks" value={totalTasks} gradient="from-emerald-500/20 to-green-500/20" iconBg="bg-emerald-500/10 text-emerald-500" delay={0.05} />
        <GlowStatCard icon={TrendingUp} label="Daily Avg" value={avgHours.toFixed(1) + "h"} gradient="from-violet-500/20 to-purple-500/20" iconBg="bg-violet-500/10 text-violet-500" delay={0.1} />
        <GlowStatCard icon={Flame} label="Peak" value={bestDay?.hours > 0 ? bestDay.hours + "h" : "--"} gradient="from-orange-500/20 to-amber-500/20" iconBg="bg-orange-500/10 text-orange-500" delay={0.15} />
      </div>

      {/* Charts */}
      <AnimatePresence mode="wait">
        <motion.div
          key={period}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Study Hours Area Chart */}
          <div className="glass rounded-2xl p-5 soft-shadow overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -translate-y-10 translate-x-10" />
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-display font-bold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Study Hours
              </p>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hoursGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.3} />
                      <stop offset="50%" stopColor={COLORS.primary} stopOpacity={0.08} />
                      <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                  <XAxis dataKey="name" stroke={COLORS.axis} fontSize={10} tickLine={false} axisLine={false} tickFormatter={tickFormatter} />
                  <YAxis stroke={COLORS.axis} fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke={COLORS.primary}
                    fill="url(#hoursGrad2)"
                    strokeWidth={2.5}
                    dot={period === "weekly" ? { r: 5, fill: "hsl(var(--background))", strokeWidth: 2.5, stroke: COLORS.primary } : false}
                    activeDot={{ r: 6, strokeWidth: 3, stroke: "hsl(var(--background))", fill: COLORS.primary }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom row: Bar chart + Radial + Pie */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tasks Bar */}
            <div className="glass rounded-2xl p-5 soft-shadow md:col-span-1 overflow-hidden relative">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full translate-y-10 -translate-x-10" />
              <p className="text-xs font-display font-bold text-foreground flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Tasks
              </p>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                    <XAxis dataKey="name" stroke={COLORS.axis} fontSize={9} tickLine={false} axisLine={false} tickFormatter={tickFormatter} />
                    <YAxis stroke={COLORS.axis} fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="tasks" radius={[6, 6, 0, 0]} maxBarSize={period === "yearly" ? 30 : period === "monthly" ? 10 : 24}>
                      {data.map((_, i) => (
                        <Cell key={i} fill={`hsl(160, ${50 + (i * 3)}%, ${40 + (i * 2)}%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Focus Score Radial */}
            <div className="glass rounded-2xl p-5 soft-shadow flex flex-col items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />
              <p className="text-xs font-display font-bold text-foreground flex items-center gap-2 mb-2 self-start">
                <Target className="w-3.5 h-3.5 text-primary" />
                Focus Score
              </p>
              <div className="h-36 w-36 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={radialData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar
                      background={{ fill: "hsl(var(--secondary))" }}
                      dataKey="value"
                      cornerRadius={10}
                      fill={COLORS.primary}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    className="text-3xl font-display font-black text-foreground"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    {focusScore}
                  </motion.span>
                  <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-widest">Score</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {focusScore >= 80 ? "🔥 On fire!" : focusScore >= 50 ? "💪 Good pace" : focusScore > 0 ? "🌱 Getting started" : "⏳ Start studying!"}
              </p>
            </div>

            {/* Pie Chart */}
            <div className="glass rounded-2xl p-5 soft-shadow overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-violet-500/5 to-transparent rounded-full -translate-y-6 translate-x-6" />
              <p className="text-xs font-display font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                Distribution
              </p>
              <div className="flex items-center gap-4">
                <div className="h-32 w-32 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={52}
                        paddingAngle={5}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2.5">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                      <span className="text-[11px] text-muted-foreground leading-none">{d.name}</span>
                      <span className="text-[11px] font-bold text-foreground ml-auto">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProductivityCharts;
