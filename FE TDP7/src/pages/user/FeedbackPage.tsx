import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, MessageSquare, Clock, CheckCircle2, 
  AlertCircle, CornerDownRight, User 
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

// --- MOCK DATA: Lịch sử phản ánh của User ---
const MOCK_HISTORY = [
  {
    id: 1,
    category: 've_sinh',
    categoryLabel: 'Vệ sinh môi trường',
    title: 'Rác thải hành lang tầng 5 chưa dọn',
    content: 'Từ sáng đến giờ (14h) rác vẫn để đầy hành lang bốc mùi hôi. Đề nghị BQL nhắc nhở đội vệ sinh.',
    date: '20/12/2024',
    status: 'resolved', // Đã xử lý
    adminResponse: 'Chào bạn, BQL đã tiếp nhận và yêu cầu tổ vệ sinh xử lý ngay lúc 14h30. Rất xin lỗi vì sự bất tiện này.',
    adminName: 'Ban Quản Lý'
  },
  {
    id: 2,
    category: 'an_ninh',
    categoryLabel: 'An ninh trật tự',
    title: 'Người lạ phát tờ rơi',
    content: 'Có người lạ vào gõ cửa từng nhà phát tờ rơi quảng cáo internet lúc 19h tối.',
    date: '22/12/2024',
    status: 'pending', // Chờ xử lý
    adminResponse: null, // Chưa có phản hồi
    adminName: null
  }
];

const FeedbackPage = () => {
  const { toast } = useToast();
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Hàm render Badge trạng thái
  const renderStatus = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0"><CheckCircle2 className="w-3 h-3 mr-1"/> Đã xử lý</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0"><Clock className="w-3 h-3 mr-1"/> Chờ xử lý</Badge>;
      default:
        return <Badge variant="outline">Đang xem xét</Badge>;
    }
  };

  const handleSubmit = () => {
    if (!category || !title || !content) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Thành công',
      description: 'Đã gửi phản ánh của bạn! BQL sẽ phản hồi sớm nhất.',
    });
    setCategory('');
    setTitle('');
    setContent('');
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
                  <SelectItem value="an_ninh">An ninh trật tự</SelectItem>
                  <SelectItem value="ve_sinh">Vệ sinh môi trường</SelectItem>
                  <SelectItem value="ha_tang">Hạ tầng - Kỹ thuật</SelectItem>
                  <SelectItem value="dich_vu">Dịch vụ - Tiện ích</SelectItem>
                  <SelectItem value="khac">Khác</SelectItem>
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
            />
          </div>

          <div className="flex justify-end">
            <Button className="gradient-primary px-6" onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-2" />
              Gửi phản ánh
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
          {MOCK_HISTORY.length > 0 ? (
            MOCK_HISTORY.map((item) => (
              <div key={item.id} className="rounded-xl bg-card p-5 shadow-sm border border-border/60 hover:shadow-md transition-shadow">
                {/* Header của Card: Tiêu đề + Trạng thái */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                        {item.categoryLabel}
                      </Badge>
                      <span className="text-xs text-muted-foreground">• {item.date}</span>
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
                {item.adminResponse ? (
                  <div className="relative mt-4 pl-4 md:pl-0">
                    {/* Đường nối visual */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 rounded-full md:hidden"></div>
                    
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 ml-2 md:ml-8 relative">
                      <CornerDownRight className="absolute -left-3 top-[-10px] w-6 h-6 text-primary/40 hidden md:block" />
                      
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center">
                          <User className="h-3 w-3 text-white" />
                        </div>
                        <span className="font-semibold text-sm text-primary">Ban Quản Lý</span>
                        <span className="text-xs text-muted-foreground">đã phản hồi</span>
                      </div>
                      
                      <p className="text-sm text-foreground leading-relaxed">
                        {item.adminResponse}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground italic mt-2 ml-1">
                    <AlertCircle className="w-3 h-3" />
                    Đang chờ Ban quản lý phản hồi...
                  </div>
                )}
              </div>
            ))
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