"use client";

import { AuthProvider } from '../components/AuthProvider';
import { ThemeProvider } from '../components/ThemeProvider';
import "../globals.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
