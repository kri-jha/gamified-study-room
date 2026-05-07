import { getStreakLevel } from "./ranks";

export const mockUser = {
  name: "Alex Johnson",
  email: "alex@productivity.io",
  avatar: "",
  contactNo: "+1 234 567 8900",
  aboutMe: "Grinding DSA & System Design 🚀 | Competitive programmer | Building cool stuff every day",
  totalStudyHours: 342,
  points: 15420,
  currentStreak: 23,
  maxStreak: 67,
  countryRank: 1247,
  friendRank: 3,
  friendsCount: 18,
};

export function generateStreakData() {
  const data = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    let percentage = 0;
    if (Math.random() > 0.25) {
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        percentage = Math.floor(Math.random() * 60) + 40;
      } else {
        percentage = Math.floor(Math.random() * 80) + 20;
      }
    }
    data.push({
      date: date.toISOString().split("T")[0],
      percentage,
      level: getStreakLevel(percentage),
    });
  }
  return data;
}

const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Weekly: last 7 days with day labels (Mon, Tue, etc.)
 * Returns empty data for real users — no fake hours.
 */
export function generateWeeklyData() {
  const data = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      name: DAY_NAMES_SHORT[date.getDay()],
      fullDate: date.toISOString().split("T")[0],
      hours: 0,
      tasks: 0,
    });
  }
  return data;
}

/**
 * Monthly: last 30 days grouped by date label (e.g. "Mar 1", "Mar 2")
 */
export function generateMonthlyData() {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      name: `${MONTH_NAMES_SHORT[date.getMonth()]} ${date.getDate()}`,
      fullDate: date.toISOString().split("T")[0],
      hours: 0,
      tasks: 0,
    });
  }
  return data;
}

/**
 * Yearly: last 365 days grouped by month
 */
export function generateYearlyData() {
  const data = [];
  const today = new Date();
  const monthMap = {};

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = `${MONTH_NAMES_SHORT[date.getMonth()]} ${date.getFullYear()}`;
    if (!monthMap[key]) {
      monthMap[key] = { name: MONTH_NAMES_SHORT[date.getMonth()], hours: 0, tasks: 0 };
    }
  }

  for (const key of Object.keys(monthMap)) {
    data.push(monthMap[key]);
  }
  return data;
}

export const mockTodos = [
  { id: "1", title: "Binary Trees - Chapter 5", description: "Complete all practice problems", percentage: 75, createdAt: new Date().toISOString() },
  { id: "2", title: "System Design - Load Balancer", description: "Watch video + notes", percentage: 40, createdAt: new Date().toISOString() },
  { id: "3", title: "React Hooks Deep Dive", description: "useEffect, useMemo, useCallback", percentage: 100, createdAt: new Date().toISOString() },
  { id: "4", title: "LeetCode Daily Challenge", description: "Solve 3 medium problems", percentage: 33, createdAt: new Date().toISOString() },
];
