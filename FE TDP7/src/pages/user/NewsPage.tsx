import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Calendar, MapPin, Bell, FileText, Clock, ArrowRight, Sun, Loader2, AlertCircle,
  Activity, Users, Info, Pill, Megaphone
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { getNotificationsAPI } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import { formatDateTime, formatTime } from '@/utils/formatDate';

// Interface cho dữ liệu từ API
interface Notification {
  id: string;
  title: string;
  type: string;
  content: string;
  location?: string;
  event_date?: string;
  end_date?: string;
  is_urgent?: boolean;
  created_at?: string;
}

const NewsPage = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'news';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNews, setSelectedNews] = useState<Notification | null>(null);
  const [newsData, setNewsData] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const response = await getNotificationsAPI();
        if (response.success && response.data) {
          setNewsData(response.data);
        } else {
          setNewsData([]);
        }
      } catch (error: any) {
        console.error('Error fetching notifications:', error);
        toast({
          title: 'Lỗi',
          description: error.message || 'Không thể tải danh sách tin tức',
          variant: 'destructive',
        });
        setNewsData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) setActiveTab(tabFromUrl);
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  // Format ngày tháng: dd/MM/yyyy (sử dụng formatDate từ utils)
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

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

  // Lấy icon theo type
  const getNotificationIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('y tế') || lowerType.includes('health') || lowerType.includes('tiêm')) {
      return Pill; // Icon thuốc
    }
    if (lowerType.includes('sự kiện') || lowerType.includes('event') || lowerType.includes('meeting') || lowerType.includes('họp')) {
      return Calendar; // Icon lịch
    }
    if (lowerType.includes('hành chính') || lowerType.includes('administrative')) {
      return Info; // Icon thông tin
    }
    if (lowerType.includes('thông báo') || lowerType.includes('notification')) {
      return Megaphone; // Icon loa
    }
    return Bell; // Icon mặc định
  };

  // Lấy màu Badge theo type
  const getBadgeColor = (type: string, isUrgent: boolean) => {
    if (isUrgent) {
      return { variant: 'destructive' as const, className: 'bg-red-500 hover:bg-red-600 text-white' };
    }
    if (type === 'Y tế' || type === 'health') {
      return { variant: 'default' as const, className: 'bg-emerald-500 hover:bg-emerald-600 text-white' };
    }
    if (type === 'Sự kiện' || type === 'event' || type === 'meeting') {
      return { variant: 'default' as const, className: 'bg-blue-500 hover:bg-blue-600 text-white' };
    }
    return { variant: 'outline' as const, className: 'bg-muted/20 border-border/60' };
  };

  // Lấy icon class và bg class theo type
  const getTypeStyles = (type: string) => {
    if (type === 'Y tế' || type === 'health') {
      return { iconClass: 'text-emerald-600', bgClass: 'bg-emerald-50' };
    }
    if (type === 'Sự kiện' || type === 'event' || type === 'meeting') {
      return { iconClass: 'text-blue-600', bgClass: 'bg-blue-50' };
    }
    return { iconClass: 'text-orange-600', bgClass: 'bg-orange-50' };
  };

  const filteredNews = newsData.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div 
      className="container max-w-6xl mx-auto py-8 px-4 md:px-8 space-y-8 animate-fade-in"
      style={{ '--primary': '199 89% 48%' } as React.CSSProperties}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium uppercase tracking-wide">
                <Sun className="h-4 w-4 text-orange-500" />
                {today}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Bảng tin cư dân</h1>
            <p className="text-muted-foreground text-lg">Cập nhật tin tức mới nhất và thông báo dành riêng cho bạn</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          <Input 
            placeholder="Tìm kiếm tin tức..." 
            className="pl-9 h-11 bg-white/50 backdrop-blur-sm border-muted-foreground/20 focus-visible:ring-primary shadow-sm" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABS */}
      <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2 p-1 bg-muted/50 border border-border/50 rounded-lg">
          <TabsTrigger value="news" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md transition-all font-medium">Tin tức & Sự kiện</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md transition-all font-medium">Thông báo của tôi</TabsTrigger>
        </TabsList>

        {/* TAB NEWS */}
        <TabsContent value="news" className="mt-6 space-y-6">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                    <Loader2 className="w-10 h-10 mb-2 opacity-20 animate-spin" />
                    <p>Đang tải tin tức...</p>
                </div>
            ) : filteredNews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.map((item, index) => {
                    const badgeStyle = getBadgeColor(item.type, item.is_urgent || false);
                    const typeStyles = getTypeStyles(item.type);
                    const displayDate = item.event_date ? formatDate(item.event_date) : (item.created_at ? formatDate(item.created_at) : '');
                    
                    return (
                    <motion.div 
                        key={item.id} 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: index * 0.1 }}
                        className={item.is_urgent ? 'animate-pulse' : ''}
                    >
                    <Card 
                        className="h-full border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer overflow-hidden bg-white flex flex-col"
                        onClick={() => setSelectedNews(item)}
                    >
                        {/* Decorative Top Bar */}
                        <div className={`h-1.5 w-full shrink-0 ${index % 2 === 0 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gradient-to-r from-teal-400 to-emerald-500'}`} />
                        
                        <CardContent className="p-6 flex flex-col flex-1 gap-4">
                            <div className="flex justify-between items-start gap-2">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${typeStyles.bgClass}`}>
                                    <FileText className={`w-6 h-6 ${typeStyles.iconClass}`} />
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge 
                                        variant={badgeStyle.variant} 
                                        className={`font-normal text-xs ${badgeStyle.className}`}
                                    >
                                        {item.is_urgent ? 'Khẩn cấp' : item.type}
                                    </Badge>
                                    {item.is_urgent && (
                                        <div className="flex items-center gap-1 text-red-500 text-xs">
                                            <AlertCircle className="w-3 h-3" />
                                            <span>Khẩn</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2 flex-1">
                                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">{item.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{item.content || ''}</p>
                            </div>
                            <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground mt-auto">
                                {displayDate && (
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" /> 
                                        <span className="font-medium">{displayDate}</span>
                                    </div>
                                )}
                                {item.location && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" /> 
                                        <span className="truncate max-w-[120px]">{item.location}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    </motion.div>
                    );
                })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                    <Search className="w-10 h-10 mb-2 opacity-20" />
                    <p>{searchTerm ? `Không tìm thấy tin tức nào phù hợp với "${searchTerm}"` : 'Chưa có tin tức nào'}</p>
                </div>
            )}
        </TabsContent>

        {/* TAB NOTIFICATIONS */}
        <TabsContent value="notifications" className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">Đang tải thông báo...</span>
            </div>
          ) : newsData.length === 0 ? (
            <Card className="border shadow-sm">
              <CardContent className="p-12 text-center text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Chưa có thông báo nào</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border shadow-sm overflow-hidden">
              <CardContent className="p-0 divide-y divide-border/60">
                {newsData.map((notif, index) => {
                  const Icon = getNotificationIcon(notif.type);
                  const isNew = isNewNotification(notif.created_at);
                  const displayTime = formatDateTime(notif.created_at || notif.event_date);
                  const badgeStyle = getBadgeColor(notif.type, notif.is_urgent || false);
                  
                  return (
                    <motion.div 
                      key={notif.id}
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-start gap-4 p-5 hover:bg-muted/40 transition-colors cursor-pointer group ${isNew ? 'bg-primary/5' : 'bg-white'}`}
                      onClick={() => setSelectedNews(notif)}
                    >
                      <div className={`mt-0.5 h-10 w-10 rounded-full flex items-center justify-center border shadow-sm ${isNew ? 'bg-white border-primary/20 text-primary' : 'bg-muted/30 border-transparent text-muted-foreground'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex justify-between items-start">
                          <h4 className={`text-sm font-semibold ${isNew ? 'text-foreground' : 'text-muted-foreground'}`}>{notif.title}</h4>
                          {displayTime && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" /> {displayTime}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground/90 leading-relaxed line-clamp-2">
                          {notif.content || 'Không có nội dung'}
                        </p>
                        <div className="flex items-center gap-3 pt-1">
                          <Badge 
                            variant={badgeStyle.variant} 
                            className={`text-[10px] h-5 px-2 font-normal ${badgeStyle.className}`}
                          >
                            {notif.is_urgent ? 'Khẩn cấp' : notif.type}
                          </Badge>
                          {isNew && (
                            <span className="flex items-center gap-1 text-[11px] text-primary font-medium animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Mới
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* --- CÂN ĐỐI LẠI POPUP (DIALOG) --- */}
      <Dialog open={!!selectedNews} onOpenChange={(open) => !open && setSelectedNews(null)}>
        {/* - max-h-[90vh]: Đảm bảo không bao giờ cao hơn 90% màn hình.
          - flex flex-col: Để nội dung bên trong tự động chia layout.
          - overflow-hidden: Ẩn thanh cuộn của container ngoài, chỉ cuộn nội dung.
        */}
        <DialogContent className="max-w-lg w-[95vw] sm:w-full p-0 overflow-hidden max-h-[90vh] flex flex-col border-0 shadow-2xl rounded-xl gap-0">
            {selectedNews && (() => {
                const typeStyles = getTypeStyles(selectedNews.type);
                const badgeStyle = getBadgeColor(selectedNews.type, selectedNews.is_urgent || false);
                const displayDate = selectedNews.event_date ? formatDate(selectedNews.event_date) : (selectedNews.created_at ? formatDate(selectedNews.created_at) : '');
                
                // Format thời gian: Hiển thị "Từ - Đến" nếu có cả event_date và end_date
                const startTime = selectedNews.event_date ? new Date(selectedNews.event_date) : null;
                const endTime = selectedNews.end_date ? new Date(selectedNews.end_date) : null;
                
                // Hàm helper format giờ phút (HH:mm) với múi giờ Việt Nam
                const formatTimeDisplay = (date: Date | null): string => {
                  if (!date || isNaN(date.getTime())) return '';
                  return date.toLocaleTimeString('vi-VN', { 
                    timeZone: 'Asia/Ho_Chi_Minh',
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                };
                
                const startStr = formatTimeDisplay(startTime); // Ví dụ: "09:00"
                const endStr = formatTimeDisplay(endTime);     // Ví dụ: "10:00"
                
                let timeDisplay = startStr;
                if (endTime && endStr) {
                  // Quan trọng: Phải nối chuỗi start và end
                  timeDisplay = `${startStr} - ${endStr}`; 
                }
                
                // Debug log
                console.log("Time Debug:", { start: startStr, end: endStr, timeDisplay });
                
                const timeStr = timeDisplay || null;
                
                return (
                <>
                    {/* 1. Header Image (Fixed Height) */}
                    <div className={`h-20 w-full shrink-0 flex items-center justify-center ${typeStyles.bgClass} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                        <FileText className={`w-8 h-8 opacity-60 ${typeStyles.iconClass}`} />
                        {selectedNews.is_urgent && (
                            <div className="absolute top-2 right-2">
                                <Badge variant="destructive" className="text-xs animate-pulse">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Khẩn cấp
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* 2. Dialog Header (Fixed) */}
                    <DialogHeader className="px-6 pt-5 pb-2 shrink-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge 
                                variant={badgeStyle.variant} 
                                className={`text-[10px] h-5 px-2 ${badgeStyle.className}`}
                            >
                                {selectedNews.is_urgent ? 'Khẩn cấp' : selectedNews.type}
                            </Badge>
                            {displayDate && (
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {displayDate}
                                </span>
                            )}
                        </div>
                        <DialogTitle className="text-xl font-bold leading-snug pr-4">
                            {selectedNews.title}
                        </DialogTitle>
                    </DialogHeader>

                    {/* 3. Scrollable Content (Flexible) */}
                    {/* Sử dụng div thường với overflow-y-auto để tránh lỗi mất chữ của ScrollArea khi lồng nhau phức tạp */}
                    <div className="flex-1 overflow-y-auto px-6 py-2">
                        <div className="space-y-4 pb-4">
                            {/* Info Grid */}
                            {(displayDate || selectedNews.location) && (
                                <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3 rounded-lg border text-xs">
                                    {displayDate && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                                            <div className="overflow-hidden">
                                                <p className="text-muted-foreground font-medium">Ngày diễn ra</p>
                                                <p className="font-semibold truncate">{displayDate}</p>
                                            </div>
                                        </div>
                                    )}
                                    {timeStr && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                                            <div className="overflow-hidden">
                                                <p className="text-muted-foreground font-medium">Thời gian</p>
                                                <p className="font-semibold truncate">{timeStr}</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedNews.location && (
                                        <div className={`flex items-center gap-2 ${displayDate && timeStr ? 'col-span-2' : displayDate || timeStr ? 'col-span-2' : ''}`}>
                                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                            <div className="overflow-hidden">
                                                <p className="text-muted-foreground font-medium">Địa điểm</p>
                                                <p className="font-semibold truncate">{selectedNews.location}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Nội dung chi tiết - Quan trọng: whitespace-pre-wrap để giữ xuống dòng */}
                            <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap text-justify break-words">
                                {selectedNews.content || 'Không có nội dung chi tiết'}
                            </div>
                        </div>
                    </div>

                    {/* 4. Footer (Fixed) */}
                    <DialogFooter className="p-4 pt-3 border-t bg-white shrink-0">
                        <Button onClick={() => setSelectedNews(null)} className="w-full h-10 sm:w-auto">
                            Đóng
                        </Button>
                    </DialogFooter>
                </>
                );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsPage;