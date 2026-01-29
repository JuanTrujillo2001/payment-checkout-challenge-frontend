import { ShoppingBag, Trash2 } from 'lucide-react';
import { QuantitySelector } from './ui';
import { formatPrice } from '../hooks/useFormatPrice';
import type { CartItem as CartItemType } from '../types';

interface CartItemProps {
  item: CartItemType;
  disabled?: boolean;
  onUpdateQuantity: (newQuantity: number) => void;
  onRemove: () => void;
}

export default function CartItem({
  item,
  disabled = false,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  return (
    <div className="p-4 flex gap-4">
      <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.product_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ShoppingBag className="w-8 h-8 text-gray-500" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{item.product_name}</h3>
        <p className="text-gray-400 text-sm truncate">{item.product_description}</p>
        <p className="text-purple-400 font-semibold mt-1">
          {formatPrice(item.price_cents)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <button
          onClick={onRemove}
          disabled={disabled}
          className="text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
          aria-label="Eliminar del carrito"
        >
          <Trash2 className="w-5 h-5" />
        </button>

        <QuantitySelector
          quantity={item.quantity}
          maxQuantity={item.stock}
          onIncrease={() => onUpdateQuantity(item.quantity + 1)}
          onDecrease={() => onUpdateQuantity(item.quantity - 1)}
          disabled={disabled}
          size="sm"
        />

        <p className="text-sm text-gray-400">
          Subtotal:{' '}
          <span className="text-white font-semibold">
            {formatPrice(item.subtotal_cents)}
          </span>
        </p>
      </div>
    </div>
  );
}
