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
import { User, CreditCard, MapPin, Upload, CalendarDays, Loader2, FileText } from 'lucide-react';
import { createRequestAPI } from '@/services/apiService';

interface TamTruFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TamTruForm({ open, onClose, onSuccess }: TamTruFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: '',
    idCard: '',
    permanentAddress: '',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!formData.fullName || !formData.dob || !formData.gender || !formData.idCard || !formData.permanentAddress || !formData.reason) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Thu thập dữ liệu từ Form
      const name = formData.fullName.trim();
      const dob = formData.dob;
      const gender = formData.gender;
      const cccd = formData.idCard.trim();
      const hometown = formData.permanentAddress.trim();
      const reason = formData.reason.trim();

      // 2. Tạo chuỗi thông tin chi tiết (dùng \n để xuống dòng)
      const combinedInfo = `Họ và tên: ${name}
Sinh ngày: ${new Date(dob).toLocaleDateString('vi-VN')}
Giới tính: ${gender}
Số CCCD: ${cccd}
Quê quán: ${hometown}
Lý do tạm trú: ${reason || 'Không ghi rõ'}`;

      // 3. Gửi API
      const payload = {
        type: 'TamTru',
        reason: combinedInfo, // QUAN TRỌNG: Gán chuỗi combinedInfo vào biến reason
        start_date: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD cho Backend
        end_date: null
      };

      // Gọi API POST /api/requests
      const response = await createRequestAPI(payload);

      if (response.success) {
        toast({
          title: 'Thành công',
          description: response.message || 'Đã gửi khai báo tạm trú thành công!',
        });
        
        // Reset form
        setFormData({
          fullName: '',
          dob: '',
          gender: '',
          idCard: '',
          permanentAddress: '',
          reason: '',
        });

        // Gọi callback để refresh danh sách
        if (onSuccess) {
          onSuccess();
        }
        
        // Đóng modal
        onClose();
      } else {
        throw new Error(response.message || 'Không thể gửi yêu cầu');
      }
    } catch (error: any) {
      console.error('Lỗi khi gửi yêu cầu tạm trú:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
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
              <FileText className="h-4 w-4 text-primary" />
              Lý do tạm trú <span className="text-destructive">*</span>
            </Label>
            <Textarea
              placeholder="Ví dụ: Đi học đại học, Làm công nhân, Thăm người nhà..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="min-h-[80px] bg-background"
              required
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
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1"
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button 
            variant="gradient" 
            onClick={handleSubmit} 
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang gửi...
              </>
            ) : (
              'Gửi khai báo'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
