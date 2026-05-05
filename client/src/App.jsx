import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ExplorePage from './pages/ExplorePage';
import EventDetailPage from './pages/EventDetailPage';
import CreateEventPage from './pages/CreateEventPage';
import AuthPage from './pages/AuthPage';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <div className="ef-spinner"></div>;
  return isLoggedIn ? children : <Navigate to="/auth" replace />;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"         element={<ExplorePage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/auth"     element={<AuthPage />} />
        <Route path="/create"   element={
          <ProtectedRoute>
            <CreateEventPage />
          </ProtectedRoute>
        } />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
