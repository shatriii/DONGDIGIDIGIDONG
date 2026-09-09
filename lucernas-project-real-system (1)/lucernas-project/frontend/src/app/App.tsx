import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'sonner';
import { getSession } from './utils/api';
import { setCurrentUser } from './components/Sidebar';

export default function App() {
  // The session lives in an httpOnly cookie, so on a fresh page load we
  // don't know who's logged in until we ask the backend. Without this,
  // every reload would silently kick the user back to a "logged out" UI.
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    getSession()
      .then((session) => setCurrentUser({ id: session.id, role: session.role, name: session.email, email: session.email }))
      .catch(() => setCurrentUser(null))
      .finally(() => setBooted(true));
  }, []);

  if (!booted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors theme="system" />
    </ThemeProvider>
  );
}