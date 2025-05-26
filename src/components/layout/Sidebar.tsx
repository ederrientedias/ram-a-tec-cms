import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronLeft,
  Database,
  FileText,
  Home,
  LogOut,
  Menu,
  Newspaper,
  Upload,
  User,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUserPhoto } from '@/hooks/user/use-user-photo';
import { useUserInfo } from '@/hooks/user/use-user-info';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NavItemProps {
  icon: any;
  label: string;
  href: string;
  isCollapsed: boolean;
}

const NavItem = ({ icon: Icon, label, href, isCollapsed }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={href}
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-lg transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            )}
          >
            <Icon size={22} />
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
        'flex items-center h-12 px-4 rounded-lg transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
      )}
    >
      <Icon size={20} className="mr-3" />
      <span>{label}</span>
    </Link>
  );
};

const navItems = [
  {
    icon: Home,
    label: 'Dashboard',
    href: '/dashboard',
  },
  // {
  //   icon: Database,
  //   label: 'Fundos',
  //   href: '/fundos',
  // },
  {
    icon: FileText,
    label: 'Portfólios',
    href: '/portfolios',
  },
  {
    icon: Upload,
    label: 'Compliance',
    href: '/compliance',
  },
  {
    icon: FileText,
    label: 'Landing Page',
    href: '/landing-page',
  },
  {
    icon: Newspaper,
    label: 'Publicações',
    href: '/publicacoes',
  },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const { name, email } = useUserInfo();
  const { photo } = useUserPhoto();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.clear();
    document.cookie = 'msal.idtoken.claims=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    navigate('/', { replace: true });
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu size={20} />
      </Button>

      {/* Mobile Sidebar Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 flex flex-col',
          isCollapsed ? 'w-[78px]' : 'w-[250px]',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div
          className={cn(
            'flex items-center h-16 px-4 border-b border-slate-200',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {!isCollapsed && <div className="font-semibold text-base">Portal do Colaborador</div>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn('hidden md:flex', isCollapsed && 'rotate-180')}
          >
            <ChevronLeft size={18} />
          </Button>
        </div>

        <div className="flex-1 overflow-auto py-4 px-3">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isCollapsed={isCollapsed}
              />
            ))}
          </nav>
        </div>

        <div
          className={cn(
            'border-t border-slate-200 p-3',
            isCollapsed ? 'flex justify-center py-4' : 'p-4'
          )}
        >
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={photo} />
                  <AvatarFallback>
                    {name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right">Perfil do Usuário</TooltipContent>
            </Tooltip>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center cursor-pointer">
                  <Avatar className="h-9 w-9 mr-3">
                    <AvatarImage src={photo} />
                    <AvatarFallback>
                      {name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{name}</div>
                    <div className="text-xs text-slate-500 truncate">{email}</div>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() =>
                    toast('Funcionalidade não implementada', {
                      description: 'Perfil será implementado em breve.',
                    })
                  }
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </aside>
    </>
  );
};
