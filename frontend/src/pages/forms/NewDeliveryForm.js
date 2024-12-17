//import modules
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import LoadingScreen from "../loaders/LoadingScreen";
import SessionExpired from "../../components/SessionExpired"

const NewDeliveryForm = ({order, supplier}) => {
    //State
    const [deliveryState, setDeliveryState] = useState({
        delivery_evidence_type: '',
        delivery_evidence_reference: '',
        products: [{
            product_obj_ref: '',
            delivered_qty_a: 0
        }],
        delivery_receiving_date: new Date(),
        delivery_status: '',
        order: order._id,
        supplier: supplier._id
    });
    const [isAddDeliveryLoading, setIsAddDeliveryLoading] = useState(true);
    const [addDeliveryError, setAddDeliveryError] = useState(null);
    const deliveryType = ['Delivery Docket', 'Invoice']
    const deliveryStatus = ['Partially delivered', 'Delivered']

    // Functions
    const handleChange = (e) => {
        const { name, value } = e.target;
        setDeliveryState((prevDelivery) => ({
          ...prevDelivery,
          [name]: value,
        }));
    };

    const createDelivery = async (deliveryState) => {
        setIsAddDeliveryLoading(true)
        setAddDeliveryError(null)
    
        const postDelivery = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/delivery/create`, {
                    credentials: 'include', method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    },
                    body: JSON.stringify(deliveryState)
                })
    
                const data = await res.json();
    
                if (data.tokenError) {
                    throw new Error(data.tokenError)
                }
    
                if (!res.ok) {
                    throw new Error('Failed to POST new delivery')
                }
                if (res.ok) {
    
                    alert(`Delivery created successfully!`);
                
                    // update loading state
                    setIsAddDeliveryLoading(false)
    
                }
            } catch (error) {
                setAddDeliveryError(error.message);
                setIsAddDeliveryLoading(false);
            }
        }
        postDelivery();
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        createDelivery();
    }

    // Components
    if (isAddDeliveryLoading) { return (<LoadingScreen />); }

    if (addDeliveryError) {
        if(addDeliveryError.includes("Session expired") || addDeliveryError.includes("jwt expired") || addDeliveryError.includes("jwt malformed")){
            return(<div><SessionExpired /></div>)
        }
        return (<div>Error: {addDeliveryError}</div>);
    }

    return ( 
      <div>
        <h1>Delivery - Receiving items</h1>
        {/* Delivery Evidence type */}
        <div>
          <label htmlFor="project" className="block text-sm font-medium text-gray-700">
            Delivery evidence type:
          </label>
          <select
            value={deliveryState.delivery_evidence_type}
            name='delivery_evidence_type'
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          >
            <option value="">Select type</option>
            {deliveryType.map((type,index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        {/* Product table */}
        <table className="table table-bordered table-hover m-0">
            <thead className="thead-dark text-center">
                <tr className="table-primary">
                    <th scope="col">Product SKU</th>
                    <th scope="col">Product Name</th>
                    <th scope="col">Ordered Qty</th>
                    <th scope="col">Receiving Qty</th>
                    <th scope="col">Delivered</th>
                </tr>
            </thead>
            <tbody className="text-center">
                {order.products &&
                    order.products.map((product, index) => (
                        <tr
                            key={`${product.product_obj_ref._id}-${index}`}
                        >
                            <td>{product.product_obj_ref.product_sku}</td>
                            <td>{product.product_obj_ref.product_name}</td>
                            <td>
                                {Number.isInteger(product.order_product_qty_a)
                                    ? product.order_product_qty_a
                                    : parseFloat(product.order_product_qty_a).toFixed(4)}
                            </td>
                            <td>
                                <input 
                                    type="number"
                                    name="delivered_qty_a"
                                    onChange={handleChange}
                                />
                            </td>
                            <td>
                                {`???/${Number.isInteger(product.order_product_qty_a)
                                    ? product.order_product_qty_a
                                    : parseFloat(product.order_product_qty_a).toFixed(4)}`}
                            </td>
                        </tr>
                    ))}
                        <tr className="cursor-default">
                            <td></td>
                            <td>Receiving Date:</td>
                            <td>
                                <input
                                    type='date'
                                    name="delivery_receiving_date"
                                    onChange={handleChange}
                                />
                            </td>
                        </tr>
            </tbody>
        </table>
        {/* Delivery reference */}
        <div>
            <label className="block text-sm font-medium text-gray-700">
                Delivery reference:
            </label>
            <textarea 
                rows={2}
                name= "delivery_evidence_reference"
                onChange={handleChange}
            />
        </div>
        {/* Delivery status */}
        <div>
          <label htmlFor="project" className="block text-sm font-medium text-gray-700">
            Delivery status:
          </label>
          <select
            value={deliveryState.delivery_status}
            name='delivery_status'
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          >
            <option value="">Select status</option>
            {deliveryStatus.map((status,index) => (
              <option key={index} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        {/* Buttons */}
        <div>
            <button>CANCEL</button>
            <button onClick={handleSubmit}>SUBMIT</button>
        </div>
      </div>
    );
}
 
export default NewDeliveryForm;