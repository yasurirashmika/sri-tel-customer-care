import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register.jsx';
import BillList from './components/Billing/BillList';
import BillDetails from './components/Billing/BillDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>Sri-Tel Customer Care</h1>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Billing Routes */}
        <Route path="/bills" element={<BillList />} />
        <Route path="/bills/:billId" element={<BillDetails />} />
      </Routes>
    </Router>
  );
}

export default App;