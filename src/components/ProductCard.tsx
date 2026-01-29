import { Package, Plus } from 'lucide-react';
import { Card, CardContent, Badge, QuantitySelector, Button } from './ui';
import { formatPrice } from '../hooks/useFormatPrice';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  cartQuantity: number;
  isAdding?: boolean;
  disabled?: boolean;
  onAddToCart: () => void;
  onUpdateQuantity: (newQuantity: number) => void;
}

export default function ProductCard({
  product,
  cartQuantity,
  isAdding = false,
  disabled = false,
  onAddToCart,
  onUpdateQuantity,
}: ProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const isInCart = cartQuantity > 0;

  return (
    <Card hoverable={!isOutOfStock} disabled={isOutOfStock}>
      <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center relative overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <Package className="w-20 h-20 text-gray-600" />
        )}
        {isInCart && (
          <Badge variant="info" className="absolute top-3 right-3">
            {cartQuantity} en carrito
          </Badge>
        )}
      </div>

      <CardContent>
        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-purple-400">
            {formatPrice(product.price_cents)}
          </span>
          <span className={`text-sm ${!isOutOfStock ? 'text-green-400' : 'text-red-400'}`}>
            {!isOutOfStock ? `${product.stock} disponibles` : 'Agotado'}
          </span>
        </div>

        {isInCart ? (
          <div className="flex items-center justify-center">
            <QuantitySelector
              quantity={cartQuantity}
              maxQuantity={product.stock}
              onIncrease={() => onUpdateQuantity(cartQuantity + 1)}
              onDecrease={() => onUpdateQuantity(cartQuantity - 1)}
              disabled={disabled}
            />
          </div>
        ) : (
          <Button
            variant={isOutOfStock ? 'secondary' : 'primary'}
            size="lg"
            loading={isAdding}
            disabled={isOutOfStock || disabled}
            onClick={onAddToCart}
            icon={!isAdding && <Plus className="w-5 h-5" />}
            className="w-full"
          >
            {isOutOfStock ? 'Agotado' : 'Agregar al carrito'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
