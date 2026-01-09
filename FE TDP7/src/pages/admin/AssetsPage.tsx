import { useState, useMemo, useEffect } from 'react';
import { 
  Package, Edit3, AlertTriangle, Building2, Plus, 
  Search, CheckCircle2, Save, X, 
  MapPin, Settings2, Trash2, LayoutGrid, Users, 
  Ruler, UserCircle, ShieldCheck, Loader2, CreditCard
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
import { getLocationsAPI, getEquipmentsAPI, createFacilityAPI, updateFacilityAPI, deleteFacilityAPI } from '@/services/apiService';

// Interface cho dữ liệu từ API
interface Facility {
  id: string;
  name: string;
  description?: string;
  capacity?: number;
  area?: number;
  location?: string;
  status?: string;
  type?: string;
  asset_value?: number;
  quantity?: number;
  price?: number;
  created_at?: string;
}

const AssetsPage = () => {
  const { toast } = useToast();
  
  // States
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'locations' | 'equipments'>('locations');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [modalType, setModalType] = useState<'location' | 'equipment'>('location');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: string} | null>(null);

  // Form State
  const [formData, setFormData] = useState<any>({});

  // Fetch dữ liệu từ API dựa trên tab active
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let response;
        if (activeTab === 'locations') {
          response = await getLocationsAPI();
        } else {
          response = await getEquipmentsAPI();
        }
        
        if (response.success && response.data) {
          setFacilities(response.data);
        } else {
          setFacilities([]);
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Lỗi',
          description: error.message || `Không thể tải danh sách ${activeTab === 'locations' ? 'địa điểm' : 'thiết bị'}`,
          variant: 'destructive',
        });
        setFacilities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Stats Logic - Tính toán dựa trên tab active
  const stats = useMemo(() => {
    if (activeTab === 'locations') {
      return { 
        total: facilities.length,
        maintenance: facilities.filter(f => f.status === 'Maintenance').length 
      };
    } else {
      // Tính tổng số lượng thiết bị thực tế (sum của quantity)
      const totalQuantity = facilities.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      return { 
        total: totalQuantity,
        maintenance: facilities.filter(f => f.status === 'Maintenance').length 
      };
    }
  }, [facilities, activeTab]);

  // Handlers
  const handleOpenAdd = (type: 'location' | 'equipment') => {
    setModalType(type);
    setEditingItem(null);
    if (type === 'location') {
      setFormData({ 
        name: '', 
        description: '', 
        capacity: '', 
        area: '',
        location: '', 
        status: 'Available',
        type: 'PhongHop',
        price: ''
      });
    } else {
      setFormData({ 
        name: '', 
        description: '', 
        quantity: '', 
        asset_value: '',
        status: 'Available',
        type: 'ThietBi',
        price: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Facility) => {
    // Xác định type dựa trên item
    const isLocation = item.type && ['PhongHop', 'TheThao', 'SanBai'].includes(item.type);
    setModalType(isLocation ? 'location' : 'equipment');
    setEditingItem(item);
    
    if (isLocation) {
      setFormData({ 
        name: item.name || '',
        description: item.description || '',
        capacity: item.capacity?.toString() || '',
        area: item.area?.toString() || '',
        location: item.location || '',
        status: item.status || 'Available',
        type: item.type || 'PhongHop',
        price: item.price?.toString() || ''
      });
    } else {
      setFormData({ 
        name: item.name || '',
        description: item.description || '',
        quantity: item.quantity?.toString() || '',
        asset_value: item.asset_value?.toString() || '',
        status: item.status || 'Available',
        type: item.type || 'ThietBi',
        price: item.price?.toString() || ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast({ title: "Thiếu thông tin", description: "Vui lòng nhập tên tài sản.", variant: "destructive" });
      return;
    }

    try {
      let payload: any = {
        name: formData.name,
        description: formData.description || null,
        status: formData.status || 'Available',
        type: formData.type || null,
        price: formData.price ? parseFloat(formData.price) : null
      };

      if (modalType === 'location') {
        payload.capacity = formData.capacity ? parseInt(formData.capacity) : null;
        payload.area = formData.area ? parseFloat(formData.area) : null;
        payload.location = formData.location || null;
      } else {
        payload.quantity = formData.quantity ? parseInt(formData.quantity) : null;
        payload.asset_value = formData.asset_value ? parseFloat(formData.asset_value) : null;
      }

      let response;
      if (editingItem) {
        // Update
        response = await updateFacilityAPI(editingItem.id, payload);
      } else {
        // Create
        response = await createFacilityAPI(payload);
      }

      if (response.success) {
        toast({ 
          title: "Thành công", 
          description: editingItem ? "Đã cập nhật thông tin tài sản." : "Đã thêm tài sản mới." 
        });
        setIsModalOpen(false);
        
        // Reload data based on active tab
        let reloadResponse;
        if (activeTab === 'locations') {
          reloadResponse = await getLocationsAPI();
        } else {
          reloadResponse = await getEquipmentsAPI();
        }
        
        if (reloadResponse.success && reloadResponse.data) {
          setFacilities(reloadResponse.data);
        }
      }
    } catch (error: any) {
      console.error('Error saving facility:', error);
      toast({ 
        title: "Lỗi", 
        description: error.message || "Không thể lưu dữ liệu.", 
        variant: "destructive" 
      });
    }
  };

  const confirmDelete = (id: string) => {
    setItemToDelete({ id, type: 'location' });
    setIsDeleteAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      const response = await deleteFacilityAPI(itemToDelete.id);
      if (response.success) {
        setIsDeleteAlertOpen(false);
        toast({ title: "Đã xóa", description: "Mục đã được gỡ bỏ khỏi danh sách." });
        
        // Reload data based on active tab
        let reloadResponse;
        if (activeTab === 'locations') {
          reloadResponse = await getLocationsAPI();
        } else {
          reloadResponse = await getEquipmentsAPI();
        }
        
        if (reloadResponse.success && reloadResponse.data) {
          setFacilities(reloadResponse.data);
        }
      }
    } catch (error: any) {
      console.error('Error deleting facility:', error);
      toast({ 
        title: "Lỗi", 
        description: error.message || "Không thể xóa tài sản.", 
        variant: "destructive" 
      });
    }
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
          {/* Nút thêm mới dựa trên tab active */}
          <Button 
            onClick={() => handleOpenAdd(activeTab === 'locations' ? 'location' : 'equipment')} 
            className="flex-1 md:flex-none gradient-primary text-primary-foreground h-11 px-6 rounded-xl shadow-soft transition-all font-semibold border-none"
          >
            <Plus className="h-5 w-5 mr-2" /> 
            {activeTab === 'locations' ? 'Thêm địa điểm' : 'Nhập thiết bị'}
          </Button>
        </div>
      </div>

      {/* STATS - Màu sắc theo biến CSS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: activeTab === 'locations' ? 'Số lượng địa điểm' : 'Số lượng thiết bị', 
            val: stats.total, 
            icon: activeTab === 'locations' ? LayoutGrid : Package, 
            color: activeTab === 'locations' ? 'text-secondary' : 'text-secondary', 
            bg: activeTab === 'locations' ? 'bg-secondary/10' : 'bg-secondary/10' 
          },
          { 
            label: activeTab === 'locations' ? 'Địa điểm bảo trì' : 'Thiết bị đang bảo trì', 
            val: stats.maintenance, 
            icon: AlertTriangle, 
            color: 'text-warning', 
            bg: 'bg-warning/10' 
          },
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
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'locations' | 'equipments')} className="w-full space-y-6">
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">Đang tải danh sách tài sản...</span>
            </div>
          ) : facilities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
              <Building2 className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm">Chưa có tài sản nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map((facility) => (
                <Card key={facility.id} className="group border-border shadow-card rounded-3xl overflow-hidden hover:shadow-soft transition-all border-t-4 border-t-primary bg-card flex flex-col justify-between">
                  <CardContent className="p-7 space-y-5">
                    <div className="flex justify-between items-start">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Building2 className="h-6 w-6" />
                      </div>
                      {/* Badge trạng thái */}
                      <Badge className={cn(
                        "border-none font-bold px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider shadow-sm",
                        (facility.status === 'Available' && facility.maintenance_status !== 'Maintenance') 
                          ? "bg-success/10 text-success" 
                          : "bg-warning/10 text-warning"
                      )}>
                        {(facility.status === 'Available' && facility.maintenance_status !== 'Maintenance') ? 'Sẵn sàng' : 'Bảo trì'}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{facility.name}</h4>
                      {facility.location && (
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">{facility.location}</p>
                      )}
                    </div>

                    {/* Hiển thị thông tin cho Địa điểm */}
                    {activeTab === 'locations' && (
                      <div className="grid grid-cols-2 gap-3">
                        {facility.area && (
                          <div className="bg-muted/50 p-3 rounded-xl border border-border/50 flex flex-col justify-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1"><Ruler className="h-3 w-3"/> Diện tích</p>
                            <span className="text-sm font-bold text-foreground">{facility.area} m²</span>
                          </div>
                        )}
                        {facility.capacity && (
                          <div className="bg-muted/50 p-3 rounded-xl border border-border/50 flex flex-col justify-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1"><Users className="h-3 w-3"/> Sức chứa</p>
                            <span className="text-sm font-bold text-foreground">{facility.capacity} người</span>
                          </div>
                        )}
                        {facility.price && (
                          <div className="bg-muted/50 p-3 rounded-xl border border-border/50 flex flex-col justify-center col-span-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1"><CreditCard className="h-3 w-3"/> Giá thuê</p>
                            <span className="text-sm font-bold text-foreground">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(facility.price)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hiển thị thông tin cho Thiết bị */}
                    {activeTab === 'equipments' && (
                      <div className="grid grid-cols-2 gap-3">
                        {facility.quantity !== undefined && (
                          <div className="bg-muted/50 p-3 rounded-xl border border-border/50 flex flex-col justify-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1"><Package className="h-3 w-3"/> Số lượng</p>
                            <span className="text-sm font-bold text-foreground">{facility.quantity}</span>
                          </div>
                        )}
                        {facility.asset_value && (
                          <div className="bg-muted/50 p-3 rounded-xl border border-border/50 flex flex-col justify-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1"><CreditCard className="h-3 w-3"/> Giá trị</p>
                            <span className="text-sm font-bold text-foreground">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(facility.asset_value)}</span>
                          </div>
                        )}
                        {facility.price && (
                          <div className="bg-muted/50 p-3 rounded-xl border border-border/50 flex flex-col justify-center col-span-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1"><CreditCard className="h-3 w-3"/> Giá thuê</p>
                            <span className="text-sm font-bold text-foreground">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(facility.price)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {facility.description && (
                      <div className="text-xs text-muted-foreground bg-accent p-2 rounded-lg border border-accent">
                        <p className="line-clamp-2">{facility.description}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(facility)} className="flex-1 rounded-xl border-border text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 h-10 font-bold text-xs">
                        <Edit3 className="h-3.5 w-3.5 mr-2" /> Chỉnh sửa
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => confirmDelete(facility.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: EQUIPMENTS */}
        <TabsContent value="equipments" className="mt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">Đang tải danh sách thiết bị...</span>
            </div>
          ) : facilities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
              <Package className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm">Chưa có thiết bị nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map((facility) => (
                <Card key={facility.id} className="group border-border shadow-card rounded-3xl overflow-hidden hover:shadow-soft transition-all border-t-4 border-t-secondary bg-card flex flex-col justify-between">
                  <CardContent className="p-7 space-y-5">
                    <div className="flex justify-between items-start">
                      <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-inner">
                        <Package className="h-6 w-6" />
                      </div>
                      {/* Badge trạng thái */}
                      <Badge className={cn(
                        "border-none font-bold px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider shadow-sm",
                        facility.status === 'Available' 
                          ? "bg-success/10 text-success" 
                          : "bg-warning/10 text-warning"
                      )}>
                        {facility.status === 'Available' ? 'Sẵn sàng' : 'Bảo trì'}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-foreground group-hover:text-secondary transition-colors">{facility.name}</h4>
                      {facility.description && (
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1 line-clamp-1">{facility.description}</p>
                      )}
                    </div>

                    {/* Hiển thị thông tin cho Thiết bị */}
                    <div className="grid grid-cols-2 gap-3">
                      {facility.quantity !== undefined && (
                        <div className="bg-muted/50 p-3 rounded-xl border border-border/50 flex flex-col justify-center">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1"><Package className="h-3 w-3"/> Số lượng</p>
                          <span className="text-sm font-bold text-foreground">{facility.quantity}</span>
                        </div>
                      )}
                      {facility.asset_value && (
                        <div className="bg-muted/50 p-3 rounded-xl border border-border/50 flex flex-col justify-center">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1"><CreditCard className="h-3 w-3"/> Giá trị</p>
                          <span className="text-sm font-bold text-foreground">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(facility.asset_value)}</span>
                        </div>
                      )}
                      {facility.price && (
                        <div className="bg-muted/50 p-3 rounded-xl border border-border/50 flex flex-col justify-center col-span-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1"><CreditCard className="h-3 w-3"/> Giá thuê</p>
                          <span className="text-sm font-bold text-foreground">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(facility.price)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(facility)} className="flex-1 rounded-xl border-border text-muted-foreground hover:text-secondary hover:border-secondary/30 hover:bg-secondary/5 h-10 font-bold text-xs">
                        <Edit3 className="h-3.5 w-3.5 mr-2" /> Chỉnh sửa
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => confirmDelete(facility.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
                    <Input placeholder="Nhập tên..." value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-11 mt-1.5 rounded-xl border-border focus:ring-2 focus:ring-primary/50" />
                </div>
                
                <div className="col-span-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Mô tả</Label>
                    <Textarea placeholder="Nhập mô tả..." value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} className="mt-1.5 rounded-xl border-border" rows={3} />
                </div>

                {/* Form cho Địa điểm */}
                {modalType === 'location' && (
                  <>
                    <div className="col-span-1">
                        <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Sức chứa (Người)</Label>
                        <Input type="number" placeholder="VD: 200" value={formData.capacity || ''} onChange={(e) => setFormData({...formData, capacity: e.target.value})} className="h-11 mt-1.5 rounded-xl border-border" />
                    </div>
                    
                    <div className="col-span-1">
                        <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Diện tích (m²)</Label>
                        <Input type="number" placeholder="VD: 150" value={formData.area || ''} onChange={(e) => setFormData({...formData, area: e.target.value})} className="h-11 mt-1.5 rounded-xl border-border" />
                    </div>
                    
                    <div className="col-span-2">
                        <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Vị trí</Label>
                        <Input placeholder="VD: Tầng 1, Hội trường chính" value={formData.location || ''} onChange={(e) => setFormData({...formData, location: e.target.value})} className="h-11 mt-1.5 rounded-xl border-border" />
                    </div>
                    
                    <div className="col-span-1">
                        <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Loại địa điểm</Label>
                        <Select value={formData.type || 'PhongHop'} onValueChange={(val) => setFormData({...formData, type: val})}>
                            <SelectTrigger className="h-11 mt-1.5 rounded-xl border-border"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PhongHop">Phòng họp</SelectItem>
                                <SelectItem value="TheThao">Thể thao</SelectItem>
                                <SelectItem value="SanBai">Sân bãi</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="col-span-1">
                        <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Giá thuê (VNĐ)</Label>
                        <Input type="number" placeholder="VD: 500000" value={formData.price || ''} onChange={(e) => setFormData({...formData, price: e.target.value})} className="h-11 mt-1.5 rounded-xl border-border" />
                    </div>
                  </>
                )}

                {/* Form cho Thiết bị */}
                {modalType === 'equipment' && (
                  <>
                    <div className="col-span-1">
                        <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Số lượng</Label>
                        <Input type="number" placeholder="VD: 10" value={formData.quantity || ''} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="h-11 mt-1.5 rounded-xl border-border" />
                    </div>
                    
                    <div className="col-span-1">
                        <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Giá trị tài sản (VNĐ)</Label>
                        <Input type="number" placeholder="VD: 5000000" value={formData.asset_value || ''} onChange={(e) => setFormData({...formData, asset_value: e.target.value})} className="h-11 mt-1.5 rounded-xl border-border" />
                    </div>
                    
                    <div className="col-span-1">
                        <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Loại thiết bị</Label>
                        <Select value={formData.type || 'ThietBi'} onValueChange={(val) => setFormData({...formData, type: val})}>
                            <SelectTrigger className="h-11 mt-1.5 rounded-xl border-border"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ThietBi">Thiết bị</SelectItem>
                                <SelectItem value="AmThanh">Âm thanh</SelectItem>
                                <SelectItem value="DungCu">Dụng cụ</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="col-span-1">
                        <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Giá thuê (VNĐ)</Label>
                        <Input type="number" placeholder="VD: 200000" value={formData.price || ''} onChange={(e) => setFormData({...formData, price: e.target.value})} className="h-11 mt-1.5 rounded-xl border-border" />
                    </div>
                  </>
                )}
                
                <div className="col-span-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Trạng thái</Label>
                    <Select value={formData.status || 'Available'} onValueChange={(val) => setFormData({...formData, status: val})}>
                        <SelectTrigger className="h-11 mt-1.5 rounded-xl border-border"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Available">Sẵn sàng</SelectItem>
                            <SelectItem value="Maintenance">Đang bảo trì</SelectItem>
                            <SelectItem value="Unavailable">Không khả dụng</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
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