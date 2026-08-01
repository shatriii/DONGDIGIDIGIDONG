import { DesktopSidebar, currentUser } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";
import { Ticket, ScanLine, Calendar, TrendingUp, Plus, Send } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router";

const chartData = [
  { name: "Mon", scans: 45 }, { name: "Tue", scans: 52 }, { name: "Wed", scans: 48 },
  { name: "Thu", scans: 68 }, { name: "Fri", scans: 85 }, { name: "Sat", scans: 120 }, { name: "Sun", scans: 95 },
];

const recentScans = [
  { id: 1, time: "2:45 PM", status: "Valid", event: "Tigtigan keng Lucinda" },
  { id: 2, time: "2:43 PM", status: "Valid", event: "Battle of the Bands" },
  { id: 3, time: "2:41 PM", status: "Used",  event: "Battle of the Bands" },
  { id: 4, time: "2:38 PM", status: "Valid", event: "Mx. TSU" },
  { id: 5, time: "2:35 PM", status: "Valid", event: "Mr. and Ms. Intrams" },
];

export default function AdminDashboard() {
  const role = currentUser.role;

  return (
    <div className="flex min-h-screen bg-background transition-colors">
      <DesktopSidebar />

      <div className="flex-1 pb-20 pt-14 md:pt-0 md:pb-0 min-w-0">
        {/* HEADER */}
        <div className="bg-card border-b border-border px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 capitalize">
            Welcome back, {currentUser.name}! Here's what's happening today.
          </p>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">

          {/* QUICK ACTIONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {role === "admin" && (
              <Link to="/tickets/generate" className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 sm:p-5 rounded-xl shadow-lg flex items-center justify-between group">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold">Generate Tickets</h3>
                  <p className="text-xs opacity-80 mt-0.5">Create QR codes</p>
                </div>
                <Plus className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition shrink-0" />
              </Link>
            )}

            {(role === "admin" || role === "governor") && (
              <Link to="/analytics" className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground p-4 sm:p-5 rounded-xl shadow-lg flex items-center justify-between group">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold">View Analytics</h3>
                  <p className="text-xs opacity-80 mt-0.5">Attendance insights</p>
                </div>
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition shrink-0" />
              </Link>
            )}

            {(role === "admin" || role === "governor") && (
              <Link to="/college" className="bg-gradient-to-r from-primary/70 to-primary/50 text-primary-foreground p-4 sm:p-5 rounded-xl shadow-lg flex items-center justify-between group">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold">College Dashboard</h3>
                  <p className="text-xs opacity-80 mt-0.5">
                    {role === "governor" ? "Email digital tickets" : "Manage students"}
                  </p>
                </div>
                <Send className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition shrink-0" />
              </Link>
            )}
          </div>

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: Ticket, label: "Total Tickets", value: "1,245", color: "text-primary" },
              { icon: ScanLine, label: "Scanned Today", value: "513", color: "text-secondary" },
              { icon: Calendar, label: "Active Events", value: "12", color: "text-accent" },
              { icon: TrendingUp, label: "Success Rate", value: "98.5%", color: "text-primary" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-card rounded-xl shadow p-4 sm:p-5 border border-border">
                <Icon className={`mb-2 sm:mb-3 w-5 h-5 sm:w-6 sm:h-6 ${color}`} />
                <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{value}</h2>
              </div>
            ))}
          </div>

          {/* CHART */}
          {(role === "admin" || role === "governor") && (
            <div className="bg-card rounded-xl shadow p-4 sm:p-5 border border-border">
              <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
                Attendance Overview
              </h2>

              <div className="h-52 sm:h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    
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
          )}

          {/* RECENT SCANS */}
          <div className="bg-card rounded-xl shadow border border-border overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">Recent Scans</h2>
            </div>

            <div className="block sm:hidden divide-y divide-border">
              {recentScans.map((scan) => (
                <div key={scan.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{scan.event}</p>
                    <p className="text-xs text-muted-foreground">{scan.time}</p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${
                    scan.status === "Valid"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {scan.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Event</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Time</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentScans.map((scan) => (
                    <tr key={scan.id} className="border-t border-border hover:bg-muted/50 transition">
                      <td className="px-4 sm:px-6 py-3 text-foreground">{scan.event}</td>
                      <td className="px-4 sm:px-6 py-3 text-muted-foreground whitespace-nowrap">{scan.time}</td>
                      <td className="px-4 sm:px-6 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          scan.status === "Valid"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {scan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      <MobileNav />
    </div>
  );
}