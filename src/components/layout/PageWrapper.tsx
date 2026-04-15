// src/components/layout/PageWrapper.tsx
interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const PageWrapper = ({ children, className = "" }: PageWrapperProps) => {
  return (
    <div className={`max-w-5xl mx-auto px-6 md:px-12 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

export default PageWrapper;