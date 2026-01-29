# Pulsar Gaming Store - Frontend

Tienda de productos gaming con integración de pagos Wompi. SPA moderna construida con React 19 y TypeScript.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)
![Coverage](https://img.shields.io/badge/Coverage-82%25-brightgreen)

## ✨ Características

- **Catálogo de productos** con imágenes, precios y stock en tiempo real
- **Carrito de compras** persistente por sesión
- **Checkout completo** con datos de cliente, envío y pago
- **Integración Wompi** para procesamiento de pagos con tarjeta
- **Consulta de pedidos** por referencia de transacción
- **Diseño responsive** mobile-first con tema oscuro

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 19 | UI Framework |
| TypeScript | 5.9 | Tipado estático |
| Vite | 7 | Build tool |
| TailwindCSS | 4 | Estilos |
| React Router | 7 | Navegación SPA |
| Axios | 1.13 | Cliente HTTP |
| Lucide React | 0.563 | Iconografía |
| Vitest | 4 | Testing |

## 📁 Estructura del Proyecto

```
src/
├── components/              # Componentes React
│   ├── ui/                  # Componentes UI reutilizables
│   │   ├── Button.tsx       # Botón con variantes, loading e iconos
│   │   ├── Input.tsx        # Input con label y validación
│   │   ├── Card.tsx         # Card con header y content
│   │   ├── Badge.tsx        # Badge con variantes de color
│   │   ├── Spinner.tsx      # Indicador de carga animado
│   │   ├── QuantitySelector.tsx  # Selector +/- de cantidad
│   │   └── index.ts         # Barrel export
│   ├── ProductCard.tsx      # Tarjeta de producto con imagen
│   ├── CartItem.tsx         # Item del carrito con controles
│   ├── OrderSummary.tsx     # Resumen del pedido
│   ├── Header.tsx           # Header con navegación y carrito
│   ├── EmptyState.tsx       # Estado vacío con acción
│   ├── PaymentModal.tsx     # Modal de checkout multi-paso
│   ├── ResultModal.tsx      # Modal de resultado de pago
│   └── index.ts             # Barrel export
├── context/
│   └── CheckoutContext.tsx  # Estado global (carrito, sesión)
├── hooks/
│   └── useFormatPrice.ts    # Formateo de precios COP
├── pages/
│   ├── ProductsPage.tsx     # Catálogo de productos
│   ├── CartPage.tsx         # Carrito y checkout
│   └── OrderLookupPage.tsx  # Consulta de pedidos
├── services/
│   └── api.ts               # Cliente API con Axios
├── types/
│   └── index.ts             # Interfaces TypeScript
└── __tests__/               # Tests unitarios
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- npm 9+
- Backend corriendo en `http://localhost:4567`

### Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd wompi-challenge-frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar VITE_API_URL si es necesario

# Iniciar en modo desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | Linter ESLint |
| `npm test` | Ejecutar tests |
| `npm run test:coverage` | Tests con reporte de cobertura |
| `npm run test:watch` | Tests en modo watch |

## 🧪 Testing

### Ejecutar Tests

```bash
# Tests unitarios
npm test

# Con cobertura detallada
npm run test:coverage

# Modo watch (desarrollo)
npm run test:watch
```

### Cobertura Actual

```
✓ 86 tests passed
Coverage: 82.47% lines | 87.67% branches
```

| Suite | Tests | Cobertura |
|-------|-------|-----------|
| CheckoutContext | 9 | 81% |
| ResultModal | 11 | 97% |
| PaymentModal | 23 | 95% |
| ProductsPage | 11 | 72% |
| CartPage | 19 | 47% |
| OrderLookupPage | 13 | 92% |

## 📱 Diseño Responsive

- **Mobile-first**: Diseñado para iPhone SE (375px) en adelante
- **Breakpoints**: `sm:640px` | `md:768px` | `lg:1024px`
- **Grid adaptable**: 1 col (mobile) → 2-3 cols (desktop)
- **Touch-friendly**: Botones mínimo 44x44px
- **Modales scrollables**: `max-h-[90vh]` con overflow

## 🔧 Configuración

### Variables de Entorno

```env
# URL del backend API
VITE_API_URL=http://localhost:4567
```

### Tarjetas de Prueba (Sandbox Wompi)

| Número | Tipo | Resultado |
|--------|------|-----------|
| `4242 4242 4242 4242` | Visa | ✅ Aprobada |
| `4111 1111 1111 1111` | Visa | ✅ Aprobada |
| `4012 8888 8888 1881` | Visa | ❌ Rechazada |

> CVC: cualquier 3 dígitos | Fecha: cualquier fecha futura

## 🚀 Despliegue

```bash
# Build de producción
npm run build

# Los archivos se generan en dist/
```

Compatible con cualquier hosting estático (Vercel, S3+CloudFront, etc.)

## 🚀 Despliegue en AWS S3 + CloudFront

```bash
# Build de producción
npm run build

# Subir a S3
aws s3 sync dist/ s3://tu-bucket --delete

# Invalidar caché de CloudFront
aws cloudfront create-invalidation --distribution-id TU-DISTRIBUTION-ID --paths "/*"
```

Configuración recomendada:
- **S3**: Static website hosting con index.html
- **CloudFront**: Redirección 404 a /index.html (para SPA routing)
- **CI/CD**: GitHub Actions para deploy automático