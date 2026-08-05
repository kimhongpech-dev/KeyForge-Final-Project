import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import "./App.css";
import "./styles/chat.css";
import AuthProvider from "./context/AuthContext";
import ProductDetails from "./pages/ProductDetails";
import CartProvider from "./context/CartContext";
import AdminDashboard from "./pages/AdminDashboard";
import AdminMessages from "./pages/admin/AdminMessages";
import MyOrders from "./pages/MyOrders";
import ChatProvider from "./context/ChatContext";
import FloatingChatButton from "./components/chat/FloatingChatButton";
import ChatWindow from "./components/chat/ChatWindow";

function ChatLauncher() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
  return (
    <>
      <FloatingChatButton />
      <ChatWindow />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ChatProvider>
          <div className="app">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/messages" element={<AdminMessages />} />
              <Route path="/orders" element={<MyOrders />} />
            </Routes>
            <Footer />
            <ChatLauncher />
          </div>
        </ChatProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
