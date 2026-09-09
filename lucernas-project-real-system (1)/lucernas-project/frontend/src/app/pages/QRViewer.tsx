import { useParams, Link } from "react-router";
import { ArrowLeft, Download, ShieldCheck, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getTicketById, ApiError, type TicketDetail } from "../utils/api";

const statusStyles: Record<string, string> = {
  issued: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  used: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export default function QRViewer() {
  const { ticketId = "" } = useParams();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ticketId) {
      setError("No ticket ID given.");
      return;
    }
    getTicketById(ticketId)
      .then(setTicket)
      .catch(err => setError(err instanceof ApiError ? err.message : "Could not load this ticket."));
  }, [ticketId]);

  function handleDownload() {
    if (!ticket?.qr_code) return;
    const link = document.createElement("a");
    link.href = ticket.qr_code;
    link.download = `${ticketId}-lucernas-ticket.png`;
    link.click();
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
          <p className="text-foreground font-medium">{error}</p>
          <Link to="/college" className="inline-block mt-4 text-sm text-primary hover:underline">← Back</Link>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 text-sm text-muted-foreground">
        Loading ticket…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Ticket card */}
        <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
          {/* Header / logo */}
          <div className="flex flex-col items-center pt-6 pb-4 px-6 border-b border-dashed border-border">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary/30 bg-primary flex items-center justify-center mb-2">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary-foreground fill-current">
                <path d="M12 2C10 6 7 8 7 12a5 5 0 0010 0c0-4-3-6-5-10z" />
              </svg>
            </div>
            <span className="text-base font-bold text-primary tracking-wide">LUCERNAS</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
              Digital Event Ticket
            </span>
          </div>

          {/* Event details — straight from the decrypted ticket payload */}
          <div className="px-6 pt-5 pb-4 text-center space-y-3">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                Event Name
              </p>
              <h1 className="text-lg font-bold text-foreground underline decoration-primary/40 underline-offset-4">
                {ticket.details?.eventname ?? "Unknown event"}
              </h1>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                Issued To
              </p>
              <p className="text-sm text-foreground font-medium">{ticket.details?.studentname ?? "Unknown"}</p>
              {ticket.details?.course && (
                <p className="text-xs text-muted-foreground">{ticket.details.course}</p>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Issued {new Date(ticket.datecreated).toLocaleString()}
            </p>
          </div>

          {/* Perforated tear line */}
          <div className="relative flex items-center">
            <div className="w-4 h-4 rounded-full bg-background border border-border -ml-2 shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-border" />
            <div className="w-4 h-4 rounded-full bg-background border border-border -mr-2 shrink-0" />
          </div>

          {/* QR + blockchain section — the actual backend-issued QR image */}
          <div className="px-6 py-5 flex flex-col items-center gap-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              QR Code with Blockchain
            </p>
            <div className="p-3 bg-white rounded-xl border border-border">
              {ticket.qr_code ? (
                <img src={ticket.qr_code} alt="Ticket QR code" width={168} height={168} />
              ) : (
                <p className="w-[168px] h-[168px] flex items-center justify-center text-xs text-muted-foreground text-center">
                  No QR available
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified on Hyperledger Besu
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusStyles[ticket.status] ?? ""}`}>
              {ticket.status}
            </span>
          </div>

          {/* Ticket number */}
          <div className="px-6 pb-6 text-center">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
              Ticket Number
            </p>
            <p className="text-sm font-mono font-bold text-foreground underline decoration-primary/30 underline-offset-4 break-all">
              {ticket.ticketid}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 mt-5">
          <button
            onClick={handleDownload}
            disabled={!ticket.qr_code}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition"
          >
            <Download className="w-4 h-4" /> Download Ticket
          </button>
          <Link
            to="/college"
            className="w-full py-2.5 border border-border rounded-xl text-sm font-medium text-foreground flex items-center justify-center gap-2 hover:bg-muted transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </div>
    </div>
  );
}
