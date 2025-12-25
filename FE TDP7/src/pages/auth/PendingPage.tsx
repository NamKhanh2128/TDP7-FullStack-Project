import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, LogOut, Building2 } from 'lucide-react';

export default function PendingPage() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-primary-bg">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyek0zNiAyNnYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
      
      <Card className="w-full max-w-md glass-strong animate-fade-in relative z-10">
        <CardContent className="pt-8 pb-6 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mb-6">
            <Clock className="w-10 h-10 text-warning animate-pulse-soft" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Tài khoản đang chờ duyệt</h2>
          <p className="text-muted-foreground mb-2">
            Xin chào, <span className="font-medium text-foreground">{user?.full_name}</span>
          </p>
          <p className="text-muted-foreground mb-6">
            Tài khoản của bạn đang được Tổ trưởng xem xét. Vui lòng quay lại sau hoặc liên hệ trực tiếp để được hỗ trợ.
          </p>
          
          <div className="p-4 rounded-lg bg-muted/50 border border-border mb-6">
            <p className="text-sm text-muted-foreground">
              <strong>Liên hệ Tổ trưởng:</strong><br />
              Nguyễn Văn Minh - 0912.345.678
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
