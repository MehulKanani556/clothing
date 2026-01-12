import './App.css';
import { Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'react-hot-toast';
import { configureStore } from './redux/Store';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductDetails from './pages/ProductDetails';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import AboutUsPage from './pages/AboutUsPage';

import AdminLayout from './admin/components/layout/AdminLayout';
import Dashboard from './admin/pages/dashboard/Dashboard';
import Products from './admin/pages/products/Products';
import Categories from './admin/pages/categories/Categories';
import Orders from './admin/pages/orders/Orders';
import OrderDetails from './admin/pages/orders/OrderDetails';
import OfferZone from './admin/pages/offerZone/OfferZone';
import Returns from './admin/pages/returns/Returns';
import GstReports from './admin/pages/gstReports/GstReports';
import SizeCharts from './admin/pages/sizeCharts/SizeCharts';
import Blogs from './admin/pages/blogs/Blogs';
import Payments from './admin/pages/payments/Payments';
import Support from './admin/pages/support/Support';
import Users from './admin/pages/users/Users';
import PricingRules from './admin/pages/pricingRules/PricingRules';
import TermsPage from './pages/TermsPage';
import PaymentPage from './pages/PaymentPage';
import CategoriesProduct from './admin/pages/categories/CategoriesProduct';
import ProductsDetails from './admin/pages/products/ProductsDetails';
import Reviews from './admin/pages/reviews/Reviews';
import ProductForm from './admin/pages/products/ProductForm';
import AdminProfile from './admin/pages/profile/AdminProfile';
import SubCategory from './admin/pages/categories/Subcategory';
import MainCategory from './admin/pages/categories/MainCategory';

const { store, persistor } = configureStore();
window.persistor = persistor;

function App() {
  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Toaster position="top-center" reverseOrder={false} />
          <Routes>
            <Route path="/*" element={
              <>
                <Header />
                <Routes>
                  <Route path="/" element={<Home />} />

                  <Route path="/product/:slug" element={<ProductDetails />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/about" element={<AboutUsPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/checkout/payment" element={<PaymentPage />} />
                  {/* Catch-all for Categories/Listings - Must be last */}
                  <Route path="/:slug" element={<CategoryPage />} />
                </Routes>
                <Footer />
              </>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="main-categories" element={<MainCategory />} />
              <Route path="categories" element={<Categories />} />
              <Route path="subcategories" element={<SubCategory />} />
              <Route path="categories/:id" element={<CategoriesProduct />} />
              <Route path="products" element={<Products />} />
              <Route path="add-product" element={<ProductForm />} />
              <Route path="product/edit/:id" element={<ProductForm />} />
              <Route path="products/:id" element={<ProductsDetails />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetails />} />
              <Route path="offer-zone" element={<OfferZone />} />
              <Route path="returns" element={<Returns />} />
              <Route path="users" element={<Users />} />
              <Route path="reports" element={<GstReports />} />
              <Route path="payments" element={<Payments />} />
              <Route path="size-charts" element={<SizeCharts />} />
              <Route path="blogs" element={<Blogs />} />
              <Route path="pricing-rules" element={<PricingRules />} />
              <Route path="support" element={<Support />} />
              <Route path="profile" element={<AdminProfile />} />
              {/* Fallback */}
              <Route index element={<Dashboard />} />
            </Route>

          </Routes>
        </PersistGate>
      </Provider >
    </>
  );
}

export default App;
