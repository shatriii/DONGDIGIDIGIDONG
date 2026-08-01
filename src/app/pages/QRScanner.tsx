import { DesktopSidebar } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";
import { ScanLine, CheckCircle, XCircle, Camera } from "lucide-react";
import { useState } from "react";

const mockScans = [
  { id: "LUC-001", name: "Maria Santos",  event: "Tigtigan keng Lucinda", time: "2:45 PM", status: "Valid" },
  { id: "LUC-003", name: "Ana Reyes",     event: "Battle of the Bands",   time: "2:43 PM", status: "Used" },
  { id: "LUC-002", name: "Juan dela Cruz",event: "Battle of the Bands",   time: "2:40 PM", status: "Valid" },
];

export default function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [scans, setScans] = useState(mockScans);

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScans(prev => [{
        id: `LUC-00${prev.length + 1}`,
        name: "Sample Student",
        event: "Mx. TSU",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "Valid",
      }, ...prev]);
    }, 2000);
  };

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
            <div className={`w-56 h-56 rounded-2xl border-4 flex items-center justify-center transition-colors ${
              scanning ? "border-primary bg-primary/5 animate-pulse" : "border-border bg-muted/30"
            }`}>
              {scanning ? (
                <div className="text-center">
                  <ScanLine className="w-12 h-12 text-primary mx-auto mb-2 animate-bounce" />
                  <p className="text-sm text-primary font-medium">Scanning...</p>
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Camera view</p>
                  <p className="text-xs text-muted-foreground mt-1">Point at QR code</p>
                </div>
              )}
            </div>
            <button
              onClick={simulateScan}
              disabled={scanning}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition flex items-center gap-2"
            >
              <ScanLine className="w-4 h-4" />
              {scanning ? "Scanning..." : "Simulate Scan"}
            </button>
          </div>

          {/* Scan log */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Recent Scans</h2>
            </div>
            <div className="divide-y divide-border">
              {scans.map((scan, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3">
                  {scan.status === "Valid"
                    ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    : <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{scan.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{scan.event} · {scan.id}</p>
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
