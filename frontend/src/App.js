// Import required modules, components, forms, pages, details page
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Navbar from './components/Navbar';
import Login from './pages/forms/Login';
import Dashboard from './pages/Dashboard';
import EmployeePage from './pages/EmployeePage';
import InvoicePage from './pages/InvoicePage';
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
import PurchaseOrderDetails from "./pages/PurchaseOrderDetails";
import NewPurchaseOrderForm from "./pages/forms/NewPurchaseOrderForm";
import NewInvoiceForm from "./pages/forms/NewInvoiceForm";
import UpdateInvoiceForm from "./pages/forms/UpdateInvoiceForm";
import InvoiceDetails from "./pages/InvoiceDetails";

function App() {

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <div className="pages">
          <Routes>
            <Route path="/EmpirePMS/login" element={<Login />} />
            <Route path="/EmpirePMS/dashboard" element={<Dashboard />} />

            <Route path="/EmpirePMS/order" element={<PurchaseOrder />} />
            <Route path="/EmpirePMS/order/:id" element={<PurchaseOrderDetails />} />
            <Route path="/EmpirePMS/order/:id/edit" element={<UpdatePurchaseOrderForm />} />
            <Route path="/EmpirePMS/order/create" element={<NewPurchaseOrderForm />} />

            <Route path="/EmpirePMS/invoice" element={<InvoicePage />} />
            <Route path="/EmpirePMS/invoice/:id" element={<InvoiceDetails />} />
            <Route path="/EmpirePMS/invoice/create" element={<NewInvoiceForm />} />
            <Route path="/EmpirePMS/invoice/:id/edit" element={<UpdateInvoiceForm />} />
            
            <Route path="/EmpirePMS/payment" element={<PaymentPage />} />

            <Route path="/EmpirePMS/account" element={<AccountPage />} />

            <Route path="/EmpirePMS/project" element={<ProjectPage />} />
            <Route path="/EmpirePMS/project/:id" element={<ProjectDetails />} />
            <Route path="/EmpirePMS/project/create" element={<NewProjectForm />} />
            <Route path="/EmpirePMS/project/:id/edit" element={<UpdateProjectForm />} />

            <Route path="/EmpirePMS/supplier" element={<SupplierPage />} />
            <Route path="/EmpirePMS/supplier/:id" element={<SupplierDetails />} />
            <Route path="/EmpirePMS/supplier/:id/edit" element={<UpdateSupplierForm />} />
            <Route path="/EmpirePMS/supplier/create" element={<NewSupplierForm />} />

            <Route path="/EmpirePMS/supplier/:id/products/:productId" element={<ProductDetails />} />
            <Route path="/EmpirePMS/supplier/:id/products/create" element={<NewProductForm />} />
            <Route path="/EmpirePMS/supplier/:id/products/:productId/edit" element={<UpdateProductForm />} />
            
            <Route path="/EmpirePMS/employee" element={<EmployeePage />} />
            <Route path="/EmpirePMS/employee/:id" element={<EmployeeDetails />} />
            <Route path="/EmpirePMS/employee/:id/change-password" element={<ChangePasswordForm />} />
            <Route path="/EmpirePMS/employee/:id/edit" element={<UpdateEmployeeForm />} />
            <Route path="/EmpirePMS/employee/create" element={<NewEmployeeForm />} />
            <Route path="/EmpirePMS/employee/reset-password" element={<PasswordReset />} />

            <Route path="*" element={<Navigate to="/EmpirePMS/dashboard" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}


export default App;
