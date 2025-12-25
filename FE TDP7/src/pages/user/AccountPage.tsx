import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Phone, Mail, Camera, Eye, EyeOff, MapPin, Briefcase, Calendar, Fingerprint } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { currentHousehold } from '@/data/mockData';

// Component nhỏ để hiển thị thông tin gọn gàng
const InfoItem = ({ icon: Icon, label, value, className = "" }: { icon?: any, label: string, value: string, className?: string }) => (
  <div className={`flex flex-col space-y-1 ${className}`}>
    <div className="flex items-center gap-2 text-muted-foreground">
      {Icon && <Icon className="h-3.5 w-3.5 text-primary" />} {/* Đã thêm text-primary để icon nhận màu xanh chủ đạo */}
      <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-sm font-medium text-foreground truncate">{value}</p>
  </div>
);

const AccountPage = () => {
  const { toast } = useToast();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const user = currentHousehold.members[0];

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: 'Lỗi', description: 'Mật khẩu xác nhận không khớp', variant: 'destructive' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast({ title: 'Lỗi', description: 'Mật khẩu mới phải có ít nhất 6 ký tự', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({ title: 'Yêu cầu đã được gửi', description: 'Yêu cầu đổi mật khẩu đã gửi đến Tổ trưởng.' });
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setIsChangePasswordOpen(false);
    setIsSubmitting(false);
  };

  return (
    <div 
      className="container max-w-4xl py-6 mx-auto"
      // ÁP DỤNG THEME MÀU XANH/LAM TỪ CSS CỦA BẠN
      style={{
        '--background': '210 20% 98%',
        '--foreground': '222 47% 11%',
        '--card': '0 0% 100%',
        '--card-foreground': '222 47% 11%',
        '--popover': '0 0% 100%',
        '--popover-foreground': '222 47% 11%',
        '--primary': '199 89% 48%',        // Màu Cyan đậm chủ đạo
        '--primary-foreground': '0 0% 100%',
        '--secondary': '174 58% 65%',      // Màu Teal phụ trợ
        '--secondary-foreground': '222 47% 11%',
        '--muted': '210 20% 96%',
        '--muted-foreground': '215 16% 47%',
        '--accent': '199 89% 95%',
        '--accent-foreground': '199 89% 35%',
        '--destructive': '0 84% 60%',
        '--destructive-foreground': '0 0% 100%',
        '--border': '214 32% 91%',
        '--input': '214 32% 91%',
        '--ring': '199 89% 48%',
        '--radius': '0.75rem',
        '--gradient-primary': 'linear-gradient(135deg, hsl(199, 89%, 48%) 0%, hsl(174, 58%, 65%) 100%)', // Gradient Xanh -> Lam
      } as React.CSSProperties}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Hồ sơ cá nhân</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          {/* Cột trái: Avatar & Vai trò */}
          <div className="space-y-6">
            <Card className="border-border shadow-sm">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  {/* Avatar sử dụng Gradient Primary từ CSS của bạn */}
                  <div 
                    className="flex h-28 w-28 items-center justify-center rounded-full shadow-lg"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    <User className="h-14 w-14 text-white" />
                  </div>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md border border-white bg-white text-primary hover:bg-gray-100"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                <div className="mt-2 flex items-center gap-2">
                    <span 
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm"
                      style={{ background: 'var(--gradient-primary)' }}
                    >
                        {user.role === 'Chủ hộ' ? 'Chủ hộ' : 'Thành viên'}
                    </span>
                    <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-md">
                      Mã hộ: {currentHousehold.code}
                    </span>
                </div>
              </CardContent>
            </Card>

            {/* Bảo mật */}
            <Card className="border-border shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-foreground">
                        <Lock className="h-4 w-4 text-primary"/> Bảo mật
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-3">
                        <div className="text-sm text-muted-foreground">Mật khẩu đăng nhập</div>
                        <Button variant="outline" size="sm" className="w-full hover:text-primary hover:border-primary transition-colors" onClick={() => setIsChangePasswordOpen(true)}>
                            Đổi mật khẩu
                        </Button>
                    </div>
                </CardContent>
            </Card>
          </div>

          {/* Cột phải: Thông tin chi tiết */}
          <div className="space-y-6">
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-4 border-b border-border">
                <CardTitle className="text-lg text-foreground">Thông tin chi tiết</CardTitle>
                <CardDescription className="text-muted-foreground">Quản lý thông tin cá nhân và liên hệ của bạn</CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-6">
                {/* Nhóm 1: Thông tin cơ bản */}
                <div>
                    <h3 className="text-sm font-semibold mb-4 text-primary">Cơ bản</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                        <InfoItem icon={Calendar} label="Ngày sinh" value={user.dob} />
                        <InfoItem icon={User} label="Giới tính" value={user.gender} />
                        <InfoItem icon={Fingerprint} label="Số CCCD" value={user.idCard} />
                    </div>
                </div>

                <Separator className="bg-border" />

                {/* Nhóm 2: Công việc */}
                <div>
                    <h3 className="text-sm font-semibold mb-4 text-primary">Công việc</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                        <InfoItem icon={Briefcase} label="Nghề nghiệp" value={user.occupation} />
                        <InfoItem icon={MapPin} label="Nơi làm việc" value={user.workplace} />
                    </div>
                </div>

                <Separator className="bg-border" />

                {/* Nhóm 3: Liên hệ */}
                <div>
                    <h3 className="text-sm font-semibold mb-4 text-primary">Liên hệ</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                        <InfoItem icon={Phone} label="Số điện thoại" value="0912 345 678" />
                        <InfoItem icon={Mail} label="Email" value="nguyenvanan@gmail.com" />
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      {/* Dialog Đổi Mật Khẩu */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="sm:max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Đổi mật khẩu</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Yêu cầu sẽ được gửi đến Tổ trưởng để phê duyệt
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Mật khẩu hiện tại</Label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    type={showOldPassword ? 'text' : 'password'}
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsChangePasswordOpen(false)}>Hủy</Button>
              {/* Nút gửi sử dụng màu gradient */}
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                style={{ background: 'var(--gradient-primary)', border: 'none' }}
                className="text-white shadow-md hover:opacity-90"
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountPage;