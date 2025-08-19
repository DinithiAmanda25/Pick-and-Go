import React from 'react'   // 👈 Add this line
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Login from './Pages/Client/Login.jsx'
import Registration from './Pages/Client/Registration.jsx'
import AdminDashboard from './Pages/Admin/AdminDashboard.jsx'
import AdminRoleManage from './Pages/Admin/AdminRoleManage.jsx'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([

  // Client Routings 
  {
    path: "/",
    element: <App/>,
  },
  {
    path: "/login",
    element:<Login/> ,
  },
  {
    path: "/registration",
    element: <Registration/>,
  },




  // Admin Routings 
  {
    path: "/admindashboard",
    element: <AdminDashboard/>,
  },
  {
    path: "/admindashboard/rolemanagement",
    element: <AdminRoleManage/>,
  },




  // Business Owner routings 



  
]);



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
