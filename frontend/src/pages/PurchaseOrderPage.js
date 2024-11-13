//import modules
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { setPurchaseOrderState, clearPurchaseOrderState } from '../redux/purchaseOrderSlice'
import { clearProductState } from '../redux/productSlice'
import { clearSupplierState } from '../redux/supplierSlice'
import { clearProjectState } from '../redux/projectSlice'
import SessionExpired from "../components/SessionExpired";
import EmployeePageSkeleton from "./loaders/EmployeePageSkeleton";
import UnauthenticatedSkeleton from './loaders/UnauthenticateSkeleton';

const PurchaseOrder = () => {
    //Component state declaration
    const localUser = JSON.parse(localStorage.getItem('localUser'))
    const purchaseOrderState = useSelector((state) => state.purchaseOrderReducer.purchaseOrderState)
    const dispatch = useDispatch()
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [isArchive, setIsArchive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDate, setSearchDate] = useState('');

    //Component router
    const navigate = useNavigate();

    //Component functions and variables
    const formatDate = (dateString) => {
        if (dateString === null) {
            return ''
        }  else {
            const date = new Date(dateString);
            const options = { day: '2-digit', month: 'short', year: 'numeric' };
            return date.toLocaleDateString('en-AU', options).toUpperCase().replace(' ', '-').replace(' ', '-');
        }
    };

    const formatDateTime = (dateString) => {
        if (dateString === null) {
            return ''
        }  else {
            const date = new Date(dateString);
            const options = { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
            return date.toLocaleDateString('en-AU', options).toUpperCase().replace(' ', '-').replace(' ', '-');
        }
    };

    const handleSearchDateChange = (e) => {
        setSearchDate(e.target.value);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filterOrders = () => {
        return purchaseOrderState.filter(order => {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
            // Check each field for the search term
            return (
                order.order_ref.toLowerCase().includes(lowerCaseSearchTerm) ||
                order.project.project_name.toLowerCase().includes(lowerCaseSearchTerm) ||
                order.supplier.supplier_name.toLowerCase().includes(lowerCaseSearchTerm) ||
                order.order_total_amount.toString().includes(lowerCaseSearchTerm) ||
                order.order_status.toLowerCase().includes(lowerCaseSearchTerm)
            );
        });
    };

    const filterBySelectedDate = (orders) => {
        if (!searchDate) return orders;
    
        const selected = new Date(searchDate);
        return orders.filter(order => {
            const orderDate = new Date(order.order_date);
            return (
                orderDate.getFullYear() === selected.getFullYear() &&
                orderDate.getMonth() === selected.getMonth() &&
                orderDate.getDate() === selected.getDate()
            );
        });
    };
    
    const handleAddClick = () => {
        dispatch(clearProductState())
        dispatch(clearSupplierState())
        dispatch(clearProjectState())
        navigate('/EmpirePMS/order/create');
    }

    const handleTableClick = (id) => {

        dispatch(clearPurchaseOrderState())
        navigate(`/EmpirePMS/order/${id}`);
    }
    
    //Render component
    useEffect(() => {
        console.log("Token in sessionstorage:", sessionStorage.getItem('jwt'));
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchPurchaseOrders = async () => {
            setIsLoadingState(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/order`, { 
                    signal,
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    }
                });
                if (!res.ok) {
                    throw new Error('Failed to fetch');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }
                
                setIsLoadingState(false);
                dispatch(setPurchaseOrderState(data));
                setErrorState(null);
            } catch (error) {
                if (error.name === 'AbortError') {
                    // do nothing
                } else {
                    setIsLoadingState(false);
                    setErrorState(error.message);
                }
            }
        };

        fetchPurchaseOrders();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, [dispatch]);
    
    //Display DOM
    const purchaseOrderTable = Array.isArray(purchaseOrderState) && purchaseOrderState.length > 0 ? (
        <div className="container overflow-x-auto text-xs md:text-sm">
            <table className="table table-bordered table-hover shadow-md">
                <thead className="thead-dark text-center">
                    <tr className="table-primary">
                        <th scope="col">PO</th>
                        <th scope="col" className="hidden sm:table-cell">Order Date</th>
                        <th scope="col" className="hidden sm:table-cell">EST Date</th>
                        <th scope="col">Project</th>
                        <th scope="col">Supplier</th>
                        <th scope="col" className="hidden md:table-cell">Products</th>
                        <th scope="col" className="hidden md:table-cell">Gross Amount</th>
                        <th scope="col" className="hidden md:table-cell">Status</th>
                        {/* <th scope="col">Ordered By</th> */}
                    </tr>
                </thead>
                <tbody>
                    {filterBySelectedDate(filterOrders().filter(order => order.order_isarchived === isArchive)).map((order, index) => (
                        <tr key={order._id} onClick={() => handleTableClick(order._id)} className="cursor-pointer text-center">
                            <th scope="row">{order.order_ref}</th>
                            <td className="hidden sm:table-cell">{formatDate(order.order_date)}</td>
                            <td className="hidden sm:table-cell">{formatDateTime(order.order_est_datetime)}</td>
                            <td>{order.project.project_name}</td>
                            <td>{order.supplier.supplier_name}</td>
                            <td className="hidden md:table-cell">{order.products.length + order.custom_products.length} products</td>
                            <td className="hidden md:table-cell">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.order_total_amount)}
                            </td>
                            <td className="hidden md:table-cell">
                                {order.order_status && (
                                <label
                                    className={`text-sm font-bold m-1 py-0.5 px-1 rounded-xl ${
                                        order.order_status === "Cancelled"
                                            ? "border-2 bg-transparent border-gray-500 text-gray-500"
                                            : order.order_status === "Pending"
                                            ? "border-2 bg-transparent border-yellow-300 text-yellow-600"
                                            : order.order_status === "Approved"
                                            ? "border-2 bg-transparent border-green-600 text-green-600"
                                            : order.order_status === "Rejected"
                                            ? "border-2 bg-transparent border-red-600 text-red-600"
                                            : order.order_status === "Draft"
                                            ? "border-2 bg-transparent border-gray-600 text-gray-600"
                                            : ""
                                    }`}
                                >
                                    {order.order_status}
                                </label>
                                )}
                            </td>
                            {/* <td>To be developed using HISTORY table......</td> */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ) : (
        <div>Purchase Order API fetched successfully, but it might be empty...</div>
    );
    
    if (isLoadingState) { return (<EmployeePageSkeleton />); }

    if (errorState) {
        if(errorState.includes("Session expired") || errorState.includes("jwt expired") || errorState.includes("jwt malformed")){
            return(<div><SessionExpired /></div>)
        }
        return (<div>Error: {errorState}</div>);
    }

    return (
        localUser && Object.keys(localUser).length > 0 ? (
        <div className="container mt-5"><div className="card">
                <div className="card-header bg-dark text-white">
                    <h1 className='mx-auto uppercase font-bold text-sm md:text-xl'>PURCHASE ORDERS</h1>
                </div>
                <div className="card-body">
                    <div className="row mb-1">
                        {/* Search Input */}
                        <div className="col-12 col-md-6 mb-2 mb-md-1">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>

                        {/* New Purchase Order Button */}
                        <div className="col-12 col-md-6 d-flex justify-content-md-end justify-content-center mb-2 mb-md-1">
                            <button className="btn btn-primary d-flex align-items-center" onClick={handleAddClick}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="size-6 me-1"
                                    style={{ width: '24px', height: '24px' }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <span>NEW PURCHASE ORDER</span>
                            </button>
                        </div>

                        {/* Date Input */}
                        <div className="col-12 col-md-6 d-flex justify-content-md-start justify-content-center">
                            <input
                                type="date"
                                className="form-control"
                                value={searchDate}
                                onChange={handleSearchDateChange}
                            />
                        </div>
                    </div>

                    <div className="row mb-3">
                    <div className="col-md-6">
                        <button 
                            className={`${!isArchive ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white text-xs sm:text-base' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 text-xs sm:text-base'}`} 
                            onClick={() => setIsArchive(false)}
                        >
                            Current
                        </button>
                        <button 
                            className={`${isArchive ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white text-xs sm:text-base' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 text-xs sm:text-base'}`} 
                            onClick={() => setIsArchive(true)}
                        >
                            Archived
                        </button>
                    </div>
                        {purchaseOrderTable}
                    </div>
                </div>
            </div>
        </div> ) : ( <UnauthenticatedSkeleton /> )
    );
};
 
export default PurchaseOrder;