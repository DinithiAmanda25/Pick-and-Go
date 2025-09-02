import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Login from './Pages/Client/Login.jsx'
import Registration from './Pages/Client/Registration.jsx'
import VehicleRental from './Pages/Client/VehicleRental.jsx'
import VehicleDetails from './Pages/Client/VehicleDetails.jsx'
import Checkout from './Pages/Client/Checkout.jsx'
import Invoice from './Pages/Client/Invoice.jsx'
import ClientDashboard from './Pages/Client/ClientDashboard.jsx'
import AdminDashboard from './Pages/Admin/AdminDashboard.jsx'
import VehicleOwnerDashboard from './Pages/Vehicle-owner/VehicleOwnerDashboard.jsx'
import DriverDashboard from './Pages/Driver/DriverDashboard.jsx'
import DriverOnboarding from './Pages/Driver/DriverOnboarding.jsx'
import BusinessOwnerDashboard from './Pages/Business-owner/BusinessOwnerDashboard.jsx'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import ErrorBoundary from './Components/ErrorBoundary'
import NotFound from './Components/NotFound'

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <App /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Registration /> },
      { path: '/vehicle-rental', element: <VehicleRental /> },
      { path: '/vehicle-details/:id', element: <VehicleDetails /> },
      { path: '/checkout', element: <Checkout /> },
      { path: '/invoice/:id', element: <Invoice /> },
      { path: '/client-dashboard', element: <ClientDashboard /> },
      { path: '/admin-dashboard', element: <AdminDashboard /> },
      { path: '/vehicle-owner-dashboard', element: <VehicleOwnerDashboard /> },
      { path: '/driver-dashboard', element: <DriverDashboard /> },
      { path: '/driver-onboarding', element: <DriverOnboarding /> },
      { path: '/business-owner-dashboard', element: <BusinessOwnerDashboard /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);




ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
