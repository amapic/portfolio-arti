import React from 'react';

interface ImageComponentProps {
  item: {
    id: number;
    category: string;
    imageUrl: string;
    alt: string;
    titre: string;
    sousTitre: string;
  };
  dimension: [number, number]; // [width, height] en unités de grille
  position: [number, number]; // [col, row] position dans la grille
  index: number;
  onImageRef: (index: number, el: HTMLDivElement | null) => void;
  isVisible: boolean;
}

const ImageComponent: React.FC<ImageComponentProps> = ({
  item,
  dimension,
  position,
  index,
  onImageRef,
  isVisible
}) => {
  const [width, height] = dimension;
  const [col, row] = position;

  // Classes Tailwind pour les dimensions
  const getGridClasses = () => {
    const colSpan = width === 1 ? 'col-span-1' : 'col-span-2';
    const rowSpan = height === 1 ? 'row-span-1' : 'row-span-2';
    return `${colSpan} ${rowSpan}`;
  };

  // Style pour la position absolue dans la grille
  const gridStyle = {
    gridColumn: `${col + 1} / span ${width}`,
    gridRow: `${row + 1} / span ${height}`
  };

  return (
    <div 
      ref={(el) => onImageRef(index, el)}
      data-index={index}
      className={`
        relative overflow-hidden shadow-lg 
        cursor-pointer
        ${isVisible ? 'animate-pulse' : ''}
        ${getGridClasses()}
      `}
      style={gridStyle}
    >
      <img
        src={item.imageUrl}
        alt={item.alt}
        className="w-full h-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/70 via-orange-500/60 to-yellow-500/40 opacity-0 hover:opacity-100 transition-opacity duration-400 flex items-center justify-center">
        <div className="text-center px-4">
          <h3 className="text-white text-lg font-semibold tracking-wider drop-shadow-lg">
            {item.titre }
          </h3>
          {item.sousTitre && (
            <p className="text-white text-sm mt-2 opacity-90 font-light">
              {item.sousTitre}
            </p>
          )}
         
        </div>
      </div>
    </div>
  );
};

export default ImageComponent;
