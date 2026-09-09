import { DesktopSidebar, currentUser } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";
import { GraduationCap, Users, Ticket as TicketIcon, Mail, Search, AlertCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getAllStudents, resendTicketEmail, ApiError, type Student } from "../utils/api";

export default function CollegeDashboard() {
  if (!currentUser) return null;
  const canResend = currentUser.role === "admin"; // matches POST /tickets/resend being admin-only

  const [students, setStudents] = useState<Student[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [rowError, setRowError] = useState<Record<string, string>>({});

  useEffect(() => {
    getAllStudents()
      .then(res => setStudents(res.students))
      .catch(err => setError(err instanceof ApiError ? err.message : "Could not load students."));
  }, []);

  const filtered = useMemo(() => {
    const list = students ?? [];
    const q = search.toLowerCase();
    return list.filter(s => s.name.toLowerCase().includes(q) || s.course.toLowerCase().includes(q));
  }, [students, search]);

  const selectableIds = filtered.filter(s => s.hasTicket).map(s => s.userid);

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === selectableIds.length ? [] : selectableIds);

  async function handleResend() {
    if (selected.length === 0) return;
    setSending(true);
    setRowError({});
    let succeeded = 0;
    for (const userid of selected) {
      try {
        await resendTicketEmail(userid);
        succeeded++;
      } catch (err) {
        setRowError(prev => ({ ...prev, [userid]: err instanceof ApiError ? err.message : "Failed to resend." }));
      }
    }
    setSentCount(succeeded);
    setSending(false);
    setSelected([]);
  }

  const total = students?.length ?? 0;
  const issued = students?.filter(s => s.hasTicket).length ?? 0;

  return (
    <div className="flex min-h-screen bg-background transition-colors">
      <DesktopSidebar />

      <div className="flex-1 pb-20 pt-14 md:pt-0 md:pb-0 min-w-0">
        {/* Header */}
        <div className="bg-card border-b border-border px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">College Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {canResend ? "Manage students and resend tickets" : "View student ticket records"}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">

          {error && (
            <div className="flex gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
            </div>
          )}

          {/* Stats row — real counts from the User table */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Total Students", value: students ? total : "…", icon: Users },
              { label: "Tickets Issued", value: students ? issued : "…", icon: TicketIcon },
              { label: "Resent This Session", value: sentCount, icon: Mail },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-card rounded-xl border border-border p-4">
                <Icon className="w-5 h-5 text-primary mb-2" />
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold text-foreground">{value}</p>
              </div>
            ))}
          </div>

          {/* Resend controls — admin only, mirrors POST /api/tickets/resend
              which re-sends the email for a student who already has a
              ticket. There's no bulk-email/Bluetooth "distribution" system
              here; the only real send path is per-student email resend. */}
          {canResend && (
            <div className="bg-card rounded-xl border border-border p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Resend Ticket Emails</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selected.length > 0
                    ? `${selected.length} student${selected.length > 1 ? "s" : ""} selected`
                    : "Select students with an existing ticket below"}
                </p>
              </div>
              <button
                onClick={handleResend}
                disabled={selected.length === 0 || sending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 hover:bg-primary/90 transition"
              >
                <Mail className="w-4 h-4" />
                {sending ? "Sending…" : "Resend Email"}
              </button>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or course…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Student table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Students</h2>
              {canResend && selectableIds.length > 0 && (
                <button onClick={toggleAll} className="text-xs text-primary font-medium hover:underline">
                  {selected.length === selectableIds.length ? "Deselect all" : "Select all with tickets"}
                </button>
              )}
            </div>

            {students === null && !error && (
              <p className="px-4 py-6 text-sm text-muted-foreground">Loading…</p>
            )}
            {students !== null && filtered.length === 0 && (
              <p className="px-4 py-6 text-sm text-muted-foreground">No students found.</p>
            )}

            {/* Mobile cards */}
            <div className="block sm:hidden divide-y divide-border">
              {filtered.map(s => (
                <div key={s.userid} className="px-4 py-3 flex items-center gap-3"
                  onClick={() => canResend && s.hasTicket && toggleSelect(s.userid)}>
                  {canResend && s.hasTicket && (
                    <input type="checkbox" checked={selected.includes(s.userid)} readOnly
                      className="w-4 h-4 accent-primary shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.course}</p>
                    {rowError[s.userid] && <p className="text-xs text-destructive mt-0.5">{rowError[s.userid]}</p>}
                  </div>
                  <span className={`text-xs font-mono px-2 py-1 rounded-lg shrink-0 ${
                    s.hasTicket ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted"
                  }`}>
                    {s.hasTicket ? s.ticketid : "No ticket"}
                  </span>
                </div>
              ))}
            </div>

            {/* Table sm+ */}
            {filtered.length > 0 && (
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      {canResend && <th className="px-4 py-3 w-10" />}
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Course</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Ticket ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(s => (
                      <tr key={s.userid} className={`border-t border-border transition ${
                        canResend && s.hasTicket ? "cursor-pointer" : ""
                      } ${selected.includes(s.userid) ? "bg-primary/5" : "hover:bg-muted/50"}`}
                        onClick={() => canResend && s.hasTicket && toggleSelect(s.userid)}>
                        {canResend && (
                          <td className="px-4 py-3">
                            {s.hasTicket && (
                              <input type="checkbox" checked={selected.includes(s.userid)} readOnly className="accent-primary" />
                            )}
                          </td>
                        )}
                        <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.course}</td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {s.hasTicket
                            ? <span className="text-primary">{s.ticketid}</span>
                            : <span className="text-muted-foreground">No ticket</span>}
                          {rowError[s.userid] && <p className="text-destructive normal-case font-sans mt-0.5">{rowError[s.userid]}</p>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{s.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
