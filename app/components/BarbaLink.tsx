"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// @ts-ignore - Barba types are not perfect
import barba from '@barba/core';

interface BarbaLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const BarbaLink: React.FC<BarbaLinkProps> = ({ 
  href, 
  children, 
  className = '',
  onClick 
}) => {
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (onClick) {
      onClick();
    }

    // Utiliser Barba.js pour la transition
    if (barba.isRunning) {
      try {
        await barba.go(href);
      } catch (error) {
        console.log('Barba transition failed, falling back to Next.js routing');
        router.push(href);
      }
    } else {
      // Fallback vers Next.js routing si Barba n'est pas initialisé
      router.push(href);
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
};

export default BarbaLink;
