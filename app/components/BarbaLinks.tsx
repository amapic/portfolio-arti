"use client";

import React, { MouseEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BarbaLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  prefetch?: boolean;
}

export const BarbaLink: React.FC<BarbaLinkProps> = ({ 
  href, 
  children, 
  className = '',
  onClick,
  prefetch = false
}) => {
  const router = useRouter();

  const handleClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (onClick) {
      onClick();
    }

    // Import dynamique de Barba.js pour éviter les erreurs SSR
    try {
      const barba = (await import('@barba/core')).default;
      
      if (barba.isRunning) {
        await barba.go(href);
      } else {
        router.push(href);
      }
    } catch (error) {
      console.log('Barba transition failed, using Next.js routing:', error);
      router.push(href);
    }
  };

  return (
    <Link 
      href={href} 
      className={`barba-link ${className}`} 
      onClick={handleClick}
      prefetch={prefetch}
    >
      {children}
    </Link>
  );
};

// Composant de navigation spécialement conçu pour l'admin
interface AdminNavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  icon?: React.ReactNode;
}

export const AdminNavLink: React.FC<AdminNavLinkProps> = ({
  href,
  children,
  isActive = false,
  icon
}) => {
  return (
    <BarbaLink
      href={href}
      className={`
        flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
        ${isActive 
          ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:translate-x-1'
        }
      `}
    >
      {icon && <span className="mr-3">{icon}</span>}
      {children}
    </BarbaLink>
  );
};
