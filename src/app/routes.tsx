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
    element: <AdminDashboard />,
  },
  {
    path: "/tickets/generate",
    element: <TicketGeneration />,
  },
  {
    path: "/tickets",
    element: <Navigate to="/tickets/generate" replace />,
  },
  {
    path: "/college",
    element: <CollegeDashboard />,
  },
  {
    path: "/qr/:ticketId",
    element: <QRViewer />,
  },
  {
    path: "/scanner",
    element: <QRScanner />,
  },
  {
    path: "/analytics",
    element: <AnalyticsDashboard />,
  },
  {
    path: "/organizer",
    element: <OrganizerPage />,
  },
]);