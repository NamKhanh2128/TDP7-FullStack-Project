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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, CreditCard, MapPin, Upload, CalendarDays } from 'lucide-react';

interface TamTruFormProps {
  open: boolean;
  onClose: () => void;
}

export function TamTruForm({ open, onClose }: TamTruFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: '',
    idCard: '',
    permanentAddress: '',
  });

  const handleSubmit = () => {
    if (!formData.fullName || !formData.dob || !formData.gender || !formData.idCard || !formData.permanentAddress) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Thành công',
      description: 'Đã gửi khai báo tạm trú thành công!',
    });
    onClose();
    setFormData({
      fullName: '',
      dob: '',
      gender: '',
      idCard: '',
      permanentAddress: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            Khai báo tạm trú / Lưu trú
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Dành cho sinh viên, người lao động thuê trọ trong khu vực
        </p>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Họ và tên khách <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Nhập họ tên đầy đủ"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="bg-background"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Ngày sinh <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Giới tính <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(v) => setFormData({ ...formData, gender: v })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Chọn" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="Nam">Nam</SelectItem>
                  <SelectItem value="Nữ">Nữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Số CCCD <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Nhập số căn cước công dân"
              value={formData.idCard}
              onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Địa chỉ thường trú (ở quê) <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Nhập địa chỉ thường trú"
              value={formData.permanentAddress}
              onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              Ảnh CCCD
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center hover:border-primary/50 cursor-pointer transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Mặt trước CCCD</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center hover:border-primary/50 cursor-pointer transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Mặt sau CCCD</span>
              </div>
            </div>
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
