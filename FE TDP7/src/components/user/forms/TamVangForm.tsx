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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { currentHousehold } from '@/data/mockData';
import { CalendarDays, MapPin, User, FileText } from 'lucide-react';

interface TamVangFormProps {
  open: boolean;
  onClose: () => void;
}

export function TamVangForm({ open, onClose }: TamVangFormProps) {
  const { toast } = useToast();
  const [selectedMember, setSelectedMember] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [destination, setDestination] = useState('');

  const handleSubmit = () => {
    if (!selectedMember || !fromDate || !toDate || !reason || !destination) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Thành công',
      description: 'Đã gửi khai báo tạm vắng thành công!',
    });
    onClose();
    // Reset form
    setSelectedMember('');
    setFromDate('');
    setToDate('');
    setReason('');
    setDestination('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            Khai báo tạm vắng
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Thành viên
            </Label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Chọn thành viên" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                {currentHousehold.members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Từ ngày
              </Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Đến ngày
              </Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Lý do vắng mặt
            </Label>
            <Textarea
              placeholder="Ví dụ: Đi học, đi làm xa, thăm người thân..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px] bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Nơi đến tạm trú
            </Label>
            <Input
              placeholder="Địa chỉ nơi đến"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Hủy
          </Button>
          <Button variant="gradient" onClick={handleSubmit} className="flex-1">
            Gửi khai báo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
