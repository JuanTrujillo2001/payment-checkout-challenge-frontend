import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, Search } from 'lucide-react';
import { Badge } from './ui';

interface HeaderProps {
  cartItemsCount?: number;
  showBackButton?: boolean;
  backTo?: string;
  backLabel?: string;
}

export default function Header({
  cartItemsCount = 0,
  showBackButton = false,
  backTo = '/',
  backLabel = 'Volver',
}: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <button
                onClick={() => navigate(backTo)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <span>←</span>
                <span>{backLabel}</span>
              </button>
            ) : (
              <>
                <Package className="w-8 h-8 text-purple-500" />
                <div>
                  <h1 className="text-xl font-bold">Pulsar Gaming Store</h1>
                  <p className="text-gray-400 text-sm">Los mejores mouse para gaming</p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/order-lookup')}
              className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-2 transition-colors"
              title="Consultar pedido"
            >
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline">Mi pedido</span>
            </button>

            <button
              onClick={() => navigate('/cart')}
              className="relative flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">Carrito</span>
              {cartItemsCount > 0 && (
                <Badge
                  variant="error"
                  className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center p-0"
                >
                  {cartItemsCount}
                </Badge>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
