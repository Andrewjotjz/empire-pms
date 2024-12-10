//import modules
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SessionExpired from "../components/SessionExpired";
import EmployeePageSkeleton from "./loaders/EmployeePageSkeleton";
import UnauthenticatedSkeleton from './loaders/UnauthenticateSkeleton';

const DeliveryPage = () => {
    //Component state declaration
    const [deliveryState, setDeliveryState] = useState({
        delivery_evidence_type: '',
        delivery_evidence_reference: '',
        products: [],
        delivery_receiving_date: new Date(),
        delivery_status: '',
        order: '',
        supplier: ''
});
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [isArchive, setIsArchive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDate, setSearchDate] = useState('');

    //Component router
    const navigate = useNavigate();

    //Component functions and variables
    const localUser = JSON.parse(localStorage.getItem('localUser'))

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

    const filterDeliveries = () => {
        return deliveryState.filter(delivery => {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
            // Check each field for the search term
            return (
                delivery.delivery_evidence_type.toLowerCase().includes(lowerCaseSearchTerm) ||
                delivery.delivery_evidence_reference.toLowerCase().includes(lowerCaseSearchTerm) ||
                delivery.delivery_status.toLowerCase().includes(lowerCaseSearchTerm) ||
                (delivery.order && delivery.order.order_ref.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (delivery.supplier && delivery.supplier.supplier_name.toLowerCase().includes(lowerCaseSearchTerm))
            );
        });
    };

    const filterBySelectedDate = (deliveries) => {
        if (!searchDate) return deliveries;
    
        const selected = new Date(searchDate);
        return deliveries.filter(delivery => {
            const deliveryDate = new Date(delivery.delivery_receiving_date);
            return (
                deliveryDate.getFullYear() === selected.getFullYear() &&
                deliveryDate.getMonth() === selected.getMonth() &&
                deliveryDate.getDate() === selected.getDate()
            );
        });
    };
    
    const handleOrderClick = (id) => {
        navigate(`/EmpirePMS/order/${id}`);
    }
    
    //Render component
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchDelivery = async () => {
            setIsLoadingState(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/delivery`, { signal , credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    }});
                if (!res.ok) {
                    throw new Error('Failed to fetch deliveries');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }
                
                setIsLoadingState(false);
                setDeliveryState(data);
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

        fetchDelivery();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, []);
    
    //Display DOM
    const deliveryTable = Array.isArray(deliveryState) && deliveryState.length > 0 ? (
        <div className="container text-sm overflow-x-auto">
            <table className="table table-bordered table-hover shadow-md w-full">
                <thead className="thead-dark text-center">
                    <tr className="table-primary">
                        <th scope="col">Receiving Date</th>
                        <th scope="col">PO Ref</th>
                        <th scope="col">Supplier</th>
                        <th scope="col" className="hidden sm:table-cell">Delivery Type</th>
                        <th scope="col" className="hidden sm:table-cell">Delivery Ref</th>
                        <th scope="col">Status</th>
                    </tr>
                </thead>
                <tbody className="text-xs sm:text-base">
                    {filterBySelectedDate(filterDeliveries().filter(delivery => delivery.delivery_isarchived === isArchive)).map(delivery => (
                        <tr key={delivery._id} onClick={() => handleOrderClick(delivery.order._id)} className="cursor-pointer text-center text-sm">
                            <td>{formatDateTime(delivery.delivery_receiving_date)}</td>
                            <td>{delivery.order.order_ref}</td>
                            <td>{delivery.supplier.supplier_name}</td>
                            <td className="hidden sm:table-cell">{delivery.delivery_evidence_type}</td>
                            <td className="hidden sm:table-cell">{delivery.delivery_evidence_reference}</td>
                            <td>
                                {delivery.delivery_status && (
                                    <label
                                        className={`text-sm font-bold m-1 py-0.5 px-1 rounded-xl ${
                                                delivery.delivery_status === "Partially delivered"
                                                ? "border-2 bg-transparent border-yellow-300 text-yellow-600"
                                                : delivery.delivery_status === "Delivered"
                                                ? "border-2 bg-transparent border-green-600 text-green-600"
                                                : ""
                                        }`}
                                    >
                                        {delivery.delivery_status}
                                    </label>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ) : (
        <div>Delivery API fetched successfully, but it might be empty...</div>
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
                    <h1 className='mx-auto uppercase font-bold text-md sm:text-xl'>DELIVERIES</h1>
                </div>
                <div className="card-body">
                    <div className="row mb-1">
                        <div className="col-md-6 mb-1">
                            <input
                                type="text"
                                className="form-control text-xs sm:text-base"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <div className="col-md-6 d-flex justify-content-start">
                            <input
                                type="date"
                                className="form-control text-xs sm:text-base"
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
                        {deliveryTable}
                    </div>
                </div>
            </div>
        </div> ) : ( <UnauthenticatedSkeleton /> )
    );
};
 
export default DeliveryPage;