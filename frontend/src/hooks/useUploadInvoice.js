//import modules and files
import { useState } from 'react'
 

export const useUploadInvoice = () => {
    //Component's hook state declaration
    const [uploadInvoiceLoading, setUploadInvoiceLoading] = useState(false);
    const [uploadInvoiceError, setUploadInvoiceError] = useState(null);

    //Component's function
    const uploadInvoice = async (formData, invoice_id) => {
        setUploadInvoiceLoading(true)
        setUploadInvoiceError(null)

        const postUploadInvoice = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/invoice-file/upload`, {
                    credentials: "include", // Include cookies for authentication
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Add JWT token
                    },
                    method: "POST",
                    body: formData, // FormData is handled correctly by the browser
                });
        
                if (!res.ok) {
                    const errorData = await res.json(); // Parse error details if available
                    throw new Error(errorData.message || "Failed to upload files.");
                }
        
                const data = await res.json();
                // console.log("Response data:", data);
    
                alert(`${data.message}\n${data.urls.join("\n")}`);
            } catch (error) {
                alert(error.message);
            }
        }
        postUploadInvoice();
    }

    return { uploadInvoice, uploadInvoiceLoading, uploadInvoiceError };
}