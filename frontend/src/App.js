import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-layout">
        <nav className="sidebar">
          <div className="sidebar-logo">
            <span className="logo-icon">📦</span>
            <span className="logo-text">InvManager</span>
          </div>
          <ul className="nav-links">
            <li><NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Dashboard</NavLink></li>
            <li><NavLink to="/products" className={({ isActive }) => isActive ? "active" : ""}>Products</NavLink></li>
            <li><NavLink to="/customers" className={({ isActive }) => isActive ? "active" : ""}>Customers</NavLink></li>
            <li><NavLink to="/orders" className={({ isActive }) => isActive ? "active" : ""}>Orders</NavLink></li>
          </ul>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
