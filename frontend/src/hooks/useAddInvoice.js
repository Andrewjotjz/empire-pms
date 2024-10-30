//import modules and files
import { useState } from 'react'
 

export const useAddInvoice = () => {
    //Component's hook state declaration
    const [addInvoiceLoading, setAddInvoiceLoading] = useState(false);
    const [addInvoiceError, setAddInvoiceError] = useState(null);

    //Component's function
    const addInvoice = async (invoiceState) => {
        setAddInvoiceLoading(true)
        setAddInvoiceError(null)

        const postInvoice = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/invoice/create`, {
                    credentials: 'include', method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(invoiceState)
                })

                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError)
                }

                if (!res.ok) {
                    throw new Error('Failed to POST new invoice')
                }
                if (res.ok) {      
                    alert(`New invoice created successfully!`);
                
                    // update loading state
                    setAddInvoiceLoading(false)

                }
            } catch (error) {
                setAddInvoiceError(error.message);
                setAddInvoiceLoading(false);
            }
        }
        postInvoice();
    }

    return { addInvoice, addInvoiceLoading, addInvoiceError };
}