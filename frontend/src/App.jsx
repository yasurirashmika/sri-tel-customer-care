import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BillList from './components/Billing/BillList';
import BillDetails from './components/Billing/BillDetails';

function App() {
  return (
    <Router>
      <Routes>
        {/* Home Route */}
        <Route path="/" element={<h1>Sri-Tel Customer Care</h1>} />
        
        {/* Billing Routes */}
        <Route path="/bills" element={<BillList />} />
        <Route path="/bills/:billId" element={<BillDetails />} />
      </Routes>
    </Router>
  );
}

export default App;