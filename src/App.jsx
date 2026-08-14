import React from 'react';
import { ToastProvider, StoreProvider, RouteProvider, useStore, useRoute } from './contexts';
import LoadingScreen from './storefront/LoadingScreen';

// Storefront
import PhoneShell from './storefront/PhoneShell';
import HomeScreen from './storefront/HomeScreen';
import CategoryScreen from './storefront/CategoryScreen';
import ProductDetailScreen from './storefront/ProductDetailScreen';
import CartScreen from './storefront/CartScreen';
import CheckoutScreen from './storefront/CheckoutScreen';
import OrderSuccessScreen from './storefront/OrderSuccessScreen';
import OrdersScreen from './storefront/OrdersScreen';
import WishlistScreen from './storefront/WishlistScreen';

// Admin
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminOrders from './admin/AdminOrders';
import AdminProducts from './admin/AdminProducts';
import AdminStock from './admin/AdminStock';
import AdminCategories from './admin/AdminCategories';
import AdminBanners from './admin/AdminBanners';
import AdminSettings from './admin/AdminSettings';

function Router() {
  const { route } = useRoute();
  const { adminAuth, loading, loadingMsg } = useStore();

  if (loading) return <LoadingScreen message={loadingMsg} />;

  // Admin routes
  if (route.name === 'admin') return <AdminLogin/>;
  if (route.name.startsWith('admin')) {
    if (!adminAuth) return <AdminLogin/>;
    if (route.name === 'adminDashboard')   return <AdminDashboard/>;
    if (route.name === 'adminOrders')      return <AdminOrders/>;
    if (route.name === 'adminProducts')    return <AdminProducts/>;
    if (route.name === 'adminStock')       return <AdminStock/>;
    if (route.name === 'adminCategories')  return <AdminCategories/>;
    if (route.name === 'adminBanners')     return <AdminBanners/>;
    if (route.name === 'adminSettings')    return <AdminSettings/>;
  }

  // Storefront routes (wrapped in phone shell)
  return (
    <PhoneShell>
      {route.name === 'home'         && <HomeScreen/>}
      {(route.name === 'category' || route.name === 'search') && <CategoryScreen/>}
      {route.name === 'product'      && <ProductDetailScreen/>}
      {route.name === 'cart'         && <CartScreen/>}
      {route.name === 'checkout'     && <CheckoutScreen/>}
      {route.name === 'orderSuccess' && <OrderSuccessScreen/>}
      {route.name === 'orders'       && <OrdersScreen/>}
      {route.name === 'wishlist'     && <WishlistScreen/>}
    </PhoneShell>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <StoreProvider>
        <RouteProvider>
          <Router/>
        </RouteProvider>
      </StoreProvider>
    </ToastProvider>
  );
}
