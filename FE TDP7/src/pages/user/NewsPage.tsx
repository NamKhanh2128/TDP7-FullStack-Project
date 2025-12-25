import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Calendar, MapPin, Bell, FileText, Clock, ArrowRight, Sun 
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

// --- MOCK DATA ---
const NEWS_DATA = [
  {
    id: 1,
    category: 'Sự kiện',
    title: 'Họp tổ dân phố Quý 4/2025',
    desc: 'Tổng kết hoạt động năm 2025 và triển khai kế hoạch năm mới.',
    content: `Kính mời đại diện các hộ gia đình tham gia cuộc họp Tổ dân phố Quý 4 năm 2025.
    
    Nội dung cuộc họp:
    1. Tổng kết tình hình an ninh trật tự, vệ sinh môi trường năm 2025.
    2. Báo cáo thu chi quỹ tổ dân phố công khai.
    3. Triển khai kế hoạch hoạt động và thu các loại phí năm 2026.
    4. Bầu lại Ban quản lý tổ dân phố nhiệm kỳ mới.
    
    Sự hiện diện của quý vị là đóng góp quan trọng cho sự phát triển của khu dân cư. Vui lòng đi đúng giờ để cuộc họp đạt kết quả tốt nhất.`,
    date: '28/12/2025',
    time: '19:30 - 21:00',
    location: 'Nhà văn hóa Phường (Tầng 2)',
    iconClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
  },
  {
    id: 2,
    category: 'Y tế',
    title: 'Lịch tiêm chủng mở rộng đợt 1/2026',
    desc: 'Tiêm vắc-xin cho trẻ em dưới 5 tuổi. Phụ huynh vui lòng mang theo sổ tiêm chủng.',
    content: `Trạm Y tế Phường thông báo lịch tiêm chủng mở rộng đợt 1 năm 2026 như sau:
    
    - Đối tượng: Trẻ em dưới 5 tuổi chưa tiêm đủ mũi.
    - Các loại vắc-xin: 5 trong 1, Bại liệt, Sởi - Rubella.
    
    Lưu ý quan trọng:
    - Phụ huynh bắt buộc mang theo Sổ tiêm chủng của trẻ để đối chiếu.
    - Trẻ đang ốm, sốt vui lòng báo ngay cho bác sĩ khám sàng lọc để được tư vấn lùi lịch tiêm.
    - Sau khi tiêm, vui lòng theo dõi trẻ 30 phút tại trạm để đảm bảo an toàn.`,
    date: '05/01/2026',
    time: '08:00 - 11:30',
    location: 'Trạm Y tế Phường',
    iconClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50',
  },
  {
    id: 3,
    category: 'Thông báo',
    title: 'Thu phí vệ sinh môi trường năm 2026',
    desc: 'Thông báo mức thu phí vệ sinh môi trường mới áp dụng từ tháng 1/2026.',
    content: `Thực hiện Nghị quyết của HĐND Thành phố, mức thu phí vệ sinh môi trường (thu gom rác thải sinh hoạt) sẽ điều chỉnh từ ngày 01/01/2026.
    
    Mức thu cụ thể:
    - Hộ gia đình không kinh doanh: 6.000đ/người/tháng.
    - Hộ kinh doanh ăn uống: 120.000đ/tháng.
    - Hộ kinh doanh khác: 50.000đ/tháng.
    
    Hình thức thu:
    1. Tổ trưởng tổ dân phố sẽ đến thu trực tiếp tại nhà và phát biên lai.
    2. Cư dân có thể đóng qua App trong mục "Thanh toán hóa đơn".
    
    Rất mong sự hợp tác của quý cư dân để giữ gìn vệ sinh môi trường chung.`,
    date: '01/01/2026',
    time: 'Cả ngày',
    location: 'Toàn địa bàn',
    iconClass: 'text-orange-600',
    bgClass: 'bg-orange-50',
  },
];

const NOTIFICATIONS_DATA = [
  { id: 1, title: 'Nhắc nhở lịch họp', message: 'Cuộc họp tổ dân phố bắt đầu sau 30 phút nữa.', time: '30 phút trước', read: false, type: 'Lịch họp' },
  { id: 2, title: 'Hóa đơn tiền điện tháng 12', message: 'Bạn có hóa đơn tiền điện chưa thanh toán.', time: '2 giờ trước', read: false, type: 'Thanh toán' },
  { id: 3, title: 'Đăng ký tạm trú thành công', message: 'Hồ sơ của bạn đã được duyệt.', time: '1 ngày trước', read: true, type: 'Hành chính' },
  { id: 4, title: 'Cảnh báo cắt nước', message: 'Cắt nước từ 14h-17h ngày mai để bảo trì.', time: '2 ngày trước', read: true, type: 'Cảnh báo' },
];

const NewsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'news';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNews, setSelectedNews] = useState<typeof NEWS_DATA[0] | null>(null);
  
  const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) setActiveTab(tabFromUrl);
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  const filteredNews = NEWS_DATA.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchTerm.toLowerCase())
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
            {filteredNews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.map((item, index) => (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                    <Card 
                        className="h-full border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer overflow-hidden bg-white flex flex-col"
                        onClick={() => setSelectedNews(item)}
                    >
                        {/* Decorative Top Bar */}
                        <div className={`h-1.5 w-full shrink-0 ${index % 2 === 0 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gradient-to-r from-teal-400 to-emerald-500'}`} />
                        
                        <CardContent className="p-6 flex flex-col flex-1 gap-4">
                            <div className="flex justify-between items-start">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.bgClass}`}>
                                    <FileText className={`w-6 h-6 ${item.iconClass}`} />
                                </div>
                                <Badge variant="outline" className="font-normal text-muted-foreground border-border/60 bg-muted/20">{item.category}</Badge>
                            </div>
                            <div className="space-y-2 flex-1">
                                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">{item.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{item.desc}</p>
                            </div>
                            <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground mt-auto">
                                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> <span className="font-medium">{item.date}</span></div>
                                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> <span>{item.location}</span></div>
                            </div>
                        </CardContent>
                    </Card>
                    </motion.div>
                ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                    <Search className="w-10 h-10 mb-2 opacity-20" />
                    <p>Không tìm thấy tin tức nào phù hợp</p>
                </div>
            )}
        </TabsContent>

        {/* TAB NOTIFICATIONS */}
        <TabsContent value="notifications" className="mt-6">
          <Card className="border shadow-sm overflow-hidden">
            <CardContent className="p-0 divide-y divide-border/60">
              {NOTIFICATIONS_DATA.map((notif, index) => (
                <motion.div 
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-start gap-4 p-5 hover:bg-muted/40 transition-colors cursor-pointer group ${!notif.read ? 'bg-primary/5' : 'bg-white'}`}
                >
                  <div className={`mt-0.5 h-10 w-10 rounded-full flex items-center justify-center border shadow-sm ${!notif.read ? 'bg-white border-primary/20 text-primary' : 'bg-muted/30 border-transparent text-muted-foreground'}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between items-start">
                      <h4 className={`text-sm font-semibold ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>{notif.title}</h4>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" /> {notif.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground/90 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-3 pt-1">
                      <Badge variant="secondary" className="text-[10px] h-5 px-2 font-normal bg-muted/50 hover:bg-muted">{notif.type}</Badge>
                      {!notif.read && <span className="flex items-center gap-1 text-[11px] text-primary font-medium animate-pulse"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Mới</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- CÂN ĐỐI LẠI POPUP (DIALOG) --- */}
      <Dialog open={!!selectedNews} onOpenChange={(open) => !open && setSelectedNews(null)}>
        {/* - max-h-[90vh]: Đảm bảo không bao giờ cao hơn 90% màn hình.
          - flex flex-col: Để nội dung bên trong tự động chia layout.
          - overflow-hidden: Ẩn thanh cuộn của container ngoài, chỉ cuộn nội dung.
        */}
        <DialogContent className="max-w-lg w-[95vw] sm:w-full p-0 overflow-hidden max-h-[90vh] flex flex-col border-0 shadow-2xl rounded-xl gap-0">
            {selectedNews && (
                <>
                    {/* 1. Header Image (Fixed Height) */}
                    <div className={`h-20 w-full shrink-0 flex items-center justify-center ${selectedNews.bgClass} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                        <FileText className={`w-8 h-8 opacity-60 ${selectedNews.iconClass}`} />
                        {/* Nút đóng X (Optional nếu muốn hiển thị rõ hơn) */}
                    </div>

                    {/* 2. Dialog Header (Fixed) */}
                    <DialogHeader className="px-6 pt-5 pb-2 shrink-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px] h-5 px-2">
                                {selectedNews.category}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {selectedNews.date}
                            </span>
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
                            <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3 rounded-lg border text-xs">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <div className="overflow-hidden">
                                        <p className="text-muted-foreground font-medium">Ngày diễn ra</p>
                                        <p className="font-semibold truncate">{selectedNews.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <div className="overflow-hidden">
                                        <p className="text-muted-foreground font-medium">Thời gian</p>
                                        <p className="font-semibold truncate">{selectedNews.time || 'Cả ngày'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 col-span-2">
                                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <div className="overflow-hidden">
                                        <p className="text-muted-foreground font-medium">Địa điểm</p>
                                        <p className="font-semibold truncate">{selectedNews.location}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Nội dung chi tiết - Quan trọng: whitespace-pre-wrap để giữ xuống dòng */}
                            <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap text-justify break-words">
                                {selectedNews.content}
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
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsPage;