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
import AccountPage from './pages/AccountPage';
import ProjectDetails from './pages/ProjectDetails';
import NewProjectForm from './pages/forms/NewProjectForm';
import UpdateProjectForm from "./pages/forms/UpdateProjectForm";
import UpdatePurchaseOrderForm from "./pages/forms/UpdatePurchaseOrderForm";
import SupplierPage from './pages/SupplierPage';
import EmployeeDetails from './pages/EmployeeDetails';
import UpdateEmployeeForm from "./pages/forms/UpdateEmployeeForm";
import NewEmployeeForm from "./pages/forms/NewEmployeeForm";
import ChangePasswordForm from "./pages/forms/ChangePasswordForm";
import PasswordReset from "./components/PasswordReset";
import SupplierDetails from "./pages/SupplierDetails";
import UpdateSupplierForm from "./pages/forms/UpdateSupplierForm";
import NewSupplierForm from "./pages/forms/NewSupplierForm";
import ProductDetails from "./pages/ProductDetails";
import NewProductForm from "./pages/forms/NewProductForm";
import UpdateProductForm from "./pages/forms/UpdateProductForm";
import PurchaseOrder from "./pages/PurchaseOrderPage";
import TestPage from "./pages/TestPage";
import PurchaseOrderDetails from "./pages/PurchaseOrderDetails";
import NewPurchaseOrderForm from "./pages/forms/NewPurchaseOrderForm";
import NewInvoiceForm from "./pages/forms/NewInvoiceForm";
import UpdateInvoiceForm from "./pages/forms/UpdateInvoiceForm";
import InvoiceDetails from "./pages/InvoiceDetails";

function App() {
  //App state declaration
  const localUser = useSelector((state) => state.localUserReducer.localUserState)

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <div className="pages">
          <Routes>
            <Route path="/" element={<Navigate to="/EmpirePMS/dashboard" /> } />
            <Route path="/EmpirePMS/" element={<Navigate to="/EmpirePMS/dashboard" /> } />
            <Route path="/EmpirePMS/login" element={!localUser ? <Login /> : <Navigate to="/EmpirePMS/dashboard" />} />
            <Route path="/EmpirePMS/dashboard" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <Dashboard />} />
            <Route path="/EmpirePMS/order" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <PurchaseOrder />} />
            <Route path="/EmpirePMS/order/:id" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <PurchaseOrderDetails />} />
            <Route path="/EmpirePMS/order/:id/edit" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <UpdatePurchaseOrderForm />} />
            <Route path="/EmpirePMS/order/create" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <NewPurchaseOrderForm />} />
            <Route path="/EmpirePMS/employee" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <EmployeePage />} />
            <Route path="/EmpirePMS/invoice" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <InvoicePage />} />
            <Route path="/EmpirePMS/invoice/:id" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <InvoiceDetails />} />
            <Route path="/EmpirePMS/invoice/create" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <NewInvoiceForm />} />
            <Route path="/EmpirePMS/invoice/:id/edit" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <UpdateInvoiceForm />} />
            <Route path="/EmpirePMS/order" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <OrderPage />} />
            <Route path="/EmpirePMS/payment" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <PaymentPage />} />
            <Route path="/EmpirePMS/project" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <ProjectPage />} />
            <Route path="/EmpirePMS/account" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <AccountPage />} />
            <Route path="/EmpirePMS/test" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <TestPage />} />
            <Route path="/EmpirePMS/project/:id" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <ProjectDetails />} />
            <Route path="/EmpirePMS/project/create" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <NewProjectForm />} />
            <Route path="/EmpirePMS/project/:id/edit" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <UpdateProjectForm />} />


            <Route path="/EmpirePMS/supplier" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <SupplierPage />} />
            <Route path="/EmpirePMS/supplier/:id" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <SupplierDetails />} />
            <Route path="/EmpirePMS/supplier/:id/edit" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <UpdateSupplierForm />} />
            <Route path="/EmpirePMS/supplier/create" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <NewSupplierForm />} />

            <Route path="/EmpirePMS/supplier/:id/products/:productId" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <ProductDetails />} />
            <Route path="/EmpirePMS/supplier/:id/products/create" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <NewProductForm />} />
            <Route path="/EmpirePMS/supplier/:id/products/:productId/edit" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <UpdateProductForm />} />
            
            <Route path="/EmpirePMS/employee/:id" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <EmployeeDetails />} />
            <Route path="/EmpirePMS/employee/:id/change-password" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <ChangePasswordForm />} />
            <Route path="/EmpirePMS/employee/:id/edit" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <UpdateEmployeeForm />} />
            <Route path="/EmpirePMS/employee/create" element={!localUser ? <Navigate to="/EmpirePMS/login" /> : <NewEmployeeForm />} />
            <Route path="/EmpirePMS/employee/reset-password" element={<PasswordReset />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}


export default App;
