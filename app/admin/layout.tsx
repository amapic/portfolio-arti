"use client";

import { AuthProvider } from '../components/SimpleAuthProvider';
import { SimpleAdminRoute } from '../components/SimpleAdminRoute';
import { ThemeProvider } from '../components/ThemeProvider';
import NoSSR from '../components/NoSSR';
import "../globals.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <NoSSR>
      <ThemeProvider>
        <AuthProvider>
          <SimpleAdminRoute>
            <div suppressHydrationWarning={true}>
              {children}
            </div>
          </SimpleAdminRoute>
        </AuthProvider>
      </ThemeProvider>
    </NoSSR>
  );
}
