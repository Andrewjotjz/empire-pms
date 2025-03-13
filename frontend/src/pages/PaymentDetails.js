import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';


import SessionExpired from "../components/SessionExpired"
import LoadingScreen from "./loaders/LoadingScreen"
import UnauthenticatedSkeleton from './loaders/UnauthenticateSkeleton';

const PaymentDetails = () => {
    // Hooks
    const navigate = useNavigate();
    const { id } = useParams();

    // Variables
    const getCurrentDate = () => {
        const today = new Date();
        // Format the date as YYYY-MM-DD
        return today.toLocaleDateString("en-AU", {
            timeZone: "Australia/Melbourne",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
          }).split("/").reverse().join("-");
    };
    const getFirstDayOfPreviousMonth = () => {
        const today = new Date();
        
        // Set to the first day of the current month
        today.setDate(1);
        
        // Move back one month
        today.setMonth(today.getMonth() - 1);
        
        // Format the date as YYYY-MM-DD
        return today.toLocaleDateString("en-AU", {
            timeZone: "Australia/Melbourne",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).split("/").reverse().join("-");
    };
    const getLastDayOfPreviousMonth = () => {
        const today = new Date();
    
        // Set to the first day of the current month
        today.setDate(1);
    
        // Move back one day to get the last day of the previous month
        today.setDate(today.getDate() - 1);
    
        // Format the date as YYYY-MM-DD
        return today.toLocaleDateString("en-AU", {
            timeZone: "Australia/Melbourne",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).split("/").reverse().join("-");
    };
    const formatDate = (dateString) => {
        if (dateString === null) {
            return ''
        }  else {
            const date = new Date(dateString);
            const options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
            return date.toLocaleDateString('en-AU', options).toUpperCase()
        }
    };
    const paymentType = ['Invoice', 'Bulk invoices (statement)'];
    const paymentMethod = ['Bank transfer', 'Credit card', 'Cash', 'Letter of credit', 'Others'];
    const [supplierState, setSupplierState] = useState([]);
    const [projectState, setProjectState] = useState([]);
    const [invoiceState, setInvoiceState] = useState([]);
    const [targetInvoices, setTargetInvoices] = useState([]); // To display invoices in the table
    const [isFetchSupplierLoading, setIsFetchSupplierLoading] = useState(false);
    const [fetchSupplierError, setFetchSupplierError] = useState(null);
    const [isFetchProjectLoading, setIsFetchProjectLoading] = useState(false);
    const [fetchProjectError, setFetchProjectError] = useState(null);
    const [isFetchInvoiceLoading, setIsFetchInvoiceLoading] = useState(false);
    const [fetchInvoiceError, setFetchInvoiceError] = useState(null);
    const [isFetchPaymentLoading, setIsFetchPaymentLoading] = useState(false);
    const [fetchPaymentError, setFetchPaymentError] = useState(null);
    const [paymentState, setPaymentState] = useState({
        payment_type: '',
        payment_ref: '',
        supplier: '',
        payment_method: '',
        payment_term: [{
            payment_datetime: getCurrentDate(),
            payment_amount_paid: 0
        }],
        payment_raw_total_amount_incl_gst: 0,
        period_start_date: getFirstDayOfPreviousMonth(),
        period_end_date: getLastDayOfPreviousMonth(),
        invoices: [
            {
                invoice_obj_ref: '',
                invoice_ref: '',
                invoice_issue_date: '',
                invoice_status: '',
                gross_total_amount: 0
            }
        ],
        payment_status: 'Draft',
        employees: ['66833b93269c01bc18cc6223'],
        payment_internal_comments: ''
    });
    
    const localUser = JSON.parse(localStorage.getItem('localUser'))

    const totalBalance = Math.floor(
        (targetInvoices.reduce((totalSum, invoice) => {
          return totalSum + (invoice?.invoiced_raw_total_amount_incl_gst || 0);
        }, 0) -
        paymentState.payment_term.reduce((totalSum, payment) => {
          return totalSum + (payment?.payment_amount_paid || 0);
        }, 0)) * 100
      ) / 100;

    // Functions
    const handleChange = (e) => {
        const { name, value } = e.target;

        setPaymentState((prevPayment) => ({
        ...prevPayment,
        [name]: name === "payment_raw_total_amount_incl_gst" ? Number(value) : value,
        }));

        if (name === "supplier") {
            let filteredInvoices = invoiceState.filter(invoice => invoice.supplier._id === value && !invoice.invoice_isarchived);
            setTargetInvoices(filteredInvoices)
        }

        if (name === "period_start_date") {
            let filteredInvoices = invoiceState.filter(invoice => invoice.supplier._id === paymentState.supplier && invoice.invoice_issue_date.split('T')[0] >= value && invoice.invoice_issue_date.split('T')[0] <= paymentState.period_end_date);
            setTargetInvoices(filteredInvoices)
        }
        if (name === "period_end_date") {
            let filteredInvoices = invoiceState.filter(invoice => invoice.supplier._id === paymentState.supplier && invoice.invoice_issue_date.split('T')[0] >= paymentState.period_start_date && invoice.invoice_issue_date.split('T')[0] <= value)
            setTargetInvoices(filteredInvoices)
        }
    }

    const handlePaymentTerm = (index, field, value) => {
        setPaymentState({
          ...paymentState,
          payment_term: paymentState.payment_term.map((term, i) =>
            i === index ? { ...term, [field]: field === "payment_amount_paid" ? Number(value) : value } : term
          )
        });
      };      
    
      const addPaymentTerm = () => {
        setPaymentState({
          ...paymentState,
          payment_term: [
            ...paymentState.payment_term,
            { payment_datetime: '', payment_amount_paid: 0 }
          ]
        });
      };
    
      const removePaymentTerm = (id) => {
        setPaymentState({
          ...paymentState,
          payment_term: paymentState.payment_term.filter((_, idx) => idx !== id)
        });
      };

    const handleRemoveInvoice = (ivcIndex) => {
        const updatedInvoices = targetInvoices.filter((_, idx) => idx !== ivcIndex);
        setTargetInvoices(updatedInvoices);
    };
    
    // Fetch supplier
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchSuppliers = async () => {
            setIsFetchSupplierLoading(true); // Set loading state to true at the beginning
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/supplier`, { signal , credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    }});
                if (!res.ok) {
                    throw new Error('Failed to fetch');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }
                
                setIsFetchSupplierLoading(false);
                setSupplierState(data);
                setFetchSupplierError(null);
            } catch (error) {
                if (error.name === 'AbortError') {
                    // do nothing
                } else {
                    setIsFetchSupplierLoading(false);
                    setFetchSupplierError(error.message);
                }
            }
        };

        fetchSuppliers();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, []);
    // Fetch project
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchProjects = async () => {
            setIsFetchProjectLoading(true); // Set loading state to true at the beginning
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project`, { signal , credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    }});
                if (!res.ok) {
                    throw new Error('Failed to fetch');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }
                
                setIsFetchProjectLoading(false);
                setProjectState(data);
                setFetchProjectError(null);
            } catch (error) {
                if (error.name === 'AbortError') {
                    // do nothing
                } else {
                    setIsFetchProjectLoading(false);
                    setFetchProjectError(error.message);
                }
            }
        };

        fetchProjects();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, []);
    // Fetch invoices
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchInvoices = async () => {
            setIsFetchInvoiceLoading(true); // Set loading state to true at the beginning
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/invoice`, { signal , credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    }});
                if (!res.ok) {
                    throw new Error('Failed to fetch');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }
                
                setIsFetchInvoiceLoading(false);
                setInvoiceState(data);
                setFetchInvoiceError(null);
            } catch (error) {
                if (error.name === 'AbortError') {
                    // do nothing
                } else {
                    setIsFetchInvoiceLoading(false);
                    setFetchInvoiceError(error.message);
                }
            }
        };

        fetchInvoices();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, []);
    // Fetch payment
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchPayment = async () => {
            setIsFetchPaymentLoading(true); // Set loading state to true at the beginning
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/payment/${id}`, { 
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

                setIsFetchPaymentLoading(false);
                setPaymentState(data); // Save fetched payment to state
                setFetchPaymentError(null);

                // Check if invoiceState is populated before mapping
                if (invoiceState.length > 0) {
                    const mappedInvoices = data.invoices.map(fetchedInvoice => 
                        invoiceState.find(invoice => invoice._id === fetchedInvoice.invoice_obj_ref) || null
                    );
                    setTargetInvoices(mappedInvoices);
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    // do nothing
                } else {
                    setIsFetchPaymentLoading(false);
                    setFetchPaymentError(error.message);
                }
            }
        };

        fetchPayment();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, [invoiceState]); // Re-run fetchPayment when invoiceState changes


    if (isFetchInvoiceLoading || isFetchProjectLoading || isFetchSupplierLoading || isFetchPaymentLoading) { return (<LoadingScreen />); }

    if (fetchSupplierError) {
        if(fetchSupplierError.includes("Session expired") || fetchSupplierError.includes("jwt expired") || fetchSupplierError.includes("jwt malformed")){
            return(<div><SessionExpired /></div>)
        }
        return (<div>Error: {fetchSupplierError}</div>);
    }

    return ( 
        localUser && Object.keys(localUser).length > 0 ? (
        <form  onKeyDown={(e) => { if (e.key === 'Enter') {e.preventDefault();} }} className='p-4 pt-1'>
            <h1 className='text-2xl font-medium m-1 mt-0'>PAYMENT DETAILS</h1>
            {/* PAYMENT DETAILS */}
            <div className="grid grid-cols-3 gap-4 p-4 border-2 rounded-xl shadow-sm bg-gray-50">
                <div className='w-full'>
                    <label className="block text-sm font-medium text-gray-700 mb-1">* Payment Reference:</label>
                    <input 
                        type="text"
                        disabled
                        name="payment_ref"
                        value={paymentState.payment_ref}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                    />
                </div>
                <div className='w-full'>
                    <label className="block text-sm font-medium text-gray-700 mb-1">* Supplier:</label>
                    <select
                        name="supplier"
                        disabled
                        value={paymentState.supplier}
                        onChange={handleChange}
                        className="disabled:bg-gray-100 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                    >
                        <option value="">Select supplier</option>
                        {supplierState.map((supplier,index) => (
                            <option key={index} value={supplier._id}>{supplier.supplier_name}</option>
                        ))}
                    </select>
                </div>
                <div className='w-full'>
                    <label className="block text-sm font-medium text-gray-700 mb-1">* Payment Method:</label>
                    <select
                        name="payment_method"
                        disabled
                        value={paymentState.payment_method}
                        onChange={handleChange}
                        className="disabled:bg-gray-100 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                    >
                        <option value="">Select method</option>
                        {paymentMethod.map((method,index) => (
                            <option key={index} value={method}>{method}</option>
                        ))}
                    </select>
                </div>
                <div className='w-full'>
                    <label className="block text-sm font-medium text-gray-700 mb-1">* Payment Type:</label>
                    <select 
                        name="payment_type"
                        disabled
                        value={paymentState.payment_type}
                        onChange={handleChange}
                        className="disabled:bg-gray-100 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                    >
                        <option value="">Select type</option>
                        {paymentType.map((type,index) => (
                            <option key={index} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <div className='w-full'>
                    <label className="block text-sm font-medium text-gray-700 mb-1">* Printed Total Amount (incl. GST):</label>
                    <input 
                        type="number"
                        disabled
                        name="payment_raw_total_amount_incl_gst"
                        value={paymentState.payment_raw_total_amount_incl_gst}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                    />
                </div>
            </div>

            {/* INVOICES + ORDERS */}
            <div className='mt-2 p-4 border-2 rounded-xl shadow-sm bg-gray-50'>
                <h2 className='text-lg font-medium text-gray-700 mb-2'>INVOICES</h2>
                {/* START DATE - END DATE */}
                <div className="grid grid-cols-2 gap-4">
                    <div className='w-full'>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select start date:</label>
                        <input 
                            type="date"
                            disabled
                            name="period_start_date"
                            value={paymentState.period_start_date.split("T")[0]}
                            onChange={handleChange}
                            className="disabled:bg-gray-100 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                        />
                    </div>
                    <div className='w-full'>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select end date:</label>
                        <input 
                            type="date"
                            disabled
                            name="period_end_date"
                            value={paymentState.period_end_date.split("T")[0]}
                            onChange={handleChange}
                            className="disabled:bg-gray-100 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                        />
                    </div>
                </div>
                {/* ***** INVOICES TABLE ****** */}
                <div className="bg-white border rounded-lg shadow-md mt-6 overflow-hidden">
                    <div className="overflow-x-auto flex">
                        <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-indigo-300">
                            <tr>
                            <th scope="col" className="hidden lg:table-cell px-6 py-3 font-semibold text-gray-900">Invoice Ref.</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-gray-900">Issue Date</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-gray-900">Invoice Status</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-gray-900 border-l-2 border-indigo-200">Order No.</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-gray-900">Supplier</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-gray-900">Project</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-gray-900">Order Status</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-gray-900 border-l-2 border-indigo-200">Gross Amount</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-gray-900"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Target Invoices */}
                            {targetInvoices && targetInvoices.map((invoice, ivcIndex) => (
                            <tr key={ivcIndex} className="border-b hover:bg-gray-50">
                                <td className="hidden lg:table-cell px-6 py-4 font-medium text-gray-900 hover:cursor-pointer hover:text-blue-500 hover:underline" onClick={() => window.open(`/EmpirePMS/invoice/${invoice._id}`, '_blank')}>{invoice.invoice_ref}</td>
                                <td className="px-6 py-4">{formatDate(invoice.invoice_issue_date)}</td>
                                <td className="px-6 py-4">
                                    <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        invoice.invoice_status === 'Paid' 
                                        ? 'bg-green-100 text-green-800' 
                                        : invoice.invoice_status === 'Pending' 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : invoice.invoice_status === 'Draft' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : invoice.invoice_status === 'Reviewed' 
                                        ? 'bg-purple-100 text-purple-800' 
                                        : invoice.invoice_status === 'Fully Settled' 
                                        ? 'bg-teal-100 text-teal-800' 
                                        : invoice.invoice_status === 'Partially Settled' 
                                        ? 'bg-orange-100 text-orange-800' 
                                        : 'bg-red-100 text-red-800' // Default case
                                    }`}
                                    >
                                    {invoice.invoice_status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 border-l-2 border-slate-50 font-medium text-gray-900 hover:cursor-pointer hover:text-blue-500 hover:underline" onClick={() => window.open(`/EmpirePMS/order/${invoice.order._id}`, '_blank')}>{invoice.order.order_ref}</td>                         
                                <td className="px-6 py-4">{supplierState.find((supplier) => supplier._id === invoice.order.supplier).supplier_name}</td>                         
                                <td className="px-6 py-4">{projectState.find((project) => project._id === invoice.order.project).project_name}</td>                         
                                <td className="px-6 py-4">
                                    <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        invoice.order.order_status === 'Approved' 
                                        ? 'bg-green-100 text-green-800' 
                                        : invoice.order.order_status === 'Pending' 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : invoice.order.order_status === 'Draft' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : invoice.order.order_status === 'Cancelled' 
                                        ? 'bg-gray-100 text-gray-800' 
                                        : invoice.order.order_status === 'Rejected' 
                                        ? 'bg-orange-100 text-orange-800' 
                                        : 'bg-red-100 text-red-800' // Default case
                                    }`}
                                    >
                                    {invoice.order.order_status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 border-l-2 border-slate-50">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor(invoice.invoiced_raw_total_amount_incl_gst * 100) / 100)}</td>                 
                                <td className="px-6 py-4">
                                    <button
                                        hidden
                                        type="button"
                                        className="text-red-600 hover:text-red-900 focus:outline-none"
                                        onClick={() => handleRemoveInvoice(ivcIndex)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                            ))}
                            {/* Amount Calculation */}
                            <tr className="border-b bg-gray-50">
                                <td colSpan={6} className="px-6 py-3"></td>
                                <td className="px-6 py-3 font-bold text-right">Total Amount:</td>
                                <td className="px-6 py-3 font-bold">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor((targetInvoices.reduce((totalSum, invoice) => {
                                        return totalSum + invoice?.invoiced_raw_total_amount_incl_gst
                                    }, 0)) * 100) / 100)}
                                </td>                                
                                <td className="px-6 py-3 font-bold"></td>
                            </tr>
                            <tr className="border-b bg-gray-50">
                                <td colSpan={6} className="px-6 py-3"></td>
                                <td className="px-6 py-3 font-bold text-right">Total Due:</td>
                                <td className={`px-6 py-3 font-bold ${totalBalance === 0 ? 'text-black' : 'text-red-500'}`}>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalBalance)}
                                    {totalBalance === 0 && 
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-5 text-green-500 inline-block ml-2`}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                                    </svg>}
                                </td>
                                <td className="px-6 py-3 font-bold"></td>
                            </tr>
                        </tbody>
                        </table>
                    </div>
                </div>
            </div>

            
            {/* PAYMENT COMMENT and PAYMENT TOTAL */}
            <div className='mt-2 p-4 border-2 rounded-xl shadow-sm bg-gray-50'>
                {/* PAYMENT COMMENT */}
                    <div className='w-full mb-4'>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment internal comments:</label>
                    <textarea
                        rows={2}
                        disabled
                        name="payment_internal_comments"
                        value={paymentState.payment_internal_comments}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                    />
                    </div>
                
                {/* PAYMENT DATE and PAYMENT AMOUNT */}
                    {paymentState.payment_term.map((term, index) => (
                    <div key={index} className='flex flex-col sm:flex-row gap-4 mb-4 p-4 bg-white rounded-lg shadow'>
                        <div className='w-full sm:w-1/2'>
                        <label className="block text-sm font-medium text-gray-700 mb-1">* Payment Date:</label>
                        <input 
                            type="date"
                            disabled
                            value={term.payment_datetime.split("T")[0]}
                            onChange={(e) => handlePaymentTerm(index, 'payment_datetime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                        />
                        </div>
                        <div className='w-full sm:w-1/2'>
                        <label className="block text-sm font-medium text-gray-700 mb-1">* Payment Total Amount (incl. GST):</label>
                        <input 
                            type="number"
                            disabled
                            value={term.payment_amount_paid}
                            onChange={(e) => handlePaymentTerm(index, 'payment_amount_paid', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                        />
                        </div>
                        <div className="items-center mb-2">
                            <h3 className="text-xs mb-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out flex items-center text-nowrap font-semibold">Term {index + 1}</h3>
                            {paymentState.payment_term.length > 1 && (
                                <button 
                                type="button"
                                onClick={() => removePaymentTerm(index)}
                                hidden
                                className="px-2 py-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                                </svg>
                                </button>
                            )}
                        </div>
                    </div>
                    ))}

                    <button 
                    type="button"
                    hidden
                    onClick={addPaymentTerm}
                    className="mb-4 px-4 py-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-150 ease-in-out flex items-center"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Payment Term
                    </button>

                    {/* Cancel and Submit button */}
                    <div className='mt-2 grid grid-cols-2 gap-72'>
                    <button
                        type="button"
                        className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out text-sm"
                        onClick={() => navigate(`/EmpirePMS/payment`)}
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out text-sm"
                        onClick={() => navigate(`/EmpirePMS/payment/${id}/edit`)}
                    >
                        Update
                    </button>
                    </div>
                </div>
        </form>
     ) : ( <UnauthenticatedSkeleton /> ));
}
 
export default PaymentDetails;