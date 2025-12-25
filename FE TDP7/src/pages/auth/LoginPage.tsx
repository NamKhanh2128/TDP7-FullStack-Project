import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Đảm bảo đường dẫn đúng tới Context của bạn
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Building2, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  
  // Lấy hàm login và trạng thái loading từ AuthContext
  // Lưu ý: Dùng 'as any' nếu TypeScript báo lỗi type chưa khớp, 
  // nhưng tốt nhất là define type trong AuthContext
  const { login, isLoading } = useAuth() as any; 
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Xử lý Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate cơ bản
    if (!form.email || !form.password) {
      toast({ 
        variant: 'destructive', 
        title: 'Thiếu thông tin', 
        description: 'Vui lòng nhập đầy đủ email và mật khẩu' 
      });
      return;
    }

    try {
      // 2. Gọi hàm login từ Context
      const res = await login({ email: form.email, password: form.password });

      // 3. Xử lý kết quả trả về
      if (res?.success) {
        toast({
          title: "Đăng nhập thành công",
          description: `Chào mừng quay trở lại, ${res.user?.full_name || 'bạn'}!`,
        });

        // --- LOGIC ĐIỀU HƯỚNG QUAN TRỌNG ---
        if (res.role === 'admin') {
          navigate('/admin'); // Admin -> Trang quản trị
        } else {
          navigate('/dashboard'); // User -> Trang Dashboard cá nhân
        }
        // -----------------------------------

      } else if (res?.status === 'pending') {
        // Tài khoản chưa được duyệt
        navigate('/pending');
      } else {
        // Lỗi từ server (sai pass, không tồn tại...)
        toast({ 
          variant: 'destructive', 
          title: 'Đăng nhập thất bại', 
          description: res?.error || 'Email hoặc mật khẩu không chính xác.' 
        });
      }
    } catch (err) {
      console.error(err);
      toast({ 
        variant: 'destructive', 
        title: 'Lỗi hệ thống', 
        description: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.' 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-primary-bg relative overflow-hidden">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyek0zNiAyNnYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />

      {/* Back Button (Về trang Landing) */}
      <Link to="/" className="absolute top-8 left-8 text-white/80 hover:text-white flex items-center gap-2 transition-colors z-20">
        <ArrowLeft className="w-5 h-5" /> Quay lại trang chủ
      </Link>

      {/* Main Card */}
      <Card className="w-full max-w-md glass-strong animate-fade-in relative z-10 border-white/20 shadow-2xl">
        <CardHeader className="text-center pt-8 pb-2 space-y-2">
          <div className="mx-auto w-16 h-16 rounded-2xl gradient-primary-bg flex items-center justify-center mb-2 shadow-glow ring-4 ring-white/10">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Đăng nhập</CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Hệ thống Quản lý Dân cư Tổ 7
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={form.email} 
                  onChange={handleChange} 
                  className="pl-10 h-11 bg-white/50 focus:bg-white transition-all border-muted-foreground/20"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs text-primary hover:text-primary/80 hover:underline font-medium"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  id="password" 
                  name="password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••" 
                  value={form.password} 
                  onChange={handleChange} 
                  className="pl-10 pr-10 h-11 bg-white/50 focus:bg-white transition-all border-muted-foreground/20"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
                  tabIndex={-1} // Skip tab index for UX
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold gradient-primary-bg hover:opacity-90 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>

            {/* Register Link */}
            <div className="text-center text-sm pt-2">
              <span className="text-muted-foreground">Chưa có tài khoản? </span>
              <Link to="/register" className="text-primary hover:underline font-semibold transition-colors">
                Đăng ký ngay
              </Link>
            </div>

          </form>
        </CardContent>
      </Card>
      
      {/* Footer text */}
      <div className="absolute bottom-6 text-white/40 text-xs">
        &copy; 2025 Tổ Dân Phố 7 - Phường La Khê
      </div>
    </div>
  );
}