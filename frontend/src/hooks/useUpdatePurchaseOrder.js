//import modules and files
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';

export const useUpdatePurchaseOrder = () => {
    //Component's hook state declaration
    const [isUpdateLoadingState, setIsUpdateLoadingState] = useState(false);
    const [updateErrorState, setUpdateErrorState] = useState(null);

    //Component's hook router
    const navigate = useNavigate();

    //Component's function
    const updatePurchaseOrder = async (purchaseOrderState) => {
        setIsUpdateLoadingState(true)
        setUpdateErrorState(null)

        const putPurchaseOrder = async () => {
            try {
                const res = await fetch(`https://empire-pms.onrender.com/api/order/${purchaseOrderState._id}`, {
                    credentials: 'include', method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({...purchaseOrderState})
                })

                const promise = await res.json();

                if (promise.tokenError) {
                    throw new Error(promise.tokenError)
                }

                if (!res.ok) {
                    throw new Error('Failed to PUT purchase order details')
                }
                if (res.ok) {                
                    // push toast to notify successful login
                    toast.success("Purchase Order updated successfully", {
                        position: "bottom-right"
                    });
                
                    // update loading state
                    setIsUpdateLoadingState(false)

                }
            } catch (error) {
                setUpdateErrorState(error.message);
                setIsUpdateLoadingState(false);
            }
        }
        putPurchaseOrder();
    }

    return { updatePurchaseOrder, isUpdateLoadingState, updateErrorState };
}