import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, Plus, Search, Calendar, Clock, MapPin, 
  Trash2, Edit3, Eye, AlertCircle, CheckCircle2, AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { newsItems as initialNewsItems, NewsItem } from '@/data/mockData';

const AdminNewsPage = () => {
  const { toast } = useToast();
  
  // States
  const [listNews, setListNews] = useState<NewsItem[]>(initialNewsItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'meeting',
    summary: '',
    content: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    location: '',
    isImportant: false
  });

  // 1. Logic Tìm kiếm (Search)
  const filteredNews = useMemo(() => {
    return listNews.filter(news => 
      news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, listNews]);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '', type: 'meeting', summary: '', content: '',
      eventDate: '', startTime: '', endTime: '', location: '', isImportant: false
    });
    setIsEditing(false);
    setSelectedNews(null);
  };

  // 2. Xử lý Mở Modal Sửa (Edit)
  const handleEditClick = (news: NewsItem) => {
    setSelectedNews(news);
    setIsEditing(true);
    // Ở đây bạn map dữ liệu từ news vào formData
    setFormData({
      title: news.title,
      type: news.type as any,
      summary: news.summary,
      content: news.content || '',
      eventDate: news.date || '', // Giả định date trong mock khớp với field
      startTime: '', // Bổ sung nếu mockData có
      endTime: '',
      location: 'Nhà văn hóa',
      isImportant: news.isImportant || false
    });
    setIsModalOpen(true);
  };

  // 3. Xử lý Mở Modal Xóa (Delete)
  const handleDeleteClick = (news: NewsItem) => {
    setSelectedNews(news);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedNews) {
      setListNews(prev => prev.filter(n => n.id !== selectedNews.id));
      toast({
        title: "Đã xóa",
        description: `Thông báo "${selectedNews.title}" đã được gỡ bỏ.`,
        variant: "destructive"
      });
    }
    setIsDeleteDialogOpen(false);
  };

  const handlePublish = () => {
    if (isEditing) {
      toast({ title: "Cập nhật thành công", description: "Thông báo đã được thay đổi nội dung." });
    } else {
      toast({ title: "Phát hành thành công", description: "Thông báo đã được gửi đến toàn bộ cư dân." });
    }
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-blue-600" />
            Quản lý Thông báo & Sự kiện
          </h1>
          <p className="text-slate-500">Phát tin tức và lịch sinh hoạt cho khu dân cư</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setIsModalOpen(true); }} 
          className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
        >
          <Plus className="mr-2 h-4 w-4" /> Phát thông báo mới
        </Button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-3">
          <CardContent className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Tìm kiếm tiêu đề hoặc nội dung vắn tắt..." 
                className="pl-10 border-none shadow-none focus-visible:ring-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        <div className="flex items-center justify-center bg-blue-50 rounded-lg border border-blue-100 p-3">
          <span className="text-blue-700 font-medium">Kết quả: {filteredNews.length} bản tin</span>
        </div>
      </div>

      {/* News List */}
      <div className="grid gap-4">
        <AnimatePresence mode='popLayout'>
          {filteredNews.map((news) => (
            <motion.div
              key={news.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${
                        news.type === 'health' ? 'bg-green-100 text-green-600' : 
                        news.type === 'meeting' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-800">{news.title}</h3>
                          {news.isImportant && <Badge variant="destructive">Khẩn</Badge>}
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-1">{news.summary}</p>
                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {news.date}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Nhà văn hóa</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <Button variant="outline" size="sm" className="h-8" onClick={() => handleEditClick(news)}>
                        <Edit3 className="h-3 w-3 mr-1" /> Sửa
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-100"
                        onClick={() => handleDeleteClick(news)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Xóa
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredNews.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed">
            <Search className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <p className="text-slate-500">Không tìm thấy thông báo nào khớp với từ khóa "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* CREATE/EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if(!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-blue-600" /> 
              {isEditing ? "Chỉnh sửa thông báo" : "Phát thông báo mới"}
            </DialogTitle>
            <DialogDescription>Dữ liệu này sẽ hiển thị trực tiếp lên trang chủ của cư dân</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Loại tin tức</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(val) => setFormData({...formData, type: val})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Họp tổ dân phố</SelectItem>
                    <SelectItem value="health">Y tế / Tiêm chủng</SelectItem>
                    <SelectItem value="payment">Thu phí / Hóa đơn</SelectItem>
                    <SelectItem value="event">Sự kiện / Lễ hội</SelectItem>
                    <SelectItem value="security">An ninh / Cảnh báo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Tiêu đề thông báo</Label>
                <Input 
                  placeholder="VD: Lịch tiêm chủng mở rộng đợt 1/2026" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Thông số sự kiện hiển thị chi tiết</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1 text-xs text-blue-600"><Calendar className="h-3 w-3" /> Ngày diễn ra</Label>
                  <Input type="date" className="bg-white" value={formData.eventDate} onChange={(e) => setFormData({...formData, eventDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1 text-xs text-blue-600"><Clock className="h-3 w-3" /> Giờ bắt đầu</Label>
                  <Input type="time" className="bg-white" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1 text-xs text-blue-600"><Clock className="h-3 w-3" /> Giờ kết thúc</Label>
                  <Input type="time" className="bg-white" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1 text-xs text-blue-600"><MapPin className="h-3 w-3" /> Địa điểm tổ chức</Label>
                <Input placeholder="VD: Nhà văn hóa phường (Tầng 2)" className="bg-white" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mô tả ngắn (Summary)</Label>
              <Input 
                placeholder="Hiển thị ở danh sách tin tức ngoài trang chủ..." 
                value={formData.summary}
                onChange={(e) => setFormData({...formData, summary: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Nội dung chi tiết</Label>
              <Textarea 
                placeholder="Nhập nội dung chi tiết bài viết..." 
                className="min-h-[120px]" 
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
              <input 
                type="checkbox" 
                id="important" 
                className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500" 
                checked={formData.isImportant}
                onChange={(e) => setFormData({...formData, isImportant: e.target.checked})}
              />
              <Label htmlFor="important" className="text-red-700 font-semibold cursor-pointer text-sm">Đánh dấu là tin nhắn khẩn cấp (Sẽ có nhãn Đỏ và rung thông báo)</Label>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>Hủy bỏ</Button>
            <Button onClick={handlePublish} className="bg-blue-600 hover:bg-blue-700">
              <CheckCircle2 className="mr-2 h-4 w-4" /> {isEditing ? "Lưu thay đổi" : "Phát hành ngay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION ALERT */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center">Xác nhận xóa thông báo?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Hành động này không thể hoàn tác. Thông báo <strong>"{selectedNews?.title}"</strong> sẽ bị gỡ khỏi trang chủ của tất cả cư dân.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2">
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Xác nhận xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminNewsPage;