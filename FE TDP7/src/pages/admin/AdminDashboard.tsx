import { motion } from 'framer-motion';
import { Users, Home, UserPlus, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { statistics, pendingRequests } from '@/data/mockData';
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

const statCards = [
  { 
    label: 'Tổng số hộ', 
    value: statistics.general.totalHouseholds,
    icon: Home, 
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    trend: '+12 hộ mới trong tháng',
  },
  { 
    label: 'Tổng nhân khẩu', 
    value: statistics.general.totalResidents,
    icon: Users, 
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    trend: '+45 người trong năm',
  },
  { 
    label: 'Tạm trú', 
    value: statistics.general.tempResidents,
    icon: UserPlus, 
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    trend: '32 sinh viên, 13 lao động',
  },
  { 
    label: 'Chờ duyệt', 
    value: statistics.general.pendingRequests,
    icon: Clock, 
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    trend: 'Cần xử lý ngay',
    isUrgent: true,
  },
];

const AdminDashboard = () => {
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
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value.toLocaleString('vi-VN')}</p>
                    <p className={cn(
                      'text-xs mt-1 truncate',
                      stat.isUrgent ? 'text-destructive font-bold' : 'text-muted-foreground'
                    )}>
                      {stat.trend}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics.ageDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statistics.genderDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statistics.genderDistribution.map((entry, index) => (
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
            <div className="divide-y divide-border">
              {pendingRequests.length > 0 ? (
                pendingRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-bold">
                        {request.applicantName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{request.applicantName}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
                          {request.type === 'tam_vang' && 'Tạm vắng'}
                          {request.type === 'tam_tru' && 'Tạm trú'}
                          {request.type === 'dat_lich' && 'Đặt lịch'}
                          <span className="text-xs text-muted-foreground/60">• {request.submittedAt}</span>
                        </p>
                      </div>
                    </div>
                    <Link to="/admin/approvals">
                      <Button size="sm" variant="outline">Xử lý</Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Không có yêu cầu nào đang chờ xử lý.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;