import { DesktopSidebar } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";
import { BarChart3, TrendingUp, Users, Ticket } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const weekData = [
  { day: "Mon", scans: 45 }, { day: "Tue", scans: 72 }, { day: "Wed", scans: 58 },
  { day: "Thu", scans: 89 }, { day: "Fri", scans: 103 }, { day: "Sat", scans: 140 }, { day: "Sun", scans: 97 },
];

const collegeData = [
  { name: "CCS", tickets: 320 }, { name: "COE", tickets: 280 }, { name: "CBA", tickets: 210 },
  { name: "CASS", tickets: 185 }, { name: "COS", tickets: 150 }, { name: "COED", tickets: 100 },
];

export default function AnalyticsDashboard() {
  return (
    <div className="flex min-h-screen bg-background transition-colors">
      <DesktopSidebar />

      <div className="flex-1 pb-20 pt-14 md:pt-0 md:pb-0 min-w-0">

        {/* HEADER */}
        <div className="bg-card border-b border-border px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
                Analytics
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Attendance insights & event data
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5">

          {/* STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: Ticket, label: "Total Tickets", value: "1,245", trend: "+12%" },
              { icon: Users, label: "Attendees", value: "1,180", trend: "+8%" },
              { icon: TrendingUp, label: "Success Rate", value: "98.5%", trend: "+0.3%" },
              { icon: BarChart3, label: "Active Events", value: "12", trend: "+3" },
            ].map(({ icon: Icon, label, value, trend }) => (
              <div key={label} className="bg-card rounded-xl border border-border p-4">
                <Icon className="w-5 h-5 text-primary mb-2" />
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-green-600 mt-1">{trend} this week</p>
              </div>
            ))}
          </div>

          {/* LINE CHART */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Weekly Scan Activity
            </h2>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekData}>

                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />

                  <XAxis
                    dataKey="day"
                    stroke="var(--muted-foreground)"
                    tick={{ fill: "var(--foreground)", fontSize: 11 }}
                  />

                  <YAxis
                    stroke="var(--muted-foreground)"
                    tick={{ fill: "var(--foreground)", fontSize: 11 }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                      fontSize: "12px"
                    }}
                    labelStyle={{ color: "var(--foreground)" }}
                    itemStyle={{ color: "var(--foreground)" }}
                  />

                  <Line
                    type="monotone"
                    dataKey="scans"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    dot={{ fill: "var(--primary)", r: 4 }}
                  />

                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BAR CHART */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Tickets by College
            </h2>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={collegeData}>

                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />

                  <XAxis
                    dataKey="name"
                    stroke="var(--muted-foreground)"
                    tick={{ fill: "var(--foreground)", fontSize: 11 }}
                  />

                  <YAxis
                    stroke="var(--muted-foreground)"
                    tick={{ fill: "var(--foreground)", fontSize: 11 }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                      fontSize: "12px"
                    }}
                    labelStyle={{ color: "var(--foreground)" }}
                    itemStyle={{ color: "var(--foreground)" }}
                  />

                  <Bar
                    dataKey="tickets"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                  />

                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      <MobileNav />
    </div>
  );
}