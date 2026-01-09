import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, MapPin, Users, Plus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useToast } from '@/hooks/use-toast';
import { MemberCard } from '@/components/user/MemberCard';
import { MemberDetailPopup } from '@/components/user/MemberDetailPopup';
import { HouseholdMember } from '@/data/mockData';
import { getMyHouseholdAPI, addMemberToMyHouseholdAPI, updateMemberForUserAPI } from '@/services/apiService';

// Interface cho dữ liệu từ API
interface HouseholdFromAPI {
  id: string;
  code: string;
  address: string;
  area: number;
  owner_name: string | null;
  members: HouseholdMemberFromAPI[];
  is_household_head: boolean;
}

interface HouseholdMemberFromAPI {
  id: string;
  name: string;
  role: string;
  dob: string;
  gender: string;
  idCard: string;
  occupation?: string;
  workplace?: string;
}

const HouseholdPage = () => {
  const { toast } = useToast();
  const [selectedMember, setSelectedMember] = useState<HouseholdMember | null>(null);
  
  // States cho dữ liệu động
  const [household, setHousehold] = useState<HouseholdFromAPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // States cho Modal thêm/sửa thành viên
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null); // Track member đang edit
  const [memberForm, setMemberForm] = useState({
    full_name: '',
    dob: '',
    gender: 'Nam',
    relation: 'Con',
    cccd: '',
    job: '',
    workplace: '',
  });

  // Hàm fetch dữ liệu hộ khẩu
  const fetchHousehold = async () => {
    setIsLoading(true);
    try {
      const response = await getMyHouseholdAPI();
      if (response.success && response.data) {
        setHousehold(response.data);
      } else {
        setHousehold(null);
        toast({
          title: 'Thông báo',
          description: response.message || 'Bạn chưa được gán vào hộ khẩu nào',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error fetching household:', error);
      setHousehold(null);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải thông tin hộ khẩu',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data khi component mount
  useEffect(() => {
    fetchHousehold();
  }, []);

  // Hàm mở modal để sửa thành viên
  const handleEditMember = (member: HouseholdMemberFromAPI) => {
    // Convert dob từ format API sang format date input (YYYY-MM-DD)
    let dobForInput = '';
    if (member.dob) {
      try {
        if (member.dob.includes('-')) {
          dobForInput = member.dob.split('T')[0]; // Lấy phần date nếu có time
        } else if (member.dob.includes('/')) {
          const [day, month, year] = member.dob.split('/');
          dobForInput = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
          dobForInput = member.dob;
        }
      } catch (error) {
        dobForInput = '';
      }
    }

    setEditingMemberId(member.id);
    setMemberForm({
      full_name: member.name || '',
      dob: dobForInput,
      gender: member.gender || 'Nam',
      relation: member.role || 'Con',
      cccd: member.idCard || '',
      job: member.occupation || '',
      workplace: member.workplace || '',
    });
    setShowAddMemberModal(true);
  };

  // Hàm reset form và đóng modal
  const handleCloseModal = () => {
    setShowAddMemberModal(false);
    setEditingMemberId(null);
    setMemberForm({
      full_name: '',
      dob: '',
      gender: 'Nam',
      relation: 'Con',
      cccd: '',
      job: '',
      workplace: '',
    });
  };

  // Hàm xử lý thêm/sửa thành viên
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!memberForm.full_name || !memberForm.relation) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ: Họ và tên, Quan hệ',
        variant: 'destructive',
      });
      return;
    }

    setIsAdding(true);
    try {
      let response;
      
      if (editingMemberId) {
        // Đang ở chế độ Sửa -> Gọi PUT API
        response = await updateMemberForUserAPI(editingMemberId, memberForm);
      } else {
        // Đang ở chế độ Thêm -> Gọi POST API
        response = await addMemberToMyHouseholdAPI(memberForm);
      }
      
      if (response.success) {
        toast({
          title: 'Thành công',
          description: response.message || (editingMemberId ? 'Đã cập nhật thành viên thành công' : 'Đã thêm thành viên thành công'),
        });
        
        // Reload lại danh sách ngay lập tức
        await fetchHousehold();
        
        // Đóng modal và reset form
        handleCloseModal();
      }
    } catch (error: any) {
      console.error('Error saving member:', error);
      toast({
        title: 'Lỗi',
        description: error.message || (editingMemberId ? 'Không thể cập nhật thành viên. Vui lòng thử lại.' : 'Không thể thêm thành viên. Vui lòng thử lại.'),
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Hàm format ngày sinh
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Chưa có';
    
    try {
      let date: Date;
      if (dateString.includes('-')) {
        date = new Date(dateString);
      } else if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/').map(Number);
        date = new Date(year, month - 1, day);
      } else {
        return dateString;
      }
      
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  // Convert API member to HouseholdMember format
  const convertMember = (member: HouseholdMemberFromAPI): HouseholdMember => {
    return {
      id: member.id,
      name: member.name,
      role: member.role as any,
      dob: formatDate(member.dob),
      gender: member.gender as 'Nam' | 'Nữ',
      idCard: member.idCard,
      occupation: member.occupation || '',
      workplace: member.workplace || '',
      idIssueDate: '',
      idIssuePlace: '',
      ethnicity: '',
      religion: '',
      registrationDate: '',
      previousAddress: '',
    };
  };

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="text-center py-12 text-muted-foreground">
          Đang tải thông tin hộ khẩu...
        </div>
      </div>
    );
  }

  if (!household) {
    return (
      <div className="container py-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Bạn chưa được gán vào hộ khẩu nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      {/* Household Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card p-5 shadow-card"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-primary">
            <Home className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">Mã hộ</p>
            <p className="font-bold text-foreground">{household.code}</p>
          </div>
        </div>
        
        <div className="mt-4 flex items-start gap-3 rounded-lg bg-muted/50 p-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-foreground">{household.address}</p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{household.members.length} thành viên</span>
          </div>
          
          {/* Nút Thêm thành viên - Chỉ hiện nếu là Chủ hộ */}
          {household.is_household_head && (
            <Button
              onClick={() => setShowAddMemberModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md flex items-center gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" /> Thêm thành viên
            </Button>
          )}
        </div>
      </motion.div>

      {/* Members List */}
      <section className="mt-6">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 text-lg font-semibold text-foreground"
        >
          Thành viên hộ gia đình
        </motion.h2>
        <div className="space-y-3">
          {household.members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có thành viên nào trong hộ khẩu
            </div>
          ) : (
            household.members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="flex items-center gap-2"
              >
                <div className="flex-1">
                  <MemberCard
                    member={convertMember(member)}
                    onClick={() => setSelectedMember(convertMember(member))}
                  />
                </div>
                {/* Nút Sửa - Chỉ hiện nếu là Chủ hộ */}
                {household.is_household_head && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Ngăn trigger onClick của MemberCard
                      handleEditMember(member);
                    }}
                    className="shrink-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </section>

      <MemberDetailPopup
        member={selectedMember}
        open={!!selectedMember}
        onClose={() => setSelectedMember(null)}
      />

      {/* Modal Thêm/Sửa thành viên */}
      <Dialog open={showAddMemberModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-7 pb-4 bg-white border-b">
            <div className="h-11 w-11 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              {editingMemberId ? (
                <Edit className="h-5 w-5 text-blue-600" />
              ) : (
                <Plus className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <DialogTitle className="text-xl font-semibold">
              {editingMemberId ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}
            </DialogTitle>
            <DialogDescription className="font-medium text-slate-500">
              {editingMemberId 
                ? 'Cập nhật thông tin thành viên trong hộ khẩu của bạn'
                : 'Nhập thông tin thành viên để thêm vào hộ khẩu của bạn'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveMember}>
            <div className="p-7 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium text-slate-700">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  placeholder="Nhập họ và tên đầy đủ"
                  value={memberForm.full_name}
                  onChange={(e) => setMemberForm({ ...memberForm, full_name: e.target.value })}
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
                    value={memberForm.dob}
                    onChange={(e) => setMemberForm({ ...memberForm, dob: e.target.value })}
                    className="border-slate-200 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium text-slate-700">Giới tính</Label>
                  <Select 
                    value={memberForm.gender} 
                    onValueChange={(value) => setMemberForm({ ...memberForm, gender: value })}
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
                  value={memberForm.relation} 
                  onValueChange={(value) => setMemberForm({ ...memberForm, relation: value })}
                  required
                >
                  <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                  value={memberForm.cccd}
                  onChange={(e) => setMemberForm({ ...memberForm, cccd: e.target.value })}
                  className="border-slate-200 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job" className="text-sm font-medium text-slate-700">Nghề nghiệp</Label>
                  <Input
                    id="job"
                    placeholder="Nhập nghề nghiệp"
                    value={memberForm.job}
                    onChange={(e) => setMemberForm({ ...memberForm, job: e.target.value })}
                    className="border-slate-200 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workplace" className="text-sm font-medium text-slate-700">Nơi làm việc</Label>
                  <Input
                    id="workplace"
                    placeholder="Nhập nơi làm việc"
                    value={memberForm.workplace}
                    onChange={(e) => setMemberForm({ ...memberForm, workplace: e.target.value })}
                    className="border-slate-200 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="p-7 bg-slate-50 border-t flex gap-3 sm:justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCloseModal} 
                className="rounded-lg"
                disabled={isAdding}
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={isAdding} 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                {isAdding 
                  ? (editingMemberId ? 'Đang cập nhật...' : 'Đang thêm...') 
                  : (editingMemberId ? 'Cập nhật' : 'Thêm thành viên')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HouseholdPage;
