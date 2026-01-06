import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import BillList from './components/Billing/BillList';
import BillDetails from './components/Billing/BillDetails';
import ChatWidget from './components/Chat/ChatWidget.jsx';
import ServiceManagement from './components/Services/ServiceManagement.jsx';
import Payment from './components/Payment/PaymentForm.jsx';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Redirect root path to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* App Pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bills" element={<BillList />} />
        <Route path="/bills/:billId" element={<BillDetails />} />
        <Route path="/services" element={<ServiceManagement />} />
        <Route path="/payment/:billId" element={<Payment />} />

        {/* Catch-all → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* Show chat only when logged in */}
      {user && <ChatWidget />}
    </Router>
  );
}

export default App;
