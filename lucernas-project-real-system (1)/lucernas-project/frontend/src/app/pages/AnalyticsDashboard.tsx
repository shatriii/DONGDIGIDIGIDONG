import { DesktopSidebar } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";
import { BarChart3, TrendingUp, Ticket, ScanLine } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { getAllTickets, ApiError } from "../utils/api";

interface TicketRow {
  ticketid: string;
  status: string;
  datecreated: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildWeeklyIssuedChart(tickets: TicketRow[]) {
  const counts = new Array(7).fill(0);
  const now = Date.now();
  for (const t of tickets) {
    const created = new Date(t.datecreated).getTime();
    if (now - created <= 7 * 24 * 60 * 60 * 1000) {
      counts[new Date(t.datecreated).getDay()]++;
    }
  }
  return WEEKDAYS.map((day, i) => ({ day, issued: counts[i] }));
}

export default function AnalyticsDashboard() {
  const [tickets, setTickets] = useState<TicketRow[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllTickets()
      .then(res => setTickets(res.tickets))
      .catch(err => setError(err instanceof ApiError ? err.message : "Could not load ticket data."));
  }, []);

  const total = tickets?.length ?? 0;
  const used = tickets?.filter(t => t.status === "used").length ?? 0;
  const redemptionRate = total > 0 ? `${((used / total) * 100).toFixed(1)}%` : "—";
  const chartData = tickets ? buildWeeklyIssuedChart(tickets) : [];

  return (
    <div className="flex min-h-screen bg-background transition-colors">
      <DesktopSidebar />

      <div className="flex-1 pb-20 pt-14 md:pt-0 md:pb-0 min-w-0">

        {/* HEADER */}
        <div className="bg-card border-b border-border px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Analytics</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Attendance insights & event data</p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5">

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* STATS — real counts from /api/tickets. "Attendees" and
              "Active Events" were dropped: the backend has no concept
              of a distinct attendee or event record to count, only
              individual tickets. */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: Ticket, label: "Total Tickets", value: tickets ? total.toLocaleString() : "…" },
              { icon: ScanLine, label: "Redeemed", value: tickets ? used.toLocaleString() : "…" },
              { icon: TrendingUp, label: "Redemption Rate", value: tickets ? redemptionRate : "…" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-card rounded-xl border border-border p-4">
                <Icon className="w-5 h-5 text-primary mb-2" />
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold text-foreground">{value}</p>
              </div>
            ))}
          </div>

          {/* LINE CHART — real tickets issued per weekday, last 7 days */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Tickets Issued This Week
            </h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" tick={{ fill: "var(--foreground)", fontSize: 11 }} />
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

          {/* The old mock also had a "Tickets by College" bar chart. There's
              no college/department column on the ticket or User tables in
              this backend (only `course`), so there's no real data to back
              that chart. Building it would mean adding a college field to
              the schema and to ticket generation first — flagging that as
              a follow-up rather than faking the numbers. */}
          <div className="bg-card rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
            "Tickets by College" isn't shown here — the backend doesn't currently store a
            college/department field on tickets or students, so there's nothing real to chart yet.
          </div>

        </div>
      </div>

      <MobileNav />
    </div>
  );
}
