import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slice/auth.slice.js";
import productReducer from "./slice/product.slice.js";
import categoryReducer from "./slice/category.slice.js";
import cartReducer from "./slice/cart.slice.js";
import wishlistReducer from "./slice/wishlist.slice.js";
import adminDashboardReducer from "./slice/adminDashboardSlice.js";
import adminProductReducer from "./slice/adminProductSlice.js";
import adminOrderReducer from "./slice/adminOrderSlice.js";
import offerReducer from "./slice/offer.slice.js";
import returnReducer from "./slice/return.slice.js";
import blogReducer from "./slice/blog.slice.js";
import adminUserReducer from "./slice/adminUserSlice.js";
import reportReducer from "./slice/report.slice.js";
import supportReducer from "./slice/support.slice.js";
import settingsReducer from "./slice/settings.slice.js";
import paymentReducer from "./slice/payment.slice.js";
import reviewReducer from "./slice/review.slice.js";
import orderReducer from "./slice/order.slice.js";
import trackingReducer from "./slice/tracking.slice.js";
import deliveryReducer from "./slice/delivery.slice.js";
import bannerReducer from "./slice/banner.slice.js";
import adminHomeReducer from "./slice/adminHome.slice.js";
import heroBannerReducer from "./slice/heroBanner.slice.js";

export const rootReducer = combineReducers({
    adminDashboard: adminDashboardReducer,
    adminProducts: adminProductReducer,
    adminOrders: adminOrderReducer,
    offers: offerReducer,
    payment: paymentReducer,
    returns: returnReducer,
    blogs: blogReducer,
    adminUsers: adminUserReducer,
    reports: reportReducer,
    support: supportReducer,
    settings: settingsReducer,
    auth: authReducer,
    product: productReducer,
    category: categoryReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    review: reviewReducer,
    order: orderReducer,
    tracking: trackingReducer,
    delivery: deliveryReducer,
    banner: bannerReducer,
    adminHome: adminHomeReducer,
    heroBanner: heroBannerReducer
});