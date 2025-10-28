import React from 'react';
import { IconType } from 'react-icons';
import * as Hi2Icons from 'react-icons/hi2';
import { HiOutlineTrash } from "react-icons/hi2";
interface CardProps {
  id: string;
  icon: string;
  title: string;
  content: string;
  isLoggedIn: boolean;
  onDelete: (id: string) => void;
}

const Card: React.FC<CardProps> = ({ id, icon, title, content, isLoggedIn, onDelete }) => {
  const Icon = (Hi2Icons as any)[icon];

  return (
    <div
      className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 
        transition-all duration-500 ease-out
        transform perspective-1000 hover:scale-105 hover:shadow-xl
        relative group
        before:absolute before:inset-0 before:z-[-1] before:transition-all before:duration-500
        before:bg-gradient-to-r before:from-blue-50 before:to-blue-100 dark:before:from-blue-900/20 dark:before:to-blue-800/20
        before:opacity-0 hover:before:opacity-100 before:rounded-xl"
    >
      {isLoggedIn && (
        <button
          onClick={() => onDelete(id)}
          className="absolute top-2 right-2 p-2 text-red-500 opacity-0 group-hover:opacity-100 
            transition-opacity hover:text-red-700 rounded-full hover:bg-custom-red dark:hover:bg-custom-red"
          aria-label="Supprimer la carte"
        >
          <HiOutlineTrash className="w-5 h-5" />
        </button>
      )}

      <div className="text-blue-600 mb-4">
        {Icon && <Icon className="w-8 h-8" />}
      </div>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{content}</p>
    </div>
  );
};

export default Card; 