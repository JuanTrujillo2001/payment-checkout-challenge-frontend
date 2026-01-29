import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export default function QuantitySelector({
  quantity,
  maxQuantity,
  onIncrease,
  onDecrease,
  disabled = false,
  size = 'md',
}: QuantitySelectorProps) {
  const buttonSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-base' : 'text-lg';

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onDecrease}
        disabled={disabled}
        className={`${buttonSize} bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50`}
        aria-label="Disminuir cantidad"
      >
        <Minus className={iconSize} />
      </button>
      <span className={`${textSize} font-semibold w-8 text-center`}>{quantity}</span>
      <button
        onClick={onIncrease}
        disabled={disabled || quantity >= maxQuantity}
        className={`${buttonSize} bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg flex items-center justify-center transition-colors`}
        aria-label="Aumentar cantidad"
      >
        <Plus className={iconSize} />
      </button>
    </div>
  );
}
