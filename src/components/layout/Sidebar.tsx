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
      {/* Sidebar */}
      <aside className="min-w-64 bg-rz-white border-r border-r-rz-beige transition-all duration-300 flex flex-col">
        {/* Navagação */}
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
      </aside>
    </>
  );
};
