import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Check, Clock, Calendar, AlertCircle, Info, CreditCard, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { getNotificationsAPI } from '@/services/apiService';
import { formatDateTime } from '@/utils/formatDate';

// Interface cho dữ liệu từ API
interface Notification {
  id: string;
  title: string;
  type: string;
  content: string;
  location?: string;
  event_date?: string;
  is_urgent?: boolean;
  created_at?: string;
}

// Kiểm tra xem thông báo có phải là "Mới" không (trong vòng 3 ngày qua)
const isNewNotification = (createdAt?: string): boolean => {
  if (!createdAt) return false;
  try {
    const notificationDate = new Date(createdAt);
    const now = new Date();
    const diffTime = now.getTime() - notificationDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 3;
  } catch {
    return false;
  }
};

export function NotificationPopover() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const response = await getNotificationsAPI();
        if (response.success && response.data) {
          // Lấy 5 tin mới nhất
          const latestNotifications = response.data.slice(0, 5);
          setNotifications(latestNotifications);
        } else {
          setNotifications([]);
        }
      } catch (error: any) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Đếm số lượng tin mới (trong vòng 3 ngày qua)
  const newCount = notifications.filter(n => isNewNotification(n.created_at)).length;

  const markAllAsRead = () => {
    // Logic đánh dấu đã đọc (có thể implement sau nếu cần)
    // Hiện tại chỉ là UI, không có API để update read status
  };

  // Lấy icon theo type
  const getIcon = (type: string, isUrgent?: boolean) => {
    if (isUrgent) {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
    const lowerType = type.toLowerCase();
    if (lowerType.includes('y tế') || lowerType.includes('health') || lowerType.includes('tiêm')) {
      return <Info className="w-4 h-4 text-green-600" />;
    }
    if (lowerType.includes('sự kiện') || lowerType.includes('event') || lowerType.includes('meeting') || lowerType.includes('họp')) {
      return <Calendar className="w-4 h-4 text-blue-600" />;
    }
    if (lowerType.includes('thanh toán') || lowerType.includes('payment') || lowerType.includes('phí')) {
      return <CreditCard className="w-4 h-4 text-orange-600" />;
    }
    return <Info className="w-4 h-4 text-blue-600" />;
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
          {newCount > 0 && (
            <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-transparent shadow-sm">
              {newCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      {/* align="start" và side="right" hoặc "bottom" giúp popup không bị che bởi sidebar */}
      <PopoverContent className="w-80 sm:w-96 p-0 border-border shadow-xl z-50 ml-2" align="start" side="bottom">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <h3 className="font-semibold text-sm">Thông báo</h3>
          {newCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
            >
              <Check className="w-3 h-3" /> Đánh dấu đã đọc
            </button>
          )}
        </div>

        <ScrollArea className="h-[320px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Loader2 className="w-6 h-6 mb-2 animate-spin opacity-20" />
              <p className="text-sm">Đang tải thông báo...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Bell className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">Không có thông báo mới</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((item) => {
                const isNew = isNewNotification(item.created_at);
                const displayTime = formatDateTime(item.created_at || item.event_date);
                
                return (
                  <button
                    key={item.id}
                    className={cn(
                      "flex gap-3 p-4 text-left transition-colors hover:bg-muted/50 border-b last:border-0",
                      isNew ? "bg-primary/5" : "bg-background"
                    )}
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/dashboard/news?tab=notifications');
                    }}
                  >
                    <div className={cn(
                      "flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center border shadow-sm mt-0.5", 
                      isNew ? "bg-white border-primary/20" : "bg-muted/50 border-transparent"
                    )}>
                      {getIcon(item.type, item.is_urgent)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <span className={cn("text-sm font-medium leading-tight", isNew ? "text-foreground" : "text-muted-foreground")}>
                          {item.title}
                        </span>
                        {isNew && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.content || 'Không có nội dung'}
                      </p>
                      {displayTime && (
                        <p className="text-[10px] text-muted-foreground/70 flex items-center pt-1">
                          <Clock className="w-3 h-3 mr-1" /> {displayTime}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
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