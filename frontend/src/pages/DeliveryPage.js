import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import SessionExpired from "../components/SessionExpired";
import LoadingOverlay from "./loaders/LoadingScreen";
import UnauthenticatedSkeleton from './loaders/UnauthenticateSkeleton';

const itemsPerPage = 10;

export default function DeliveryPage() {

  const [activeTab, setActiveTab] = useState('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null);
  const [deliveryState, setDeliveryState] = useState([]);
  const [productState, setProductState] = useState([]);
  const [isLoadingState, setIsLoadingState] = useState(true);
  const [errorState, setErrorState] = useState(null);

  const navigate = useNavigate();
  const localUser = JSON.parse(localStorage.getItem('localUser'))

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

  useEffect(() => {
    let result = deliveryState;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(item =>
        item.delivery_evidence_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.delivery_status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date
    if (dateFilter) {
      result = result.filter(item =>
        item.delivery_receiving_date.startsWith(dateFilter)
      );
    }

    // Filter by tab (current/archive)
    result = result.filter(item => {
        return activeTab === 'current' ? item.delivery_isarchive === false : item.delivery_isarchive === true;
    });
    // // const currentDate = new Date();
    // // result = result.filter(item => {
    // //   const itemDate = new Date(item.delivery_receiving_date);
    // //   return activeTab === 'current' ? itemDate >= currentDate : itemDate < currentDate;
    // // });

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
  }, [deliveryState, activeTab, searchTerm, dateFilter, sortConfig]);

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

  return (
    localUser && Object.keys(localUser).length > 0 ? (
    <div className="bg-gray-100 min-h-screen">
    <div className="container mx-auto px-4 py-8">
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Delivery Management</h1>      
      
      {/* Search and Date Filter */}
      <div className="flex mb-6 space-x-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search deliveries..."
            className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute right-3 top-2.5 text-gray-400 size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>

        <div className="relative">
          <input
            type="date"
            className="p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className={`px-6 py-2 rounded-t-lg font-medium transition-colors duration-200 ${
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
              <th className="p-3 cursor-pointer" onClick={() => requestSort('delivery_evidence_reference')}>
                Reference
                {sortConfig.key === 'delivery_evidence_reference' && (
                  sortConfig.direction === 'ascending' ? 
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                  </svg> : 
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                )}
              </th>
              <th className="p-3 cursor-pointer" onClick={() => requestSort('delivery_receiving_date')}>
                Date
                {sortConfig.key === 'delivery_receiving_date' && (
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
                Order No.
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
              <th className="p-3 cursor-pointer" onClick={() => requestSort('delivery_status')}>
                Receiving
                {sortConfig.key === 'delivery_status' && (
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
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <React.Fragment key={item._id}>
                <tr className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                  <td className="p-3 text-blue-600 font-medium hover:cursor-pointer hover:underline" onClick={() => navigate(`/EmpirePMS/delivery/${item._id}`)}>{item.delivery_evidence_reference}</td>
                  <td className="p-3 text-gray-600">{item.delivery_receiving_date}</td>
                  <td className="p-3 text-gray-600">{item.order.order_ref}</td>
                  <td className="p-3 text-gray-600">{item.supplier.supplier_name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.delivery_status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      item.delivery_status === 'Partially delivered' ? 'bg-lime-100 text-lime-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.delivery_status === 'Delivered' ? 'Full' : 'Partial'}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setExpandedRow(expandedRow === item._id ? null : item._id)}
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                    >
                      {item.products.filter(p => p.delivered_qty_a > 0).length} products
                      {expandedRow === item._id ? 
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                      </svg> : 
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>}
                    </button>
                  </td>
                </tr>
                {expandedRow === item._id && (
                  <tr>
                    <td colSpan="6" className="p-3 bg-gray-50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {item.products.filter(p => p.delivered_qty_a > 0).map((product, index) => (
                          <div key={index} className="bg-white p-3 rounded shadow-sm">
                            <p className="text-indigo-600 text-xs border rounded-lg p-1 w-fit bg-indigo-50">{productState?.filter(prod => prod.supplier === item.supplier._id).find(prod => prod._id === product.product_obj_ref)?.product_sku || 'Loading...'}</p>
                            <p className="font-medium text-gray-700 text-sm">
                              {productState?.filter(prod => prod.supplier === item.supplier._id).find(prod => prod._id === product.product_obj_ref)?.product_name || 'Loading...'}
                            </p>
                            <p className="text-gray-600 text-xs">Quantity: {product.delivered_qty_a}</p>
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
          Showing {Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredData.length, currentPage * itemsPerPage)} of {filteredData.length} entries
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