import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import ErrorPage from './Pages/Error-page.jsx';
import Loading from './components/Loading/Loading.jsx';
import RegisterForm from './Pages/admin.jsx';

const App = lazy(() => import('./App.jsx'));
const Register = lazy(() => import('./Pages/Register.jsx'));
const Login = lazy(() => import('./Pages/Login.jsx'));

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<Loading />}>
        <App />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: 'register/',
    element: (
      <Suspense fallback={<Loading />}>
        <Register />
      </Suspense>
    ),
  },
  {
    path: 'login/',
    element: (
      <Suspense fallback={<Loading />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: 'admin/',
    element: (
      <Suspense fallback={<Loading />}>
        <RegisterForm />
      </Suspense>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
