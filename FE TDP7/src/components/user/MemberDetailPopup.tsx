import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HouseholdMember } from '@/data/mockData';
import { User, Calendar, CreditCard, MapPin, Briefcase, Home } from 'lucide-react';

interface MemberDetailPopupProps {
  member: HouseholdMember | null;
  open: boolean;
  onClose: () => void;
}

export function MemberDetailPopup({ member, open, onClose }: MemberDetailPopupProps) {
  if (!member) return null;

  const fields = [
    { icon: Calendar, label: 'Ngày sinh', value: member.dob },
    { icon: User, label: 'Giới tính', value: member.gender },
    { icon: CreditCard, label: 'Số CCCD/CMND', value: member.idCard },
    { icon: Calendar, label: 'Ngày cấp', value: `${member.idIssueDate} tại ${member.idIssuePlace}` },
    { icon: User, label: 'Dân tộc / Tôn giáo', value: `${member.ethnicity} / ${member.religion}` },
    { icon: Briefcase, label: 'Nghề nghiệp', value: member.occupation },
    { icon: MapPin, label: 'Nơi làm việc', value: member.workplace },
    { icon: Home, label: 'Ngày đăng ký thường trú', value: member.registrationDate },
    { icon: MapPin, label: 'Địa chỉ cũ', value: member.previousAddress },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-primary">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-lg">{member.name}</DialogTitle>
              <Badge variant={member.role === 'Chủ hộ' ? 'default' : 'secondary'}>
                {member.role}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {fields.map((field, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"
            >
              <field.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{field.label}</p>
                <p className="text-sm font-medium text-foreground">{field.value}</p>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={onClose} className="mt-4 w-full" variant="gradient">
          Đóng
        </Button>
      </DialogContent>
    </Dialog>
  );
}
