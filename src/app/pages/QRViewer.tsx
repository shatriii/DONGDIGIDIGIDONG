import { useParams, useLocation, Link } from "react-router";
import { ArrowLeft, Download, ShieldCheck, CalendarDays, MapPin } from "lucide-react";
import { useMemo, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { generateQRData, type Ticket, type TicketStatus } from "../utils/ticketUtils";

/**
 * Data that can be handed to the ticket view when navigating here, e.g.
 * navigate(`/qr/${ticket.id}`, { state: { eventName, eventDate, eventTime, eventPlace, college, status } })
 * This is how the rest of the system (Ticket Generation, College Dashboard, Organizer flows)
 * plugs real event data into this page instead of it being a static mock.
 */
interface IncomingTicketState {
  eventName?: string;
  eventDate?: string;
  eventTime?: string;
  eventPlace?: string;
  college?: string;
  status?: TicketStatus;
  ticketType?: string;
}

// Fallback demo data so the page still renders something sensible if opened directly
// (e.g. by pasting a link) without state — keyed by the same IDs used elsewhere in the app.
const fallbackTicketDirectory: Record<string, Required<IncomingTicketState>> = {
  "LUC-001": {
    eventName: "Tigtigan keng Lucinda",
    eventDate: "April 20, 2026",
    eventTime: "6:00 PM",
    eventPlace: "TSU Gymnasium",
    college: "College of Computer Studies",
    status: "valid",
    ticketType: "General Admission",
  },
  "LUC-002": {
    eventName: "Battle of the Bands",
    eventDate: "April 22, 2026",
    eventTime: "5:00 PM",
    eventPlace: "TSU Open Grounds",
    college: "College of Engineering",
    status: "valid",
    ticketType: "General Admission",
  },
  "LUC-003": {
    eventName: "Mx. TSU",
    eventDate: "April 25, 2026",
    eventTime: "1:00 PM",
    eventPlace: "TSU Grand Plaza",
    college: "All Colleges",
    status: "valid",
    ticketType: "General Admission",
  },
};

const defaultTicketInfo: Required<IncomingTicketState> = {
  eventName: "Lucernas Event",
  eventDate: "To be announced",
  eventTime: "",
  eventPlace: "Tarlac State University",
  college: "All Colleges",
  status: "valid",
  ticketType: "General Admission",
};

const statusStyles: Record<TicketStatus, string> = {
  valid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  used: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  invalid: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function QRViewer() {
  const { ticketId = "TKT-UNKNOWN" } = useParams();
  const location = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Merge order: sensible defaults -> known demo record for this ID -> whatever the
  // previous page actually passed in. Real navigations from Ticket Generation / the
  // College Dashboard will always supply state, so this page reflects real ticket data.
  const passedState = (location.state ?? {}) as IncomingTicketState;
  const ticketInfo: Required<IncomingTicketState> = {
    ...defaultTicketInfo,
    ...(fallbackTicketDirectory[ticketId] ?? {}),
    ...Object.fromEntries(Object.entries(passedState).filter(([, v]) => v !== undefined)),
  };

  const qrValue = useMemo(() => {
    const ticket: Ticket = {
      id: ticketId,
      ticketNumber: ticketId,
      eventId: ticketInfo.eventName.toLowerCase().trim().replace(/\s+/g, "-"),
      eventName: ticketInfo.eventName,
      status: ticketInfo.status,
      generatedAt: Date.now(),
      qrData: "",
      ticketType: ticketInfo.ticketType,
      college: ticketInfo.college,
    };
    return generateQRData(ticket);
  }, [ticketId, ticketInfo]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${ticketId}-lucernas-ticket.png`;
    link.click();
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

          {/* Event details */}
          <div className="px-6 pt-5 pb-4 text-center space-y-3">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                Event Name
              </p>
              <h1 className="text-lg font-bold text-foreground underline decoration-primary/40 underline-offset-4">
                {ticketInfo.eventName}
              </h1>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Event Date, Place and Time
              </p>
              <div className="flex items-center justify-center gap-1.5 text-xs text-foreground font-medium">
                <CalendarDays className="w-3.5 h-3.5 text-primary shrink-0" />
                {ticketInfo.eventDate}
                {ticketInfo.eventTime && ` · ${ticketInfo.eventTime}`}
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {ticketInfo.eventPlace}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                College Department
              </p>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 underline decoration-primary/30 underline-offset-4">
                {ticketInfo.college}
              </span>
            </div>
          </div>

          {/* Perforated tear line */}
          <div className="relative flex items-center">
            <div className="w-4 h-4 rounded-full bg-background border border-border -ml-2 shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-border" />
            <div className="w-4 h-4 rounded-full bg-background border border-border -mr-2 shrink-0" />
          </div>

          {/* QR + blockchain section */}
          <div className="px-6 py-5 flex flex-col items-center gap-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              QR Code with Blockchain
            </p>
            <div className="p-3 bg-white rounded-xl border border-border">
              <QRCodeCanvas ref={canvasRef} value={qrValue} size={168} level="M" marginSize={2} />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified on Hyperledger Besu
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusStyles[ticketInfo.status]}`}
            >
              {ticketInfo.status}
            </span>
          </div>

          {/* Ticket number */}
          <div className="px-6 pb-6 text-center">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
              Ticket Number
            </p>
            <p className="text-sm font-mono font-bold text-foreground underline decoration-primary/30 underline-offset-4">
              {ticketId}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 mt-5">
          <button
            onClick={handleDownload}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition"
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
