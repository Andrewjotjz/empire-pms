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
                        {/* header */}
                        <div className="flex justify-between">
                            <div className="font-bold flex justify-center">
                                <label>Purchase Order: {`3010`}</label>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-2 size-4 cursor-pointer">
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
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 cursor-pointer">
                                                <title>View product price version</title>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v7.5m2.25-6.466a9.016 9.016 0 0 0-3.461-.203c-.536.072-.974.478-1.021 1.017a4.559 4.559 0 0 0-.018.402c0 .464.336.844.775.994l2.95 1.012c.44.15.775.53.775.994 0 .136-.006.27-.018.402-.047.539-.485.945-1.021 1.017a9.077 9.077 0 0 1-3.461-.203M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                            </svg>
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
                                    <td className="border border-gray-300 px-3 py-2">$ --.--</td>
                                    <td className="border border-gray-300 px-3 py-2 text-end">$ --.--</td>
                                    <td className="border border-gray-300 px-3 py-2 text-end">$ --.--</td>
                                </tr>
                                {/* custom product */}
                                <tr className="shadow-sm">
                                    <td className="border border-gray-300 px-3 py-2">
                                        <div className="flex justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 cursor-pointer">
                                                <title>Register new product</title>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
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
            </div>
        </div>
    );
}
 
export default NewInvoiceForm;