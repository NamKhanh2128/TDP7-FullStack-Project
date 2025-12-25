import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Clock, ArrowLeft, ShieldAlert } from 'lucide-react'; // Thêm icon Clock, ShieldAlert

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Vui lòng nhập email để xác minh' });
      return;
    }

    // Mock send request to Admin
    setSent(true);
    toast({ 
      title: 'Đã gửi yêu cầu', 
      description: 'Yêu cầu của bạn đã được chuyển đến Ban quản trị.' 
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-primary-bg">
      <Card className="w-full max-w-md glass-strong animate-fade-in shadow-xl">
        <CardHeader className="text-center pt-8 pb-2">
          {/* Đổi icon header sang ShieldAlert để thể hiện vấn đề bảo mật */}
          <div className="mx-auto w-16 h-16 rounded-2xl gradient-primary-bg flex items-center justify-center mb-4 shadow-glow">
            <ShieldAlert className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Cấp lại mật khẩu</CardTitle>
          <CardDescription>Gửi yêu cầu đến Quản trị viên để được cấp lại quyền truy cập</CardDescription>
        </CardHeader>

        <CardContent>
          {sent ? (
            <div className="text-center space-y-5 py-2">
              {/* Trạng thái chờ xác nhận */}
              <div className="mx-auto w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center mb-2 animate-pulse">
                <Clock className="w-12 h-12 text-orange-600" />
              </div>
              
              <div>
                <h3 className="font-bold text-xl text-foreground">Đang chờ phê duyệt</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                  Yêu cầu cấp lại mật khẩu cho <strong>{email}</strong> đã được gửi đến Ban quản trị/Tổ trưởng.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground border border-border/50">
                <p>Vui lòng đợi quá trình xác minh hoàn tất. Bạn sẽ nhận được thông báo qua Email hoặc Số điện thoại đã đăng ký.</p>
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login">
                    <ArrowLeft className="mr-2 w-4 h-4" /> Quay lại đăng nhập
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email đăng ký</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="Nhập email của bạn..." 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="pl-10" 
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  *Chúng tôi cần email để xác định danh tính cư dân của bạn.
                </p>
              </div>

              <Button type="submit" className="w-full gradient-primary-bg hover:opacity-90 shadow-lg shadow-primary/20">
                Gửi yêu cầu xét duyệt
              </Button>

              <div className="text-center text-sm pt-2">
                <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Quay lại đăng nhập
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}