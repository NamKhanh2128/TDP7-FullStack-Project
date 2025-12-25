import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { services } from '@/data/mockData';
import { Building, Clock, CreditCard, CheckCircle, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingWizardProps {
  open: boolean;
  onClose: () => void;
}

export function BookingWizard({ open, onClose }: BookingWizardProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const selectedServiceData = services.find((s) => s.id === selectedService);

  const calculateFee = () => {
    if (!selectedServiceData) return 0;
    if (selectedService === 's2' && startTime && endTime) {
      const start = parseInt(startTime.split(':')[0]);
      const end = parseInt(endTime.split(':')[0]);
      return (end - start) * selectedServiceData.fee;
    }
    return selectedServiceData.fee;
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    toast({
      title: 'Thành công',
      description: 'Đã gửi yêu cầu đặt lịch. Vui lòng chờ phê duyệt!',
    });
    onClose();
    setStep(1);
    setSelectedService('');
    setDate('');
    setStartTime('');
    setEndTime('');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg bg-accent/50 p-3 flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Bước 1: Chọn dịch vụ</span>
            </div>
            <RadioGroup value={selectedService} onValueChange={setSelectedService}>
              {services.map((service) => (
                <Label
                  key={service.id}
                  className={cn(
                    'flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all',
                    selectedService === service.id
                      ? 'border-primary bg-accent'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <RadioGroupItem value={service.id} />
                  <div className="flex-1">
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {service.fee.toLocaleString('vi-VN')} VNĐ/{service.unit}
                    </p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg bg-accent/50 p-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Bước 2: Chọn thời gian</span>
            </div>
            <div className="space-y-2">
              <Label>Ngày</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Giờ bắt đầu</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Giờ kết thúc</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg bg-accent/50 p-3 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Bước 3: Thanh toán</span>
            </div>
            <div className="rounded-xl bg-muted/50 p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dịch vụ:</span>
                <span className="font-medium">{selectedServiceData?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày:</span>
                <span className="font-medium">{date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thời gian:</span>
                <span className="font-medium">{startTime} - {endTime}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold">Tổng phí:</span>
                <span className="font-bold text-primary text-lg">
                  {calculateFee().toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <QrCode className="h-4 w-4 text-primary" />
                Quét mã QR để thanh toán
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="h-40 w-40 rounded-lg bg-muted flex items-center justify-center">
                  <QrCode className="h-20 w-20 text-muted-foreground/50" />
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  <p>Ngân hàng: <span className="font-medium text-foreground">Vietcombank</span></p>
                  <p>STK: <span className="font-medium text-foreground">1234567890</span></p>
                  <p>Chủ TK: <span className="font-medium text-foreground">TỔ DÂN PHỐ 7</span></p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 animate-fade-in text-center py-6">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </div>
            <h3 className="text-lg font-semibold">Xác nhận đặt lịch</h3>
            <p className="text-muted-foreground">
              Yêu cầu của bạn sẽ được gửi đến Ban quản lý để phê duyệt.
              Bạn sẽ nhận thông báo khi có kết quả.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Building className="h-4 w-4 text-primary-foreground" />
            </div>
            Đặt lịch sử dụng
          </DialogTitle>
        </DialogHeader>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                s <= step ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>

        {renderStep()}

        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Quay lại
            </Button>
          )}
          {step < 4 ? (
            <Button
              variant="gradient"
              onClick={handleNext}
              className="flex-1"
              disabled={step === 1 && !selectedService}
            >
              Tiếp tục
            </Button>
          ) : (
            <Button variant="gradient" onClick={handleSubmit} className="flex-1">
              Xác nhận đặt lịch
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
