import { Navigate } from "react-router";
// Organizer uses QRScanner and CollegeDashboard — redirect to scanner
export default function OrganizerPage() {
  return <Navigate to="/scanner" replace />;
}
