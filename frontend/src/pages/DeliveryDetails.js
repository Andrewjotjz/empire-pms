import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import LoadingScreen from './loaders/LoadingScreen';
import UnauthenticatedSkeleton from "./loaders/UnauthenticateSkeleton";
import SessionExpired from '../components/SessionExpired';

const DeliveryDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const localUser = JSON.parse(localStorage.getItem('localUser'))

    const [deliveryState, setDeliveryState] = useState({});
    const [updatedDeliveryState, setUpdatedDeliveryState] = useState({});
    const [productState, setProductState] = useState([]);
    const [purchaseOrderState, setPurchaseOrderState] = useState({});
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [isUpdateLoading, setIsUpdateLoading] = useState(true);
    const [addDeliveryError, setAddDeliveryError] = useState(null);
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
    const deliveryType = ['Delivery Docket', 'Invoice'];
    const deliveryStatus = ['Partially delivered', 'Delivered'];
  
    const handleEdit = () => {
        setIsDeliveryModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedDeliveryState(prevState => ({
        ...prevState,
        [name]: value
        }));
    };

    const handleProductChange = (index, field, value) => {
        const updatedProducts = [...deliveryState.products];
        updatedProducts[index][field] = value;
        setUpdatedDeliveryState(prevState => ({
        ...prevState,
        products: updatedProducts
        }));
    };

    const updateDelivery = async (updatedDeliveryState) => {
        setIsUpdateLoading(true)
        setAddDeliveryError(null)
    
        const putDelivery = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/delivery/${id}`, {
                    credentials: 'include', method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    },
                    body: JSON.stringify(updatedDeliveryState)
                })
    
                const data = await res.json();
    
                if (data.tokenError) {
                    throw new Error(data.tokenError)
                }
    
                if (!res.ok) {
                    throw new Error('Failed to POST new delivery')
                }
                if (res.ok) {
    
                    alert(`Delivery updated successfully!`);
                
                    // update loading state
                    setIsUpdateLoading(false)
    
                }
            } catch (error) {
                setAddDeliveryError(error.message);
                setIsUpdateLoading(false);
            }
        }
        putDelivery();
    };

    const handleSubmit = () => {
        updateDelivery(updatedDeliveryState);
        setIsDeliveryModalOpen(false);
        window.location.reload();
    }

    // fetch delivery
    useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchDelivery = async () => {
        setIsLoadingState(true);
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/delivery/${id}`, { signal , credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                }});
            if (!res.ok) {
                throw new Error('Failed to fetch delivery');
            }
            const data = await res.json();

            if (data.tokenError) {
                throw new Error(data.tokenError);
            }
            
            setIsLoadingState(false);
            setDeliveryState(data);
            setUpdatedDeliveryState(data);
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
    }, [id]);

    // fetch products
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

    // fetch purchase order
    useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchOrder = async () => {
        setIsLoadingState(true);
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/order/${deliveryState.order._id}`, { signal , credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                }});
            if (!res.ok) {
                throw new Error('Failed to fetch order');
            }
            const data = await res.json();

            if (data.tokenError) {
                throw new Error(data.tokenError);
            }
            
            setIsLoadingState(false);
            setPurchaseOrderState(data);
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

    fetchOrder();

    return () => {
        abortController.abort(); // Cleanup
    };
    }, [deliveryState]);

    if (isLoadingState)  { return (<LoadingScreen isLoading={isLoadingState} />); }

    if (errorState) {
        if(errorState.includes("Session expired") || errorState.includes("jwt expired") || errorState.includes("jwt malformed")){
            return(<div><SessionExpired /></div>)
        }
        return (<div>Error: {errorState}</div>);
    }

    const deliveryModal = (
        <div>    
          {isDeliveryModalOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 text-xs">
                <div className="flex justify-between items-center px-4 py-3 border-b">
                  <h2 className="text-lg font-bold text-gray-800">Update Delivery Details</h2>
                  <button
                    onClick={() => setIsDeliveryModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 transition duration-300 ease-in-out"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
    
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className='grid grid-cols-2 gap-x-4 gap-y-2'>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">* Evidence Reference:</label>
                            <input
                                type="text"
                                required
                                name="delivery_evidence_reference"
                                value={updatedDeliveryState.delivery_evidence_reference}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
        
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">* Receiving Date:</label>
                            <input
                                type="date"
                                required
                                name="delivery_receiving_date"
                                value={updatedDeliveryState.delivery_receiving_date.split('T')[0]}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-700">* Evidence Type:</label>
                            <select
                                required
                                name="delivery_evidence_type"
                                value={updatedDeliveryState.delivery_evidence_type}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select Type</option>
                                {deliveryType.map(type => (
                                <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>                            
            
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">* Delivery Status:</label>
                            <select
                                required
                                name="delivery_status"
                                value={updatedDeliveryState.delivery_status}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select Status</option>
                                {deliveryStatus.map(status => (
                                <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>                   
    
                    <div>
                      <h3 className="font-semibold mb-2 text-gray-800">Products</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border-b p-1.5 text-left font-semibold text-gray-600">Product SKU</th>
                              <th className="border-b p-1.5 text-left font-semibold text-gray-600">Product Name</th>
                              <th className="border-b p-1.5 text-left font-semibold text-gray-600">Quantity</th>
                              <th className="border-b p-1.5 text-left font-semibold text-gray-600">Receiving</th>
                              <th className="border-b p-1.5 text-left font-semibold text-gray-600">Delivered</th>
                            </tr>
                          </thead>
                          <tbody>
                            {purchaseOrderState && purchaseOrderState.products && purchaseOrderState.custom_products ? (
                                <>
                                {purchaseOrderState.products.map((prod, index) => {
                                    const deliveredQty = purchaseOrderState.deliveries.reduce((total, delivery) => {
                                    const deliveredProduct = delivery.products.find(p => p.product_obj_ref === prod.product_obj_ref._id);
                                    return total + (deliveredProduct?.delivered_qty_a || 0);
                                    }, 0);

                                    return (
                                    <tr key={`product-${index}`} className="hover:bg-gray-50">
                                        <td className="border-b p-1.5 text-gray-800">{prod.product_obj_ref.product_sku}</td>
                                        <td className="border-b p-1.5 text-gray-800">{prod.product_obj_ref.product_name}</td>
                                        <td className="border-b p-1.5 text-gray-800">{prod.order_product_qty_a}</td>
                                        <td className="border-b p-1.5">
                                        <input
                                            required
                                            min="0"
                                            type="number"
                                            value={updatedDeliveryState.products?.[index]?.delivered_qty_a ?? ''}
                                            onChange={(e) => handleProductChange(index, 'delivered_qty_a', parseFloat(e.target.value))}
                                            className="w-full p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            disabled={updatedDeliveryState.products?.[index]?.delivered_qty_a === undefined}
                                        />
                                        </td>
                                        <td className="border-b p-1.5 text-gray-800">
                                        {deliveredQty} / {prod.order_product_qty_a}
                                        </td>
                                    </tr>
                                    );
                                })}

                                {purchaseOrderState.custom_products.length > 0 &&
                                purchaseOrderState.custom_products.map((cprod, index) => {
                                const customIndex = purchaseOrderState.products.length + index;

                                // Calculate total delivered quantity for custom products
                                const deliveredQty = purchaseOrderState.deliveries.reduce((total, delivery) => {
                                    const deliveredProduct = delivery.products.find(p => p.product_obj_ref === cprod._id);
                                    return total + (deliveredProduct?.delivered_qty_a || 0);
                                }, 0);

                                return (
                                    <tr key={cprod._id} className="hover:bg-gray-50">
                                    <td className="border-b p-1.5 text-gray-800">CUSTOM {index + 1}</td>
                                    <td className="border-b p-1.5 text-gray-800">{cprod.custom_product_name}</td>
                                    <td className="border-b p-1.5 text-gray-800">{cprod.custom_order_qty}</td>
                                    <td className="border-b p-1.5">
                                        <input
                                        required
                                        min="0"
                                        type="number"
                                        value={deliveryState.products[customIndex]?.delivered_qty_a ?? ''}
                                        onChange={(e) => handleProductChange(customIndex, 'delivered_qty_a', parseFloat(e.target.value))}
                                        className="w-full p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        disabled={deliveryState.products[customIndex]?.delivered_qty_a === undefined}
                                        />
                                    </td>
                                    <td className="border-b p-1.5 text-gray-800">
                                        {deliveredQty} / {cprod.custom_order_qty}
                                    </td>
                                    </tr>
                                );
                                })}
                                </>
                            ) : (
                                <LoadingScreen />
                            )}
                        </tbody>

                        </table>
                      </div>
                    </div>
                    <div>
                        <textarea
                            name='delivery_notes'
                            value={updatedDeliveryState.delivery_notes}
                            onChange={handleInputChange}
                            placeholder='Delivery notes...'
                            className='border rounded-md w-full p-2'
                        />
                    </div>
                    <div>
                        <label  className="font-medium text-gray-700">Archived:</label>
                        <input
                            type='checkbox'
                            checked={updatedDeliveryState.delivery_isarchive}
                            name='delivery_isarchive'
                            onChange={(e) => handleInputChange({ target: { name: 'delivery_isarchive', value: e.target.checked } })}
                            className='ml-1 p-1'
                        />
                    </div>
                  </form>
                </div>
    
                <div className="flex justify-end space-x-2 p-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsDeliveryModalOpen(false)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition duration-300 ease-in-out"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition duration-300 ease-in-out"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );

    if (isUpdateLoading) (
        <LoadingScreen isLoading={isUpdateLoading} />
    )

    return (
    localUser && Object.keys(localUser).length > 0 ? (
    deliveryState && Object.keys(deliveryState).length > 0 ? (
    <div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-end items-center mb-6">
                        <button
                        onClick={handleEdit}
                        className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                        Edit
                        </button>
                    </div>

                    <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                        </svg>
                        Delivery Details
                    </h1>

                    <div className="bg-white shadow-inner rounded-lg overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                        <div className="space-y-4">
                            <p className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="font-medium mr-2 text-gray-600 size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                                <span className="font-medium mr-2 text-gray-600">
                                    Evidence Type:
                                </span> {deliveryState?.delivery_evidence_type}</p>
                            <p className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                </svg>
                                <span className="font-medium mr-2 text-gray-600">
                                    Evidence Reference:
                                </span> {deliveryState?.delivery_evidence_reference}</p>
                            <p className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                </svg>
                                <span className="font-medium mr-2 text-gray-600">
                                    Receiving Date:
                                </span> {new Date(deliveryState?.delivery_receiving_date).toLocaleDateString()}</p>
                            <p className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <span className="font-medium mr-2 text-gray-600">
                                    Status:
                                </span> 
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">{deliveryState?.delivery_status}</span>
                            </p>
                        </div>
                        <div className="space-y-4 px-4 border-l">
                            <p className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                                <span className="font-medium mr-2 text-gray-600">Order:</span>
                                <span className="text-blue-600 font-medium hover:cursor-pointer hover:underline"  onClick={() => navigate(`/EmpirePMS/order/${deliveryState?.order._id}`)}>{deliveryState?.order?.order_ref}</span>
                            </p>
                            <p className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                                <span className="font-medium mr-2 text-gray-600">Supplier:</span> {deliveryState?.supplier?.supplier_name}</p>
                            <p className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                                </svg>
                                <span className="font-medium mr-2 text-gray-600">Archived:</span> 
                            <span className={`px-2 py-1 rounded-full text-sm ${deliveryState?.delivery_isarchive ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                {deliveryState?.delivery_isarchive ? 'Yes' : 'No'}
                            </span>
                            </p>
                            <p className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <span className="font-medium mr-2 text-gray-600">Created At:</span> {new Date(deliveryState?.createdAt).toLocaleString()}</p>
                            <p className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <span className="font-medium mr-2 text-gray-600">Updated At:</span> {new Date(deliveryState?.updatedAt).toLocaleString()}</p>
                        </div>
                        </div>

                        <div className="p-6 border-t border-gray-200">
                        <h2 className="text-xl font-semibold mb-2 text-gray-700 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                            Delivery Notes
                        </h2>
                        <p className="bg-gray-50 p-3 rounded-md shadow-md">{deliveryState?.delivery_notes}</p>
                        </div>

                        <div className="p-6 border-t border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                            </svg>
                            Products
                        </h2>
                        <div className="overflow-x-auto rounded-lg shadow overflow-hidden">
                            <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product SKU</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered Quantity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {deliveryState && deliveryState?.products?.map((product,index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="py-4 px-4 text-sm text-gray-900">{productState?.filter(prod => prod.supplier === deliveryState.supplier._id).find(prod => prod._id === product.product_obj_ref)?.product_sku || "CUSTOM - " + deliveryState.order.custom_products.find(cprod => cprod._id === product.product_obj_ref)?.custom_product_name || 'Not found...'}</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">{productState?.filter(prod => prod.supplier === deliveryState.supplier._id).find(prod => prod._id === product.product_obj_ref)?.product_name  || deliveryState.order.custom_products.find(cprod => cprod._id === product.product_obj_ref)?.custom_product_name || 'Not found...'}</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">
                                    <span className={`px-2 py-1 rounded-full ${product?.delivered_qty_a > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {product?.delivered_qty_a}
                                    </span>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
            {deliveryModal}
        </div>
        ) : (
            <div><SessionExpired /></div>
        ) ) : ( <UnauthenticatedSkeleton /> )
    );
};
 
export default DeliveryDetails;