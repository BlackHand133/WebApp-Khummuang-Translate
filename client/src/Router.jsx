import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import ErrorPage from './Pages/Error-page.jsx';
import Loading from './components/Loading/Loading.jsx';
import { UserProvider, useUser } from './ContextUser.jsx';
import { AdminProvider, useAdmin } from './ContextAdmin.jsx';
import { ApiProvider } from './ServiceAPI.jsx';
import { PasswordResetProvider } from './PasswordResetContext.jsx';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

// Dynamic imports
const App = lazy(() => import('./App.jsx'));
const Register = lazy(() => import('./Pages/Register.jsx'));
const Login = lazy(() => import('./Pages/Login.jsx'));
const AdminLogin = lazy(() => import('./Pages/AdminLogin.jsx'));
const AdminDashboard = lazy(() => import('./Pages/AdminDashboard.jsx'));
const ForgotPassword = lazy(() => import('./Pages/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./Pages/ResetPassword.jsx'));
const Wrapper = lazy(() => import('./components/Body/Wrapperwhite.jsx'));
const UserManagement = lazy(() => import('./components/Admin/content/UserManagement.jsx'));
const EditProfile = lazy(() => import('./components/Admin/content/Editprofile.jsx'));
const AudioRecords = lazy(() => import('./components/Admin/content/AudioRecords.jsx'));

const UserProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useUser();

  if (loading) {
    return <Loading />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdmin();

  if (loading) {
    return <Loading />;
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

const Layout = () => (
  <>
    <Navbar />
    <Suspense fallback={<Loading />}>
      <Outlet />
    </Suspense>
    <Footer />
  </>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <App />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
      {
        path: ':username',
        element: (
          <UserProtectedRoute>
            <Wrapper />
          </UserProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<Loading />}>
        <Register />
      </Suspense>
    ),
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<Loading />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/admin/login',
    element: (
      <Suspense fallback={<Loading />}>
        <AdminLogin />
      </Suspense>
    ),
  },
  {
    path: '/admin/dashboard',
    element: (
      <Suspense fallback={<Loading />}>
        <AdminProtectedRoute>
          <AdminDashboard />
        </AdminProtectedRoute>
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <></>, // ไม่ต้องใส่อะไร เพราะ AdminDashboard จะแสดง dashboard overview เอง
      },
      {
        path: 'user-management',
        element: <UserManagement />,
      },
      {
        path: 'user-profile/:userId',
        element: <EditProfile />,
      },
      {
        path: 'audio-records',
        element: <AudioRecords />,
      },
    ],
  },
  {
    path: '/reset-password/:token',
    element: (
      <Suspense fallback={<Loading />}>
        <ResetPassword />
      </Suspense>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <AdminProvider>
        <ApiProvider>
          <PasswordResetProvider>
            <RouterProvider router={router} />
          </PasswordResetProvider>
        </ApiProvider>
      </AdminProvider>
    </UserProvider>
  </React.StrictMode>
);