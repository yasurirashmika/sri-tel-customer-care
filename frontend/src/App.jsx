import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        {/* We will add your Login and Dashboard routes here later */}
        <Route path="/" element={<h1>Sri-Tel Customer Care</h1>} />
      </Routes>
    </Router>
  );
}

export default App;