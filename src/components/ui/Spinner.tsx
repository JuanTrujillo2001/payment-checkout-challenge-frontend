interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-t-2 border-b-2 border-purple-500 ${sizeStyles[size]} ${className}`}
      role="status"
      aria-label="Cargando"
    />
  );
}
