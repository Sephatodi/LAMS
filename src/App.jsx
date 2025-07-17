
import { lazy } from 'react';
import { useAuth } from './context/AuthContext';

// Lazy-loaded components
const LoginForm = lazy(() => import('./component/LoginForm'));
const AdminDashboard = lazy(() => import('./dashboard/AdminDashboard'));
const CitizenDashboard = lazy(() => import('./dashboard/CitizenDashboard'));
const StaffDashboard = lazy(() => import('./dashboard/StaffDashboard'));
const LandAllocationDashboard = lazy(() => import('./dashboard/LandAllocationDashboard'));
const PublicPortal = lazy(() => import('./component/PublicPortal'));
//const NotFound = lazy(() => import('./components/NotFound'));

function App() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // Determine dashboard based on user role
  const getDashboard = () => {
    if (!user?.role) return <Navigate to="/login" />;
    
    switch(user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'staff':
        return <StaffDashboard />;
      case 'citizen':
        return <CitizenDashboard />;
      default:
        return <Navigate to="/login" />;
    }
  };

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!isAuthenticated ? <LoginForm /> : <Navigate to="/" />} />
        <Route path="/public" element={<PublicPortal />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={isAuthenticated ? <MainLayout>{getDashboard()}</MainLayout> : <Navigate to="/login" />}
        >
          {/* Admin-specific routes */}
          <Route path="admin/*" element={<AdminDashboard />} />
          
          {/* Staff-specific routes */}
          <Route path="staff/*" element={<StaffDashboard />} />
          
          {/* Citizen-specific routes */}
          <Route path="citizen/*" element={<CitizenDashboard />} />
          
          {/* Common dashboard routes */}
          <Route index element={getDashboard()} />
          <Route path="land-allocation" element={<LandAllocationDashboard />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;