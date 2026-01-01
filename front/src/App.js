
import './App.css';
import { Provider } from 'react-redux';
import { configureStore } from './redux/Store';
import Header from './components/Header';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductDetails from './pages/ProductDetails';
import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import { PersistGate } from 'redux-persist/integration/react';
const { store, persistor } = configureStore();
window.persistor = persistor;
function App() {
  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetails />} />
        </Routes>
        <Footer />
        </PersistGate>
      </Provider>
    </>
  );
}

export default App;
