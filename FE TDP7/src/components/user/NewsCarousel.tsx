import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Activity, Info, BellRing, Loader2 } from "lucide-react";
import { getNotificationsAPI } from "@/services/apiService";
import { formatDateTime } from "@/utils/formatDate";

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

// Hàm lấy icon và màu sắc theo type
const getTypeConfig = (type: string) => {
  const lowerType = type.toLowerCase();
  
  if (lowerType.includes('y tế') || lowerType.includes('health') || lowerType.includes('tiêm') || lowerType.includes('y tế')) {
    return { icon: Activity, color: "text-green-600", bg: "bg-green-100", badgeClass: "bg-green-500 hover:bg-green-600 text-white" };
  }
  if (lowerType.includes('sự kiện') || lowerType.includes('event') || lowerType.includes('meeting') || lowerType.includes('họp')) {
    return { icon: Users, color: "text-blue-600", bg: "bg-blue-100", badgeClass: "bg-blue-500 hover:bg-blue-600 text-white" };
  }
  if (lowerType.includes('hành chính') || lowerType.includes('administrative')) {
    return { icon: Info, color: "text-purple-600", bg: "bg-purple-100", badgeClass: "bg-purple-500 hover:bg-purple-600 text-white" };
  }
  // Mặc định
  return { icon: BellRing, color: "text-orange-600", bg: "bg-orange-100", badgeClass: "bg-orange-500 hover:bg-orange-600 text-white" };
};

// Hàm cắt ngắn nội dung
const truncateContent = (content: string, maxLength: number = 80): string => {
  if (!content) return '';
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
};

export function NewsCarousel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const response = await getNotificationsAPI();
        if (response.success && response.data) {
          // Lấy 3 thông báo mới nhất
          const latestNotifications = response.data.slice(0, 3);
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
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Đang tải tin tức...</span>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-12 text-muted-foreground">
        <p className="text-sm">Chưa có tin tức nào</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Carousel
        opts={{
          align: "start",
          loop: notifications.length > 1,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {notifications.map((notification) => {
            const typeConfig = getTypeConfig(notification.type);
            const Icon = typeConfig.icon;
            const displayDate = formatDateTime(notification.event_date || notification.created_at);
            
            return (
              <CarouselItem key={notification.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="border shadow-sm hover:shadow-md transition-all h-full">
                    <CardContent className="p-5 flex flex-col gap-3 h-full">
                      
                      {/* Header Card */}
                      <div className="flex justify-between items-start">
                        <div className={`p-2 rounded-xl ${typeConfig.bg} w-fit`}>
                          <Icon className={`w-5 h-5 ${typeConfig.color}`} />
                        </div>
                        <Badge 
                          variant={notification.is_urgent ? "destructive" : "default"}
                          className={`text-xs font-normal ${notification.is_urgent ? '' : typeConfig.badgeClass}`}
                        >
                          {notification.is_urgent ? 'Khẩn cấp' : notification.type}
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <h3 className="font-semibold text-base line-clamp-1">
                          {notification.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {truncateContent(notification.content)}
                        </p>
                      </div>

                      {/* Footer Date */}
                      <div className="mt-auto pt-2 flex items-center text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        {displayDate || 'Chưa có ngày'}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        {/* Nút điều hướng (Chỉ hiện trên Desktop và khi có nhiều hơn 1 item) */}
        {notifications.length > 1 && (
          <>
            <CarouselPrevious className="hidden md:flex -left-2" />
            <CarouselNext className="hidden md:flex -right-2" />
          </>
        )}
      </Carousel>
    </div>
  );
}