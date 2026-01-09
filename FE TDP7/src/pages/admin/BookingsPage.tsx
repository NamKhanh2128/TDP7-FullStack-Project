import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Check, Eye, 
  MapPin, History, 
  ChevronRight,
  User, Receipt, Tag, FileText, CheckCircle2, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { 
  getAllBookingsAPI, 
  updateBookingStatusAPI 
} from '@/services/apiService';
import { formatDate } from '@/utils/formatDate';

// Interface cho dữ liệu từ API
interface Booking {
  id: string;
  user_id: string;
  facility_id: string;
  booking_date?: string;
  start_time?: string;
  end_time?: string;
  purpose?: string;
  attendees_count?: number;
  status: string;
  created_at?: string;
  user_name?: string;
  facility_name?: string;
  facility_location?: string;
}

const BookingsPage = () => {
  const { toast } = useToast();
  
  // --- STATES ---
  const [bookingRequests, setBookingRequests] = useState<Booking[]>([]);
  const [bookingHistory, setBookingHistory] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch bookings
        const bookingsResponse = await getAllBookingsAPI();
        if (bookingsResponse.success && bookingsResponse.data) {
          const allBookings = bookingsResponse.data;
          // Lọc booking requests (status = 'Pending')
          const pending = allBookings.filter((b: Booking) => b.status === 'Pending');
          setBookingRequests(pending);
          // Lọc booking history (status = 'Approved' hoặc 'Completed')
          const history = allBookings.filter((b: Booking) => 
            b.status === 'Approved' || b.status === 'Completed'
          );
          setBookingHistory(history);
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Lỗi',
          description: error.message || 'Không thể tải dữ liệu',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- HANDLERS ---
  const handleApprove = async () => {
    if (!selectedBooking) return;

    setIsSubmitting(true);
    try {
      const response = await updateBookingStatusAPI(selectedBooking.id, {
        status: 'Approved'
      });

      if (response.success) {
        toast({ 
          title: "Phê duyệt đơn", 
          description: `Đã xác nhận lịch cho ${selectedBooking.user_name || 'người dùng'}` 
        });
        
        // Reload bookings
        const bookingsResponse = await getAllBookingsAPI();
        if (bookingsResponse.success && bookingsResponse.data) {
          const allBookings = bookingsResponse.data;
          const pending = allBookings.filter((b: Booking) => b.status === 'Pending');
          setBookingRequests(pending);
          const history = allBookings.filter((b: Booking) => 
            b.status === 'Approved' || b.status === 'Completed'
          );
          setBookingHistory(history);
        }
        
        setSelectedBooking(null);
      }
    } catch (error: any) {
      console.error('Error approving booking:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể duyệt đơn',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedBooking) return;

    setIsSubmitting(true);
    try {
      // Gọi API PUT /api/bookings/${id}/status với body { status: 'Rejected' }
      const response = await updateBookingStatusAPI(selectedBooking.id, {
        status: 'Rejected'
      });

      if (response.success) {
        // Hiển thị thông báo thành công
        toast({ 
          title: "Đã từ chối yêu cầu", 
          description: `Đã từ chối đơn đặt lịch của ${selectedBooking.user_name || 'người dùng'}` 
        });
        
        // Reload bookings để refresh danh sách
        const bookingsResponse = await getAllBookingsAPI();
        if (bookingsResponse.success && bookingsResponse.data) {
          const allBookings = bookingsResponse.data;
          const pending = allBookings.filter((b: Booking) => b.status === 'Pending');
          setBookingRequests(pending);
          const history = allBookings.filter((b: Booking) => 
            b.status === 'Approved' || b.status === 'Completed'
          );
          setBookingHistory(history);
        }
        
        // Đóng Modal
        setSelectedBooking(null);
      }
    } catch (error: any) {
      console.error('Error rejecting booking:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể từ chối đơn',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen font-sans text-foreground">
      {/* HEADER */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-card">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Quản lý Lịch đặt</h1>
        <div className="flex items-center gap-2 text-primary font-medium text-sm mt-1">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Duyệt đơn và theo dõi lịch sử
        </div>
      </div>

      {/* NỘI DUNG CHÍNH: 2 BẢNG XẾP DỌC */}
      <div className="space-y-8">
        {/* PHẦN 1: YÊU CẦU THUÊ CHỜ XỬ LÝ */}
        <Card className="border-border shadow-card rounded-2xl overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 border-b border-border py-5 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-warning">
                <Clock className="h-5 w-5" /> Yêu cầu thuê chờ xử lý
              </CardTitle>
              <Badge className="bg-warning text-warning-foreground border-none h-6 px-3 font-bold">Mới</Badge>
            </CardHeader>
            <CardContent className="p-0 bg-card">
              <Table>
                <TableHeader className="bg-muted/50 border-b border-border h-12">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6 text-xs font-medium text-muted-foreground">Người thuê</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Dịch vụ</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Ngày giờ</TableHead>
                    <TableHead className="text-right pr-8 text-xs font-medium text-muted-foreground">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : bookingRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                        <p className="text-sm">Không có yêu cầu nào chờ xử lý</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookingRequests.map((req) => {
                      const bookingDate = req.booking_date ? formatDate(req.booking_date) : '';
                      // Backend đã trả về start_time và end_time dưới dạng chuỗi "HH:mm", hiển thị trực tiếp
                      const timeRange = req.start_time 
                        ? (req.end_time 
                            ? `${req.start_time} - ${req.end_time}`
                            : req.start_time)
                        : '';
                      
                      return (
                        <TableRow key={req.id} className="hover:bg-primary/5 transition-colors border-border">
                          <TableCell className="pl-6 py-5">
                            <p className="font-semibold text-foreground text-sm">{req.user_name || 'Người dùng'}</p>
                            <p className="text-[10px] text-muted-foreground">{req.id}</p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-medium text-foreground">{req.facility_name || 'N/A'}</p>
                          </TableCell>
                          <TableCell>
                            {bookingDate && (
                              <p className="text-sm font-medium text-foreground">{bookingDate}</p>
                            )}
                            {timeRange && (
                              <p className="text-[10px] text-muted-foreground">{timeRange}</p>
                            )}
                            {!bookingDate && !timeRange && (
                              <p className="text-xs text-muted-foreground">Chưa có thông tin</p>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button 
                              onClick={() => setSelectedBooking(req)} 
                              variant="outline" 
                              className="h-9 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg font-medium text-xs transition-all"
                            >
                              <Eye className="h-3.5 w-3.5 mr-2" /> Duyệt đơn
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
        </Card>

        {/* PHẦN 2: LỊCH SỬ HOẠT ĐỘNG */}
        <Card className="border-border shadow-card rounded-2xl overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 border-b border-border py-5 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                <History className="h-5 w-5 text-secondary" /> Lịch sử hoạt động
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-primary font-bold hover:bg-primary/10"><Receipt className="h-4 w-4 mr-2" /> Xuất báo cáo</Button>
            </CardHeader>
            <CardContent className="p-0 bg-card">
              <Table>
                <TableHeader className="bg-muted/50 border-b border-border h-12">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6 text-xs font-medium text-muted-foreground w-[30%]">Người sử dụng</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Tài sản & Vị trí</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Thời gian</TableHead>
                    <TableHead className="text-right pr-8 text-xs font-medium text-muted-foreground">Chi tiết</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : bookingHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                        <p className="text-sm">Chưa có lịch sử hoạt động</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookingHistory.map((h) => {
                      const bookingDate = h.booking_date ? formatDate(h.booking_date) : '';
                      // Backend đã trả về start_time và end_time dưới dạng chuỗi "HH:mm", hiển thị trực tiếp
                      const timeRange = h.start_time 
                        ? (h.end_time 
                            ? `${h.start_time} - ${h.end_time}`
                            : h.start_time)
                        : '';
                      
                      return (
                        <TableRow key={h.id} className="border-b border-border last:border-none hover:bg-muted/30 transition-colors group">
                          <TableCell className="pl-6 py-4 align-top">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"><User className="h-4 w-4" /></div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{h.user_name || 'Người dùng'}</p>
                                    <p className="text-[10px] text-muted-foreground">{h.id}</p>
                                </div>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <p className="text-sm font-medium text-primary">{h.facility_name || 'N/A'}</p>
                            {h.facility_location && (
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" /> {h.facility_location}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="align-top">
                            {bookingDate && <p className="text-sm text-foreground">{bookingDate}</p>}
                            {timeRange && <p className="text-[10px] text-muted-foreground">{timeRange}</p>}
                          </TableCell>
                          <TableCell className="text-right pr-8 align-top">
                            <div className="flex flex-col items-end gap-2">
                                <Badge className="bg-success/10 text-success border-none text-[9px] h-5 font-bold uppercase px-2">
                                  {h.status === 'Approved' ? 'Đã duyệt' : 'Hoàn tất'}
                                </Badge>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setSelectedBooking(h)} 
                                    className="h-7 text-[10px] text-muted-foreground hover:text-primary hover:bg-primary/5 px-2"
                                >
                                    Xem chi tiết <ChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
        </Card>
      </div>

      {/* --- POP-UP CHI TIẾT (ĐÃ CHỈNH SỬA GIAO DIỆN) --- */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0 border-none rounded-3xl shadow-elevated bg-card">
          {/* Header Pop-up: Gradient mềm mại, icon trong suốt */}
          <div className={cn("p-6 text-primary-foreground text-center shrink-0 relative overflow-hidden", selectedBooking?.status === 'completed' ? "bg-gradient-to-br from-emerald-500 to-teal-500" : "gradient-primary")}>
              <div className="relative z-10">
                {selectedBooking?.status === 'completed' ? (
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-90" />
                ) : (
                    <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-90" />
                )}
                <DialogTitle className="text-xl font-bold leading-tight">
                    {selectedBooking?.status === 'completed' ? 'Chi tiết lịch sử' : 'Phê duyệt lịch đặt'}
                </DialogTitle>
                <p className="text-xs opacity-80 mt-1 font-medium">
                    {selectedBooking?.status === 'completed' ? 'Đơn đã hoàn thành' : 'Đơn đăng ký dịch vụ'}
                </p>
              </div>
              {/* Decorative shapes */}
              <div className="absolute top-0 left-0 w-full h-full bg-white/10 blur-3xl rounded-full transform -translate-y-1/2 scale-150 pointer-events-none"></div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Người đăng ký: Card nhẹ nhàng */}
              <div className="flex items-center gap-4 bg-accent/30 p-4 rounded-2xl border border-accent">
                  <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shadow-soft"><User className="h-5 w-5" /></div>
                  <div>
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">Người đăng ký</p>
                      <p className="font-bold text-foreground text-base">{selectedBooking?.user_name || 'Người dùng'}</p>
                      <p className="text-xs text-muted-foreground">{selectedBooking?.id}</p>
                  </div>
              </div>

              {/* Chi tiết: Clean layout, bỏ bold đậm */}
              <div className="space-y-5 px-1">
                  <div className="flex gap-4">
                      <div className="mt-0.5 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0"><Tag className="h-4 w-4" /></div>
                      <div className="flex-1">
                          <p className="text-xs text-muted-foreground font-medium mb-1">Tài sản & Vị trí</p>
                          <p className="text-sm font-semibold text-foreground">
                            {selectedBooking?.facility_name || 'N/A'} 
                          </p>
                          {selectedBooking?.facility_location && (
                            <p className="text-xs text-primary mt-0.5">
                              {selectedBooking.facility_location}
                            </p>
                          )}
                      </div>
                  </div>

                  <div className="flex gap-4">
                      <div className="mt-0.5 h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0"><Clock className="h-4 w-4" /></div>
                      <div className="flex-1">
                          <p className="text-xs text-muted-foreground font-medium mb-1">Thời gian sử dụng</p>
                          {selectedBooking?.start_time && (
                            <p className="text-sm font-semibold text-foreground">
                              {selectedBooking.end_time 
                                ? `${selectedBooking.start_time} - ${selectedBooking.end_time}`
                                : selectedBooking.start_time}
                            </p>
                          )}
                          {selectedBooking?.booking_date && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(selectedBooking.booking_date)}
                            </p>
                          )}
                      </div>
                  </div>

                  {selectedBooking?.purpose && (
                    <div className="flex gap-4">
                        <div className="mt-0.5 h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0"><FileText className="h-4 w-4" /></div>
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground font-medium mb-1">Mục đích</p>
                            <p className="text-sm text-foreground/80 leading-relaxed">"{selectedBooking.purpose}"</p>
                        </div>
                    </div>
                  )}
              </div>
          </div>

          <DialogFooter className="p-6 pt-0 bg-transparent flex gap-3 shrink-0 sm:justify-center">
              {selectedBooking?.status === 'completed' ? (
                  <Button onClick={() => setSelectedBooking(null)} className="w-full rounded-xl h-11 border-border text-muted-foreground font-medium hover:bg-muted bg-transparent border shadow-sm">
                      Đóng cửa sổ
                  </Button>
              ) : (
                  <>
                      <Button 
                        variant="outline" 
                        onClick={handleReject} 
                        className="flex-1 rounded-xl h-11 border-border text-muted-foreground font-medium hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20"
                        disabled={isSubmitting}
                      >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang xử lý...
                            </>
                          ) : (
                            'Từ chối'
                          )}
                      </Button>
                      <Button 
                        onClick={handleApprove} 
                        className="flex-1 rounded-xl h-11 gradient-primary font-bold shadow-soft text-primary-foreground hover:opacity-90 border-none"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang xử lý...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" /> Duyệt ngay
                          </>
                        )}
                      </Button>
                  </>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default BookingsPage;