import type { ReactNode } from 'react';

interface InfoNoteProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'info';
  className?: string;
}

const InfoNote = ({ children, variant = 'primary', className = '' }: InfoNoteProps) => {
  // Mapeo de colores basado en tus variables CSS
  const variantStyles = {
    primary: 'border-l-[rgb(var(--primary))] bg-[rgb(var(--surface)/0.5)]',
    success: 'border-l-[rgb(var(--success))] bg-[rgb(var(--success)/0.1)]',
    warning: 'border-l-[rgb(var(--warning))] bg-[rgb(var(--warning)/0.1)]',
    info: 'border-l-[rgb(var(--text-secondary))] bg-[rgb(var(--surface))]',
  };

  return (
    <div
      className={`
        my-4 p-4 
        rounded-r-lg border-l-4 
        border-[rgb(var(--bg))] 
        shadow-md
        ${variantStyles[variant]}
        ${className}
      `}
      style={{
        // Agregamos una orilla contrastante general como pediste
        outline: '1px solid rgb(var(--border) / 0.3)'
      }}
    >
      <div className="flex items-start gap-3">
        {/* Un icono opcional o una etiqueta de "Tip" */}
        <div className="text-[rgb(var(--text))] text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

export default InfoNote;