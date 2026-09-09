import { DesktopSidebar } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";
import { Plus, Ticket, QrCode, Eye } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { generateBatchTickets, ApiError, type BatchResult } from "../utils/api";

export default function TicketGeneration() {
  // The backend only knows about (userid, eventname) — a student must
  // already exist in the User table. There's no "college / quantity"
  // bulk-create concept server-side, so this form collects real student
  // IDs rather than inventing tickets out of thin air.
  const [eventname, setEventname] = useState("");
  const [userIdsRaw, setUserIdsRaw] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<BatchResult | null>(null);
  const [error, setError] = useState("");

  const userids = userIdsRaw
    .split(/[\n,]/)
    .map(s => s.trim())
    .filter(Boolean);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventname || userids.length === 0) return;
    setGenerating(true);
    setError("");
    setResult(null);
    try {
      const res = await generateBatchTickets(userids, eventname);
      setResult(res);
      setUserIdsRaw("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the server.");
    } finally {
      setGenerating(false);
    }
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
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Event Name</label>
                <input value={eventname} onChange={e => setEventname(e.target.value)}
                  placeholder="e.g. Battle of the Bands"
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Student User IDs (comma or newline separated)
                </label>
                <textarea
                  value={userIdsRaw}
                  onChange={e => setUserIdsRaw(e.target.value)}
                  rows={4}
                  placeholder={"e.g.\n1024\n1025\n1026"}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">{userids.length} student ID{userids.length === 1 ? "" : "s"} recognized</p>
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-xl px-3 py-2">{error}</p>
              )}

              <button type="submit" disabled={generating || !eventname || userids.length === 0}
                className="w-full sm:w-auto px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                {generating ? "Generating…" : `Generate ${userids.length || ""} Ticket${userids.length === 1 ? "" : "s"}`}
              </button>
            </form>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-primary" /> Batch Result
                </h2>
                <span className="text-xs text-muted-foreground">{result.message}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      {["Ticket ID", "User ID", "Email", "Status", ""].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.results.map(t => (
                      <tr key={t.ticketid} className="border-t border-border hover:bg-muted/50 transition">
                        <td className="px-4 py-3 font-mono text-primary text-xs">{t.ticketid}</td>
                        <td className="px-4 py-3 text-foreground">{t.userid}</td>
                        <td className="px-4 py-3 text-muted-foreground">{t.email}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Issued</span>
                        </td>
                        <td className="px-4 py-3">
                          <Link to={`/qr/${t.ticketid}`} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition inline-flex" title="View digital ticket">
                            <Eye className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {result.errors.map(e => (
                      <tr key={e.userid} className="border-t border-border">
                        <td className="px-4 py-3 text-muted-foreground" colSpan={3}>User {e.userid}: {e.error}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Failed</span>
                        </td>
                        <td />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
