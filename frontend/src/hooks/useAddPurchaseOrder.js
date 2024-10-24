//import modules and files
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';

export const useAddPurchaseOrder = () => {
    //Component's hook state declaration
    const [isAddOrderLoadingState, setisAddOrderLoadingState] = useState(false);
    const [addOrderErrorState, setaddOrderErrorState] = useState(null);

    //Component's hook router
    const navigate = useNavigate();

    //Component's function
    const addPurchaseOrder = async (orderState) => {
        setisAddOrderLoadingState(true)
        setaddOrderErrorState(null)

        const postPurchaseOrder = async () => {
            try {
                const res = await fetch(`https://empire-pms.onrender.com/api/order/create`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(orderState)
                })

                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError)
                }

                if (!res.ok) {
                    throw new Error('Failed to POST new order details')
                }
                if (res.ok) {
                    
                    // update loading state
                    setisAddOrderLoadingState(false)
                    
                    // navigate client to dashboard page
                    navigate(`/EmpirePMS/order/`)
                
                    // push toast to notify successful login
                    toast.success(`New Purchase Order created successfully!`, {
                        position: "bottom-right"
                    });
                

                }
            } catch (error) {
                setaddOrderErrorState(error.message);
                setisAddOrderLoadingState(false);
            }
        }
        postPurchaseOrder();
    }

    return { addPurchaseOrder, isAddOrderLoadingState, addOrderErrorState };
}