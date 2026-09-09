import { DesktopSidebar, currentUser } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";
import { Ticket, ScanLine, TrendingUp, Plus, Send } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { getAllTickets, ApiError } from "../utils/api";

interface TicketRow {
  ticketid: string;
  status: string;
  datecreated: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// The backend only tracks (ticketid, status, datecreated) per ticket — no
// event name, no per-scan timestamp, no "active events" concept. So this
// dashboard only shows what's actually derivable from that, rather than
// the fabricated numbers ("1,245 tickets", "12 active events") the mock
// version hardcoded.
function buildWeeklyIssuedChart(tickets: TicketRow[]) {
  const counts = new Array(7).fill(0);
  const now = Date.now();
  for (const t of tickets) {
    const created = new Date(t.datecreated).getTime();
    if (now - created <= 7 * 24 * 60 * 60 * 1000) {
      counts[new Date(t.datecreated).getDay()]++;
    }
  }
  return WEEKDAYS.map((day, i) => ({ name: day, issued: counts[i] }));
}

export default function AdminDashboard() {
  // This route is gated to admin/governor in routes.tsx, so currentUser is
  // always set by the time this renders — the guard is just for TS/safety.
  const [tickets, setTickets] = useState<TicketRow[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllTickets()
      .then(res => setTickets(res.tickets))
      .catch(err => setError(err instanceof ApiError ? err.message : "Could not load ticket data."));
  }, []);

  if (!currentUser) return null;

  const total = tickets?.length ?? 0;
  const used = tickets?.filter(t => t.status === "used").length ?? 0;
  const issued = tickets?.filter(t => t.status === "issued").length ?? 0;
  const redemptionRate = total > 0 ? `${((used / total) * 100).toFixed(1)}%` : "—";
  const chartData = tickets ? buildWeeklyIssuedChart(tickets) : [];
  const recentTickets = (tickets ?? []).slice(0, 8);

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

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* QUICK ACTIONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Link to="/tickets/generate" className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 sm:p-5 rounded-xl shadow-lg flex items-center justify-between group">
              <div>
                <h3 className="text-sm sm:text-base font-semibold">Generate Tickets</h3>
                <p className="text-xs opacity-80 mt-0.5">Create QR codes</p>
              </div>
              <Plus className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition shrink-0" />
            </Link>

            <Link to="/analytics" className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground p-4 sm:p-5 rounded-xl shadow-lg flex items-center justify-between group">
              <div>
                <h3 className="text-sm sm:text-base font-semibold">View Analytics</h3>
                <p className="text-xs opacity-80 mt-0.5">Attendance insights</p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition shrink-0" />
            </Link>

            <Link to="/college" className="bg-gradient-to-r from-primary/70 to-primary/50 text-primary-foreground p-4 sm:p-5 rounded-xl shadow-lg flex items-center justify-between group">
              <div>
                <h3 className="text-sm sm:text-base font-semibold">College Dashboard</h3>
                <p className="text-xs opacity-80 mt-0.5">Manage students</p>
              </div>
              <Send className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition shrink-0" />
            </Link>
          </div>

          {/* SUMMARY CARDS — derived from real /api/tickets data */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              { icon: Ticket, label: "Total Tickets", value: tickets ? total.toLocaleString() : "…", color: "text-primary" },
              { icon: ScanLine, label: "Redeemed", value: tickets ? used.toLocaleString() : "…", color: "text-secondary" },
              { icon: TrendingUp, label: "Redemption Rate", value: tickets ? redemptionRate : "…", color: "text-primary" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-card rounded-xl shadow p-4 sm:p-5 border border-border">
                <Icon className={`mb-2 sm:mb-3 w-5 h-5 sm:w-6 sm:h-6 ${color}`} />
                <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{value}</h2>
              </div>
            ))}
          </div>

          {/* CHART — tickets issued per weekday, last 7 days */}
          <div className="bg-card rounded-xl shadow p-4 sm:p-5 border border-border">
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
              Tickets Issued (Last 7 Days)
            </h2>

            <div className="h-52 sm:h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" tick={{ fill: "var(--foreground)", fontSize: 11 }} />
                  <YAxis stroke="var(--muted-foreground)" tick={{ fill: "var(--foreground)", fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: "12px" }}
                    labelStyle={{ color: "var(--foreground)" }}
                    itemStyle={{ color: "var(--foreground)" }}
                  />
                  <Line type="monotone" dataKey="issued" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: "var(--primary)", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RECENT TICKETS — note: the backend doesn't store event name or a
              separate scan timestamp per ticket, so this is a ticket list,
              not a full "scan log" the way the old mock implied. */}
          <div className="bg-card rounded-xl shadow border border-border overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">Recent Tickets</h2>
            </div>

            {tickets === null && !error && (
              <p className="px-4 sm:px-6 py-6 text-sm text-muted-foreground">Loading…</p>
            )}
            {tickets !== null && recentTickets.length === 0 && (
              <p className="px-4 sm:px-6 py-6 text-sm text-muted-foreground">No tickets yet.</p>
            )}

            <div className="hidden sm:block overflow-x-auto">
              {recentTickets.length > 0 && (
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Ticket ID</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Created</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTickets.map((t) => (
                      <tr key={t.ticketid} className="border-t border-border hover:bg-muted/50 transition">
                        <td className="px-4 sm:px-6 py-3 font-mono text-primary text-xs">{t.ticketid}</td>
                        <td className="px-4 sm:px-6 py-3 text-muted-foreground whitespace-nowrap">{new Date(t.datecreated).toLocaleString()}</td>
                        <td className="px-4 sm:px-6 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            t.status === "used"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>

      <MobileNav />
    </div>
  );
}
