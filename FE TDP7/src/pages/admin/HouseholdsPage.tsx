import { useState, useEffect } from 'react';
import { 
  Search, Eye, GitBranch, Users, MapPin, 
  Home, Phone, Calendar, FileText, UserCircle, 
  ArrowRight, CreditCard, Save, X, Edit, CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { allHouseholds, Household } from '@/data/mockData';
import { cn } from '@/lib/utils';

const HouseholdsPage = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  
  // --- STATE QUẢN LÝ ---
  // 1. State cho tính năng Xem & Sửa chi tiết
  const [viewHousehold, setViewHousehold] = useState<Household | null>(null);
  const [isEditing, setIsEditing] = useState(false); // Trạng thái đang sửa
  const [editFormData, setEditFormData] = useState<Household | null>(null); // Dữ liệu đang sửa tạm thời
  
  // 2. State cho Popup Xác nhận & Thành công
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // 3. State cho tính năng Tách hộ
  const [splitHousehold, setSplitHousehold] = useState<Household | null>(null);
  const [splitStep, setSplitStep] = useState(1);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredHouseholds = allHouseholds.filter(
    (h) =>
      h.code.toLowerCase().includes(search.toLowerCase()) ||
      h.members.some(m => m.role === 'Chủ hộ' && m.name.toLowerCase().includes(search.toLowerCase())) ||
      h.address.toLowerCase().includes(search.toLowerCase())
  );

  // --- HANDLERS ---

  // Khi mở popup chi tiết
  const handleOpenDetail = (household: Household) => {
    setViewHousehold(household);
    setEditFormData(household); // Copy dữ liệu vào form sửa
    setIsEditing(false); // Mặc định là chế độ xem
  };

  // Khi thay đổi input trong form sửa
  const handleInputChange = (field: keyof Household, value: any) => {
    if (editFormData) {
      setEditFormData({ ...editFormData, [field]: value });
    }
  };

  // Khi bấm Lưu -> Mở popup xác nhận
  const handleSaveClick = () => {
    setShowConfirmSave(true);
  };

  // Xác nhận lưu
  const handleConfirmSave = () => {
    setShowConfirmSave(false);
    // Giả lập lưu dữ liệu (trong thực tế sẽ gọi API update)
    if (editFormData) {
      setViewHousehold(editFormData); // Cập nhật lại view
      // Cập nhật lại list gốc (nếu cần mock real-time)
      const index = allHouseholds.findIndex(h => h.id === editFormData.id);
      if(index !== -1) allHouseholds[index] = editFormData; 
    }
    setIsEditing(false);
    setShowSuccessDialog(true); // Hiện popup thành công
  };

  // --- HANDLERS TÁCH HỘ ---
  const handleSplitStart = (household: Household) => {
    setSplitHousehold(household);
    setSplitStep(1);
    setSelectedMembers([]);
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSplitComplete = () => {
    toast({
      title: 'Thành công',
      description: `Đã tách ${selectedMembers.length} thành viên sang hộ mới!`,
    });
    setSplitHousehold(null);
    setSplitStep(1);
    setSelectedMembers([]);
  };

  // Dữ liệu tính toán cho Tách hộ
  const selectedMemberData = splitHousehold?.members.filter((m) =>
    selectedMembers.includes(m.id)
  );
  const remainingMembers = splitHousehold?.members.filter(
    (m) => !selectedMembers.includes(m.id)
  );
  const newHeadOfHousehold = selectedMemberData?.[0]?.name || 'Chưa chọn';

  return (
    <div className="p-6 space-y-6">
      {/* HEADER PAGE */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quản lý hộ khẩu</h1>
        <p className="text-muted-foreground">Tổng số: {allHouseholds.length} hộ</p>
      </div>

      {/* SEARCH BAR */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo mã hộ, chủ hộ, địa chỉ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      {/* MAIN TABLE */}
      <Card className="border shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Mã hộ</TableHead>
                <TableHead>Chủ hộ</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead className="text-center">Số thành viên</TableHead>
                <TableHead className="text-right pr-6">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHouseholds.map((household) => {
                const head = household.members.find(m => m.role === 'Chủ hộ') || household.members[0];
                return (
                  <TableRow key={household.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{household.code}</TableCell>
                    <TableCell>{head.name}</TableCell>
                    <TableCell className="max-w-[250px] truncate text-muted-foreground" title={household.address}>
                      {household.address}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        {household.members.length}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenDetail(household)}>
                          <Eye className="h-4 w-4 mr-1" /> Chi tiết
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSplitStart(household)}
                          disabled={household.members.length < 2}
                          className="hover:text-primary hover:border-primary"
                        >
                          <GitBranch className="h-4 w-4 mr-1" /> Tách hộ
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* =====================================================================================
          1. DIALOG: XEM & SỬA CHI TIẾT (Editable Detail Popup)
      ===================================================================================== */}
      <Dialog open={!!viewHousehold} onOpenChange={(open) => !open && setViewHousehold(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-card">
          <DialogHeader className="p-6 pb-4 bg-muted/30 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-md">
                        <Home className="h-6 w-6" />
                    </div>
                    <div>
                        <DialogTitle className="text-xl font-bold">Chi tiết Hộ khẩu</DialogTitle>
                        <DialogDescription className="text-primary font-medium mt-0.5">
                        {isEditing ? 'Đang chỉnh sửa hồ sơ' : `Mã hồ sơ: ${viewHousehold?.code}`}
                        </DialogDescription>
                    </div>
                </div>
                {/* Nút chuyển chế độ Xem/Sửa */}
                {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
                    </Button>
                ) : (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-destructive hover:bg-destructive/10">
                        <X className="h-4 w-4 mr-2" /> Hủy bỏ
                    </Button>
                )}
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            {editFormData && (() => {
               const head = editFormData.members.find(m => m.role === 'Chủ hộ');
               return (
                <div className="space-y-6">
                  {/* Info Cards */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Card 1: Chủ hộ */}
                    <Card className="bg-primary/5 border-primary/10 shadow-sm">
                      <CardContent className="p-4 space-y-3">
                        <h3 className="font-semibold text-primary flex items-center gap-2">
                          <UserCircle className="h-4 w-4" /> Chủ hộ
                        </h3>
                        <div>
                          {isEditing ? (
                              <div className="space-y-2">
                                  <Label>Họ và tên chủ hộ</Label>
                                  <Input 
                                    value={head?.name} 
                                    className="bg-white"
                                    // Trong thực tế, cần logic update member list phức tạp hơn
                                    readOnly 
                                    title="Không thể sửa trực tiếp tên chủ hộ tại đây (cần quy trình chuyển nhượng)"
                                  />
                              </div>
                          ) : (
                              <p className="text-2xl font-bold">{head?.name}</p>
                          )}
                          
                          <div className="text-sm text-muted-foreground mt-2 space-y-2">
                             <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" /> 
                                {isEditing ? <Input value={head?.idCard} className="h-8 bg-white" readOnly /> : `CCCD: ${head?.idCard}`}
                             </div>
                             <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" /> 
                                {isEditing ? <Input defaultValue="0987654321" className="h-8 bg-white" /> : `SĐT: 0987654321`}
                             </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card 2: Thông tin chung */}
                    <Card className="shadow-sm">
                      <CardContent className="p-4 grid grid-cols-1 gap-4 text-sm">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-2" />
                          <div className="flex-1 space-y-1">
                            <p className="text-muted-foreground text-xs uppercase font-medium">Địa chỉ thường trú</p>
                            {isEditing ? (
                                <Input 
                                    value={editFormData.address} 
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                />
                            ) : (
                                <p className="font-medium">{editFormData.address}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="flex items-center gap-2 flex-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div className="space-y-1 w-full">
                                <p className="text-muted-foreground text-xs">Diện tích (m²)</p>
                                {isEditing ? (
                                    <Input 
                                        type="number"
                                        value={editFormData.area} 
                                        onChange={(e) => handleInputChange('area', Number(e.target.value))}
                                        className="h-8 w-24"
                                    />
                                ) : (
                                    <p className="font-medium">{editFormData.area} m²</p>
                                )}
                              </div>
                           </div>
                           <div className="flex items-center gap-2 flex-1">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-muted-foreground text-xs">Loại hộ</p>
                                <Badge variant="outline" className="mt-0.5">Thường trú</Badge>
                              </div>
                           </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  {/* Members Table */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" /> 
                        Thành viên trong hộ ({editFormData.members.length})
                        </h3>
                        {isEditing && (
                            <Button size="sm" variant="outline" className="h-8">
                                + Thêm thành viên
                            </Button>
                        )}
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden shadow-sm">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Họ và tên</TableHead>
                            <TableHead>Quan hệ</TableHead>
                            <TableHead>Ngày sinh</TableHead>
                            <TableHead>Giới tính</TableHead>
                            <TableHead>Nghề nghiệp</TableHead>
                            <TableHead>CCCD</TableHead>
                            {isEditing && <TableHead></TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {editFormData.members.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell className="font-medium">
                                {member.name}
                                {member.role === 'Chủ hộ' && (
                                  <Badge className="ml-2 bg-primary/90 text-[10px] h-5 px-1.5">Chủ hộ</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                  <span className={member.role === 'Chủ hộ' ? 'font-bold text-primary' : ''}>
                                    {member.role}
                                  </span>
                              </TableCell>
                              <TableCell>{member.dob}</TableCell>
                              <TableCell>{member.gender}</TableCell>
                              <TableCell>{member.occupation}</TableCell>
                              <TableCell className="font-mono text-muted-foreground text-xs">
                                {member.idCard || 'N/A'}
                              </TableCell>
                              {isEditing && (
                                  <TableCell>
                                      {member.role !== 'Chủ hộ' && (
                                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive">
                                              <X className="h-4 w-4" />
                                          </Button>
                                      )}
                                  </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              );
            })()}
          </ScrollArea>
          
          <DialogFooter className="p-4 border-t bg-muted/20 flex-shrink-0">
            {isEditing ? (
                <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Hủy bỏ</Button>
                    <Button className="bg-primary text-primary-foreground" onClick={handleSaveClick}>
                        <Save className="ml-2 h-4 w-4" /> Lưu thay đổi
                    </Button>
                </>
            ) : (
                <Button variant="outline" onClick={() => setViewHousehold(null)}>Đóng</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- CONFIRM SAVE DIALOG --- */}
      <AlertDialog open={showConfirmSave} onOpenChange={setShowConfirmSave}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận lưu thay đổi?</AlertDialogTitle>
                <AlertDialogDescription>
                    Hành động này sẽ cập nhật thông tin hộ khẩu vào cơ sở dữ liệu. Bạn có chắc chắn muốn tiếp tục không?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmSave} className="bg-primary">Xác nhận</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- SUCCESS DIALOG --- */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="max-w-sm text-center">
            <div className="flex flex-col items-center gap-4 py-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <div>
                    <AlertDialogTitle className="text-xl text-green-700">Cập nhật thành công!</AlertDialogTitle>
                    <AlertDialogDescription className="text-center mt-2">
                        Thông tin hồ sơ hộ khẩu đã được lưu vào hệ thống.
                    </AlertDialogDescription>
                </div>
            </div>
            <AlertDialogFooter className="justify-center sm:justify-center">
                <AlertDialogAction onClick={() => setShowSuccessDialog(false)} className="w-full sm:w-auto min-w-[120px]">
                    Đóng
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* =====================================================================================
          2. DIALOG: TÁCH HỘ (Split Wizard)
      ===================================================================================== */}
      <Dialog open={!!splitHousehold} onOpenChange={(open) => !open && setSplitHousehold(null)}>
        <DialogContent className="max-w-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <GitBranch className="h-4 w-4 text-primary-foreground" />
              </div>
              Tách hộ khẩu
            </DialogTitle>
          </DialogHeader>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className={cn('h-1.5 flex-1 rounded-full transition-colors', s <= splitStep ? 'bg-primary' : 'bg-muted')} />
            ))}
          </div>

          {/* STEP 1: CHỌN THÀNH VIÊN */}
          {splitStep === 1 && splitHousehold && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-lg bg-accent/50 p-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium">Bước 1: Chọn thành viên tách ra</span>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {splitHousehold.members.map((member) => (
                  <Label
                    key={member.id}
                    className={cn(
                      'flex items-center gap-4 rounded-xl border-2 p-3 cursor-pointer transition-all',
                      selectedMembers.includes(member.id) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    )}
                  >
                    <Checkbox
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => handleMemberToggle(member.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role} • {member.dob}</p>
                    </div>
                    <Badge variant="outline">{member.role}</Badge>
                  </Label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: THÔNG TIN HỘ MỚI */}
          {splitStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-lg bg-accent/50 p-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-medium">Bước 2: Thông tin hộ mới</span>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Chủ hộ mới (Dự kiến)</Label>
                  <Input value={newHeadOfHousehold} readOnly className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Mã hộ mới</Label>
                  <Input value={`${splitHousehold?.code.split('-')[0]}-2025-NEW`} readOnly className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Địa chỉ mới</Label>
                  <Input placeholder="Nhập địa chỉ mới..." defaultValue={splitHousehold?.address} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: XÁC NHẬN */}
          {splitStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-lg bg-green-500/10 p-3 flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-700">Bước 3: Xác nhận tách hộ</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border p-4">
                  <h4 className="font-semibold mb-2 text-muted-foreground">Hộ cũ (Giữ lại)</h4>
                  <div className="text-sm space-y-1">
                    {remainingMembers?.map((m) => <p key={m.id}>• {m.name} ({m.role})</p>)}
                    {remainingMembers?.length === 0 && <p className="text-red-500 italic">Cảnh báo: Hộ cũ trống!</p>}
                  </div>
                </div>
                <div className="rounded-xl border-2 border-primary p-4 bg-primary/5">
                  <h4 className="font-semibold mb-2 text-primary">Hộ mới (Tách ra)</h4>
                  <div className="text-sm space-y-1">
                    {selectedMemberData?.map((m) => <p key={m.id}>• {m.name} ({m.role})</p>)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WIZARD ACTIONS */}
          <DialogFooter className="mt-4">
            {splitStep > 1 && (
              <Button variant="outline" onClick={() => setSplitStep(splitStep - 1)}>Quay lại</Button>
            )}
            {splitStep < 3 ? (
              <Button 
                onClick={() => setSplitStep(splitStep + 1)} 
                disabled={splitStep === 1 && selectedMembers.length === 0}
              >
                Tiếp tục
              </Button>
            ) : (
              <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSplitComplete}>
                Hoàn tất tách hộ
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HouseholdsPage;