import LanguageSwitcher from "./LanguageSwitcher";
import "../../styles/legalDocuments.css";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const Wrapper = ({ children, className = "" }: PageWrapperProps) => {
  return (
    <div
      className={`relative w-[clamp(300px,100%,700px)] ${className} legal-container`}
    >
      <div className="absolute top-5 right-4">
        <LanguageSwitcher />
      </div>
      <div className="pt-5 min-h-[calc(100vh-100px)] bg-gray-50 mt-10">
        {children}
      </div>
    </div>
  );
};

export default Wrapper;
