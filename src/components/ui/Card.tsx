import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  disabled?: boolean;
}

export default function Card({
  children,
  className = '',
  hoverable = false,
  disabled = false,
}: CardProps) {
  return (
    <div
      className={`
        bg-gray-800 rounded-xl border border-gray-700
        ${hoverable && !disabled ? 'hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20' : ''}
        ${disabled ? 'opacity-60' : ''}
        transition-all
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`p-4 border-b border-gray-700 ${className}`}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
