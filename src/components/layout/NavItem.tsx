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
  const isActive = location.pathname === `/org/cms/${href}`;

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={href}
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-md transition-colors',
              isActive ? 'bg-beige/40 text-gold' : 'hover:bg-beige/40 text-gold'
            )}
          >
            <Icon size={16} />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      to={href}
      className={cn(
        'flex items-center h-8 px-4 rounded-full transition-colors',
        isActive
          ? 'bg-beige/40 font-sans text-gold font-medium'
          : 'hover:bg-beige/40 font-sans text-black font-medium hover:text-gold'
      )}
    >
      <Icon size={16} className="mr-3" />
      <span className="text-base font-normal">{label}</span>
    </Link>
  );
};
