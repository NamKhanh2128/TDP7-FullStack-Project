import { useState, useEffect } from 'react';
import { 
  MessageSquare, Search, Filter, CheckCircle2, 
  Clock, AlertCircle, Eye, Send,
  FileText, CornerDownRight, User, MapPin, 
  MoreHorizontal, History, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  getReportStatsAPI, 
  getAllReportsAPI,
  updateReportStatusAPI
} from '@/services/apiService';
import { formatDateTime } from '@/utils/formatDate';

// Interface cho dữ liệu Report từ API
interface Report {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  status: 'Pending' | 'Processing' | 'Resolved';
  created_at: string;
  user_name?: string;
  apartment_number?: string;
  admin_response?: string | null;
}

// Map category sang label tiếng Việt
const CATEGORY_MAP: Record<string, string> = {
  'an_ninh': 'An ninh',
  've_sinh': 'Vệ sinh',
  'ha_tang': 'Hạ tầng',
  'dich_vu': 'Dịch vụ',
  'khac': 'Khác',
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  Pending: { label: 'Chờ tiếp nhận', color: 'text-orange-600', bg: 'bg-orange-50', icon: Clock },
  Processing: { label: 'Đang xử lý', color: 'text-blue-600', bg: 'bg-blue-50', icon: AlertCircle },
  Resolved: { label: 'Đã hoàn thành', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
};

const FeedbackPageManagement = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<Report | null>(null);
  const [replyContent, setReplyContent] = useState('');
  
  // States cho dữ liệu từ API
  const [stats, setStats] = useState({ pending: 0, processing: 0, resolved: 0 });
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Hàm fetch data để tái sử dụng
  const fetchData = async () => {
    try {
      // Gọi cả 2 API cùng lúc bằng Promise.all
      const [statsResponse, reportsResponse] = await Promise.all([
        getReportStatsAPI(),
        getAllReportsAPI()
      ]);

      // Xử lý stats
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      // Xử lý danh sách reports
      if (reportsResponse.success && reportsResponse.data) {
        const reportsData = reportsResponse.data;
        console.log('📊 API trả về số lượng reports:', reportsData.length);
        
        if (reportsData.length === 0) {
          console.log('⚠️ API trả về mảng rỗng');
        }
        
        setReports(reportsData);
      } else {
        console.log('⚠️ API trả về mảng rỗng hoặc không có data');
        setReports([]);
      }
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải dữ liệu phản ánh',
        variant: 'destructive',
      });
      setReports([]);
    }
  };

  // Fetch stats và danh sách reports khi component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchData();
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Lọc dữ liệu
  const displayData = reports.filter(item => {
    // Map filter value sang status từ API (Pending, Processing, Resolved)
    const statusMap: Record<string, string> = {
      'all': 'all',
      'pending': 'Pending',
      'processing': 'Processing',
      'resolved': 'Resolved',
    };
    const matchStatus = filter === 'all' || item.status === statusMap[filter];
    const matchSearch = item.title?.toLowerCase().includes(search.toLowerCase()) || 
                        item.user_name?.toLowerCase().includes(search.toLowerCase()) ||
                        item.id?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Generate mã đơn từ ID
  const generateReportCode = (id: string | number) => {
    const year = new Date().getFullYear();
    // Nếu id là số (Identity), dùng trực tiếp. Nếu là string, lấy 6 ký tự cuối
    const shortId = typeof id === 'number' 
      ? id.toString().padStart(6, '0')
      : id.toString().substring(id.toString().length - 6).toUpperCase();
    return `RP-${year}-${shortId}`;
  };

  // Actions - Cập nhật trạng thái
  const handleUpdateStatus = async (newStatus: 'Pending' | 'Processing' | 'Resolved') => {
    if (!selectedItem) return;

    setIsUpdating(true);
    try {
      const reportId = selectedItem.id;
      
      // Gửi cả status và admin_response (từ replyContent)
      const statusData = { 
        status: newStatus,
        admin_response: replyContent.trim() || null // Gửi admin_response từ replyContent
      };

      console.log('🔄 Đang cập nhật trạng thái:', {
        id: reportId,
        status: newStatus,
        admin_response: statusData.admin_response,
        endpoint: `/api/reports/${reportId}/status`,
        body: statusData,
      });

      // QUAN TRỌNG: Đợi API trả lời xong mới tiếp tục
      const response = await updateReportStatusAPI(reportId, statusData);

      console.log('✅ API trả về:', response);

      if (!response.success) {
        throw new Error(response.message || 'Cập nhật trạng thái thất bại');
      }

      // Hiển thị thông báo thành công
      toast({
        title: "Cập nhật trạng thái",
        description: `Phản ánh ${generateReportCode(reportId)} đã chuyển sang: ${STATUS_MAP[newStatus].label}`,
      });

      // Đợi refresh dữ liệu từ server (gọi lại hàm fetchData)
      console.log('🔄 Đang refresh dữ liệu từ server...');
      await fetchData();
      console.log('✅ Đã refresh dữ liệu từ server');

        // Xóa nội dung phản hồi sau khi gửi thành công
        setReplyContent('');
        
        // Cập nhật selectedItem hoặc đóng modal nếu đã resolved
        if (newStatus === 'Resolved') {
          setSelectedItem(null);
        } else {
          // Cập nhật selectedItem với status mới
          setSelectedItem({ ...selectedItem, status: newStatus });
        }
    } catch (error: any) {
      console.error('❌ Lỗi khi cập nhật trạng thái:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật trạng thái',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedItem) return;
    
    if (!replyContent.trim()) {
      toast({ 
        title: "Lỗi", 
        description: "Vui lòng nhập nội dung phản hồi", 
        variant: "destructive" 
      });
      return;
    }

    setIsUpdating(true);
    try {
      const reportId = selectedItem.id;
      
      // Gửi admin_response mà không thay đổi status (giữ nguyên status hiện tại)
      const updateData = { 
        status: selectedItem.status, // Giữ nguyên status hiện tại
        admin_response: replyContent.trim() // Gửi nội dung phản hồi
      };

      console.log('🔄 Đang gửi phản hồi:', {
        id: reportId,
        status: selectedItem.status,
        admin_response: updateData.admin_response,
        endpoint: `/api/reports/${reportId}/status`,
        body: updateData,
      });

      // Gọi API để lưu admin_response
      const response = await updateReportStatusAPI(reportId, updateData);

      console.log('✅ API trả về:', response);

      if (!response.success) {
        throw new Error(response.message || 'Không thể gửi phản hồi');
      }

      // Hiển thị thông báo thành công
      toast({
        title: "Đã gửi phản hồi",
        description: "Nội dung đã được gửi đến ứng dụng của cư dân.",
        className: "bg-green-50 border-green-200 text-green-800"
      });

      // Refresh dữ liệu từ server
      console.log('🔄 Đang refresh dữ liệu từ server...');
      await fetchData();
      console.log('✅ Đã refresh dữ liệu từ server');

      // Xóa nội dung phản hồi sau khi gửi thành công
      setReplyContent('');
      
      // Cập nhật selectedItem với admin_response mới
      setSelectedItem({ ...selectedItem, admin_response: replyContent.trim() });
    } catch (error: any) {
      console.error('❌ Lỗi khi gửi phản hồi:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể gửi phản hồi',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      
      {/* Title */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Phản ánh</h1>
          <p className="text-slate-500">Theo dõi và xử lý các ý kiến đóng góp từ cư dân.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="gap-2"><FileText className="h-4 w-4"/> Xuất báo cáo</Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500 font-medium">Chờ xử lý</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
            </div>
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Clock size={20} /></div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500 font-medium">Đang xử lý</p>
              <p className="text-2xl font-bold text-slate-900">{stats.processing}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><AlertCircle size={20} /></div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500 font-medium">Đã hoàn thành</p>
              <p className="text-2xl font-bold text-slate-900">{stats.resolved}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg text-green-600"><CheckCircle2 size={20} /></div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="shadow-sm border border-slate-200">
        <CardHeader className="p-4 border-b bg-slate-50/50">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Tìm kiếm phản ánh..." 
                className="pl-9 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px] bg-white">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Lọc trạng thái" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ tiếp nhận</SelectItem>
                <SelectItem value="processing">Đang xử lý</SelectItem>
                <SelectItem value="resolved">Đã hoàn thành</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Mã đơn</TableHead>
                <TableHead>Cư dân / Căn hộ</TableHead>
                <TableHead>Vấn đề</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Ngày gửi</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : displayData.length > 0 ? (
                displayData.map((item) => {
                  const Status = STATUS_MAP[item.status] || STATUS_MAP['Pending'];
                  const categoryLabel = CATEGORY_MAP[item.category] || item.category || 'Khác';
                  return (
                    <TableRow 
                      key={item.id} 
                      className="hover:bg-slate-50 cursor-pointer" 
                      onClick={() => setSelectedItem(item)}
                    >
                      <TableCell className="font-medium text-slate-700">
                        {generateReportCode(item.id)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">{item.user_name || 'Không xác định'}</div>
                        <div className="text-xs text-slate-500">{item.apartment_number || 'Chưa có'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="font-normal bg-white">{categoryLabel}</Badge>
                        </div>
                        <div className="text-sm text-slate-600 truncate max-w-[300px]">{item.title}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("border-0 gap-1", Status.bg, Status.color)}>
                          <Status.icon className="h-3 w-3" /> {Status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-slate-500">
                        {item.created_at ? item.created_at : formatDateTime(item.created_at)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    Không tìm thấy dữ liệu phù hợp.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- MODAL XỬ LÝ (Chi tiết) --- */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-0 p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex justify-between items-start pr-6">
              <div>
                <DialogTitle className="text-xl flex items-center gap-2">
                  {selectedItem?.title}
                </DialogTitle>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                  Mã đơn: <span className="font-mono text-slate-700">{selectedItem ? generateReportCode(selectedItem.id) : ''}</span> 
                  • Gửi lúc: {selectedItem ? (selectedItem.created_at || formatDateTime(selectedItem.created_at)) : ''}
                </p>
              </div>
              {selectedItem && (
                <Badge className={cn("px-3 py-1", STATUS_MAP[selectedItem.status]?.bg || STATUS_MAP['Pending'].bg, STATUS_MAP[selectedItem.status]?.color || STATUS_MAP['Pending'].color)}>
                  {STATUS_MAP[selectedItem.status]?.label || 'Chờ tiếp nhận'}
                </Badge>
              )}
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6 overflow-y-auto">
            {/* 1. Thông tin người gửi */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white border flex items-center justify-center text-primary font-bold">
                  {selectedItem?.user_name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-xs text-slate-500">Người phản ánh</p>
                  <p className="font-medium text-slate-900">{selectedItem?.user_name || 'Không xác định'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white border flex items-center justify-center text-slate-500">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Căn hộ</p>
                  <p className="font-medium text-slate-900">{selectedItem?.apartment_number || 'Chưa có'}</p>
                </div>
              </div>
            </div>

            {/* 2. Danh mục */}
            {selectedItem?.category && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">Danh mục</h4>
                <Badge variant="outline" className="font-normal">
                  {CATEGORY_MAP[selectedItem.category] || selectedItem.category}
                </Badge>
              </div>
            )}

            {/* 3. Nội dung chi tiết */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">Nội dung chi tiết</h4>
              <div className="bg-white p-4 rounded-lg border border-slate-200 text-slate-700 leading-relaxed text-sm shadow-sm">
                {selectedItem?.content}
              </div>
            </div>


            {/* 5. Lịch sử / Kết quả (Nếu đã xong) */}
            {selectedItem?.status === 'Resolved' && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">Kết quả xử lý</h4>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-green-800 text-sm">
                  <h4 className="font-bold text-green-700 flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4" /> Đã hoàn thành
                  </h4>
                  <p className="text-green-800 mt-2 text-sm">
                    {selectedItem.admin_response 
                      ? `🗣 Phản hồi: ${selectedItem.admin_response}` 
                      : "Phản ánh đã được xử lý (Không có lời nhắn)."}
                  </p>
                </div>
              </div>
            )}

            {/* 6. Khu vực thao tác (Nếu chưa xong) */}
            {selectedItem?.status !== 'Resolved' && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Phản hồi & Xử lý</h4>
                  <div className="flex gap-2">
                    {selectedItem?.status === 'Pending' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleUpdateStatus('Processing')} 
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang xử lý...
                          </>
                        ) : (
                          'Tiếp nhận'
                        )}
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" disabled={isUpdating}>
                          {isUpdating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang xử lý...
                            </>
                          ) : (
                            'Thao tác khác'
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Trạng thái</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleUpdateStatus('Pending')}>Chuyển về Chờ xử lý</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus('Processing')}>Đang xử lý</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus('Resolved')} className="text-green-600 font-medium">Đánh dấu Hoàn thành</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Textarea 
                    placeholder="Nhập nội dung phản hồi tới cư dân hoặc ghi chú nội bộ..." 
                    className="min-h-[100px] resize-none"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                  <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setSelectedItem(null)}>Hủy</Button>
                    <Button className="bg-primary hover:bg-primary/90" onClick={handleSendReply}>
                      <Send className="mr-2 h-4 w-4" /> Gửi phản hồi
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedbackPageManagement;