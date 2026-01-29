import { type ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-600 text-gray-200',
  success: 'bg-green-600 text-white',
  warning: 'bg-yellow-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-purple-600 text-white',
};

export default function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-1 
        text-sm font-medium rounded-full
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
