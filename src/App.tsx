import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { GamesPage } from './pages/GamesPage';
import { GameDetailPage } from './pages/GameDetailPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { FAQPage } from './pages/FAQPage';
import { LegalPage } from './pages/LegalPage';

// Admin Routes
import { AdminLayout } from './admin/layouts/AdminLayout';
import { AdminProtectedRoute } from './admin/components/AdminProtectedRoute';
import { AdminDashboardPage } from './admin/pages/AdminDashboardPage';
import { AdminGamesPage } from './admin/pages/AdminGamesPage';
import { AdminProductsPage } from './admin/pages/AdminProductsPage';
import { AdminOrdersPage } from './admin/pages/AdminOrdersPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Storefront Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/games/:slug" element={<GameDetailPage />} />
            <Route path="/products/:slug" element={<GameDetailPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/order/:orderId" element={<TrackOrderPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<FAQPage />} />
            <Route path="/terms" element={<LegalPage />} />
            <Route path="/privacy" element={<LegalPage />} />
          </Route>

          {/* Admin Management Routes */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="games" element={<AdminGamesPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="settings" element={<Navigate to="/admin" replace />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
