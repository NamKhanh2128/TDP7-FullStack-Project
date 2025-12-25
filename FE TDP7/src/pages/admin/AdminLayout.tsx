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
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { pendingRequests } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare } from 'lucide-react'; // Nhớ import icon

const menuItems = [
  { icon: LayoutDashboard, label: 'Thống kê', path: '/admin' },
  { icon: ClipboardCheck, label: 'Phê duyệt', path: '/admin/approvals', badge: pendingRequests.length },
  // Đã chuyển Phản ánh xuống dưới Phê duyệt
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

function NavItem({ item, collapsed, onNavigate }: NavItemProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const hasChildren = 'children' in item && item.children;
  const isActive = item.path ? location.pathname === item.path : 
    hasChildren ? item.children?.some(c => location.pathname === c.path) : false;

  if (hasChildren && item.children) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors',
            isActive
              ? 'bg-accent text-accent-foreground font-medium'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
            {!collapsed && <span>{item.label}</span>}
          </div>
          {!collapsed && (
            <ChevronRight className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-90')} />
          )}
        </button>
        <AnimatePresence>
          {isOpen && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="ml-8 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.path}
                    to={child.path}
                    onClick={onNavigate}
                    className={cn(
                      'block rounded-lg px-3 py-2 text-sm transition-colors',
                      location.pathname === child.path
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
        'flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors',
        isActive
          ? 'bg-accent text-accent-foreground font-medium'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <div className="flex items-center gap-3">
        <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
        {!collapsed && <span>{item.label}</span>}
      </div>
      {!collapsed && item.badge && item.badge > 0 && (
        <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
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

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/'); 
    closeMobileMenu();
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TDP</span>
            </div>
            <span className="font-semibold text-foreground">Quản trị viên</span>
          </div>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={closeMobileMenu}
            className="h-8 w-8"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavItem 
            key={item.label} 
            item={item} 
            collapsed={isMobile ? false : collapsed}
            onNavigate={isMobile ? closeMobileMenu : undefined}
          />
        ))}
      </nav>

      {/* Footer - NÚT ĐĂNG XUẤT (ĐÃ TÔ ĐỎ) */}
      <div className="p-2 border-t border-border">
        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
            // Thay đổi class màu sắc ở đây:
            'text-red-600 hover:bg-red-50 hover:text-red-700' 
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {(!collapsed || isMobile) && <span className="font-medium">Đăng xuất</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex sticky top-0 h-screen bg-card border-r border-border transition-all duration-300 flex-col',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 md:hidden gradient-primary">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">TDP</span>
              </div>
              <span className="font-semibold text-primary-foreground">Quản trị</span>
            </div>
          </div>
          {pendingRequests.length > 0 && (
            <Link to="/admin/approvals">
              <Badge variant="destructive" className="animate-pulse">
                {pendingRequests.length} chờ duyệt
              </Badge>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 md:hidden"
            onClick={closeMobileMenu}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 z-50 h-full w-72 bg-card shadow-xl flex flex-col md:hidden"
          >
            <SidebarContent isMobile />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
