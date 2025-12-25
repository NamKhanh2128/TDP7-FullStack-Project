import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, X, Eye, Clock, UserPlus, Calendar, UserMinus, 
  KeyRound, UserCheck, MapPin, Shield, Smartphone, Mail, FileText 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

// --- MOCK DATA ---
const pendingRequests = [
  {
    id: 'req-001',
    type: 'tam_tru',
    applicantName: 'Nguyễn Văn A',
    householdCode: 'TDP7-2024-001',
    submittedAt: '24/12/2024 09:00',
    status: 'pending',
    details: {
      ho_ten: 'Nguyễn Văn A',
      ngay_sinh: '01/01/1990',
      cccd: '001090000001',
      ly_do: 'Công tác dài hạn',
      thoi_gian_luu_tru: '6 tháng'
    }
  },
  {
    id: 'req-002',
    type: 'tam_vang',
    applicantName: 'Trần Thị B',
    householdCode: 'TDP7-2024-005',
    submittedAt: '23/12/2024 14:30',
    status: 'pending',
    details: {
      ho_ten: 'Trần Thị B',
      ngay_di: '25/12/2024',
      noi_den: 'TP. Hồ Chí Minh',
      ly_do: 'Về quê ăn tết'
    }
  },
  {
    id: 'req-003',
    type: 'dat_lich',
    applicantName: 'Lê Văn C',
    householdCode: 'TDP7-2024-012',
    submittedAt: '24/12/2024 08:15',
    status: 'pending',
    details: {
      dia_diem: 'Nhà văn hóa',
      muc_dich: 'Tổ chức sinh nhật',
      thoi_gian: '28/12/2024 18:00 - 21:00'
    }
  }
];

const accountRequests = [
  {
    id: 'acc-001',
    name: 'Trần Văn Hùng',
    phone: '0987654321',
    email: 'tranvanhung@email.com',
    submittedAt: '23/12/2024 10:30',
    status: 'pending',
    householdCode: 'TDP7-2024-002',
    idCard: '001098000123',
    address: 'P.1205 - Tòa A2 - Chung cư Blue Star',
    role: 'Chủ hộ',
    avatar: null,
  },
  {
    id: 'acc-002',
    name: 'Lê Thị Hoa',
    phone: '0912345678',
    email: 'lethihoa@email.com',
    submittedAt: '22/12/2024 14:15',
    status: 'pending',
    householdCode: 'TDP7-2024-003',
    idCard: '001099000456',
    address: 'Số 15, Ngõ 3, Đường Thanh Niên',
    role: 'Thành viên',
    avatar: null,
  },
];

const passwordRequests = [
  {
    id: 'pwd-001',
    name: 'Nguyễn Văn An',
    phone: '0901234567',
    email: 'nguyenvanan@gmail.com',
    submittedAt: '24/12/2024 08:00',
    reason: 'Quên mật khẩu cũ, không truy cập được email khôi phục',
    householdCode: 'TDP7-2024-001',
    lastLogin: '20/11/2024 15:30',
    status: 'Đang hoạt động',
  },
];

const typeLabels: Record<string, string> = {
  tam_vang: 'Tạm vắng',
  tam_tru: 'Tạm trú',
  dat_lich: 'Đặt lịch',
  bien_dong: 'Biến động',
};

const typeIcons: Record<string, React.ElementType> = {
  tam_vang: UserMinus,
  tam_tru: UserPlus,
  dat_lich: Calendar,
  bien_dong: Clock,
};

const ApprovalsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('requests');
  const [requestFilter, setRequestFilter] = useState('all');
  
  // States cho các dialog chi tiết
  const [selectedRequest, setSelectedRequest] = useState<typeof pendingRequests[0] | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<typeof accountRequests[0] | null>(null);
  const [selectedPassword, setSelectedPassword] = useState<typeof passwordRequests[0] | null>(null);
  
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const filteredRequests = pendingRequests.filter((r) => {
    if (requestFilter === 'all') return true;
    return r.type === requestFilter;
  });

  // --- Handlers ---
  const handleApprove = () => {
    toast({ title: 'Đã duyệt', description: `Yêu cầu của ${selectedRequest?.applicantName} đã được phê duyệt.` });
    setSelectedRequest(null);
  };

  const handleReject = () => {
    if (!rejectReason) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập lý do từ chối', variant: 'destructive' });
      return;
    }
    toast({ title: 'Đã từ chối', description: `Yêu cầu của ${selectedRequest?.applicantName} đã bị từ chối.` });
    setSelectedRequest(null);
    setShowRejectInput(false);
    setRejectReason('');
  };

  const handleAccountApprove = () => {
    toast({ title: 'Đã duyệt tài khoản', description: `Tài khoản của ${selectedAccount?.name} đã được kích hoạt.` });
    setSelectedAccount(null);
  };

  const handlePasswordApprove = () => {
    toast({ title: 'Đã duyệt đổi mật khẩu', description: `Yêu cầu đổi mật khẩu của ${selectedPassword?.name} đã được chấp nhận.` });
    setSelectedPassword(null);
  };

  return (
    <div className="p-4 md:p-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Phê duyệt</h1>
        <p className="text-muted-foreground">Xử lý các yêu cầu chờ duyệt từ cư dân</p>
      </motion.div>

      {/* --- TABS --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted mb-6 w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
          <TabsTrigger value="requests" className="gap-2">
            <Clock className="h-4 w-4" /> <span className="hidden sm:inline">Yêu cầu</span>
            <Badge variant="destructive" className="ml-1">{pendingRequests.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gap-2">
            <UserCheck className="h-4 w-4" /> <span className="hidden sm:inline">Tài khoản</span>
            <Badge variant="secondary" className="ml-1">{accountRequests.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="passwords" className="gap-2">
            <KeyRound className="h-4 w-4" /> <span className="hidden sm:inline">Mật khẩu</span>
            <Badge variant="secondary" className="ml-1">{passwordRequests.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* 1. Requests Tab Content */}
        <TabsContent value="requests">
          <div className="flex flex-wrap gap-2 mb-4">
            {['all', 'tam_tru', 'tam_vang', 'dat_lich'].map((filter) => (
              <Button
                key={filter}
                variant={requestFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRequestFilter(filter)}
              >
                {filter === 'all' ? 'Tất cả' : typeLabels[filter]}
              </Button>
            ))}
          </div>

          <div className="grid gap-4">
            {filteredRequests.map((request, index) => {
              const Icon = typeIcons[request.type];
              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <p className="font-semibold text-foreground">{request.applicantName}</p>
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                {typeLabels[request.type]}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Mã hộ: {request.householdCode}</p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Gửi lúc: {request.submittedAt}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" onClick={() => setSelectedRequest(request)}>
                          <Eye className="h-4 w-4 mr-1" /> Xem xét
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* 2. Accounts Tab Content */}
        <TabsContent value="accounts">
          <Card className="mb-4 border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-500" /> Duyệt tài khoản mới
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {accountRequests.map((account, index) => (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {account.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground flex items-center gap-2">
                          {account.name}
                          <Badge variant="outline" className="text-[10px] h-5">{account.role}</Badge>
                        </p>
                        <p className="text-sm text-muted-foreground">{account.phone} • {account.householdCode}</p>
                        <p className="text-xs text-muted-foreground">{account.submittedAt}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedAccount(account)}>
                      <Eye className="h-4 w-4 mr-1" /> Chi tiết
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Passwords Tab Content */}
        <TabsContent value="passwords">
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-orange-500" /> Duyệt đổi mật khẩu
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {passwordRequests.map((pwd, index) => (
                  <motion.div
                    key={pwd.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <KeyRound className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{pwd.name}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">{pwd.reason}</p>
                        <p className="text-xs text-muted-foreground">{pwd.submittedAt}</p>
                      </div>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" size="sm" onClick={() => setSelectedPassword(pwd)}>
                      <Check className="h-4 w-4 mr-1" /> Duyệt
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- DIALOGS (POP-UPS) --- */}

      {/* 1. Request Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => {
        setSelectedRequest(null); setShowRejectInput(false); setRejectReason('');
      }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              Chi tiết yêu cầu dịch vụ
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="rounded-lg bg-muted/30 p-4 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-primary">{selectedRequest.applicantName}</h3>
                  <Badge variant="outline" className="px-3 py-1 bg-white">{typeLabels[selectedRequest.type]}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <UserCheck className="h-4 w-4" /> {selectedRequest.householdCode}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" /> {selectedRequest.submittedAt}
                  </div>
                </div>
              </div>

              {/* Dynamic Details */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" /> Nội dung kê khai
                </h4>
                <div className="bg-background rounded-lg border border-border p-4 space-y-3">
                  {Object.entries(selectedRequest.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm border-b border-dashed border-border last:border-0 pb-2 last:pb-0">
                      <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</span>
                      <span className="font-medium text-right">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4 pt-2 border-t pt-4">
                 {showRejectInput && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <Label className="mb-2 block text-destructive font-semibold">Lý do từ chối (*)</Label>
                    <Textarea 
                      placeholder="Nhập lý do chi tiết..." 
                      value={rejectReason} 
                      onChange={(e) => setRejectReason(e.target.value)} 
                      className="border-destructive/50 focus-visible:ring-destructive"
                    />
                  </motion.div>
                )}
                
                <div className="flex gap-3">
                  {!showRejectInput ? (
                    <>
                      <Button variant="outline" className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive" onClick={() => setShowRejectInput(true)}>
                        <X className="h-4 w-4 mr-2" /> Từ chối
                      </Button>
                      <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handleApprove}>
                        <Check className="h-4 w-4 mr-2" /> Phê duyệt ngay
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" onClick={() => setShowRejectInput(false)}>Hủy</Button>
                      <Button variant="destructive" className="flex-1" onClick={handleReject}>Xác nhận từ chối</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 2. Account Detail Dialog */}
      <Dialog open={!!selectedAccount} onOpenChange={() => setSelectedAccount(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              Thẩm định tài khoản
            </DialogTitle>
          </DialogHeader>

          {selectedAccount && (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {selectedAccount.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedAccount.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="bg-background">{selectedAccount.role}</Badge>
                      <span className="text-xs text-muted-foreground">{selectedAccount.submittedAt}</span>
                  </div>
                </div>
              </div>

              {/* Detailed Info Grid */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Thông tin cá nhân</h4>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Số điện thoại</p>
                      <p className="font-medium">{selectedAccount.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedAccount.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <UserCheck className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Số CCCD/CMND</p>
                      <p className="font-medium">{selectedAccount.idCard}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Địa chỉ đăng ký</p>
                      <p className="font-medium text-sm">{selectedAccount.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedAccount(null)} className="w-full sm:w-auto">Hủy bỏ</Button>
                <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAccountApprove}>
                  <Check className="h-4 w-4 mr-2" /> Xác thực & Kích hoạt
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 3. Password Detail Dialog */}
      <Dialog open={!!selectedPassword} onOpenChange={() => setSelectedPassword(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-700">
              <Shield className="h-5 w-5 text-orange-500" />
              Yêu cầu cấp lại mật khẩu
            </DialogTitle>
          </DialogHeader>

          {selectedPassword && (
            <div className="space-y-6">
              {/* Alert Box */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
                 <div className="bg-white p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0 border border-orange-100">
                    <KeyRound className="h-4 w-4 text-orange-500" />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-orange-800">Cảnh báo bảo mật</h4>
                    <p className="text-xs text-orange-700 mt-1 leading-relaxed">
                       Vui lòng xác minh danh tính qua điện thoại trước khi phê duyệt yêu cầu này để tránh rủi ro chiếm đoạt tài khoản.
                    </p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4 text-sm bg-muted/20 p-4 rounded-lg border border-border/50">
                    <div>
                       <p className="text-muted-foreground mb-1 text-xs uppercase">Người yêu cầu</p>
                       <p className="font-medium">{selectedPassword.name}</p>
                    </div>
                    <div>
                       <p className="text-muted-foreground mb-1 text-xs uppercase">Mã hộ</p>
                       <p className="font-medium">{selectedPassword.householdCode}</p>
                    </div>
                    <div>
                       <p className="text-muted-foreground mb-1 text-xs uppercase">Số điện thoại</p>
                       <p className="font-medium">{selectedPassword.phone}</p>
                    </div>
                     <div>
                       <p className="text-muted-foreground mb-1 text-xs uppercase">Lần đăng nhập cuối</p>
                       <p className="font-medium">{selectedPassword.lastLogin}</p>
                    </div>
                 </div>

                 <div className="bg-muted p-3 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Lý do yêu cầu</p>
                    <p className="text-sm font-medium italic">"{selectedPassword.reason}"</p>
                 </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
                <Button variant="ghost" onClick={() => setSelectedPassword(null)}>Đóng</Button>
                <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white" onClick={handlePasswordApprove}>
                   <Check className="h-4 w-4 mr-2" /> Phê duyệt & Gửi Email
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ApprovalsPage;