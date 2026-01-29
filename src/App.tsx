import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CheckoutProvider } from './context/CheckoutContext';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import OrderLookupPage from './pages/OrderLookupPage';

function App() {
  return (
    <CheckoutProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order-lookup" element={<OrderLookupPage />} />
        </Routes>
      </BrowserRouter>
    </CheckoutProvider>
  );
}

export default App;
