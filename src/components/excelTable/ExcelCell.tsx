// ExcelCell.tsx
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ExcelCellProps {
  options: string[];
  defaultIndex?: number;
  className?: string;
}

const ExcelCell = ({
  options,
  defaultIndex = 0,
  className = '',
}: ExcelCellProps) => {
  const [selectedIndex, setSelectedIndex] = useState(() => {
    if (!options || options.length === 0) return -1;
    if (defaultIndex === -1) return -1;
    return Math.max(0, Math.min(defaultIndex, options.length - 1));
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Verificar clic fuera de la celda
      if (cellRef.current && !cellRef.current.contains(e.target as Node)) {
        // Verificar también que el clic no sea dentro del menú renderizado en el Portal
        const menu = document.getElementById('excel-dropdown-menu');
        if (menu && menu.contains(e.target as Node)) return;
        setIsOpen(false);
      }
    };

    // Cerrar el menú al hacer scroll para que no flote desalineado
    const handleScroll = () => setIsOpen(false);

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // El 'true' final es para la fase de captura, detectando scroll en cualquier contenedor padre
      window.addEventListener('scroll', handleScroll, true); 
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen && cellRef.current) {
      setRect(cellRef.current.getBoundingClientRect());
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleOptionClick = (index: number) => {
    setSelectedIndex(index);
    setIsOpen(false);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const selectedValue = selectedIndex === -1 ? '' : (options[selectedIndex] || '');

  return (
    <div className="w-full h-full min-h-[40px] border border-gray-200">
      <div
        ref={cellRef}
        className={`relative w-full h-full p-3 transition-all cursor-pointer bg-white
                   ${isOpen ? 'ring-2 ring-blue-500 z-20' : 'hover:bg-gray-50'}
                   ${isAnimating ? 'animate-float' : ''} ${className}`}
        onClick={handleToggle}
      >
        <p className="truncate text-gray-800 select-none">
          {selectedValue}
        </p>

        {/* Uso de Portal para renderizar fuera del contenedor con overflow */}
        {isOpen && rect && typeof window !== 'undefined' && createPortal(
          <div
            id="excel-dropdown-menu"
            className="fixed z-[9999] bg-white border border-blue-500 shadow-xl max-h-48 overflow-y-auto"
            style={{
              top: rect.bottom, // Aparece justo debajo de la celda
              left: rect.left,
              width: rect.width, // Respeta el ancho exacto de la celda
            }}
          >
            {options.map((option, index) => (
              <div
                key={index}
                className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${index === selectedIndex ? 'bg-blue-100 font-bold' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOptionClick(index);
                }}
              >
                {option}
              </div>
            ))}
          </div>,
          document.body
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-float { animation: float 400ms ease-in-out; }
      `}</style>
    </div>
  );
};

export default ExcelCell;