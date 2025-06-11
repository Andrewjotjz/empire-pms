import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentsPage = () => {
  // Hooks
  const navigate = useNavigate();
  const localUser = JSON.parse(localStorage.getItem('localUser'))

  // States
  const [payments, setPayments] = useState([]);
  const [supplierState, setSupplierState] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentTab, setCurrentTab] = useState('current');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [isLoadingState, setIsLoadingState] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [isFetchSupplierLoading, setIsFetchSupplierLoading] = useState(false);
  const [fetchSupplierError, setFetchSupplierError] = useState(null);
  
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchPayments = async () => {
        setIsLoadingState(true);
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/payment`, { signal , credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                }});
            if (!res.ok) {
                throw new Error('Failed to fetch payment');
            }
            const data = await res.json();

            if (data.tokenError) {
                throw new Error(data.tokenError);
            }
            
            setIsLoadingState(false);
            setPayments(data);
            setFilteredPayments(data);
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

    fetchPayments();

    return () => {
        abortController.abort(); // Cleanup
    };
}, []);

  useEffect(() => {
    filterPayments();
  }, [searchTerm, startDate, endDate, currentTab, payments]);

  const filterPayments = () => {
    let filtered = payments.filter(payment => {
      const matchesSearch = payment.payment_ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            payment.payment_type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDateRange = (!startDate || new Date(payment.period_start_date) >= new Date(startDate)) &&
                               (!endDate || new Date(payment.period_end_date) <= new Date(endDate));
      const matchesTab = currentTab === 'current' ? payment.payment_status !== 'Archived' : payment.payment_status === 'Archived';
      return matchesSearch && matchesDateRange && matchesTab;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (sortConfig.key === 'payment_raw_total_amount_incl_gst' || sortConfig.key === 'period_start_date' || sortConfig.key === 'period_end_date') {
          return sortConfig.direction === 'ascending' ? new Date(a[sortConfig.key]) - new Date(b[sortConfig.key]) : new Date(b[sortConfig.key]) - new Date(a[sortConfig.key]);
        } else if (sortConfig.key === 'amount_due') {
          const aAmountDue = a.payment_raw_total_amount_incl_gst - a.payment_term.reduce((sum, term) => sum + (term.payment_amount_paid || 0), 0);
          const bAmountDue = b.payment_raw_total_amount_incl_gst - b.payment_term.reduce((sum, term) => sum + (term.payment_amount_paid || 0), 0);
          return sortConfig.direction === 'ascending' ? aAmountDue - bAmountDue : bAmountDue - aAmountDue;
        } else {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }
      });
    }

    setFilteredPayments(filtered);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedPayments = [...filteredPayments].sort((a, b) => {
      if (key === 'payment_raw_total_amount_incl_gst') {
        return direction === 'ascending' ? a[key] - b[key] : b[key] - a[key];
      }
      if (key === 'period_start_date' || key === 'period_end_date') {
        return direction === 'ascending'
          ? new Date(a[key]) - new Date(b[key])
          : new Date(b[key]) - new Date(a[key]);
      }
      if (key === 'amount_due') {
        const aAmountDue = a.payment_raw_total_amount_incl_gst - a.payment_term.reduce((sum, term) => sum + (term.payment_amount_paid || 0), 0);
        const bAmountDue = b.payment_raw_total_amount_incl_gst - b.payment_term.reduce((sum, term) => sum + (term.payment_amount_paid || 0), 0);
        return direction === 'ascending' ? aAmountDue - bAmountDue : bAmountDue - aAmountDue;
      }
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    setFilteredPayments(sortedPayments);
  };

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

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Payments</h1>
            {localUser.employee_roles === "Admin" && <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition duration-300 ease-in-out"
              onClick={() => {navigate(`/EmpirePMS/payment/create`)}}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-2 size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Payment
            </button>}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
            <div className="flex space-x-2">
              <button
                className={`px-3 py-2 rounded-lg font-medium transition duration-300 ease-in-out ${currentTab === 'current' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => setCurrentTab('current')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline mr-2 size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                Current
              </button>
              <button
                className={`px-3 py-2 rounded-lg font-medium transition duration-300 ease-in-out ${currentTab === 'archive' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => setCurrentTab('archive')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline mr-2 size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
                Archive
              </button>
            </div>
            <div className="flex space-x-2 w-full md:w-auto">
              <div className="relative flex-grow md:flex-grow-0">
                <input
                  type="text"
                  placeholder="Search keywords..."
                  className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-3 text-gray-400 size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <div className="relative">
                <input
                  type="date"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className='items-center'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mt-2 size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                </svg>
              </div>
              <div className="relative">
                <input
                  type="date"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { label: 'Payment Ref', key: 'payment_ref' },
                    { label: 'Supplier', key: 'supplier' },
                    { label: 'Method', key: 'payment_type' },
                    { label: 'Total Amount', key: 'payment_raw_total_amount_incl_gst' },
                    { label: 'Amount Due', key: 'amount_due' },
                    { label: 'Start Date', key: 'period_start_date' },
                    { label: 'End Date', key: 'period_end_date' },
                    { label: 'Status', key: 'payment_status' }
                  ].map(({ label, key }) => (
                    <th
                      key={key}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition duration-300 ease-in-out"
                      onClick={() => handleSort(key)}
                    >
                      <div className="flex items-center">
                        {label}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3 ml-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                        </svg>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 transition duration-300 ease-in-out">
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 hover:text-blue-500 hover:underline hover:cursor-pointer"
                        onClick={() => navigate(`/EmpirePMS/payment/${payment._id}`)}
                      >
                        {payment.payment_ref}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supplierState.find((supplier) => supplier._id === payment.supplier)?.supplier_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.payment_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        $ {payment.payment_raw_total_amount_incl_gst.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${" "}
                        {Math.floor(
                          (payment.payment_raw_total_amount_incl_gst -
                            payment.payment_term.reduce((totalSum, payment) => {
                              return totalSum + (payment?.payment_amount_paid || 0);
                            }, 0)) * 100
                        ) / 100}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.period_start_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.period_end_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.payment_status === "In Review"
                              ? "bg-gray-100 text-gray-800"
                              : payment.payment_status === "Overpaid"
                              ? "bg-yellow-100 text-yellow-800"
                              : payment.payment_status === "Statement Checked"
                              ? "bg-blue-100 text-blue-800"
                              : payment.payment_status === "Fully Settled"
                              ? "bg-green-100 text-green-800"
                              : payment.payment_status === "Partially Settled"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {payment.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-4 text-center text-gray-500">
                      No Payment found matching your criteria.
                      <span
                        className="text-blue-500 ml-2 hover:underline hover:cursor-pointer"
                        onClick={() => {
                          setSearchTerm("");
                          setStartDate("");
                          setEndDate("");
                        }}
                      >
                        Clear filter
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;


// import React, { useState, useEffect } from 'react';

// const PaymentsPage = () => {
//   const [payments, setPayments] = useState([]);
//   const [filteredPayments, setFilteredPayments] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [currentTab, setCurrentTab] = useState('current');
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
//   const [isLoadingState, setIsLoadingState] = useState(true);
//   const [errorState, setErrorState] = useState(null);

  
//   useEffect(() => {
//     const abortController = new AbortController();
//     const signal = abortController.signal;

//     const fetchPayments = async () => {
//         setIsLoadingState(true);
//         try {
//             const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/payment`, { signal , credentials: 'include',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
//                 }});
//             if (!res.ok) {
//                 throw new Error('Failed to fetch payment');
//             }
//             const data = await res.json();

//             if (data.tokenError) {
//                 throw new Error(data.tokenError);
//             }
            
//             setIsLoadingState(false);
//             setPayments(data);
//             setErrorState(null);
//         } catch (error) {
//             if (error.name === 'AbortError') {
//                 // do nothing
//             } else {
//                 setIsLoadingState(false);
//                 setErrorState(error.message);
//             }
//         }
//     };

//     fetchPayments();

//     return () => {
//         abortController.abort(); // Cleanup
//     };
// }, []);

//   useEffect(() => {
//     filterPayments();
//   }, [searchTerm, startDate, endDate, currentTab, payments]);

//   const filterPayments = () => {
//     let filtered = payments.filter(payment => {
//       const matchesSearch = payment.payment_ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                             payment.payment_type.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesDateRange = (!startDate || new Date(payment.period_start_date) >= new Date(startDate)) &&
//                                (!endDate || new Date(payment.period_end_date) <= new Date(endDate));
//       const matchesTab = currentTab === 'current' ? payment.payment_status !== 'Archived' : payment.payment_status === 'Archived';
//       return matchesSearch && matchesDateRange && matchesTab;
//     });

//     if (sortConfig.key) {
//       filtered.sort((a, b) => {
//         if (a[sortConfig.key] < b[sortConfig.key]) {
//           return sortConfig.direction === 'ascending' ? -1 : 1;
//         }
//         if (a[sortConfig.key] > b[sortConfig.key]) {
//           return sortConfig.direction === 'ascending' ? 1 : -1;
//         }
//         return 0;
//       });
//     }

//     setFilteredPayments(filtered);
//   };

//   const handleSort = (key) => {
//     let direction = 'ascending';
//     if (sortConfig.key === key && sortConfig.direction === 'ascending') {
//       direction = 'descending';
//     }
//     setSortConfig({ key, direction });
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Payments</h1>
      
//       <div className="flex justify-between mb-4">
//         <div className="flex space-x-2">
//           <button
//             className={`px-4 py-2 rounded ${currentTab === 'current' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
//             onClick={() => setCurrentTab('current')}
//           >
//             Current
//           </button>
//           <button
//             className={`px-4 py-2 rounded ${currentTab === 'archive' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
//             onClick={() => setCurrentTab('archive')}
//           >
//             Archive
//           </button>
//         </div>
//         <button
//           className="px-4 py-2 bg-green-500 text-white rounded"
//           onClick={() => {/* Navigate to new payment page */}}
//         >
//           New Payment
//         </button>
//       </div>

//       <div className="mb-4 flex space-x-2">
//         <input
//           type="text"
//           placeholder="Search payments..."
//           className="border p-2 rounded flex-grow"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <input
//           type="date"
//           className="border p-2 rounded"
//           value={startDate}
//           onChange={(e) => setStartDate(e.target.value)}
//         />
//         <input
//           type="date"
//           className="border p-2 rounded"
//           value={endDate}
//           onChange={(e) => setEndDate(e.target.value)}
//         />
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white">
//           <thead>
//             <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
//               <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('payment_ref')}>Payment Ref</th>
//               <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('payment_type')}>Type</th>
//               <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('payment_method')}>Method</th>
//               <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('payment_raw_total_amount_incl_gst')}>Amount</th>
//               <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('period_start_date')}>Start Date</th>
//               <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('period_end_date')}>End Date</th>
//               <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('payment_status')}>Status</th>
//             </tr>
//           </thead>
//           <tbody className="text-gray-600 text-sm font-light">
//             {filteredPayments.map((payment) => (
//               <tr key={payment._id} className="border-b border-gray-200 hover:bg-gray-100">
//                 <td className="py-3 px-6 text-left whitespace-nowrap">{payment.payment_ref}</td>
//                 <td className="py-3 px-6 text-left">{payment.payment_type}</td>
//                 <td className="py-3 px-6 text-left">{payment.payment_method}</td>
//                 <td className="py-3 px-6 text-left">${payment.payment_raw_total_amount_incl_gst.toFixed(2)}</td>
//                 <td className="py-3 px-6 text-left">{new Date(payment.period_start_date).toLocaleDateString()}</td>
//                 <td className="py-3 px-6 text-left">{new Date(payment.period_end_date).toLocaleDateString()}</td>
//                 <td className="py-3 px-6 text-left">{payment.payment_status}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default PaymentsPage;

