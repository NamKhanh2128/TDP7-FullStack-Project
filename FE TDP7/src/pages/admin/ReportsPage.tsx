import { FileSpreadsheet, Gift, Heart, Vote, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { allHouseholds } from '@/data/mockData';
import { cn } from '@/lib/utils';

// Flatten all residents
const allResidents = allHouseholds.flatMap((h) =>
  h.members.map((m) => ({ ...m, householdCode: h.code }))
);

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

const reports = [
  {
    id: 'children',
    title: 'Danh sách trẻ em',
    description: 'Tặng quà 1/6, Trung thu (Dưới 15 tuổi)',
    icon: Gift,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    filter: (r: typeof allResidents[0]) => getAge(r.dob) < 15,
  },
  {
    id: 'elderly',
    title: 'Danh sách người cao tuổi',
    description: 'Mừng thọ, chăm sóc sức khỏe (Trên 70 tuổi)',
    icon: Heart,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    filter: (r: typeof allResidents[0]) => getAge(r.dob) > 70,
  },
  {
    id: 'voters',
    title: 'Danh sách cử tri',
    description: 'Bầu cử (Từ 18 tuổi trở lên)',
    icon: Vote,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    filter: (r: typeof allResidents[0]) => getAge(r.dob) >= 18,
  },
];

const ReportsPage = () => {
  const { toast } = useToast();

  const handleExport = (reportId: string) => {
    toast({
      title: 'Đang xuất báo cáo',
      description: 'File Excel sẽ được tải xuống trong giây lát...',
    });
    // In real app, this would trigger actual export
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Báo cáo</h1>
          <p className="text-muted-foreground">Xuất danh sách theo yêu cầu</p>
        </div>
        <Button variant="gradient" onClick={() => handleExport('all')}>
          <Download className="h-4 w-4 mr-2" />
          Xuất toàn bộ
        </Button>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const filteredCount = allResidents.filter(report.filter).length;
          return (
            <Card key={report.id} className="hover:shadow-elevated transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', report.bgColor)}>
                    <report.icon className={cn('h-6 w-6', report.color)} />
                  </div>
                  <Badge variant="secondary">{filteredCount} người</Badge>
                </div>
                <CardTitle className="text-lg mt-4">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleExport(report.id)}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Xuất Excel
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Thống kê nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl bg-muted/50 p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{allResidents.length}</p>
              <p className="text-sm text-muted-foreground">Tổng nhân khẩu</p>
            </div>
            <div className="rounded-xl bg-warning/10 p-4 text-center">
              <p className="text-2xl font-bold text-warning">
                {allResidents.filter((r) => getAge(r.dob) < 15).length}
              </p>
              <p className="text-sm text-muted-foreground">Trẻ em</p>
            </div>
            <div className="rounded-xl bg-primary/10 p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {allResidents.filter((r) => getAge(r.dob) >= 18).length}
              </p>
              <p className="text-sm text-muted-foreground">Cử tri</p>
            </div>
            <div className="rounded-xl bg-destructive/10 p-4 text-center">
              <p className="text-2xl font-bold text-destructive">
                {allResidents.filter((r) => getAge(r.dob) > 70).length}
              </p>
              <p className="text-sm text-muted-foreground">Cao tuổi (70+)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
