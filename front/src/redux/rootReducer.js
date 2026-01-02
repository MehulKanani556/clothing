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

export const rootReducer = combineReducers({
    adminDashboard: adminDashboardReducer,
    adminProducts: adminProductReducer,
    adminOrders: adminOrderReducer,
    offers: offerReducer,
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
});