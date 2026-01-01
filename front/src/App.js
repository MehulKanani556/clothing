
import './App.css';
import { Provider } from 'react-redux';
import { configureStore } from './redux/Store';
import Header from './components/Header';
import Home from './pages/Home';
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
        </Routes>
        <Footer />
      </Provider>
    </>
  );
}

export default App;
