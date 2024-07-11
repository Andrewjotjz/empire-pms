// Import required modules, components, forms, pages, details page
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from 'react-redux'
import Navbar from './components/Navbar';
import Login from './pages/forms/Login';
import Dashboard from './pages/Dashboard';
import EmployeePage from './pages/EmployeePage';
import InvoicePage from './pages/InvoicePage';
import OrderPage from './pages/OrderPage';
import PaymentPage from './pages/PaymentPage';
import ProjectPage from './pages/ProjectPage';
import SupplierPage from './pages/SupplierPage';
import EmployeeDetails from './pages/EmployeeDetails';

function App() {
  //App state declaration
  const localUser = useSelector((state) => state.localUserReducer.localUserState)

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <div className="pages">
          <Routes>
            {/* Redirect to dashboard if localUser is authenticated, otherwise to login */}
            <Route path="/" element={<Navigate to="/EmpirePMS/dashboard" /> } />

            {/* Redirect to dashboard if localUser is authenticated, otherwise to login */}
            <Route path="/EmpirePMS/" element={<Navigate to="/EmpirePMS/dashboard" /> } />
            
            {/* Render login page if localUser is not authenticated, otherwise redirect to dashboard */}
            <Route path="/EmpirePMS/login" element={!localUser ? <Login /> : <Navigate to="/EmpirePMS/dashboard" />} />
            
            {/* Always render the dashboard. If localUser is not authenticated, redirect to login */}
            <Route path="/EmpirePMS/dashboard" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <Dashboard />} />


            <Route path="/EmpirePMS/employee" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <EmployeePage />} />
            <Route path="/EmpirePMS/invoice" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <InvoicePage />} />
            <Route path="/EmpirePMS/order" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <OrderPage />} />
            <Route path="/EmpirePMS/payment" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <PaymentPage />} />
            <Route path="/EmpirePMS/project" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <ProjectPage />} />
            <Route path="/EmpirePMS/supplier" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <SupplierPage />} />

            <Route path="/EmpirePMS/employee/:id" element={<EmployeeDetails />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
