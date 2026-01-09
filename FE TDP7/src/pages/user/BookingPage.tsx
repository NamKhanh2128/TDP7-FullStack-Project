import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from '../../components/ui/status-badge';
import { 
  getFacilitiesAPI, 
  createBookingAPI, 
  getUserBookingsAPI 
} from '@/services/apiService';
import { formatDate } from '@/utils/formatDate';
import {
  Plus,
  Calendar,
  Clock,
  Building2,
  Dumbbell,
  CreditCard,
  QrCode,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

// Interface cho dữ liệu từ API
interface Facility {
  id: string;
  name: string;
  description?: string;
  capacity?: number;
  location?: string;
  status?: string;
  maintenance_status?: string;
  price?: number; // Giá thuê (VND)
}

interface Booking {
  id: string;
  facility_id: string;
  booking_date?: string;
  start_time?: string;
  end_time?: string;
  purpose?: string;
  status: string;
  facility_name?: string;
  facility_location?: string;
  created_at?: string;
}

export default function BookingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [timeError, setTimeError] = useState<string>('');
  const { toast } = useToast();

  // States cho dữ liệu từ API
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch facilities và bookings
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch facilities
        const facilitiesResponse = await getFacilitiesAPI();
        if (facilitiesResponse.success && facilitiesResponse.data) {
          setFacilities(facilitiesResponse.data);
        }

        // Fetch user bookings
        const bookingsResponse = await getUserBookingsAPI();
        if (bookingsResponse.success && bookingsResponse.data) {
          setBookings(bookingsResponse.data);
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

  const selectedServiceData = useMemo(() => {
    return facilities.find(f => f.id === selectedService);
  }, [facilities, selectedService]);

  // Hàm tính tiền dựa trên khoảng thời gian
  const calculatePrice = () => {
    if (!startTime || !endTime || !selectedServiceData || !selectedServiceData.price) {
      setTotalPrice(null);
      return;
    }

    // Chuyển đổi giờ sang số để tính toán
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Tính tổng số phút
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // Tính khoảng thời gian (phút)
    const durationMinutes = endMinutes - startMinutes;

    if (durationMinutes <= 0) {
      setTimeError('Giờ kết thúc phải sau giờ bắt đầu');
      setTotalPrice(null);
      return;
    }

    // Chuyển đổi sang giờ (ví dụ: 90 phút = 1.5 giờ)
    const durationHours = durationMinutes / 60;

    // Tính tổng tiền: durationHours * price
    const price = selectedServiceData.price;
    const calculatedPrice = durationHours * price;

    setTotalPrice(calculatedPrice);
    setTimeError('');
  };

  // Tính lại giá mỗi khi thay đổi giờ hoặc dịch vụ
  useEffect(() => {
    calculatePrice();
  }, [startTime, endTime, selectedServiceData]);

  // Validation: Không cho phép chọn giờ trong quá khứ
  const validateTime = (time: string) => {
    if (!selectedDate || !time) return true;

    const selectedDateTime = new Date(`${selectedDate}T${time}`);
    const now = new Date();

    // Nếu chọn ngày hôm nay, kiểm tra giờ không được trong quá khứ
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate === today && selectedDateTime <= now) {
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setStep(1);
    setSelectedService('');
    setSelectedDate('');
    setStartTime('');
    setEndTime('');
    setPurpose('');
    setTotalPrice(null);
    setTimeError('');
  };

  const handleSubmit = async () => {
    // Validation: Phải có service, date và startTime/endTime
    if (!selectedService || !selectedDate || !startTime || !endTime) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    // Validation: Kiểm tra giờ hợp lệ
    if (timeError) {
      toast({
        title: 'Lỗi',
        description: timeError,
        variant: 'destructive',
      });
      return;
    }

    // Validation: Không cho phép chọn giờ trong quá khứ
    if (!validateTime(startTime) || !validateTime(endTime)) {
      toast({
        title: 'Lỗi',
        description: 'Không thể chọn giờ trong quá khứ',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const startTimeStr = startTime;
      const endTimeStr = endTime;

      const payload = {
        facility_id: selectedService,
        booking_date: selectedDate,
        start_time: startTimeStr,
        end_time: endTimeStr,
        purpose: purpose || null,
        attendees_count: null,
        quantity: 1 // Mặc định là 1
      };

      const response = await createBookingAPI(payload);
      
      if (response.success) {
        toast({
          title: 'Đặt lịch thành công',
          description: 'Yêu cầu đặt lịch đã được gửi. Vui lòng chờ phê duyệt.',
        });
        
        // Reload bookings
        const bookingsResponse = await getUserBookingsAPI();
        if (bookingsResponse.success && bookingsResponse.data) {
          setBookings(bookingsResponse.data);
        }
        
        setIsOpen(false);
        resetForm();
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      
      // Lấy error message và status từ error object
      const errorMessage = error.message || '';
      const errorStatus = error.status || error.response?.status;
      
      // Kiểm tra nếu lỗi là 400 và message chứa "đã hết" hoặc "kín lịch"
      const isConflictError = errorStatus === 400 && (
        errorMessage.includes('đã hết') ||
        errorMessage.includes('kín lịch') ||
        errorMessage.includes('đã kín') ||
        errorMessage.includes('Tài sản này đã hết')
      );
      
      if (isConflictError) {
        // Hiển thị thông báo lỗi cụ thể và KHÔNG đóng Modal
        toast({
          title: 'Khung giờ đã kín',
          description: 'Khung giờ này đã kín, vui lòng chọn giờ khác.',
          variant: 'destructive',
        });
        // Không đóng Modal, để User có cơ hội sửa lại giờ
        // setIsOpen vẫn giữ nguyên (true), không gọi setIsOpen(false)
      } else {
        // Các lỗi khác
        toast({
          title: 'Lỗi',
          description: errorMessage || 'Không thể tạo đơn đặt lịch',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Đặt lịch Nhà văn hóa</h1>
          <p className="text-muted-foreground">Đặt hội trường hoặc sân thể thao</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary-bg hover:opacity-90 gap-2 shadow-md" size="sm">
              <Plus className="w-4 h-4" />
              Đặt lịch mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Đặt lịch Nhà văn hóa
              </DialogTitle>
            </DialogHeader>

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-3 py-4">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s ? 'gradient-primary-bg text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                  </div>
                  {s < 4 && (
                    <div className={`w-10 h-0.5 ${step > s ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Select Service */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-medium">Chọn dịch vụ</h3>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
                    <span className="text-sm text-muted-foreground">Đang tải dịch vụ...</span>
                  </div>
                ) : facilities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Chưa có dịch vụ nào</p>
                  </div>
                ) : (
                  <RadioGroup value={selectedService} onValueChange={setSelectedService}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {facilities.map((facility) => {
                        return (
                          <label
                            key={facility.id}
                            className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors shadow-sm ${
                              selectedService === facility.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <RadioGroupItem value={facility.id} id={facility.id} />
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{facility.name}</p>
                              {facility.capacity && (
                                <p className="text-sm text-muted-foreground">
                                  Sức chứa: {facility.capacity} người
                                </p>
                              )}
                              {facility.location && (
                                <p className="text-xs text-muted-foreground">
                                  {facility.location}
                                </p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </RadioGroup>
                )}
                <Button
                  className="w-full gap-2"
                  disabled={!selectedService || isLoading}
                  onClick={() => setStep(2)}
                >
                  Tiếp tục <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Select Date & Time */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-medium">Chọn ngày và giờ</h3>
                <div className="space-y-2">
                  <Label>Ngày sử dụng</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Giờ bắt đầu</Label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => {
                        setStartTime(e.target.value);
                        if (endTime && e.target.value >= endTime) {
                          setTimeError('Giờ kết thúc phải sau giờ bắt đầu');
                        } else {
                          setTimeError('');
                        }
                      }}
                      className={timeError ? 'border-destructive' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Giờ kết thúc</Label>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => {
                        setEndTime(e.target.value);
                        if (startTime && e.target.value <= startTime) {
                          setTimeError('Giờ kết thúc phải sau giờ bắt đầu');
                        } else {
                          setTimeError('');
                        }
                      }}
                      className={timeError ? 'border-destructive' : ''}
                    />
                  </div>
                </div>
                {timeError && (
                  <p className="text-sm text-destructive">{timeError}</p>
                )}
                {totalPrice !== null && !timeError && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Tạm tính:</span>
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(totalPrice)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Mục đích sử dụng</Label>
                  <Input
                    placeholder="Họp tổ dân phố, sinh hoạt cộng đồng,..."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4" /> Quay lại
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    disabled={!selectedDate || !startTime || !endTime || !!timeError}
                    onClick={() => setStep(3)}
                  >
                    Tiếp tục <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Fee Summary */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-medium">Xác nhận thông tin</h3>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dịch vụ:</span>
                      <span className="font-medium">{selectedServiceData?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày:</span>
                      <span className="font-medium">
                        {selectedDate && new Date(selectedDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Giờ:</span>
                      <span className="font-medium">
                        {startTime && endTime ? `${startTime} - ${endTime}` : 'Chưa chọn'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mục đích:</span>
                      <span className="font-medium">{purpose || 'Không có'}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                      <span className="font-medium">Tổng phí:</span>
                      <span className="text-xl font-bold text-primary">
                        {totalPrice !== null ? formatCurrency(totalPrice) : 
                         (selectedServiceData?.price ? 'Chưa tính' : 'Liên hệ để biết giá')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep(2)}>
                    <ArrowLeft className="w-4 h-4" /> Quay lại
                  </Button>
                  <Button className="flex-1 gap-2" onClick={() => setStep(4)}>
                    Xác nhận <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: QR Code Payment */}
            {step === 4 && (
              <div className="space-y-4 text-center">
                <h3 className="font-medium">Thanh toán</h3>
                <div className="p-6 bg-muted/50 rounded-lg">
                  <div className="w-48 h-48 mx-auto bg-white rounded-lg flex items-center justify-center border">
                    <QrCode className="w-32 h-32 text-foreground" />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Quét mã QR để thanh toán
                  </p>
                  <p className="text-2xl font-bold text-primary mt-2">
                    {totalPrice !== null ? formatCurrency(totalPrice) : 
                     (selectedServiceData?.price ? 'Chưa tính' : 'Liên hệ để biết giá')}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sau khi thanh toán, yêu cầu sẽ được gửi đến Tổ trưởng để phê duyệt.
                </p>
                <Button 
                  className="w-full gradient-primary-bg hover:opacity-90 gap-2" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Hoàn tất đặt lịch
                    </>
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs for History */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full max-w-2xl mx-auto grid grid-cols-4 gap-2">
          <TabsTrigger value="all" className="flex-1">Tất cả</TabsTrigger>
          <TabsTrigger value="pending" className="flex-1">Chờ duyệt</TabsTrigger>
          <TabsTrigger value="approved" className="flex-1">Đã duyệt</TabsTrigger>
          <TabsTrigger value="rejected" className="flex-1">Từ chối</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Lịch sử đặt lịch
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">Đang tải...</span>
                </div>
              ) : bookings.length > 0 ? (
                <div className="divide-y divide-border">
                  {bookings.map((booking) => {
                    const bookingDate = booking.booking_date ? formatDate(booking.booking_date) : '';
                    // Backend đã trả về start_time và end_time dưới dạng chuỗi "HH:mm", hiển thị trực tiếp
                    const timeRange = booking.start_time 
                      ? (booking.end_time 
                          ? `${booking.start_time} - ${booking.end_time}`
                          : booking.start_time)
                      : '';
                    
                    return (
                      <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-muted/10 rounded-lg transition">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {booking.facility_name || 'N/A'}
                            </p>
                            {(timeRange || bookingDate) && (
                              <p className="text-sm text-muted-foreground">
                                {timeRange && bookingDate ? `${timeRange} • ${bookingDate}` : (timeRange || bookingDate)}
                              </p>
                            )}
                            {booking.purpose && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {booking.purpose}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={booking.status.toLowerCase()} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Chưa có lịch đặt nào</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                </div>
              ) : bookings.filter(b => b.status === 'Pending').length > 0 ? (
                bookings.filter(b => b.status === 'Pending').map((booking) => {
                  const bookingDate = booking.booking_date ? formatDate(booking.booking_date) : '';
                  return (
                    <div key={booking.id} className="p-4 flex items-center justify-between border-b last:border-0 hover:bg-warning/5 rounded-lg transition">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {booking.facility_name || 'N/A'}
                          </p>
                          {bookingDate && (
                            <p className="text-sm text-muted-foreground">
                              {bookingDate}
                            </p>
                          )}
                        </div>
                      </div>
                      <StatusBadge status="pending" />
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p>Không có yêu cầu chờ duyệt</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                </div>
              ) : bookings.filter(b => b.status === 'Approved' || b.status === 'Completed').length > 0 ? (
                bookings.filter(b => b.status === 'Approved' || b.status === 'Completed').map((booking) => {
                  const bookingDate = booking.booking_date ? formatDate(booking.booking_date) : '';
                  return (
                    <div key={booking.id} className="p-4 flex items-center justify-between border-b last:border-0 hover:bg-success/5 rounded-lg transition">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-success" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {booking.facility_name || 'N/A'}
                          </p>
                          {bookingDate && (
                            <p className="text-sm text-muted-foreground">
                              {bookingDate}
                            </p>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={booking.status === 'Completed' ? 'completed' : 'approved'} />
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p>Không có lịch đã duyệt</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                </div>
              ) : bookings.filter(b => b.status === 'Rejected').length > 0 ? (
                bookings.filter(b => b.status === 'Rejected').map((booking) => {
                  const bookingDate = booking.booking_date ? formatDate(booking.booking_date) : '';
                  return (
                    <div key={booking.id} className="p-4 flex items-center justify-between border-b last:border-0 hover:bg-destructive/5 rounded-lg transition">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-destructive" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {booking.facility_name || 'N/A'}
                          </p>
                          {bookingDate && (
                            <p className="text-sm text-muted-foreground">
                              {bookingDate}
                            </p>
                          )}
                        </div>
                      </div>
                      <StatusBadge status="rejected" />
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p>Không có đơn bị từ chối</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
