import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { JobProvider } from './context/JobContext';
import { ThemeProvider } from './context/ThemeContext';
import Toast from './components/common/Toast';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import WorkerDashboard from './pages/WorkerDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import SponsorDashboard from './pages/SponsorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import JobDetails from './pages/JobDetails';
import JobCreate from './pages/JobCreate';
import JobDiscover from './pages/JobDiscover';
import ProfileView from './pages/ProfileView';
import EditProfile from './pages/EditProfile';
import Attendance from './pages/Attendance';
import EventManagement from './pages/EventManagement';
import EventFinancials from './pages/EventFinancials';
import EventsHero from './pages/EventsHero';
import CostEstimator from './pages/CostEstimator';
import ProfileSetup from './pages/ProfileSetup';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <JobProvider>
            <Toast />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route path="/profile-setup" element={
                <ProtectedRoute allowedRoles={['worker', 'organizer', 'sponsor', 'admin']}>
                  <ProfileSetup />
                </ProtectedRoute>
              } />

              <Route path="/profile/edit" element={
                <ProtectedRoute allowedRoles={['worker', 'organizer', 'sponsor', 'admin']}>
                  <EditProfile />
                </ProtectedRoute>
              } />

              <Route path="/worker" element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <WorkerDashboard />
                </ProtectedRoute>
              } />

              <Route path="/organizer" element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <OrganizerDashboard />
                </ProtectedRoute>
              } />

              <Route path="/sponsor" element={
                <ProtectedRoute allowedRoles={['sponsor']}>
                  <SponsorDashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/jobs/create" element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <JobCreate />
                </ProtectedRoute>
              } />

              <Route path="/jobs/discover" element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <JobDiscover />
                </ProtectedRoute>
              } />

              <Route path="/jobs/:id" element={
                <ProtectedRoute allowedRoles={['organizer', 'worker']}>
                  <JobDetails />
                </ProtectedRoute>
              } />

              <Route path="/profile/:id" element={
                <ProtectedRoute allowedRoles={['organizer', 'worker', 'admin']}>
                  <ProfileView />
                </ProtectedRoute>
              } />

              <Route path="/attendance/:jobId" element={
                <ProtectedRoute allowedRoles={['worker', 'organizer']}>
                  <Attendance />
                </ProtectedRoute>
              } />

              <Route path="/events" element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <EventManagement />
                </ProtectedRoute>
              } />

              <Route path="/events/:eventId/financials" element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <EventFinancials />
                </ProtectedRoute>
              } />

              <Route path="/events-hero" element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <EventsHero />
                </ProtectedRoute>
              } />

              <Route path="/cost-estimator" element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <CostEstimator />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </JobProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
