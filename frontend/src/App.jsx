import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import MentorProfile from './pages/MentorProfile';
import MentorDashboard from './pages/MentorDashboard';

// Simple check to enforce route protection
// Day 2 Client Session helper
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);
  if (allowedRole && user.role !== allowedRole) {
    // If student tries to visit mentor dashboard or vice versa
    return <Navigate to={user.role === 'mentor' ? '/mentor-dashboard' : '/browse'} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Student routes */}
        <Route 
          path="/browse" 
          element={
            <ProtectedRoute allowedRole="student">
              <Browse />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mentor/:id" 
          element={
            <ProtectedRoute allowedRole="student">
              <MentorProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student-dashboard" 
          element={<Navigate to="/browse" replace />} 
        />
        
        {/* Protected Mentor routes */}
        <Route 
          path="/mentor-dashboard" 
          element={
            <ProtectedRoute allowedRole="mentor">
              <MentorDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all fallback redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
