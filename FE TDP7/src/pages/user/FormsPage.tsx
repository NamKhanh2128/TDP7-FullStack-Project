import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserMinus, UserPlus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TamVangForm } from '@/components/user/forms/TamVangForm';
import { TamTruForm } from '@/components/user/forms/TamTruForm';
import { BienDongForm } from '@/components/user/forms/BienDongForm';
import { cn } from '@/lib/utils';

const formTypes = [
  {
    id: 'tamvang',
    label: 'Tạm vắng',
    icon: UserMinus,
    description: 'Khai báo khi thành viên đi khỏi địa phương',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    id: 'tamtru',
    label: 'Tạm trú / Lưu trú',
    icon: UserPlus,
    description: 'Đăng ký cho khách, người thuê trọ',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    id: 'biendong',
    label: 'Biến động',
    icon: AlertTriangle,
    description: 'Mới sinh, qua đời, chuyển đi',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
];

const FormsPage = () => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'tamvang');
  const [openForm, setOpenForm] = useState<string | null>(null);

  useEffect(() => {
    if (tabFromUrl && formTypes.some(f => f.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  return (
    <div className="container py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            {formTypes.map((form) => (
              <TabsTrigger
                key={form.id}
                value={form.id}
                className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                {form.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {formTypes.map((form) => (
            <TabsContent key={form.id} value={form.id} className="mt-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => setOpenForm(form.id)}
                  className="w-full rounded-2xl bg-card p-6 shadow-card transition-all hover:shadow-elevated hover:scale-[1.01] text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-xl', form.bgColor)}>
                      <form.icon className={cn('h-7 w-7', form.color)} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{form.label}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{form.description}</p>
                      <Button variant="gradient" className="mt-4">
                        Bắt đầu khai báo
                      </Button>
                    </div>
                  </div>
                </button>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      {/* Recent Submissions */}
      <motion.section
        className="mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="mb-4 text-lg font-semibold text-foreground">Khai báo gần đây</h2>
        <div className="rounded-xl bg-card p-4 shadow-card">
          <p className="text-center text-sm text-muted-foreground py-4">
            Chưa có khai báo nào
          </p>
        </div>
      </motion.section>

      <TamVangForm open={openForm === 'tamvang'} onClose={() => setOpenForm(null)} />
      <TamTruForm open={openForm === 'tamtru'} onClose={() => setOpenForm(null)} />
      <BienDongForm open={openForm === 'biendong'} onClose={() => setOpenForm(null)} />
    </div>
  );
};

export default FormsPage;
