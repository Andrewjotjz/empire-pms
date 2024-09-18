import { useState } from "react";

const NewInvoiceForm = () => {
    
    const [searchOrderTerm, setSearchOrderTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState('');

    const [isToggled, setIsToggled] = useState(false);
    const [showSelectionModal, setShowSelectionModal] = useState(false);
    const [showProductPriceModal, setShowProductPriceModal] = useState(false);
    const [showCreateProductModal, setShowCreateProductModal] = useState(false);
    const [showEditOrderModal, setShowEditOrderModal] = useState(false);
    const [showCreatePriceModal, setShowCreatePriceModal] = useState(false);
  
    const handleToggle = () => setIsToggled(!isToggled);
    const handleToggleSelectionModal = () => setShowSelectionModal(!showSelectionModal);
    const handleTogglePriceModal = () => setShowProductPriceModal(!showProductPriceModal);
    const handleToggleCreateProductModal = () => setShowCreateProductModal(!showCreateProductModal);
    const handleToggleEditOrderModal = () => setShowEditOrderModal(!showEditOrderModal);
    const handleToggleCreatePriceModal = () => setShowCreatePriceModal(!showCreatePriceModal);

    const orderSelectionModal = (
        <div>
        {/* Modal overlay */}
        {showSelectionModal && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                <div className="bg-white w-auto rounded-lg shadow-lg">
                    
                    {/* Modal Header */}
                    <div className="flex justify-between items-center p-3 border-b bg-slate-100">
                        <h2 className="text-xl font-bold">Select Purchase Order to Invoice</h2>
                        <button
                            onClick={handleToggleSelectionModal}
                            className="text-gray-500 hover:text-gray-800"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-3">
                        <div className="flex justify-between">
                            <input
                                type="text"
                                className="w-5/12 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name=""
                                value={searchOrderTerm}
                                onChange={(e) => setSearchOrderTerm(e.target.value)}
                                required
                                onInvalid={(e) => e.target.setCustomValidity('')}
                                onInput={(e) => e.target.setCustomValidity('')}
                                placeholder="Search purchase order..."
                            />
                            <div className="flex items-center">
                                <label className="font-bold">Supplier:</label>
                                <label className="ml-2">data</label>
                            </div>
                        </div>
                        <table className="mt-2 table-auto border-collapse border border-gray-300 w-full shadow-md">
                            <thead className="bg-indigo-200 text-center">
                                <tr>
                                    <th></th>
                                    <th scope="col" className="border border-gray-300 px-3 py-2">PO</th>
                                    <th scope="col" className="border border-gray-300 px-3 py-2">Order Date</th>
                                    <th scope="col" className="border border-gray-300 px-3 py-2">EST Date</th>
                                    <th scope="col" className="border border-gray-300 px-3 py-2">Project</th>
                                    <th scope="col" className="border border-gray-300 px-3 py-2">Products</th>
                                    <th scope="col" className="border border-gray-300 px-3 py-2">Gross Amount</th>
                                    <th scope="col" className="border border-gray-300 px-3 py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                <tr>
                                    <td className="border border-gray-300 p-2">
                                        <input 
                                            className="text-blue-600"
                                            type="radio"
                                            name=""
                                            value={{}}
                                            checked={selectedOrder}
                                            onChange={(e) => setSelectedOrder(e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2">data</td>
                                    <td className="border border-gray-300 px-3 py-2">data</td>
                                    <td className="border border-gray-300 px-3 py-2">data</td>
                                    <td className="border border-gray-300 px-3 py-2">data</td>
                                    <td className="border border-gray-300 px-3 py-2">data</td>
                                    <td className="border border-gray-300 px-3 py-2">data</td>
                                    <td className="border border-gray-300 px-3 py-2">data</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Modal Buttons */}
                    <div className="flex justify-end p-3 border-t">
                        <button
                            onClick={handleToggleSelectionModal}
                            className="bg-gray-300 text-gray-700 px-3 py-2 rounded mr-2 hover:bg-gray-400"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => {
                            // Add confirmation logic here
                            handleToggleSelectionModal();
                            }}
                            className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                        >
                            Add to Invoice
                        </button>
                    </div>
                </div>
            </div>
        )}
        </div>
    );

    const productPriceModal = (
    <div>
        {showProductPriceModal && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                <div className="bg-white w-auto rounded-lg shadow-lg">
                    {/* Modal Header */}
                    <div className="flex justify-between items-center p-3 border-b bg-slate-100">
                        <h2 className="text-xl font-bold">Product Prices</h2>
                        <button
                            onClick={handleTogglePriceModal}
                            className="text-gray-500 hover:text-gray-800"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-3">
                    { true ? (
                        <table className="table-auto border-collapse border border-gray-300 w-full shadow-md text-md">
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
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1">{`--/--/--`}</td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <label>{`data`}</label>
                                        <label className="ml-1 text-xs opacity-50 col-span-1 text-nowrap">{`unit`}</label>
                                        <div className='mt-1'>${`--.--`}</div>
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <label>{`data`}</label>
                                        <label className="ml-1 text-xs opacity-50 col-span-1 text-nowrap">{`unit`}</label>
                                        <div className='mt-1'>${`--.--`}</div>
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">{true ? 'Yes' : 'No'}</td>
                                    <td className="border border-gray-300 px-1 py-1">
                                        {`data`}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        ) : (
                        <div>Product Price API fetched successfully, but it might be empty...</div>)
                    }
                    </div>
                    {/* <div className="p-3">
                    { Array.isArray(productState) && productState.length > 0 ? (
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
                        ) : (
                        <div>Product Price API fetched successfully, but it might be empty...</div>)
                    }
                    </div> */}

                    {/* Modal Buttons */}
                    <div className="flex justify-end p-3 border-t">
                        <button
                            onClick={handleTogglePriceModal}
                            className="bg-gray-300 text-gray-700 px-3 py-2 rounded mr-2 hover:bg-gray-400"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => {handleToggleCreatePriceModal(); handleTogglePriceModal()}}
                            className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                        >
                            Create new price
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
    );

    const createProductModal = (
    <div>
    {showCreateProductModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white w-auto rounded-lg shadow-lg">
                {/* Modal Header */}
                <div className="flex justify-between items-center px-4 py-3 border-b bg-slate-100">
                    <h2 className="text-xl font-bold">SUPPLIER: New Product</h2>
                    <button
                        onClick={handleToggleCreateProductModal}
                        className="text-gray-500 hover:text-gray-800"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-2">
                    <form onSubmit={() => {}} className="text-sm">
                        <div className="mx-3 p-2 grid grid-cols-3 gap-x-4 gap-y-2">
                            {/* PRODUCT TABLE */}
                            <div>
                                <label className="form-label font-bold">*Product SKU:</label>
                                <input 
                                    type='text'
                                    className="form-control text-sm" 
                                    name="product_sku" 
                                    value={`productDetailsState.product_sku`} 
                                    onChange={`handleProductInputChange`}
                                    required
                                    onInvalid={(e) => e.target.setCustomValidity('Enter SKU')}
                                    onInput={(e) => e.target.setCustomValidity('')}
                                />
                                <label className='text-xs italic text-gray-400'>Ex: 13RE1236</label>
                            </div>
                            <div>
                                <label className="form-label font-bold">*Name:</label>
                                <input 
                                    type='text'
                                    className="form-control text-sm" 
                                    name="product_name" 
                                    value={`productDetailsState.product_name`} 
                                    onChange={`handleProductInputChange`}
                                    required
                                    onInvalid={(e) => e.target.setCustomValidity('Enter product name')}
                                    onInput={(e) => e.target.setCustomValidity('')}
                                />
                                <label className='text-xs italic text-gray-400'>Ex: 16mm SHEETROCK 1200mm x 3600mm</label>
                            </div>
                            <div>
                                <label className="form-label font-bold">*Type:</label>
                                <select 
                                    className="form-control text-sm shadow-sm cursor-pointer"
                                    name="product_types" 
                                    value={`productDetailsState.product_types`} 
                                    onChange={`handleProductInputChange`}
                                    required
                                >                                
                                    <option value="">Select Product Type</option>
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
                                    <option value="Framing Wall(Accessories)">Framing Wall(Accessories)</option>
                                    <option value="Rigid Insulation(Accessories)">Rigid Insulation(Accessories)</option>
                                    <option value="Plasterboard(Accessories)">Plasterboard(Accessories)</option>
                                    <option value="External Cladding(Accessories)">External Cladding(Accessories)</option>
                                    <option value="SpeedPanel(Accessories)">SpeedPanel(Accessories)</option>
                                </select>
                                <label className='text-xs italic text-gray-400'>Alias is based on the product type you select</label>
                            </div>
                            {/***************************** ALIAS TABLE *************************/}
                            <div className="col-span-3">
                                <label className="form-label font-bold">*Alias:</label>
                                { true && <div>
                                    <select 
                                        className="form-control text-sm shadow-sm cursor-pointer w-1/3"
                                        name="alias"
                                        onChange={`handleProductInputChange`}
                                        disabled={`aliasFieldToggle`}
                                        required
                                    >
                                        <option value="">Select Alias</option>
                                        {/* {aliasState && aliasState.length > 0 && 
                                            Array.from(new Set(aliasState.map(product => product.alias ? product.alias._id : null)))
                                                .filter(aliasId => aliasId !== null)
                                                .map((aliasId, index) => {
                                                    const alias = aliasState.find(product => product.alias && product.alias._id === aliasId).alias;
                                                    return <option key={index} value={aliasId}>{alias.alias_name}</option>;
                                                })
                                        } */}
                                    </select>
                                    <label className='text-xs italic text-gray-400'>Set alias to ('na') if not available or create custom alias <span className="text-blue-600 size-5 cursor-pointer underline" onClick={() => {}}>here</span></label>
                                </div>}
                                { true && <div>
                                    <input 
                                        type='text'
                                        className="form-control text-sm w-1/3" 
                                        name="alias" 
                                        value={`productDetailsState.alias`} 
                                        placeholder='custom alias...'
                                        onChange={`handleProductInputChange`}
                                        onInvalid={(e) => e.target.setCustomValidity('Enter a new custom alias')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                    />
                                    <label className='text-xs italic text-gray-400'>Don't want to create custom alias? <span className="text-blue-600 size-5 cursor-pointer underline" onClick={() => {}}>Cancel</span></label>
                                </div>}
                            </div>
                            {/* ********************************************* PRODUCT PRICE TABLE *********************************************** */}
                            <div className='grid grid-cols-3 gap-x-10 gap-y-4 border-1 shadow-sm rounded p-3 mb-1 col-span-3'>
                                <div className='border-1 rounded p-2 shadow-sm'>
                                    <div>
                                        <label className="form-label font-bold">*Number-A:</label>
                                        <input 
                                            type='number'
                                            className="form-control text-sm" 
                                            name="product_number_a" 
                                            value={`productDetailsState.product_number_a`} 
                                            onChange={`handleProductInputChange`}
                                            min={1}
                                            step="0.001"  // Allows input with up to three decimal places
                                            pattern="^\d+(\.\d{1,3})?$"  // Allows up to two decimal places
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('Enter number-A')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label font-bold">*Unit-A:</label>
                                        <input 
                                            type='text'
                                            className="form-control text-sm" 
                                            name="product_unit_a" 
                                            value={`productDetailsState.product_unit_a`} 
                                            onChange={`handleProductInputChange`}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('Enter unit-A')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                        />
                                        <label className='text-xs italic text-gray-400'>Ex: Box, Pack, Carton</label>
                                    </div>
                                    <div>
                                        <label className="form-label font-bold">*Unit-A Price:</label>
                                        <div className='flex items-center border rounded'>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                            <input 
                                                type='number'
                                                className="form-control text-sm flex-1 pl-2 border-0" 
                                                name="product_price_unit_a" 
                                                value={`productDetailsState.product_price_unit_a`} 
                                                onChange={`handleProductInputChange`}
                                                step="0.001"  // Allows input with up to three decimal places
                                                min={1}
                                                required
                                                onInvalid={(e) => e.target.setCustomValidity('Enter unit-A price')}
                                                onInput={(e) => e.target.setCustomValidity('')}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className='border-1 rounded p-2 shadow-sm'>
                                    <div>
                                        <label className="form-label font-bold">*Number-B:</label>
                                        <input 
                                            type='number'
                                            className="form-control text-sm" 
                                            name="product_number_b" 
                                            value={`productDetailsState.product_number_b`} 
                                            onChange={`handleProductInputChange`}
                                            step="0.001"  // Allows input with up to three decimal places
                                            pattern="^\d+(\.\d{1,3})?$"  // Allows up to two decimal places
                                            min={1}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('Enter number-B')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label font-bold">*Unit-B:</label>
                                        <input 
                                            type='text'
                                            className="form-control text-sm" 
                                            name="product_unit_b" 
                                            value={`productDetailsState.product_unit_b`} 
                                            onChange={`handleProductInputChange`}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('Enter unit-B')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                        />
                                        <label className='text-xs italic text-gray-400'>Ex: units, length, each, sheet</label>
                                    </div>
                                    <div>
                                        <label className="form-label font-bold">*Unit-B Price:</label>
                                        <div className='flex items-center border rounded'>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                            <input 
                                                type='number'
                                                className="form-control text-sm flex-1 pl-2 border-0" 
                                                name="product_price_unit_b" 
                                                value={`productDetailsState.product_price_unit_b`} 
                                                onChange={`handleProductInputChange`}
                                                step="0.001"  // Allows input with up to three decimal places
                                                min={1}
                                                required
                                                onInvalid={(e) => e.target.setCustomValidity('Enter unit-B price')}
                                                onInput={(e) => e.target.setCustomValidity('')}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* ***** PROJECT DROPDOWN START ****** */}
                                <div>
                                    <label className="block font-bold mb-2">*Project:</label>
                                    <div>
                                        <button
                                            type="button"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onClick={() => {}}
                                        >
                                            {`Select Projects`}
                                        </button>
                                        {true && (
                                            <div className="relative z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-60 overflow-auto" onMouseLeave={() => {}}>
                                                <ul className="py-1">
                                                        <li className="flex items-center px-4 py-2 hover:bg-gray-100">
                                                            <input
                                                                type="checkbox"
                                                                id={`project-_id`}
                                                                value={`project._id`}
                                                                checked={true}
                                                                onChange={`handleCheckboxChange`}
                                                                className="mr-2"
                                                                required
                                                                onInvalid={(e) => e.target.setCustomValidity('You must select one or more project applied to this product')}
                                                                onInput={(e) => e.target.setCustomValidity('')}
                                                            />
                                                            <label htmlFor={`project-_id`} className="text-gray-900">{`project.project_name`}</label>
                                                        </li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    <p className='text-xs italic text-gray-400 mt-2'>Select one or more projects that this new product price applies to</p>
                                </div>
                                {/* ***** PRICE FIXED? START ****** */}
                                <div>
                                    <label className="form-label font-bold">Price effective date:</label>
                                    <input 
                                        type='date'
                                        className="form-control text-sm" 
                                        name="product_effective_date" 
                                        value={`productDetailsState.product_effective_date`}
                                        onChange={`handleProductInputChange`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label font-bold">Price fixed(?):</label>
                                    <input 
                                            type="checkbox"
                                            className="form-check-input m-1" 
                                            name="price_fixed" 
                                            checked={`productDetailsState.price_fixed`}
                                        />
                                </div>
                            </div>
                            {/* ********************************************* PRODUCT PRICE END *********************************************** */}
                            <div>
                                <label className="form-label font-bold">*Actual M<span className='text-xs align-top'>2</span>/M:</label>
                                <input 
                                    type='number'
                                    className="form-control text-sm" 
                                    name="product_actual_size" 
                                    value={`productDetailsState.product_actual_size`} 
                                    onChange={() => {}}
                                    step="0.001"  // Allows input with up to three decimal places
                                    pattern="^\d+(\.\d{1,3})?$"  // Allows up to two decimal places
                                    min={1}
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label font-bold">Next available stock date:</label>
                                <input 
                                    type='date'
                                    className="form-control text-sm" 
                                    name="product_next_available_stock_date" 
                                    value={`productDetailsState.product_next_available_stock_date`}
                                    onChange={() => {}}
                                />
                            </div>
                        </div>
                    </form>
                </div>
                {/* Modal Buttons */}
                <div className="flex justify-end p-3 border-t">
                    <button
                        onClick={handleToggleCreateProductModal}
                        className="bg-gray-300 text-gray-700 px-3 py-2 rounded mr-2 hover:bg-gray-400"
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={() => {}}
                        className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                    >
                        REGISTER NEW PRODUCT
                    </button>
                </div>
            </div>
        </div>
    )}
    </div>
    );

    const editOrderModal = (
    <div>
    {showEditOrderModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center p-5">
            <div className="bg-white w-auto rounded-lg shadow-lg">
                {/* Modal Header */}
                <div className="flex justify-between items-center px-4 py-3 border-b bg-slate-100">
                    <h2 className="text-xl font-bold">EDIT PURCHASE ORDER: 3017</h2>
                    <button
                        onClick={handleToggleEditOrderModal}
                        className="text-gray-500 hover:text-gray-800"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-2 grid grid-cols-2">
                    <div className="p-2">
                        {/* disabled details */}
                        <div className="grid grid-cols-3 text-sm">
                            <div><span className="font-bold">Purchase Order No:</span> 3017</div>
                            <div><span className="font-bold">Project:</span> QUEENSBRIDGE</div>
                            <div><span className="font-bold">Supplier:</span> Bell Plaster</div>
                        </div>
                        {/* products selection */}
                        <div className="container p-0 border-2 shadow-md bg-slate-50">
                            <div className="grid grid-cols-3 m-2 gap-x-1">
                                <input
                                    type="text"
                                    className="form-control text-xs mb-1 col-span-2"
                                    placeholder="Search products..."
                                    value={``}
                                    onChange={() => {}}
                                />
                                <div>
                                    <select
                                    className="form-control text-xs shadow-sm cursor-pointer opacity-95"
                                    name="product_types"
                                    value={`selectedProductType`}
                                    onChange={() => {}}
                                    >
                                    <option value="">Filter by Product Type...</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-5 gap-1 p-1 font-bold bg-gray-200 text-center text-sm">
                                <div className='p-1'><label>SKU</label></div>
                                <div className='p-1'><label>Name</label></div>
                                <div className='p-1'><label>Unit A</label></div>
                                <div className='p-1'><label>Unit B</label></div>
                                <div className='grid grid-cols-3 gap-2 p-1'><label className='col-span-2'>Type</label></div>
                            </div>
                            <div className="grid grid-cols-5 gap-1 p-1 border-b text-sm text-center hover:bg-slate-100" title='Add to order'>
                                <div>{`data`}</div>
                                <div>{`data`}</div>
                                <div>{`data`}<span className='ml-2 opacity-50'>{`data`}</span></div>
                                <div>{`data`}<span className='ml-2 opacity-50'>{`data`}</span></div>
                                <div className='grid grid-cols-3 gap-2 p-1'>
                                    <label className="col-span-2">{`data`}</label>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer text-green-600 justify-self-end hover:scale-110" onClick={() => {}}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-2 mt-3">
                        {/* added products */}
                        <div className='bg-gray-100 border rounded-lg shadow-sm'>
                            <div className="border-0 rounded-lg">
                                <table className="table m-0 text-xs">
                                    <thead className="thead-dark text-center">
                                    <tr className="table-primary">
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
                                    <tbody className="text-center">
                                        <tr>
                                            <td>{`data`}</td>
                                            <td>{`data`}</td>
                                            <td>
                                                <input
                                                type="text"
                                                className="form-control text-xs px-1 py-0.5" 
                                                name="order_product_location" 
                                                value={`data`} 
                                                onChange={() => {}}
                                                placeholder="Ex: Level 2"
                                                required
                                                onInvalid={(e) => e.target.setCustomValidity('Enter item location')}
                                                onInput={(e) => e.target.setCustomValidity('')}
                                                />
                                            </td>
                                            <td>
                                                <div className="grid grid-cols-3 items-center border rounded w-28">
                                                <input
                                                    type="number"
                                                    name="order_product_qty_a" 
                                                    value={`data`} 
                                                    onChange={() => {}}
                                                    min={0}
                                                    step={0.0001}
                                                    required
                                                    onInvalid={(e) => e.target.setCustomValidity('Please check the value in qty-A')}
                                                    onInput={(e) => e.target.setCustomValidity('')}
                                                    className="px-1 py-0.5 ml-1 col-span-2 text-xs"
                                                />
                                                <label className="text-xs opacity-50 col-span-1 text-nowrap">
                                                    {`data`}
                                                </label>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="grid grid-cols-3 items-center border rounded w-28">
                                                <input
                                                    type="number"
                                                    name="order_product_qty_b" 
                                                    value={`data`} 
                                                    onChange={() => {}}
                                                    min={0}
                                                    step={0.0001}
                                                    required
                                                    onInvalid={(e) => e.target.setCustomValidity('Please check the value in qty-B')}
                                                    onInput={(e) => e.target.setCustomValidity('')}
                                                    className="px-1 py-0.5 ml-1 col-span-2 text-xs"
                                                />
                                                <label className="text-xs opacity-50 col-span-1 text-nowrap">
                                                    {`data`}
                                                </label>
                                                </div>
                                            </td>
                                            <td>
                                                <label>${`data`}</label>
                                            </td>
                                            <td>
                                                <label>
                                                ${`data`}
                                                </label>
                                            </td>
                                            <td>
                                                <button type="button" onClick={() => {}} className="btn btn-danger p-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* more disabled details */}
                        <div className="grid grid-cols-2 text-sm mt-1">
                            <div><span className="font-bold">Internal Comments:</span></div>
                            <div className="mb-1 text-end italic"><span className="font-bold">Order Date:</span> 11/9/2024</div>
                            <div className="col-span-2 border rounded-md p-1 mb-1 bg-gray-200">Lorem ipsum dolor sit amet. Rem nisi vero ut consequatur quia ut laudantium mollitia in sunt rerum eos vitae modi id modi quod ut minima voluptatem. Aut ipsa excepturi est quia exercitationem ea alias commodi.</div>
                        </div>
                    </div>
                </div>
                {/* Modal Buttons */}
                <div className="flex justify-end p-3 border-t">
                    <button
                        onClick={handleToggleEditOrderModal}
                        className="bg-gray-300 text-gray-700 px-3 py-2 rounded mr-2 hover:bg-gray-400"
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={() => {}}
                        className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                    >
                        UPDATE
                    </button>
                </div>
            </div>
        </div>
    )}
    </div>
    );

    const createPriceModal = (
        <div>
        {showCreatePriceModal && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                <div className="bg-white w-auto rounded-lg shadow-lg">
                    {/* Modal Header */}
                    <div className="flex justify-between items-center px-4 py-3 border-b bg-slate-100">
                        <h2 className="text-xl font-bold">CREATE NEW PRICE</h2>
                        <button
                            onClick={handleToggleCreatePriceModal}
                            className="text-gray-500 hover:text-gray-800"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        </button>
                    </div>
                    {/* Modal Body */}
                    <div className="p-2">
                        <div className='grid grid-cols-3 gap-x-10 gap-y-4 p-3 mb-1'>
                            <div className='border-2 rounded p-2'>
                                <div className="mb-3">
                                    <label className="form-label font-bold">*Number-A:</label>
                                    <input 
                                        type='number'
                                        className="form-control" 
                                        name="product_number_a" 
                                        value={`newProductPriceState.product_number_a`} 
                                        onChange={() => {}}
                                        min={1}
                                        step="0.001"  // Allows input with up to three decimal places
                                        pattern="^\d+(\.\d{1,3})?$"  // Allows up to two decimal places
                                        required
                                        onInvalid={(e) => e.target.setCustomValidity('Enter number-A')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label font-bold">*Unit-A:</label>
                                    <input 
                                        type='text'
                                        className="form-control" 
                                        name="product_unit_a" 
                                        value={`newProductPriceState.product_unit_a`} 
                                        onChange={() => {}}
                                        required
                                        onInvalid={(e) => e.target.setCustomValidity('Enter unit-A')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                    />
                                    <label className='text-xs italic text-gray-400'>Ex: Box, Pack, Carton</label>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label font-bold">*Unit-A Price:</label>
                                    <div className='flex items-center border rounded'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        <input 
                                            type='number'
                                            className="form-control flex-1 pl-2 border-0" 
                                            name="product_price_unit_a" 
                                            value={`newProductPriceState.product_price_unit_a`} 
                                            onChange={() => {}}
                                            step="0.001"  // Allows input with up to three decimal places
                                            min={1}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('Enter unit-A price')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='border-2 rounded p-2'>
                                <div className="mb-3">
                                    <label className="form-label font-bold">*Number-B:</label>
                                    <input 
                                        type='number'
                                        className="form-control" 
                                        name="product_number_b" 
                                        value={`newProductPriceState.product_number_b`} 
                                        onChange={() => {}}
                                        step="0.001"  // Allows input with up to three decimal places
                                        pattern="^\d+(\.\d{1,3})?$"  // Allows up to two decimal places
                                        min={1}
                                        required
                                        onInvalid={(e) => e.target.setCustomValidity('Enter number-B')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label font-bold">*Unit-B:</label>
                                    <input 
                                        type='text'
                                        className="form-control" 
                                        name="product_unit_b" 
                                        value={`newProductPriceState.product_unit_b`} 
                                        onChange={() => {}}
                                        required
                                        onInvalid={(e) => e.target.setCustomValidity('Enter unit-B')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                    />
                                    <label className='text-xs italic text-gray-400'>Ex: units, length, each, sheet</label>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label font-bold">*Unit-B Price:</label>
                                    <div className='flex items-center border rounded'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        <input 
                                            type='number'
                                            className="form-control flex-1 pl-2 border-0" 
                                            name="product_price_unit_b" 
                                            value={`newProductPriceState.product_price_unit_b`} 
                                            onChange={() => {}}
                                            step="0.001"  // Allows input with up to three decimal places
                                            min={1}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('Enter unit-B price')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* **** PROJECT DROPDOWN START **** */}
                            <div>
                                <label className="block font-bold mb-2">*Project:</label>
                                <div>
                                    <button
                                        type="button"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onClick={() => {}}
                                    >
                                        {`Select Projects`}
                                    </button>
                                    {true && (
                                        <div className="relative z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-60 overflow-auto" onMouseLeave={() => {}}>
                                            <ul className="py-1">
                                                    <li className="flex items-center px-4 py-2 hover:bg-gray-100">
                                                        <input
                                                            type="checkbox"
                                                            id={`project-${`project._id`}`}
                                                            value={`project._id`}
                                                            checked={true}
                                                            onChange={() => {}}
                                                            className="mr-2"
                                                            required
                                                            onInvalid={(e) => e.target.setCustomValidity('You must select one or more project applied to this product')}
                                                            onInput={(e) => e.target.setCustomValidity('')}
                                                        />
                                                        <label htmlFor={`project-${`project._id`}`} className="text-gray-900">{`project.project_name`}</label>
                                                    </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <p className='text-xs italic text-gray-400 mt-2'>Select one or more projects that this new product applies to</p>
                            </div>
                            {/* **** PRICE EFFECTIVE DATE **** */}
                            <div>
                                <label className="form-label font-bold">Price effective date:</label>
                                <input 
                                    type='date'
                                    className="form-control" 
                                    name="product_effective_date" 
                                    value={`newProductPriceState.product_effective_date`}
                                    onChange={() => {}}
                                />
                            </div>
                            {/* **** PRICE FIXED (?) **** */}
                            <div>
                                <label className="form-label font-bold">Price fixed(?):</label>
                                <input 
                                    type="checkbox"
                                    className="form-check-input m-1" 
                                    name="price_fixed" 
                                    checked={`newProductPriceState.price_fixed`} 
                                    onChange={() => {}}
                                />
                            </div>
                        </div>
                    </div>
                    {/* Modal Buttons */}
                    <div className="flex justify-end p-3 border-t">
                        <button
                            onClick={handleToggleCreatePriceModal}
                            className="bg-gray-300 text-gray-700 px-3 py-2 rounded mr-2 hover:bg-gray-400"
                        >
                            CANCEL
                        </button>
                        <button
                            onClick={() => {}}
                            className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                        >
                            SUBMIT NEW PRICE
                        </button>
                    </div>
                </div>
            </div>
        )}
        </div>
    );

    return (
        <div>
            <div className="w-screen h-[90vh] overflow-hidden bg-neutral-50 items-center justify-center">
                {/* HEADER */}
                <div className='mx-3 mt-3 p-2 text-center font-bold text-xl bg-slate-800 text-white rounded-t-lg'>
                    <label>NEW INVOICE</label>
                </div>
                {/* BODY */}
                <form>
                    {/* Invoice Details */}
                    <div className="mx-3 p-2 grid grid-cols-4 gap-x-4 gap-y-2 border-2">
                        <div>
                            <label className="font-bold">*Invoice Ref:</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name=""
                                value={{}}
                                onChange={()=> {}}
                                required
                                onInvalid={(e) => e.target.setCustomValidity('')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>
                        <div>
                            <label className="font-bold">*Supplier:</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
                                name=""
                                value={{}}
                                onChange={() => {}}
                                required
                                >
                                <option value="">Select Supplier</option>
                                {
                                    // ...filter().map()
                                }
                            </select>
                        </div>
                        <div>
                            <label className="font-bold">*Invoice Issue Date:</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
                                name=""
                                value={{}}
                                onChange={() => {}}
                                required
                                onInvalid={(e) => e.target.setCustomValidity('')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>
                        <div>
                            <label className="font-bold">*Invoice Received Date:</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
                                name=""
                                value={{}}
                                onChange={() => {}}
                                required
                                onInvalid={(e) => e.target.setCustomValidity('')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>
                        <div>
                            <label className="font-bold">Invoice Due Date:</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
                                name=""
                                value={{}}
                                onChange={() => {}}
                                required
                                onInvalid={(e) => e.target.setCustomValidity('')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>
                        <div>
                            <label className="font-bold">Invoice Without PO:</label>
                            {/* toggle button */}
                            <div className="flex items-center px-1 py-1">
                                <div
                                    onClick={handleToggle}
                                    className={`w-14 h-8 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${
                                    isToggled ? "bg-green-500" : ""
                                    }`}
                                >
                                    <div
                                    className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                                        isToggled ? "translate-x-6" : ""
                                    }`}
                                    ></div>
                                </div>
                                <span className="ml-3 text-gray-700 font-medium">
                                    {isToggled ? "Yes" : "No"}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Purchase Order Details */}
                    { !isToggled ? (
                    <div className="mx-3 p-2 border-2">
                        {/* header */}
                        <div className="flex justify-between">
                            <div className="font-bold flex justify-center">
                                <label>Purchase Order: {`3010`}</label>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-2 size-4 cursor-pointer" onClick={handleToggleEditOrderModal}>
                                    <title>Edit purchase order</title>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                </svg>
                            </div>
                            <div className="font-bold italic text-sm">Order Date: {`--/--/--`}</div>
                        </div>
                        {/* items */}
                        <table className="table-auto border-collapse border border-gray-300 w-full shadow-md text-sm">
                            <thead className="bg-indigo-200 text-center">
                                <tr>
                                    <th scope="col" className="border border-gray-300 px-3 py-2 w-10">Actions</th>
                                    <th scope="col" className="border border-gray-300 px-3 py-2 w-14">SKU</th>
                                    <th scope="col" className="border border-gray-300 px-3 py-2 w-64">Name</th>
                                    <th scope="col" className="border border-gray-300 px-3 py-2 w-20">Location</th>
                                    <th scope="col" className="border border-gray-300 px-3 py-2 w-20">Qty Ordered</th>
                                    <th scope="col" className="border border-gray-300 px-3 py-2 w-10">Invoice Qty</th>
                                    <th scope="col" className="border border-gray-300 px-3 py-2 w-10">Unit Price</th>
                                    <th scope="col" className="border border-gray-300 px-3 py-2 w-24">Expected Amount</th>
                                    <th scope="col" className="border border-gray-300 px-3 py-2 w-24">Invoiced Amount</th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                {/* registered product */}
                                <tr>
                                    <td className="border border-gray-300 px-3 py-2">
                                        <div className="flex justify-center">
                                        </div>
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2">300011564</td>
                                    <td className="border border-gray-300 px-3 py-2">64mm Deflection Head Track 1.15BMT @ 3000mm</td>
                                    <td className="border border-gray-300 px-3 py-2">data</td>
                                    <td className="border border-gray-300 px-3 py-2">
                                        <label>data</label>
                                        <label className="ml-1 text-xs opacity-50 col-span-1 text-nowrap">unit</label>
                                    </td>
                                    <td className="px-2 py-2 flex justify-center">
                                        <div className="grid grid-cols-3 items-center border rounded w-32 bg-white">
                                            <input
                                            type="number"
                                            name=""
                                            value={{}} 
                                            onChange={() => {}}
                                            step={0.0001}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            className="px-1 py-0.5 ml-1 col-span-2 text-xs"
                                            />
                                            <label className="text-xs opacity-50 col-span-1 text-nowrap">unit</label>
                                        </div>
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 relative">
                                        <label>$ --.--</label>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 cursor-pointer absolute top-0 right-0" onClick={handleTogglePriceModal}>
                                            <title>View product price version</title>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                        </svg>
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-end">$ --.--</td>
                                    <td className="border border-gray-300 px-3 py-2 text-end">$ --.--</td>
                                </tr>
                                {/* custom product */}
                                <tr className="shadow-sm">
                                    <td className="border border-gray-300 px-3 py-2">
                                        <div className="flex justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 cursor-pointer" onClick={handleToggleCreateProductModal}>
                                                <title>Register custom as New Product</title>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                            </svg>
                                        </div>
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2">-</td>
                                    <td className="border border-gray-300 px-3 py-2">Custom LXS</td>
                                    <td className="border border-gray-300 px-3 py-2">data</td>
                                    <td className="border border-gray-300 px-3 py-2">
                                        <label>data</label>
                                        <label className="ml-1 text-xs opacity-50 col-span-1 text-nowrap">unit</label>
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2">-</td>
                                    <td className="border border-gray-300 px-3 py-2">-</td>
                                    <td className="border border-gray-300 px-3 py-2 text-end">$ --.--</td>
                                    <td className="border border-gray-300 px-3 py-2 text-end">$ --.--</td>
                                </tr>
                                {/* calculation table */}
                                <tr>
                                    <td colSpan={6}></td>
                                    <td className="border border-gray-300 px-2 py-2 font-bold text-end">Delivery fee:</td>
                                    <td className="border border-gray-300 px-3 py-2 text-center" colSpan={2}>$
                                        <input
                                            type="number"
                                            name="" 
                                            value={{}} 
                                            onChange={() => {}}
                                            min={0}
                                            step={0.0001}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            className="rounded-lg ml-1 w-32"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={6}></td>
                                    <td className="border border-gray-300 px-2 py-2 font-bold text-end">Strapping/Pallet/Cutting fee:</td>
                                    <td className="border border-gray-300 px-3 py-2 text-center" colSpan={2}>$
                                        <input
                                            type="number"
                                            name="" 
                                            value={{}} 
                                            onChange={() => {}}
                                            min={0}
                                            step={0.0001}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            className="rounded-lg ml-1 w-32"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={6}></td>
                                    <td className="border border-gray-300 px-2 py-2 font-bold text-end">Credit:</td>
                                    <td className="border border-gray-300 px-3 py-2 text-center" colSpan={2}>$
                                        <input
                                            type="number"
                                            name="" 
                                            value={{}} 
                                            onChange={() => {}}
                                            step={0.01}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            className="rounded-lg ml-1 w-32"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={6}></td>
                                    <td className="border border-gray-300 px-2 py-2 font-bold text-end">Total Gross Amount:</td>
                                    <td className="border border-gray-300 px-3 py-2 text-end">$ --.--</td>
                                    <td className="border border-gray-300 px-3 py-2 text-end">$ --.--</td>
                                </tr>
                                <tr>
                                    <td colSpan={6}></td>
                                    <td className="border border-gray-300 px-2 py-2 font-bold text-end">Total Gross Amount (incl GST):</td>
                                    <td className="border border-gray-300 px-3 py-2 text-end">$ --.--</td>
                                    <td className="border border-gray-300 px-3 py-2 text-end">$ --.--</td>
                                </tr>
                                <tr className="bg-indigo-100">
                                    <td colSpan={6}></td>
                                    <td className="px-2 py-2 font-bold text-end border border-gray-400">Total Raw Amount (incl GST):</td>
                                    <td className="px-3 py-2 text-center" colSpan={2}>$
                                        <input
                                            type="number"
                                            name="" 
                                            value={{}} 
                                            onChange={() => {}}
                                            min={0}
                                            step={0.01}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            className="rounded-lg ml-1 bg-white w-32"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        {/* calculation table */}
                        {/* <div className='flex justify-end'>
                            <div>
                                <table className="text-end font-bold border-gray-300 shadow-md text-sm">
                                    <tbody>
                                        <tr className="border-collapse border border-gray-300">
                                            <td className='p-1'>Total Gross Amount:</td>
                                            <td className='p-1'>$ data</td>
                                        </tr>
                                        <tr className="border-collapse border border-gray-300">
                                            <td className='p-1'>Total Gross Amount (incl GST):</td>
                                            <td className='p-1'>$ data</td>
                                        </tr>
                                        <tr className="border-collapse border border-gray-300">
                                            <td className='p-1'>Amount Paid:</td>
                                            <td className='p-1'>$ ??.??</td>
                                        </tr>
                                        <tr className="border-collapse border border-gray-300">
                                            <td className='p-1'>Outstanding Amount:</td>
                                            <td className='p-1'>$ ??.??</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div> */}
                        {/* Select PO button */}
                        <div className='bg-transparent border-b-2'>
                            <div className="flex justify-center p-2">
                                <div className='flex items-center border bg-gray-200 rounded-xl p-2 text-xs cursor-pointer hover:bg-blue-400 hover:text-white hover:shadow-lg ' onClick={handleToggleSelectionModal}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-1">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    <label className='cursor-pointer'>SELECT PURCHASE ORDER</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    ) : (
                    <div className="mx-3 p-2 border-2">
                        {/* header */}
                        <div className="flex justify-between">
                            <div className="font-bold flex justify-center">
                                <label>Invoice without order number:</label>
                            </div>
                            <div className="font-bold italic text-sm">Order Date: {`--/--/--`}</div>
                        </div>
                        {/* items */}
                        <table className="table-auto border-collapse border border-gray-300 w-full shadow-md text-sm">
                            <thead className="bg-indigo-200 text-center">
                                <tr>
                                    <th scope="col" className="border border-gray-300 px-3 py-2 w-64">Name</th>
                                    <th scope="col" className="border border-gray-300 px-3 py-2 w-20">Location</th>
                                    <th scope="col" className="border border-gray-300 px-3 py-2 w-10">Invoice Qty</th>
                                    <th scope="col" className="border border-gray-300 px-3 py-2 w-10">Unit Price</th>
                                    <th scope="col" className="border border-gray-300 px-3 py-2 w-24">Invoiced Amount</th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                {/* custom product */}
                                <tr>
                                    <td className="border border-gray-300 px-3 py-2">
                                        <input
                                            type="text"
                                            placeholder="Enter custom name"
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2">
                                        <input
                                            type="text"
                                            placeholder="Enter location"
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2">
                                        $
                                        <input
                                            type="number"
                                            name="" 
                                            value={{}} 
                                            onChange={() => {}}
                                            min={0}
                                            step={0.01}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            className="rounded-lg ml-1 bg-white w-32"
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2">
                                        $
                                        <input
                                            type="number"
                                            name="" 
                                            value={{}} 
                                            onChange={() => {}}
                                            min={0}
                                            step={0.01}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            className="rounded-lg ml-1 bg-white w-32"
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-end">$ --.--</td>
                                </tr>
                                {/* calculation table */}
                                <tr>
                                    <td colSpan={3}></td>
                                    <td className="border border-gray-300 px-2 py-2 font-bold text-end">Delivery fee:</td>
                                    <td className="border border-gray-300 px-3 py-2 text-end">$
                                        <input
                                            type="number"
                                            name="" 
                                            value={{}} 
                                            onChange={() => {}}
                                            min={0}
                                            step={0.0001}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            className="rounded-lg ml-1 w-32"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={3}></td>
                                    <td className="border border-gray-300 px-2 py-2 font-bold text-end">Strapping/Pallet/Cutting fee:</td>
                                    <td className="border border-gray-300 px-3 py-2 text-end">$
                                        <input
                                            type="number"
                                            name="" 
                                            value={{}} 
                                            onChange={() => {}}
                                            min={0}
                                            step={0.0001}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            className="rounded-lg ml-1 w-32"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={3}></td>
                                    <td className="border border-gray-300 px-2 py-2 font-bold text-end">Credit:</td>
                                    <td className="border border-gray-300 px-3 py-2 text-end">$
                                        <input
                                            type="number"
                                            name="" 
                                            value={{}} 
                                            onChange={() => {}}
                                            min={0}
                                            step={0.01}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            className="rounded-lg ml-1 w-32"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={3}></td>
                                    <td className="border border-gray-300 px-2 py-2 font-bold text-end">Total Gross Amount:</td>
                                    <td className="border border-gray-300 px-3 py-2 text-end">$ --.--</td>
                                </tr>
                                <tr>
                                    <td colSpan={3}></td>
                                    <td className="border border-gray-300 px-2 py-2 font-bold text-end">Total Gross Amount (incl GST):</td>
                                    <td className="border border-gray-300 px-3 py-2 text-end">$ --.--</td>
                                </tr>
                                <tr className="bg-indigo-100">
                                    <td colSpan={3}></td>
                                    <td className="px-2 py-2 font-bold text-end border border-gray-400">Total Raw Amount (incl GST):</td>
                                    <td className="px-3 py-2 text-center">$
                                        <input
                                            type="number"
                                            name="" 
                                            value={{}} 
                                            onChange={() => {}}
                                            min={0}
                                            step={0.01}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            className="rounded-lg ml-1 bg-white w-32"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    )}
                    {/* Invoice Details */}
                    <div className="mx-3 p-2 border-2">
                        <label>Invoice status:</label>
                        <button className="ml-2 bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded">
                            SUBMIT INVOICE
                        </button>
                    </div>
                    {/* Invoice File Upload */}
                    <div></div>
                </form>
                { orderSelectionModal }
                { productPriceModal }
                { createProductModal }
                { editOrderModal }
                { createPriceModal }
            </div>
        </div>
    );
}
 
export default NewInvoiceForm;