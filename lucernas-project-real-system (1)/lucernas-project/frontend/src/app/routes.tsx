import { createBrowserRouter, Navigate } from "react-router";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminDashboard from "./pages/AdminDashboard";
import TicketGeneration from "./pages/TicketGeneration";
import CollegeDashboard from "./pages/CollegeDashboard";
import QRViewer from "./pages/QRViewer";
import QRScanner from "./pages/QRScanner";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import OrganizerPage from "./pages/OrganizerPage";
import { currentUser } from "./components/Sidebar";
import type { ReactElement } from "react";

// Simple role gate: bounce to /login if there's no session at all, or to
// the user's own home if they're logged in but hit a route their role
// can't see. `currentUser` is populated by App.tsx before the router ever
// mounts, so this check is safe to run synchronously.
function RequireRole({ roles, children }: { roles: Array<"admin" | "organizer" | "governor">; children: ReactElement }) {
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!roles.includes(currentUser.role)) {
    return <Navigate to={currentUser.role === "organizer" ? "/scanner" : "/admin"} replace />;
  }
  return children;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/admin",
    element: <RequireRole roles={["admin", "governor"]}><AdminDashboard /></RequireRole>,
  },
  {
    path: "/tickets/generate",
    element: <RequireRole roles={["admin"]}><TicketGeneration /></RequireRole>,
  },
  {
    path: "/tickets",
    element: <Navigate to="/tickets/generate" replace />,
  },
  {
    path: "/college",
    element: <RequireRole roles={["admin", "organizer", "governor"]}><CollegeDashboard /></RequireRole>,
  },
  {
    path: "/qr/:ticketId",
    element: <RequireRole roles={["admin", "organizer", "governor"]}><QRViewer /></RequireRole>,
  },
  {
    path: "/scanner",
    element: <RequireRole roles={["organizer"]}><QRScanner /></RequireRole>,
  },
  {
    path: "/analytics",
    element: <RequireRole roles={["admin", "governor"]}><AnalyticsDashboard /></RequireRole>,
  },
  {
    path: "/organizer",
    element: <RequireRole roles={["admin", "organizer", "governor"]}><OrganizerPage /></RequireRole>,
  },
]);