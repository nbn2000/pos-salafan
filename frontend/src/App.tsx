import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { useAppSelector } from '@/store/hooks';
import React, { Suspense, lazy, useEffect, useState } from 'react';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import PointOfSale from './_page/point-of-sale';

const RawMaterials = lazy(() => import('@/_page/raw-material/rawmaterials'));
const RawMaterialsBatches = lazy(
  () => import('@/_page/raw-material/raw-material-batches')
);
const ProductId = lazy(() => import('@/_page/products/products-id'));
const Home = lazy(() => import('@/_page/home'));
const Analytics = lazy(() => import('@/_page/analytics'));
const Sale = lazy(() => import('@/_page/sale'));
const Customer = lazy(() => import('@/_page/customers/customer'));
const Partners = lazy(() => import('@/_page/partners/partners'));
const PartnerId = lazy(() => import('@/_page/partners/partner-id'));
const CustomerId = lazy(() => import('@/_page/customers/customer-id'));
const Income = lazy(() => import('@/_page/income'));
const IncomeId = lazy(() => import('@/_page/income-id'));
const Product = lazy(() => import('@/_page/products/product'));
const RecordsId = lazy(() => import('@/_page/income-id'));
const ProductLogs = lazy(() => import('@/_page/inventory-logs'));
const Login = lazy(() => import('@/_page/login'));
const Register = lazy(() => import('@/_page/register'));
const RawMaterialLog = lazy(
  () => import('@/_page/raw-material/raw-material-log')
);

const Loader = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const PageLoader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full">
      <Suspense fallback={<Loader />}>{children}</Suspense>
    </div>
  );
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const auth = useAppSelector((state) => state.auth.token);
  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return <Loader />;
  }

  const isAuth = !!auth;

  return (
    <Router>
      <PageLoader>
        <Routes>
          {!isAuth ? (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/analytics/income" element={<Income />} />
              <Route path="/income" element={<Income />} />
              <Route path="/income/:id" element={<IncomeId />} />
              <Route path="/sale" element={<Sale />} />

              <Route
                path="/merchants/:id"
                element={
                  <ProtectedRoute requiresAdmin={true}>
                    <Income />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/merchants/:merchantId/:id"
                element={
                  <ProtectedRoute requiresAdmin={true}>
                    <IncomeId />
                  </ProtectedRoute>
                }
              />
              <Route path="/records" element={<Income />} />
              <Route path="/records/:id" element={<RecordsId />} />
              <Route path="/raw-materials" element={<RawMaterials />} />
              <Route path="/raw-materials-log" element={<RawMaterialLog />} />
              <Route
                path="/raw-materials/:id"
                element={<RawMaterialsBatches />}
              />
              <Route path="/products" element={<Product />} />
              <Route path="/products/:productId" element={<ProductId />} />
              <Route path="/product-logs" element={<ProductLogs />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/partners/:id" element={<PartnerId />} />
              <Route path="/customers" element={<Customer />} />
              <Route path="/customers/:id" element={<CustomerId />} />
              <Route path="/pointofsale" element={<PointOfSale />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </PageLoader>
    </Router>
  );
};

export default App;
