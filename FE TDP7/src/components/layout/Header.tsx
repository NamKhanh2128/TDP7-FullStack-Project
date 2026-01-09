import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface HeaderProps {
  notificationCount?: number;
}

export function Header({ notificationCount = 3 }: HeaderProps) {
  const { user } = useAuth();
  
  return (
    <header className="gradient-primary sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary-foreground/20">
            {user?.avatar ? (
              <AvatarImage src={user.avatar} alt={user.full_name || 'User'} />
            ) : null}
            <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground">
              {user?.full_name ? (
                user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              ) : (
                <User className="h-5 w-5" />
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-primary-foreground/80">Xin chào,</p>
            <p className="font-semibold text-primary-foreground">{user?.full_name || 'Người dùng'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-primary-foreground hover:bg-primary-foreground/10">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-[10px]" variant="destructive">
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-card">
              <div className="p-3 font-medium border-b border-border">Thông báo mới</div>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <span className="font-medium">Họp tổ dân phố</span>
                <span className="text-sm text-muted-foreground">19h00 ngày 28/12/2024</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <span className="font-medium">Tiêm vắc-xin cúm</span>
                <span className="text-sm text-muted-foreground">Dành cho người cao tuổi</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <span className="font-medium">Thu tiền điện</span>
                <span className="text-sm text-muted-foreground">25-30/12/2024</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
