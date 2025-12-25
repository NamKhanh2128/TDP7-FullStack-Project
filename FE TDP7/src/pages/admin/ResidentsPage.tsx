import { useState } from 'react';
import { Search, Filter, Edit, UserX, Truck } from 'lucide-react';
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
import { allHouseholds } from '@/data/mockData';

// Flatten all members from all households
const allResidents = allHouseholds.flatMap((h) =>
  h.members.map((m) => ({ ...m, householdCode: h.code }))
);

const ResidentsPage = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [ageFilter, setAgeFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingResident, setEditingResident] = useState<typeof allResidents[0] | null>(null);

  const getAge = (dob: string) => {
    const [day, month, year] = dob.split('/').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const filteredResidents = allResidents.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.idCard.toLowerCase().includes(search.toLowerCase());

    const age = getAge(r.dob);
    let matchesAge = true;
    if (ageFilter === 'child') matchesAge = age < 15;
    else if (ageFilter === 'adult') matchesAge = age >= 18 && age < 60;
    else if (ageFilter === 'senior') matchesAge = age >= 60;

    let matchesGender = true;
    if (genderFilter !== 'all') matchesGender = r.gender === genderFilter;

    return matchesSearch && matchesAge && matchesGender;
  });

  const handleSave = () => {
    toast({
      title: 'Thành công',
      description: 'Đã cập nhật thông tin cư dân!',
    });
    setEditingResident(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Quản lý nhân khẩu</h1>
        <p className="text-muted-foreground">Tổng số: {allResidents.length} người</p>
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
              {filteredResidents.map((resident) => (
                <TableRow key={resident.id}>
                  <TableCell className="font-medium">{resident.name}</TableCell>
                  <TableCell>{resident.dob}</TableCell>
                  <TableCell>
                    <Badge variant={resident.gender === 'Nam' ? 'default' : 'secondary'}>
                      {resident.gender}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{resident.idCard}</TableCell>
                  <TableCell>{resident.occupation}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{resident.householdCode}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingResident(resident)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Sửa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
                <Input defaultValue={editingResident.occupation} />
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
                <Button variant="outline" onClick={() => setEditingResident(null)} className="flex-1">
                  Hủy
                </Button>
                <Button variant="gradient" onClick={handleSave} className="flex-1">
                  Lưu thay đổi
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
