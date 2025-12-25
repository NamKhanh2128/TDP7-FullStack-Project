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
import { AlertCircle, Baby, UserX, Truck, CalendarDays, MapPin, Upload, User } from 'lucide-react';

interface BienDongFormProps {
  open: boolean;
  onClose: () => void;
}

export function BienDongForm({ open, onClose }: BienDongFormProps) {
  const { toast } = useToast();
  const [type, setType] = useState('');
  const [formData, setFormData] = useState({
    // Newborn
    babyName: '',
    babyDob: '',
    fatherName: '',
    motherName: '',
    // Death
    deathDate: '',
    // Move out
    moveOutDate: '',
    newAddress: '',
  });

  const handleSubmit = () => {
    toast({
      title: 'Thành công',
      description: 'Đã gửi thông báo biến động thành công!',
    });
    onClose();
    setType('');
    setFormData({
      babyName: '',
      babyDob: '',
      fatherName: '',
      motherName: '',
      deathDate: '',
      moveOutDate: '',
      newAddress: '',
    });
  };

  const renderFields = () => {
    switch (type) {
      case 'moi_sinh':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg bg-success/10 p-3 flex items-center gap-2">
              <Baby className="h-5 w-5 text-success" />
              <span className="text-sm text-success font-medium">Khai báo thành viên mới sinh</span>
            </div>
            <div className="space-y-2">
              <Label>Họ tên trẻ</Label>
              <Input
                placeholder="Nhập họ tên"
                value={formData.babyName}
                onChange={(e) => setFormData({ ...formData, babyName: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Ngày sinh</Label>
              <Input
                type="date"
                value={formData.babyDob}
                onChange={(e) => setFormData({ ...formData, babyDob: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Họ tên cha</Label>
                <Input
                  placeholder="Họ tên cha"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Họ tên mẹ</Label>
                <Input
                  placeholder="Họ tên mẹ"
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  className="bg-background"
                />
              </div>
            </div>
          </div>
        );

      case 'qua_doi':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg bg-muted p-3 flex items-center gap-2">
              <UserX className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium">Khai báo thành viên qua đời</span>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Ngày mất
              </Label>
              <Input
                type="date"
                value={formData.deathDate}
                onChange={(e) => setFormData({ ...formData, deathDate: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                Giấy chứng tử
              </Label>
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center hover:border-primary/50 cursor-pointer transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tải lên giấy chứng tử</span>
              </div>
            </div>
          </div>
        );

      case 'chuyen_di':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg bg-warning/10 p-3 flex items-center gap-2">
              <Truck className="h-5 w-5 text-warning" />
              <span className="text-sm text-warning font-medium">Khai báo chuyển đi</span>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Ngày chuyển đi
              </Label>
              <Input
                type="date"
                value={formData.moveOutDate}
                onChange={(e) => setFormData({ ...formData, moveOutDate: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Địa chỉ mới
              </Label>
              <Input
                placeholder="Nhập địa chỉ chuyển đến"
                value={formData.newAddress}
                onChange={(e) => setFormData({ ...formData, newAddress: e.target.value })}
                className="bg-background"
              />
            </div>
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
              <AlertCircle className="h-4 w-4 text-primary-foreground" />
            </div>
            Thông báo biến động
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Loại biến động
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Chọn loại biến động" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="moi_sinh">
                  <span className="flex items-center gap-2">
                    <Baby className="h-4 w-4 text-success" />
                    Mới sinh
                  </span>
                </SelectItem>
                <SelectItem value="qua_doi">
                  <span className="flex items-center gap-2">
                    <UserX className="h-4 w-4" />
                    Qua đời
                  </span>
                </SelectItem>
                <SelectItem value="chuyen_di">
                  <span className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-warning" />
                    Chuyển đi
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderFields()}
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Hủy
          </Button>
          <Button variant="gradient" onClick={handleSubmit} className="flex-1" disabled={!type}>
            Gửi thông báo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
