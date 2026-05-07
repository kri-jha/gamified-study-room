export const RANKS = [
  { name: "Bronze V", tier: "Bronze", division: "V", minHours: 0, maxHours: 10, color: "rank-bronze" },
  { name: "Bronze IV", tier: "Bronze", division: "IV", minHours: 10, maxHours: 20, color: "rank-bronze" },
  { name: "Bronze III", tier: "Bronze", division: "III", minHours: 20, maxHours: 30, color: "rank-bronze" },
  { name: "Bronze II", tier: "Bronze", division: "II", minHours: 30, maxHours: 40, color: "rank-bronze" },
  { name: "Bronze I", tier: "Bronze", division: "I", minHours: 40, maxHours: 50, color: "rank-bronze" },
  { name: "Silver V", tier: "Silver", division: "V", minHours: 50, maxHours: 70, color: "rank-silver" },
  { name: "Silver IV", tier: "Silver", division: "IV", minHours: 70, maxHours: 90, color: "rank-silver" },
  { name: "Silver III", tier: "Silver", division: "III", minHours: 90, maxHours: 120, color: "rank-silver" },
  { name: "Silver II", tier: "Silver", division: "II", minHours: 120, maxHours: 150, color: "rank-silver" },
  { name: "Silver I", tier: "Silver", division: "I", minHours: 150, maxHours: 180, color: "rank-silver" },
  { name: "Gold V", tier: "Gold", division: "V", minHours: 180, maxHours: 230, color: "rank-gold" },
  { name: "Gold IV", tier: "Gold", division: "IV", minHours: 230, maxHours: 290, color: "rank-gold" },
  { name: "Gold III", tier: "Gold", division: "III", minHours: 290, maxHours: 360, color: "rank-gold" },
  { name: "Gold II", tier: "Gold", division: "II", minHours: 360, maxHours: 440, color: "rank-gold" },
  { name: "Gold I", tier: "Gold", division: "I", minHours: 440, maxHours: 530, color: "rank-gold" },
  { name: "Platinum V", tier: "Platinum", division: "V", minHours: 530, maxHours: 650, color: "rank-platinum" },
  { name: "Platinum IV", tier: "Platinum", division: "IV", minHours: 650, maxHours: 800, color: "rank-platinum" },
  { name: "Platinum III", tier: "Platinum", division: "III", minHours: 800, maxHours: 950, color: "rank-platinum" },
  { name: "Platinum II", tier: "Platinum", division: "II", minHours: 950, maxHours: 1100, color: "rank-platinum" },
  { name: "Platinum I", tier: "Platinum", division: "I", minHours: 1100, maxHours: 1250, color: "rank-platinum" },
  { name: "Diamond V", tier: "Diamond", division: "V", minHours: 1250, maxHours: 1400, color: "rank-diamond" },
  { name: "Diamond IV", tier: "Diamond", division: "IV", minHours: 1400, maxHours: 1550, color: "rank-diamond" },
  { name: "Diamond III", tier: "Diamond", division: "III", minHours: 1550, maxHours: 1700, color: "rank-diamond" },
  { name: "Diamond II", tier: "Diamond", division: "II", minHours: 1700, maxHours: 1850, color: "rank-diamond" },
  { name: "Diamond I", tier: "Diamond", division: "I", minHours: 1850, maxHours: 2000, color: "rank-diamond" },
  { name: "Crown V", tier: "Crown", division: "V", minHours: 2000, maxHours: 2050, color: "rank-crown" },
  { name: "Crown IV", tier: "Crown", division: "IV", minHours: 2050, maxHours: 2100, color: "rank-crown" },
  { name: "Crown III", tier: "Crown", division: "III", minHours: 2100, maxHours: 2130, color: "rank-crown" },
  { name: "Crown II", tier: "Crown", division: "II", minHours: 2130, maxHours: 2160, color: "rank-crown" },
  { name: "Crown I", tier: "Crown", division: "I", minHours: 2160, maxHours: 2199, color: "rank-crown" },
  { name: "Ace", tier: "Ace", division: "", minHours: 2199, maxHours: 2199.5, color: "rank-ace" },
  { name: "Ace Master", tier: "Ace Master", division: "", minHours: 2199.5, maxHours: 2199.9, color: "rank-ace" },
  { name: "Conqueror", tier: "Conqueror", division: "", minHours: 2200, maxHours: Infinity, color: "rank-conqueror" },
];

export function getRank(hours) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (hours >= RANKS[i].minHours) return RANKS[i];
  }
  return RANKS[0];
}

export function getRankProgress(hours) {
  const rank = getRank(hours);
  if (rank.maxHours === Infinity) return 100;
  const range = rank.maxHours - rank.minHours;
  return Math.min(100, ((hours - rank.minHours) / range) * 100);
}

export function getNextRank(hours) {
  const current = getRank(hours);
  const idx = RANKS.indexOf(current);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

export function getStreakLevel(percentage) {
  if (percentage === 0) return 0;
  if (percentage <= 25) return 1;
  if (percentage <= 50) return 2;
  if (percentage <= 75) return 3;
  return 4;
}

export const RANK_ICONS = {
  Bronze: "🥉",
  Silver: "🥈",
  Gold: "🥇",
  Platinum: "💎",
  Diamond: "💠",
  Crown: "👑",
  Ace: "🔥",
  "Ace Master": "⚡",
  Conqueror: "🏆",
};
