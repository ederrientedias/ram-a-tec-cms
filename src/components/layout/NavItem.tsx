import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItemProps {
  icon: any;
  label: string;
  href: string;
  isCollapsed: boolean;
}

export const NavItem = ({ icon: Icon, label, href, isCollapsed }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={href}
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-full transition-colors',
              isActive ? 'bg-rz-white text-rz-orange' : 'hover:bg-rz-white text-rz-black'
            )}
          >
            <Icon size={16} />
          </Link>
        </TooltipTrigger>
        <TooltipContent
          className="border border-rz-beige bg-rz-white text-rz-black font-sans font-normal text-xs rounded-none"
          side="right"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      to={href}
      className={cn(
        'flex items-center h-12 px-4 rounded-l-full transition-colors',
        isActive
          ? 'bg-rz-white font-serif text-rz-orange font-medium'
          : 'hover:bg-rz-white font-serif text-rz-black font-medium hover:text-slate-900'
      )}
    >
      <Icon size={16} className="mr-3" />
      <span className="text-base font-normal">{label}</span>
    </Link>
  );
};
