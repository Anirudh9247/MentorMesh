import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import MentorProfile from './pages/MentorProfile';
import MentorDashboard from './pages/MentorDashboard';
import DesignShowcase from './pages/DesignShowcase';
import StudentDashboard from './pages/StudentDashboard';
import ResultsShowcase from './pages/ResultsShowcase';
import Conversation from './pages/Conversation';

// Route guard to restrict access by authentication and roles
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  let user;
  try {
    user = JSON.parse(userStr);
  } catch {
    return <Navigate to="/login" replace />;
  }

  if (!user?.role || (allowedRole && user.role !== allowedRole)) {
    return <Navigate to={user?.role === 'mentor' ? '/mentor-dashboard' : '/browse'} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Landing & Auth routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/design" element={<DesignShowcase />} />
        
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
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/results" 
          element={
            <ProtectedRoute allowedRole="student">
              <ResultsShowcase />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute allowedRole="student">
              <Conversation />
            </ProtectedRoute>
          } 
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
