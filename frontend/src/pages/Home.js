import { Link } from "react-router-dom"
import {
  ShoppingCart,
  FileText,
  Truck,
  CreditCard,
  Users,
  Building2,
  Briefcase,
  Layers,
  PieChart,
  BarChart3,
  ChartArea,
} from "lucide-react"
import UnauthenticatedSkeleton from "./loaders/UnauthenticateSkeleton"

const Home = () => {
  const localUser = JSON.parse(localStorage.getItem("localUser"))

  // Navigation card component
  const NavCard = ({ to, title, icon, color }) => {
    const Icon = icon
    return (
      <Link to={to} className="block w-full">
        <div className={`rounded-lg p-6 transition-all duration-200 ${color} hover:shadow-md hover:translate-y-[-2px]`}>
          <div className="flex items-center">
            <Icon className="h-6 w-6 mr-3" />
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        </div>
      </Link>
    )
  }

  if (!localUser || Object.keys(localUser).length === 0) {
    return <UnauthenticatedSkeleton />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Financial Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Order & Financial Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NavCard
            to="/EmpirePMS/order"
            title="Purchase Order Summary"
            icon={ShoppingCart}
            color="bg-indigo-100 hover:bg-indigo-200"
          />
          <NavCard to="/EmpirePMS/invoice" title="Invoices" icon={FileText} color="bg-indigo-100 hover:bg-indigo-200" />
          <NavCard to="/EmpirePMS/delivery" title="Deliveries" icon={Truck} color="bg-indigo-100 hover:bg-indigo-200" />
          <NavCard
            to="/EmpirePMS/payment"
            title="Payments"
            icon={CreditCard}
            color="bg-indigo-100 hover:bg-indigo-200"
          />
        </div>
      </div>

      {/* People Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">People & Organizations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NavCard to="/EmpirePMS/employee" title="Employees" icon={Users} color="bg-purple-50 hover:bg-purple-100" />
          <NavCard
            to="/EmpirePMS/supplier"
            title="Suppliers"
            icon={Building2}
            color="bg-purple-50 hover:bg-purple-100"
          />
          <NavCard
            to="/EmpirePMS/project"
            title="Projects"
            icon={Briefcase}
            color="bg-purple-50 hover:bg-purple-100"
          />
        </div>
      </div>

      {/* Resources Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Resources & Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NavCard
            to="/EmpirePMS/product-type"
            title="Product Types"
            icon={Layers}
            color="bg-blue-50 hover:bg-blue-100"
          />
          <NavCard to="/EmpirePMS/budget" title="Budgets" icon={PieChart} color="bg-blue-50 hover:bg-blue-100" />
          <NavCard to="/EmpirePMS/product" title="Reports (Beta)" icon={ChartArea} color="bg-blue-50 hover:bg-blue-100" />
        </div>
      </div>
    </div>
  )
}

export default Home

