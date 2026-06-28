import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Traffic ,Admin" };

function getLast30Days(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default async function TrafficPage() {
  const last30 = getLast30Days();
  const today = last30[last30.length - 1];
  const sevenDaysAgo = last30[last30.length - 7];

  const rows = await prisma.pageView.findMany({
    where: { date: { gte: last30[0] } },
    orderBy: { date: "asc" },
  });

  const countMap = Object.fromEntries(rows.map((r) => [r.date, r.count]));
  const data = last30.map((date) => ({ date, count: countMap[date] ?? 0 }));

  const todayViews = countMap[today] ?? 0;
  const last7Total = last30.slice(-7).reduce((sum, d) => sum + (countMap[d] ?? 0), 0);
  const last30Total = last30.reduce((sum, d) => sum + (countMap[d] ?? 0), 0);
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  // 7-day avg
  const prev7Total = last30.slice(-14, -7).reduce((sum, d) => sum + (countMap[d] ?? 0), 0);
  const trend = prev7Total === 0 ? null : Math.round(((last7Total - prev7Total) / prev7Total) * 100);

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Website Traffic</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">{todayViews.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-0.5">Today&apos;s page views</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900">{last7Total.toLocaleString()}</p>
            {trend !== null && (
              <span className={`text-xs font-semibold ${trend >= 0 ? "text-green-500" : "text-red-400"}`}>
                {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Last 7 days</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">{last30Total.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-0.5">Last 30 days</p>
        </div>
      </div>

      {/* Bar chart ,last 30 days */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-800">Daily page views ,last 30 days</h2>
          <p className="text-xs text-gray-400">Each bar = one day</p>
        </div>

        <div className="flex items-end gap-[3px] h-48 w-full">
          {data.map(({ date, count }) => {
            const heightPct = maxCount === 0 ? 0 : Math.max((count / maxCount) * 100, count > 0 ? 4 : 0);
            const isToday = date === today;
            return (
              <div
                key={date}
                className="flex-1 flex flex-col items-center justify-end group relative"
                style={{ minWidth: 0 }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {formatDate(date)}: {count.toLocaleString()} views
                </div>
                <div
                  className={`w-full rounded-t-sm transition-all ${
                    isToday ? "bg-[#8B1A2F]" : "bg-blue-400 group-hover:bg-blue-500"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* X-axis labels ,show every 5 days */}
        <div className="flex items-center gap-[3px] mt-2">
          {data.map(({ date }, i) => (
            <div key={date} className="flex-1 text-center" style={{ minWidth: 0 }}>
              {(i === 0 || i % 5 === 0 || i === data.length - 1) && (
                <span className="text-[9px] text-gray-400 whitespace-nowrap">
                  {formatDate(date)}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#8B1A2F] inline-block" /> Today
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" /> Previous days
          </span>
        </div>
      </div>

      {/* Peak day */}
      {rows.length > 0 && (() => {
        const peak = rows.reduce((best, r) => (r.count > best.count ? r : best), rows[0]);
        return (
          <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">
              Peak day in last 30 days:{" "}
              <strong className="text-gray-800">{formatDate(peak.date)}</strong>
              {" "}with{" "}
              <strong className="text-gray-800">{peak.count.toLocaleString()} page views</strong>
            </p>
          </div>
        );
      })()}

      {rows.length === 0 && (
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 text-sm">
          No traffic data yet ,data will appear as visitors browse your store.
        </div>
      )}
    </div>
  );
}
