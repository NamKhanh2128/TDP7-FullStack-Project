import { useState } from 'react';
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar"; 
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function UserLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Hàm lấy tiêu đề trang (hiển thị trên header mobile)
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Trang chủ';
    if (path.includes('household')) return 'Sổ Hộ Khẩu';
    if (path.includes('forms')) return 'Khai báo';
    if (path.includes('booking')) return 'Đặt lịch';
    if (path.includes('account')) return 'Tài khoản';
    return 'Cổng cư dân';
  };

  return (
    <div className="min-h-screen bg-gray-50/30 font-sans antialiased flex flex-col md:flex-row">
      
      {/* --- 1. SIDEBAR DESKTOP --- */}
      <aside className="hidden md:block w-64 fixed inset-y-0 z-30 border-r bg-white shadow-sm">
        <Sidebar />
      </aside>

      {/* --- 2. HEADER MOBILE --- */}
      <header className="md:hidden sticky top-0 z-40 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 h-16 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          {/* Nút 3 gạch */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(true)}
            className="hover:bg-white/20 text-white"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <span className="font-bold text-lg">{getPageTitle()}</span>
        </div>
        <Button variant="ghost" size="icon" className="hover:bg-white/20 text-white">
          <Bell className="h-5 w-5" />
        </Button>
      </header>

      {/* --- 3. NỘI DUNG CHÍNH --- */}
      <main className="flex-1 md:pl-64 min-h-[calc(100vh-64px)] md:min-h-screen transition-all duration-300">
        <Outlet />
      </main>

      {/* --- 4. MOBILE MENU DRAWER --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[99] bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar trượt */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "fixed inset-y-0 left-0 z-[100] w-[280px] bg-white shadow-2xl md:hidden"
              )}
            >
              <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
