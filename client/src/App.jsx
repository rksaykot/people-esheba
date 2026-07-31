import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import MainLayout  from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public pages
import Home         from './pages/Home';
import Login        from './pages/auth/Login';
import Register     from './pages/auth/Register';
import Emergency    from './pages/Emergency';
import Blood        from './pages/Blood';
import Donation     from './pages/Donation';
import DonationNew  from './pages/DonationNew';
import DonationDetail from './pages/DonationDetail';
import Jobs         from './pages/Jobs';
import JobDetail    from './pages/JobDetail';
import JobNew       from './pages/JobNew';
import Volunteers   from './pages/Volunteers';
import MapPage      from './pages/MapPage';
import Profile      from './pages/Profile';
import NotFound     from './pages/NotFound';

// New pages
import Health       from './pages/Health';
import Education    from './pages/Education';
import Services     from './pages/Services';
import Notices      from './pages/Notices';
import Government   from './pages/Government';
import Doctors      from './pages/Doctors';
import Pharmacy     from './pages/Pharmacy';
import GovtJobs     from './pages/GovtJobs';
import FullTimeJobs from './pages/FullTimeJobs';
import RemoteJobs   from './pages/RemoteJobs';
import School       from './pages/School';
import College      from './pages/College';
import University   from './pages/University';
import Scholarships from './pages/Scholarships';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Help from './pages/Help';
import EducationDetail from './pages/EducationDetail';
import DirectoryDetail from './pages/DirectoryDetail';

// Admin pages
import AdminDashboard    from './pages/admin/AdminDashboard';
import AdminUsers        from './pages/admin/AdminUsers';
import AdminDonations    from './pages/admin/AdminDonations';
import AdminJobs         from './pages/admin/AdminJobs';
import AdminBlood        from './pages/admin/AdminBlood';
import AdminVolunteers   from './pages/admin/AdminVolunteers';
import AdminEmergency    from './pages/admin/AdminEmergency';
import AdminDirectory    from './pages/admin/AdminDirectory';
import AdminReports      from './pages/admin/AdminReports';
import AdminAnalytics    from './pages/admin/AdminAnalytics';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminDoctors      from './pages/admin/AdminDoctors';
import AdminPharmacy     from './pages/admin/AdminPharmacy';
import AdminNotices      from './pages/admin/AdminNotices';
import AdminEducation    from './pages/admin/AdminEducation';
import AdminScholarships from './pages/admin/AdminScholarships';
import AdminSettings     from './pages/admin/AdminSettings';
import AdminLogs         from './pages/admin/AdminLogs';

// AI Chatbot (floating)
import AIChatbot from './components/ui/AIChatbot';
import BackToTop from './components/ui/BackToTop';

/* ── Route guards ──────────────────────────────────────────── */
const PrivateRoute = ({ children }) => {
  const { isAuth, loading } = useAuth();
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh' }}><div className="spinner"/></div>;
  return isAuth ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuth, isAdmin, loading } = useAuth();
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh' }}><div className="spinner"/></div>;
  if (!isAuth)  return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuth } = useAuth();
  return isAuth ? <Navigate to="/" replace /> : children;
};

function AppRoutes() {
  return (
    <>
      <Routes>
        {/* ── Public routes ─────────────────────────────── */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />

          {/* Existing */}
          <Route path="emergency"      element={<Emergency />} />
          <Route path="blood"          element={<Blood />} />
          <Route path="donation"       element={<Donation />} />
          <Route path="donation/new"   element={<PrivateRoute><DonationNew /></PrivateRoute>} />
          <Route path="donation/:id"   element={<DonationDetail />} />
          <Route path="jobs"           element={<Jobs />} />
          <Route path="jobs/new"       element={<PrivateRoute><JobNew /></PrivateRoute>} />
          <Route path="jobs/:id"       element={<JobDetail />} />
          <Route path="volunteers"     element={<Volunteers />} />
          <Route path="map"            element={<MapPage />} />
          <Route path="profile"        element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* New pages */}
          <Route path="health"         element={<Health />} />
          <Route path="directory/:id"  element={<DirectoryDetail />} />
          <Route path="education"      element={<Education />} />
          <Route path="education/:id"  element={<EducationDetail />} />
          <Route path="services"       element={<Services />} />
          <Route path="notices"        element={<Notices />} />
          <Route path="government"     element={<Government />} />
          <Route path="doctors"        element={<Doctors />} />
          <Route path="pharmacy"       element={<Pharmacy />} />
          <Route path="jobs/govt"      element={<GovtJobs />} />
          <Route path="jobs/fulltime"  element={<FullTimeJobs />} />
          <Route path="jobs/remote"    element={<RemoteJobs />} />
          <Route path="education/school"      element={<School />} />
          <Route path="education/college"     element={<College />} />
          <Route path="education/university"  element={<University />} />
          <Route path="education/scholarships" element={<Scholarships />} />
          <Route path="contact"        element={<Contact />} />
          <Route path="privacy"        element={<Privacy />} />
          <Route path="terms"          element={<Terms />} />
          <Route path="help"           element={<Help />} />

          <Route path="*"              element={<NotFound />} />
        </Route>

        {/* ── Auth routes ────────────────────────────────── */}
        <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* ── Admin routes ───────────────────────────────── */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index                 element={<AdminDashboard />} />
          <Route path="users"          element={<AdminUsers />} />
          <Route path="donations"      element={<AdminDonations />} />
          <Route path="jobs"           element={<AdminJobs />} />
          <Route path="blood"          element={<AdminBlood />} />
          <Route path="volunteers"     element={<AdminVolunteers />} />
          <Route path="emergency"      element={<AdminEmergency />} />
          <Route path="directory"      element={<AdminDirectory />} />
          <Route path="hospitals"      element={<AdminDirectory fixedCategory="hospital" />} />
          <Route path="services"       element={<AdminDirectory fixedCategory="service" />} />
          <Route path="government"     element={<AdminDirectory fixedCategory="government" />} />
          <Route path="reports"        element={<AdminReports />} />
          <Route path="analytics"      element={<AdminAnalytics />} />
          <Route path="notifications"  element={<AdminNotifications />} />
          {/* New content management pages */}
          <Route path="doctors"        element={<AdminDoctors />} />
          <Route path="pharmacy"       element={<AdminPharmacy />} />
          <Route path="notices"        element={<AdminNotices />} />
          <Route path="education"      element={<AdminEducation />} />
          <Route path="scholarships"   element={<AdminScholarships />} />
          <Route path="settings"       element={<AdminSettings />} />
          <Route path="logs"           element={<AdminLogs />} />
        </Route>
      </Routes>

      <AIChatbot />
      <BackToTop />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#162032',
                  color: '#F0F4FF',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                },
                success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
                error:   { iconTheme: { primary: '#E63946', secondary: '#fff' } },
              }}
            />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
