"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import PortfolioHeader from './PortfolioHeader';

export const ConditionalHeader: React.FC = () => {
  const pathname = usePathname();
  
  // Pages qui utilisent le Header de navigation (admin et mentions légales)
  const useNavigationHeader = pathname?.startsWith('/admin') || pathname === '/mentions-legales';
  
  if (useNavigationHeader) {
    return <Header />;
  }
  
  // Pour toutes les autres pages (home, about, contact), utiliser PortfolioHeader
  return <PortfolioHeader />;
};