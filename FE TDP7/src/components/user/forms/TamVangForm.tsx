import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getMyHouseholdAPI, createRequestAPI, updateMyRequestAPI } from '@/services/apiService';
import { CalendarDays, MapPin, User, FileText, Loader2 } from 'lucide-react';

interface TamVangFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any; // Dữ liệu ban đầu khi edit mode
}

export function TamVangForm({ open, onClose, onSuccess, initialData }: TamVangFormProps) {
  const { toast } = useToast();
  const [selectedMember, setSelectedMember] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [destination, setDestination] = useState('');
  
  // State cho danh sách thành viên
  const [members, setMembers] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Kiểm tra edit mode
  const isEditMode = !!initialData;

  // Parse reason để lấy lại các trường riêng lẻ
  const parseReason = (reasonString: string) => {
    if (!reasonString) return { memberName: '', reason: '', destination: '' };
    
    // Format: "Xin tạm vắng cho thành viên: ... Lý do: ... - Nơi đến: ..."
    const memberMatch = reasonString.match(/thành viên:\s*(.+?)(?:\s*\.\s*Lý do:|$)/);
    const reasonMatch = reasonString.match(/Lý do:\s*(.+?)(?:\s*-\s*Nơi đến:|$)/);
    const destinationMatch = reasonString.match(/Nơi đến:\s*(.+?)$/);
    
    return {
      memberName: memberMatch ? memberMatch[1].trim() : '',
      reason: reasonMatch ? reasonMatch[1].trim() : reasonString,
      destination: destinationMatch ? destinationMatch[1].trim() : '',
    };
  };

  // Fetch danh sách thành viên từ API và điền dữ liệu nếu edit mode
  useEffect(() => {
    const fetchMembers = async () => {
      if (!open) return; // Chỉ fetch khi modal mở
      
      setIsLoadingMembers(true);
      try {
        const response = await getMyHouseholdAPI();
        if (response.success && response.data && response.data.members) {
          setMembers(response.data.members);
          
          // Nếu là edit mode, điền sẵn dữ liệu
          if (initialData) {
            // Parse reason để lấy lại các trường
            const parsed = parseReason(initialData.reason || '');
            setReason(parsed.reason);
            setDestination(parsed.destination);
            setFromDate(initialData.start_date || '');
            setToDate(initialData.end_date || '');
            
            // Tìm và chọn thành viên
            if (parsed.memberName) {
              const member = response.data.members.find(
                (m: any) => 
                  m.name === parsed.memberName || 
                  m.full_name === parsed.memberName ||
                  `${m.name} (${m.relation || m.role})` === parsed.memberName
              );
              if (member) {
                setSelectedMember(member.id || member.name || member.full_name);
              }
            }
          }
        } else {
          setMembers([]);
          toast({
            title: 'Cảnh báo',
            description: 'Không thể tải danh sách thành viên. Vui lòng thử lại.',
            variant: 'destructive',
          });
        }
      } catch (error: any) {
        console.error('Error fetching household members:', error);
        setMembers([]);
        toast({
          title: 'Lỗi',
          description: error.message || 'Không thể tải danh sách thành viên',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [open, initialData]);

  // Reset form khi đóng modal
  useEffect(() => {
    if (!open) {
      setSelectedMember('');
      setFromDate('');
      setToDate('');
      setReason('');
      setDestination('');
    }
  }, [open]);

  const handleSubmit = async () => {
    // 1. Lấy giá trị từ các state: destination (Nơi đến) và reason (Lý do)
    const destinationValue = destination.trim();
    const reasonValue = reason.trim();

    // 2. Kiểm tra nếu người dùng chưa nhập destination hoặc reason thì alert báo lỗi
    if (!destinationValue) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập nơi đến',
        variant: 'destructive',
      });
      return;
    }

    if (!reasonValue) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập lý do vắng mặt',
        variant: 'destructive',
      });
      return;
    }

    // Kiểm tra các trường khác
    if (!selectedMember || !fromDate || !toDate) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // 3. Tạo một chuỗi tổng hợp để gửi cho Backend
      // Logic gộp chuỗi bắt buộc:
      const finalReason = `Nơi đến: ${destinationValue} - Lý do: ${reasonValue}`;

      // 4. Tạo payload và gọi API
      const payload = {
        type: 'TamVang',
        reason: finalReason, // QUAN TRỌNG: Phải gửi chuỗi đã gộp này
        start_date: fromDate,
        end_date: toDate
      };

      // Log ra để kiểm tra
      console.log("Payload gửi đi:", payload);

      // Gọi API POST /api/requests (hoặc PUT nếu đang sửa)
      let response;
      if (isEditMode && initialData?.id) {
        // Edit mode: Gọi PUT API
        response = await updateMyRequestAPI(initialData.id, payload);
      } else {
        // Create mode: Gọi POST API
        response = await createRequestAPI(payload);
      }

      if (response.success) {
        toast({
          title: 'Thành công',
          description: isEditMode 
            ? 'Đã cập nhật khai báo tạm vắng thành công!' 
            : 'Đã gửi khai báo tạm vắng thành công!',
        });

        // Reset form
        setSelectedMember('');
        setFromDate('');
        setToDate('');
        setReason('');
        setDestination('');
        
        // Gọi callback để refresh danh sách
        if (onSuccess) {
          onSuccess();
        }
        
        // Đóng modal
        onClose();
      } else {
        throw new Error(response.message || 'Không thể gửi yêu cầu');
      }
    } catch (error: any) {
      console.error('Error submitting tam vang request:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể gửi khai báo. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            {isEditMode ? 'Sửa khai báo tạm vắng' : 'Khai báo tạm vắng'}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Thành viên <span className="text-destructive">*</span>
            </Label>
            {isLoadingMembers ? (
              <div className="flex items-center justify-center p-4 border rounded-md bg-background">
                <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                <span className="text-sm text-muted-foreground">Đang tải danh sách thành viên...</span>
              </div>
            ) : (
              <Select value={selectedMember} onValueChange={setSelectedMember} disabled={members.length === 0}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={members.length === 0 ? "Không có thành viên" : "Chọn thành viên"} />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  {members.length > 0 ? (
                    members.map((m) => {
                      const memberName = m.name || m.full_name || 'Không có tên';
                      const memberRole = m.role || m.relation || 'Thành viên';
                      const memberId = m.id || memberName;
                      return (
                        <SelectItem key={memberId} value={memberId}>
                          {memberName} ({memberRole})
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value="no-member" disabled>
                      Không có thành viên
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Từ ngày
              </Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Đến ngày
              </Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Lý do vắng mặt
            </Label>
            <Textarea
              placeholder="Ví dụ: Đi học, đi làm xa, thăm người thân..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px] bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Nơi đến tạm trú
            </Label>
            <Input
              placeholder="Địa chỉ nơi đến"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
            Hủy
          </Button>
          <Button 
            variant="gradient" 
            onClick={handleSubmit} 
            className="flex-1"
            disabled={isSubmitting || members.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> {isEditMode ? 'Đang cập nhật...' : 'Đang gửi...'}
              </>
            ) : (
              isEditMode ? 'Lưu thay đổi' : 'Gửi khai báo'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
