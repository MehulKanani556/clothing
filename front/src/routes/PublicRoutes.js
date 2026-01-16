
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PrivateRoutes from './PrivateRoutes';

// Pages
import Home from '../pages/Home';
import CategoryPage from '../pages/CategoryPage';
import ProductDetails from '../pages/ProductDetails';
import CartPage from '../pages/CartPage';
import WishlistPage from '../pages/WishlistPage';
import ProfilePage from '../pages/ProfilePage';
import ContactPage from '../pages/ContactPage';
import FAQPage from '../pages/FAQPage';
import AboutUsPage from '../pages/AboutUsPage';
import PaymentPage from '../pages/PaymentPage';
import PageManage from '../pages/PageManage';


const PublicRoutes = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/product/:slug" element={<ProductDetails />} />

        <Route element={<PrivateRoutes />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/checkout/payment" element={<PaymentPage />} />
        </Route>
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/terms-conditions" element={<PageManage />} />
        <Route path="/privacy-policy" element={<PageManage />} />
        <Route path="/refund-return-policy" element={<PageManage />} />
        <Route path="/shipping-policy" element={<PageManage />} />
        {/* Catch-all for Categories/Listings - Must be last */}
        <Route path="/:slug" element={<CategoryPage />} />
      </Routes>
      <Footer />
    </>
  );
};

export default PublicRoutes;
