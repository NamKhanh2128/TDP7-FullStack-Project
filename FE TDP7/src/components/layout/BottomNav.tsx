import { Home, BookOpen, FileText, Calendar, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  // SỬA LINK TẠI ĐÂY: Thêm /dashboard
  { icon: Home, label: 'Trang chủ', path: '/dashboard' },
  { icon: BookOpen, label: 'Sổ hộ khẩu', path: '/dashboard/household' },
  { icon: FileText, label: 'Khai báo', path: '/dashboard/forms' },
  { icon: Calendar, label: 'Đặt lịch', path: '/dashboard/booking' },
  { icon: User, label: 'Tài khoản', path: '/dashboard/account' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur shadow-elevated md:hidden">
      <div className="container flex items-center justify-around py-2">
        {navItems.map((item) => {
          // Logic kiểm tra Active
          const isActive = item.path === '/dashboard'
            ? location.pathname === '/dashboard'
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg px-2 py-2 transition-colors min-w-[60px]',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')} />
              <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}