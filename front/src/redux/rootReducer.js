import { combineReducers } from "redux";
import authReducer from "./slice/auth.slice.js";
import productReducer from "./slice/product.slice.js";
import categoryReducer from "./slice/category.slice.js";
import cartReducer from "./slice/cart.slice.js";
import wishlistReducer from "./slice/wishlist.slice.js";

export const rootReducer = combineReducers({
    auth: authReducer,
    product: productReducer,
    category: categoryReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
});