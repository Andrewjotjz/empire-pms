// Import required modules, components, forms, pages, details page
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Navbar from './components/Navbar';
import Login from './pages/forms/Login';
import Dashboard from './pages/Dashboard';
import EmployeePage from './pages/EmployeePage';
import InvoicePage from './pages/InvoicePage2';
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
import PurchaseOrder from "./pages/PurchaseOrderPage2";
import PurchaseOrderDetails from "./pages/PurchaseOrderDetails";
import NewPurchaseOrderForm from "./pages/forms/NewPurchaseOrderForm";
import NewInvoiceForm from "./pages/forms/NewInvoiceForm";
import UpdateInvoiceForm from "./pages/forms/UpdateInvoiceForm";
import InvoiceDetails from "./pages/InvoiceDetails";
import NotFoundPage from "./pages/loaders/NotFoundPage";
import Breadcrumbs from "./components/Breadcrumbs";
import ProductType from "./pages/ProductTypePage";
import NewProductTypeForm from "./pages/forms/NewProductTypeForm";
import UpdateProductTypeForm from "./pages/forms/UpdateProductTypeForm";
import Budget from "./pages/BudgetPage";
import BudgetDetails from "./pages/BudgetDetails";
import NewBudgetForm from "./pages/forms/NewBudgetForm";
import UpdateBudgetForm from "./pages/forms/UpdateBudgetForm";
import Delivery from "./pages/DeliveryPage";
import DeliveryDetails from "./pages/DeliveryDetails";
import Payment from "./pages/PaymentPage";
import Iframe from "./pages/Iframe";
import PaymentDetails from "./pages/PaymentDetails";
import NewPaymentForm from "./pages/forms/NewPaymentForm";
import UpdatePaymentForm from "./pages/forms/UpdatePaymentForm";
import Calculator from "./components/Calculator";
import NewBudgetForm2 from "./pages/forms/NewBudgetForm2";
import NewBudgetForm3 from "./pages/forms/NewBudgetForm3";
import NewBudgetForm4 from "./pages/forms/NewBudgetForm4";

function App() {

  const localUser = JSON.parse(localStorage.getItem('localUser'))

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Breadcrumbs />
        <div className="pages">
          <Routes>
            <Route path="/EmpirePMS/login" element={<Login />} />
            <Route path="/" element={!localUser ? <Navigate to='/EmpirePMS/login' />: <Dashboard />} />
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

            <Route path="/EmpirePMS/product-type" element={<ProductType />} />
            <Route path="/EmpirePMS/product-type/create" element={<NewProductTypeForm />} />
            <Route path="/EmpirePMS/product-type/:id/edit" element={<UpdateProductTypeForm /> } />
            
            <Route path="/EmpirePMS/budget" element={<Budget />} />
            <Route path="/EmpirePMS/budget/:id" element={<BudgetDetails />} />
            <Route path="/EmpirePMS/budget/create" element={<NewBudgetForm />} />
            <Route path="/EmpirePMS/budget/create2" element={<NewBudgetForm2 />} />
            <Route path="/EmpirePMS/budget/create3" element={<NewBudgetForm3 />} />
            <Route path="/EmpirePMS/budget/create4" element={<NewBudgetForm4 />} />
            <Route path="/EmpirePMS/budget/:id/edit" element={<UpdateBudgetForm /> } />

            <Route path="/EmpirePMS/delivery" element={<Delivery />} />
            <Route path="/EmpirePMS/delivery/:id" element={<DeliveryDetails />} />

            <Route path="/EmpirePMS/payment" element={<Payment />} />
            <Route path="/EmpirePMS/payment/:id" element={<PaymentDetails />} />
            <Route path="/EmpirePMS/payment/create" element={<NewPaymentForm />} />
            <Route path="/EmpirePMS/payment/:id/edit" element={<UpdatePaymentForm /> } />


            <Route path="/EmpirePMS/product" element={<Iframe /> } />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <Calculator />
      </BrowserRouter>
    </div>
  );
}


export default App;
