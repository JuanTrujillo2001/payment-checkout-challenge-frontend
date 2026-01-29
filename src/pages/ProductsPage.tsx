import { useEffect, useState } from 'react';
import { getProducts } from '../services/api';
import { useCheckout } from '../context/CheckoutContext';
import { Header, ProductCard } from '../components';
import { Spinner, Button } from '../components/ui';
import type { Product } from '../types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingProduct, setAddingProduct] = useState<string | null>(null);
  const { cart, addToCart, updateQuantity, removeFromCart, cartLoading } = useCheckout();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError('Error al cargar los productos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const getCartQuantity = (productId: string): number => {
    const item = cart?.items.find((i: { product_id: string }) => i.product_id === productId);
    return item?.quantity || 0;
  };

  const handleAddToCart = async (product: Product) => {
    if (product.stock === 0) return;
    try {
      setAddingProduct(product.id);
      await addToCart(product.id, 1);
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setAddingProduct(null);
    }
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number, maxStock: number) => {
    try {
      if (newQuantity <= 0) {
        await removeFromCart(productId);
      } else if (newQuantity <= maxStock) {
        await updateQuantity(productId, newQuantity);
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-center">
          <p className="text-xl">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header cartItemsCount={cart?.items_count || 0} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-6">
          Productos disponibles ({products.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              cartQuantity={getCartQuantity(product.id)}
              isAdding={addingProduct === product.id}
              disabled={cartLoading}
              onAddToCart={() => handleAddToCart(product)}
              onUpdateQuantity={(qty) => handleUpdateQuantity(product.id, qty, product.stock)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
