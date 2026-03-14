import { ProjectStatus } from '@/types';
import { CheckCircle, Clock, Loader2, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ProjectStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    draft: { icon: Clock, label: 'Draft', className: 'bg-gray-100 text-gray-800' },
    processing: { icon: Loader2, label: 'Processing', className: 'bg-blue-100 text-blue-800' },
    completed: { icon: CheckCircle, label: 'Completed', className: 'bg-green-100 text-green-800' },
    failed: { icon: XCircle, label: 'Failed', className: 'bg-red-100 text-red-800' },
  };

  const { icon: Icon, label, className } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${className}`}
    >
      <Icon className={status === 'processing' ? 'h-3 w-3 animate-spin' : 'h-3 w-3'} />
      {label}
    </span>
  );
}
