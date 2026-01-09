import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, MessageSquare, Clock, CheckCircle2, 
  AlertCircle, CornerDownRight, User, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createReportAPI, getMyReportsAPI } from '@/services/apiService';
import { formatDate, formatDateTime } from '@/utils/formatDate';

// Interface cho dữ liệu Report từ API
interface Report {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  status: 'Pending' | 'Processing' | 'Resolved';
  created_at: string;
  admin_response?: string | null;
}

// Map category sang label tiếng Việt
const CATEGORY_MAP: Record<string, string> = {
  'VeSinh': 'Vệ sinh môi trường',
  'AnNinh': 'An ninh trật tự',
  'KyThuat': 'Hạ tầng - Kỹ thuật',
  'HanhChinh': 'Dịch vụ - Tiện ích',
  'an_ninh': 'An ninh trật tự',
  've_sinh': 'Vệ sinh môi trường',
  'ha_tang': 'Hạ tầng - Kỹ thuật',
  'dich_vu': 'Dịch vụ - Tiện ích',
  'khac': 'Khác',
};

// Map category từ Frontend sang Backend
const CATEGORY_TO_BACKEND: Record<string, string> = {
  'VeSinh': 've_sinh',
  'AnNinh': 'an_ninh',
  'KyThuat': 'ha_tang',
  'HanhChinh': 'dich_vu',
};

const FeedbackPage = () => {
  const { toast } = useToast();
  
  // State quản lý Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State quản lý Danh sách (Lịch sử)
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch danh sách phản ánh khi trang load
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const response = await getMyReportsAPI();
        if (response.success && response.data) {
          setReports(response.data);
        }
      } catch (error: any) {
        console.error('Error fetching reports:', error);
        toast({
          title: 'Lỗi',
          description: error.message || 'Không thể tải lịch sử phản ánh',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Hàm render Badge trạng thái
  const renderStatus = (status: string) => {
    switch (status) {
      case 'Resolved':
      case 'resolved':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0"><CheckCircle2 className="w-3 h-3 mr-1"/> Đã xử lý</Badge>;
      case 'Pending':
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0"><Clock className="w-3 h-3 mr-1"/> Chờ xử lý</Badge>;
      case 'Processing':
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0"><AlertCircle className="w-3 h-3 mr-1"/> Đang xử lý</Badge>;
      default:
        return <Badge variant="outline">Đang xem xét</Badge>;
    }
  };

  // Hàm gửi phản ánh
  const handleSendReport = async () => {
    // Kiểm tra dữ liệu rỗng
    if (!category || !title || !content) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Map category từ Frontend sang Backend format
      const backendCategory = CATEGORY_TO_BACKEND[category] || category;

      // Gọi API POST /api/reports
      const response = await createReportAPI({
        title,
        category: backendCategory,
        content,
      });

      if (response.success) {
        // Nếu thành công: Alert "Gửi thành công", xóa trắng form
        toast({
          title: 'Thành công',
          description: 'Đã gửi phản ánh của bạn! BQL sẽ phản hồi sớm nhất.',
        });

        // Xóa trắng form
        setTitle('');
        setCategory('');
        setContent('');

        // Gọi lại hàm lấy danh sách để cập nhật ngay lập tức
        const reportsResponse = await getMyReportsAPI();
        if (reportsResponse.success && reportsResponse.data) {
          setReports(reportsResponse.data);
        }
      }
    } catch (error: any) {
      console.error('Error sending report:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể gửi phản ánh. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-6 max-w-3xl mx-auto space-y-8">
      
      {/* --- FORM GỬI PHẢN ÁNH --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card p-6 shadow-card border border-border/50"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <MessageSquare className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">Gửi ý kiến phản ánh</h2>
            <p className="text-sm text-muted-foreground">Đóng góp ý kiến để xây dựng cộng đồng tốt hơn</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Danh mục</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Chọn vấn đề" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VeSinh">Vệ sinh môi trường</SelectItem>
                  <SelectItem value="AnNinh">An ninh trật tự</SelectItem>
                  <SelectItem value="KyThuat">Hạ tầng - Kỹ thuật</SelectItem>
                  <SelectItem value="HanhChinh">Dịch vụ - Tiện ích</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tiêu đề</Label>
              <Input
                placeholder="Ví dụ: Đèn hành lang bị hỏng"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nội dung chi tiết</Label>
            <Textarea
              placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] bg-background resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end">
            <Button 
              className="gradient-primary px-6" 
              onClick={handleSendReport}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Gửi phản ánh
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* --- LỊCH SỬ & PHẢN HỒI TỪ ADMIN --- */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="mb-4 text-xl font-bold text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" /> Lịch sử phản ánh
        </h2>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 bg-card rounded-xl border border-dashed">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Đang tải lịch sử phản ánh...</p>
            </div>
          ) : reports.length > 0 ? (
            reports.map((item) => {
              const categoryLabel = CATEGORY_MAP[item.category] || item.category || 'Khác';
              const formattedDate = formatDate(item.created_at);
              
              return (
                <div key={item.id} className="rounded-xl bg-card p-5 shadow-sm border border-border/60 hover:shadow-md transition-shadow">
                  {/* Header của Card: Tiêu đề + Trạng thái */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                          {categoryLabel}
                        </Badge>
                        <span className="text-xs text-muted-foreground">• {formattedDate}</span>
                      </div>
                      <h3 className="font-bold text-base text-foreground">{item.title}</h3>
                    </div>
                    <div className="shrink-0">
                      {renderStatus(item.status)}
                    </div>
                  </div>

                  {/* Nội dung người dùng gửi */}
                  <div className="bg-muted/30 p-3 rounded-lg text-sm text-foreground/90 mb-4">
                    {item.content}
                  </div>

                  {/* --- PHẦN PHẢN HỒI TỪ ADMIN --- */}
                  {item.admin_response ? (
                    <div className="bg-blue-50 p-3 rounded-lg mt-2 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <User className="h-3 w-3 text-white" />
                        </div>
                        <strong className="text-sm text-blue-800">Ban Quản lý:</strong>
                      </div>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        {item.admin_response}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400 text-sm mt-2 italic">
                      <Clock className="w-3 h-3" />
                      <span>⏳ Đang chờ phản hồi...</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 bg-card rounded-xl border border-dashed">
              <p className="text-sm text-muted-foreground">Chưa có lịch sử phản ánh nào.</p>
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default FeedbackPage;
