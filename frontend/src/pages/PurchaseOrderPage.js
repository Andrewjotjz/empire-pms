//import modules
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { setPurchaseOrderState, clearPurchaseOrderState } from '../redux/purchaseOrderSlice'
import SessionExpired from "../components/SessionExpired";
import EmployeePageSkeleton from "./loaders/EmployeePageSkeleton";

const PurchaseOrder = () => {
    //Component state declaration
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
        dispatch(clearPurchaseOrderState());
        navigate('/EmpirePMS/order/create');
    }

    const handleTableClick = (id) => {

        dispatch(clearPurchaseOrderState())
        navigate(`/EmpirePMS/order/${id}`);
    }
    

    //Render component
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchPurchaseOrders = async () => {
            setIsLoadingState(true);
            try {
                const res = await fetch('/api/order', { signal });
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
        <div className="container">
            <table className="table table-bordered table-hover">
                <thead className="thead-dark">
                    <tr className="table-primary">
                        <th scope="col">PO</th>
                        <th scope="col">Order Date</th>
                        <th scope="col">EST Date</th>
                        <th scope="col">Project</th>
                        <th scope="col">Supplier</th>
                        <th scope="col">Products</th>
                        <th scope="col">Gross Amount</th>
                        <th scope="col">Status</th>
                        {/* <th scope="col">Ordered By</th> */}
                    </tr>
                </thead>
                <tbody>
                    {filterBySelectedDate(filterOrders().filter(order => order.order_isarchived === isArchive)).map((order, index) => (
                        <tr key={order._id} onClick={() => handleTableClick(order._id)} className="cursor-pointer">
                            <th scope="row">{order.order_ref}</th>
                            <td>{formatDate(order.order_date)}</td>
                            <td>{formatDateTime(order.order_est_datetime)}</td>
                            <td>{order.project.project_name}</td>
                            <td>{order.supplier.supplier_name}</td>
                            <td>{order.products.length} products</td>
                            <td>${Math.round(order.order_total_amount)}</td>
                            <td>{order.order_status}</td>
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
        if(errorState.includes("Session expired") || errorState.includes("jwt expired")){
            return(<div><SessionExpired /></div>)
        }
        return (<div>Error: {errorState}</div>);
    }

    return (
        <div className="container mt-5"><div className="card">
                <div className="card-header bg-dark text-white">
                    <h1 className='mx-auto uppercase font-bold text-xl'>PURCHASE ORDERS</h1>
                </div>
                <div className="card-body">
                    <div className="row mb-1">
                        <div className="col-md-6 mb-1">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <div className="col-md-6 d-flex justify-content-end">
                            <button className="btn btn-primary" onClick={handleAddClick}>
                                <div className='flex items-center'>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-1">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    <label>NEW PURCHASE ORDER</label>
                                </div>
                            </button>
                        </div>
                        <div className="col-md-6 d-flex justify-content-start">
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
                            className={`${!isArchive ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 '}`} 
                            onClick={() => setIsArchive(false)}
                        >
                            Current
                        </button>
                        <button 
                            className={`${isArchive ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50'}`} 
                            onClick={() => setIsArchive(true)}
                        >
                            Archived
                        </button>
                    </div>
                        {purchaseOrderTable}
                    </div>
                </div>
            </div>
        </div>
    );
};
 
export default PurchaseOrder;