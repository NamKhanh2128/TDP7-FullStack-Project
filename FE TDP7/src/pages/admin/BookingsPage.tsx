import { useState } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Check, X, Eye, 
  Building, Edit2, MapPin, History, 
  Plus, Package, LayoutGrid, ChevronRight,
  User, Receipt, Tag, FileText, CheckCircle2, Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator'; // Ensure Separator is imported

const BookingsPage = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // --- 1. DỮ LIỆU ---
  const [assets, setAssets] = useState([
    { id: '1', name: 'Hội trường chính', fee: 500000, unit: 'Buổi', location: 'Tầng 1', category: 'location', status: 'Busy', timeInfo: 'Đến 21:00' },
    { id: '2', name: 'Sân cầu lông 1', fee: 50000, unit: 'Giờ', location: 'Sân sau', category: 'location', status: 'Ready', timeInfo: 'Bây giờ' },
    { id: '3', name: 'Bộ loa di động', fee: 150000, unit: 'Ngày', location: 'Kho A', category: 'equipment', status: 'Rented', timeInfo: 'Trả: 28/12' },
  ]);

  const [bookingRequests, setBookingRequests] = useState([
    { 
      id: 'bk-01', status: 'pending',
      applicant: 'Nguyễn Minh Tuấn', code: 'TDP7-2024-001', 
      assetId: '1', date: '28/12/2025', time: '18:00 - 20:00', 
      purpose: 'Họp tổ dân phố & sinh hoạt văn nghệ quý 4', fee: 500000 
    }
  ]);

  const [bookingHistory, setBookingHistory] = useState([
    { 
      id: 'h-01', status: 'completed',
      applicant: 'Lê Văn Cường', code: 'TDP7-2024-005',
      assetId: '1', assetName: 'Hội trường chính', location: 'Tầng 1',
      date: '20/12/2025', time: '08:00 - 11:30',
      purpose: 'Tổ chức lễ mừng thọ cho các cụ cao tuổi',
      fee: 500000
    },
    { 
      id: 'h-02', status: 'completed',
      applicant: 'Trần Thị Bích', code: 'TDP7-2024-012',
      assetId: '3', assetName: 'Bộ loa di động', location: 'Kho A',
      date: '15/12/2025', time: '14:00 - 18:00',
      purpose: 'Liên hoan thiếu nhi khu phố',
      fee: 150000
    },
  ]);

  // --- 2. STATES ---
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [assetCategory, setAssetCategory] = useState<'location' | 'equipment'>('location');
  const [formData, setFormData] = useState({ name: '', fee: '', unit: '', location: '' });
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // --- 3. HANDLERS ---
  const handleSaveAsset = () => {
    const newAsset = {
      id: editingAsset?.id || Math.random().toString(36).substr(2, 9),
      name: formData.name, fee: parseInt(formData.fee), unit: formData.unit || 'Lượt',
      location: formData.location || 'Nhà văn hóa', category: assetCategory,
      status: editingAsset?.status || 'Ready', timeInfo: editingAsset?.timeInfo || 'Bây giờ'
    };
    if (editingAsset) setAssets(assets.map(a => a.id === editingAsset.id ? newAsset : a));
    else setAssets([...assets, newAsset]);
    setIsAssetModalOpen(false);
    toast({ title: "Thành công", description: "Dữ liệu đã cập nhật." });
  };

  const deleteAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
    toast({ title: "Đã xóa", description: "Tài sản đã được gỡ bỏ." });
  };

  const handleApprove = () => {
    toast({ title: "Phê duyệt đơn", description: `Đã xác nhận lịch cho ${selectedBooking.applicant}` });
    setSelectedBooking(null);
  };

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen font-sans text-foreground">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-card gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Quản trị Nhà văn hóa</h1>
          <div className="flex items-center gap-2 text-primary font-medium text-sm">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Giám sát tài sản & lịch đặt
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button onClick={() => { setAssetCategory('location'); setEditingAsset(null); setFormData({name:'',fee:'',unit:'',location:''}); setIsAssetModalOpen(true); }} className="flex-1 md:flex-none gradient-primary text-primary-foreground h-11 px-6 rounded-xl shadow-soft font-semibold border-none">
            <Plus className="h-5 w-5 mr-2" /> Thêm địa điểm
          </Button>
          <Button onClick={() => { setAssetCategory('equipment'); setEditingAsset(null); setFormData({name:'',fee:'',unit:'',location:''}); setIsAssetModalOpen(true); }} variant="outline" className="flex-1 md:flex-none border-primary/20 text-primary hover:bg-primary/5 h-11 px-6 rounded-xl font-semibold">
            <Package className="h-5 w-5 mr-2" /> Thêm thiết bị
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* CỘT TRÁI: LỊCH & DANH MỤC */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-border shadow-card rounded-2xl overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 border-b border-border py-5">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                <CalendarIcon className="h-5 w-5 text-primary" /> Lịch sử dụng
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-card flex justify-center">
              <Calendar mode="single" selected={date} onSelect={setDate} className="w-full max-w-full scale-110" />
            </CardContent>
          </Card>

          <Card className="border-border shadow-card rounded-2xl overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 border-b border-border py-5">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                <LayoutGrid className="h-5 w-5 text-secondary" /> Danh mục cho thuê
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-card">
              <Table>
                <TableBody>
                  {assets.map(item => (
                    <TableRow key={item.id} className="group border-b border-border last:border-none hover:bg-muted/50 transition-colors">
                      <TableCell className="py-5 pl-6">
                        <p className="font-semibold text-foreground text-sm">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className={cn("text-[10px] border-none font-medium px-2 py-0.5", item.category === 'location' ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary")}>
                              {item.category === 'location' ? 'Địa điểm' : 'Thiết bị'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{item.fee.toLocaleString()}đ/{item.unit}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => { setEditingAsset(item); setAssetCategory(item.category as any); setFormData({name:item.name, fee:item.fee.toString(), unit:item.unit, location:item.location}); setIsAssetModalOpen(true); }}><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => deleteAsset(item.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* CỘT PHẢI: PHÊ DUYỆT & LỊCH SỬ CHI TIẾT */}
        <div className="lg:col-span-6 space-y-8">
          {/* PHÊ DUYỆT */}
          <Card className="border-border shadow-card rounded-2xl overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 border-b border-border py-5 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-warning">
                <Clock className="h-5 w-5" /> Yêu cầu thuê chờ xử lý
              </CardTitle>
              <Badge className="bg-warning text-warning-foreground border-none h-6 px-3 font-bold">Mới</Badge>
            </CardHeader>
            <CardContent className="p-0 bg-card">
              <Table>
                <TableHeader className="bg-muted/50 border-b border-border h-12">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6 text-xs font-medium text-muted-foreground">Người thuê</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Dịch vụ</TableHead>
                    <TableHead className="text-right pr-8 text-xs font-medium text-muted-foreground">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookingRequests.map((req) => (
                    <TableRow key={req.id} className="hover:bg-primary/5 transition-colors border-border">
                      <TableCell className="pl-6 py-5">
                        <p className="font-semibold text-foreground text-sm">{req.applicant}</p>
                        <p className="text-[10px] text-muted-foreground">{req.code}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium text-foreground">{assets.find(a=>a.id===req.assetId)?.name}</p>
                        <p className="text-[10px] font-medium text-primary mt-1">{req.date}</p>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button onClick={() => setSelectedBooking(req)} variant="outline" className="h-9 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg font-medium text-xs transition-all">
                          <Eye className="h-3.5 w-3.5 mr-2" /> Duyệt đơn
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* LỊCH SỬ HOẠT ĐỘNG */}
          <Card className="border-border shadow-card rounded-2xl overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 border-b border-border py-5 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                <History className="h-5 w-5 text-secondary" /> Lịch sử hoạt động
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-primary font-bold hover:bg-primary/10"><Receipt className="h-4 w-4 mr-2" /> Xuất báo cáo</Button>
            </CardHeader>
            <CardContent className="p-0 bg-card">
              <Table>
                <TableHeader className="bg-muted/50 border-b border-border h-12">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6 text-xs font-medium text-muted-foreground w-[30%]">Người sử dụng</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Tài sản & Vị trí</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Thời gian</TableHead>
                    <TableHead className="text-right pr-8 text-xs font-medium text-muted-foreground">Chi tiết</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookingHistory.map((h) => (
                    <TableRow key={h.id} className="border-b border-border last:border-none hover:bg-muted/30 transition-colors group">
                      <TableCell className="pl-6 py-4 align-top">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"><User className="h-4 w-4" /></div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">{h.applicant}</p>
                                <p className="text-[10px] text-muted-foreground">{h.code}</p>
                            </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <p className="text-sm font-medium text-primary">{h.assetName}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" /> {h.location}</p>
                      </TableCell>
                      <TableCell className="align-top">
                        <p className="text-sm text-foreground">{h.date}</p>
                        <p className="text-[10px] text-muted-foreground">{h.time}</p>
                      </TableCell>
                      <TableCell className="text-right pr-8 align-top">
                        <div className="flex flex-col items-end gap-2">
                            <Badge className="bg-success/10 text-success border-none text-[9px] h-5 font-bold uppercase px-2">Hoàn tất</Badge>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setSelectedBooking(h)} 
                                className="h-7 text-[10px] text-muted-foreground hover:text-primary hover:bg-primary/5 px-2"
                            >
                                Xem chi tiết <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- POP-UP CHI TIẾT (ĐÃ CHỈNH SỬA GIAO DIỆN) --- */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0 border-none rounded-3xl shadow-elevated bg-card">
          {/* Header Pop-up: Gradient mềm mại, icon trong suốt */}
          <div className={cn("p-6 text-primary-foreground text-center shrink-0 relative overflow-hidden", selectedBooking?.status === 'completed' ? "bg-gradient-to-br from-emerald-500 to-teal-500" : "gradient-primary")}>
              <div className="relative z-10">
                {selectedBooking?.status === 'completed' ? (
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-90" />
                ) : (
                    <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-90" />
                )}
                <DialogTitle className="text-xl font-bold leading-tight">
                    {selectedBooking?.status === 'completed' ? 'Chi tiết lịch sử' : 'Phê duyệt lịch đặt'}
                </DialogTitle>
                <p className="text-xs opacity-80 mt-1 font-medium">
                    {selectedBooking?.status === 'completed' ? 'Đơn đã hoàn thành' : 'Đơn đăng ký dịch vụ'}
                </p>
              </div>
              {/* Decorative shapes */}
              <div className="absolute top-0 left-0 w-full h-full bg-white/10 blur-3xl rounded-full transform -translate-y-1/2 scale-150 pointer-events-none"></div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Người đăng ký: Card nhẹ nhàng */}
              <div className="flex items-center gap-4 bg-accent/30 p-4 rounded-2xl border border-accent">
                  <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shadow-soft"><User className="h-5 w-5" /></div>
                  <div>
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">Người đăng ký</p>
                      <p className="font-bold text-foreground text-base">{selectedBooking?.applicant}</p>
                      <p className="text-xs text-muted-foreground">{selectedBooking?.code}</p>
                  </div>
              </div>

              {/* Chi tiết: Clean layout, bỏ bold đậm */}
              <div className="space-y-5 px-1">
                  <div className="flex gap-4">
                      <div className="mt-0.5 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0"><Tag className="h-4 w-4" /></div>
                      <div className="flex-1">
                          <p className="text-xs text-muted-foreground font-medium mb-1">Tài sản & Vị trí</p>
                          <p className="text-sm font-semibold text-foreground">
                            {selectedBooking?.assetName || assets.find(a=>a.id===selectedBooking?.assetId)?.name} 
                          </p>
                          <p className="text-xs text-primary mt-0.5">
                            {selectedBooking?.location || assets.find(a=>a.id===selectedBooking?.assetId)?.location}
                          </p>
                      </div>
                  </div>

                  <div className="flex gap-4">
                      <div className="mt-0.5 h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0"><Clock className="h-4 w-4" /></div>
                      <div className="flex-1">
                          <p className="text-xs text-muted-foreground font-medium mb-1">Thời gian sử dụng</p>
                          <p className="text-sm font-semibold text-foreground">{selectedBooking?.time}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{selectedBooking?.date}</p>
                      </div>
                  </div>

                  <div className="flex gap-4">
                      <div className="mt-0.5 h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0"><FileText className="h-4 w-4" /></div>
                      <div className="flex-1">
                          <p className="text-xs text-muted-foreground font-medium mb-1">Mục đích</p>
                          <p className="text-sm text-foreground/80 leading-relaxed">"{selectedBooking?.purpose}"</p>
                      </div>
                  </div>
              </div>

              <Separator className="bg-border" />

              <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium text-sm">Tổng phí dịch vụ</span>
                  <span className="text-xl font-bold text-primary">{selectedBooking?.fee?.toLocaleString()}đ</span>
              </div>
          </div>

          <DialogFooter className="p-6 pt-0 bg-transparent flex gap-3 shrink-0 sm:justify-center">
              {selectedBooking?.status === 'completed' ? (
                  <Button onClick={() => setSelectedBooking(null)} className="w-full rounded-xl h-11 border-border text-muted-foreground font-medium hover:bg-muted bg-transparent border shadow-sm">
                      Đóng cửa sổ
                  </Button>
              ) : (
                  <>
                      <Button variant="outline" onClick={() => setSelectedBooking(null)} className="flex-1 rounded-xl h-11 border-border text-muted-foreground font-medium hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20">
                          Từ chối
                      </Button>
                      <Button onClick={handleApprove} className="flex-1 rounded-xl h-11 gradient-primary font-bold shadow-soft text-primary-foreground hover:opacity-90 border-none">
                          <Check className="h-4 w-4 mr-2" /> Duyệt ngay
                      </Button>
                  </>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- 5. DIALOG THÊM / SỬA TÀI SẢN --- */}
      <Dialog open={isAssetModalOpen} onOpenChange={setIsAssetModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0 border-none rounded-2xl shadow-elevated bg-card">
          <div className={cn("p-6 text-primary-foreground shrink-0", assetCategory === 'location' ? "gradient-primary" : "gradient-hero")}>
            <DialogTitle className="flex items-center gap-2 font-bold text-lg">
              {editingAsset ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingAsset ? 'Cập nhật thông tin' : 'Thêm mới'} {assetCategory === 'location' ? 'địa điểm' : 'thiết bị'}
            </DialogTitle>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-card">
            <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Tên hiển thị</Label>
                <Input placeholder="VD: Hội trường tầng 2..." value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-10 rounded-xl border-border focus:ring-1 focus:ring-primary/50 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Đơn giá (VNĐ)</Label>
                  <Input type="number" value={formData.fee} onChange={(e) => setFormData({...formData, fee: e.target.value})} className="h-10 rounded-xl border-border text-sm" />
              </div>
              <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Đơn vị tính</Label>
                  <Input placeholder="Buổi/Ngày..." value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="h-10 rounded-xl border-border text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Vị trí lưu kho/thực tế</Label>
                <Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="h-10 rounded-xl border-border text-sm" />
            </div>
          </div>
          <DialogFooter className="p-6 bg-muted/20 border-t border-border flex gap-3 shrink-0">
            <Button variant="outline" onClick={() => setIsAssetModalOpen(false)} className="rounded-xl h-10 flex-1 border-border font-medium text-muted-foreground hover:bg-muted">Hủy</Button>
            <Button onClick={handleSaveAsset} className={cn("rounded-xl h-10 flex-1 font-bold text-primary-foreground shadow-soft border-none hover:opacity-90", assetCategory === 'location' ? "gradient-primary" : "gradient-hero")}>Lưu lại</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsPage;