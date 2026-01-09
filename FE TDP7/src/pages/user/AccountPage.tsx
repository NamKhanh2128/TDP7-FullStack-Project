import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Phone, Mail, Camera, Eye, EyeOff, MapPin, Briefcase, Calendar, Fingerprint, Edit, Save, X } from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getProfileAPI, updateProfileAPI, changePasswordAPI } from '@/services/apiService';

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
  const { user } = useAuth(); // Chỉ dùng user.id hoặc token, không dùng để điền form
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // State để lưu dữ liệu form (lấy từ API)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    dob: '',
    gender: '',
    cccd: '',
    job: '',
    workplace: '',
  });

  // State để lưu dữ liệu profile đầy đủ (để hiển thị)
  const [profileData, setProfileData] = useState<any>(null);

  // Hàm fetch dữ liệu từ API
  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await getProfileAPI();
      
      if (response.success && response.data) {
        const data = response.data;
        // Điền dữ liệu vào formData
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          dob: data.dob || '',
          gender: data.gender || '',
          cccd: data.cccd || '',
          job: data.job || '',
          workplace: data.workplace || '',
        });
        // Lưu toàn bộ profile data để hiển thị
        setProfileData(data);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải thông tin profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load dữ liệu từ API khi component mount
  useEffect(() => {
    fetchProfileData();
  }, []); // Chỉ chạy 1 lần khi mount

  // Helper function để hiển thị giá trị hoặc "Chưa cập nhật"
  const displayValue = (value: string | undefined | null) => {
    return value && value.trim() !== '' ? value : 'Chưa cập nhật';
  };

  // Format phone number
  const formatPhone = (phone: string | undefined | null) => {
    if (!phone) return 'Chưa cập nhật';
    // Format: 0912 345 678
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  // Hiển thị role (dùng từ profileData hoặc user)
  const displayRole = () => {
    const role = profileData?.role || user?.role;
    if (role === 'admin') return 'Quản trị viên';
    if (role === 'user') return 'Cư dân';
    return 'Chưa cập nhật';
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: 'Lỗi', description: 'Mật khẩu xác nhận không khớp', variant: 'destructive' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast({ title: 'Lỗi', description: 'Mật khẩu mới phải có ít nhất 6 ký tự', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Gọi API đổi mật khẩu trực tiếp
      const payload = {
        currentPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      };

      const response = await changePasswordAPI(payload);
      
      if (response.success) {
        // Thành công: Alert "Đổi mật khẩu thành công!" và đóng Modal
        toast({ 
          title: 'Thành công', 
          description: 'Đổi mật khẩu thành công!',
        });
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setIsChangePasswordOpen(false);
      } else {
        throw new Error(response.message || 'Không thể đổi mật khẩu');
      }
    } catch (error: any) {
      // Thất bại: Hiển thị lỗi từ server
      console.error('Error changing password:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm xử lý cập nhật profile
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || formData.full_name.trim() === '') {
      toast({ 
        title: 'Lỗi', 
        description: 'Vui lòng nhập họ và tên', 
        variant: 'destructive' 
      });
      return;
    }

    setIsUpdating(true);
    try {
      const response = await updateProfileAPI(formData);
      
      if (response.success && response.data) {
        // Hiển thị thông báo thành công
        toast({
          title: 'Cập nhật thành công',
          description: 'Thông tin cá nhân đã được cập nhật.',
        });
        
        setIsEditMode(false);
        
        // Gọi lại API để lấy dữ liệu mới nhất
        await fetchProfileData();
      } else {
        throw new Error(response.message || 'Cập nhật thất bại');
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Hàm hủy chỉnh sửa
  const handleCancel = () => {
    // Khôi phục dữ liệu từ profileData (dữ liệu từ API)
    if (profileData) {
      setFormData({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        dob: profileData.dob || '',
        gender: profileData.gender || '',
        cccd: profileData.cccd || '',
        job: profileData.job || '',
        workplace: profileData.workplace || '',
      });
    }
    setIsEditMode(false);
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Đang tải thông tin...</p>
          </div>
        ) : (
          <>
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Hồ sơ cá nhân</h1>
            {!isEditMode ? (
              <Button
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-2"
                style={{ background: 'var(--gradient-primary)', border: 'none' }}
              >
                <Edit className="h-4 w-4" />
                Sửa
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Hủy
                </Button>
                <Button
                  type="submit"
                  form="profile-form"
                  disabled={isUpdating}
                  className="flex items-center gap-2"
                  style={{ background: 'var(--gradient-primary)', border: 'none' }}
                >
                  <Save className="h-4 w-4" />
                  {isUpdating ? 'Đang lưu...' : 'Lưu'}
                </Button>
              </div>
            )}
        </div>

        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          {/* Cột trái: Avatar & Vai trò */}
          <div className="space-y-6">
            <Card className="border-border shadow-sm">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  {/* Avatar sử dụng Gradient Primary từ CSS của bạn */}
                  <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                    {profileData?.avatar ? (
                      <AvatarImage src={profileData.avatar} alt={profileData.full_name || 'User'} />
                    ) : null}
                    <AvatarFallback 
                      className="text-white text-2xl font-bold"
                      style={{ background: 'var(--gradient-primary)' }}
                    >
                      {profileData?.full_name ? (
                        profileData.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                      ) : (
                        <User className="h-14 w-14" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md border border-white bg-white text-primary hover:bg-gray-100"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <h2 className="text-xl font-bold text-foreground">{profileData?.full_name || 'Chưa cập nhật'}</h2>
                <div className="mt-2 flex items-center gap-2">
                    <span 
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm"
                      style={{ background: 'var(--gradient-primary)' }}
                    >
                        {displayRole()}
                    </span>
                    <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-md">
                      ID: {profileData?.id || 'Chưa có'}
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
              
              <form id="profile-form" onSubmit={handleUpdate}>
                <CardContent className="pt-6 space-y-6">
                  {/* Nhóm 1: Thông tin cơ bản */}
                  <div>
                      <h3 className="text-sm font-semibold mb-4 text-primary">Cơ bản</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                          {isEditMode ? (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="full_name" className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                                  <User className="h-3.5 w-3.5 text-primary" />
                                  Họ và tên
                                </Label>
                                <Input
                                  id="full_name"
                                  value={formData.full_name}
                                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                  required
                                  className="text-sm font-medium"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="dob" className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                                  <Calendar className="h-3.5 w-3.5 text-primary" />
                                  Ngày sinh
                                </Label>
                                <Input
                                  id="dob"
                                  type="date"
                                  value={formData.dob}
                                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                  className="text-sm font-medium"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="gender" className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                                  <User className="h-3.5 w-3.5 text-primary" />
                                  Giới tính
                                </Label>
                                <Input
                                  id="gender"
                                  value={formData.gender}
                                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                  placeholder="Nam/Nữ/Khác"
                                  className="text-sm font-medium"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="cccd" className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                                  <Fingerprint className="h-3.5 w-3.5 text-primary" />
                                  Số CCCD
                                </Label>
                                <Input
                                  id="cccd"
                                  value={formData.cccd}
                                  onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                                  className="text-sm font-medium"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <InfoItem icon={Calendar} label="Ngày sinh" value={displayValue(profileData?.dob)} />
                              <InfoItem icon={User} label="Giới tính" value={displayValue(profileData?.gender)} />
                              <InfoItem icon={Fingerprint} label="Số CCCD" value={displayValue(profileData?.cccd)} />
                            </>
                          )}
                      </div>
                  </div>

                  <Separator className="bg-border" />

                  {/* Nhóm 2: Công việc */}
                  <div>
                      <h3 className="text-sm font-semibold mb-4 text-primary">Công việc</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                          {isEditMode ? (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="job" className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                                  Nghề nghiệp
                                </Label>
                                <Input
                                  id="job"
                                  value={formData.job}
                                  onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                                  className="text-sm font-medium"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="workplace" className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                                  <MapPin className="h-3.5 w-3.5 text-primary" />
                                  Nơi làm việc
                                </Label>
                                <Input
                                  id="workplace"
                                  value={formData.workplace}
                                  onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
                                  className="text-sm font-medium"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <InfoItem icon={Briefcase} label="Nghề nghiệp" value={displayValue(profileData?.job)} />
                              <InfoItem icon={MapPin} label="Nơi làm việc" value={displayValue(profileData?.workplace)} />
                            </>
                          )}
                      </div>
                  </div>

                  <Separator className="bg-border" />

                  {/* Nhóm 3: Liên hệ */}
                  <div>
                      <h3 className="text-sm font-semibold mb-4 text-primary">Liên hệ</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                          {isEditMode ? (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="phone" className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                                  <Phone className="h-3.5 w-3.5 text-primary" />
                                  Số điện thoại
                                </Label>
                                <Input
                                  id="phone"
                                  value={formData.phone}
                                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                  className="text-sm font-medium"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                                  <Mail className="h-3.5 w-3.5 text-primary" />
                                  Email
                                </Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={profileData?.email || ''}
                                  disabled
                                  className="text-sm font-medium bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <InfoItem icon={Phone} label="Số điện thoại" value={formatPhone(profileData?.phone)} />
                              <InfoItem icon={Mail} label="Email" value={profileData?.email || 'Chưa cập nhật'} />
                            </>
                          )}
                      </div>
                  </div>
                </CardContent>
              </form>
            </Card>
          </div>
        </div>

      {/* Dialog Đổi Mật Khẩu */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="sm:max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Đổi mật khẩu</DialogTitle>
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
                {isSubmitting ? 'Đang cập nhật...' : 'Lưu thay đổi'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AccountPage;