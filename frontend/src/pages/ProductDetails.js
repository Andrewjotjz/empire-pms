//import modules
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setProductState } from '../redux/productSlice';
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

    const handleEditProductClick = () => navigate(`/EmpirePMS/product/${productId}`, { state: productId });

    //Render component
    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const res = await fetch(`/api/supplier/${supplierId}/products/${productId}`);
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
        <div className="container">
            <h2 className='font-bold m-2 text-xl'>Product Prices</h2>
            <table className="table table-bordered">
                <thead className="thead-dark">
                    <tr className="table-primary">
                        <th scope="col">ID</th>
                        <th scope="col">Unit A</th>
                        <th scope="col">Number A</th>
                        <th scope="col">Price Unit A</th>
                        <th scope="col">Unit B</th>
                        <th scope="col">Number B</th>
                        <th scope="col">Price Unit B</th>
                        <th scope="col">Price Fixed (?)</th>
                        <th scope="col">Effective Date</th>
                        <th scope="col">Project</th>
                    </tr>
                </thead>
                <tbody>
                    {productState.map((item, index) => (
                        <tr key={index} onClick={() => handlePriceTableClick(item.productPrice._id)}>
                            <th scope="row">{index + 1}</th>
                            <td>{item.productPrice.product_unit_a}</td>
                            <td>{item.productPrice.product_number_a}</td>
                            <td>{item.productPrice.product_price_unit_a}</td>
                            <td>{item.productPrice.product_unit_b}</td>
                            <td>{item.productPrice.product_number_b}</td>
                            <td>{item.productPrice.product_price_unit_b}</td>
                            <td>{item.productPrice.price_fixed ? 'Yes' : 'No'}</td>
                            <td>{item.productPrice.product_effective_date}</td>
                            <td>
                                {item.productPrice.project_names.map((project, index) => (
                                    <div key={index}>
                                        {project}
                                    </div>
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
                        <button className="btn btn-primary" onClick={handleEditProductClick}>EDIT PRODUCT</button>
                        <Dropdown>
                            <Dropdown.Toggle variant="success" id="dropdown-basic">
                                ACTIONS
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => {}}>PLACEHOLDER</Dropdown.Item>
                                <Dropdown.Item onClick={() => {}}>PLACEHOLDER</Dropdown.Item>
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