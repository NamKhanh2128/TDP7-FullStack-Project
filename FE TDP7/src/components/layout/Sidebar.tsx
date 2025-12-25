import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Home, BookOpen, FileText, Calendar, MessageSquare, 
  Settings, LogOut, X, ChevronDown, ChevronRight, User as UserIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationPopover } from './NotificationPopover';

// --- NAV ITEM HELPER ---
interface NavItemProps {
  icon: React.ElementType;
  label: string;
  path?: string;
  children?: { label: string; path: string }[];
  isActive?: boolean;
  onClose?: () => void;
}

function NavItem({ icon: Icon, label, path, children, isActive, onClose }: NavItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const hasChildren = children && children.length > 0;
  const isChildActive = children?.some((child) => location.pathname === child.path || location.search.includes(child.path.split('?')[1] || 'xyz'));

  useEffect(() => { if (isChildActive) setIsOpen(true); }, [isChildActive]);

  if (hasChildren) {
    return (
      <div className="mb-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex w-full items-center justify-between rounded-r-full px-6 py-3 text-left transition-colors border-l-4 border-transparent',
            (isChildActive || isActive) ? 'text-primary font-semibold bg-accent/30' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          )}
        >
          <div className="flex items-center gap-4">
            <Icon className={cn("h-5 w-5", (isChildActive || isActive) ? "text-primary" : "text-muted-foreground")} />
            <span className="text-[15px]">{label}</span>
          </div>
          {isOpen ? <ChevronDown className="h-4 w-4 text-primary/70" /> : <ChevronRight className="h-4 w-4 text-muted-foreground/70" />}
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="flex flex-col space-y-1 pl-14 pr-4 pb-2 pt-1">
                {children!.map((child) => (
                  <Link key={child.path} to={child.path} onClick={onClose}
                    className={cn('block py-2 text-[14px] transition-colors rounded-md px-2',
                      (location.pathname + location.search === child.path) ? 'text-primary font-medium bg-accent/50' : 'text-muted-foreground hover:text-primary hover:bg-accent/20')}>
                    {child.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
  return (
    <Link to={path || '#'} onClick={onClose}
      className={cn('flex items-center gap-4 rounded-r-full px-6 py-3 mb-1 transition-all duration-200 border-l-4',
        isActive ? 'bg-accent/40 border-primary text-primary font-semibold' : 'border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground')}>
      <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
      <span className="text-[15px]">{label}</span>
    </Link>
  );
}

// --- SIDEBAR MAIN ---
interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { icon: Home, label: 'Trang chủ', path: '/dashboard' },
    { icon: BookOpen, label: 'Sổ Hộ Khẩu', path: '/dashboard/household' },
    { icon: FileText, label: 'Khai báo', children: [
        { label: 'Tạm trú / Lưu trú', path: '/dashboard/forms?tab=tamtru' },
        { label: 'Tạm vắng', path: '/dashboard/forms?tab=tamvang' },
        { label: 'Biến động nhân khẩu', path: '/dashboard/forms?tab=biendong' },
    ]},
    { icon: Calendar, label: 'Đặt lịch', path: '/dashboard/booking' },
    { icon: MessageSquare, label: 'Phản ánh', path: '/dashboard/feedback' },
  ];

  return (
    <div 
      className={cn("flex flex-col h-full bg-card border-r border-border", className)}
      style={{
        '--primary': '199 89% 48%',        
        '--gradient-primary': 'linear-gradient(135deg, hsl(199, 89%, 48%) 0%, hsl(174, 58%, 65%) 100%)',
      } as React.CSSProperties}
    >
      {/* HEADER */}
      <div className="relative flex items-center justify-between p-6 h-20 text-white shadow-md" style={{ background: 'var(--gradient-primary)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 border border-white/40 backdrop-blur-md">
            <UserIcon className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 hidden sm:block md:block">
            <h2 className="font-bold text-base truncate">{user?.full_name || 'Cư dân'}</h2>
            <p className="text-xs text-white/90">Cư dân</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <NotificationPopover />
            {onClose && (
              <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10">
                <X className="w-6 h-6" />
              </button>
            )}
        </div>
      </div>

      {/* MENU */}
      <div className="flex-1 overflow-y-auto py-6 pr-3 space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            {...item}
            onClose={onClose}
            isActive={item.path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(item.path || 'xyz')}
          />
        ))}
      </div>

      {/* FOOTER */}
      <div className="border-t border-border p-4 space-y-1 bg-card">
        <Link to="/dashboard/account" onClick={onClose} className="flex items-center gap-4 rounded-lg px-4 py-3 text-muted-foreground hover:bg-muted/50 hover:text-foreground">
          <Settings className="h-5 w-5" /><span className="font-medium text-[15px]">Tài khoản</span>
        </Link>
        <button onClick={() => { if(onClose) onClose(); logout(); }} className="flex w-full items-center gap-4 rounded-lg px-4 py-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive group">
          <LogOut className="h-5 w-5 group-hover:text-destructive" /><span className="font-medium text-[15px]">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}