"use client";

import React from 'react';
import Link from 'next/link';
import { CATEGORIES, CategoryType, getCategoryLabel, getCategoryColor } from '../types/categories';

interface CategoryNavigationProps {
  className?: string;
  showAllOption?: boolean;
  variant?: 'horizontal' | 'vertical';
}

export const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
  className = '',
  showAllOption = true,
  variant = 'horizontal'
}) => {
  const containerClass = variant === 'horizontal' 
    ? 'flex flex-wrap gap-2' 
    : 'flex flex-col gap-2';

  return (
    <nav className={`${containerClass} ${className}`}>
      {showAllOption && (
        <Link
          href="/admin/images"
          className="px-3 py-2 text-sm rounded-lg border border-gray-300 
            text-gray-700 bg-white hover:bg-gray-50 transition-colors
            dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          Toutes les catégories
        </Link>
      )}
      
      {CATEGORIES.map((category) => (
        <Link
          key={category.value}
          href={`/admin/images?category=${category.value}`}
          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${getCategoryColor(category.value)}`}
        >
          {getCategoryLabel(category.value)}
        </Link>
      ))}
    </nav>
  );
};

export default CategoryNavigation;
