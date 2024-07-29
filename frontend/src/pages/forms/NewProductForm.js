// Import modules
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAddProduct } from '../../hooks/useAddProduct'; 
import { useFetchAliases } from '../../hooks/useFetchAliases';
import SessionExpired from '../../components/SessionExpired';
import EmployeeDetailsSkeleton from "../loaders/EmployeeDetailsSkeleton";
import { useDispatch, useSelector } from 'react-redux';

const NewProductForm = () => {
    // Component router
    const navigate = useNavigate();
    const location = useLocation();
    const supplierId = location.state;

    // Component hook
    const dispatch = useDispatch();
    const { fetchAliases, aliasIsLoadingState, aliasErrorState } = useFetchAliases();
    const { addProduct, productIsLoadingState, productErrorState } = useAddProduct();

    // Component state
    const aliasState = useSelector((state) => state.aliasReducer.aliasState)
    const [ aliasIdState, setAliasIdState ] = useState('');
    const [ productDetailsState, setProductDetailsState] = useState({
        product_sku: '',
        product_name: '',
        product_types: '',
        product_actual_size: 0,
        product_next_available_stock_date: '',
        supplier: supplierId,
        alias: aliasIdState,
        product_unit_a: '',
        product_number_a: '',
        product_price_unit_a: '',
        product_unit_b: '',
        product_number_b: '',
        product_price_unit_b: '',
        price_fixed: '',
        product_effective_date: '',
        projects: ''

    });

    // Component functions and variables
    const handleBackClick = () => navigate(`/EmpirePMS/supplier/${supplierId}`);

    const handleProductInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'product_types'){
            fetchAliases(value)
        }
        setProductDetailsState((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleAliasInputChange = (event) => {
        const { name, value } = event.target;
        setAliasIdState(([prevValue]) => ({
            ...prevValue,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        
        addProduct( productDetailsState);
    };

    // Display DOM
    if (aliasIsLoadingState || productIsLoadingState) {
        return <EmployeeDetailsSkeleton />;
    }

    if (aliasErrorState || productErrorState) {
        if (errorState.includes("Session expired") || errorState.includes("jwt expired")) {
            return <div><SessionExpired /></div>;
        }
        return <div>Error: {errorState}</div>;
    }

    return (
        <div className="container mt-5"> 
            <div className="card">
                <div className="card-header bg-dark text-white">
                    <h1>NEW PRODUCT</h1>
                </div>
                <form className="card-body" onSubmit={handleSubmit}>
                    <div className="row">
                        {/* PRODUCT TABLE */}
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">Product SKU:</label>
                            <input 
                                type='text'
                                className="form-control" 
                                name="product_sku" 
                                value={productDetailsState.product_sku} 
                                onChange={handleProductInputChange}
                                placeholder='Ex: 13RE1236'
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter SKU')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">Name:</label>
                            <input 
                                type='text'
                                className="form-control" 
                                name="product_name" 
                                value={productDetailsState.product_name} 
                                onChange={handleProductInputChange} 
                                placeholder='Ex: 16mm SHEETROCK 1200mm x 3600mm'
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter product name')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">Type:</label>
                            <select 
                                className="form-control"
                                name="product_types" 
                                value={productDetailsState.product_types} 
                                onChange={handleProductInputChange}
                            >
                                <option value="Compound">Compound</option>
                                <option value="Access Panel">Access Panel</option>
                                <option value="Framing Ceiling">Framing Ceiling</option>
                                <option value="Framing Wall">Framing Wall</option>
                                <option value="Batt Insulation">Batt Insulation</option>
                                <option value="Rigid Insulation">Rigid Insulation</option>
                                <option value="Plasterboard">Plasterboard</option>
                                <option value="External Cladding">External Cladding</option>
                                <option value="SpeedPanel">SpeedPanel</option>
                                <option value="Timber">Timber</option>
                                <option value="Others">Others</option>
                                <option value="Tools">Tools</option>
                                <option value="Plastering(Fixings/Screws)">Plastering(Fixings/Screws)</option>
                                <option value="Framing Ceiling(Accessories)">Framing Ceiling(Accessories)</option>
                                <option value="Rigid Insulation(Accessories)">Rigid Insulation(Accessories)</option>
                                <option value="Plasterboard(Accessories)">Plasterboard(Accessories)</option>
                                <option value="External Cladding(Accessories)">External Cladding(Accessories)</option>
                                <option value="SpeedPanel(Accessories)">SpeedPanel(Accessories)</option>
                            </select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">Actual Size:</label>
                            <input 
                                type='number'
                                className="form-control" 
                                name="product_actual_size" 
                                value={productDetailsState.product_actual_size} 
                                onChange={handleProductInputChange}
                                defaultValue={0}
                                required
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">Next available stock date:</label>
                            <input 
                                type='date'
                                className="form-control" 
                                name="product_next_available_stock_date" 
                                value={product.product_next_available_stock_date}
                                onChange={handleProductInputChange}
                                defaultValue={null}
                            />
                        </div>

                        {/* ALIAS TABLE */}
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">Alias:</label>
                            <input 
                                type='text'
                                className="form-control" 
                                name="alias_name" 
                                value={aliasState.alias_name}
                                onChange={handleAliasInputChange}
                                placeholder='Ex: 13RE, Mainbar...'
                                defaultValue={'na'}
                                required
                            />
                        </div>

                        {/* PRODUCT PRICE TABLE */}
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">Unit-A:</label>
                            <input 
                                type='text'
                                className="form-control" 
                                name="product_unit_a" 
                                value={productPriceState.product_unit_a} 
                                onChange={handleInputChange} 
                                placeholder='Ex: M2, LM'
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter unit-A')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">Number-A:</label>
                            <input 
                                type='number'
                                className="form-control" 
                                name="product_number_a" 
                                value={productPriceState.product_number_a} 
                                onChange={handleInputChange}
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter number-A')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">Unit-A Price:</label>
                            <input 
                                type='number'
                                className="form-control" 
                                name="product_price_unit_a" 
                                value={productPriceState.product_price_unit_a} 
                                onChange={handleInputChange}
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter unit-A price')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">Unit-B:</label>
                            <input 
                                type='text'
                                className="form-control" 
                                name="product_unit_b" 
                                value={productPriceState.product_unit_b} 
                                onChange={handleInputChange} 
                                placeholder='Ex: unit, lm'
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter unit-B')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">Number-B:</label>
                            <input 
                                type='number'
                                className="form-control" 
                                name="product_number_b" 
                                value={productPriceState.product_number_b} 
                                onChange={handleInputChange}
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter number-B')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">Unit-B Price:</label>
                            <input 
                                type='number'
                                className="form-control" 
                                name="product_price_unit_b" 
                                value={productPriceState.product_price_unit_b} 
                                onChange={handleInputChange}
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter unit-B price')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">Price fixed (?):</label>
                            <input 
                                    type="checkbox"
                                    className="form-check-input m-1" 
                                    name="price_fixed" 
                                    checked={productPriceState.price_fixed} 
                                    onChange={(e) => handleInputChange({ target: { name: 'price_fixed', value: e.target.checked }})}
                                />
                        </div>

                        {/* END */}
                        <div className="d-flex justify-content-between mb-3">
                            <button type="button" onClick={handleBackClick} className="btn btn-secondary">CANCEL</button>
                            <button className="btn btn-primary" type="submit">ADD TO COMPANY</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewProductForm;
