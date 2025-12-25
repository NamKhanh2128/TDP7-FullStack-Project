import * as React from "react";
import { Badge } from './badge';

type Status = 'pending' | 'approved' | 'rejected' | 'success' | 'warning' | string;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  status: Status;
}

const statusLabel = (s: string) => {
  switch (s) {
    case 'pending':
      return 'Chờ duyệt';
    case 'approved':
      return 'Đã duyệt';
    case 'rejected':
      return 'Từ chối';
    case 'success':
      return 'Thành công';
    case 'warning':
      return 'Cảnh báo';
    default:
      return s.charAt(0).toUpperCase() + s.slice(1);
  }
};

export function StatusBadge({ status, className, ...props }: Props) {
  // Map status to badge variant when possible
  const variant = (['pending', 'approved', 'rejected', 'success', 'warning'] as string[]).includes(status)
    ? (status as any)
    : 'default';

  return (
    <Badge variant={variant as any} className={className} {...props}>
      {statusLabel(status)}
    </Badge>
  );
}

export default StatusBadge;
