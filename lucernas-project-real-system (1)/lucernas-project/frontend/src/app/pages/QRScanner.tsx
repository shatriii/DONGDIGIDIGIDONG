import { DesktopSidebar, currentUser } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";
import { ScanLine, CheckCircle, XCircle, Camera, Keyboard } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { validateTicket, ApiError } from "../utils/api";

interface ScanRecord {
  id: string;
  name: string;
  event: string;
  time: string;
  status: "Valid" | "Rejected";
  reason?: string;
}

// The native BarcodeDetector API isn't in every browser/TS lib version yet.
declare global {
  interface Window {
    BarcodeDetector?: any;
  }
}

export default function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [cameraSupported, setCameraSupported] = useState(true);
  const [manualCode, setManualCode] = useState("");
  const [busy, setBusy] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setCameraSupported(typeof window !== "undefined" && !!window.BarcodeDetector);
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitScan(rawText: string) {
    if (!currentUser) return;
    setBusy(true);
    try {
      const result = await validateTicket(rawText, currentUser.id);
      if (result.valid) {
        setScans(prev => [{
          id: result.ticketid ?? "—",
          name: result.details?.studentname ?? "Unknown",
          event: result.details?.eventname ?? "—",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "Valid",
        }, ...prev]);
      } else {
        setScans(prev => [{
          id: result.ticketid ?? "—",
          name: "—",
          event: "—",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "Rejected",
          reason: result.reason,
        }, ...prev]);
      }
    } catch (err) {
      const reason = err instanceof ApiError ? err.message : "Could not reach the server.";
      setScans(prev => [{
        id: "—", name: "—", event: "—",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "Rejected", reason,
      }, ...prev]);
    } finally {
      setBusy(false);
    }
  }

  async function startCamera() {
    if (!cameraSupported) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      pollForCode();
    } catch {
      setCameraSupported(false);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setScanning(false);
  }

  async function pollForCode() {
    const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
    const tick = async () => {
      if (!streamRef.current || !videoRef.current) return;
      try {
        const codes = await detector.detect(videoRef.current);
        if (codes.length > 0) {
          stopCamera();
          await submitScan(codes[0].rawValue);
          return;
        }
      } catch {
        // transient detection error — keep polling
      }
      if (streamRef.current) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualCode.trim()) return;
    submitScan(manualCode.trim());
    setManualCode("");
  }

  return (
    <div className="flex min-h-screen bg-background transition-colors">
      <DesktopSidebar />
      <div className="flex-1 pb-20 pt-14 md:pt-0 md:pb-0 min-w-0">
        <div className="bg-card border-b border-border px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <ScanLine className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">QR Scanner</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Scan and verify event tickets</p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5">
          {/* Scanner UI */}
          <div className="bg-card rounded-xl border border-border p-6 flex flex-col items-center gap-4">
            <div className={`relative w-56 h-56 rounded-2xl border-4 overflow-hidden flex items-center justify-center transition-colors ${
              scanning ? "border-primary bg-primary/5" : "border-border bg-muted/30"
            }`}>
              <video ref={videoRef} className={`w-full h-full object-cover ${scanning ? "" : "hidden"}`} muted playsInline />
              {!scanning && (
                <div className="text-center">
                  <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Camera view</p>
                  <p className="text-xs text-muted-foreground mt-1">Point at QR code</p>
                </div>
              )}
            </div>

            {cameraSupported ? (
              <button
                onClick={scanning ? stopCamera : startCamera}
                disabled={busy}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition flex items-center gap-2"
              >
                <ScanLine className="w-4 h-4" />
                {scanning ? "Stop Camera" : "Start Scanning"}
              </button>
            ) : (
              <p className="text-xs text-muted-foreground text-center max-w-xs">
                Live camera scanning isn't supported in this browser. Use manual entry below
                (e.g. paste text decoded from a QR reader app).
              </p>
            )}

            {/* Manual entry fallback — also useful for testing without a camera */}
            <form onSubmit={handleManualSubmit} className="w-full flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Paste scanned QR content…"
                className="flex-1 px-3 py-2 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={busy || !manualCode.trim()}
                className="px-4 py-2 bg-muted text-foreground rounded-xl text-sm font-medium hover:bg-muted/80 disabled:opacity-50 transition"
              >
                Check
              </button>
            </form>
          </div>

          {/* Scan log */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Recent Scans</h2>
            </div>
            <div className="divide-y divide-border">
              {scans.length === 0 && (
                <p className="px-4 py-6 text-sm text-muted-foreground text-center">No scans yet.</p>
              )}
              {scans.map((scan, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3">
                  {scan.status === "Valid"
                    ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    : <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{scan.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {scan.status === "Valid" ? `${scan.event} · ${scan.id}` : scan.reason ?? "Rejected"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      scan.status === "Valid"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>{scan.status}</span>
                    <p className="text-xs text-muted-foreground mt-1">{scan.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
