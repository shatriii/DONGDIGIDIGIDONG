import { Link } from "react-router";
import { Mail, Lock, User, Moon, Sun, Info } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// There is no self-registration endpoint on the backend — admin and
// organizer accounts live in the system_admin / organizers tables and
// are provisioned directly (see authController.js), not created via a
// public signup form. Rather than fake an "account created" flow that
// doesn't actually create anything, this page is honest about that and
// points people back to login.
export default function SignupPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 transition-colors duration-300">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition"
      >
        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-primary-foreground">
              <path d="M12 2C10 6 7 8 7 12a5 5 0 0010 0c0-4-3-6-5-10z"/>
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Account Access</h1>
          <p className="text-muted-foreground mt-2">Admin and organizer accounts are provisioned for you</p>
        </div>

        <div className="bg-card/70 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-border/50 space-y-4">
          <div className="flex gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm text-foreground">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p>
              This system doesn't have self-signup — admin and organizer accounts are created
              directly in the database by whoever manages the deployment. If you were expecting
              an account, ask your administrator to create one, then sign in below.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 opacity-40 pointer-events-none select-none">
            <div className="col-span-3 flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 text-sm">
              <User className="w-4 h-4" /> Full name
            </div>
            <div className="col-span-3 flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 text-sm">
              <Mail className="w-4 h-4" /> Email
            </div>
            <div className="col-span-3 flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 text-sm">
              <Lock className="w-4 h-4" /> Password
            </div>
          </div>

          <Link
            to="/login"
            className="block text-center w-full py-3 rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 font-semibold transition"
          >
            Go to Sign In
          </Link>
        </div>
        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
