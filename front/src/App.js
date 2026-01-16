
import './App.css';
import { Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'react-hot-toast';
import { configureStore } from './redux/Store';
import MaintenanceWrapper from './components/MaintenanceWrapper';
import MaintenancePage from './pages/MaintenancePage';
import PublicRoutes from './routes/PublicRoutes';
import AdminRoutes from './routes/AdminRoutes';

const { store, persistor } = configureStore();
window.persistor = persistor;

function App() {
  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Toaster position="top-center" />
          <MaintenanceWrapper>
            <Routes>
              <Route path="/maintenance" element={<MaintenancePage />} />

              {/* Admin Routes */}
              <Route path="/admin/*" element={<AdminRoutes />} />

              {/* Public Routes */}
              <Route path="/*" element={<PublicRoutes />} />
            </Routes>
          </MaintenanceWrapper>
        </PersistGate>
      </Provider >
    </>
  );
}

export default App;
