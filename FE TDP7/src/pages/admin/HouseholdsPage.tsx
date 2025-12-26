import { useState } from 'react';
import { 
  Search, Eye, GitBranch, Users, MapPin, Home, Phone, Calendar, 
  FileText, UserCircle, ArrowRight, CreditCard, Save, X, Edit, 
  CheckCircle2, Trash2, Briefcase, Info, Map, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { allHouseholds, Household, HouseholdMember } from '@/data/mockData';
import { cn } from '@/lib/utils';

const HouseholdsPage = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [listHouseholds, setListHouseholds] = useState<Household[]>(allHouseholds);
  
  // States
  const [viewHousehold, setViewHousehold] = useState<Household | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Household | null>(null);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [splitHousehold, setSplitHousehold] = useState<Household | null>(null);
  const [splitStep, setSplitStep] = useState(1);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Filters
  const filteredHouseholds = listHouseholds.filter(h =>
    h.code.toLowerCase().includes(search.toLowerCase()) ||
    h.members.some(m => m.role === 'Chủ hộ' && m.name.toLowerCase().includes(search.toLowerCase())) ||
    h.address.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenDetail = (household: Household) => {
    setViewHousehold(household);
    setEditFormData(JSON.parse(JSON.stringify(household)));
    setIsEditing(false);
  };

  const handleMemberChange = (memberId: string, field: keyof HouseholdMember, value: any) => {
    if (!editFormData) return;
    setEditFormData({
      ...editFormData,
      members: editFormData.members.map(m => m.id === memberId ? { ...m, [field]: value } : m)
    });
  };

  const handleConfirmSave = () => {
    if (editFormData) {
      setListHouseholds(listHouseholds.map(h => h.id === editFormData.id ? editFormData : h));
      setViewHousehold(editFormData);
    }
    setShowConfirmSave(false);
    setIsEditing(false);
    setShowSuccessDialog(true);
  };

  const handleSplitComplete = () => {
    toast({ title: 'Thành công', description: `Đã tách hộ thành công!` });
    setSplitHousehold(null);
    setSplitStep(1);
  };

  const handleSplitStart = (household: Household) => {
    setSplitHousehold(household);
    setSplitStep(1);
    setSelectedMembers([]);
  };

  const newHeadOfHousehold = splitHousehold?.members.find(m => selectedMembers.includes(m.id))?.name || 'Chưa chọn';

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Quản lý hộ khẩu</h1>
          <p className="text-slate-500 text-sm mt-0.5 flex items-center gap-2 font-medium">
            <Users className="h-4 w-4 text-blue-500" /> Tổng số {listHouseholds.length} hộ gia đình
          </p>
        </div>
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Tìm kiếm mã hộ, chủ hộ..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 rounded-lg focus:ring-blue-500"
          />
        </div>
      </div>

      {/* DATA TABLE */}
      <Card className="border-none shadow-sm overflow-hidden rounded-xl">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b">
            <TableRow>
              <TableHead className="py-4 font-semibold text-slate-600">Mã hộ</TableHead>
              <TableHead className="font-semibold text-slate-600">Chủ hộ</TableHead>
              <TableHead className="font-semibold text-slate-600">Địa chỉ</TableHead>
              <TableHead className="text-center font-semibold text-slate-600">Thành viên</TableHead>
              <TableHead className="text-right pr-8 font-semibold text-slate-600">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {filteredHouseholds.map((household) => {
              const head = household.members.find(m => m.role === 'Chủ hộ') || household.members[0];
              return (
                <TableRow key={household.id} className="hover:bg-blue-50/30 transition-colors border-b last:border-none">
                  <TableCell className="font-medium text-blue-600">{household.code}</TableCell>
                  <TableCell className="font-medium text-slate-700">{head.name}</TableCell>
                  <TableCell className="max-w-[300px] truncate text-slate-500 text-sm">{household.address}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 font-medium border-none">
                      {household.members.length}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDetail(household)} className="text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                        <Eye className="h-4 w-4 mr-1.5" /> Chi tiết
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleSplitStart(household)} className="text-slate-500 hover:text-cyan-600 hover:bg-cyan-50">
                        <GitBranch className="h-4 w-4 mr-1.5" /> Tách hộ
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* --- CHI TIẾT HỘ KHẨU DIALOG --- */}
      <Dialog open={!!viewHousehold} onOpenChange={(open) => !open && setViewHousehold(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 border-none rounded-2xl overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 bg-white border-b sticky top-0 z-10 flex-row justify-between items-center space-y-0">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-200">
                <Home className="h-5.5 w-5.5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-slate-900">Hồ sơ hộ khẩu: {editFormData?.code}</DialogTitle>
                <DialogDescription className="flex items-center gap-1.5 font-medium text-slate-500 mt-0.5 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-cyan-500" /> {editFormData?.address}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="rounded-lg h-9 bg-blue-600 hover:bg-blue-700 transition-colors">
                  <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa hồ sơ
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-lg h-9 text-slate-600 border-slate-200">
                  <X className="h-4 w-4 mr-2" /> Hủy sửa
                </Button>
              )}
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 bg-slate-50/50">
            {editFormData && (
              <div className="p-6 space-y-6">
                {/* THÔNG TIN HÀNH CHÍNH HỘ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: Calendar, label: "Ngày đăng ký thường trú", value: editFormData.members[0].registrationDate, field: 'registrationDate', color: "text-blue-600", bg: "bg-blue-50" },
                    { icon: Map, label: "Địa chỉ cũ", value: editFormData.members[0].previousAddress, field: 'previousAddress', color: "text-cyan-600", bg: "bg-cyan-50" },
                    { icon: Users, label: "Quy mô hộ khẩu", value: `${editFormData.members.length} nhân khẩu`, color: "text-indigo-600", bg: "bg-indigo-50" }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className={cn("p-2.5 rounded-lg", item.bg)}>
                        <item.icon className={cn("h-5 w-5", item.color)} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{item.label}</p>
                        {isEditing && item.field ? (
                          <Input value={item.value} onChange={(e) => handleMemberChange(editFormData.members[0].id, item.field as any, e.target.value)} className="h-7 mt-1 text-xs border-slate-200" />
                        ) : (
                          <p className="font-semibold text-slate-700 mt-0.5">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 py-2">
                   <Separator className="flex-1" />
                   <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                     Danh sách nhân khẩu
                   </span>
                   <Separator className="flex-1" />
                </div>

                {/* DANH SÁCH THÀNH VIÊN */}
                <div className="space-y-4">
                  {editFormData.members.map((member) => (
                    <div key={member.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden group hover:border-blue-200 transition-all">
                      <div className="bg-slate-50/50 px-5 py-2.5 border-b flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-4 w-4 text-slate-400" />
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Chi tiết nhân khẩu</span>
                        </div>
                        <Badge className={cn("rounded-full px-3 py-0.5 font-medium border-none shadow-none", 
                          member.role === 'Chủ hộ' ? "bg-blue-600/10 text-blue-600" : "bg-cyan-500/10 text-cyan-600")}>
                          {member.role}
                        </Badge>
                      </div>

                      <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Nhóm 1: Cơ bản */}
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-slate-400 font-medium uppercase">Họ và tên</Label>
                            {isEditing ? <Input value={member.name} onChange={(e) => handleMemberChange(member.id, 'name', e.target.value)} className="h-8 text-sm" /> : <p className="font-semibold text-slate-800">{member.name}</p>}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-[10px] text-slate-400 font-medium uppercase text-nowrap">Ngày sinh</Label>
                              {isEditing ? <Input value={member.dob} onChange={(e) => handleMemberChange(member.id, 'dob', e.target.value)} className="h-8 text-xs" /> : <p className="font-medium text-slate-700 text-sm">{member.dob}</p>}
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] text-slate-400 font-medium uppercase text-nowrap">Giới tính</Label>
                              {isEditing ? <Input value={member.gender} onChange={(e) => handleMemberChange(member.id, 'gender', e.target.value)} className="h-8 text-xs" /> : <p className="font-medium text-slate-700 text-sm">{member.gender}</p>}
                            </div>
                          </div>
                        </div>

                        {/* Nhóm 2: Định danh */}
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-slate-400 font-medium uppercase leading-none">Số CCCD/CMND</Label>
                            {isEditing ? <Input value={member.idCard} onChange={(e) => handleMemberChange(member.id, 'idCard', e.target.value)} className="h-8 text-sm" /> : <p className="font-semibold text-slate-800 font-mono text-sm tracking-tight">{member.idCard}</p>}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-[10px] text-slate-400 font-medium uppercase text-nowrap">Ngày cấp</Label>
                              <p className="font-medium text-slate-700 text-xs">{member.idIssueDate}</p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] text-slate-400 font-medium uppercase text-nowrap">Nơi cấp</Label>
                              <p className="font-medium text-slate-700 text-[10px] leading-tight line-clamp-1">{member.idIssuePlace}</p>
                            </div>
                          </div>
                        </div>

                        {/* Nhóm 3: Công việc */}
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-slate-400 font-medium uppercase">Nghề nghiệp</Label>
                            {isEditing ? <Input value={member.occupation} onChange={(e) => handleMemberChange(member.id, 'occupation', e.target.value)} className="h-8 text-sm" /> : <p className="font-medium text-slate-800 text-sm">{member.occupation}</p>}
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-slate-400 font-medium uppercase leading-none">Nơi làm việc</Label>
                            <p className="text-slate-600 text-xs mt-1 leading-relaxed line-clamp-2">{member.workplace}</p>
                          </div>
                        </div>

                        {/* Nhóm 4: Văn hóa */}
                        <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-slate-400 font-medium uppercase leading-none">Dân tộc / Tôn giáo</Label>
                            <p className="font-semibold text-slate-800 text-sm">{member.ethnicity} / {member.religion}</p>
                          </div>
                          <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                            <p className="text-[9px] text-slate-400 font-semibold tracking-wider italic">CSDL DÂN CƯ</p>
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter className="p-5 bg-white border-t sticky bottom-0 flex gap-3 sm:justify-end">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-lg h-10 px-8 border-slate-200 font-medium">Hủy</Button>
                <Button onClick={() => setShowConfirmSave(true)} className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg h-10 px-10 font-medium shadow-md shadow-blue-100 border-none">
                  <Save className="h-4 w-4 mr-2" /> Lưu cập nhật
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setViewHousehold(null)} className="rounded-lg h-10 px-10 border-slate-200 font-medium text-slate-600">Đóng cửa sổ</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- CONFIRM DIALOG --- */}
      <AlertDialog open={showConfirmSave} onOpenChange={setShowConfirmSave}>
        <AlertDialogContent className="rounded-2xl max-w-[400px] border-none shadow-xl">
          <AlertDialogHeader className="items-center text-center">
            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                <Info className="h-6 w-6 text-blue-600" />
            </div>
            <AlertDialogTitle className="text-xl font-semibold">Lưu thay đổi?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium leading-relaxed">
              Xác nhận cập nhật dữ liệu nhân khẩu vào hệ thống quản lý dân cư?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="rounded-lg border-slate-200 mt-0 flex-1">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave} className="bg-blue-600 hover:bg-blue-700 rounded-lg flex-1">Đồng ý lưu</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- SUCCESS DIALOG --- */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="max-w-sm rounded-2xl border-none shadow-2xl text-center p-8">
            <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-semibold text-slate-900">Cập nhật thành công</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500 font-medium mt-1">
                  Hồ sơ hộ khẩu <strong>{viewHousehold?.code}</strong> đã được đồng bộ an toàn.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="pt-6">
              <Button onClick={() => setShowSuccessDialog(false)} className="w-full rounded-xl h-11 bg-slate-900 font-medium shadow-lg shadow-slate-200">Hoàn tất</Button>
            </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- SPLIT DIALOG (ĐỒNG BỘ MÀU BLUE-CYAN) --- */}
      <Dialog open={!!splitHousehold} onOpenChange={(open) => !open && setSplitHousehold(null)}>
        <DialogContent className="max-w-xl rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-7 pb-4 bg-white border-b">
            <div className="h-11 w-11 bg-cyan-50 rounded-xl flex items-center justify-center mb-4">
                <GitBranch className="h-5 w-5 text-cyan-600" />
            </div>
            <DialogTitle className="text-xl font-semibold">Quy trình tách hộ khẩu</DialogTitle>
            <DialogDescription className="font-medium text-slate-500">Thực hiện tách nhân khẩu sang hộ gia đình mới.</DialogDescription>
          </DialogHeader>

          <div className="px-7 py-5 bg-slate-50/50">
            <div className="flex gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className={cn('h-1.5 flex-1 rounded-full transition-all duration-500', s <= splitStep ? 'bg-gradient-to-r from-blue-600 to-cyan-500' : 'bg-slate-200')} />
              ))}
            </div>

            {splitStep === 1 && splitHousehold && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none font-semibold text-[10px] uppercase px-3 py-1">Bước 1: Chọn thành viên</Badge>
                <div className="grid grid-cols-1 gap-2 max-h-[35vh] overflow-y-auto pr-2">
                  {splitHousehold.members.map((member) => (
                    <Label key={member.id} className={cn('flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all', selectedMembers.includes(member.id) ? 'border-blue-500 bg-white shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300')}>
                      <Checkbox checked={selectedMembers.includes(member.id)} onCheckedChange={() => setSelectedMembers(prev => prev.includes(member.id) ? prev.filter(id => id !== member.id) : [...prev, member.id])} />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-700">{member.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">{member.role} • {member.dob}</p>
                      </div>
                    </Label>
                  ))}
                </div>
              </div>
            )}

            {splitStep === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-2 py-4">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none font-semibold text-[10px] uppercase px-3 py-1">Bước 2: Thông tin hộ mới</Badge>
                <div className="space-y-4">
                  <div className="space-y-1.5"><Label className="text-[11px] font-semibold text-slate-400 uppercase">Chủ hộ mới</Label><Input value={newHeadOfHousehold} readOnly className="bg-white border-slate-200 font-medium h-10 shadow-none" /></div>
                  <div className="space-y-1.5"><Label className="text-[11px] font-semibold text-slate-400 uppercase">Địa chỉ cư trú</Label><Input placeholder="Nhập địa chỉ..." defaultValue={splitHousehold?.address} className="bg-white border-slate-200 h-10 shadow-none" /></div>
                </div>
              </div>
            )}

            {splitStep === 3 && (
              <div className="text-center py-8 animate-in zoom-in-95">
                <div className="h-16 w-16 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-cyan-500" />
                </div>
                <h3 className="font-semibold text-lg text-slate-800">Xác nhận hoàn tất?</h3>
                <p className="text-slate-500 mt-2 text-sm px-8 leading-relaxed font-medium">Hộ mới sẽ bao gồm <b>{selectedMembers.length} thành viên</b> với chủ hộ là <b>{newHeadOfHousehold}</b>.</p>
              </div>
            )}
          </div>

          <DialogFooter className="p-7 bg-white border-t gap-3 flex-row items-center sm:justify-end">
            {splitStep > 1 && <Button variant="outline" onClick={() => setSplitStep(splitStep - 1)} className="rounded-lg h-10 px-6 border-slate-200 flex-1">Quay lại</Button>}
            {splitStep < 3 ? (
              <Button onClick={() => setSplitStep(splitStep + 1)} disabled={selectedMembers.length === 0} className="rounded-lg h-10 px-8 bg-slate-900 flex-1">Tiếp tục <ChevronRight className="h-4 w-4 ml-1.5" /></Button>
            ) : (
              <Button onClick={handleSplitComplete} className="rounded-lg h-10 px-8 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md border-none flex-1">Xác nhận tách</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HouseholdsPage;