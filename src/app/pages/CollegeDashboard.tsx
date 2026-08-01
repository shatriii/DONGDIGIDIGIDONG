import { DesktopSidebar, currentUser } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";
import { GraduationCap, Users, Mail, Bluetooth, Send, Search, Filter, Download } from "lucide-react";
import { useState } from "react";

const students = [
  { id: 1, name: "Maria Santos",    college: "CCS",  course: "BSIT",   ticket: "LUC-001", email: "maria@tsu.edu.ph",   selected: false },
  { id: 2, name: "Juan dela Cruz",  college: "COE",  course: "BSCE",   ticket: "LUC-002", email: "juan@tsu.edu.ph",    selected: false },
  { id: 3, name: "Ana Reyes",       college: "CBA",  course: "BSBA",   ticket: "LUC-003", email: "ana@tsu.edu.ph",     selected: false },
  { id: 4, name: "Pedro Lim",       college: "CCS",  course: "BSCS",   ticket: "LUC-004", email: "pedro@tsu.edu.ph",   selected: false },
  { id: 5, name: "Rosa Garcia",     college: "CAS",  course: "BSED",   ticket: "LUC-005", email: "rosa@tsu.edu.ph",    selected: false },
  { id: 6, name: "Carlo Mendoza",   college: "COE",  course: "BSEE",   ticket: "LUC-006", email: "carlo@tsu.edu.ph",   selected: false },
];

export default function CollegeDashboard() {
  const role = currentUser.role;
  const isGovernor = role === "governor";
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [sending, setSending] = useState<null | "gmail" | "bluetooth">(null);
  const [sentCount, setSentCount] = useState(0);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.college.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map(s => s.id));

  const handleSend = (method: "gmail" | "bluetooth") => {
    if (selected.length === 0) return;
    setSending(method);
    setTimeout(() => {
      setSentCount(selected.length);
      setSending(null);
      setSelected([]);
    }, 1800);
  };

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
                {isGovernor ? "Distribute digital tickets via Gmail or Bluetooth" : "Manage student ticket records"}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Students", value: students.length, icon: Users },
              { label: "Tickets Issued",  value: students.length, icon: Download },
              { label: "Selected",        value: selected.length, icon: Filter },
              { label: "Sent",            value: sentCount,       icon: Send },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-card rounded-xl border border-border p-4">
                <Icon className="w-5 h-5 text-primary mb-2" />
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold text-foreground">{value}</p>
              </div>
            ))}
          </div>

          {/* Governor send controls */}
          {isGovernor && (
            <div className="bg-card rounded-xl border border-border p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Distribute Tickets</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selected.length > 0
                    ? `${selected.length} student${selected.length > 1 ? "s" : ""} selected`
                    : "Select students below to send tickets"}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleSend("gmail")}
                  disabled={selected.length === 0 || sending !== null}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 hover:bg-primary/90 transition"
                >
                  <Mail className="w-4 h-4" />
                  {sending === "gmail" ? "Sending..." : "Send via Gmail"}
                </button>
                <button
                  onClick={() => handleSend("bluetooth")}
                  disabled={selected.length === 0 || sending !== null}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-40 hover:bg-blue-700 transition"
                >
                  <Bluetooth className="w-4 h-4" />
                  {sending === "bluetooth" ? "Pairing..." : "Send via Bluetooth"}
                </button>
              </div>
            </div>
          )}

          {sentCount > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 text-sm text-green-700 dark:text-green-400 font-medium">
              ✓ Successfully sent {sentCount} ticket{sentCount > 1 ? "s" : ""}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or college..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Student table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Student Tickets</h2>
              {isGovernor && (
                <button onClick={toggleAll} className="text-xs text-primary font-medium hover:underline">
                  {selected.length === filtered.length ? "Deselect all" : "Select all"}
                </button>
              )}
            </div>

            {/* Mobile cards */}
            <div className="block sm:hidden divide-y divide-border">
              {filtered.map(s => (
                <div key={s.id} className="px-4 py-3 flex items-center gap-3"
                  onClick={() => isGovernor && toggleSelect(s.id)}>
                  {isGovernor && (
                    <input type="checkbox" checked={selected.includes(s.id)} readOnly
                      className="w-4 h-4 accent-primary shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.college} · {s.course}</p>
                  </div>
                  <span className="text-xs text-primary font-mono bg-primary/10 px-2 py-1 rounded-lg shrink-0">{s.ticket}</span>
                </div>
              ))}
            </div>

            {/* Table sm+ */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    {isGovernor && <th className="px-4 py-3 w-10"><input type="checkbox"
                      checked={selected.length === filtered.length && filtered.length > 0}
                      onChange={toggleAll} className="accent-primary" /></th>}
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">College</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Course</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Ticket ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id} className={`border-t border-border transition cursor-pointer
                      ${selected.includes(s.id) ? "bg-primary/5" : "hover:bg-muted/50"}`}
                      onClick={() => isGovernor && toggleSelect(s.id)}>
                      {isGovernor && (
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selected.includes(s.id)} readOnly className="accent-primary" />
                        </td>
                      )}
                      <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.college}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.course}</td>
                      <td className="px-4 py-3 font-mono text-primary text-xs">{s.ticket}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{s.email}</td>
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
