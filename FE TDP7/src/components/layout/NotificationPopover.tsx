import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Check, Clock, Calendar, AlertCircle, Info, CreditCard 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';

// --- MOCK DATA ---
const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'schedule', title: 'Lịch họp tổ dân phố', message: 'Nhắc nhở: Cuộc họp bắt đầu lúc 19:30 tối nay.', time: '30 phút trước', read: false },
  { id: 2, type: 'payment', title: 'Phí vệ sinh tháng 12', message: 'Hóa đơn tháng 12/2025 đã sẵn sàng.', time: '2 giờ trước', read: false },
  { id: 3, type: 'info', title: 'Khai báo tạm trú thành công', message: 'Hồ sơ đã được duyệt.', time: '1 ngày trước', read: true },
  { id: 4, type: 'alert', title: 'Cắt nước tạm thời', message: 'Khu vực bảo trì đường ống nước ngày mai.', time: '2 ngày trước', read: true },
];

export function NotificationPopover() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false); // Control state để đóng popup sau khi click xem tất cả
  const navigate = useNavigate();
  
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'schedule': return <Calendar className="w-4 h-4 text-violet-600" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-orange-600" />;
      case 'alert': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "relative text-white/90 hover:text-white hover:bg-white/20 transition-all", 
            isOpen && "bg-white/20 text-white"
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-transparent shadow-sm">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      {/* align="start" và side="right" hoặc "bottom" giúp popup không bị che bởi sidebar */}
      <PopoverContent className="w-80 sm:w-96 p-0 border-border shadow-xl z-50 ml-2" align="start" side="bottom">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <h3 className="font-semibold text-sm">Thông báo</h3>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
            >
              <Check className="w-3 h-3" /> Đánh dấu đã đọc
            </button>
          )}
        </div>

        <ScrollArea className="h-[320px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Bell className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">Không có thông báo mới</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((item) => (
                <button
                  key={item.id}
                  className={cn(
                    "flex gap-3 p-4 text-left transition-colors hover:bg-muted/50 border-b last:border-0",
                    !item.read ? "bg-primary/5" : "bg-background"
                  )}
                  onClick={() => {
                     // Logic khi click vào thông báo (nếu cần)
                  }}
                >
                  <div className={cn(
                    "flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center border shadow-sm mt-0.5", 
                    !item.read ? "bg-white border-primary/20" : "bg-muted/50 border-transparent"
                  )}>
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <span className={cn("text-sm font-medium leading-tight", !item.read ? "text-foreground" : "text-muted-foreground")}>
                        {item.title}
                      </span>
                      {!item.read && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 flex items-center pt-1">
                      <Clock className="w-3 h-3 mr-1" /> {item.time}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t bg-muted/30">
          <Button 
            variant="ghost" 
            className="w-full text-xs h-8 text-muted-foreground hover:text-primary hover:bg-white"
            onClick={() => {
              setIsOpen(false);
              navigate('/dashboard/news?tab=notifications');
            }}
          >
            Xem tất cả thông báo
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}