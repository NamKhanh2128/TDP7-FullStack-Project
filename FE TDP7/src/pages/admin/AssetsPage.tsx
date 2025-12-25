import { useState } from 'react';
import { Package, Edit, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useToast } from '@/hooks/use-toast';
import { assets, Asset } from '@/data/mockData';
import { cn } from '@/lib/utils';

const AssetsPage = () => {
  const { toast } = useToast();
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState({
    totalQuantity: 0,
    brokenQuantity: 0,
    notes: '',
  });

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      totalQuantity: asset.totalQuantity,
      brokenQuantity: asset.brokenQuantity,
      notes: asset.notes,
    });
  };

  const handleSave = () => {
    toast({
      title: 'Thành công',
      description: `Đã cập nhật thông tin ${editingAsset?.name}!`,
    });
    setEditingAsset(null);
  };

  const totalAssets = assets.reduce((sum, a) => sum + a.totalQuantity, 0);
  const totalBroken = assets.reduce((sum, a) => sum + a.brokenQuantity, 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Quản lý tài sản</h1>
        <p className="text-muted-foreground">Nhà văn hóa - Tổ dân phố 7</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng tài sản</p>
                <p className="text-2xl font-bold text-foreground">{totalAssets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đang hỏng</p>
                <p className="text-2xl font-bold text-destructive">{totalBroken}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Còn tốt</p>
                <p className="text-2xl font-bold text-success">{totalAssets - totalBroken}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách tài sản</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên tài sản</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead className="text-center">Số lượng</TableHead>
                <TableHead className="text-center">Đang hỏng</TableHead>
                <TableHead>Tình trạng</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => {
                const goodQuantity = asset.totalQuantity - asset.brokenQuantity;
                const healthPercent = (goodQuantity / asset.totalQuantity) * 100;
                return (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{asset.category}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{asset.totalQuantity}</TableCell>
                    <TableCell className="text-center">
                      {asset.brokenQuantity > 0 ? (
                        <span className="text-destructive font-medium">{asset.brokenQuantity}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              healthPercent >= 80 ? 'bg-success' :
                              healthPercent >= 50 ? 'bg-warning' : 'bg-destructive'
                            )}
                            style={{ width: `${healthPercent}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{healthPercent.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">
                      {asset.notes}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(asset)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Cập nhật
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingAsset} onOpenChange={() => setEditingAsset(null)}>
        <DialogContent className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <Package className="h-4 w-4 text-primary-foreground" />
              </div>
              Cập nhật tài sản
            </DialogTitle>
          </DialogHeader>

          {editingAsset && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="font-semibold text-foreground">{editingAsset.name}</p>
                <p className="text-sm text-muted-foreground">{editingAsset.category}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Số lượng tổng</Label>
                  <Input
                    type="number"
                    value={formData.totalQuantity}
                    onChange={(e) => setFormData({ ...formData, totalQuantity: Number(e.target.value) })}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Số lượng hỏng</Label>
                  <Input
                    type="number"
                    value={formData.brokenQuantity}
                    onChange={(e) => setFormData({ ...formData, brokenQuantity: Number(e.target.value) })}
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ghi chú tình trạng</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Mô tả chi tiết..."
                  className="bg-background"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditingAsset(null)} className="flex-1">
                  Hủy
                </Button>
                <Button variant="gradient" onClick={handleSave} className="flex-1">
                  Cập nhật kho
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetsPage;
