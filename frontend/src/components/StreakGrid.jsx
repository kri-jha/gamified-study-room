import { useMemo } from "react";

const StreakGrid = ({ data }) => {
  const levelColors = [
    "bg-streak-0",
    "bg-streak-1",
    "bg-streak-2",
    "bg-streak-3",
    "bg-streak-4",
  ];

  const months = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group data by month
    const monthMap = new Map();
    data.forEach((day) => {
      const date = new Date(day.date);
      const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
      if (!monthMap.has(key)) {
        monthMap.set(key, { label: date.toLocaleString("default", { month: "short" }), days: [] });
      }
      monthMap.get(key).days.push(day);
    });

    // For each month, arrange days into weeks (columns of 7 rows)
    return Array.from(monthMap.entries()).map(([key, { label, days }]) => {
      const weeks = [];
      // Pad start: first day's weekday (0=Sun..6=Sat)
      const firstDow = new Date(days[0].date).getDay();
      let currentWeek = Array(firstDow).fill(null);

      days.forEach((day) => {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      });
      if (currentWeek.length > 0) {
        weeks.push(currentWeek);
      }

      return { key, label, weeks };
    });
  }, [data]);

  return (
    <div className="glass rounded-xl p-4 overflow-x-auto soft-shadow">
      <h3 className="font-display text-sm font-semibold text-foreground mb-3">
        📅 Study Streak
      </h3>
      <div className="flex gap-0 min-w-fit">
        {months.map((month, mi) => (
          <div key={month.key} className={mi > 0 ? "ml-3" : ""}>
            <div className="flex gap-[3px]">
              {month.weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((day, di) =>
                    day ? (
                      <div
                        key={di}
                        className={`w-[11px] h-[11px] rounded-[2px] ${levelColors[day.level]} transition-colors hover:ring-1 hover:ring-primary cursor-pointer`}
                        title={`${day.date}: ${day.percentage}% completed`}
                      />
                    ) : (
                      <div key={di} className="w-[11px] h-[11px]" />
                    )
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 text-center">{month.label}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
        <span>Less</span>
        {levelColors.map((c, i) => (
          <div key={i} className={`w-[11px] h-[11px] rounded-[2px] ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

export default StreakGrid;
