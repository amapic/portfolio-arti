"use client";

import { AuthProvider } from '../components/AuthProvider';
import { ThemeProvider } from '../components/ThemeProvider';
import BarbaWrapper from '../components/BarbaWrapper';
import BarbaLoadingIndicator from '../components/BarbaLoadingIndicator';
import "../globals.css";
import "../styles/barba-transitions.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div data-barba="wrapper">
          <BarbaLoadingIndicator />
          <BarbaWrapper namespace="admin-layout">
            {children}
          </BarbaWrapper>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
