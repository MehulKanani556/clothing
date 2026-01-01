
import './App.css';
import { Provider } from 'react-redux';
import { configureStore } from './redux/Store';
import Header from './components/Header';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductDetails from './pages/ProductDetails';
import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
const { store } = configureStore();
function App() {
  return (
    <>
      <Provider store={store}>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetails />} />
        </Routes>
        <Footer />
      </Provider>
    </>
  );
}

export default App;
