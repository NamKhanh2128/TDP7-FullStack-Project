import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Check, X, Eye, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { bookingSlots, services } from '@/data/mockData';
import { cn } from '@/lib/utils';

// Extended mock booking requests
const bookingRequests = [
  {
    id: 'bk-001',
    applicantName: 'Lê Văn Cường',
    householdCode: 'TDP7-2024-002',
    service: 'Hội trường đám cưới',
    date: '15/01/2025',
    startTime: '10:00',
    endTime: '14:00',
    fee: 500000,
    status: 'pending',
    submittedAt: '20/12/2024 10:00',
    purpose: 'Tiệc cưới con trai',
  },
  {
    id: 'bk-002',
    applicantName: 'Nguyễn Văn An',
    householdCode: 'TDP7-2024-001',
    service: 'Sân cầu lông',
    date: '29/12/2024',
    startTime: '17:00',
    endTime: '19:00',
    fee: 200000,
    status: 'pending',
    submittedAt: '23/12/2024 08:30',
    purpose: 'Sinh hoạt thể thao',
  },
];

const BookingsPage = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedBooking, setSelectedBooking] = useState<typeof bookingRequests[0] | null>(null);

  const handleApprove = () => {
    toast({
      title: 'Đã duyệt',
      description: `Đã xác nhận đặt lịch cho ${selectedBooking?.applicantName}`,
    });
    setSelectedBooking(null);
  };

  const handleReject = () => {
    toast({
      title: 'Đã từ chối',
      description: `Đã từ chối yêu cầu đặt lịch của ${selectedBooking?.applicantName}`,
    });
    setSelectedBooking(null);
  };

  return (
    <div className="p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-foreground">Quản lý lịch đặt</h1>
        <p className="text-muted-foreground">Nhà văn hóa - Tổ dân phố 7</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Lịch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md pointer-events-auto mx-auto"
              />
            </CardContent>
          </Card>

          {/* Services */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Bảng giá dịch vụ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {services.map((service) => (
                <div key={service.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-foreground">{service.name}</span>
                  <Badge variant="secondary">
                    {service.fee.toLocaleString('vi-VN')} VNĐ/{service.unit}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Booking Requests */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Yêu cầu đặt lịch chờ duyệt
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người đặt</TableHead>
                    <TableHead>Dịch vụ</TableHead>
                    <TableHead>Ngày/Giờ</TableHead>
                    <TableHead>Phí</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookingRequests.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.applicantName}</p>
                          <p className="text-xs text-muted-foreground">{booking.householdCode}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{booking.service}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{booking.date}</p>
                          <p className="text-xs text-muted-foreground">
                            {booking.startTime} - {booking.endTime}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {booking.fee.toLocaleString('vi-VN')} VNĐ
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Existing Bookings */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building className="h-5 w-5 text-success" />
                Lịch đã xác nhận
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bookingSlots.filter(s => s.status === 'booked').map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
                        <Building className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{slot.service}</p>
                        <p className="text-sm text-muted-foreground">
                          {slot.date} • {slot.startTime} - {slot.endTime}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="success">Đã xác nhận</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{slot.bookedBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Booking Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 text-primary-foreground" />
              </div>
              Chi tiết đặt lịch
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Người đặt</span>
                  <span className="font-medium text-foreground">{selectedBooking.applicantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã hộ</span>
                  <span className="font-medium text-foreground">{selectedBooking.householdCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dịch vụ</span>
                  <span className="font-medium text-foreground">{selectedBooking.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày</span>
                  <span className="font-medium text-foreground">{selectedBooking.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giờ</span>
                  <span className="font-medium text-foreground">
                    {selectedBooking.startTime} - {selectedBooking.endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mục đích</span>
                  <span className="font-medium text-foreground">{selectedBooking.purpose}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-muted-foreground">Phí dịch vụ</span>
                  <span className="font-bold text-primary">
                    {selectedBooking.fee.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="destructive" onClick={handleReject} className="flex-1">
                  <X className="h-4 w-4 mr-1" />
                  Từ chối
                </Button>
                <Button variant="success" onClick={handleApprove} className="flex-1">
                  <Check className="h-4 w-4 mr-1" />
                  Xác nhận
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsPage;
