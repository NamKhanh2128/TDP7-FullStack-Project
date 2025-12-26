import { useState, useMemo } from 'react';
import { 
  Package, Edit3, AlertTriangle, Building2, Plus, 
  Search, CheckCircle2, Save, X, 
  MapPin, Settings2, Trash2, LayoutGrid, Users, 
  Ruler, UserCircle, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// --- 1. DỮ LIỆU MẪU (Giữ nguyên) ---
const initialLocations = [
  { 
    id: 'loc-1', name: 'Hội trường chính', code: 'HT-01',
    capacity: 200, area: 150, type: 'Indoor',
    manager: 'Nguyễn Văn A', status: 'Available', floor: 'Tầng 1' 
  },
  { 
    id: 'loc-2', name: 'Sân bóng chuyền', code: 'SB-01',
    capacity: 20, area: 300, type: 'Outdoor',
    manager: 'Trần Văn B', status: 'Maintenance', floor: 'Sân sau' 
  },
  { 
    id: 'loc-3', name: 'Phòng CLB thơ', code: 'PH-02',
    capacity: 40, area: 45, type: 'Indoor',
    manager: 'Lê Thị C', status: 'Available', floor: 'Tầng 2' 
  },
];

const initialEquipments = [
  { id: 'eq-1', name: 'Loa JBL PartyBox', code: 'AS-001', category: 'Âm thanh', location: 'Hội trường chính', total: 2, broken: 0, notes: 'Mới nhập 2024' },
  { id: 'eq-2', name: 'Bàn Inox Hòa Phát', code: 'AS-002', category: 'Nội thất', location: 'Kho Tầng 1', total: 50, broken: 3, notes: 'Chân lỏng lẻo' },
  { id: 'eq-3', name: 'Lưới bóng chuyền', code: 'AS-003', category: 'Thể thao', location: 'Sân bóng chuyền', total: 2, broken: 1, notes: 'Cần thay lưới mới' },
  { id: 'eq-4', name: 'Máy chiếu Sony 4K', code: 'AS-004', category: 'Điện tử', location: 'Hội trường chính', total: 1, broken: 0, notes: 'Hoạt động tốt' },
];

const AssetsPage = () => {
  const { toast } = useToast();
  
  // States
  const [locations, setLocations] = useState(initialLocations);
  const [equipments, setEquipments] = useState(initialEquipments);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [modalType, setModalType] = useState<'location' | 'equipment'>('location');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: string} | null>(null);

  // Form State
  const [formData, setFormData] = useState<any>({});

  // Stats Logic
  const stats = useMemo(() => {
    const totalEq = equipments.reduce((sum, a) => sum + a.total, 0);
    const brokenEq = equipments.reduce((sum, a) => sum + a.broken, 0);
    return { 
      totalEq, brokenEq, goodEq: totalEq - brokenEq, 
      totalLoc: locations.length,
      maintenanceLoc: locations.filter(l => l.status === 'Maintenance').length 
    };
  }, [equipments, locations]);

  // Handlers (Giữ nguyên logic)
  const handleOpenAdd = (type: 'location' | 'equipment') => {
    setModalType(type);
    setEditingItem(null);
    setFormData(type === 'location' 
      ? { name: '', code: '', capacity: '', area: '', type: 'Indoor', manager: '', floor: '', status: 'Available' }
      : { name: '', code: '', category: '', location: '', total: 0, broken: 0, notes: '' }
    );
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any, type: 'location' | 'equipment') => {
    setModalType(type);
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.code) {
      toast({ title: "Thiếu thông tin", description: "Vui lòng nhập tên và mã quản lý.", variant: "destructive" });
      return;
    }

    if (modalType === 'location') {
      const newLoc = { 
        ...formData, 
        id: editingItem?.id || `loc-${Date.now()}`,
        capacity: Number(formData.capacity),
        area: Number(formData.area)
      };
      setLocations(prev => editingItem ? prev.map(l => l.id === editingItem.id ? newLoc : l) : [...prev, newLoc]);
    } else {
      const newEq = { 
        ...formData, 
        id: editingItem?.id || `eq-${Date.now()}`,
        total: Number(formData.total),
        broken: Number(formData.broken)
      };
      setEquipments(prev => editingItem ? prev.map(e => e.id === editingItem.id ? newEq : e) : [...prev, newEq]);
    }
    toast({ title: "Thành công", description: "Dữ liệu đã được lưu vào hệ thống." });
    setIsModalOpen(false);
  };

  const confirmDelete = (id: string, type: 'location' | 'equipment') => {
    setItemToDelete({ id, type });
    setIsDeleteAlertOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete?.type === 'location') setLocations(prev => prev.filter(l => l.id !== itemToDelete.id));
    else setEquipments(prev => prev.filter(e => e.id !== itemToDelete?.id));
    
    setIsDeleteAlertOpen(false);
    toast({ title: "Đã xóa", description: "Mục đã được gỡ bỏ khỏi danh sách." });
  };

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen font-sans text-foreground">
      
      {/* HEADER - Sử dụng text-primary cho điểm nhấn */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-card gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Quản lý Cơ sở vật chất</h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Hệ thống kiểm kê tài sản & hạ tầng
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {/* Nút chính dùng gradient-primary */}
          <Button onClick={() => handleOpenAdd('location')} className="flex-1 md:flex-none gradient-primary text-primary-foreground h-11 px-6 rounded-xl shadow-soft transition-all font-semibold border-none">
            <Plus className="h-5 w-5 mr-2" /> Thêm địa điểm
          </Button>
          {/* Nút phụ dùng outline hoặc secondary */}
          <Button onClick={() => handleOpenAdd('equipment')} variant="outline" className="flex-1 md:flex-none border-primary/20 text-primary hover:bg-primary/5 h-11 px-6 rounded-xl font-semibold">
            <Plus className="h-5 w-5 mr-2" /> Nhập thiết bị
          </Button>
        </div>
      </div>

      {/* STATS - Màu sắc theo biến CSS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Tổng thiết bị', val: stats.totalEq, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Số lượng địa điểm', val: stats.totalLoc, icon: LayoutGrid, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'Địa điểm bảo trì', val: stats.maintenanceLoc, icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Thiết bị hỏng', val: stats.brokenEq, icon: Trash2, color: 'text-destructive', bg: 'bg-destructive/10' },
        ].map((stat, i) => (
          <Card key={i} className="border-border shadow-card rounded-2xl overflow-hidden hover:shadow-soft transition-shadow bg-card">
            <CardContent className="p-6 flex items-center gap-5">
              <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("h-7 w-7", stat.color)} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className={cn("text-3xl font-black mt-0.5", stat.color)}>{stat.val}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* TABS & SEARCH */}
      <Tabs defaultValue="locations" className="w-full space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-card p-2 rounded-2xl border border-border shadow-card">
          <TabsList className="bg-muted p-1 rounded-xl h-12 w-full lg:w-auto grid grid-cols-2 lg:flex">
            <TabsTrigger value="locations" className="px-8 rounded-lg font-bold text-sm data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
              Danh sách Địa điểm
            </TabsTrigger>
            <TabsTrigger value="equipments" className="px-8 rounded-lg font-bold text-sm data-[state=active]:bg-card data-[state=active]:text-secondary data-[state=active]:shadow-sm transition-all">
              Kho Thiết bị
            </TabsTrigger>
          </TabsList>
          
          <div className="relative w-full lg:w-96 px-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm kiếm mã, tên..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-10 bg-muted/50 border-transparent focus:border-primary rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* TAB 1: LOCATIONS */}
        <TabsContent value="locations" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase())).map((loc) => (
              <Card key={loc.id} className="group border-border shadow-card rounded-3xl overflow-hidden hover:shadow-soft transition-all border-t-4 border-t-primary bg-card flex flex-col justify-between">
                <CardContent className="p-7 space-y-5">
                  <div className="flex justify-between items-start">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                      <Building2 className="h-6 w-6" />
                    </div>
                    {/* Badge trạng thái */}
                    <Badge className={cn(
                      "border-none font-bold px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider shadow-sm",
                      loc.status === 'Available' ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    )}>
                      {loc.status === 'Available' ? 'Sẵn sàng' : 'Bảo trì'}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{loc.name}</h4>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">{loc.code} • {loc.floor}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 p-3 rounded-xl border border-border/50 flex flex-col justify-center">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1"><Ruler className="h-3 w-3"/> Diện tích</p>
                      <span className="text-sm font-bold text-foreground">{loc.area} m²</span>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-xl border border-border/50 flex flex-col justify-center">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1"><Users className="h-3 w-3"/> Sức chứa</p>
                      <span className="text-sm font-bold text-foreground">{loc.capacity} người</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent p-2 rounded-lg border border-accent">
                    <UserCircle className="h-4 w-4 text-primary" />
                    Quản lý: <span className="font-semibold text-foreground">{loc.manager}</span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(loc, 'location')} className="flex-1 rounded-xl border-border text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 h-10 font-bold text-xs">
                      <Edit3 className="h-3.5 w-3.5 mr-2" /> Chỉnh sửa
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => confirmDelete(loc.id, 'location')}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 2: EQUIPMENTS */}
        <TabsContent value="equipments" className="mt-0">
          <Card className="border-border shadow-card rounded-3xl overflow-hidden bg-card">
            <Table>
              <TableHeader className="bg-muted/50 border-b border-border">
                <TableRow className="h-14 hover:bg-transparent">
                  <TableHead className="pl-8 w-[30%] font-bold text-muted-foreground uppercase text-[11px] tracking-widest">Thiết bị</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-[11px] tracking-widest">Vị trí đặt</TableHead>
                  <TableHead className="text-center font-bold text-muted-foreground uppercase text-[11px] tracking-widest">Tổng / Hỏng</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-[11px] tracking-widest w-[20%]">Tình trạng</TableHead>
                  <TableHead className="text-right pr-8 font-bold text-muted-foreground uppercase text-[11px] tracking-widest">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipments.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase())).map((asset) => {
                  const healthPercent = asset.total > 0 
                    ? ((asset.total - asset.broken) / asset.total) * 100 
                    : 0;
                  
                  return (
                    <TableRow key={asset.id} className="h-20 hover:bg-accent/50 transition-colors border-b last:border-none border-border group">
                      <TableCell className="pl-8">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-sm border border-secondary/20">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm">{asset.name}</p>
                            <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="text-[9px] font-bold border-border text-muted-foreground">{asset.code}</Badge>
                                <Badge variant="secondary" className="text-[9px] bg-muted text-muted-foreground uppercase">{asset.category}</Badge>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground font-medium text-sm">
                            <MapPin className="h-3.5 w-3.5 text-primary" /> {asset.location}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-bold text-foreground text-base">{asset.total}</span>
                        {asset.broken > 0 && <span className="text-destructive text-[10px] font-bold bg-destructive/10 px-1.5 rounded-md mt-0.5 ml-1">-{asset.broken}</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5 w-32">
                          <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                            <span>Độ bền</span>
                            <span className={cn(healthPercent > 80 ? "text-success" : "text-warning")}>{healthPercent.toFixed(0)}%</span>
                          </div>
                          <Progress value={healthPercent} className={cn("h-1.5 rounded-full bg-muted", healthPercent > 80 ? "[&>div]:bg-success" : "[&>div]:bg-warning")} />
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(asset, 'equipment')} className="h-9 text-primary hover:bg-primary/10 font-bold px-3 rounded-lg border border-transparent hover:border-primary/20">
                            <Edit3 className="h-4 w-4 mr-1.5" /> Sửa
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => confirmDelete(asset.id, 'equipment')}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 4. MODAL FORM - GRADIENT MỚI */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] flex flex-col p-0 border-none rounded-3xl shadow-elevated bg-card">
          <div className={cn("p-6 text-primary-foreground shrink-0 gradient-primary")}>
            <DialogTitle className="text-2xl font-bold tracking-tight flex items-center gap-3">
                {modalType === 'location' ? <Building2 className="h-8 w-8" /> : <Package className="h-8 w-8" />}
                {editingItem ? 'Cập nhật thông tin' : `Thêm ${modalType === 'location' ? 'địa điểm' : 'thiết bị'} mới`}
            </DialogTitle>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Tên gọi (Bắt buộc)</Label>
                    <Input placeholder="Nhập tên..." value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-11 mt-1.5 rounded-xl border-border focus:ring-2 focus:ring-primary/50" />
                </div>
                
                <div className="col-span-1">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Mã quản lý</Label>
                    <Input placeholder="VD: HT-01" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="h-11 mt-1.5 rounded-xl border-border" />
                </div>

                {modalType === 'location' ? (
                    <>
                        <div className="col-span-1">
                            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Loại hình</Label>
                            <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                                <SelectTrigger className="h-11 mt-1.5 rounded-xl border-border"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Indoor">Trong nhà</SelectItem>
                                    <SelectItem value="Outdoor">Ngoài trời</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* ... Các trường khác giữ nguyên cấu trúc ... */}
                        {/* Tôi đã rút gọn phần này để code ngắn hơn, logic giống hệt bên trên nhưng dùng class màu từ biến CSS */}
                        <div className="col-span-1">
                            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Diện tích (m²)</Label>
                            <Input type="number" value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} className="h-11 mt-1.5 rounded-xl border-border" />
                        </div>
                        <div className="col-span-1">
                            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Sức chứa (Người)</Label>
                            <Input type="number" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} className="h-11 mt-1.5 rounded-xl border-border" />
                        </div>
                        <div className="col-span-1">
                            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Tầng / Vị trí</Label>
                            <Input placeholder="VD: Tầng 1" value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})} className="h-11 mt-1.5 rounded-xl border-border" />
                        </div>
                        <div className="col-span-1">
                            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Trạng thái</Label>
                            <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                                <SelectTrigger className="h-11 mt-1.5 rounded-xl border-border"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Available">Sẵn sàng</SelectItem>
                                    <SelectItem value="Maintenance">Đang bảo trì</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-2">
                            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Người quản lý</Label>
                            <Input placeholder="Tên người phụ trách..." value={formData.manager} onChange={(e) => setFormData({...formData, manager: e.target.value})} className="h-11 mt-1.5 rounded-xl border-border" />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="col-span-1">
                            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Danh mục</Label>
                            <Input placeholder="VD: Âm thanh" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="h-11 mt-1.5 rounded-xl border-border" />
                        </div>
                        <div className="col-span-2">
                            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Vị trí đặt / Kho</Label>
                            <Input placeholder="VD: Hội trường chính..." value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="h-11 mt-1.5 rounded-xl border-border" />
                        </div>
                        <div className="col-span-1">
                            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Tổng lượng</Label>
                            <Input type="number" value={formData.total} onChange={(e) => setFormData({...formData, total: e.target.value})} className="h-11 mt-1.5 rounded-xl border-border" />
                        </div>
                        <div className="col-span-1">
                            <Label className="text-[11px] font-bold text-destructive uppercase tracking-widest">Số lượng hỏng</Label>
                            <Input type="number" value={formData.broken} onChange={(e) => setFormData({...formData, broken: e.target.value})} className="h-11 mt-1.5 rounded-xl border-destructive/30 text-destructive font-bold bg-destructive/5" />
                        </div>
                    </>
                )}
            </div>
          </div>

          <DialogFooter className="p-6 bg-muted/30 border-t border-border flex gap-4 shrink-0">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl h-12 px-8 border-border font-bold text-muted-foreground flex-1 hover:bg-muted">Hủy bỏ</Button>
            <Button onClick={handleSave} className="rounded-xl h-12 px-10 font-bold shadow-soft flex-1 text-primary-foreground gradient-primary border-none hover:opacity-90 transition-opacity">
              <Save className="h-5 w-5 mr-2" /> Lưu dữ liệu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. DELETE ALERT */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="rounded-3xl border-none p-8 bg-card shadow-elevated">
          <AlertDialogHeader>
            <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-8 w-8 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-bold text-foreground">Xác nhận xóa dữ liệu?</AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium text-muted-foreground mt-2">
              Hành động này sẽ xóa vĩnh viễn {itemToDelete?.type === 'location' ? 'địa điểm' : 'thiết bị'} này khỏi cơ sở dữ liệu hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-6">
            <AlertDialogCancel className="rounded-xl h-12 px-8 border-border font-bold text-muted-foreground flex-1 hover:bg-muted">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl h-12 px-8 bg-destructive hover:bg-destructive/90 font-bold text-destructive-foreground shadow-soft border-none flex-1">Xóa ngay</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AssetsPage;