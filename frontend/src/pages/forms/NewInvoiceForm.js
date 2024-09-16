import { useState } from "react";

const NewInvoiceForm = () => {
    
    const [searchOrderTerm, setSearchOrderTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState('');

    const [isToggled, setIsToggled] = useState(false);
    const [showSelectionModal, setShowSelectionModal] = useState(false);
  
    const handleToggle = () => setIsToggled(!isToggled);
    const handleToggleSelectionModal = () => setShowSelectionModal(!showSelectionModal);

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
                                    <th scope="col" className="border border-gray-300 px-4 py-2">PO</th>
                                    <th scope="col" className="border border-gray-300 px-4 py-2">Order Date</th>
                                    <th scope="col" className="border border-gray-300 px-4 py-2">EST Date</th>
                                    <th scope="col" className="border border-gray-300 px-4 py-2">Project</th>
                                    <th scope="col" className="border border-gray-300 px-4 py-2">Products</th>
                                    <th scope="col" className="border border-gray-300 px-4 py-2">Gross Amount</th>
                                    <th scope="col" className="border border-gray-300 px-4 py-2">Status</th>
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
                                    <td className="border border-gray-300 px-4 py-2">data</td>
                                    <td className="border border-gray-300 px-4 py-2">data</td>
                                    <td className="border border-gray-300 px-4 py-2">data</td>
                                    <td className="border border-gray-300 px-4 py-2">data</td>
                                    <td className="border border-gray-300 px-4 py-2">data</td>
                                    <td className="border border-gray-300 px-4 py-2">data</td>
                                    <td className="border border-gray-300 px-4 py-2">data</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Modal Buttons */}
                    <div className="flex justify-end p-3 border-t">
                        <button
                            onClick={handleToggleSelectionModal}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2 hover:bg-gray-400"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => {
                            // Add confirmation logic here
                            handleToggleSelectionModal();
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Add to Invoice
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
                    <div className="mx-3 p-2 border-2">
                        <div>
                            <label className="font-bold">Purchase Order: {`data`}</label>
                        </div>
                        <table className="table-auto border-collapse border border-gray-300 w-full shadow-md text-sm">
                            <thead className="bg-indigo-200 text-center">
                                <tr>
                                    <th scope="col" className="border border-gray-300 px-4 py-2 w-20">SKU</th>
                                    <th scope="col" className="border border-gray-300 px-4 py-2 w-64">Name</th>
                                    <th scope="col" className="border border-gray-300 px-4 py-2 w-20">Location</th>
                                    <th scope="col" className="border border-gray-300 px-4 py-2 w-10">Qty A</th>
                                    <th scope="col" className="border border-gray-300 px-4 py-2 w-10">Qty B</th>
                                    <th scope="col" className="border border-gray-300 px-4 py-2 w-10">Price A</th>
                                    <th scope="col" className="border border-gray-300 px-4 py-2 w-24">Net Amount</th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-2">data</td>
                                    <td className="border border-gray-300 px-4 py-2">data</td>
                                    <td className="border border-gray-300 px-4 py-2">data</td>
                                    <td className="border border-gray-300 px-4 py-2">data</td>
                                    <td className="border border-gray-300 px-4 py-2">data</td>
                                    <td className="border border-gray-300 px-4 py-2">data</td>
                                    <td className="border border-gray-300 px-4 py-2 text-end">data</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-2">-</td>
                                    <td className="border border-gray-300 px-4 py-2">data</td>
                                    <td className="border border-gray-300 px-4 py-2">data</td>
                                    <td className="border border-gray-300 px-4 py-2">data</td>
                                    <td className="border border-gray-300 px-4 py-2">-</td>
                                    <td className="border border-gray-300 px-4 py-2">-</td>
                                    <td className="border border-gray-300 px-4 py-2 text-end">-</td>
                                </tr>
                            </tbody>
                        </table>
                        {/* calculation table */}
                        <div className='flex justify-end'>
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
                        </div>
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
                    {/* Invoice Details */}
                    <div className="mx-3 p-2 border-2">
                        <div>
                            <label className="font-bold">Invoice Details:</label>
                        </div>
                        <table className="table-auto border-collapse border border-gray-300 w-full shadow-md text-sm">
                            <thead className="bg-indigo-200 text-center">
                                <tr>
                                    <th scope="col" className="border border-gray-300 px-4 py-2 w-24">SKU</th>
                                    <th scope="col" className="border border-gray-300 px-4 py-2 w-72">Name</th>
                                    <th scope="col" className="border border-gray-300 px-4 py-2 w-20">Location</th>
                                    <th scope="col" className="border border-gray-300 px-4 py-2 w-5">Qty A</th>
                                    <th scope="col" className="border border-gray-300 px-4 py-2 w-5">Qty B</th>
                                    <th scope="col" className="border border-gray-300 px-4 py-2 w-7">Price A</th>
                                    <th scope="col" className="border border-gray-300 px-4 py-2 w-10">Net Amount</th>
                                    <th scope="col" className="border border-gray-300 px-4 py-2 w-2"></th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                <tr>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <label>data</label>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <label>data</label>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <label>data</label>
                                    </td>
                                    <td className="border border-gray-300 px-2 py-2">
                                        <div className="grid grid-cols-3 items-center border rounded w-30 bg-white">
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
                                            className="px-1 py-0.5 ml-1 col-span-2 text-xs"
                                        />
                                        <label className="text-xs opacity-50 col-span-1 text-nowrap">unit</label>
                                        </div>
                                    </td>
                                    <td className="border border-gray-300 px-2 py-2">
                                        <div className="grid grid-cols-3 items-center border rounded w-30 bg-white">
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
                                            className="px-1 py-0.5 ml-1 col-span-2 text-xs"
                                        />
                                        <label className="text-xs opacity-50 col-span-1 text-nowrap">unit</label>
                                        </div>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <label>$ data</label>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <label>$ data</label>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
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
                    {/* Invoice File Upload */}
                    <div></div>
                </form>
                { orderSelectionModal }
            </div>
        </div>
    );
}
 
export default NewInvoiceForm;