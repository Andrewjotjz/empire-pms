//import modules
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SessionExpired from "../components/SessionExpired";
import LoadingScreen from "./loaders/LoadingScreen";
import UnauthenticatedSkeleton from './loaders/UnauthenticateSkeleton';

const InvoicePage2 = () => {
    //Component state declaration
    const [invoiceState, setInvoiceState] = useState([]);
    const [projectState, setProjectState] = useState([]);
    const [productTypeState, setProductTypeState] = useState([]);
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [projectFilter, setProjectFilter] = useState('');
    const [supplierFilter, setSupplierFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [activeTab, setActiveTab] = useState('current');
    const [expandedRow, setExpandedRow] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'invoice_received_date', direction: 'descending' });
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    //Component useHook
    const navigate = useNavigate();

    //Component functions and variables
    const localUser = JSON.parse(localStorage.getItem('localUser'))


    const formatDate = (dateString) => {
        if (dateString === null) {
            return ''
        }  else {
            const date = new Date(dateString);
            const options = { day: '2-digit', month: 'short', year: 'numeric' };
            return date.toLocaleDateString('en-AU', options).toUpperCase().replace(' ', '-').replace(' ', '-');
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

    const projectArray = paginatedData.map(invoice => invoice.order.project);

    const productTypeArray = paginatedData.map(invoice => invoice.products.map(product => product.product_obj_ref.product_type)).flat();
    
    // Fetch invoice
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchInvoice = async () => {
            setIsLoadingState(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/invoice`, { signal , credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    }});
                if (!res.ok) {
                    throw new Error('Failed to fetch invoices');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }
                
                setIsLoadingState(false);
                setInvoiceState(data);
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

        fetchInvoice();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, []);

    // Fetch Projects
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchProjects = async () => {
            setIsLoadingState(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project`, { signal , credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    }});
                if (!res.ok) {
                    throw new Error('Failed to fetch projects');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }
                
                setIsLoadingState(false);
                setProjectState(data);
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

        fetchProjects();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, []);

    // Fetch Product Types
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchProductTypes = async () => {
            setIsLoadingState(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product-type`, { signal , credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    }});
                if (!res.ok) {
                    throw new Error('Failed to fetch product types');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }
                
                setIsLoadingState(false);
                setProductTypeState(data);
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

        fetchProductTypes();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, []);

    // Render changes for Sorting/Searching/Filtering
    useEffect(() => {
        if (!Array.isArray(invoiceState)) {
            // Handle null or invalid invoiceState
            setFilteredData([]);
            setCurrentPage(1);
            return;
        }
        
        let result = invoiceState;

        // Filter by search term
        if (searchTerm) {
            result = result.filter(invoice =>
                invoice.invoice_ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
                projectState.find(project => project._id === invoice.order.project).project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.supplier.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.invoiced_calculated_total_amount_incl_gst.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.invoiced_raw_total_amount_incl_gst.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.invoice_status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.products.some(product => product.product_obj_ref.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || product.product_obj_ref.product_sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
                invoice.products.some(product => productTypeState.find(type => type._id === product.product_obj_ref.product_type).type_name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filter by project
        if (projectFilter) {
            result = result.filter(invoice =>
                projectState.find(project => project._id === invoice.order.project).project_name.toLowerCase().includes(projectFilter.toLowerCase())
            );
        }

        // Filter by supplier
        if (supplierFilter) {
            result = result.filter(invoice =>
                invoice.supplier.supplier_name.toLowerCase().includes(supplierFilter.toLowerCase())
            );
        }

        // Filter by product type
        if (typeFilter) {
            result = result.filter(invoice =>
                invoice.products.some(product => productTypeState.find(type => type._id === product.product_obj_ref.product_type).type_name.toLowerCase().includes(typeFilter.toLowerCase()))
            );
        }

        // Filter by status
        if (statusFilter) {
            result = result.filter(invoice =>
                invoice.invoice_status.toLowerCase().includes(statusFilter.toLowerCase())
            );
        }

        // Filter by date
        if (startDateFilter && endDateFilter) {
            const startDate = new Date(startDateFilter);
            const endDate = new Date(endDateFilter);
        
            // Filter invoices that fall within the range for any of the date fields
            const filteredResult = result.filter(invoice => {
                const issueDate = new Date(invoice.invoice_issue_date);
                const receivedDate = new Date(invoice.invoice_received_date);
                const dueDate = new Date(invoice.invoice_due_date);
        
                // Check if any date is within the range [startDate, endDate]
                return (
                    (issueDate >= startDate && issueDate <= endDate) ||
                    (receivedDate >= startDate && receivedDate <= endDate) ||
                    (dueDate >= startDate && dueDate <= endDate)
                );
            });
        
            result = filteredResult; // Update result with the filtered data
        }        
        // if (startDateFilter) {
        //     const selectedDate = new Date(startDateFilter);

        //     // Filter by invoice_issue_date
        //     let filteredResult = result.filter(invoice => {
        //         const issueDate = new Date(invoice.invoice_issue_date);
        //         return (
        //             issueDate.getFullYear() === selectedDate.getFullYear() &&
        //             issueDate.getMonth() === selectedDate.getMonth() &&
        //             issueDate.getDate() === selectedDate.getDate()
        //         );
        //     });

        //     // If no results, filter by invoice_received_date
        //     if (filteredResult.length === 0) {
        //         filteredResult = result.filter(invoice => {
        //             const receivedDate = new Date(invoice.invoice_received_date);
        //             return (
        //                 receivedDate.getFullYear() === selectedDate.getFullYear() &&
        //                 receivedDate.getMonth() === selectedDate.getMonth() &&
        //                 receivedDate.getDate() === selectedDate.getDate()
        //             );
        //         });
        //     }

        //     // If no results again, filter by invoice_due_date
        //     if (filteredResult.length === 0) {
        //         filteredResult = result.filter(invoice => {
        //             const dueDate = new Date(invoice.invoice_due_date);
        //             return (
        //                 dueDate.getFullYear() === selectedDate.getFullYear() &&
        //                 dueDate.getMonth() === selectedDate.getMonth() &&
        //                 dueDate.getDate() === selectedDate.getDate()
        //             );
        //         });
        //     }

        //     result = filteredResult; // Update result with the filtered data
        // }

        // Filter by tab (current/archive)
        result = result.filter(invoice => {
            return activeTab === 'current' ? invoice.invoice_isarchived === false : invoice.invoice_isarchived === true;
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
                    const projectA = projectState.find(project => project._id === a.order.project);
                    const projectB = projectState.find(project => project._id === b.order.project);
                    
                    const projectNameA = projectA ? projectA.project_name : '';
                    const projectNameB = projectB ? projectB.project_name : '';
                    
                    if (projectNameA < projectNameB) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (projectNameA > projectNameB) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                    return 0;
                });
            }            
            if (sortConfig.key === "order_ref") {
                result.sort((a, b) => {
                    if (a.order[sortConfig.key] < b.order[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (a.order[sortConfig.key] > b.order[sortConfig.key]) {
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
    }, [invoiceState, activeTab, searchTerm, projectFilter, supplierFilter, statusFilter, startDateFilter, endDateFilter, typeFilter, projectState, productTypeState, sortConfig]);

    // Display Loading
    if (isLoadingState) {
        return <LoadingScreen />;
    };

    // Display error
    if (errorState) {
        if(errorState.includes("Session expired") || errorState.includes("jwt expired") || errorState.includes("jwt malformed")){
            return(<div><SessionExpired /></div>)
        }
        return (<div>Error: {errorState}</div>);
    };

    console.log("paginatedData", paginatedData)

    return (
        localUser && Object.keys(localUser).length > 0 ? (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    {/* Header and New Invoice */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">Invoices</h1>
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition duration-300 ease-in-out"
                            onClick={() => navigate(`/EmpirePMS/invoice/create`)}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-2 size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            New Invoice
                        </button>
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
                        { projectState.length > 0 ? (
                        <div className="relative">
                            <select
                                value={projectFilter}
                                name='project'
                                onChange={(e) => setProjectFilter(e.target.value)}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out ${projectFilter === '' ? 'bg-white' : 'bg-blue-100'}`}
                            >
                                <option value="" className="text-gray-400">- {projectFilter === '' ? `Project` : `Clear Filter`} -</option>
                                {Array.from(new Set(projectArray)).map((projectId) => {
                                    const project = projectState.find((proj) => proj._id === projectId);

                                    // Ensure the project exists before rendering
                                    return project ? (
                                        <option key={project._id} value={project.project_name}>
                                            {project.project_name}
                                        </option>
                                    ) : null; // Skip if the project is not found
                                })}
                            </select>
                            </div>) : (
                        <div>
                            <select>
                                <option>Loading...</option>
                            </select>
                        </div>)}
                        {/* supplier filter */}
                        <div className="relative">
                            <select
                                value={supplierFilter}
                                name='supplier'
                                onChange={(e) => setSupplierFilter(e.target.value)}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out ${supplierFilter === '' ? 'bg-white' : 'bg-blue-100'}`}
                            >
                                <option value="" className="text-gray-400">- {supplierFilter === '' ? `Supplier` : `clear filter`} -</option>
                                {Array.from(new Set(paginatedData.map(invoice => invoice.supplier.supplier_name))).map((supplierName, index) => (
                                <option key={index} value={supplierName}>
                                    {supplierName}
                                </option>
                                ))}
                            </select>
                        </div>
                        {/* product type filter */}
                        {productTypeState.length > 0 ? (
                        <div className="relative">
                            <select
                                value={typeFilter}
                                name='product_type'
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out ${typeFilter === '' ? 'bg-white' : 'bg-blue-100'}`}
                            >
                                <option value="" className="text-gray-400">- {projectFilter === '' ? `Type` : `Clear Filter`} -</option>
                                {Array.from(new Set(productTypeArray)).map((typeId) => {
                                    const type = productTypeState.find((type) => type._id === typeId);

                                    // Ensure the type exists before rendering
                                    return type ? (
                                        <option key={type._id} value={type.type_name}>
                                            {type.type_name}
                                        </option>
                                    ) : null; // Skip if the type is not found
                                })}
                            </select>
                        </div>) : (
                        <div>
                            <select>
                                <option>Loading...</option>
                            </select>
                        </div>)}
                        {/* status filter */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                name='status'
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out ${statusFilter === '' ? 'bg-white' : 'bg-blue-100'}`}
                            >
                                <option value="" className="text-gray-400">- {statusFilter === '' ? `Status` : `clear filter`} -</option>
                                {Array.from(new Set(paginatedData.map(invoice => invoice.invoice_status))).map((statusName, index) => (
                                <option key={index} value={statusName}>
                                    {statusName}
                                </option>
                                ))}
                            </select>
                        </div>
                        {/* start date filter */}
                        <div className="relative">
                        <input
                            type="date"
                            className={`p-2 pl-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${startDateFilter === '' ? 'bg-white' : 'bg-blue-100'}`}
                            value={startDateFilter}
                            onChange={(e) => setStartDateFilter(e.target.value)}
                        />
                        </div>
                        <div className="relative self-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                            </svg>
                        </div>
                        {/* end date filter */}
                        <div className="relative">
                        <input
                            type="date"
                            className={`p-2 pl-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${endDateFilter === '' ? 'bg-white' : 'bg-blue-100'}`}
                            value={endDateFilter}
                            onChange={(e) => setEndDateFilter(e.target.value)}
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
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase">
                                <th className="p-3 cursor-pointer" onClick={() => requestSort('invoice_ref')}>
                                    Invoice Ref
                                    {sortConfig.key === 'invoice_ref' && (
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
                                <th className="p-3 cursor-pointer" onClick={() => requestSort('order_ref')}>
                                    Order Ref
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
                                <th className="p-3 cursor-pointer" onClick={() => requestSort('invoice_issue_date')}>
                                    Issued on
                                    {sortConfig.key === 'invoice_issue_date' && (
                                    sortConfig.direction === 'ascending' ? 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                    </svg> : 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                    )}
                                </th>
                                <th className="p-3 cursor-pointer" onClick={() => requestSort('invoice_received_date')}>
                                    Received on
                                    {sortConfig.key === 'invoice_received_date' && (
                                    sortConfig.direction === 'ascending' ? 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                    </svg> : 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                    )}
                                </th>
                                <th className="p-3 cursor-pointer" onClick={() => requestSort('invoice_due_date')}>
                                    Due on
                                    {sortConfig.key === 'invoice_due_date' && (
                                    sortConfig.direction === 'ascending' ? 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                    </svg> : 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                    )}
                                </th>
                                <th className="p-3 cursor-pointer" onClick={() => requestSort('invoiced_calculated_total_amount_incl_gst')}>
                                    Computed Total Amount (+gst)
                                    {sortConfig.key === 'invoiced_calculated_total_amount_incl_gst' && (
                                    sortConfig.direction === 'ascending' ? 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                    </svg> : 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                    )}
                                </th>
                                <th className="p-3 cursor-pointer" onClick={() => requestSort('invoiced_raw_total_amount_incl_gst')}>
                                    Raw Total Amount (+gst)
                                    {sortConfig.key === 'invoiced_raw_total_amount_incl_gst' && (
                                    sortConfig.direction === 'ascending' ? 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                    </svg> : 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                    )}
                                </th>
                                <th className="p-3 cursor-pointer" onClick={() => requestSort('invoice_status')}>
                                    Status
                                    {sortConfig.key === 'invoice_status' && (
                                    sortConfig.direction === 'ascending' ? 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                    </svg> : 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                    )}
                                </th>
                                <th className="p-3">Products</th>
                                <th className="p-3">Payment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((invoice) => (
                            <React.Fragment key={invoice._id}>
                                <tr className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                                    <td className="p-3 text-blue-600 font-medium hover:cursor-pointer hover:underline" onClick={() => navigate(`/EmpirePMS/invoice/${invoice._id}`)}>{invoice.invoice_ref}</td>
                                    <td className="p-3 text-black font-medium hover:cursor-pointer hover:underline" onClick={() => navigate(`/EmpirePMS/supplier/${invoice.supplier._id}`)}>{invoice.supplier.supplier_name}</td>
                                    <td className="p-3 text-black font-medium hover:cursor-pointer hover:underline" onClick={() => navigate(`/EmpirePMS/project/${invoice.order.project}`)}>{projectState.find(project => project._id === invoice.order.project)?.project_name || 'Not found'}</td>
                                    <td className="p-3 text-black font-medium hover:cursor-pointer hover:underline" onClick={() => navigate(`/EmpirePMS/order/${invoice.order._id}`)}>{invoice.order.order_ref}</td>
                                    <td className="p-3 text-gray-600">{formatDate(invoice.invoice_issue_date)}</td>
                                    <td className="p-3 text-gray-600">{formatDate(invoice.invoice_received_date)}</td>
                                    <td className="p-3 text-gray-600">{formatDate(invoice.invoice_due_date)}</td>
                                    <td className="p-3 text-gray-600">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor(invoice.invoiced_calculated_total_amount_incl_gst * 100) / 100)}</td>
                                    <td className="p-3 text-gray-600">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor(invoice.invoiced_raw_total_amount_incl_gst * 100) / 100)}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        invoice.invoice_status === 'Settled' ? 'bg-green-100 text-green-800' :
                                        invoice.invoice_status === 'To review' ? 'bg-orange-100 text-orange-800' :
                                        invoice.invoice_status === 'Cancelled' ? 'bg-gray-100 text-gray-800' :
                                        invoice.invoice_status === 'Reviewed' ? 'bg-blue-100 text-blue-800' :
                                        'bg-red-100 text-red-800'
                                        }`}>
                                        {invoice.invoice_status}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <button
                                        onClick={() => setExpandedRow(expandedRow === invoice._id ? null : invoice._id)}
                                        className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                                        >
                                        {invoice.products.length} products
                                        {expandedRow === invoice._id ? 
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                        </svg> : 
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                        </svg>}
                                        </button>
                                    </td>
                                    <td 
                                        className={`p-3 font-medium ${
                                            invoice?.payment?.payment_ref 
                                            ? "text-black hover:cursor-pointer hover:underline" 
                                            : "text-gray-600 font-normal"
                                        }`} 
                                        onClick={() => invoice?.payment?._id && navigate(`/EmpirePMS/payment/${invoice.payment._id}`)}
                                        >
                                        {invoice?.payment?.payment_ref || "None"}
                                    </td>
                                </tr>
                                {expandedRow === invoice._id && (
                                <tr>
                                    <td colSpan="12" className="p-3 bg-gray-50">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                            {invoice.products.map((product, index) => (
                                            <div key={index} className="bg-white p-3 rounded shadow-sm">
                                                <p title='product_sku' className="text-indigo-600 text-xs border rounded-lg p-1 w-fit bg-indigo-50">{product.product_obj_ref.product_sku} - {productTypeState.find(type => type._id === product.product_obj_ref.product_type).type_name || 'Not found'}</p>
                                                <p title='product_name' className="font-medium text-gray-700 text-sm">
                                                {product.product_obj_ref.product_name}
                                                </p>
                                                <p title='product.invoice_product_qty_a' className="text-gray-600 text-xs">Invoiced Qty: {product.invoice_product_qty_a}</p>
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
                        <div>
                            <p className="text-sm text-gray-600 inline-block font-bold">
                                Sum (computed):
                                <span className="ml-1 font-normal">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor(paginatedData.reduce((totalSum, invoice) => {return totalSum + (invoice.invoiced_calculated_total_amount_incl_gst || 0);}, 0) * 100) / 100)}</span>
                            </p>
                            <p className="text-sm text-gray-600 inline-block font-bold ml-3">
                                Sum (raw):
                                <span className="ml-1 font-normal">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor(paginatedData.reduce((totalSum, invoice) => {return totalSum + (invoice.invoiced_raw_total_amount_incl_gst || 0);}, 0) * 100) / 100)}</span>
                            </p>
                        </div>
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
};
 
export default InvoicePage2;