import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollToTop from '@/components/ScrollToTop';
import ErrorFallback from '@/components/ErrorFallback';
import NotFound from '@/pages/NotFound';
import { Skeleton } from '@/components/Skeleton';

// Public
import PublicLayout from '@/layouts/PublicLayout';
import Home from '@/pages/public/Home';
import Services from '@/pages/public/Services';
import Pricing from '@/pages/public/Pricing';
import Portfolio from '@/pages/public/Portfolio';
import About from '@/pages/public/About';
import Contact from '@/pages/public/Contact';
import ServiceDetail from '@/pages/public/ServiceDetail';
import Terms from '@/pages/public/legal/Terms';
import Privacy from '@/pages/public/legal/Privacy';
import Refund from '@/pages/public/legal/Refund';

// Auth
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

// Payment (lazy — only loaded when user reaches checkout)
const PaymentCheckout = lazy(() => import('@/pages/payment/Checkout'));
const PaymentSuccess = lazy(() => import('@/pages/payment/Success'));
const PaymentFailure = lazy(() => import('@/pages/payment/Failure'));
const PaymentReturn = lazy(() => import('@/pages/payment/Return'));

// Chat
const ChatPage = lazy(() => import('@/pages/chat/ChatPage'));

// Dashboard layout
import DashboardLayout from '@/layouts/DashboardLayout';

// Admin (lazy — public visitors never need these)
const AdminDashboard = lazy(() => import('@/dashboards/admin/AdminDashboard'));
const UsersList = lazy(() => import('@/dashboards/admin/UsersList'));
const UserForm = lazy(() => import('@/dashboards/admin/UserForm'));
const ProjectsList = lazy(() => import('@/dashboards/admin/ProjectsList'));
const ProjectForm = lazy(() => import('@/dashboards/admin/ProjectForm'));
const AdminPaymentsList = lazy(() => import('@/dashboards/admin/AdminPaymentsList'));
const AdminInvoicesList = lazy(() => import('@/dashboards/admin/AdminInvoicesList'));
const InvoiceForm = lazy(() => import('@/dashboards/admin/InvoiceForm'));
const PackagesList = lazy(() => import('@/dashboards/admin/PackagesList'));
const LeadsList = lazy(() => import('@/dashboards/admin/LeadsList'));
const LeadDetail = lazy(() => import('@/dashboards/admin/LeadDetail'));
const AdminOrdersList = lazy(() => import('@/dashboards/admin/AdminOrdersList'));
const AdminOrderDetail = lazy(() => import('@/dashboards/admin/AdminOrderDetail'));
const AdminSettings = lazy(() => import('@/dashboards/admin/AdminSettings'));
const AddonsList = lazy(() => import('@/dashboards/admin/AddonsList'));
const BundlesList = lazy(() => import('@/dashboards/admin/BundlesList'));
const CouponsList = lazy(() => import('@/dashboards/admin/CouponsList'));

// Developer
const DeveloperDashboard = lazy(() => import('@/dashboards/developer/DeveloperDashboard'));
const DevProjectsList = lazy(() => import('@/dashboards/developer/DevProjectsList'));
const TasksKanban = lazy(() => import('@/dashboards/developer/TasksKanban'));

// User
const UserDashboard = lazy(() => import('@/dashboards/user/UserDashboard'));
const UserProjectsList = lazy(() => import('@/dashboards/user/UserProjectsList'));
const UserNewProject = lazy(() => import('@/dashboards/user/UserNewProject'));
const NewProjectChoice = lazy(() => import('@/pages/projects/NewProjectChoice'));
const OrderWizard = lazy(() => import('@/pages/projects/order-wizard/OrderWizard'));
const UserOrdersList = lazy(() => import('@/pages/projects/UserOrdersList'));
const OrderDetail = lazy(() => import('@/pages/projects/OrderDetail'));
const QuoteWizard = lazy(() => import('@/pages/projects/quote-wizard/QuoteWizard'));
const QuotesList = lazy(() => import('@/pages/projects/QuotesList'));
const QuoteDetail = lazy(() => import('@/pages/projects/QuoteDetail'));
const UserInvoicesList = lazy(() => import('@/dashboards/user/UserInvoicesList'));
const UserPaymentsList = lazy(() => import('@/dashboards/user/UserPaymentsList'));

// Shared (lazy)
const ProjectDetail = lazy(() => import('@/dashboards/shared/ProjectDetail'));
const Profile = lazy(() => import('@/dashboards/shared/Profile'));

function RouteLoader() {
  return (
    <div className="p-6 space-y-3">
      <Skeleton height={28} width="40%" />
      <Skeleton height={14} width="60%" />
      <Skeleton height={120} className="mt-4" />
      <div className="grid grid-cols-3 gap-3 mt-4">
        <Skeleton height={80} />
        <Skeleton height={80} />
        <Skeleton height={80} />
      </div>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  const defaultDashboard = user
    ? user.role === 'admin' ? '/admin'
      : user.role === 'developer' ? '/dev'
      : '/dashboard'
    : '/login';

  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[location.pathname]}>
      <Suspense fallback={<RouteLoader />}>
      <Routes>
      {/* PUBLIC */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/service-web"       element={<ServiceDetail serviceId="web" />} />
        <Route path="/service-ecommerce" element={<ServiceDetail serviceId="ecommerce" />} />
        <Route path="/service-branding"  element={<ServiceDetail serviceId="branding" />} />
        <Route path="/service-marketing" element={<ServiceDetail serviceId="marketing" />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/refund" element={<Refund />} />
        {/* Public 404 — uses public layout (header + footer) */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* AUTH */}
      <Route path="/login" element={user ? <Navigate to={defaultDashboard} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={defaultDashboard} replace /> : <Register />} />
      <Route path="/forgot-password" element={user ? <Navigate to={defaultDashboard} replace /> : <ForgotPassword />} />
      <Route path="/reset-password" element={user ? <Navigate to={defaultDashboard} replace /> : <ResetPassword />} />

      {/* PAYMENT */}
      <Route path="/payment/checkout/:paymentId" element={<ProtectedRoute><PaymentCheckout /></ProtectedRoute>} />
      <Route path="/payment/success/:paymentId" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
      <Route path="/payment/failure/:paymentId" element={<ProtectedRoute><PaymentFailure /></ProtectedRoute>} />
      <Route path="/payment/return" element={<ProtectedRoute><PaymentReturn /></ProtectedRoute>} />

      {/* ADMIN */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout variant="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersList />} />
        <Route path="users/new" element={<UserForm />} />
        <Route path="users/:id" element={<UserForm />} />
        <Route path="projects" element={<ProjectsList />} />
        <Route path="projects/new" element={<ProjectForm />} />
        <Route path="projects/:id" element={<ProjectForm />} />
        <Route path="projects/:id/view" element={<ProjectDetail />} />
        <Route path="payments" element={<AdminPaymentsList />} />
        <Route path="invoices" element={<AdminInvoicesList />} />
        <Route path="invoices/new" element={<InvoiceForm />} />
        <Route path="invoices/:id" element={<InvoiceForm />} />
        <Route path="packages" element={<PackagesList />} />
        <Route path="addons" element={<AddonsList />} />
        <Route path="bundles" element={<BundlesList />} />
        <Route path="coupons" element={<CouponsList />} />
        <Route path="leads" element={<LeadsList />} />
        <Route path="leads/:id" element={<LeadDetail />} />
        <Route path="orders" element={<AdminOrdersList />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* DEVELOPER */}
      <Route
        path="/dev/*"
        element={
          <ProtectedRoute roles={['developer', 'admin']}>
            <DashboardLayout variant="developer" />
          </ProtectedRoute>
        }
      >
        <Route index element={<DeveloperDashboard />} />
        <Route path="projects" element={<DevProjectsList />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="tasks" element={<TasksKanban />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* USER */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute roles={['user', 'admin']}>
            <DashboardLayout variant="user" />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="projects" element={<UserProjectsList />} />
        <Route path="projects/new" element={<NewProjectChoice />} />
        <Route path="projects/new/package" element={<OrderWizard />} />
        <Route path="projects/new/custom" element={<QuoteWizard />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="orders" element={<UserOrdersList />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="quotes" element={<QuotesList />} />
        <Route path="quotes/:id" element={<QuoteDetail />} />
        <Route path="invoices" element={<UserInvoicesList />} />
        <Route path="payments" element={<UserPaymentsList />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Fallback NotFound (covers non-public, non-dashboard paths like /xyz) */}
      <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
      </ErrorBoundary>
    </>
  );
}
