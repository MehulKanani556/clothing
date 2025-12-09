
import './App.css';
import { Provider } from 'react-redux';
import { configureStore } from './redux/Store';
import Header from './components/Header';
const { store } = configureStore();
function App() {
  return (
    <>
      <Provider store={store}>

        <Header />
      </Provider>
    </>
  );
}

export default App;
