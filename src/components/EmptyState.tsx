import { type LucideIcon } from 'lucide-react';
import { Button } from './ui';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-400 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
