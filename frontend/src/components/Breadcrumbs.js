import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = () => {

    const location = useLocation();
    const id = location.pathname.split('/')[3];
    const productId = location.pathname.split('/')[5];
    const priceId = location.pathname.split('/')[7];

    return ( 
        !location.pathname.includes(`/EmpirePMS/login`) ? (
        <div className="bg-gray-800 py-1 px-6 sticky top-0 z-1">
            <ul className=" flex border-gray-800 text-xs text-blue-500 items-center">
                <Link className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname === "/EmpirePMS/home" && "text-blue-500"}`} to="/EmpirePMS/home">
                    Home
                </Link>

                {location.pathname.includes(`/EmpirePMS/invoice`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/invoice`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/invoice`) && "text-blue-500"}`}>
                    Invoices
                    </Link>
                </>
                )}
                
                {location.pathname.includes(`/EmpirePMS/invoice/create`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/invoice/create`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/invoice/create`) && "text-blue-500"}`}>
                    New Invoice
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/invoice/${id}`) && id !== 'create' && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/invoice/${id}`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/invoice/${id}`) && "text-blue-500"}`}>
                    Invoice Details
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/invoice/${id}/edit`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/invoice/${id}/edit`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/invoice/${id}/edit`) && "text-blue-500"}`}>
                    Edit Invoice
                    </Link>
                </>
                )}

                {/* ****************** ORDERS ******************** */}
                {location.pathname.includes(`/EmpirePMS/order`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/order`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/order`) && "text-blue-500"}`}>
                    Purchase Orders
                    </Link>
                </>
                )}
                
                {location.pathname.includes(`/EmpirePMS/order/${id}`) && id !== 'create' && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/order/${id}`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/order/${id}`) && "text-blue-500"}`}>
                    Order Details
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/order/${id}/edit`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/order/${id}/edit`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/order/${id}/edit`) && "text-blue-500"}`}>
                    Edit Order
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/order/create`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/order/create`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/order/create`) && "text-blue-500"}`}>
                    New Order
                    </Link>
                </>
                )}

                {/* ****************** PROJECTS ******************** */}
                {location.pathname.includes(`/EmpirePMS/project`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/project`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/project`) && "text-blue-500"}`}>
                    Projects
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/project/${id}`) && id !== 'create' && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/project/${id}`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/project/${id}`) && "text-blue-500"}`}>
                    Project Details
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/project/${id}/edit`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/project/${id}/edit`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/project/${id}/edit`) && "text-blue-500"}`}>
                    Edit Project
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/project/create`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/project/create`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/project/create`) && "text-blue-500"}`}>
                    New Project
                    </Link>
                </>
                )}

                {/* ****************** EMPLOYEES ******************** */}
                {location.pathname.includes(`/EmpirePMS/employee`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/employee`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/employee`) && "text-blue-500"}`}>
                    Employees
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/employee/${id}`) && id !== 'create' && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/employee/${id}`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/employee/${id}`) && "text-blue-500"}`}>
                    Employee Details
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/employee/${id}/`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/employee/${id}/`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/employee/${id}/`) && "text-blue-500"}`}>
                    Edit Employee
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/employee/create`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/employee/create`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/employee/create`) && "text-blue-500"}`}>
                    New Employee
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/employee/${id}/change-password`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/employee/${id}/change-password`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/employee/${id}/change-password`) && "text-blue-500"}`}>
                    Change Password
                    </Link>
                </>
                )}
                
                {/* ****************** SUPPLIERS ******************** */}
                {location.pathname.includes(`/EmpirePMS/supplier`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/supplier`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/supplier`) && "text-blue-500"}`}>
                    Suppliers
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/supplier/${id}`) && id !== 'create' && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/supplier/${id}`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/supplier/${id}`) && "text-blue-500"}`}>
                    Supplier Details
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/supplier/${id}/edit`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/supplier/${id}/edit`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/supplier/${id}/edit`) && "text-blue-500"}`}>
                    Edit Supplier
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/supplier/create`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/supplier/create`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/supplier/create`) && "text-blue-500"}`}>
                    New Supplier
                    </Link>
                </>
                )}


                {location.pathname.includes(`/EmpirePMS/supplier/${id}/products/${productId}`) && productId !== 'create' && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/supplier/${id}/products/${productId}`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/supplier/${id}/products/${productId}`) && "text-blue-500"}`}>
                    Product Details
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/supplier/${id}/products/${productId}/edit`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/supplier/${id}/products/${productId}/edit`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/supplier/${id}/products/${productId}/edit`) && "text-blue-500"}`}>
                    Edit Product
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/supplier/${id}/products/${productId}/productprice/${priceId}/edit`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/supplier/${id}/products/${productId}/productprice/${priceId}/edit`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/supplier/${id}/products/${productId}/productprice/${priceId}/edit`) && "text-blue-500"}`}>
                    Edit Price
                    </Link>
                </>
                )}
                

                {location.pathname.includes(`/EmpirePMS/supplier/${id}/products/create`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/supplier/${id}/products/create`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/supplier/${id}/products/create`) && "text-blue-500"}`}>
                    New Product
                    </Link>
                </>
                )}

                {/* ****************** PRODUCT TYPE ******************** */}
                {location.pathname.includes(`/EmpirePMS/product-type`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/product-type`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/product-type`) && "text-blue-500"}`}>
                    Product Types
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/product-type/${id}/edit`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/product-type/${id}/edit`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/product-type/${id}/edit`) && "text-blue-500"}`}>
                    Edit Product Type
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/product-type/create`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/product-type/create`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/product-type/create`) && "text-blue-500"}`}>
                    New Product Type
                    </Link>
                </>
                )}

                {/* ****************** BUDGET ******************** */}
                {location.pathname.includes(`/EmpirePMS/budget`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/budget`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/budget`) && "text-blue-500"}`}>
                    Budgets
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/budget/${id}`) && id !== 'create' && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/budget/${id}`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/budget/${id}`) && "text-blue-500"}`}>
                    Budget Details
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/budget/${id}/budget-vs-actual`) && id !== 'create' && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/budget/${id}/budget-vs-actual`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/budget/${id}budget-vs-actual`) && "text-blue-500"}`}>
                    Budget vs Actual
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/budget/${id}/edit`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/budget/${id}/edit`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/budget/${id}/edit`) && "text-blue-500"}`}>
                    Edit Budget
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/budget/create`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/budget/create`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/budget/create`) && "text-blue-500"}`}>
                    New Budget
                    </Link>
                </>
                )}


                {/* ****************** PAYMENTS ******************** */}
                {location.pathname.includes(`/EmpirePMS/payment`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/payment`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/payment`) && "text-blue-500"}`}>
                    Payments
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/payment/${id}`) && id !== 'create' && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/payment/${id}`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/payment/${id}`) && "text-blue-500"}`}>
                    Payment Details
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/payment/${id}/edit`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/payment/${id}/edit`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/payment/${id}/edit`) && "text-blue-500"}`}>
                    Edit Payment
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/payment/create`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/payment/create`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/payment/create`) && "text-blue-500"}`}>
                    New Payment
                    </Link>
                </>
                )}

                {/* ****************** DELIVERIES ******************** */}
                {location.pathname.includes(`/EmpirePMS/delivery`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/delivery`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/delivery`) && "text-blue-500"}`}>
                    Deliveries
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/delivery/${id}`) && id !== 'create' && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/delivery/${id}`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/delivery/${id}`) && "text-blue-500"}`}>
                    Delivery Details
                    </Link>
                </>
                )}

                {/* ****************** ALIASES ******************** */}
                {location.pathname.includes(`/EmpirePMS/alias`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/alias`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/alias`) && "text-blue-500"}`}>
                    Aliases
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/alias/${id}`) && id !== 'create' && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/alias/${id}/edit`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/alias/${id}/edit`) && "text-blue-500"}`}>
                    Edit Alias
                    </Link>
                </>
                )}

                {location.pathname.includes(`/EmpirePMS/library`) && (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                    </svg>

                    <Link
                    to={`/EmpirePMS/library`}
                    className={`cursor-pointer text-base hover:bg-blue-100 p-1 rounded-md ${location.pathname.includes(`/EmpirePMS/library`) && "text-blue-500"}`}>
                    Library
                    </Link>
                </>
                )}
            </ul>
        </div>) : (
            <></>
        )
     );
}
 
export default Breadcrumbs;