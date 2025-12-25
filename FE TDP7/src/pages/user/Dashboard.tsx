import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Calendar, BookOpen, MessageSquare, ArrowRight, Sun } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { NewsCarousel } from '@/components/user/NewsCarousel';

const Dashboard = () => {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  
  const features = [
    { icon: BookOpen, label: 'Sổ hộ khẩu', path: '/dashboard/household', bgClass: 'bg-blue-50 hover:bg-blue-100', iconClass: 'text-blue-600' },
    { icon: FileText, label: 'Khai báo', path: '/dashboard/forms', bgClass: 'bg-emerald-50 hover:bg-emerald-100', iconClass: 'text-emerald-600' },
    { icon: Calendar, label: 'Đặt lịch', path: '/dashboard/booking', bgClass: 'bg-violet-50 hover:bg-violet-100', iconClass: 'text-violet-600' },
    { icon: MessageSquare, label: 'Phản ánh', path: '/dashboard/feedback', bgClass: 'bg-orange-50 hover:bg-orange-100', iconClass: 'text-orange-600' },
  ];

  return (
    <motion.div 
      className="container py-8 px-4 md:px-8 space-y-10 max-w-7xl mx-auto"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ '--primary': '199 89% 48%' } as React.CSSProperties}
    >
      <div className="space-y-2">
           <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium uppercase"><Sun className="h-4 w-4 text-orange-500" />{today}</div>
           <h1 className="text-3xl font-bold text-foreground">Xin chào, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-teal-500">{user?.full_name || 'Cư dân'}</span> 👋</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Link key={index} to={feature.path} className="block h-full group outline-none">
            <Card className="h-full border hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="flex flex-col items-start p-6 h-full gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${feature.bgClass}`}>
                  <feature.icon className={`w-7 h-7 ${feature.iconClass}`} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{feature.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">Truy cập nhanh chức năng hệ thống</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-1.5 h-8 rounded-full bg-gradient-to-b from-[hsl(var(--primary))] to-teal-400 block"></span>
            Tin tức & Sự kiện
          </h2>
          <Link to="/dashboard/news?tab=news" className="text-sm font-medium text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-xl border p-1 shadow-sm">
           <NewsCarousel />
        </div>
      </div>
    </motion.div>
  );
};
export default Dashboard;