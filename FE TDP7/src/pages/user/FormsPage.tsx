import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserMinus, UserPlus, AlertTriangle, Clock, CheckCircle2, Loader2, Pencil, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { TamVangForm } from '@/components/user/forms/TamVangForm';
import { TamTruForm } from '@/components/user/forms/TamTruForm';
import { BienDongForm } from '@/components/user/forms/BienDongForm';
import { getMyRequestsAPI } from '@/services/apiService';
import { cn } from '@/lib/utils';

const formTypes = [
  {
    id: 'tamvang',
    label: 'Tạm vắng',
    icon: UserMinus,
    description: 'Khai báo khi thành viên đi khỏi địa phương',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    id: 'tamtru',
    label: 'Tạm trú / Lưu trú',
    icon: UserPlus,
    description: 'Đăng ký cho khách, người thuê trọ',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    id: 'biendong',
    label: 'Biến động',
    icon: AlertTriangle,
    description: 'Mới sinh, qua đời, chuyển đi',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
];

const FormsPage = () => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'tamvang');
  const [openForm, setOpenForm] = useState<string | null>(null);
  const [editingRequest, setEditingRequest] = useState<any | null>(null);
  
  // State cho danh sách yêu cầu
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  
  // State cho Modal xem chi tiết
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hàm fetch danh sách yêu cầu
  const fetchMyRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const response = await getMyRequestsAPI();
      if (response.success && response.data) {
        setMyRequests(response.data);
      } else {
        setMyRequests([]);
      }
    } catch (error: any) {
      console.error('Error fetching my requests:', error);
      setMyRequests([]);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Fetch khi trang load
  useEffect(() => {
    fetchMyRequests();
  }, []);

  useEffect(() => {
    if (tabFromUrl && formTypes.some(f => f.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Format ngày tháng
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa có';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Map type sang label tiếng Việt
  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'tam_vang': 'Tạm vắng',
      'TamVang': 'Tạm vắng',
      'tam_tru': 'Tạm trú',
      'TamTru': 'Tạm trú',
      'dat_lich': 'Đặt lịch',
      'DatLich': 'Đặt lịch',
    };
    return typeMap[type] || type;
  };

  // Map status sang badge
  const getStatusBadge = (status: string) => {
    if (status === 'Approved' || status === 'approved') {
      return <Badge className="bg-green-500 hover:bg-green-600 text-white">Đã duyệt</Badge>;
    } else if (status === 'Rejected' || status === 'rejected') {
      return <Badge className="bg-red-500 hover:bg-red-600 text-white">Từ chối</Badge>;
    } else {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Chờ duyệt</Badge>;
    }
  };

  // Cắt ngắn lý do
  const truncateReason = (reason: string, maxLength: number = 60) => {
    if (!reason) return 'Không có lý do';
    if (reason.length <= maxLength) return reason;
    return reason.substring(0, maxLength) + '...';
  };

  // Parse reason để lấy lý do và nơi đến
  const parseReason = (reason: string) => {
    if (!reason) return { reason: '', destination: '' };
    
    // Format: "Xin tạm vắng cho thành viên: ... Lý do: ... - Nơi đến: ..."
    const reasonMatch = reason.match(/Lý do:\s*(.+?)(?:\s*-\s*Nơi đến:|$)/);
    const destinationMatch = reason.match(/Nơi đến:\s*(.+?)$/);
    
    return {
      reason: reasonMatch ? reasonMatch[1].trim() : reason,
      destination: destinationMatch ? destinationMatch[1].trim() : '',
    };
  };

  // Xử lý sửa yêu cầu
  const handleEditRequest = (request: any) => {
    // Chỉ cho sửa Tạm vắng hiện tại
    if (request.type === 'tam_vang' || request.type === 'TamVang') {
      setEditingRequest(request);
      setOpenForm('tamvang');
    }
  };

  // Xử lý xem chi tiết
  const handleViewDetail = (request: any) => {
    setSelectedRecord(request);
    setIsModalOpen(true);
  };
  
  // Đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  return (
    <div className="container py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            {formTypes.map((form) => (
              <TabsTrigger
                key={form.id}
                value={form.id}
                className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                {form.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {formTypes.map((form) => (
            <TabsContent key={form.id} value={form.id} className="mt-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => setOpenForm(form.id)}
                  className="w-full rounded-2xl bg-card p-6 shadow-card transition-all hover:shadow-elevated hover:scale-[1.01] text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-xl', form.bgColor)}>
                      <form.icon className={cn('h-7 w-7', form.color)} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{form.label}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{form.description}</p>
                      <Button variant="gradient" className="mt-4">
                        Bắt đầu khai báo
                      </Button>
                    </div>
                  </div>
                </button>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      {/* Recent Submissions */}
      <motion.section
        className="mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="mb-4 text-lg font-semibold text-foreground">Khai báo gần đây</h2>
        <div className="rounded-xl bg-card p-4 shadow-card">
          {isLoadingRequests ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
              <span className="text-sm text-muted-foreground">Đang tải...</span>
            </div>
          ) : myRequests.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              Chưa có khai báo nào
            </p>
          ) : (
            <div className="space-y-3">
              {myRequests.map((request) => {
                const isPending = request.status === 'Pending' || request.status === 'pending';
                const isApproved = request.status === 'Approved' || request.status === 'approved';
                const parsedReason = parseReason(request.reason || '');
                
                return (
                  <div
                    key={request.id}
                    className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {getTypeLabel(request.type)}
                          </span>
                          {getStatusBadge(request.status)}
                        </div>
                        
                        {/* Lý do (cắt ngắn) */}
                        {parsedReason.reason && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {truncateReason(parsedReason.reason, 80)}
                          </p>
                        )}
                        
                        {/* Ngày bắt đầu - kết thúc */}
                        {(request.start_date || request.end_date) && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {request.start_date ? formatDate(request.start_date) : 'Chưa có'} - {request.end_date ? formatDate(request.end_date) : 'Chưa có'}
                            </span>
                          </div>
                        )}
                        
                        {/* Ngày gửi */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Gửi: {formatDate(request.created_at || '')}</span>
                        </div>
                      </div>
                      
                      {/* Nút hành động */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isPending && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRequest(request)}
                            className="h-8 px-3"
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Sửa
                          </Button>
                        )}
                        {isApproved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(request)}
                            className="h-8 px-3"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Xem chi tiết
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.section>

      {/* Modal xem chi tiết */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Chi tiết {selectedRecord ? getTypeLabel(selectedRecord.type) : 'Đơn'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-4 mt-4">
              {/* Thông tin người đăng ký */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-3 text-foreground">Thông tin người đăng ký</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Họ và tên:</span>
                    <p className="font-medium text-foreground mt-1">
                      {selectedRecord.applicant_name || selectedRecord.full_name || 'Chưa có'}
                    </p>
                  </div>
                  {selectedRecord.household_code && (
                    <div>
                      <span className="text-muted-foreground">Mã hộ khẩu:</span>
                      <p className="font-medium text-foreground mt-1">{selectedRecord.household_code}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Loại đơn */}
              <div>
                <h4 className="font-semibold text-sm mb-2 text-foreground">Loại đơn</h4>
                <Badge className={cn(
                  selectedRecord.type === 'tam_tru' || selectedRecord.type === 'TamTru' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-warning text-warning-foreground'
                )}>
                  {getTypeLabel(selectedRecord.type)}
                </Badge>
              </div>

              {/* Thời gian */}
              <div>
                <h4 className="font-semibold text-sm mb-2 text-foreground">Thời gian</h4>
                <div className="bg-muted/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Từ ngày:</span>
                    <span className="font-medium text-foreground">
                      {selectedRecord.start_date ? formatDate(selectedRecord.start_date) : 'Chưa có'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Đến ngày:</span>
                    <span className="font-medium text-foreground">
                      {selectedRecord.end_date ? formatDate(selectedRecord.end_date) : 'Chưa có'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lý do */}
              <div>
                <h4 className="font-semibold text-sm mb-2 text-foreground">Lý do</h4>
                <div className="bg-muted/30 p-3 rounded-lg">
                  {selectedRecord.reason ? (
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {selectedRecord.reason}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Chưa có lý do</p>
                  )}
                </div>
              </div>

              {/* Trạng thái */}
              <div>
                <h4 className="font-semibold text-sm mb-2 text-foreground">Trạng thái</h4>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedRecord.status)}
                  <span className="text-xs text-muted-foreground">
                    (Gửi lúc: {formatDate(selectedRecord.created_at || '')})
                  </span>
                </div>
              </div>

              {/* Phản hồi của công an (nếu có) */}
              {(selectedRecord.admin_response || selectedRecord.admin_note) && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-foreground">Phản hồi của Ban quản lý</h4>
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <p className="text-sm text-blue-800 whitespace-pre-wrap">
                      {selectedRecord.admin_response || selectedRecord.admin_note}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TamVangForm 
        open={openForm === 'tamvang'} 
        onClose={() => {
          setOpenForm(null);
          setEditingRequest(null);
        }}
        onSuccess={() => {
          fetchMyRequests();
          setEditingRequest(null);
        }}
        initialData={editingRequest}
      />
      <TamTruForm 
        open={openForm === 'tamtru'} 
        onClose={() => setOpenForm(null)}
        onSuccess={fetchMyRequests}
      />
      <BienDongForm 
        open={openForm === 'biendong'} 
        onClose={() => setOpenForm(null)}
      />
    </div>
  );
};

export default FormsPage;
