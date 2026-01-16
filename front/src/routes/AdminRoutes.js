
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminLayout from '../admin/components/layout/AdminLayout';

// Admin Pages
import Dashboard from '../admin/pages/dashboard/Dashboard';
import Products from '../admin/pages/products/Products';
import Categories from '../admin/pages/categories/Categories';
import Orders from '../admin/pages/orders/Orders';
import OrderDetails from '../admin/pages/orders/OrderDetails';
import OfferZone from '../admin/pages/offerZone/OfferZone';
import Returns from '../admin/pages/returns/Returns';
import GstReports from '../admin/pages/gstReports/GstReports';
import SizeCharts from '../admin/pages/sizeCharts/SizeCharts';
import Blogs from '../admin/pages/blogs/Blogs';
import Payments from '../admin/pages/payments/Payments';
import Support from '../admin/pages/support/Support';
import Users from '../admin/pages/users/Users';
import PricingRules from '../admin/pages/pricingRules/PricingRules';
import CategoriesProduct from '../admin/pages/categories/CategoriesProduct';
import ProductsDetails from '../admin/pages/products/ProductsDetails';
import Reviews from '../admin/pages/reviews/Reviews';
import ProductForm from '../admin/pages/products/ProductForm';
import AdminProfile from '../admin/pages/profile/AdminProfile';
import SubCategory from '../admin/pages/categories/Subcategory';
import OfferForm from '../admin/pages/offerZone/OfferForm';
import HomePreview from '../admin/pages/preview/HomePreview';
import MainCategory from '../admin/pages/categories/MainCategory';
import OfferBanner from '../admin/pages/banners/OfferBanner';
import HeroBanner from '../admin/pages/banners/HeroBanner';
import Settings from '../admin/pages/settings/Settings';
import Maintenance from '../admin/pages/settings/Maintenance';
import PrivacyPolicy from '../admin/pages/page-management/PrivacyPolicy';

const AdminRoutes = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    // If not authenticated, redirect to home
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // If authenticated but not admin, redirect to home
    if (user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // If admin, render the admin routes
    return (
        <Routes>
            <Route path="/" element={<AdminLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="offer-banner" element={<OfferBanner />} />
                <Route path="hero-banner" element={<HeroBanner />} />
                <Route path="home-preview" element={<HomePreview />} />
                <Route path="products" element={<Products />} />
                <Route path="add-product" element={<ProductForm />} />
                <Route path="product/edit/:id" element={<ProductForm />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="products/:id" element={<ProductsDetails />} />
                <Route path="main-categories" element={<MainCategory />} />
                <Route path="categories" element={<Categories />} />
                <Route path="subcategories" element={<SubCategory />} />
                <Route path="categories/:id" element={<CategoriesProduct />} />
                <Route path="orders" element={<Orders />} />
                <Route path="orders/:id" element={<OrderDetails />} />
                <Route path="offers" element={<OfferZone />} />
                <Route path="add-offer" element={<OfferForm />} />
                <Route path="offer/edit/:id" element={<OfferForm />} />
                <Route path="returns" element={<Returns />} />
                <Route path="users" element={<Users />} />
                <Route path="reports" element={<GstReports />} />
                <Route path="payments" element={<Payments />} />
                <Route path="size-charts" element={<SizeCharts />} />
                <Route path="blogs" element={<Blogs />} />
                <Route path="pricing-rules" element={<PricingRules />} />
                <Route path="support" element={<Support />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="maintenance" element={<Maintenance />} />
                <Route path="privacy-policy" element={<PrivacyPolicy />} />
                <Route path="terms-conditions" element={<PrivacyPolicy />} />
                <Route path="refund-return-policy" element={<PrivacyPolicy />} />
                <Route path="shipping-policy" element={<PrivacyPolicy />} />
                {/* Fallback */}
                <Route index element={<Dashboard />} />
            </Route>
        </Routes>
    );
};

export default AdminRoutes;
