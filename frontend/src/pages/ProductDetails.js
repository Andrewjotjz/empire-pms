//import modules
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setProductState } from '../redux/productSlice';
import { setProductPrice } from '../redux/productPriceSlice';
import SessionExpired from "../components/SessionExpired";
import EmployeeDetailsSkeleton from "./loaders/EmployeeDetailsSkeleton";
import Dropdown from "react-bootstrap/Dropdown"

const ProductDetails = () => {
    //Component state declaration
    const productState = useSelector((state) => state.productReducer.productState)
    const dispatch = useDispatch()
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const location = useLocation();
    const supplierId = location.state;

    //Component router
    const { productId } = useParams();
    const navigate = useNavigate();

    //Component functions and variables
    const handlePriceTableClick = (priceId) => { return }

    const handleBackClick = () => navigate(`/EmpirePMS/supplier/${supplierId}`);

    const handleEditProductClick = () => {
        // Convert the MongoDB Date ISO8601 format to (YYYY-MM-DD) JavaScript Date string
        if (productState && productState.length > 0) {
            const product = productState[0].product || {};
            const modifiedProductState = {
                ...product,
                product_next_available_stock_date: product.product_next_available_stock_date
                    ? product.product_next_available_stock_date.split('T')[0]
                    : '', // or 'null' depending on your needs
            };
            dispatch(setProductState(modifiedProductState));
        }
    
        // Convert the MongoDB Date ISO8601 format to (YYYY-MM-DD) JavaScript Date string
        if (
            productState &&
            productState[0].productPrice &&
            productState[0].productPrice.product_effective_date
        ) {
            const modifiedProductPriceState = {
                ...productState[0].productPrice,
                product_effective_date: productState[0].productPrice.product_effective_date
                    ? productState[0].productPrice.product_effective_date.split('T')[0]
                    : '', // or 'null' depending on your needs
            };
            dispatch(setProductPrice(modifiedProductPriceState));
        }
    
        navigate(`/EmpirePMS/supplier/${supplierId}/products/${productId}/edit`, { state: productId });
    };

    const formatDate = (dateString) => {
        if (dateString === null) {
            return ''
        }  else {
            const date = new Date(dateString);
            const options = { day: '2-digit', month: 'short', year: 'numeric' };
            return date.toLocaleDateString('en-AU', options).toUpperCase().replace(' ', '-').replace(' ', '-');
        }
    };
    
    //Render component
    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const res = await fetch(`https://empire-pms.onrender.com/api/supplier/${supplierId}/products/${productId}`, { credentials: 'include' });
                if (!res.ok) {
                    throw new Error('Failed to fetch product details');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }

                dispatch(setProductState(data));
                setIsLoadingState(false);
            } catch (err) {
                setErrorState(err.message);
                setIsLoadingState(false);
            }
        };

        fetchProductDetails();
    }, [supplierId, productId, dispatch]);

    //Display DOM
    const productPriceTable = Array.isArray(productState) && productState.length > 0 ? (
        <div className='container'>
            <h2 className='font-bold'>Product Prices:</h2>
            <table className="table-auto border-collapse border border-gray-300 w-full shadow-md text-sm">
                <thead className="bg-indigo-200 text-center">
                    <tr>
                        <th scope="col" className="border border-gray-300 px-2 py-1">Effective Date</th>
                        <th scope="col" className="border border-gray-300 px-2 py-1">Unit A</th>
                        <th scope="col" className="border border-gray-300 px-2 py-1">Unit B</th>
                        <th scope="col" className="border border-gray-300 px-2 py-1">Price Fixed (?)</th>
                        <th scope="col" className="border border-gray-300 px-2 py-1">Project</th>
                    </tr>
                </thead>
                <tbody className='text-center'>
                {productState.map((item, index) => (
                    <tr key={index} onClick={() => handlePriceTableClick(item.productPrice._id)}>
                        <td className="border border-gray-300 px-2 py-1">{formatDate(item.productPrice.product_effective_date)}</td>
                        <td className="border border-gray-300 px-2 py-1">
                            <label>{item.productPrice.product_number_a}</label>
                            <label className="ml-1 text-xs opacity-50 col-span-1 text-nowrap">{item.productPrice.product_unit_a}</label>
                            <div className='mt-1'>${(item.productPrice.product_price_unit_a).toFixed(2)}</div>
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                            <label>{item.productPrice.product_number_b}</label>
                            <label className="ml-1 text-xs opacity-50 col-span-1 text-nowrap">{item.productPrice.product_unit_b}</label>
                            <div className='mt-1'>${(item.productPrice.product_price_unit_b).toFixed(2)}</div>
                        </td>
                        <td className="border border-gray-300 px-2 py-1">{item.productPrice.price_fixed ? 'Yes' : 'No'}</td>
                        <td className="border border-gray-300 px-1 py-1">
                            {item.productPrice.project_names.map((project, index) => (
                                <label key={index} className='ml-1 p-1 border-2 rounded-md'>
                                    {project}
                                </label>
                            ))}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    ) : (
        <div>Product Price API fetched successfully, but it might be empty...</div>
    );

    if (isLoadingState) { return (<EmployeeDetailsSkeleton />); }

    if (errorState) {
        if(errorState.includes("Session expired") || errorState.includes("jwt expired")){
            return(<div><SessionExpired /></div>)
        }
        return (<div>Error: {errorState}</div>);
    }

    return (
        <div className="container mt-5">
            <div className="card">
                <div className="card-header bg-dark text-white">
                    <h1>PRODUCT DETAILS</h1>
                </div>
                <div className="card-body">
                    <div className="d-flex justify-content-between mb-3">
                        <button className="btn btn-secondary" onClick={handleBackClick}>BACK</button>
                        <Dropdown>
                            <Dropdown.Toggle variant="success" id="dropdown-basic">
                                ACTIONS
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={handleEditProductClick}>
                                    <div className='flex items-center'>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 mr-2">
                                            <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z" />
                                            <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
                                        </svg>
                                        <label>EDIT PRODUCT</label>
                                    </div>
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => {}}>
                                    <div className='flex items-center'>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 mr-2">
                                            <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z" />
                                            <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
                                        </svg>
                                        <label>PLACEHOLDER</label>
                                    </div>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    {Array.isArray(productState) && productState.length > 0 ? (
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">SKU:</label>
                                <p className="form-label">{productState[0].product.product_sku}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Name:</label>
                                <p className="form-label">{productState[0].product.product_name}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Type:</label>
                                <p className="form-label">{productState[0].product.product_types}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Actual Size:</label>
                                <p className="form-label">{productState[0].product.product_actual_size}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Alias:</label>
                                <p className="form-label">{productState[0].product.alias_name}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Next available stock date:</label>
                                <p className="form-label">{productState[0].product.product_next_available_stock_date || 'In-stock now'}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">isArchived:</label>
                                <p className="form-label">{productState[0].product.product_isarchived ? 'Yes' : 'No'}</p>
                            </div>
                        </div>
                    ) : (
                        <div>Product API fetched successfully, but it might be empty...</div>
                    )}
                    
                    { productPriceTable }
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;