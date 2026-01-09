import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, X, Eye, Clock, UserPlus, Calendar, UserMinus, 
  UserCheck, MapPin, Shield, Smartphone, Mail, FileText, Loader2
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
import { getPendingUsersAPI, approveUserAPI, getAllRequestsAPI, updateRequestStatusAPI } from '@/services/apiService';

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

// accountRequests sẽ được load từ API, không cần mock data nữa

const typeLabels: Record<string, string> = {
  tam_vang: 'Tạm vắng',
  TamVang: 'Tạm vắng',
  tam_tru: 'Tạm trú',
  TamTru: 'Tạm trú',
  dat_lich: 'Đặt lịch',
  DatLich: 'Đặt lịch',
  bien_dong: 'Biến động',
  BienDong: 'Biến động',
};

const typeIcons: Record<string, React.ElementType> = {
  tam_vang: UserMinus,
  TamVang: UserMinus,
  tam_tru: UserPlus,
  TamTru: UserPlus,
  dat_lich: Calendar,
  DatLich: Calendar,
  bien_dong: Clock,
  BienDong: Clock,
};

const ApprovalsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('requests');
  const [requestFilter, setRequestFilter] = useState('all');
  const [viewStatus, setViewStatus] = useState<'Pending' | 'History'>('Pending');
  
  // States cho các dialog chi tiết
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // States cho dữ liệu từ API
  const [accountRequests, setAccountRequests] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null);
  
  // States cho requests
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);

  // Fetch danh sách user chờ duyệt từ API
  const fetchPendingUsers = async () => {
    setLoadingAccounts(true);
    try {
      const response = await getPendingUsersAPI();
      if (response.success && response.data) {
        // Format dữ liệu từ API để phù hợp với cấu trúc hiện tại
        const formattedUsers = response.data.map((user: any) => ({
          id: user.id,
          name: user.full_name,
          phone: user.phone || 'Chưa cập nhật',
          email: user.email,
          submittedAt: new Date(user.created_at).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          status: user.status,
          householdCode: user.id, // Tạm thời dùng ID, có thể thay bằng householdCode nếu có
          idCard: 'Chưa cập nhật', // Có thể thêm vào API sau
          address: 'Chưa cập nhật', // Có thể thêm vào API sau
          role: user.role === 'admin' ? 'Quản trị viên' : 'Cư dân',
          avatar: user.avatar || null,
        }));
        setAccountRequests(formattedUsers);
      }
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách user chờ duyệt:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải danh sách user chờ duyệt',
        variant: 'destructive',
      });
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Fetch danh sách requests từ API
  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await getAllRequestsAPI();
      if (response.success && response.data) {
        setRequests(response.data);
      } else {
        setRequests([]);
      }
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách yêu cầu:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải danh sách yêu cầu',
        variant: 'destructive',
      });
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchPendingUsers();
    fetchRequests();
  }, []);

  // Đếm số lượng pending requests (cho Badge)
  const pendingRequestsCount = requests.filter((r) => {
    const status = r.status?.toLowerCase();
    return status === 'pending';
  }).length;

  const filteredRequests = requests.filter((r) => {
    // Lọc theo viewStatus
    if (viewStatus === 'Pending') {
      // Chỉ lấy các request có status = 'Pending' hoặc 'pending'
      if (r.status && r.status.toLowerCase() !== 'pending') return false;
    } else if (viewStatus === 'History') {
      // Chỉ lấy các request đã được xử lý (Approved hoặc Rejected)
      const status = r.status?.toLowerCase();
      if (status !== 'approved' && status !== 'rejected') return false;
    }
    
    // Lọc theo loại yêu cầu
    if (requestFilter === 'all') return true;
    return r.type === requestFilter;
  });

  // --- Handlers ---
  const handleApprove = async () => {
    if (!selectedRequest) return;

    setUpdatingRequestId(selectedRequest.id);
    try {
      const response = await updateRequestStatusAPI(selectedRequest.id, 'Approved');
      if (response.success) {
        toast({ 
          title: 'Đã duyệt', 
          description: `Yêu cầu của ${selectedRequest?.full_name || selectedRequest?.applicant_name} đã được phê duyệt.` 
        });
        setSelectedRequest(null);
        // Reload danh sách
        await fetchRequests();
      } else {
        throw new Error(response.message || 'Không thể duyệt yêu cầu');
      }
    } catch (error: any) {
      console.error('Lỗi khi duyệt yêu cầu:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể duyệt yêu cầu. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    if (!rejectReason) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập lý do từ chối', variant: 'destructive' });
      return;
    }

    setUpdatingRequestId(selectedRequest.id);
    try {
      const response = await updateRequestStatusAPI(selectedRequest.id, 'Rejected');
      if (response.success) {
        toast({ 
          title: 'Đã từ chối', 
          description: `Yêu cầu của ${selectedRequest?.full_name || selectedRequest?.applicant_name} đã bị từ chối.` 
        });
        setSelectedRequest(null);
        setShowRejectInput(false);
        setRejectReason('');
        // Reload danh sách
        await fetchRequests();
      } else {
        throw new Error(response.message || 'Không thể từ chối yêu cầu');
      }
    } catch (error: any) {
      console.error('Lỗi khi từ chối yêu cầu:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể từ chối yêu cầu. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const handleAccountApprove = async () => {
    if (!selectedAccount) return;

    setApprovingUserId(selectedAccount.id);
    try {
      const response = await approveUserAPI(selectedAccount.id);
      if (response.success) {
        toast({ 
          title: 'Đã duyệt tài khoản', 
          description: response.message || `Tài khoản của ${selectedAccount?.name} đã được kích hoạt.` 
        });
        setSelectedAccount(null);
        // Reload danh sách để user đó biến mất
        await fetchPendingUsers();
      } else {
        throw new Error(response.message || 'Không thể duyệt tài khoản');
      }
    } catch (error: any) {
      console.error('Lỗi khi duyệt tài khoản:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể duyệt tài khoản',
        variant: 'destructive',
      });
    } finally {
      setApprovingUserId(null);
    }
  };

  // Helper function để render request detail
  const renderRequestDetail = () => {
    if (!selectedRequest) return null;

    const displayName = selectedRequest.full_name || selectedRequest.applicant_name || 'Không có tên';
    const displayHouseholdCode = selectedRequest.household_code || selectedRequest.householdCode || 'Chưa có';
    const displayType = typeLabels[selectedRequest.type] || selectedRequest.type;
    
    // Format thời gian
    const formatDate = (dateString: string) => {
      if (!dateString) return 'Chưa có';
      try {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        return dateString;
      }
    };
    const displayDate = formatDate(selectedRequest.created_at || '');

    // Parse details từ JSON string hoặc object
    let detailsObj: any = {};
    if (selectedRequest.details) {
      try {
        if (typeof selectedRequest.details === 'string') {
          detailsObj = JSON.parse(selectedRequest.details);
        } else {
          detailsObj = selectedRequest.details;
        }
      } catch {
        detailsObj = {};
      }
    }

    // Map các trường từ details
    const detailLabels: Record<string, string> = {
      reason: 'Lý do',
      start_date: 'Ngày bắt đầu',
      end_date: 'Ngày kết thúc',
      ho_ten: 'Họ tên',
      ngay_sinh: 'Ngày sinh',
      cccd: 'CCCD',
      ly_do: 'Lý do',
      thoi_gian_luu_tru: 'Thời gian lưu trú',
      permanent_address: 'Địa chỉ thường trú',
      ngay_di: 'Ngày đi',
      noi_den: 'Nơi đến',
      dia_diem: 'Địa điểm',
      muc_dich: 'Mục đích',
      thoi_gian: 'Thời gian',
    };

    return (
      <div className="space-y-6">
        {/* Header Info */}
        <div className="rounded-lg bg-muted/30 p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-primary">{displayName}</h3>
            <Badge variant="outline" className="px-3 py-1 bg-white">{displayType}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserCheck className="h-4 w-4" /> {displayHouseholdCode}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" /> {displayDate}
            </div>
          </div>
        </div>

        {/* Dynamic Details */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" /> Nội dung kê khai
          </h4>
          <div className="bg-background rounded-lg border border-border p-4 space-y-3">
            {/* Hiển thị Lý do (reason) */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground text-sm font-medium min-w-[80px]">Lý do:</span>
                <div className="font-medium text-sm flex-1 whitespace-pre-line">
                  {selectedRequest.reason || (detailsObj.reason ? String(detailsObj.reason) : null) || 'Người dùng không nhập lý do'}
                </div>
              </div>
            </div>

            {/* Hiển thị Thời gian (start_date và end_date) */}
            {(selectedRequest.start_date || selectedRequest.end_date || detailsObj.start_date || detailsObj.end_date) && (
              <div className="flex items-start gap-2 pt-2 border-t border-dashed border-border">
                <span className="text-muted-foreground text-sm font-medium min-w-[80px]">Thời gian:</span>
                <span className="font-medium text-sm flex-1">
                  {selectedRequest.start_date || detailsObj.start_date ? (
                    <>Từ: {formatDate(selectedRequest.start_date || detailsObj.start_date)}</>
                  ) : null}
                  {(selectedRequest.start_date || detailsObj.start_date) && (selectedRequest.end_date || detailsObj.end_date) && ' - '}
                  {selectedRequest.end_date || detailsObj.end_date ? (
                    <>Đến: {formatDate(selectedRequest.end_date || detailsObj.end_date)}</>
                  ) : null}
                </span>
              </div>
            )}

            {/* Hiển thị các trường khác từ details (nếu có) */}
            {Object.keys(detailsObj).length > 0 && Object.keys(detailsObj).some(key => key !== 'reason' && key !== 'start_date' && key !== 'end_date') && (
              <>
                {Object.entries(detailsObj)
                  .filter(([key]) => key !== 'reason' && key !== 'start_date' && key !== 'end_date')
                  .map(([key, value]) => {
                    const label = detailLabels[key] || key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
                    const displayValue = value ? String(value) : 'Chưa có';
                    return (
                      <div key={key} className="flex justify-between text-sm border-t border-dashed border-border pt-2">
                        <span className="text-muted-foreground capitalize">{label}</span>
                        <span className="font-medium text-right">{displayValue}</span>
                      </div>
                    );
                  })}
              </>
            )}
          </div>
        </div>

        {/* Actions - Chỉ hiển thị khi request chưa được xử lý (Pending) */}
        {selectedRequest.status?.toLowerCase() === 'pending' && (
          <div className="space-y-4 pt-4 border-t">
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
                  <Button 
                    variant="outline" 
                    className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive" 
                    onClick={() => setShowRejectInput(true)}
                    disabled={updatingRequestId === selectedRequest?.id}
                  >
                    <X className="h-4 w-4 mr-2" /> Từ chối
                  </Button>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white" 
                    onClick={handleApprove}
                    disabled={updatingRequestId === selectedRequest?.id}
                  >
                    {updatingRequestId === selectedRequest?.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" /> Phê duyệt ngay
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowRejectInput(false)}
                    disabled={updatingRequestId === selectedRequest?.id}
                  >
                    Hủy
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1" 
                    onClick={handleReject}
                    disabled={updatingRequestId === selectedRequest?.id || !rejectReason.trim()}
                  >
                    {updatingRequestId === selectedRequest?.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang xử lý...
                      </>
                    ) : (
                      'Xác nhận từ chối'
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Hiển thị trạng thái đã xử lý khi ở chế độ History */}
        {selectedRequest.status?.toLowerCase() !== 'pending' && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              {selectedRequest.status?.toLowerCase() === 'approved' ? (
                <>
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-700">Yêu cầu đã được phê duyệt</span>
                </>
              ) : selectedRequest.status?.toLowerCase() === 'rejected' ? (
                <>
                  <X className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-700">Yêu cầu đã bị từ chối</span>
                </>
              ) : null}
              {selectedRequest.updated_at && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatDate(selectedRequest.updated_at)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Phê duyệt</h1>
        <p className="text-muted-foreground">Xử lý các yêu cầu chờ duyệt từ cư dân</p>
      </motion.div>

      {/* --- TABS --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted mb-6 w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
          <TabsTrigger value="requests" className="gap-2">
            <Clock className="h-4 w-4" /> <span className="hidden sm:inline">Yêu cầu</span>
            {pendingRequestsCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {pendingRequestsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gap-2">
            <UserCheck className="h-4 w-4" /> <span className="hidden sm:inline">Tài khoản</span>
            <Badge variant="secondary" className="ml-1">{accountRequests.length}</Badge>
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

          {/* Bộ lọc chế độ xem: Chờ xử lý / Lịch sử */}
          <div className="flex gap-2 mb-4 p-1 bg-muted rounded-lg w-fit">
            <Button
              variant={viewStatus === 'Pending' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewStatus('Pending')}
              className={viewStatus === 'Pending' ? 'bg-primary text-primary-foreground' : ''}
            >
              Đang chờ xử lý
            </Button>
            <Button
              variant={viewStatus === 'History' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewStatus('History')}
              className={viewStatus === 'History' ? 'bg-primary text-primary-foreground' : ''}
            >
              Lịch sử phê duyệt
            </Button>
          </div>

          {loadingRequests ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Đang tải danh sách...</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {viewStatus === 'Pending' 
                  ? 'Không có yêu cầu nào chờ duyệt' 
                  : 'Không có yêu cầu nào trong lịch sử'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredRequests.map((request, index) => {
                const Icon = typeIcons[request.type] || Clock;
                const displayName = request.full_name || request.applicant_name || 'Không có tên';
                const displayHouseholdCode = request.household_code || 'Chưa có';
                const displayType = typeLabels[request.type] || request.type;
                const requestStatus = request.status?.toLowerCase();
                
                // Xác định loại yêu cầu để phân biệt màu Badge
                const isTamTru = request.type === 'TamTru' || request.type === 'tam_tru';
                const isTamVang = request.type === 'TamVang' || request.type === 'tam_vang';
                
                // Format thời gian
                const formatDate = (dateString: string) => {
                  if (!dateString) return 'Chưa có';
                  try {
                    const date = new Date(dateString);
                    return date.toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                  } catch {
                    return dateString;
                  }
                };
                const displayDate = formatDate(request.created_at || '');
                const displayUpdatedDate = request.updated_at ? formatDate(request.updated_at) : null;

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
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <p className="font-semibold text-foreground">{displayName}</p>
                                {/* Badge phân biệt màu sắc: TamTru = Xanh dương, TamVang = Vàng */}
                                {isTamTru ? (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {displayType}
                                  </Badge>
                                ) : isTamVang ? (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                    {displayType}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                    {displayType}
                                  </Badge>
                                )}
                                {/* Hiển thị Badge trạng thái khi ở chế độ History */}
                                {viewStatus === 'History' && (
                                  <>
                                    {requestStatus === 'approved' && (
                                      <Badge className="bg-green-500 text-white border-0">
                                        Đã duyệt
                                      </Badge>
                                    )}
                                    {requestStatus === 'rejected' && (
                                      <Badge variant="destructive" className="bg-red-500 text-white border-0">
                                        Đã từ chối
                                      </Badge>
                                    )}
                                  </>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">Mã hộ: {displayHouseholdCode}</p>
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Gửi lúc: {displayDate}
                              </p>
                              {/* Hiển thị ngày duyệt nếu có */}
                              {viewStatus === 'History' && displayUpdatedDate && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  {requestStatus === 'approved' ? '✓' : '✗'} Xử lý lúc: {displayUpdatedDate}
                                </p>
                              )}
                            </div>
                          </div>
                          {/* Chỉ hiển thị nút "Xem xét" khi ở chế độ Pending */}
                          {viewStatus === 'Pending' ? (
                            <Button variant="outline" onClick={() => setSelectedRequest(request)}>
                              <Eye className="h-4 w-4 mr-1" /> Xem xét
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              onClick={() => setSelectedRequest(request)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="h-4 w-4 mr-1" /> Xem chi tiết
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
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
              {loadingAccounts ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Đang tải danh sách...</span>
                </div>
              ) : accountRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <UserCheck className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Không có tài khoản nào chờ duyệt</p>
                </div>
              ) : (
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
              )}
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

          {renderRequestDetail()}
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
                <Button variant="outline" onClick={() => setSelectedAccount(null)} className="w-full sm:w-auto" disabled={approvingUserId === selectedAccount?.id}>
                  Hủy bỏ
                </Button>
                <Button 
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white" 
                  onClick={handleAccountApprove}
                  disabled={approvingUserId === selectedAccount?.id}
                >
                  {approvingUserId === selectedAccount?.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" /> Xác thực & Kích hoạt
                    </>
                  )}
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