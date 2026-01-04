import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
  // 2. Get the current user status
  const { user } = useAuth(); 

  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>Sri-Tel Customer Care</h1>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Protected Routes (Optional: You can wrap these in a ProtectedRoute component later) */}
        <Route path="/bills" element={<BillList />} />
        <Route path="/bills/:billId" element={<BillDetails />} />
        <Route path="/services" element={<ServiceManagement />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
      
      {/* 3. Only show ChatWidget if user is logged in */}
      {user && <ChatWidget />}
      
    </Router>
  );
}

export default App;