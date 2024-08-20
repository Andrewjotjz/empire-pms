// Import modules
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchProductsBySupplier } from '../../hooks/useFetchProductsBySupplier';
import { setSupplierState } from '../../redux/supplierSlice'
import { clearProductState } from '../../redux/productSlice'
import SessionExpired from '../../components/SessionExpired';
import EmployeeDetailsSkeleton from '../loaders/EmployeeDetailsSkeleton';
import { useSelector, useDispatch } from 'react-redux';

const NewPurchaseOrderForm = () => {
    // Component router
    const navigate = useNavigate();

    // Component hook
    const dispatch = useDispatch();
    const { fetchProductsBySupplier, isFetchProductsLoadingState, fetchProductsErrorState } = useFetchProductsBySupplier();

    // Component state
    const supplierState = useSelector((state) => state.supplierReducer.supplierState)
    const productState = useSelector((state) => state.productReducer.productState)
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [isFetchSupplierLoadingState, setIsFetchSupplierLoadingState] = useState(true);
    const [fetchSupplierErrorState, setFetchSupplierErrorState] = useState(null);
    const [ itemSize, setItemSize ] = useState([{
        min_qty_a: '',
        min_qty_b: '',
        last_qty_a: '',
        last_qty_b: ''
    }])
    const [orderState, setOrderState] = useState({
        supplier: '',
        order_ref: '',
        order_date: '',
        order_est_datetime: '',
        products: [{
            product_id: '',
            order_product_location: '',
            order_product_qty_a: '',
            order_product_qty_b: '',
            order_product_price_unit_a: '',
            order_product_gross_amount: ''
        }],
        custom_products: [{
            custom_product_name: '',
            custom_product_location: '',
            custom_order_qty: ''
        }],
        order_total_amount: '',
        order_internal_comments: '',
        order_notes_to_supplier: '',
        project: '',
        order_status: 'Draft'
    })

    // Component functions and variables
    const handleBackClick = () => navigate(`/EmpirePMS/order/`);

    const handleSupplierChange = (event) => {
        if (event.target.value !== '') {
            dispatch(clearProductState())
            fetchProductsBySupplier(event.target.value)
            setSelectedSupplier(event.target.value)
        }
        else {
            setSelectedSupplier(event.target.value)
        }
    };

    const handleAddItem = () => {
        if ( orderState.products.length < 30) {
            setOrderState({
                ...orderState,
                products: [...orderState.products, {
                    product_id: '',
                    order_product_location: '',
                    order_product_qty_a: '',
                    order_product_qty_b: '',
                    order_product_price_unit_a: '',
                    order_product_gross_amount: ''
                }]
            });
        } else {
            alert("You can add up to 30 items only.")
        }
    }

    const handleRemoveItem = (index) => {
        const updatedItems = orderState.products.filter((_, idx) => idx !== index);
        setOrderState({
            ...orderState,
            products: updatedItems
        })
    }

    //! DO NOT DELETE THIS ONE
    // const handleInputChange = (event, index = null, isProduct = false, isCustomProduct = false) => {
    //     const { name, value } = event.target;
    
    //     setOrderState((prevState) => {
    //         // Handle product array updates
    //         if (isProduct && index !== null) {
    //             let updatedProducts = [...prevState.products];
                
    //             updatedProducts[index] = {
    //                 ...updatedProducts[index],
    //                 [name]: value,
    //             };
    
    //             // If the 'product_sku' is being changed, update the corresponding 'product_name'
    //             if (name === "product_sku") {
    //                 const selectedProduct = productState.find(prod => prod.product.product_sku === value);
    //                 if (selectedProduct) {
    //                     updatedProducts[index].product_name = selectedProduct.product.product_name;
    //                     updatedProducts[index].product_id = selectedProduct.product._id;
    //                     updatedProducts[index].order_product_price_unit_a = selectedProduct.productPrice.product_price_unit_a;
    //                     setItemSize((prevItemState) => {
    //                         const updatedItemSize = [...prevItemState];
    //                         updatedItemSize[index] = {
    //                             min_qty_a: selectedProduct.productPrice.product_number_a,
    //                             min_qty_b: selectedProduct.productPrice.product_number_b,
    //                         };
    //                         return updatedItemSize;
    //                     });
    //                     updatedProducts[index].order_product_qty_a = selectedProduct.productPrice.product_number_a;
    //                     updatedProducts[index].order_product_qty_b = selectedProduct.productPrice.product_number_b;
    //                 }
    //             }
    
    //             // If the 'product_name' is being changed, update the corresponding 'product_sku'
    //             if (name === "product_name") {
    //                 const selectedProduct = productState.find(prod => prod.product.product_name === value);
    //                 if (selectedProduct) {
    //                     updatedProducts[index].product_sku = selectedProduct.product.product_sku;
    //                     updatedProducts[index].product_id = selectedProduct.product._id;
    //                     updatedProducts[index].order_product_price_unit_a = selectedProduct.productPrice.product_price_unit_a;
    //                     setItemSize((prevItemState) => {
    //                         const updatedItemSize = [...prevItemState];
    //                         updatedItemSize[index] = {
    //                             min_qty_a: selectedProduct.productPrice.product_number_a,
    //                             min_qty_b: selectedProduct.productPrice.product_number_b,
    //                         };
    //                         return updatedItemSize;
    //                     });
    //                     updatedProducts[index].order_product_qty_a = selectedProduct.productPrice.product_number_a;
    //                     updatedProducts[index].order_product_qty_b = selectedProduct.productPrice.product_number_b;
    //                 }
    //             }

    //             if (name === 'order_product_qty_a') {
    //                 updatedProducts[index].order_product_qty_b = updatedProducts[index].order_product_qty_b + itemSize[index].min_qty_b
    //             }
    //             if (name === 'order_product_qty_b') {
    //                 updatedProducts[index].order_product_qty_a = updatedProducts[index].order_product_qty_a + itemSize[index].min_qty_a
    //             }

    //             if (value === '') {
    //                 updatedProducts[index].product_sku = ''
    //                 updatedProducts[index].product_name = ''
    //                 updatedProducts[index].order_product_price_unit_a = ''
    //             }
    
    //             return {
    //                 ...prevState,
    //                 products: updatedProducts,
    //             };
    //         }
    
    //         // Handle custom products array updates
    //         if (isCustomProduct && index !== null) {
    //             const updatedCustomProducts = prevState.custom_products.map((product, i) => 
    //                 i === index ? { ...product, [name]: value } : product
    //             );
    //             return {
    //                 ...prevState,
    //                 custom_products: updatedCustomProducts,
    //             };
    //         }
    
    //         // Handle other updates
    //         return {
    //             ...prevState,
    //             [name]: value,
    //         };
    //     });
    // };
    //! DO NOT DELETE THIS ONE

    const handleInputChange = (event, index = null, isProduct = false, isCustomProduct = false) => {
        const { name, value } = event.target;
    
        setOrderState((prevState) => {
            // Handle product array updates
            if (isProduct && index !== null) {
                let updatedProducts = [...prevState.products];
                
                updatedProducts[index] = {
                    ...updatedProducts[index],
                    [name]: value,
                };
    
                // If the 'product_sku' is being changed, update the corresponding 'product_name'
                if (name === "product_sku") {
                    const selectedProduct = productState.find(prod => prod.product.product_sku === value);
                    if (selectedProduct) {
                        updatedProducts[index].product_name = selectedProduct.product.product_name;
                        updatedProducts[index].product_id = selectedProduct.product._id;
                        updatedProducts[index].order_product_price_unit_a = selectedProduct.productPrice.product_price_unit_a;
                        setItemSize((prevItemState) => {
                            const updatedItemSize = [...prevItemState];
                            updatedItemSize[index] = {
                                min_qty_a: selectedProduct.productPrice.product_number_a,
                                min_qty_b: selectedProduct.productPrice.product_number_b,
                            };
                            return updatedItemSize;
                        });
                        updatedProducts[index].order_product_qty_a = selectedProduct.productPrice.product_number_a;
                        updatedProducts[index].order_product_qty_b = selectedProduct.productPrice.product_number_b;
                    }
                }
    
                // If the 'product_name' is being changed, update the corresponding 'product_sku'
                if (name === "product_name") {
                    const selectedProduct = productState.find(prod => prod.product.product_name === value);
                    if (selectedProduct) {
                        updatedProducts[index].product_sku = selectedProduct.product.product_sku;
                        updatedProducts[index].product_id = selectedProduct.product._id;
                        updatedProducts[index].order_product_price_unit_a = selectedProduct.productPrice.product_price_unit_a;
                        setItemSize((prevItemState) => {
                            const updatedItemSize = [...prevItemState];
                            updatedItemSize[index] = {
                                min_qty_a: selectedProduct.productPrice.product_number_a,
                                min_qty_b: selectedProduct.productPrice.product_number_b,
                            };
                            return updatedItemSize;
                        });
                        updatedProducts[index].order_product_qty_a = selectedProduct.productPrice.product_number_a;
                        updatedProducts[index].order_product_qty_b = selectedProduct.productPrice.product_number_b;
                    }
                }

                if (name === 'order_product_qty_a') {
                    updatedProducts[index].order_product_qty_b = updatedProducts[index].order_product_qty_b + itemSize[index].min_qty_b
                }
                if (name === 'order_product_qty_b') {
                    updatedProducts[index].order_product_qty_a = updatedProducts[index].order_product_qty_a + itemSize[index].min_qty_a
                }

                if (value === '') {
                    updatedProducts[index].product_sku = ''
                    updatedProducts[index].product_name = ''
                    updatedProducts[index].order_product_price_unit_a = ''
                }
    
                return {
                    ...prevState,
                    products: updatedProducts,
                };
            }
    
            // Handle custom products array updates
            if (isCustomProduct && index !== null) {
                const updatedCustomProducts = prevState.custom_products.map((product, i) => 
                    i === index ? { ...product, [name]: value } : product
                );
                return {
                    ...prevState,
                    custom_products: updatedCustomProducts,
                };
            }
    
            // Handle other updates
            return {
                ...prevState,
                [name]: value,
            };
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
    };

    //Render component
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchSuppliers = async () => {
            setIsFetchSupplierLoadingState(true);
            try {
                const res = await fetch('/api/supplier', { signal });
                if (!res.ok) {
                    throw new Error('Failed to fetch');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }
                
                setIsFetchSupplierLoadingState(false);
                dispatch(setSupplierState(data));
                setFetchSupplierErrorState(null);
            } catch (error) {
                if (error.name === 'AbortError') {
                    // do nothing
                } else {
                    setIsFetchSupplierLoadingState(false);
                    setFetchSupplierErrorState(error.message);
                }
            }
        };

        fetchSuppliers();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, [dispatch]);

    // Display DOM
    if (isFetchSupplierLoadingState || isFetchProductsLoadingState) {
        return <EmployeeDetailsSkeleton />;
    }

    if (fetchSupplierErrorState) {
        if (fetchSupplierErrorState.includes("Session expired") ) {
            return <div><SessionExpired /></div>;
        }
        return <div><p>Error: {fetchSupplierErrorState}</p><p>Error: {fetchProductsErrorState}</p></div>;
    }

    // console.log("Order state is now: ", orderState)
    // console.log("ItemSize state is now: ", itemSize)
    // console.log("Product state is now: ", productState)

    return (
        <div className="container mt-5 pb-3"> 
            <div className="card">
                <div className="card-header bg-dark text-white">
                    <h1>NEW PURCHASE ORDER</h1>
                </div>
                <form className="card-body" onSubmit={handleSubmit}>
                    {/* SELECT SUPPLIER */}
                    <div className='row'>
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">Purchase Order No.:</label>
                            <input 
                                type='text'
                                className="form-control" 
                                name="order_ref" 
                                value={orderState.order_ref} 
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Order number error. Please contact IT Support')}
                                onInput={(e) => e.target.setCustomValidity('')}
                                disabled
                            />
                            <label className='text-xs italic text-gray-400'>This is an auto generated order reference number.</label>
                        </div>
                        <div className='col-md-6 mb-3'>
                            <label className="form-label fw-bold">*Supplier:</label>
                            <select 
                                className="form-control shadow-sm cursor-pointer"
                                name="supplier_name"
                                value={selectedSupplier}
                                onChange={handleSupplierChange}
                                required
                            >
                                <option value="">Select Supplier</option>
                                {supplierState && supplierState.length > 0 && 
                                    supplierState.filter(supplier => supplier.supplier_isarchived === false).map((supplier, index) => (
                                        <option key={index} value={supplier._id}>{supplier.supplier_name}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">*Order Date:</label>
                            <input 
                                type='date'
                                className="form-control" 
                                name="order_date" 
                                value={orderState.order_date} 
                                onChange={handleInputChange}
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter Order Date')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">*EST Date and Time:</label>
                            <input 
                                type='datetime-local'
                                className="form-control" 
                                name="order_est_datetime" 
                                value={orderState.order_est_datetime} 
                                onChange={handleInputChange}
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter EST Date and Time')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                            <label className='text-xs italic text-gray-400'>(EST) - Delivery estimate time of arrival</label>
                        </div>
                    </div>
                    {/* ***** ITEM TABLE ****** */}
                    <div className="container p-0 border-2 mb-2 shadow-md bg-slate-50">
                        <table className="table table-bordered m-0 mb-2">
                            <thead className="thead-dark text-center">
                                <tr className="table-primary">
                                    <th scope="col" className='text-nowrap'>Item #</th>
                                    <th scope="col">SKU</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Location</th>
                                    <th scope="col">Qty A</th>
                                    <th scope="col">Qty B</th>
                                    <th scope="col">Price A</th>
                                    <th scope="col">Net Amount</th>
                                    <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                {orderState.products.map((product, index) => (
                                <tr >
                                    <th scope="row">{index + 1}</th>
                                    <td>
                                        <select 
                                            className="form-control shadow-sm cursor-pointer"
                                            name="product_sku"
                                            value={product.product_sku} // Bind the value to state
                                            title={product.product_sku}
                                            onChange={(e) => handleInputChange(e, index, true)}
                                            required
                                        >
                                            <option value="">Select Product SKU</option>
                                            {productState && productState.length > 0 && 
                                                productState.map((prod, i) => {
                                                    return <option key={i} value={prod.product.product_sku}>{prod.product.product_sku}</option>;
                                                })
                                            }
                                        </select>
                                    </td>
                                    <td>
                                        <select 
                                            className="form-control shadow-sm cursor-pointer"
                                            name="product_name"
                                            value={product.product_name} // Bind the value to state
                                            title={product.product_name}
                                            onChange={(e) => handleInputChange(e, index, true)}
                                            required
                                        >
                                            <option value="">Select Product Name</option>
                                            {productState && productState.length > 0 && 
                                                productState.map((prod, i) => {
                                                    return <option key={i} value={prod.product.product_name}>{prod.product.product_name}</option>;
                                                })
                                            }
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control" 
                                            name="order_product_location" 
                                            value={product.order_product_location} 
                                            onChange={(e) => handleInputChange(e, index, true)}
                                            placeholder="Ex: Level 2 bathroom"
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('Enter item location')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type='number'
                                            className="form-control" 
                                            name="order_product_qty_a" 
                                            value={product.order_product_qty_a} 
                                            onChange={(e) => handleInputChange(e, index, true)}
                                            min={Number(itemSize[index]?.min_qty_a) || 0}
                                            step={Number(itemSize[index]?.min_qty_a) || 1}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('Enter qty-A')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type='number'
                                            className="form-control" 
                                            name="order_product_qty_b" 
                                            value={product.order_product_qty_b} 
                                            onChange={(e) => handleInputChange(e, index, true)}
                                            min={Number(itemSize[index]?.min_qty_b) || 0}
                                            step={Number(itemSize[index]?.min_qty_b) || 1}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('Enter qty-B')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                        />
                                    </td>
                                    <td>
                                        <div className="form-control bg-gray-200">
                                            ${product.order_product_price_unit_a ? product.order_product_price_unit_a.toFixed(2) : "0.00"}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="form-control bg-gray-200">
                                            ${(product.order_product_qty_a * (product.order_product_price_unit_a || 0)).toFixed(2)}
                                        </div>
                                    </td>
                                    <td>
                                        <button type="button" onClick={() => handleRemoveItem(index)} className="btn btn-danger">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                        </button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* ADD MORE ITEM BUTTON */}
                        <div className="flex justify-center mb-0 border-b-2 pb-2">
                            <div className='flex items-center border bg-gray-200 rounded-xl p-2 text-sm cursor-pointer hover:bg-blue-400 hover:text-white hover:shadow-lg ' onClick={handleAddItem}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <label className='cursor-pointer'>ADD MORE ITEMS</label>
                            </div>
                        </div>
                        {/* ********************* ITEM CALCULATION ******************** */}
                        <div className="flex justify-end">
                            <div>
                                <table className="table text-end font-bold border-l-2 mb-0">
                                    <tbody>
                                        <tr>
                                            <td className='pt-1'>Total Net Amount:</td>
                                            <td className='pt-1'>$ ??.??</td>
                                        </tr>
                                        <tr>
                                            <td>Amount Paid:</td>
                                            <td>$ ??.??</td>
                                        </tr>
                                        <tr className='border-b-0'>
                                            <td>Outstanding Amount:</td>
                                            <td>$ ??.??</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    {/* ***** INTERNAL COMMENTS ***** */}
                    <div className="my-3">
                        <label className="form-label font-bold">Internal comments:</label>
                        <textarea 
                            className="form-control" 
                            name="order_internal_comments" 
                            value={orderState.order_internal_comments} 
                            onChange={handleInputChange}
                            placeholder='Enter order related internal comments...'
                            rows={2}
                        />
                    </div>
                    {/* ***** NOTES TO SUPPLIER ***** */}
                    <div className="mb-1">
                        <label className="form-label font-bold">Notes to supplier:</label>
                        <textarea
                            className="form-control" 
                            name="order_notes_to_supplier" 
                            value={orderState.order_notes_to_supplier} 
                            onChange={handleInputChange}
                            placeholder='Enter some notes to supplier...'
                            rows={4}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewPurchaseOrderForm;
