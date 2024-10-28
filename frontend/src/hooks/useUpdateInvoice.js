//import modules and files
import { useState } from 'react'
import { toast } from 'react-toastify';

export const useUpdateInvoice = () => {
    //Component's hook state declaration
    const [isUpdateLoadingState, setIsUpdateLoadingState] = useState(false);
    const [updateErrorState, setUpdateErrorState] = useState(null);

    //Component's function
    const updateInvoice = async (invoiceState, invoiceId) => {
        setIsUpdateLoadingState(true)
        setUpdateErrorState(null)

        const putInvoice = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/invoice/${invoiceId}`, {
                    credentials: 'include', method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({...invoiceState})
                })

                const promise = await res.json();

                if (promise.tokenError) {
                    throw new Error(promise.tokenError)
                }

                if (!res.ok) {
                    throw new Error('Failed to PUT invoice details')
                }
                if (res.ok) {                
                    // push toast to notify successful login
                    toast.success("Invoice updated successfully", {
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
        putInvoice();
    }

    return { updateInvoice, isUpdateLoadingState, updateErrorState };
}