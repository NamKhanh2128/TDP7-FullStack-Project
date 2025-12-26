import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  Building2, 
  FileBarChart,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Megaphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { pendingRequests } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

// Cấu trúc Menu Sidebar
const menuItems = [
  { icon: LayoutDashboard, label: 'Thống kê', path: '/admin' },
  { 
    icon: ClipboardCheck, 
    label: 'Phê duyệt', 
    path: '/admin/approvals', 
    badge: pendingRequests.filter(r => r.status === 'pending').length 
  },
  { icon: Megaphone, label: 'Quản lý thông báo', path: '/admin/news' }, 
  { icon: MessageSquare, label: 'Phản ánh cư dân', path: '/admin/feedback', badge: 3 }, 
  { 
    icon: Users, 
    label: 'Quản lý Dân cư', 
    children: [
      { label: 'Hộ khẩu', path: '/admin/households' },
      { label: 'Nhân khẩu', path: '/admin/residents' },
    ]
  },
  { 
    icon: Building2, 
    label: 'Nhà văn hóa',
    children: [
      { label: 'Tài sản', path: '/admin/assets' },
      { label: 'Lịch đặt', path: '/admin/bookings' },
    ]
  },
  { icon: FileBarChart, label: 'Báo cáo', path: '/admin/reports' },
];

interface NavItemProps {
  item: typeof menuItems[0];
  collapsed: boolean;
  onNavigate?: () => void;
}

// Component cho từng mục Menu
function NavItem({ item, collapsed, onNavigate }: NavItemProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true); // Mặc định mở các menu con
  
  const hasChildren = 'children' in item && item.children;
  const isActive = item.path ? location.pathname === item.path : 
    hasChildren ? item.children?.some(c => location.pathname === c.path) : false;

  if (hasChildren && item.children) {
    return (
      <div className="mb-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex w-full items-center justify-between rounded-lg px-3 py-2 transition-all',
            isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
            {!collapsed && <span>{item.label}</span>}
          </div>
          {!collapsed && (
            <ChevronRight className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-90')} />
          )}
        </button>
        <AnimatePresence>
          {isOpen && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="ml-9 mt-1 space-y-1 border-l-2 border-muted pl-2">
                {item.children.map((child) => (
                  <Link
                    key={child.path}
                    to={child.path}
                    onClick={onNavigate}
                    className={cn(
                      'block rounded-md px-3 py-2 text-sm transition-colors',
                      location.pathname === child.path
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
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
    <Link
      to={item.path || '/admin'}
      onClick={onNavigate}
      className={cn(
        'flex items-center justify-between rounded-lg px-3 py-2.5 mb-1 transition-all',
        isActive
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <div className="flex items-center gap-3">
        <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
        {!collapsed && <span>{item.label}</span>}
      </div>
      {!collapsed && item.badge && item.badge > 0 && (
        <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-[10px] flex items-center justify-center rounded-full">
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full bg-card">
      {/* Logo Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b">
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-xs">TDP</span>
            </div>
            <span className="font-bold text-slate-800 tracking-tight">Quản trị viên</span>
          </div>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 hover:bg-muted"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5 text-muted-foreground" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => (
          <NavItem 
            key={item.label} 
            item={item} 
            collapsed={isMobile ? false : collapsed}
            onNavigate={isMobile ? () => setMobileMenuOpen(false) : undefined}
          />
        ))}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t mt-auto">
        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all group',
            'text-red-500 hover:bg-red-50 hover:text-red-600'
          )}
        >
          <LogOut className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
          {(!collapsed || isMobile) && <span className="font-semibold text-sm">Đăng xuất</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex sticky top-0 h-screen border-r bg-white transition-all duration-300 flex-col z-50 shadow-sm',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 md:hidden bg-primary px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <span className="font-bold text-white tracking-tight">Hệ thống Quản lý</span>
          </div>
          {pendingRequests.filter(r => r.status === 'pending').length > 0 && (
            <Badge variant="destructive" className="animate-pulse bg-white text-red-600 hover:bg-white border-0">
              {pendingRequests.filter(r => r.status === 'pending').length} chờ duyệt
            </Badge>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 z-[70] h-full w-[280px] bg-white shadow-2xl flex flex-col md:hidden"
            >
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-auto pt-16 md:pt-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;