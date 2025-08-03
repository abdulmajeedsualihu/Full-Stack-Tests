import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import Login from './pages/Login';
import Navbar from './components/Navbar'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Farmers from './pages/Farmers';
import Register from './pages/Register';

<ToastContainer position="bottom-right" autoClose={3000} />

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/login" element={<Login />} />
        <Route path="/farmers" element={<Farmers />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}
export default App;