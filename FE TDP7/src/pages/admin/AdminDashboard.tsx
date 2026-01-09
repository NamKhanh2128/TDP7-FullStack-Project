import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Home, UserPlus, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getDashboardStatsAPI, getRecentRequestsAPI } from '@/services/apiService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(199, 89%, 48%)', 'hsl(340, 82%, 52%)'];

// Interface cho dữ liệu từ API - Khớp với Backend mới
interface DashboardStats {
  total_households: number;
  total_residents: number;
  tam_tru_count: number;
  pending_requests: number;
  // Optional fields cho biểu đồ (nếu Backend có trả về sau)
  gender_stats?: Array<{
    gender: string;
    count: number;
  }>;
  age_stats?: {
    mam_non: number;
    hoc_sinh: number;
    thpt: number;
    lao_dong: number;
    cao_tuoi: number;
  };
}

const AdminDashboard = () => {
  const { toast } = useToast();
  
  // State để lưu dữ liệu thống kê
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State để lưu danh sách yêu cầu mới nhất
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  // Fetch dữ liệu thống kê từ API
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await getDashboardStatsAPI();
        // Backend trả về object với các key: total_households, total_residents, tam_tru_count, pending_requests, gender_stats, age_stats
        if (response && typeof response === 'object') {
          setStats({
            total_households: response.total_households || 0,
            total_residents: response.total_residents || 0,
            tam_tru_count: response.tam_tru_count || 0,
            pending_requests: response.pending_requests || 0,
            gender_stats: response.gender_stats || [],
            age_stats: response.age_stats || {
              mam_non: 0,
              hoc_sinh: 0,
              thpt: 0,
              lao_dong: 0,
              cao_tuoi: 0
            }
          });
        } else {
          // Không fallback về mock data, để stats = null để hiển thị 0
          setStats(null);
        }
      } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          title: 'Cảnh báo',
          description: error.message || 'Không thể tải số liệu thống kê.',
          variant: 'destructive',
        });
        // Không fallback về mock data, để stats = null để hiển thị 0
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch danh sách yêu cầu mới nhất
  useEffect(() => {
    const fetchRecentRequests = async () => {
      setIsLoadingRequests(true);
      try {
        const response = await getRecentRequestsAPI();
        if (response.success && response.data) {
          setRecentRequests(response.data);
        } else {
          setRecentRequests([]);
        }
      } catch (error: any) {
        console.error('Error fetching recent requests:', error);
        setRecentRequests([]);
      } finally {
        setIsLoadingRequests(false);
      }
    };

    fetchRecentRequests();
  }, []);

  // Tạo statCards từ dữ liệu API
const statCards = [
  { 
    label: 'Tổng số hộ', 
      value: stats?.total_households || 0,
    icon: Home, 
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    trend: '+12 hộ mới trong tháng',
  },
  { 
    label: 'Tổng nhân khẩu', 
      value: stats?.total_residents || 0,
    icon: Users, 
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    trend: '+45 người trong năm',
  },
  { 
      label: 'Tạm trú, Tạm vắng', 
      value: stats?.tam_tru_count || 0,
    icon: UserPlus, 
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    trend: '32 sinh viên, 13 lao động',
  },
  { 
    label: 'Chờ duyệt', 
      value: stats?.pending_requests || 0,
    icon: Clock, 
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    trend: 'Cần xử lý ngay',
    isUrgent: true,
  },
];

  // Convert gender_stats từ API sang format cho biểu đồ tròn (PieChart)
  // Format: [{ name: 'Nam', value: 100 }, { name: 'Nữ', value: 90 }]
  const genderDistribution = stats?.gender_stats && stats.gender_stats.length > 0
    ? stats.gender_stats.map(item => ({
        name: item.gender || 'Không xác định',
        value: item.count || 0,
      }))
    : []; // Không fallback về mock data, hiển thị biểu đồ rỗng

  // Convert age_stats từ API sang format cho biểu đồ cột (BarChart)
  // Format: [{ name: 'Mầm non (0-5)', count: 10 }, ...]
  const ageDistribution = stats?.age_stats
    ? [
        { name: 'Mầm non (0-5)', count: stats.age_stats.mam_non || 0 },
        { name: 'Học sinh (6-14)', count: stats.age_stats.hoc_sinh || 0 },
        { name: 'THPT (15-18)', count: stats.age_stats.thpt || 0 },
        { name: 'Lao động (19-60)', count: stats.age_stats.lao_dong || 0 },
        { name: 'Cao tuổi (60+)', count: stats.age_stats.cao_tuoi || 0 },
      ]
    : [
        { name: 'Mầm non (0-5)', count: 0 },
        { name: 'Học sinh (6-14)', count: 0 },
        { name: 'THPT (15-18)', count: 0 },
        { name: 'Lao động (19-60)', count: 0 },
        { name: 'Cao tuổi (60+)', count: 0 },
      ]; // Không fallback về mock data, hiển thị biểu đồ với giá trị 0
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* HEADER SECTION - Đã xóa nút Đăng xuất */}
      <div className="flex flex-col gap-1">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground"
        >
          Tổng quan quản trị
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Tổ dân phố 7 - Phường La Khê, Quận Hà Đông
        </motion.p>
      </div>

      {/* STATS GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-muted shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-muted rounded w-20 mb-2" />
                    <div className="h-8 bg-muted rounded w-16 mb-2" />
                    <div className="h-3 bg-muted rounded w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn(
              'transition-shadow hover:shadow-lg',
              stat.isUrgent && 'border-destructive/50 ring-1 ring-destructive/20'
            )}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center shrink-0', stat.bgColor)}>
                    <stat.icon className={cn('h-6 w-6', stat.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {stat.value.toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      )}

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="h-full"
        >
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Phân bố độ tuổi
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-muted-foreground">Đang tải dữ liệu...</div>
                </div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    name="Số lượng"
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="h-full"
        >
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Phân bố giới tính
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-muted-foreground">Đang tải dữ liệu...</div>
                </div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                      data={genderDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                      {genderDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-sm font-medium ml-1 text-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* RECENT REQUESTS TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Yêu cầu chờ xử lý mới nhất
            </CardTitle>
            <Link to="/admin/approvals">
              <Button variant="ghost" size="sm" className="hover:bg-background">
                Xem tất cả
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingRequests ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="animate-pulse">Đang tải dữ liệu...</div>
              </div>
            ) : (
            <div className="divide-y divide-border">
                {recentRequests.length > 0 ? (
                  recentRequests.map((request) => {
                    // Lấy chữ cái đầu của tên để hiển thị avatar
                    const getInitials = (name: string) => {
                      if (!name) return '?';
                      const parts = name.trim().split(' ');
                      if (parts.length >= 2) {
                        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
                      }
                      return name.charAt(0).toUpperCase();
                    };

                    // Format loại yêu cầu
                    const getTypeLabel = (type: string) => {
                      if (type === 'tam_tru' || type === 'TamTru') return 'Tạm trú';
                      if (type === 'tam_vang' || type === 'TamVang') return 'Tạm vắng';
                      if (type === 'dat_lich' || type === 'DatLich') return 'Đặt lịch';
                      return type;
                    };

                    // Format thời gian
                    const formatDate = (dateString: string) => {
                      if (!dateString) return 'Chưa có';
                      try {
                        const date = new Date(dateString);
                        return date.toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                      } catch {
                        return dateString;
                      }
                    };

                    const displayName = request.full_name || request.applicant_name || 'Không có tên';
                    const displayType = getTypeLabel(request.type || '');
                    const displayDate = formatDate(request.created_at || '');

                    return (
                  <div key={request.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-bold">
                            {getInitials(displayName)}
                      </div>
                      <div>
                            <p className="font-medium text-foreground">{displayName}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
                              {displayType}
                              <span className="text-xs text-muted-foreground/60">• {displayDate}</span>
                        </p>
                      </div>
                    </div>
                    <Link to="/admin/approvals">
                      <Button size="sm" variant="outline">Xử lý</Button>
                    </Link>
                  </div>
                    );
                  })
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Không có yêu cầu nào đang chờ xử lý.</p>
                </div>
              )}
            </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;