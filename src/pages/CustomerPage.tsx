import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, User } from 'lucide-react';
import { useCheckout } from '../context/CheckoutContext';

export default function CustomerPage() {
  const navigate = useNavigate();
  const { cart, customer, setCustomerData, setDeliveryData } = useCheckout();

  const [formData, setFormData] = useState({
    full_name: customer?.full_name || '',
    identity_document: customer?.identity_document?.toString() || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: '',
    city: '',
    country: 'Colombia',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!cart || cart.items.length === 0) {
    navigate('/');
    return null;
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) newErrors.full_name = 'Nombre requerido';
    if (!formData.identity_document.trim()) newErrors.identity_document = 'Documento requerido';
    if (!/^\d+$/.test(formData.identity_document)) newErrors.identity_document = 'Solo números';
    if (!formData.email.trim()) newErrors.email = 'Email requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.phone.trim()) newErrors.phone = 'Teléfono requerido';
    if (!formData.address.trim()) newErrors.address = 'Dirección requerida';
    if (!formData.city.trim()) newErrors.city = 'Ciudad requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setCustomerData({
      full_name: formData.full_name,
      identity_document: parseInt(formData.identity_document),
      email: formData.email,
      phone: formData.phone,
    });

    setDeliveryData({
      address: formData.address,
      city: formData.city,
      country: formData.country,
    });

    navigate('/checkout/summary');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al carrito
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Datos de contacto y envío</h1>
            <p className="text-gray-400 text-sm">Paso 1 de 3</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Información personal</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre completo</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-700 rounded-lg border ${
                    errors.full_name ? 'border-red-500' : 'border-gray-600'
                  } focus:border-purple-500 focus:outline-none`}
                  placeholder="Juan Pérez"
                />
                {errors.full_name && <p className="text-red-400 text-sm mt-1">{errors.full_name}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Documento de identidad</label>
                <input
                  type="text"
                  name="identity_document"
                  value={formData.identity_document}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-700 rounded-lg border ${
                    errors.identity_document ? 'border-red-500' : 'border-gray-600'
                  } focus:border-purple-500 focus:outline-none`}
                  placeholder="12345678"
                />
                {errors.identity_document && <p className="text-red-400 text-sm mt-1">{errors.identity_document}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-700 rounded-lg border ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  } focus:border-purple-500 focus:outline-none`}
                  placeholder="juan@email.com"
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-700 rounded-lg border ${
                    errors.phone ? 'border-red-500' : 'border-gray-600'
                  } focus:border-purple-500 focus:outline-none`}
                  placeholder="3001234567"
                />
                {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Dirección de envío</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Dirección</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-700 rounded-lg border ${
                    errors.address ? 'border-red-500' : 'border-gray-600'
                  } focus:border-purple-500 focus:outline-none`}
                  placeholder="Calle 123 #45-67, Apto 101"
                />
                {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Ciudad</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-700 rounded-lg border ${
                      errors.city ? 'border-red-500' : 'border-gray-600'
                    } focus:border-purple-500 focus:outline-none`}
                    placeholder="Bogotá"
                  />
                  {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">País</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    disabled
                    className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            Continuar al resumen
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </main>
    </div>
  );
}
