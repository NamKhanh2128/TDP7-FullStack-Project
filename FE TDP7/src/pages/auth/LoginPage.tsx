import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Building2, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, isLoading: authLoading } = useAuth();

  // Xử lý thay đổi input
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Xóa thông báo lỗi khi user bắt đầu nhập lại
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // Xóa thông báo lỗi khi user bắt đầu nhập lại
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  // Xử lý Submit Form
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Dòng 1: Bắt buộc
    console.log("Đã bấm nút submit!"); // Dòng 2: Debug log
    
    setErrorMessage(''); // Reset error message

    // Validate cơ bản
    if (!email || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);

    try {
      // Dòng 3: Gọi hàm login từ AuthContext (thay vì loginAPI trực tiếp)
      // Hàm này sẽ tự động gọi API, lưu vào localStorage và cập nhật state
      console.log('Đang gọi login từ AuthContext với:', { email });
      const result = await login({ email, password });
      console.log('Kết quả từ login:', result);

      // Xử lý kết quả thành công
      if (result.success && result.accessToken) {
        console.log('Đăng nhập thành công, state đã được cập nhật trong AuthContext');

        // Lấy status từ result (có thể từ result.status hoặc result.user?.status)
        const userStatus = result.status || result.user?.status;

        // Kiểm tra status để quyết định điều hướng
        if (userStatus === 'pending') {
          // Tài khoản chưa được duyệt -> Chuyển đến trang pending
          toast({
            title: "Tài khoản chưa được duyệt",
            description: "Tài khoản của bạn đang chờ phê duyệt từ quản trị viên.",
            variant: 'default',
          });
          navigate('/pending');
          return; // Dừng xử lý, không navigate đến trang chủ
        }

        if (userStatus === 'blocked') {
          // Tài khoản bị khóa -> Hiển thị lỗi
          const errorMsg = 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.';
          setErrorMessage(errorMsg);
          toast({ 
            variant: 'destructive', 
            title: 'Tài khoản bị khóa', 
            description: errorMsg
          });
          return; // Dừng xử lý, không navigate
        }

        // Status là 'active' hoặc không có status (mặc định active) -> Điều hướng bình thường
        // Hiển thị thông báo thành công
        toast({
          title: "Đăng nhập thành công",
          description: `Chào mừng quay trở lại, ${result.user?.full_name || 'bạn'}!`,
        });

        // Chuyển hướng dựa trên role
        const userRole = result.user?.role || result.role;
        
        if (userRole === 'admin') {
          navigate('/admin'); // Admin -> Trang quản trị
        } else {
          navigate('/'); // User -> Trang chủ
        }
      } else {
        // Xử lý trường hợp đăng nhập thất bại
        // Kiểm tra xem có phải lỗi pending không
        if (result.status === 'pending') {
          toast({
            title: "Tài khoản chưa được duyệt",
            description: "Tài khoản của bạn đang chờ phê duyệt từ quản trị viên.",
            variant: 'default',
          });
          navigate('/pending');
          return;
        }

        const errorMsg = result.error || result.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
        setErrorMessage(errorMsg);
        console.error('Đăng nhập thất bại:', errorMsg);
        
        toast({ 
          variant: 'destructive', 
          title: 'Đăng nhập thất bại', 
          description: errorMsg
        });
      }
    } catch (error: any) {
      // Xử lý lỗi từ server
      console.error('Login error:', error);
      
      // Kiểm tra xem có phải lỗi pending không (từ backend trả về 403 với status: 'pending')
      if (error.status === 'pending' || error.response?.data?.status === 'pending') {
        toast({
          title: "Tài khoản chưa được duyệt",
          description: "Tài khoản của bạn đang chờ phê duyệt từ quản trị viên.",
          variant: 'default',
        });
        navigate('/pending');
        setLoading(false);
        return;
      }

      // Kiểm tra xem có phải tài khoản bị blocked không
      if (error.status === 'blocked' || error.response?.data?.status === 'blocked') {
        const errorMsg = 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.';
        setErrorMessage(errorMsg);
        toast({ 
          variant: 'destructive', 
          title: 'Tài khoản bị khóa', 
          description: errorMsg
        });
        setLoading(false);
        return;
      }

      // Xử lý các lỗi khác
      const errorMsg = error.message || error.error || error.response?.data?.message || 'Email hoặc mật khẩu không chính xác';
      setErrorMessage(errorMsg);
      
      toast({ 
        variant: 'destructive', 
        title: 'Đăng nhập thất bại', 
        description: errorMsg
      });
    } finally {
      setLoading(false);
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
          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            
            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

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
                  value={email} 
                  onChange={handleEmailChange} 
                  className="pl-10 h-11 bg-white/50 focus:bg-white transition-all border-muted-foreground/20"
                  disabled={loading || authLoading}
                  autoComplete="email"
                  required
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
                  value={password} 
                  onChange={handlePasswordChange} 
                  className="pl-10 pr-10 h-11 bg-white/50 focus:bg-white transition-all border-muted-foreground/20"
                  disabled={loading || authLoading}
                  autoComplete="current-password"
                  required
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
              disabled={loading || authLoading}
            >
              {(loading || authLoading) ? (
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