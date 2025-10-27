import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, LogOut, Menu, User } from 'lucide-react';
import { useUserPhoto } from '@/hooks/user/use-user-photo';
import { useUserInfo } from '@/hooks/user/use-user-info';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { navItems } from '@/data/routes';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { NavItem } from './NavItem';

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
          'fixed inset-y-0 left-0 z-50 bg-rz-beige transition-all duration-300 flex flex-col',
          isCollapsed ? 'w-[78px]' : 'w-[250px]',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div
          className={cn(
            'flex items-center h-16 px-4',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-1">
              <Logo /> | <span className="text-xl font-serif">CMS</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              'hidden md:flex hover:bg-rz-white rounded-full',
              isCollapsed && 'rotate-180'
            )}
          >
            <ChevronLeft size={18} />
          </Button>
        </div>

        {/* Navagação */}
        <div className="flex-1 overflow-auto py-4 pl-3">
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

        {/* Avatar do Usuario */}
        <div
          className={cn(
            'border-t border-rz-dark-beige p-3',
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
