import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import ErrorPage from './Pages/Error-page.jsx';
import Loading from './components/Loading/Loading.jsx';
import { UserProvider, useUser } from './ContextUser.jsx';
import { AdminProvider } from './ContextAdmin.jsx';
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

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useUser();

  if (loading) {
    return <Loading />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
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
    element: <Layout />,  // ใช้ Layout ที่มีทั้ง Navbar และ Footer
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
          <ProtectedRoute>
            <Wrapper />
          </ProtectedRoute>
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
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      </Suspense>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <AdminProvider>
        <RouterProvider router={router} />
      </AdminProvider>
    </UserProvider>
  </React.StrictMode>
);
