import { DesktopSidebar, currentUser } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";
import { Plus, Ticket, QrCode, Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

interface TicketForm {
  event: string;
  college: string;
  quantity: number;
  date: string;
}

const mockTickets = [
  { id: "LUC-001", event: "Tigtigan keng Lucinda", college: "CCS",  date: "2026-04-20", status: "Active" },
  { id: "LUC-002", event: "Battle of the Bands",   college: "COE",  date: "2026-04-22", status: "Active" },
  { id: "LUC-003", event: "Mx. TSU",               college: "All",  date: "2026-04-25", status: "Active" },
];

export default function TicketGeneration() {
  const [form, setForm] = useState<TicketForm>({ event: "", college: "", quantity: 1, date: "" });
  const [tickets, setTickets] = useState(mockTickets);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.event || !form.college || !form.date) return;
    setGenerating(true);
    setTimeout(() => {
      const newTickets = Array.from({ length: form.quantity }, (_, i) => ({
        id: `LUC-${String(tickets.length + i + 1).padStart(3, "0")}`,
        event: form.event,
        college: form.college,
        date: form.date,
        status: "Active",
      }));
      setTickets(prev => [...newTickets, ...prev]);
      setForm({ event: "", college: "", quantity: 1, date: "" });
      setGenerating(false);
    }, 1200);
  };

  return (
    <div className="flex min-h-screen bg-background transition-colors">
      <DesktopSidebar />
      <div className="flex-1 pb-20 pt-14 md:pt-0 md:pb-0 min-w-0">
        <div className="bg-card border-b border-border px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <QrCode className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Ticket Generation</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Create QR code tickets for events</p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5">
          {/* Form */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" /> Generate New Tickets
            </h2>
            <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Event Name</label>
                <input value={form.event} onChange={e => setForm({ ...form, event: e.target.value })}
                  placeholder="e.g. Battle of the Bands"
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">College</label>
                <select value={form.college} onChange={e => setForm({ ...form, college: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select college</option>
                  {["All", "Laboratory School", "College of Business and Accountancy", "College of Arts and Social Sciences", "College of Public Administration and Governance", "College of Engineering","College of Computer Studies","College of Industrial Technology","College of Architecture and Fine Arts","College of Education","College of Science","College of Criminal Justice Education","Graduate School", "School of Law"].map(c => <option key={c} value={c}>{c}</option>)}                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Event Date</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Quantity</label>
                <input type="number" min={1} max={500} value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="sm:col-span-2">
                <button type="submit" disabled={generating}
                  className="w-full sm:w-auto px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  {generating ? "Generating..." : `Generate ${form.quantity} Ticket${form.quantity > 1 ? "s" : ""}`}
                </button>
              </div>
            </form>
          </div>

          {/* Tickets list */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Ticket className="w-4 h-4 text-primary" /> Generated Tickets
              </h2>
              <span className="text-xs text-muted-foreground">{tickets.length} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    {["Ticket ID", "Event", "College", "Date", "Status", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(t => (
                    <tr key={t.id} className="border-t border-border hover:bg-muted/50 transition">
                      <td className="px-4 py-3 font-mono text-primary text-xs">{t.id}</td>
                      <td className="px-4 py-3 text-foreground">{t.event}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.college}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{t.date}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{t.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/qr/${t.id}`}
                          state={{
                            eventName: t.event,
                            eventDate: new Date(t.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }),
                            college: t.college,
                            status: t.status === "Active" ? "valid" : "invalid",
                          }}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition inline-flex"
                          title="View digital ticket"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
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
