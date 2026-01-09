import { useState, useEffect } from 'react';
import { Search, Filter, Edit, UserX, Truck, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getAllResidentsAPI, createResidentAPI, updateResidentAPI, deleteResidentAPI } from '@/services/apiService';

// Interface cho dữ liệu từ API
interface ResidentFromAPI {
  id: string;
  name: string;
  dob: string;
  gender: string;
  idCard: string;
  occupation?: string;
  role: string;
  household_code: string;
  address?: string;
}

const ResidentsPage = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [ageFilter, setAgeFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingResident, setEditingResident] = useState<ResidentFromAPI | null>(null);
  
  // States cho dữ liệu động
  const [residents, setResidents] = useState<ResidentFromAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // States cho Modal thêm nhân khẩu
  const [showAddResidentModal, setShowAddResidentModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newResidentForm, setNewResidentForm] = useState({
    household_code: '',
    full_name: '',
    dob: '',
    gender: 'Nam',
    relation: 'Con',
    cccd: '',
  });
  
  // State cho form edit
  const [editFormData, setEditFormData] = useState({
    occupation: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingResidentId, setDeletingResidentId] = useState<string | null>(null);

  // Hàm fetch danh sách nhân khẩu từ API
  const fetchResidents = async () => {
    setIsLoading(true);
    try {
      const response = await getAllResidentsAPI();
      if (response.success && response.data) {
        setResidents(response.data);
      } else {
        setResidents([]);
      }
    } catch (error: any) {
      console.error('Error fetching residents:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải danh sách nhân khẩu từ server.',
        variant: 'destructive',
      });
      setResidents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data khi component mount
  useEffect(() => {
    fetchResidents();
  }, []);

  const getAge = (dob: string) => {
    if (!dob) return 0;
    // Xử lý cả format YYYY-MM-DD và DD/MM/YYYY
    let birthDate: Date;
    if (dob.includes('/')) {
      const [day, month, year] = dob.split('/').map(Number);
      birthDate = new Date(year, month - 1, day);
    } else if (dob.includes('-')) {
      birthDate = new Date(dob);
    } else {
      return 0;
    }
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const filteredResidents = residents.filter((r) => {
    const matchesSearch =
      (r.name && r.name.toLowerCase().includes(search.toLowerCase())) ||
      (r.idCard && r.idCard.toLowerCase().includes(search.toLowerCase()));

    const age = getAge(r.dob);
    let matchesAge = true;
    if (ageFilter === 'child') matchesAge = age < 15;
    else if (ageFilter === 'adult') matchesAge = age >= 18 && age < 60;
    else if (ageFilter === 'senior') matchesAge = age >= 60;

    let matchesGender = true;
    if (genderFilter !== 'all') matchesGender = r.gender === genderFilter;

    return matchesSearch && matchesAge && matchesGender;
  });

  // Hàm xử lý thêm nhân khẩu
  const handleCreateResident = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newResidentForm.household_code || !newResidentForm.full_name || !newResidentForm.relation) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ: Mã hộ khẩu, Họ và tên, Quan hệ',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await createResidentAPI(newResidentForm);
      
      if (response.success) {
        toast({
          title: 'Thành công',
          description: response.message || 'Đã thêm nhân khẩu thành công',
        });
        
        // Gọi lại hàm fetch để reload bảng dữ liệu
        await fetchResidents();
        
        // Đóng modal và reset form
        setShowAddResidentModal(false);
        setNewResidentForm({
          household_code: '',
          full_name: '',
          dob: '',
          gender: 'Nam',
          relation: 'Con',
          cccd: '',
        });
      }
    } catch (error: any) {
      console.error('Error creating resident:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tạo nhân khẩu. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Hàm format ngày sinh (DD/MM/YYYY)
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Chưa có';
    
    try {
      // Xử lý cả format YYYY-MM-DD và DD/MM/YYYY
      let date: Date;
      if (dateString.includes('-')) {
        // Format YYYY-MM-DD
        date = new Date(dateString);
      } else if (dateString.includes('/')) {
        // Format DD/MM/YYYY
        const [day, month, year] = dateString.split('/').map(Number);
        date = new Date(year, month - 1, day);
      } else {
        return dateString; // Trả về nguyên nếu không parse được
      }
      
      // Kiểm tra date hợp lệ
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      // Format thành DD/MM/YYYY
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      return dateString; // Trả về nguyên nếu có lỗi
    }
  };

  const handleSave = async () => {
    if (!editingResident) return;

    setIsUpdating(true);
    try {
      // Lấy dữ liệu từ form state
      const updateData: any = {};
      
      // Chỉ update các trường có giá trị
      if (editFormData.occupation !== undefined && editFormData.occupation !== '') {
        updateData.occupation = editFormData.occupation;
      }

      // Nếu không có dữ liệu để update, chỉ reload
      if (Object.keys(updateData).length === 0) {
        // Chỉ reload dữ liệu
        await fetchResidents();
        toast({
          title: 'Thông báo',
          description: 'Không có thay đổi nào để cập nhật',
        });
        setEditingResident(null);
        setIsUpdating(false);
        return;
      }

      // Gọi API update
      const response = await updateResidentAPI(editingResident.id, updateData);
      
      if (response.success) {
        toast({
          title: 'Thành công',
          description: response.message || 'Đã cập nhật thông tin cư dân!',
        });
        
        // Gọi lại hàm fetch để reload bảng dữ liệu (QUAN TRỌNG)
        await fetchResidents();
        
        // Đóng modal sau khi fetch xong
        setEditingResident(null);
        setEditFormData({ occupation: '' }); // Reset form
      }
    } catch (error: any) {
      console.error('Error updating resident:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Hàm xử lý xóa nhân khẩu
  const handleDelete = async (residentId: string, residentName: string) => {
    // Hiển thị hộp thoại xác nhận
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa người này không?\n\nTên: ${residentName}`);
    
    if (!confirmed) {
      return; // User chọn Cancel, không làm gì
    }

    setDeletingResidentId(residentId);
    try {
      const response = await deleteResidentAPI(residentId);
      
      if (response.success) {
        toast({
          title: 'Thành công',
          description: response.message || 'Đã xóa thành công',
        });
        
        // Gọi lại hàm fetch để reload bảng dữ liệu (QUAN TRỌNG)
        await fetchResidents();
      }
    } catch (error: any) {
      console.error('Error deleting resident:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xóa nhân khẩu. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setDeletingResidentId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý nhân khẩu</h1>
          <p className="text-muted-foreground">Tổng số: {residents.length} người</p>
        </div>
        <Button 
          onClick={() => setShowAddResidentModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Thêm nhân khẩu
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên, CCCD..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={ageFilter} onValueChange={setAgeFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Độ tuổi" />
          </SelectTrigger>
          <SelectContent className="bg-card">
            <SelectItem value="all">Tất cả tuổi</SelectItem>
            <SelectItem value="child">Trẻ em (&lt;15)</SelectItem>
            <SelectItem value="adult">Lao động (18-60)</SelectItem>
            <SelectItem value="senior">Cao tuổi (60+)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={genderFilter} onValueChange={setGenderFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Giới tính" />
          </SelectTrigger>
          <SelectContent className="bg-card">
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="Nam">Nam</SelectItem>
            <SelectItem value="Nữ">Nữ</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent className="bg-card">
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="thuong_tru">Thường trú</SelectItem>
            <SelectItem value="tam_tru">Tạm trú</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Ngày sinh</TableHead>
                <TableHead>Giới tính</TableHead>
                <TableHead>CCCD</TableHead>
                <TableHead>Nghề nghiệp</TableHead>
                <TableHead>Mã hộ</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : filteredResidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {search ? 'Không tìm thấy nhân khẩu nào phù hợp' : 'Chưa có dữ liệu nhân khẩu'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredResidents.map((resident) => (
                  <TableRow key={resident.id}>
                    <TableCell className="font-medium">{resident.name || 'Chưa có'}</TableCell>
                    <TableCell>{formatDate(resident.dob)}</TableCell>
                    <TableCell>
                      <Badge variant={resident.gender === 'Nam' ? 'default' : 'secondary'}>
                        {resident.gender || 'Chưa có'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{resident.idCard || 'Chưa có'}</TableCell>
                    <TableCell>{resident.occupation || 'Chưa có'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{resident.household_code || 'Chưa có'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingResident(resident);
                            setEditFormData({
                              occupation: resident.occupation || '',
                            });
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(resident.id, resident.name || 'Nhân khẩu này')}
                          disabled={deletingResidentId === resident.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {deletingResidentId === resident.id ? 'Đang xóa...' : 'Xóa'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Resident Modal */}
      <Dialog open={showAddResidentModal} onOpenChange={setShowAddResidentModal}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-7 pb-4 bg-white border-b">
            <div className="h-11 w-11 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <Plus className="h-5 w-5 text-blue-600" />
            </div>
            <DialogTitle className="text-xl font-semibold">Thêm nhân khẩu mới</DialogTitle>
            <DialogDescription className="font-medium text-slate-500">
              Nhập thông tin nhân khẩu để thêm vào hộ khẩu
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateResident}>
            <div className="p-7 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="household_code" className="text-sm font-medium text-slate-700">
                  Mã hộ khẩu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="household_code"
                  placeholder="Ví dụ: TDP7-2024-001"
                  value={newResidentForm.household_code}
                  onChange={(e) => setNewResidentForm({ ...newResidentForm, household_code: e.target.value })}
                  required
                  className="border-slate-200 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium text-slate-700">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  placeholder="Nhập họ và tên đầy đủ"
                  value={newResidentForm.full_name}
                  onChange={(e) => setNewResidentForm({ ...newResidentForm, full_name: e.target.value })}
                  required
                  className="border-slate-200 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-sm font-medium text-slate-700">Ngày sinh</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={newResidentForm.dob}
                    onChange={(e) => setNewResidentForm({ ...newResidentForm, dob: e.target.value })}
                    className="border-slate-200 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium text-slate-700">Giới tính</Label>
                  <Select 
                    value={newResidentForm.gender} 
                    onValueChange={(value) => setNewResidentForm({ ...newResidentForm, gender: value })}
                  >
                    <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nam">Nam</SelectItem>
                      <SelectItem value="Nữ">Nữ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="relation" className="text-sm font-medium text-slate-700">
                  Quan hệ với chủ hộ <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={newResidentForm.relation} 
                  onValueChange={(value) => setNewResidentForm({ ...newResidentForm, relation: value })}
                  required
                >
                  <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chủ hộ">Chủ hộ</SelectItem>
                    <SelectItem value="Vợ/Chồng">Vợ/Chồng</SelectItem>
                    <SelectItem value="Con">Con</SelectItem>
                    <SelectItem value="Cha/Mẹ">Cha/Mẹ</SelectItem>
                    <SelectItem value="Ông/Bà">Ông/Bà</SelectItem>
                    <SelectItem value="Cháu">Cháu</SelectItem>
                    <SelectItem value="Khác">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cccd" className="text-sm font-medium text-slate-700">Số CCCD/CMND</Label>
                <Input
                  id="cccd"
                  placeholder="Nhập số CCCD/CMND (nếu có)"
                  value={newResidentForm.cccd}
                  onChange={(e) => setNewResidentForm({ ...newResidentForm, cccd: e.target.value })}
                  className="border-slate-200 focus:ring-blue-500"
                />
              </div>
            </div>
            <DialogFooter className="p-7 bg-slate-50 border-t flex gap-3 sm:justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddResidentModal(false)} 
                className="rounded-lg"
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={isCreating} 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                {isCreating ? 'Đang tạo...' : 'Lưu'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingResident} onOpenChange={() => setEditingResident(null)}>
        <DialogContent className="max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin cư dân</DialogTitle>
          </DialogHeader>

          {editingResident && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="font-semibold text-foreground">{editingResident.name}</p>
                <p className="text-sm text-muted-foreground">{editingResident.idCard}</p>
              </div>

              <div className="space-y-2">
                <Label>Nghề nghiệp</Label>
                <Input 
                  value={editFormData.occupation || editingResident.occupation || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, occupation: e.target.value })}
                  placeholder="Nhập nghề nghiệp"
                />
              </div>

              <div className="space-y-2">
                <Label>Trình độ học vấn</Label>
                <Select defaultValue="12/12">
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="tieu_hoc">Tiểu học</SelectItem>
                    <SelectItem value="thcs">THCS</SelectItem>
                    <SelectItem value="12/12">THPT</SelectItem>
                    <SelectItem value="cao_dang">Cao đẳng</SelectItem>
                    <SelectItem value="dai_hoc">Đại học</SelectItem>
                    <SelectItem value="sau_dai_hoc">Sau đại học</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-3">Thay đổi trạng thái</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <UserX className="h-4 w-4 mr-1" />
                    Đã qua đời
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Truck className="h-4 w-4 mr-1" />
                    Chuyển đi
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingResident(null);
                    setEditFormData({ occupation: '' });
                  }} 
                  className="flex-1"
                  disabled={isUpdating}
                >
                  Hủy
                </Button>
                <Button 
                  variant="gradient" 
                  onClick={handleSave} 
                  className="flex-1"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResidentsPage;
