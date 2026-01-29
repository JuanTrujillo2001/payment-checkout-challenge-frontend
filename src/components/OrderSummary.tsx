import { Card, CardContent } from './ui';
import { formatPrice } from '../hooks/useFormatPrice';

interface OrderSummaryProps {
  itemsCount: number;
  subtotalCents: number;
  baseFeeCents: number;
  deliveryFeeCents: number;
  totalCents: number;
}

export default function OrderSummary({
  itemsCount,
  subtotalCents,
  baseFeeCents,
  deliveryFeeCents,
  totalCents,
}: OrderSummaryProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Resumen del pedido</h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-gray-300">
            <span>Subtotal ({itemsCount} {itemsCount === 1 ? 'item' : 'items'})</span>
            <span>{formatPrice(subtotalCents)}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Tarifa base</span>
            <span>{formatPrice(baseFeeCents)}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Envío</span>
            <span>{formatPrice(deliveryFeeCents)}</span>
          </div>
          <div className="border-t border-gray-700 pt-3 flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-purple-400">{formatPrice(totalCents)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
