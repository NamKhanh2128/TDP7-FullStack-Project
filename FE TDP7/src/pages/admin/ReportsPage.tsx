import { useState, useEffect } from 'react';
import { FileSpreadsheet, Gift, Heart, Vote, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getDemographicStatsAPI } from '@/services/apiService';
import * as XLSX from 'xlsx';

// Interface cho dữ liệu từ API
interface DemographicData {
  id: string;
  name: string;
  dob: string;
  age: number;
  gender: string;
  role: string;
  idCard: string;
  household_code: string;
  address: string;
}

interface DemographicStats {
  counts: {
    total: number;
    children: number;
    voters: number;
    elderly: number;
  };
  lists: {
    children: DemographicData[];
    voters: DemographicData[];
    elderly: DemographicData[];
  };
}

const reports = [
  {
    id: 'children' as const,
    title: 'Danh sách trẻ em',
    description: 'Tặng quà 1/6, Trung thu (Dưới 15 tuổi)',
    icon: Gift,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    fileName: 'Danh_sach_tre_em.xlsx',
  },
  {
    id: 'elderly' as const,
    title: 'Danh sách người cao tuổi',
    description: 'Mừng thọ, chăm sóc sức khỏe (Trên 70 tuổi)',
    icon: Heart,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    fileName: 'Danh_sach_nguoi_cao_tuoi.xlsx',
  },
  {
    id: 'voters' as const,
    title: 'Danh sách cử tri',
    description: 'Bầu cử (Từ 18 tuổi trở lên)',
    icon: Vote,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    fileName: 'Danh_sach_cu_tri.xlsx',
  },
];

const ReportsPage = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DemographicStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getDemographicStatsAPI();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error: any) {
        console.error('Error fetching demographic stats:', error);
        toast({
          title: 'Lỗi',
          description: error.message || 'Không thể tải dữ liệu thống kê',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Hàm xuất Excel
  const handleExport = (type: 'children' | 'voters' | 'elderly') => {
    if (!stats || !stats.lists[type] || stats.lists[type].length === 0) {
      toast({
        title: 'Cảnh báo',
        description: 'Không có dữ liệu để xuất',
        variant: 'destructive',
      });
      return;
    }

    try {
      const data = stats.lists[type];
      const report = reports.find(r => r.id === type);
      
      // Chuẩn bị dữ liệu cho Excel
      const excelData = data.map((item, index) => ({
        'STT': index + 1,
        'Họ và tên': item.name,
        'Ngày sinh': item.dob,
        'Tuổi': item.age,
        'Giới tính': item.gender,
        'Quan hệ': item.role,
        'CCCD/CMND': item.idCard,
        'Mã hộ khẩu': item.household_code,
        'Địa chỉ': item.address,
      }));

      // Tạo workbook và worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách');

      // Đặt độ rộng cột
      const colWidths = [
        { wch: 5 },  // STT
        { wch: 25 }, // Họ và tên
        { wch: 12 }, // Ngày sinh
        { wch: 6 },  // Tuổi
        { wch: 10 }, // Giới tính
        { wch: 15 }, // Quan hệ
        { wch: 15 }, // CCCD/CMND
        { wch: 15 }, // Mã hộ khẩu
        { wch: 30 }, // Địa chỉ
      ];
      ws['!cols'] = colWidths;

      // Xuất file
      const fileName = report?.fileName || `Danh_sach_${type}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: 'Thành công',
        description: `Đã xuất file ${fileName} thành công`,
      });
    } catch (error: any) {
      console.error('Error exporting Excel:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xuất file Excel',
        variant: 'destructive',
      });
    }
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
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Đang tải dữ liệu...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => {
              const count = stats?.counts[report.id] || 0;
              return (
                <Card key={report.id} className="hover:shadow-elevated transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', report.bgColor)}>
                        <report.icon className={cn('h-6 w-6', report.color)} />
                      </div>
                      <Badge variant="secondary">{count} người</Badge>
                    </div>
                    <CardTitle className="text-lg mt-4">{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleExport(report.id)}
                      disabled={count === 0}
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
                  <p className="text-2xl font-bold text-foreground">{stats?.counts.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Tổng nhân khẩu</p>
                </div>
                <div className="rounded-xl bg-warning/10 p-4 text-center">
                  <p className="text-2xl font-bold text-warning">{stats?.counts.children || 0}</p>
                  <p className="text-sm text-muted-foreground">Trẻ em</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{stats?.counts.voters || 0}</p>
                  <p className="text-sm text-muted-foreground">Cử tri</p>
                </div>
                <div className="rounded-xl bg-destructive/10 p-4 text-center">
                  <p className="text-2xl font-bold text-destructive">{stats?.counts.elderly || 0}</p>
                  <p className="text-sm text-muted-foreground">Cao tuổi (70+)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
