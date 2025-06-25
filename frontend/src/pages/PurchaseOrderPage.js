import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SessionExpired from "../components/SessionExpired";
import LoadingScreen from "./loaders/LoadingScreen";
import UnauthenticatedSkeleton from './loaders/UnauthenticateSkeleton';

const PurchaseOrder2 = () => {

    // Component state declaration
    const localUser = JSON.parse(localStorage.getItem('localUser'));
    const [purchaseOrderState, setPurchaseOrderState] = useState([])
    const navigate = useNavigate();
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [dateFilter, setDateFilter] = useState('');
    const [projectFilter, setProjectFilter] = useState('');
    const [supplierFilter, setSupplierFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [selectedPOs, setSelectedPOs] = useState(new Set());

    
    const [activeTab, setActiveTab] = useState('current');
    const [expandedRow, setExpandedRow] = useState(null);
    const [productState, setProductState] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredData, setFilteredData] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'order_date', direction: 'descending' });

    const [itemsPerPage, setItemsPerPage] = useState(10);

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

    const handleSelectPO = (id) => {
        const updatedSelectedPOs = new Set(selectedPOs);

        if(updatedSelectedPOs.has(id)) {
            updatedSelectedPOs.delete(id);
        } else {
            updatedSelectedPOs.add(id);
        }
        setSelectedPOs(updatedSelectedPOs)
    }

    const handleSelectAllPO = () => {
        if (Array.from(selectedPOs).length === 0) {
            setSelectedPOs(new Set(
                paginatedData
                    .filter(order => order.order_status === 'Pending' && !order.order_isarchived)
                    .map(order => order._id)
            ));
        } else {
            setSelectedPOs(new Set());
        }
    };

    const handleApproveMultiPO = async () => {

        const selectedPOsArray = Array.from(selectedPOs);

        if (selectedPOsArray.length > 0) {
            try {
                    // Update each new employee to add the current project to their projects array
                    await Promise.all(selectedPOsArray.map(async orderId => {
                         // Update the employee's projects array
                        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/order/${orderId}`, {
                            credentials: 'include', method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                            },
                            body: JSON.stringify({ order_status: "Approved" })
                        });

                        if (!res.ok) {
                            throw new Error(`Failed to update order ${orderId}`);
                        }
                }));
        
                // Close the addEmployees Propup
                setSelectedPOs(new Set());
                
                // Fetch the updated project details to refresh the UI
                await fetchPurchaseOrders();
    
            } catch (error) {
                console.error('Error updating employees:', error);
            }
        }

    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const pageCount = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Fetch Purchase Orders
    const fetchPurchaseOrders = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/order`, { credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                }});

            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await res.json();

            setPurchaseOrderState(data);
            setIsLoadingState(false);

        } catch (error) {
            setErrorState(error.tokenError);
        } finally {
            setIsLoadingState(false);
        }
    }, []);

    // Fetch Purchase Orders
    useEffect(() => {
        fetchPurchaseOrders();
    }, [fetchPurchaseOrders]);

    // Fetch Products
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchProducts = async () => {
            setIsLoadingState(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product`, { signal , credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    }});
                if (!res.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }
                
                setIsLoadingState(false);
                setProductState(data);
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

        fetchProducts();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, []);

    // Render changes for Sorting/Searching/Filtering
    useEffect(() => {
        if (!Array.isArray(purchaseOrderState)) {
            // Handle null or invalid purchaseOrderState
            setFilteredData([]);
            setCurrentPage(1);
            return;
        }
        
        let result = purchaseOrderState;

        // Filter by search term
        if (searchTerm) {
            result = result.filter(order =>
                order.order_ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.supplier.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.order_total_amount.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.order_status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.products.some(product => product.product_obj_ref.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || product.product_obj_ref.product_sku.toLowerCase().includes(searchTerm.toLowerCase()) || product.order_product_location.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filter by project
        if (projectFilter) {
            result = result.filter(order =>
                order.project.project_name.toLowerCase().includes(projectFilter.toLowerCase())
            );
        }

        // Filter by supplier
        if (supplierFilter) {
            result = result.filter(order =>
                order.supplier.supplier_name.toLowerCase().includes(supplierFilter.toLowerCase())
            );
        }

        // Filter by status
        if (statusFilter) {
            result = result.filter(order =>
                order.order_status.toLowerCase().includes(statusFilter.toLowerCase())
            );
        }

        // Filter by date
        if (dateFilter) {
            const selectedDate = new Date(dateFilter);
        
            // Filter by order_date
            let filteredResult = result.filter(order => {
                const orderDate = new Date(order.order_date);
                return (
                    orderDate.getFullYear() === selectedDate.getFullYear() &&
                    orderDate.getMonth() === selectedDate.getMonth() &&
                    orderDate.getDate() === selectedDate.getDate()
                );
            });
        
            // If no results, filter by order_est_datetime
            if (filteredResult.length === 0) {
                filteredResult = result.filter(order => {
                    const estDate = new Date(order.order_est_datetime);
                    return (
                        estDate.getFullYear() === selectedDate.getFullYear() &&
                        estDate.getMonth() === selectedDate.getMonth() &&
                        estDate.getDate() === selectedDate.getDate()
                    );
                });
            }
        
            result = filteredResult; // Update result with the filtered data
        }

        // Filter by tab (current/archive)
        result = result.filter(order => {
            return activeTab === 'current' ? order.order_isarchived === false : order.order_isarchived === true;
        });
        
        // Sort
        if (sortConfig.key) {
            if (sortConfig.key === "supplier_name") {
            result.sort((a, b) => {
                if (a.supplier[sortConfig.key] < b.supplier[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a.supplier[sortConfig.key] > b.supplier[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
            }
            if (sortConfig.key === "project_name") {
            result.sort((a, b) => {
                if (a.project[sortConfig.key] < b.project[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a.project[sortConfig.key] > b.project[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
            }
            else {
            result.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
            }
        }

        setFilteredData(result);
        setCurrentPage(1);
    }, [purchaseOrderState, activeTab, searchTerm, projectFilter, supplierFilter, statusFilter, dateFilter, sortConfig]);
    
    // Display Loading
    if (isLoadingState) {
        return <LoadingScreen />;
    }
    
    // Display error
    if (errorState) {
        if(errorState.includes("Session expired") || errorState.includes("jwt expired") || errorState.includes("jwt malformed")){
            return(<div><SessionExpired /></div>)
        }
        return (<div>Error: {errorState}</div>);
    }

    return (
        localUser && Object.keys(localUser).length > 0 ? (
        <div className="bg-gray-100 min-h-screen">
            {/* <div className="container mx-auto px-4 py-8"> */}
            <div className="px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    {/* Header and New Order */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">Purchase Orders</h1>
                        {localUser.employee_roles === "Admin" && <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition duration-300 ease-in-out"
                            onClick={() => navigate(`/EmpirePMS/order/create`)}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-2 size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            New Order
                        </button>}
                    </div>
                
                    {/* Search and Date Filter */}
                    <div className="flex mb-6 space-x-4">
                        {/* search bar */}
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm === '' ? 
                            (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute right-3 top-2.5 text-gray-400 size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute right-3 top-2.5 text-gray-400 size-6 hover:cursor-pointer hover:text-gray-600 hover:scale-110" onClick={() => setSearchTerm('')}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>)}
                        </div>
                        {/* project filter */}
                        <div className="relative">
                            <select
                                value={projectFilter}
                                name='project'
                                onChange={(e) => setProjectFilter(e.target.value)}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out ${projectFilter === '' ? 'bg-white' : 'bg-blue-100'}`}
                            >
                                <option value="" className="text-gray-400">- {projectFilter === '' ? `Project` : `clear filter`} -</option>
                                {Array.from(new Set(paginatedData.map(order => order.project.project_name))).map((projectName, index) => (
                                <option key={index} value={projectName}>
                                    {projectName}
                                </option>
                                ))}
                            </select>
                        </div>
                        {/* supplier filter */}
                        <div className="relative">
                            <select
                                value={supplierFilter}
                                name='supplier'
                                onChange={(e) => setSupplierFilter(e.target.value)}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out ${supplierFilter === '' ? 'bg-white' : 'bg-blue-100'}`}
                            >
                                <option value="" className="text-gray-400">- {supplierFilter === '' ? `Supplier` : `clear filter`} -</option>
                                {Array.from(new Set(paginatedData.map(order => order.supplier.supplier_name))).map((supplierName, index) => (
                                <option key={index} value={supplierName}>
                                    {supplierName}
                                </option>
                                ))}
                            </select>
                        </div>
                        {/* status filter */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                name='status'
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out ${statusFilter === '' ? 'bg-white' : 'bg-blue-100'}`}
                            >
                                <option value="" className="text-gray-400">- {statusFilter === '' ? `Status` : `clear filter`} -</option>
                                {Array.from(new Set(paginatedData.map(order => order.order_status))).map((statusName, index) => (
                                <option key={index} value={statusName}>
                                    {statusName}
                                </option>
                                ))}
                            </select>
                        </div>
                        {/* date filter */}
                        <div className="relative">
                        <input
                            type="date"
                            className={`p-2 pl-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${dateFilter === '' ? 'bg-white' : 'bg-blue-100'}`}
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                        </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex">
                        <button
                        className={`mr-2 px-6 py-2 rounded-t-lg font-medium transition-colors duration-200 ${
                            activeTab === 'current' ? 'bg-white text-blue-600 shadow-inner' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        onClick={() => setActiveTab('current')}
                        >
                        Current
                        </button>
                        <button
                        className={`mr-6 px-6 py-2 rounded-t-lg font-medium transition-colors duration-200 ${
                            activeTab === 'archive' ? 'bg-white text-blue-600 shadow-inner' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        onClick={() => setActiveTab('archive')}
                        >
                        Archive
                        </button>
                        
                        { Array.from(selectedPOs).length > 0 && activeTab !== 'archive' &&(
                        <div className="items-center justify-content-md-end text-xs sm:text-sm mb-1">
                            <span className="mr-2">{Array.from(selectedPOs).length} PO{Array.from(selectedPOs).length > 1 && <span>s</span>} selected</span>
                            <span className="mr-2">|</span>
                            <div className="inline-block">
                                <button className="px-6 py-2 rounded-lg font-medium transition-colors duration-200 bg-green-100 text-green-700 hover:bg-green-200" onClick={handleApproveMultiPO}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline-block size-5 mr-1">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    <label className="cursor-pointer">APPROVE ALL</label>
                                </button>
                            </div>
                        </div>)}
                    </div>
                    {/* Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase">
                                <th scope="col" hidden={!paginatedData.map(order => order.order_status).includes('Pending')} className="p-3">
                                    <input 
                                        className={`form-checkbox h-3 w-8 sm:h-4 sm:w-4 text-blue-600 hover:${localUser.employee_roles === "Admin" ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                        type="checkbox"
                                        checked={Array.from(selectedPOs).length === paginatedData.filter(order => order.order_status === 'Pending' && order.order_isarchived === false).length && Array.from(selectedPOs).length !== 0}
                                        onChange={handleSelectAllPO}
                                        disabled={activeTab === 'archive' || localUser.employee_roles !== "Admin"}
                                    />
                                </th>
                                <th className="p-3 cursor-pointer" onClick={() => requestSort('order_ref')}>
                                    PO
                                    {sortConfig.key === 'order_ref' && (
                                    sortConfig.direction === 'ascending' ? 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                    </svg> : 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                    )}
                                </th>
                                <th className="p-3 cursor-pointer" onClick={() => requestSort('order_date')}>
                                    Order Date
                                    {sortConfig.key === 'order_date' && (
                                    sortConfig.direction === 'ascending' ? 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                    </svg> : 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                    )}
                                </th>
                                <th className="p-3 cursor-pointer" onClick={() => requestSort('order_est_datetime')}>
                                    EST Date
                                    {sortConfig.key === 'order_est_datetime' && (
                                    sortConfig.direction === 'ascending' ? 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                    </svg> : 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                    )}
                                </th>
                                <th className="p-3 cursor-pointer" onClick={() => requestSort('project_name')}>
                                    Project
                                    {sortConfig.key === 'project_name' && (
                                    sortConfig.direction === 'ascending' ? 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                    </svg> : 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                    )}
                                </th>
                                <th className="p-3 cursor-pointer" onClick={() => requestSort('supplier_name')}>
                                    Supplier
                                    {sortConfig.key === 'supplier_name' && (
                                    sortConfig.direction === 'ascending' ? 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                    </svg> : 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                    )}
                                </th>
                                { localUser.employee_roles === "Admin" && <th className="p-3 cursor-pointer" onClick={() => requestSort('order_total_amount')}>
                                    Total Amount
                                    {sortConfig.key === 'order_total_amount' && (
                                    sortConfig.direction === 'ascending' ? 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                    </svg> : 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                    )}
                                </th>}
                                <th className="p-3">
                                    Invoice
                                </th>
                                <th className="p-3 cursor-pointer" onClick={() => requestSort('order_status')}>
                                    Status
                                    {sortConfig.key === 'order_status' && (
                                    sortConfig.direction === 'ascending' ? 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                    </svg> : 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                    )}
                                </th>
                                <th className="p-3 cursor-pointer">
                                    Placed by
                                </th>
                                <th className="p-3">Products</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((order) => (
                            <React.Fragment key={order._id}>
                                <tr className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                                    <td hidden={!paginatedData.map(order => order.order_status).includes('Pending')} className="p-3">
                                        <input 
                                            className={`form-checkbox h-3 w-3 sm:h-4 sm:w-4 text-blue-600 hover:${localUser.employee_roles === "Admin" ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                            type="checkbox"
                                            checked={selectedPOs.has(order._id)}
                                            onChange={() => handleSelectPO(order._id)}
                                            disabled={order.order_isarchived  || localUser.employee_roles !== "Admin"}
                                        />
                                    </td>
                                    <td className="p-3 text-blue-600 font-medium hover:cursor-pointer hover:underline" onClick={() => window.open(`/EmpirePMS/order/${order._id}`, '_blank')}>{order.order_ref}</td>
                                    <td className="p-3 text-gray-600">{formatDate(order.order_date)}</td>
                                    <td className="p-3 text-gray-600">{formatDateTime(order.order_est_datetime)}</td>
                                    <td className="p-3 text-gray-600">{order.project.project_name}</td>
                                    <td className="p-3 text-gray-600">{order.supplier.supplier_name}</td>
                                    { localUser.employee_roles === "Admin" && <td className="p-3 text-gray-600">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'AUD' }).format(Math.floor(order.order_total_amount * 100) / 100)}</td>}
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.invoices.length > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {`${order.invoices.length} Invoice${order.invoices.length > 1 ? 's' : ''}`}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        order.order_status === 'Approved' ? 'bg-green-100 text-green-800' :
                                        order.order_status === 'Pending' ? 'bg-lime-100 text-lime-800' :
                                        order.order_status === 'Cancelled' ? 'bg-gray-100 text-gray-800' :
                                        order.order_status === 'Draft' ? 'bg-blue-100 text-blue-800' :
                                        'bg-red-100 text-red-800'
                                        }`}>
                                        {order.order_status}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium`}>
                                        {order.order_internal_comments?.includes("[created by:") ? order.order_internal_comments.match(/\[created by: (.*?) \(/)?.[1] || order.order_internal_comments : "-"}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <button
                                        onClick={() => setExpandedRow(expandedRow === order._id ? null : order._id)}
                                        className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                                        >
                                        {order.products.length + order.custom_products.length} products
                                        {expandedRow === order._id ? 
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                        </svg> : 
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                        </svg>}
                                        </button>
                                    </td>
                                </tr>
                                {expandedRow === order._id && (
                                    <tr>
                                    <td colSpan="11" className="p-2 bg-gray-50">
                                        <div className="flex flex-col space-y-1">
                                        {order.products.map((product, index) => (
                                            <div key={index} className="bg-white py-1 px-2 rounded flex items-center text-sm border-b last:border-b-0">
                                                <span
                                                    title="product_sku"
                                                    className="text-indigo-600 text-xs border rounded px-1 bg-indigo-50 mr-2 whitespace-nowrap"
                                                >
                                                    {productState
                                                    ?.filter((prod) => prod.supplier === order.supplier._id)
                                                    .find((prod) => prod._id === product.product_obj_ref._id)?.product_sku || "Not found..."}
                                                </span>
                                                <span title="product_name" className="font-medium text-gray-700 max-w-2xl">
                                                    {productState
                                                    ?.filter((prod) => prod.supplier === order.supplier._id)
                                                    .find((prod) => prod._id === product.product_obj_ref._id)?.product_name || "Not found..."}
                                                </span>
                                                <span title="product.order_product_qty_a" className="text-gray-600 text-xs ml-auto whitespace-nowrap">
                                                    Location: {product.order_product_location} | Qty: {product.order_product_qty_a}
                                                </span>
                                            </div>
                                        ))}

                                        {order.custom_products.map((cusProd, index) => (
                                            <div key={index} className="bg-white py-1 px-2 rounded flex items-center text-sm border-b last:border-b-0">
                                                <span
                                                    title="product_sku"
                                                    className="text-indigo-600 text-xs border rounded px-1 bg-indigo-50 mr-2 whitespace-nowrap"
                                                >
                                                    {`CUSTOM ${index + 1}`}
                                                </span>
                                                <span title="product_name" className="font-medium text-gray-700 max-w-md">
                                                    {cusProd.custom_product_name || "Not found..."}
                                                </span>
                                                <span title="cusProd.order_product_qty_a" className="text-gray-600 text-xs ml-auto whitespace-nowrap">
                                                    Qty: {cusProd.custom_order_qty}
                                                </span>
                                            </div>
                                        ))}
                                        </div>
                                    </td>
                                    </tr>
                                )}
                            </React.Fragment>
                            ))}
                        </tbody>
                        </table>
                    </div>
            
                    {/* Pagination */}
                    <div className="mt-6 flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            Showing {Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredData.length, currentPage * itemsPerPage)} of {filteredData.length} entries -
                            <span className={`ml-2 text-blue-600 ${itemsPerPage === 10 ? 'inline-block' : 'hidden'} hover:cursor-pointer hover:underline`} onClick={() => {setItemsPerPage(150); setCurrentPage(1);}}>Show All</span>
                            <span className={`ml-2 text-blue-600 ${itemsPerPage === 150 ? 'inline-block' : 'hidden'} hover:cursor-pointer hover:underline`} onClick={() => {setItemsPerPage(10)}}>Show Less</span>
                        </p>
                        <p className="text-sm text-gray-600 font-bold">
                            Sum:
                            <span className="ml-1 font-normal">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'AUD' }).format(Math.floor(paginatedData.reduce((totalSum, order) => {return totalSum + (order.order_total_amount || 0);}, 0) * 100) / 100)}</span>
                        </p>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded bg-gray-200 text-gray-600 disabled:opacity-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                </svg>
                            </button>
                            {[...Array(pageCount)].map((_, i) => (
                                <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1 rounded ${
                                    currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                                }`}
                                >
                                {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(pageCount, prev + 1))}
                                disabled={currentPage === pageCount}
                                className="px-3 py-1 rounded bg-gray-200 text-gray-600 disabled:opacity-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      ) : ( <UnauthenticatedSkeleton /> )
     );
}
 
export default PurchaseOrder2;