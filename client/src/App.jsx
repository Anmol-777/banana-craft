import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import OurStory from './pages/OurStory';
import Innovations from './pages/Innovations';
import Contact from './pages/Contact';
import AdminApp from './admin/App';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PublicLayout() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/our-story" element={<OurStory />} />
        <Route path="/innovations" element={<Innovations />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
    </Routes>
  );
}