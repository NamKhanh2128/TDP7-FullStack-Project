import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from '../../components/ui/status-badge';
import { mockBookings } from '@/data/mockData';
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
} from 'lucide-react';

const services = [
  { id: 'hall', name: 'Hội trường', icon: Building2, price: 500000, unit: 'buổi' },
  { id: 'yard', name: 'Sân thể thao', icon: Dumbbell, price: 200000, unit: 'giờ' },
];

const timeSlots = [
  { id: '1', start: '08:00', end: '10:00' },
  { id: '2', start: '10:00', end: '12:00' },
  { id: '3', start: '14:00', end: '16:00' },
  { id: '4', start: '16:00', end: '18:00' },
  { id: '5', start: '18:00', end: '20:00' },
];

export default function BookingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const { toast } = useToast();

  const selectedServiceData = services.find(s => s.id === selectedService);
  const selectedTimeData = timeSlots.find(t => t.id === selectedTime);

  const resetForm = () => {
    setStep(1);
    setSelectedService('');
    setSelectedDate('');
    setSelectedTime('');
    setPurpose('');
  };

  const handleSubmit = () => {
    toast({
      title: 'Đặt lịch thành công',
      description: 'Yêu cầu đặt lịch đã được gửi. Vui lòng chờ phê duyệt và thanh toán.',
    });
    setIsOpen(false);
    resetForm();
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
                <RadioGroup value={selectedService} onValueChange={setSelectedService}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {services.map((service) => {
                      const Icon = service.icon;
                      return (
                        <label
                          key={service.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors shadow-sm ${
                            selectedService === service.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value={service.id} id={service.id} />
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(service.price)}/{service.unit}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </RadioGroup>
                <Button
                  className="w-full gap-2"
                  disabled={!selectedService}
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
                <div className="space-y-2">
                  <Label>Khung giờ</Label>
                  <RadioGroup value={selectedTime} onValueChange={setSelectedTime}>
                    <div className="grid grid-cols-2 gap-3">
                      {timeSlots.map((slot) => (
                        <label
                          key={slot.id}
                          className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors shadow-sm ${
                            selectedTime === slot.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value={slot.id} id={slot.id} className="sr-only" />
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{slot.start} - {slot.end}</span>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
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
                    disabled={!selectedDate || !selectedTime}
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
                        {selectedTimeData?.start} - {selectedTimeData?.end}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mục đích:</span>
                      <span className="font-medium">{purpose || 'Không có'}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                      <span className="font-medium">Tổng phí:</span>
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(selectedServiceData?.price || 0)}
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
                    {formatCurrency(selectedServiceData?.price || 0)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sau khi thanh toán, yêu cầu sẽ được gửi đến Tổ trưởng để phê duyệt.
                </p>
                <Button className="w-full gradient-primary-bg hover:opacity-90 gap-2" onClick={handleSubmit}>
                  <CheckCircle className="w-4 h-4" />
                  Hoàn tất đặt lịch
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs for History */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full max-w-2xl mx-auto grid grid-cols-3 gap-2">
          <TabsTrigger value="all" className="flex-1">Tất cả</TabsTrigger>
          <TabsTrigger value="pending" className="flex-1">Chờ duyệt</TabsTrigger>
          <TabsTrigger value="approved" className="flex-1">Đã duyệt</TabsTrigger>
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
              {mockBookings.length > 0 ? (
                <div className="divide-y divide-border">
                  {mockBookings.map((booking) => (
                    <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-muted/10 rounded-lg transition">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          {booking.service === 'hall' ? (
                            <Building2 className="w-6 h-6 text-primary" />
                          ) : (
                            <Dumbbell className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {booking.service === 'hall' ? 'Hội trường' : 'Sân thể thao'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.date).toLocaleDateString('vi-VN')} • {booking.time_start} - {booking.time_end}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={booking.status} />
                        <p className="text-sm font-medium text-primary mt-1">
                          {formatCurrency(booking.fee)}
                        </p>
                      </div>
                    </div>
                  ))}
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
                {mockBookings.filter(b => b.status === 'pending').map((booking) => (
                  <div key={booking.id} className="p-4 flex items-center justify-between border-b last:border-0 hover:bg-warning/5 rounded-lg transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                      {booking.service === 'hall' ? (
                        <Building2 className="w-6 h-6 text-warning" />
                      ) : (
                        <Dumbbell className="w-6 h-6 text-warning" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {booking.service === 'hall' ? 'Hội trường' : 'Sân thể thao'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                    <StatusBadge status="pending" />
                </div>
              ))}
              {mockBookings.filter(b => b.status === 'pending').length === 0 && (
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
                {mockBookings.filter(b => b.status === 'approved').map((booking) => (
                  <div key={booking.id} className="p-4 flex items-center justify-between border-b last:border-0 hover:bg-success/5 rounded-lg transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                      {booking.service === 'hall' ? (
                        <Building2 className="w-6 h-6 text-success" />
                      ) : (
                        <Dumbbell className="w-6 h-6 text-success" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {booking.service === 'hall' ? 'Hội trường' : 'Sân thể thao'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status="approved" />
                </div>
              ))}
              {mockBookings.filter(b => b.status === 'approved').length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <p>Không có lịch đã duyệt</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
