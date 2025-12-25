import { useState } from 'react';
import { 
  MessageSquare, Search, Filter, CheckCircle2, 
  Clock, AlertCircle, Eye, Send,
  FileText, CornerDownRight, User, MapPin, 
  MoreHorizontal, History
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

// --- MOCK DATA: Danh sách phản ánh từ cư dân ---
const FEEDBACK_LIST = [
  {
    id: 'FB-2024-001',
    resident: 'Nguyễn Văn An',
    apartment: 'A-1205',
    type: 'Vệ sinh',
    subject: 'Hành lang khu A chưa được dọn dẹp',
    description: 'Rác thải để trước cửa phòng 1204 từ hôm qua chưa thấy ai dọn, gây mùi khó chịu. Đề nghị BQL kiểm tra.',
    status: 'pending', // pending | processing | resolved
    priority: 'medium', // low | medium | high
    createdAt: '25/12/2024 08:30',
    history: []
  },
  {
    id: 'FB-2024-002',
    resident: 'Trần Thị Bích',
    apartment: 'B-0502',
    type: 'Kỹ thuật',
    subject: 'Đèn đường nội khu bị hỏng',
    description: 'Bóng đèn số 4 ở khu vui chơi trẻ em bị nhấp nháy liên tục. Các cháu chơi buổi tối rất hại mắt.',
    status: 'processing',
    priority: 'low',
    createdAt: '24/12/2024 19:15',
    history: [
      { date: '25/12/2024 08:00', action: 'Đã tiếp nhận', by: 'Admin' },
      { date: '25/12/2024 09:00', action: 'Đã chuyển bộ phận Kỹ thuật', by: 'Admin' }
    ]
  },
  {
    id: 'FB-2024-003',
    resident: 'Lê Văn Cường',
    apartment: 'A-2109',
    type: 'An ninh',
    subject: 'Người lạ phát tờ rơi',
    description: 'Có người lạ vào tận cửa căn hộ phát tờ rơi quảng cáo lúc 20h tối. An ninh tòa nhà ở đâu?',
    status: 'pending',
    priority: 'high',
    createdAt: '25/12/2024 09:00',
    history: []
  },
  {
    id: 'FB-2024-004',
    resident: 'Phạm Thị Dung',
    apartment: 'C-1010',
    type: 'Hành chính',
    subject: 'Thẻ cư dân bị lỗi',
    description: 'Thẻ của tôi không quẹt được thang máy. Đã báo lễ tân nhưng chưa thấy xử lý.',
    status: 'resolved',
    priority: 'medium',
    createdAt: '20/12/2024 14:00',
    response: 'Đã reset lại thẻ cho cư dân. Cư dân đã xác nhận sử dụng bình thường.',
    history: [
      { date: '20/12/2024 14:30', action: 'Đã tiếp nhận', by: 'Admin' },
      { date: '20/12/2024 15:00', action: 'Hoàn tất xử lý', by: 'Admin' }
    ]
  },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: 'Chờ tiếp nhận', color: 'text-orange-600', bg: 'bg-orange-50', icon: Clock },
  processing: { label: 'Đang xử lý', color: 'text-blue-600', bg: 'bg-blue-50', icon: AlertCircle },
  resolved: { label: 'Đã hoàn thành', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
};

const FeedbackPageManagement = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<typeof FEEDBACK_LIST[0] | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Lọc dữ liệu
  const displayData = FEEDBACK_LIST.filter(item => {
    const matchStatus = filter === 'all' || item.status === filter;
    const matchSearch = item.subject.toLowerCase().includes(search.toLowerCase()) || 
                        item.resident.toLowerCase().includes(search.toLowerCase()) ||
                        item.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Actions
  const handleUpdateStatus = (newStatus: string) => {
    toast({
      title: "Cập nhật trạng thái",
      description: `Phản ánh ${selectedItem?.id} đã chuyển sang: ${STATUS_MAP[newStatus].label}`,
    });
    // Logic gọi API update status ở đây
    if (newStatus === 'resolved') {
      setSelectedItem(null);
    }
  };

  const handleSendReply = () => {
    if (!replyContent.trim()) {
      toast({ title: "Lỗi", description: "Vui lòng nhập nội dung phản hồi", variant: "destructive" });
      return;
    }
    toast({
      title: "Đã gửi phản hồi",
      description: "Nội dung đã được gửi đến ứng dụng của cư dân.",
      className: "bg-green-50 border-green-200 text-green-800"
    });
    setReplyContent('');
    setSelectedItem(null);
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
              <p className="text-2xl font-bold text-slate-900">{FEEDBACK_LIST.filter(i => i.status === 'pending').length}</p>
            </div>
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Clock size={20} /></div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500 font-medium">Đang xử lý</p>
              <p className="text-2xl font-bold text-slate-900">{FEEDBACK_LIST.filter(i => i.status === 'processing').length}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><AlertCircle size={20} /></div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500 font-medium">Đã hoàn thành</p>
              <p className="text-2xl font-bold text-slate-900">{FEEDBACK_LIST.filter(i => i.status === 'resolved').length}</p>
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
              {displayData.map((item) => {
                const Status = STATUS_MAP[item.status];
                return (
                  <TableRow key={item.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedItem(item)}>
                    <TableCell className="font-medium text-slate-700">{item.id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{item.resident}</div>
                      <div className="text-xs text-slate-500">{item.apartment}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-normal bg-white">{item.type}</Badge>
                        {item.priority === 'high' && <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">Khẩn</Badge>}
                      </div>
                      <div className="text-sm text-slate-600 truncate max-w-[300px]">{item.subject}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border-0 gap-1", Status.bg, Status.color)}>
                        <Status.icon className="h-3 w-3" /> {Status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-slate-500">{item.createdAt}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {displayData.length === 0 && (
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
                  {selectedItem?.subject}
                </DialogTitle>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                  Mã đơn: <span className="font-mono text-slate-700">{selectedItem?.id}</span> 
                  • Gửi lúc: {selectedItem?.createdAt}
                </p>
              </div>
              {selectedItem && (
                <Badge className={cn("px-3 py-1", STATUS_MAP[selectedItem.status].bg, STATUS_MAP[selectedItem.status].color)}>
                  {STATUS_MAP[selectedItem.status].label}
                </Badge>
              )}
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6 overflow-y-auto">
            {/* 1. Thông tin người gửi */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white border flex items-center justify-center text-primary font-bold">
                  {selectedItem?.resident.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-slate-500">Người phản ánh</p>
                  <p className="font-medium text-slate-900">{selectedItem?.resident}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white border flex items-center justify-center text-slate-500">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Căn hộ</p>
                  <p className="font-medium text-slate-900">{selectedItem?.apartment}</p>
                </div>
              </div>
            </div>

            {/* 2. Nội dung chi tiết */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">Nội dung chi tiết</h4>
              <div className="bg-white p-4 rounded-lg border border-slate-200 text-slate-700 leading-relaxed text-sm shadow-sm">
                {selectedItem?.description}
              </div>
            </div>

            {/* 3. Lịch sử / Kết quả (Nếu đã xong) */}
            {selectedItem?.status === 'resolved' && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">Kết quả xử lý</h4>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-green-800 text-sm">
                  <div className="flex gap-2 font-medium mb-1"><CheckCircle2 className="h-4 w-4"/> Đã hoàn thành</div>
                  {selectedItem.response}
                </div>
              </div>
            )}

            {/* 4. Khu vực thao tác (Nếu chưa xong) */}
            {selectedItem?.status !== 'resolved' && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Phản hồi & Xử lý</h4>
                  <div className="flex gap-2">
                    {selectedItem?.status === 'pending' && (
                      <Button variant="outline" size="sm" onClick={() => handleUpdateStatus('processing')} className="border-blue-200 text-blue-700 hover:bg-blue-50">
                        Tiếp nhận
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">Thao tác khác</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Trạng thái</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleUpdateStatus('pending')}>Chuyển về Chờ xử lý</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus('processing')}>Đang xử lý</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus('resolved')} className="text-green-600 font-medium">Đánh dấu Hoàn thành</DropdownMenuItem>
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