import { User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { HouseholdMember } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface MemberCardProps {
  member: HouseholdMember;
  onClick: () => void;
}

export function MemberCard({ member, onClick }: MemberCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-xl bg-card p-4 shadow-card transition-all hover:shadow-elevated hover:scale-[1.01] text-left"
    >
      <div className={cn(
        'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
        member.role === 'Chủ hộ' ? 'gradient-primary' : 'bg-accent'
      )}>
        <User className={cn('h-6 w-6', member.role === 'Chủ hộ' ? 'text-primary-foreground' : 'text-primary')} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-foreground truncate">{member.name}</p>
          <Badge variant={member.role === 'Chủ hộ' ? 'default' : 'secondary'} className="shrink-0">
            {member.role}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {member.dob} • {member.gender}
        </p>
      </div>
    </button>
  );
}
