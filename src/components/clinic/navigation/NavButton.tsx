// src/components/clinic/navigation/NavButton.tsx
import { Link, useLocation } from 'react-router-dom';
import { Home, User, PawPrint, Users, Calendar, FileText, Package, Layers, Activity, DollarSign, BarChart3, ShieldCheck, Settings, CreditCard } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  home: Home,
  user: User,
  'paw-print': PawPrint,
  users: Users,
  calendar: Calendar,
  'file-text': FileText,
  package: Package,
  layers: Layers,
  activity: Activity,
  'dollar-sign': DollarSign,
  'bar-chart-3': BarChart3,
  'shield-check': ShieldCheck,
  settings: Settings,
  'credit-card': CreditCard,
};

interface NavButtonProps {
  to: string;
  icon: keyof typeof icons;
  label: string;
  mobile?: boolean;
  mobileDropdown?: boolean;
  onClick?: () => void;           // ← nuevo: para cerrar menú al navegar
}

const NavButton = ({ 
  to, 
  icon: IconName, 
  label, 
  mobileDropdown = false,
  onClick 
}: NavButtonProps) => {
  const { pathname } = useLocation();
  const Icon = icons[IconName];

  const isActive = pathname === `/${to}` || pathname.startsWith(`/${to}/`);

  const handleClick = () => {
    if (onClick) onClick();
  };

  if (mobileDropdown) {
    return (
      <Link
        to={to}
        onClick={handleClick}
        className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition w-full text-base ${
          isActive 
            ? 'bg-[rgb(var(--primary))] text-white font-medium' 
            : 'text-[rgb(var(--text-primary))] hover:bg-[rgba(var(--primary),0.08)]'
        }`}
      >
        <Icon size={22} />
        <span>{label}</span>
      </Link>
    );
  }

  // Estilo default (desktop sidebar)
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
        isActive 
          ? 'bg-[rgb(var(--surface))] text-[rgb(var(--primary))] font-medium' 
          : 'text-[rgb(var(--text-secondary))] hover:bg-[rgba(var(--primary),0.05)] hover:text-[rgb(var(--primary))]'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

export default NavButton;