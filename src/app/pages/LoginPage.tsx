import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff, Moon, Sun, AlertCircle } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { setCurrentUser } from "../components/Sidebar";

// ─── Hardcoded accounts ───────────────────────────────────────────────────────
const ACCOUNTS: Record<string, { password: string; role: "admin" | "governor" | "organizer"; name: string }> = {
  "tashing112705@gmail.com":   { password: "trisha112705@",  role: "admin",     name: "Trisha" },
  "arielflores@gmail.com":     { password: "ariel12345@",    role: "governor",  name: "Ariel Flores" },
  "heveininocencio@gmail.com": { password: "hevein12345@",   role: "organizer", name: "Hevein Inocencio" },
  "mjalvaro@gmail.com":        { password: "mj122345@",      role: "organizer", name: "MJ Alvaro" },
};

const ROLE_HOME: Record<string, string> = {
  admin:     "/admin",
  governor:  "/admin",
  organizer: "/scanner",
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const account = ACCOUNTS[email.toLowerCase().trim()];

      if (!account) {
        setError("No account found for this email address.");
        setLoading(false);
        return;
      }

      if (account.password !== password) {
        setError("Incorrect password. Please try again.");
        setLoading(false);
        return;
      }

      setCurrentUser({ role: account.role, name: account.name, email: email.toLowerCase().trim() });
      navigate(ROLE_HOME[account.role]);
    }, 600);
  };

  const knownName = email ? ACCOUNTS[email.toLowerCase().trim()]?.name : null;

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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 shadow-lg overflow-hidden">
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-primary-foreground">
              <path d="M12 2C10 6 7 8 7 12a5 5 0 0010 0c0-4-3-6-5-10z"/>
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {knownName ? `Welcome, ${knownName}!` : "Welcome to Lucernas"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {knownName ? "Enter your password to continue" : "Sign in to your account"}
          </p>
        </div>

        <div className="bg-card/70 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-border/50">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition p-1 -m-1"
                >
                  {/* Open eye = password is currently visible. Slashed eye = password is currently hidden. */}
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in…
                </>
              ) : "Sign In"}
            </button>
          </form>
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
