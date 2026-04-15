// src/components/clinic/layout/ToolWrapper.tsx
import type { ReactNode } from 'react';

interface ToolWrapperProps {
  children: ReactNode;
}

const ToolWrapper = ({ children }: ToolWrapperProps) => {
  return (
    <div className="bg-[rgb(var(--surface))] rounded-2xl shadow-sm border border-[rgb(var(--border))] min-h-full h-full p-6 md:p-10">
      {children}
    </div>
  );
};

export default ToolWrapper;